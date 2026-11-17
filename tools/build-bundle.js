// Rebuilds public/data/units.bundle.js from public/data/units/*.js (only needed when NOT running through server.js).
const fs = require("fs"), path = require("path");
const { loadUnits } = require("../lib/units");
const dir = path.join(__dirname, "..", "public", "data");
const { bundle, problems } = loadUnits(path.join(dir, "units"));
problems.forEach(p => console.warn("skipped", p.file, "-", p.error));
fs.writeFileSync(path.join(dir, "units.bundle.js"), bundle);
console.log("bundled units");
