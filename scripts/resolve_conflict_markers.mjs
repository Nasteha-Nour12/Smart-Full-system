import fs from "fs";
import path from "path";

const root = process.argv[2] || ".";
const keep = (process.argv[3] || "incoming").toLowerCase(); // incoming | current
const exts = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".json", ".md"]);

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (exts.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
};

const resolveMarkers = (text) => {
  const lines = text.split(/\r?\n/);
  const out = [];
  let i = 0;
  let changed = false;

  while (i < lines.length) {
    if (lines[i].startsWith("<<<<<<<")) {
      changed = true;
      i += 1;
      const current = [];
      while (i < lines.length && !lines[i].startsWith("=======")) {
        current.push(lines[i]);
        i += 1;
      }
      i += 1; // skip =======
      const incoming = [];
      while (i < lines.length && !lines[i].startsWith(">>>>>>>")) {
        incoming.push(lines[i]);
        i += 1;
      }
      i += 1; // skip >>>>>>>
      out.push(...(keep === "current" ? current : incoming));
      continue;
    }
    out.push(lines[i]);
    i += 1;
  }
  return { text: out.join("\n"), changed };
};

const all = walk(root);
let touched = 0;

for (const file of all) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes("<<<<<<<")) continue;
  const { text: next, changed } = resolveMarkers(text);
  if (changed) {
    fs.writeFileSync(file, next, "utf8");
    touched += 1;
    console.log(`resolved: ${file}`);
  }
}

console.log(`done. files resolved: ${touched}`);
