#!/usr/bin/env node
// What's New helper.
//   node tools/whatsnew.js --check      show what changed since the last published snapshot
//   node tools/whatsnew.js --publish    move those changes into changelog.json and refresh release/snapshot.json
// The CI workflow runs --publish after every successful push, so you normally never run this yourself.
const fs = require("fs");
const path = require("path");
const { loadUnits } = require("../lib/units");
const { diffUnits, noteId } = require("../lib/changes");

const root = path.join(__dirname, "..");
const read = (rel, fb) => { try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); } catch (_e) { return fb; } };
const write = (rel, obj) => fs.writeFileSync(path.join(root, rel), JSON.stringify(obj, null, 2) + "\n");

const { units, problems } = loadUnits(path.join(root, "public", "data", "units"));
if (problems.length) { console.error("Unit files with problems - fix them first (node tools/validate.js):", problems); process.exit(1); }
const current = JSON.parse(JSON.stringify(units));
const snapshot = read("release/snapshot.json", null);
const cfg = fs.readFileSync(path.join(root, "public", "data", "config.js"), "utf8");
const version = (cfg.match(/version\s*:\s*"([^"]+)"/) || [])[1] || "";

if (!snapshot || !snapshot.units) {
  console.log("No snapshot yet - creating the first one (nothing is announced).");
  if (process.argv.includes("--publish")) write("release/snapshot.json", { version, units: current });
  process.exit(0);
}
const changes = diffUnits(snapshot.units, current);
if (!changes.length) { console.log("No unit changes since the last published snapshot."); process.exit(0); }
console.log(`${changes.length} change(s):`); changes.forEach(c => console.log(" -", c));

if (process.argv.includes("--publish")) {
  const note = (process.env.HEAD_MSG || "").split("\n")[0].trim();
  if (/\[skip notes\]/i.test(note)) { console.log("[skip notes] in the commit message - not published."); process.exit(0); }
  const log = read("changelog.json", { entries: [] });
  log.entries = log.entries || [];
  log.entries.unshift({ id: noteId(changes), date: new Date().toISOString().slice(0, 10), version, note, changes });
  log.entries = log.entries.slice(0, 100);
  write("changelog.json", log);
  write("release/snapshot.json", { version, units: current });
  console.log("Published to changelog.json and release/snapshot.json");
}
