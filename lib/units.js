// Loads public/data/units/*.js safely. A broken file is skipped and reported; it never takes the server down.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RARITIES = ["common", "uncommon", "rare", "epic", "legend"];

// Returns a short problem description, or null when the unit definition looks fine.
function checkUnit(id, u, existing) {
  if (!/^[a-z][a-z0-9_]*$/i.test(id)) return `ไอดี "${id}" ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _`;
  if (existing[id]) return `ไอดีซ้ำ: ${id}`;
  if (!u || typeof u !== "object") return `${id}: ข้อมูลตัวละครไม่ใช่ object`;
  if (typeof u.n !== "string" || !u.n) return `${id}: ไม่มีชื่อ (n)`;
  if (!RARITIES.includes(u.rar)) return `${id}: ระดับ (rar) ต้องเป็น ${RARITIES.join(" / ")}`;
  if (!(typeof u.hp === "number" && u.hp > 0)) return `${id}: hp ต้องเป็นตัวเลขมากกว่า 0`;
  if (!(typeof u.pop === "number" && u.pop >= 0)) return `${id}: pop ต้องเป็นตัวเลข 0 ขึ้นไป`;
  if (!Array.isArray(u.s) || !u.s.length) return `${id}: ต้องมีสกิลอย่างน้อย 1 อัน (s)`;
  for (const s of u.s) {
    if (!s || typeof s.n !== "string" || typeof s.k !== "string") return `${id}: ทุกสกิลต้องมีชื่อ (n) และชนิด (k)`;
  }
  return null;
}

function loadUnits(dir) {
  const units = {}, parts = [], problems = [];
  let files = [];
  try { files = fs.readdirSync(dir).filter(n => n.endsWith(".js")).sort(); }
  catch (e) { problems.push({ file: dir, error: "อ่านโฟลเดอร์ตัวละครไม่ได้: " + e.message }); }
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    const got = {};
    try {
      vm.runInNewContext(src, { ZX: { unit: (id, def) => { got[id] = def; } } }, { filename: f, timeout: 1000 });
    } catch (e) {
      problems.push({ file: f, error: String((e && e.message) || e) });
      continue;
    }
    const ids = Object.keys(got);
    if (!ids.length) { problems.push({ file: f, error: "ไม่พบ ZX.unit(...) ในไฟล์" }); continue; }
    let bad = null;
    const seen = Object.assign({}, units);
    for (const id of ids) {
      bad = checkUnit(id, got[id], seen);
      if (bad) break;
      seen[id] = got[id];
    }
    if (bad) { problems.push({ file: f, error: bad }); continue; }
    Object.assign(units, got);
    parts.push("// " + f + "\n" + src);
  }
  return { units, bundle: parts.join("\n"), problems };
}

module.exports = { loadUnits, checkUnit, RARITIES };
                              
