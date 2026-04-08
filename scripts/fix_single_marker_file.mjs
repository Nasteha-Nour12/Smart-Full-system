import fs from "fs";

const file = process.argv[2];
const keep = (process.argv[3] || "before").toLowerCase(); // before | after
if (!file) {
  console.error("Usage: node scripts/fix_single_marker_file.mjs <file>");
  process.exit(1);
}

const text = fs.readFileSync(file, "utf8");
const marker = "\n=======\n";
const idx = text.indexOf(marker);

if (idx === -1) {
  console.log("No standalone ======= marker found.");
  process.exit(0);
}

const fixed =
  keep === "after"
    ? text.slice(idx + marker.length).trimStart()
    : text.slice(0, idx).trimEnd() + "\n";
fs.writeFileSync(file, fixed, "utf8");
console.log(`Fixed file: ${file} (kept ${keep})`);
