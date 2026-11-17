#!/usr/bin/env node
// Checks that an upload is safe to deploy. Errors make the CI check fail (so Render keeps the old version running);
// warnings are only printed.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { loadUnits } = require("../lib/units");

const root = path.join(__dirname, "..");
const pub = path.join(root, "public");
const errors = [], warnings = [];
const rel = p => path.relative(root, p);

// 1) every JS file parses
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f), st = fs.statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    if (!f.endsWith(".js") || p.endsWith("units.bundle.js")) continue;
    try { new vm.Script(fs.readFileSync(p, "utf8"), { filename: rel(p) }); }
    catch (e) { errors.push(`${rel(p)}: โค้ดผิดรูปแบบ - ${e.message}`); }
  }
})(pub);
for (const f of ["server.js", "lib/units.js", "lib/changes.js", "tools/whatsnew.js"]) {
  try { new vm.Script(fs.readFileSync(path.join(root, f), "utf8"), { filename: f }); }
  catch (e) { errors.push(`${f}: โค้ดผิดรูปแบบ - ${e.message}`); }
}

// 2) JSON files are valid
for (const f of ["package.json", "public/manifest.json", "info.json", "changelog.json", "release/snapshot.json"]) {
  const optional = ["info.json", "changelog.json", "release/snapshot.json"].includes(f);
  if (optional && !fs.existsSync(path.join(root, f))) { warnings.push(`${f}: ยังไม่มีไฟล์ (เซิร์ฟเวอร์ใช้ค่าเริ่มต้นได้)`); continue; }
  try { JSON.parse(fs.readFileSync(path.join(root, f), "utf8")); }
  catch (e) { errors.push(`${f}: ไม่ใช่ JSON ที่ถูกต้อง - ${e.message}`); }
}

// 3) units
const { units, problems } = loadUnits(path.join(pub, "data", "units"));
for (const p of problems) errors.push(`data/units/${p.file}: ${p.error}`);
if (!Object.keys(units).length) errors.push("ไม่มีตัวละครที่ใช้งานได้เลย");
const fxText = fs.existsSync(path.join(pub, "js", "effects.js")) ? fs.readFileSync(path.join(pub, "js", "effects.js"), "utf8") : "";
const orders = new Map();
for (const [id, u] of Object.entries(units)) {
  if (!fs.existsSync(path.join(pub, "img", "char", id + ".svg"))) warnings.push(`${id}: ยังไม่มีภาพ img/char/${id}.svg`);
  if (u.order !== undefined) { if (orders.has(u.order)) warnings.push(`${id}: order ${u.order} ซ้ำกับ ${orders.get(u.order)}`); orders.set(u.order, id); }
  for (const s of u.s) {
    for (const ic of [s.i, s.alt && s.alt.i].filter(Boolean)) {
      if (!fs.existsSync(path.join(pub, "img", "icon", ic + ".svg"))) warnings.push(`${id}/${s.n}: ไม่พบไอคอน img/icon/${ic}.svg`);
    }
    for (const v of [s.v, s.alt && s.alt.v].filter(Boolean)) {
      if (!new RegExp("\\b" + v + "\\b").test(fxText)) warnings.push(`${id}/${s.n}: ไม่พบเอฟเฟกต์ "${v}" ใน js/effects.js`);
    }
  }
}

// 4) config
const cfg = fs.readFileSync(path.join(pub, "data", "config.js"), "utf8");
const ver = (cfg.match(/version\s*:\s*"([^"]+)"/) || [])[1];
if (!/^\d+\.\d+\.\d+$/.test(ver || "")) errors.push(`public/data/config.js: version ต้องเป็นรูป 1.2.3 (ตอนนี้: ${ver})`);
try {
  const info = JSON.parse(fs.readFileSync(path.join(root, "info.json"), "utf8"));
  for (const k of ["latest", "minimum"]) if (!/^\d+\.\d+\.\d+$/.test(info[k] || "")) errors.push(`info.json: ${k} ต้องเป็นรูป 1.2.3`);
  if (info.downloadUrl && !/^https:\/\//.test(info.downloadUrl)) errors.push("info.json: downloadUrl ต้องขึ้นต้นด้วย https://");
  const ids = (info.mail || []).map(m => m.id);
  if (new Set(ids).size !== ids.length) errors.push("info.json: มีข้อความที่ id ซ้ำกัน");
  for (const m of info.mail || []) if (!m.id || !m.title) errors.push("info.json: ทุกข้อความต้องมี id และ title");
} catch (_e) { /* already reported above */ }

console.log(`ตัวละครที่ใช้ได้ ${Object.keys(units).length} ตัว`);
warnings.forEach(w => console.log("⚠ ", w));
errors.forEach(e => console.log("✗ ", e));
if (errors.length) { console.log(`\nไม่ผ่าน: ${errors.length} ข้อผิดพลาด`); process.exit(1); }
console.log(`\nผ่าน (เตือน ${warnings.length} รายการ)`);
