import { hydrate } from "solid-js/web";
import { ContextRouter } from "@/ContextRouter";
import { ApiType } from "@/persist/api";
import { hc } from "hono/client";
import { createBrowserStorageEngine } from "@/persist/store";

const client = hc<ApiType>(window.location?.origin ?? "");
const store = await createBrowserStorageEngine(client);
const url = window.location.pathname;
const props = { client, store, url };

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}

hydrate(() => <ContextRouter {...props} />, document.getElementById("root")!);
