// Build a static GitHub Pages preview without publishing repository source files.
// Netlify continues to use the unmodified files at the repository root.
import fs from "node:fs";
import path from "node:path";

const repoName = "RBOAS-System";
const base = "/" + repoName + "/";
const files = [
  "index.html",
  "login.html",
  "register.html",
  "styles.css",
  "auth-pages.css",
  "app.js",
  "auth-pages.js",
  "demo-bank.js"
];
const directory = path.resolve("site-preview");
fs.rmSync(directory, { force: true, recursive: true });
fs.mkdirSync(directory, { recursive: true });
for (const filename of files) {
  let source = fs.readFileSync(filename, "utf8");
  if (filename.endsWith(".html")) {
    // Preserve fully-qualified HTTPS links and rewrite local absolute paths.
    source = source.replace(/\b(href|src)=(["'])\/(?!\/)/g, (_m, attr, quote) =>
      attr + "=" + quote + base
    );
  } else if (filename.endsWith(".js")) {
    // The application is intentionally deployed to a GitHub project subpath.
    source = source
      .replace(/(["'])\/(login\.html|register\.html)/g, (_m, quote, page) => quote + base + page)
      .replace(/(location\.(?:replace|assign)\(\s*["'])\/(?=["'])/g, (_m, start) => start + base)
      .replace(/(location\.origin\s*\+\s*["'])\/(?=["'])/g, (_m, start) => start + base);
  }
  fs.writeFileSync(path.join(directory, filename), source, "utf8");
}
fs.writeFileSync(path.join(directory, ".nojekyll"), "");
const page = fs.readFileSync(path.join(directory, "index.html"), "utf8");
if (!page.includes(base + "app.js") || !page.includes(base + "styles.css")) {
  throw new Error("GitHub Pages entrypoint has invalid asset paths");
}
const login = fs.readFileSync(path.join(directory, "login.html"), "utf8");
if (!login.includes(base + "auth-pages.js") || !login.includes(base + "register.html")) {
  throw new Error("GitHub Pages authentication paths were not rewritten");
}
const app = fs.readFileSync(path.join(directory, "app.js"), "utf8");
if (!app.includes("location.replace(\"" + base + "login.html\")")) {
  throw new Error("GitHub Pages login route is missing");
}
console.log("GitHub Pages static preview prepared at " + base);
