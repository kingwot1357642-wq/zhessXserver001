// Turns the difference between two sets of unit definitions into short Thai sentences (the "What's New" list).
const LABEL = {
  hp: "HP", pop: "pop", mv: "การเดิน", rar: "ระดับ", el: "ธาตุ",
  d: "ดาเมจ", cd: "คูลดาวน์", r: "ระยะ", cost: "AP ที่ใช้", sh: "โล่", ls: "ฟื้นเลือดตัวเอง",
  stun: "สตั๊น (ตา)", stunP: "โอกาสสตั๊น", c: "ชนิดดาเมจ", l: "ระดับการโจมตี", k: "ชนิดสกิล", mpc: "MP ที่ใช้",
  beastDR: "ลดดาเมจจากมังกร/อสูร", rngIn: "ดาเมจระยะไกลที่ได้รับ (เท่า)", healMul: "การฟื้นเลือดที่ได้รับ (เท่า)", curse: "คำสาป",
};
const PERCENT = new Set(["stunP", "beastDR"]);
// keys that only change how a skill looks or reads, not how it plays
const COSMETIC = new Set(["i", "v", "x", "tags", "n"]);

const show = (k, v) => {
  if (v === undefined) return "ไม่มี";
  if (PERCENT.has(k) && typeof v === "number") return Math.round(v * 100) + "%";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// { d:1, alt:{ d:2 } } -> { d:1, "alt.d":2 }
function flatten(o, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(o || {})) {
    if (v && typeof v === "object" && !Array.isArray(v) && k === "alt") flatten(v, k + ".", out);
    else out[prefix + k] = v;
  }
  return out;
}

function diffSkill(unitName, a, b) {
  const out = [], fa = flatten(a), fb = flatten(b), name = b.n;
  let textOnly = false, cosmetic = false;
  for (const key of new Set([...Object.keys(fa), ...Object.keys(fb)])) {
    if (same(fa[key], fb[key])) continue;
    const base = key.split(".").pop();
    if (base === "x") { textOnly = true; continue; }
    if (COSMETIC.has(base)) { cosmetic = true; continue; }
    const label = (key.startsWith("alt.") ? "ร่างเสริม " : "") + (LABEL[base] || base);
    out.push(`${unitName}: ${name} ${label} ${show(base, fa[key])} → ${show(base, fb[key])}`);
  }
  if (!out.length && textOnly) out.push(`${unitName}: ${name} แก้คำอธิบาย`);
  else if (!out.length && cosmetic) out.push(`${unitName}: ${name} ปรับไอคอน/เอฟเฟกต์`);
  return out;
}

function diffUnit(a, b) {
  const out = [], name = b.n;
  for (const k of ["rar", "hp", "mv", "pop", "el"]) {
    if (a[k] !== b[k]) out.push(`${name}: ${LABEL[k]} ${show(k, a[k])} → ${show(k, b[k])}`);
  }
  if (a.n !== b.n) out.push(`${name}: เปลี่ยนชื่อจาก ${a.n}`);
  if (a.pas !== b.pas) out.push(`${name}: สกิลติดตัวเปลี่ยน`);
  if (!same(a.blk, b.blk)) out.push(`${name}: ปรับการปัดป้อง`);
  const sa = new Map((a.s || []).map(s => [s.n, s])), sb = new Map((b.s || []).map(s => [s.n, s]));
  for (const [n, s] of sb) if (!sa.has(n)) out.push(`${name}: เพิ่มสกิล ${n}`);
  for (const [n] of sa) if (!sb.has(n)) out.push(`${name}: ลบสกิล ${n}`);
  for (const [n, s] of sb) if (sa.has(n)) out.push(...diffSkill(name, sa.get(n), s));
  // any other top-level setting (flags such as beastDR, fly, ...)
  const skip = new Set(["n", "rar", "hp", "mv", "pop", "el", "pas", "blk", "s", "order"]);
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (skip.has(key) || same(a[key], b[key])) continue;
    out.push(`${name}: ${LABEL[key] || key} ${show(key, a[key])} → ${show(key, b[key])}`);
  }
  return out;
}

function diffUnits(oldUnits, newUnits) {
  const out = [];
  for (const [id, u] of Object.entries(newUnits)) {
    if (!oldUnits[id]) out.push(`เพิ่มตัวใหม่: ${u.n} (${u.rar}, HP ${u.hp}, pop ${u.pop})`);
  }
  for (const [id, u] of Object.entries(oldUnits)) {
    if (!newUnits[id]) out.push(`ลบตัว: ${u.n}`);
  }
  for (const [id, u] of Object.entries(newUnits)) {
    if (oldUnits[id]) out.push(...diffUnit(oldUnits[id], u));
  }
  return out;
}

const crypto = require("crypto");
// Same list of changes -> same id (the app uses it to remember which message was already read).
const noteId = lines => "wn-" + crypto.createHash("sha1").update(lines.join("\n")).digest("hex").slice(0, 8);

module.exports = { diffUnits, noteId };
