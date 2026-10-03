#!/usr/bin/env node
// Upload resume PDF(s) to the Vercel Blob store under the `resume/` prefix.
// The web app lists and previews whatever lives there — no redeploy needed.
//
// Usage:
//   npm run resume:upload -- ./path/to/Resume.pdf      # one file
//   npm run resume:upload -- ./some/folder             # every .pdf in a folder
//   npm run resume:upload                              # everything in public/resume/
//
// Needs BLOB_READ_WRITE_TOKEN. Get it with `vercel env pull .env.local`
// (this script auto-loads .env.local) or export it in your shell.

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

// Load .env.local if present, so the npm script works without extra flags.
try {
  const env = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // no .env.local — fine if the token is already in the environment
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error(
    "Missing BLOB_READ_WRITE_TOKEN.\n" +
      "Run `vercel env pull .env.local` (after connecting a Blob store on Vercel), then retry.",
  );
  process.exit(1);
}

async function collect(target) {
  const s = await stat(target);
  if (s.isDirectory()) {
    const names = await readdir(target);
    return names.filter((n) => n.toLowerCase().endsWith(".pdf")).map((n) => path.join(target, n));
  }
  return [target];
}

const args = process.argv.slice(2);
const targets = args.length ? args : [path.join(process.cwd(), "public", "resume")];

const files = (await Promise.all(targets.map(collect))).flat();
if (files.length === 0) {
  console.error("No PDF files found to upload.");
  process.exit(1);
}

for (const file of files) {
  const name = path.basename(file);
  const data = await readFile(file);
  const { url } = await put(`resume/${name}`, data, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
  });
  console.log(`Uploaded ${name} -> ${url}`);
}
console.log(`Done. ${files.length} file(s) uploaded.`);
