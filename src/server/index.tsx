/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { Hono, type Context } from "hono";
import { raw } from "hono/html";
import { renderer } from "@/server/renderer";
import { createAPI, ApiType } from "@/api";
import { hc } from "hono/client";
import { renderContextRouter } from "@/ContextRouter";
import { useAuthenticator, requireAuthPage } from "@/security";
import { remoteDB } from "@/db";

const api = createAPI(remoteDB);
const client = (c: Context) =>
  hc<ApiType>("http://isServer", {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) =>
      api.request(
        input,
        {
          ...init,
          cache: "no-store",
          headers: {
            ...init?.headers,
            cookie: c.req.header("cookie") ?? "",
          },
        },
        c.env,
        c.executionCtx,
      ),
  });
const props = (c: Context) => ({
  client: client(c),
  url: new URL(c.req.url).pathname,
});

const renderRoot = async (c: Context) =>
  c.render(<div id="root">{raw(await renderContextRouter(props(c)))}</div>);

const app = new Hono<{ Bindings: CloudflareBindings }>();

export default app
  .route("/", useAuthenticator)
  .use(renderer)
  .use("/", requireAuthPage)
  .get("/", renderRoot)
  .use("/:timezone/:date", requireAuthPage)
  .get("/:timezone/:date", renderRoot)
  .route("/", api);
