/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { jsxRenderer } from "hono/jsx-renderer";
import { raw } from "hono/html";
import { generateHydrationScript } from "solid-js/web";
import { Script, ViteClient, Link } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="manifest" href="/manifest.webmanifest" />
      <title>BarrLog</title>
      {raw(generateHydrationScript())}
      <ViteClient />
      <Link href="/src/style.css" rel="stylesheet" />
    </head>
    <body>
      {children}
      <Script src="/src/browser/index.tsx" />
    </body>
  </html>
));
