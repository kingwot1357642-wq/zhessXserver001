#!/usr/bin/env node
// Opens the game in a real (headless) browser and plays it, so a broken upload is caught before it goes live.
//   node tools/smoke.js http://localhost:3000            offline part: page loads, no errors, a bot game plays a few rounds
//   node tools/smoke.js http://localhost:3000 --online   also: two browsers create / join a room and start a game
// Needs the "playwright" package (CI installs it with: npm i --no-save playwright).
const { chromium } = require("playwright");
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const online = process.argv.includes("--online");
const fail = [];

const DRIVER = `
window.__runGame = async rounds => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let acted = 0;
  for (let r = 0; r < rounds; r++) {
    if (over >= 0) break;
    let guard = 0;
    while (turn === 0 && over < 0 && (P[0].ap > 0 || P[0].mp > 0) && guard++ < 12) {
      const acts = [];
      U.filter(u => u.team === 0).forEach(u => {
        R[u.k].s.forEach((s0, si) => {
          if (!usable(u, si)) return; const s = eff(u, si);
          if (s.k === "t" || s.k === "L") targetsFor(u, si).forEach(t => acts.push(() => cast(u, si, t.x, t.y)));
          else if (["s", "w", "f", "v", "x"].includes(s.k)) acts.push(() => cast(u, si));
        });
        moves(u).forEach(m => acts.push(() => { enter(u, m[0], m[1]); payMove(u); }));
      });
      if (!acts.length) break;
      acts[Math.floor(Math.random() * acts.length)](); acted++;
    }
    if (over < 0 && turn === 0) begin(1);
    let w = 0; while (turn === 1 && over < 0 && w++ < 1500) await sleep(2);
  }
  return acted;
};`;

async function openGame(browser, errors) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 480 } });
  page.on("pageerror", e => errors.push(String(e)));
  await page.addInitScript("(()=>{const ost=window.setTimeout;window.setTimeout=(f,ms,...a)=>ost(f,Math.min(ms||0,60),...a)})()");
  await page.goto(base + "/index.html", { waitUntil: "load" });
  await page.waitForSelector("#introPlay");
  return page;
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---- offline: a bot game ----
    const errors = [];
    const page = await openGame(browser, errors);
    await page.click("#introPlay");
    await page.click("#mmOffline");
    const keys = await page.evaluate(() => Object.entries(R).filter(([, u]) => !u.summon).sort((a, b) => a[1].pop - b[1].pop).map(([k, u]) => [k, u.pop]));
    if (keys.length < 2) fail.push("มีตัวละครให้เลือกน้อยเกินไป");
    let sum = 0;
    for (const [k, pop] of keys) { if (sum + pop > 15) continue; await page.click(`.opt[data-k="${k}"]`); sum += pop; }
    await page.click("text=เริ่มเกม");
    await page.click("text=สุ่มที่เหลือ");
    await page.click("text=ยืนยันการวาง");
    await page.waitForFunction(() => typeof U !== "undefined" && U.length > 0 && typeof turn !== "undefined", null, { timeout: 15000 });
    await page.evaluate(DRIVER);
    const acted = await page.evaluate(() => window.__runGame(12));
    if (!acted) fail.push("เล่นกับบอทแล้วไม่มีการเดิน/ใช้สกิลเลย");
    fail.push(...errors.map(e => "หน้าเกมมี error: " + e));
    console.log(`offline: units ${keys.length}, actions ${acted}, errors ${errors.length}`);
    await page.close();

    // ---- online: two players ----
    if (online) {
      const eA = [], eB = [];
      const a = await openGame(browser, eA), b = await openGame(browser, eB);
      await a.click("#introPlay"); await b.click("#introPlay");
      await a.waitForFunction(() => ZXS.ready, null, { timeout: 20000 });
      await b.waitForFunction(() => ZXS.ready, null, { timeout: 20000 });
      await a.click("#mmBattle"); await a.click("#bpCustoms");
      await a.waitForFunction(() => /^[A-Z0-9]{6}$/.test(document.getElementById("roomCodeDisplay").textContent), null, { timeout: 15000 });
      const code = await a.textContent("#roomCodeDisplay");
      await b.click("#mmBattle"); await b.click("#bpJoin");
      await b.fill("#joinCode", code); await b.click("#joinGo");
      await b.waitForFunction(() => document.getElementById("roomModal").style.display === "flex", null, { timeout: 15000 });
      await a.waitForFunction(() => !document.getElementById("readyBtn").disabled, null, { timeout: 15000 });
      await b.waitForFunction(() => !document.getElementById("readyBtn").disabled, null, { timeout: 15000 });
      await a.click("#readyBtn"); await b.click("#readyBtn");
      await a.waitForFunction(() => document.getElementById("su").style.display !== "none", null, { timeout: 20000 });
      await b.waitForFunction(() => document.getElementById("su").style.display !== "none", null, { timeout: 20000 });
      fail.push(...eA.concat(eB).map(e => "ออนไลน์มี error: " + e));
      console.log(`online: room ${code} created, joined, both ready, game started, errors ${eA.length + eB.length}`);
    }
  } catch (e) {
    fail.push("smoke test หยุดกลางคัน: " + e.message);
  } finally {
    await browser.close();
  }
  if (fail.length) { console.log("FAILED:\n - " + fail.join("\n - ")); process.exit(1); }
  console.log("smoke test passed");
})();
