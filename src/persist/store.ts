import type { ApiClient, WorklogData, LabelData } from "@/persist/api";

const DB = "barrlog:offline";
const VERSION = 1;

type StoreName = "label" | "worklog" | "toDelete" | "toCreate";

const migrations = new Map<number, (db: IDBDatabase) => void>();
migrations.set(0, (db) => {
  db.createObjectStore("label", { keyPath: "id" });
  const worklogStore = db.createObjectStore("worklog", { keyPath: "id" });
  worklogStore.createIndex("time", "time");
  db.createObjectStore("toDelete", { keyPath: "id" });
  db.createObjectStore("toCreate", { keyPath: "id", autoIncrement: true });
});

export interface TimeRange {
  from: string;
  to: string;
}

type RequestIfOnline<T> =
  | {
      res: undefined;
      online: false;
    }
  | {
      res: T;
      online: true;
    };
async function tryRequest<T>(
  func: () => Promise<T>,
): Promise<RequestIfOnline<T>> {
  if (navigator.onLine) {
    try {
      const res = await func();
      return { res, online: true };
    } catch (error) {
      if (!(error instanceof TypeError && error.message === "Failed to fetch"))
        throw error;
    }
  }
  console.warn("No network connection, working offline");
  return { res: undefined, online: false };
}

export interface StorageEngine {
  deleteWorklog(id: number): Promise<void>;
  getWorklogs(range: TimeRange): Promise<WorklogData[]>;
  getLabels(): Promise<LabelData[]>;
}

export const createBrowserStorageEngine = async (
  api: ApiClient,
): Promise<StorageEngine> => {
  const { promise, resolve, reject } = Promise.withResolvers<StorageEngine>();

  const req: IDBOpenDBRequest = indexedDB.open(DB, VERSION);
  req.onerror = () =>
    reject(new Error("Unable to open local DB", { cause: req.error }));
  req.onsuccess = () => {
    const idb = req.result;
    idb.onversionchange = () => {
      console.warn("Reloading, another tab has updated the db");
      idb.close();
      location.reload(); // TODO: this may lose user data
    };
    resolve(new BrowserStorageEngine(api, new BrowserDB(idb)));
  };
  req.onupgradeneeded = ({ oldVersion }: IDBVersionChangeEvent) => {
    const db = req.result;
    console.warn(`Migrating from ${oldVersion} to ${VERSION}`);
    for (let i = oldVersion; i < VERSION; i++) migrations.get(i)!(db);
  };

  return promise;
};

class BrowserDB {
  db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  async _tx<T = void, S extends StoreName[] = StoreName[]>(
    storeNames: S,
    mode: IDBTransactionMode,
    fn: (stores: { [K in S[number]]: IDBObjectStore }) => IDBRequest<T> | void,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const tx = this.db.transaction(storeNames, mode);
      const stores = Object.fromEntries(
        storeNames.map((name) => [name, tx.objectStore(name)]),
      ) as { [K in S[number]]: IDBObjectStore };

      let req: IDBRequest<T> | void;
      tx.oncomplete = () => resolve(req?.result as T);
      tx.onabort = () => {
        const errMsg = `IndexedDB error on ${storeNames}`;
        reject(new Error(errMsg, { cause: tx.error }));
      };

      try {
        req = fn(stores);
      } catch (err) {
        tx.abort();
        throw err;
      }
    });
  }

  async deleteWorklog(id: number, online: boolean) {
    this._tx(["toDelete", "worklog"], "readwrite", (stores) => {
      stores.worklog.delete(id);
      if (!online) stores.toDelete.add({ id });
    });
  }

  async replaceWorklogs(worklogs: WorklogData[], range: TimeRange) {
    this._tx(["worklog"], "readwrite", (stores) => {
      stores.worklog.delete(
        IDBKeyRange.bound(range.from, range.to, true, true),
      );
      worklogs.forEach((worklog) => stores.worklog.add(worklog));
    });
  }

  async getWorklogs(range: TimeRange): Promise<WorklogData[]> {
    return this._tx(["worklog"], "readonly", (stores) => {
      const req: IDBRequest<WorklogData[]> = stores.worklog.getAll(
        IDBKeyRange.bound(range.from, range.to, true, true),
      );
      return req;
    });
  }

  async addLabels(labels: LabelData[]) {
    this._tx(["label"], "readwrite", (stores) => {
      labels.forEach((label) => stores.label.add(label));
    });
  }

  async getLabels(): Promise<LabelData[]> {
    return this._tx(["label"], "readonly", (stores) => {
      const req: IDBRequest<LabelData[]> = stores.label.getAll();
      return req;
    });
  }
}

export class BrowserStorageEngine implements StorageEngine {
  api: ApiClient;
  db: BrowserDB;

  constructor(api: ApiClient, db: BrowserDB) {
    this.api = api;
    this.db = db;
  }

  async deleteWorklog(id: number) {
    const { res, online } = await tryRequest(() =>
      this.api.worklog.$delete({ json: { id } }),
    );
    if (online) {
      if (!res.ok) throw new Error("Failed to delete worklog entry");
      await res.json();
    }
    this.db.deleteWorklog(id, online);
  }

  async getWorklogs(range: TimeRange): Promise<WorklogData[]> {
    const { res, online } = await tryRequest(() =>
      this.api.worklog.$get({ query: range }),
    );

    if (online) {
      if (!res.ok) throw new Error("Failed to retrieve worklogs");
      const worklogs = await res.json();
      await this.db.replaceWorklogs(worklogs, range);
      return worklogs;
    }

    return this.db.getWorklogs(range);
  }

  async getLabels(): Promise<LabelData[]> {
    const { res, online } = await tryRequest(() => this.api.label.$get());

    if (online) {
      if (!res.ok) throw new Error("Failed to retrieve labels");
      const labels = await res.json();
      await this.db.addLabels(labels);
      return labels;
    }

    return this.db.getLabels();
  }
}

export class ServerStorageEngine implements StorageEngine {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async deleteWorklog(id: number) {
    const res = await this.api.worklog.$delete({ json: { id } });
    if (!res.ok) throw new Error("Failed to delete worklog entry");
    await res.json();
  }

  async getWorklogs(range: TimeRange): Promise<WorklogData[]> {
    const res = await this.api.worklog.$get({ query: range });
    if (!res.ok) throw new Error("Failed to retrieve worklogs");
    return await res.json();
  }

  async getLabels(): Promise<LabelData[]> {
    const res = await this.api.label.$get();
    return res.json();
  }
}
