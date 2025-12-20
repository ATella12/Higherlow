import fs from "fs";
import path from "path";
import { TextDecoder } from "util";

const decoder = new TextDecoder("utf-8", { fatal: true });
const roots = ["components", "app", "lib"];
const validExts = new Set([".ts", ".tsx"]);
const offenders = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!validExts.has(ext)) continue;
      const buf = fs.readFileSync(full);
      try {
        decoder.decode(buf);
      } catch {
        offenders.push(path.relative(process.cwd(), full));
      }
    }
  }
}

roots.forEach((root) => walk(path.join(process.cwd(), root)));

if (offenders.length) {
  console.error("Invalid UTF-8 detected in:");
  offenders.forEach((file) => console.error(` - ${file}`));
  process.exitCode = 1;
} else {
  console.log("All checked .ts/.tsx files are valid UTF-8.");
}
