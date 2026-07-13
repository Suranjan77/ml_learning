import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const port = Number(process.env.PORT ?? 3000);
const outputDirectory = resolve(process.cwd(), "out");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

function resolveExportedFile(pathname) {
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const requestedPath = resolve(outputDirectory, relativePath);

  if (
    requestedPath !== outputDirectory &&
    !requestedPath.startsWith(`${outputDirectory}${sep}`)
  ) {
    return null;
  }

  const candidates = [
    requestedPath,
    `${requestedPath}.html`,
    resolve(requestedPath, "index.html"),
  ];

  return candidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  ) ?? null;
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", `http://${request.headers.host}`).pathname;
  const filePath = resolveExportedFile(pathname);
  const responsePath = filePath ?? resolve(outputDirectory, "404.html");

  if (
    process.env.STATIC_SERVER_LOG_REQUESTS === "1" &&
    !pathname.startsWith("/_next/static/")
  ) {
    console.log(`${filePath ? 200 : 404} ${request.method} ${request.url}`);
  }

  response.writeHead(filePath ? 200 : 404, {
    "Cache-Control": "no-store",
    "Content-Type": mimeTypes[extname(responsePath)] ?? "application/octet-stream",
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(responsePath).pipe(response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving static export at http://localhost:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
