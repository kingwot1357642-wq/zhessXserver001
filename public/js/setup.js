/* ---------- setup ---------- */
function setup(){
  const tot=pick.reduce((a,k)=>a+R[k].pop,0);
  const online=onlineGame;
  $("su").style.display="flex";
  $("su").innerHTML=`<h2 style="margin:0">${ICON("swords")} Zhess X</h2><div class="mu">${online?"เลือกกองกำลังของคุณ · อีกฝ่ายจะเลือกกองกำลังของตนเอง":"เลือกตัวหมาก (ห้ามซ้ำ) population รวมไม่เกิน "+CAP+" แล้วสู้กับบอท"}</div>
  <div class="opts">${KEYS.map(k=>`<button class="opt ${pick.includes(k)?"on":""}" data-k="${k}">${shape(k,0)}<b>${R[k].n}</b><br><small class="mu">${RAR[R[k].rar]} · HP ${R[k].hp} · Pop ${R[k].pop}</small></button>`).join("")}</div>
  <div><b>Population ${tot}/${CAP}</b></div>
  <div id="pickWait" class="mu">${online?"เมื่อยืนยันแล้วจะรออีกฝ่ายเลือกตัวละคร":""}</div>
  <button class="m" id="go" ${pick.length&&!onlineSubmitted?"":"disabled"} style="padding:10px 22px;font-size:16px">${online?"ยืนยันตัวละคร":"เริ่มเกม"}</button>${online?"":`<button class="m" id="backLobby" style="background:var(--sf2);color:var(--tx)">กลับหน้าแรก</button>`}`;
  if(onlineSubmitted){$("pickWait").textContent="ยืนยันกองกำลังแล้ว กำลังรออีกฝ่าย...";$("go").textContent="รออีกฝ่าย";}
  $("su").querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{
    if(onlineSubmitted)return;
    const k=b.dataset.k;
    if(pick.includes(k))pick=pick.filter(x=>x!==k);
    else if(tot+R[k].pop<=CAP)pick.push(k);
    setup();
  });
  const bl=$("backLobby");if(bl)bl.onclick=()=>backToLobby("",false);
  $("go").onclick=()=>{
    if(online){if(!pick.length||onlineSubmitted)return;onlineSubmitted=true;setup();onlineSocket.emit("submit_pick",{roomCode:onlineRoom,picks:pick});}
    else start();
  };
}
const spread=n=>n===1?[4]:Array.from({length:n},(_,i)=>Math.round(1+i*8/(n-1)));
function mk(k,team,x,y){return{id:nid++,k,team,x,y,hp:R[k].hp,sh:0,cd:R[k].s.map(()=>0),aura:0,ww:0,awk:0,fly:R[k].pf?1:0,sz:0,zs:0,soul:0,pu:0,fm:0,ss:0,tpUsed:false,stunned:false,st:{poison:0,burn:0,bleed:0,stun:0,freeze:0,silent:0,regen:null}}}
function start(){
  // pick your own positions first; the bot places its random army on its two back rows
  deployStart(pick,0,DEPLOY_SECONDS,layout=>{
    U=[];over=-1;nid=1;msg="";FX=[];VX=[];CZ={pc:[],rz:[]};WF=[];
    layout.forEach(l=>U.push(mk(l.k,0,l.x,l.y)));
    const ks=[...KEYS].sort(()=>Math.random()-.5),n=3+Math.floor(Math.random()*3),en=[];let pop=0;
    for(const k of ks){if(en.length>=n)break;if(pop+R[k].pop<=CAP){en.push(k);pop+=R[k].pop}}
    randomLayout(en,1).forEach(l=>U.push(mk(l.k,1,l.x,l.y)));
    $("su").style.display="none";
    setArena(Math.floor(Math.random()*ARENA.length));resetTurnClock();
    msg="สนาม: "+ARENA[arena].n;
    begin(0);
  });
}

/* ---------- deployment: place your units on your own two back rows ---------- */
const DEPLOY_SECONDS=60;
let DEP=null;
// screen cell (r: 0 = front row, 1 = back row; c: 0-9 left to right as the player sees the board) -> board cell
const depCell=(team,r,c)=>team===0?{x:c,y:r===0?8:9}:{x:9-c,y:r===0?1:0};
function randomLayout(keys,team){
  const cells=[];for(let r=0;r<2;r++)for(let c=0;c<10;c++)cells.push(depCell(team,r,c));
  for(let i=cells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]]}
  return keys.map((k,i)=>({k,x:cells[i].x,y:cells[i].y}));
}
function stopDeploy(){if(DEP&&DEP.timer)clearInterval(DEP.timer);DEP=null}
function depAtCell(r,c){return DEP.place.findIndex(p=>p&&p.r===r&&p.c===c)}
function depFill(){
  const free=[];for(let r=0;r<2;r++)for(let c=0;c<10;c++)if(depAtCell(r,c)<0)free.push({r,c});
  for(let i=free.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[free[i],free[j]]=[free[j],free[i]]}
  DEP.place.forEach((p,i)=>{if(!p)DEP.place[i]=free.pop()});
  DEP.sel=-1;
}
function depSubmit(){
  if(!DEP||DEP.submitted)return;
  if(DEP.place.some(p=>!p))depFill();
  DEP.submitted=true;
  const layout=DEP.picks.map((k,i)=>({k,...depCell(DEP.team,DEP.place[i].r,DEP.place[i].c)}));
  const cb=DEP.onSubmit;depDraw();cb(layout);
}
function depLeft(){return Math.max(0,Math.ceil((DEP.deadline-Date.now())/1000))}
function depDraw(){
  const D=DEP,left=depLeft(),placed=D.place.filter(Boolean).length,all=placed===D.picks.length;
  let grid="";
  for(let r=0;r<2;r++)for(let c=0;c<10;c++){
    const i=depAtCell(r,c);
    grid+=`<button class="dc ${r?"bk":""} ${i>=0&&i===D.sel?"sel":""}" data-r="${r}" data-c="${c}" ${D.submitted?"disabled":""}>${i>=0?shape(D.picks[i],0):""}</button>`;
  }
  const tray=D.picks.map((k,i)=>D.place[i]?"":`<button class="dt ${i===D.sel?"sel":""}" data-i="${i}" ${D.submitted?"disabled":""}>${shape(k,0)}<small>${R[k].n}</small></button>`).join("");
  $("su").style.display="flex";
  $("su").innerHTML=`<h2 style="margin:0">${ICON("swords")} วางตัวหมาก</h2>
  <div class="mu">${D.submitted?(D.oppReady?"ทั้งสองฝ่ายพร้อมแล้ว กำลังเริ่ม...":"วางเสร็จแล้ว กำลังรออีกฝ่าย..."):"แตะตัวหมาก แล้วแตะช่องในสองแถวล่างของคุณ · แตะตัวที่วางแล้วเพื่อย้ายหรือสลับ"}${D.oppReady&&!D.submitted?" · อีกฝ่ายวางเสร็จแล้ว":""}</div>
  <div class="dtimer ${left<=10?"low":""}" id="depT">เหลือเวลา ${left} วินาที</div>
  <div class="dwrap"><div class="dl"><span>แถวหน้า</span><span>แถวหลัง</span></div><div class="dg">${grid}</div></div>
  <div class="dtray">${tray||'<span class="mu">วางครบทุกตัวแล้ว</span>'}</div>
  <div class="row2"><button class="m" id="depRnd" ${D.submitted||all?"disabled":""}>สุ่มที่เหลือ</button><button class="m" id="depGo" ${D.submitted||!all?"disabled":""} style="padding:8px 20px;font-size:15px">${D.submitted?"รออีกฝ่าย":"ยืนยันการวาง"}</button></div>
  ${D.err?`<div class="mu" style="color:#ff8a94">${D.err}</div>`:""}`;
  $("su").querySelectorAll(".dc").forEach(b=>b.onclick=()=>{
    if(D.submitted)return;
    const r=+b.dataset.r,c=+b.dataset.c,occ=depAtCell(r,c);
    if(D.sel<0){if(occ>=0)D.sel=occ}
    else if(occ===D.sel)D.sel=-1;
    else{
      const old=D.place[D.sel];
      if(occ>=0)D.place[occ]=old||null; // swap with a placed unit, or send the occupant back to the tray
      D.place[D.sel]={r,c};D.sel=-1;
    }
    depDraw();
  });
  $("su").querySelectorAll(".dt").forEach(b=>b.onclick=()=>{if(D.submitted)return;const i=+b.dataset.i;D.sel=D.sel===i?-1:i;depDraw()});
  $("depRnd").onclick=()=>{if(!D.submitted){depFill();depDraw()}};
  $("depGo").onclick=depSubmit;
}
function deployStart(picks,team,seconds,onSubmit){
  stopDeploy();
  DEP={picks:[...picks],team,place:picks.map(()=>null),sel:-1,deadline:Date.now()+seconds*1000,submitted:false,oppReady:false,err:"",onSubmit};
  DEP.timer=setInterval(()=>{
    if(!DEP)return;
    const l=depLeft(),t=$("depT");
    if(t){t.textContent="เหลือเวลา "+l+" วินาที";t.classList.toggle("low",l<=10)}
    if(l<=0)depSubmit(); // out of time: the rest are placed at random
  },250);
  depDraw();
}


/* ---------- arena themes (one is picked at random for every match) ---------- */
function arenaTex(id){
  let r=4321+id*977;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  const path=(x,y,len)=>{let d=`M${x.toFixed(1)} ${y.toFixed(1)}`,a=rnd()*6.28;for(let i=0;i<len;i++){a+=(rnd()-.5)*1.3;x+=Math.cos(a)*(2.5+rnd()*4);y+=Math.sin(a)*(2.5+rnd()*4);d+=`L${x.toFixed(1)} ${y.toFixed(1)}`}return d};
  const line=(d,w,col,op)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const crack=(x,y,len,w,col,op)=>line(path(x,y,len),w,col,op);
  const grid=col=>{let g="";for(let i=1;i<10;i++)g+=`<path d="M${i*10} 0V100M0 ${i*10}H100" stroke="${col}" stroke-width=".3" stroke-opacity=".7"/>`;return g};
  const T=[
   {a:"#222c40",b:"#131925",g:"#070a11",f:()=>{let o="";for(let i=0;i<8;i++)o+=crack(rnd()*100,rnd()*100,5+rnd()*5,.3,"#04060b",.8);for(let i=0;i<7;i++){const x=5+Math.floor(rnd()*10)*10,y=5+Math.floor(rnd()*10)*10;o+=`<g stroke="#7fa6ff" stroke-opacity=".38" stroke-width=".35" fill="none"><circle cx="${x}" cy="${y}" r="2.2"/><path d="M${x-1.2} ${y}H${x+1.2}M${x} ${y-1.2}V${y+1.2}"/></g><circle cx="${x}" cy="${y}" r="3.6" fill="#7fa6ff" fill-opacity=".07"/>`}return o}},
   {a:"#1a1648",b:"#080b24",g:"#04051a",f:()=>{let o=`<circle cx="84" cy="14" r="13" fill="#dfe8ff" fill-opacity=".07"/><circle cx="84" cy="14" r="6.5" fill="#eef3ff" fill-opacity=".2"/>`;for(let i=0;i<46;i++)o+=`<circle cx="${(rnd()*100).toFixed(1)}" cy="${(rnd()*100).toFixed(1)}" r="${(.18+rnd()*.35).toFixed(2)}" fill="#fff" fill-opacity="${(.25+rnd()*.55).toFixed(2)}"/>`;return o}},
   {a:"#1b0d0a",b:"#0b0504",g:"#040101",f:()=>{let o="";for(let i=0;i<9;i++){const d=path(rnd()*100,rnd()*100,6+Math.floor(rnd()*5));o+=line(d,1.8,"#ff4a14",.22)+line(d,.4,"#ffb347",.95)}return o}},
   {a:"#10291d",b:"#08150f",g:"#030b07",f:()=>{let o="";for(let i=0;i<14;i++)o+=`<ellipse cx="${(rnd()*100).toFixed(1)}" cy="${(rnd()*100).toFixed(1)}" rx="${(4+rnd()*7).toFixed(1)}" ry="${(3+rnd()*5).toFixed(1)}" fill="#35a066" fill-opacity=".11"/>`;for(let i=0;i<9;i++){const x=(rnd()*100).toFixed(1),y=(rnd()*100).toFixed(1);o+=`<circle cx="${x}" cy="${y}" r="3" fill="#6fffd0" fill-opacity=".12"/><circle cx="${x}" cy="${y}" r=".7" fill="#9dffe4" fill-opacity=".8"/>`}return o}}
  ][id];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.a}"/><stop offset="1" stop-color="${T.b}"/></linearGradient></defs><rect width="100" height="100" fill="url(#b)"/>${T.f()}${grid(T.g)}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const ARENA=[
 {id:"stone",n:"สนามหินโบราณ",stage:"radial-gradient(ellipse at 50% 40%,#233049,#0c111c 75%)",c1:"rgba(40,54,82,.34)",c2:"rgba(20,28,44,.42)",line:"#7fa6ff",pc:"#cfe0ff",kind:"rise",n_:16,sz:[2,3.2],dur:[14,24]},
 {id:"castle",n:"ปราสาทยามค่ำคืน",stage:"radial-gradient(ellipse at 70% 10%,#2b2670,#0a0c28 70%)",c1:"rgba(60,56,140,.26)",c2:"rgba(10,12,40,.4)",line:"#9a8cff",pc:"#ffffff",kind:"twk",n_:22,sz:[1.5,3],dur:[2.5,6]},
 {id:"lava",n:"ลาวาและเถ้าถ่าน",stage:"radial-gradient(ellipse at 50% 100%,#5a1608,#120504 72%)",c1:"rgba(80,34,24,.3)",c2:"rgba(24,8,6,.42)",line:"#ff6a2a",pc:"#ff9a3c",kind:"rise",n_:20,sz:[2,4],dur:[6,11]},
 {id:"forest",n:"ป่าลึกเรืองแสง",stage:"radial-gradient(ellipse at 40% 30%,#15402c,#06120c 75%)",c1:"rgba(30,90,60,.28)",c2:"rgba(6,24,16,.42)",line:"#3fe0a8",pc:"#d8ff7a",kind:"ffl",n_:16,sz:[2.2,4],dur:[5,9]}
];
let arena=0,lastTurnSeen=-1,turnDeadline=0;
const TURN_SECONDS=60,TURN_GRACE_MS=6000;
function setArena(i){
  arena=((i%ARENA.length)+ARENA.length)%ARENA.length;
  const A=ARENA[arena],b=document.body;
  b.dataset.arena=A.id;
  b.style.setProperty("--stage",A.stage);b.style.setProperty("--ac1",A.c1);b.style.setProperty("--ac2",A.c2);
  b.style.setProperty("--aline",A.line);b.style.setProperty("--atex",arenaTex(arena));
}
// Particles are re-created on every render, so each one's animation delay is tied to the clock to keep them moving continuously.
// two faint cloud wisps drift between random cloud cells of the whole board (positions come from the clock, so re-rendering never resets them)
let WCELLS=[];
(function wispLoop(){
  try{
    const w=[$("wp0"),$("wp1")];
    if(w[0]&&WCELLS.length){
      const T=Date.now()/1000,L=WCELLS.length,SEG=9;
      const h=(n,k)=>Math.abs(Math.floor(Math.sin(n*12.9898+k*78.233)*43758.5453));
      w.forEach((el,k)=>{
        const t=T/SEG+k*.5,n=Math.floor(t),f=t-n,e=f*f*(3-2*f),a=WCELLS[h(n,k)%L],b=WCELLS[h(n+1,k)%L];
        const x=a[0]+(b[0]-a[0])*e+Math.sin(T*.7+k*2)*.3,y=a[1]+(b[1]-a[1])*e+Math.cos(T*.5+k)*.25;
        el.style.left=((x+.5)*10-11)+"%";el.style.top=((y+.5)*10-11)+"%";
        el.style.opacity=(.45+.25*Math.sin(T*.9+k*3)).toFixed(2);
      });
    }
  }catch(e){}
  requestAnimationFrame(wispLoop);
})();

function ambHTML(){
  const A=ARENA[arena],now=Date.now()/1000;let o="";
  for(let i=0;i<A.n_;i++){
    const q=(i*7919+arena*131)%1000/1000,q2=(i*104729+arena*17)%1000/1000,q3=(i*1299709)%1000/1000;
    const d=A.dur[0]+q2*(A.dur[1]-A.dur[0]),sz=A.sz[0]+q3*(A.sz[1]-A.sz[0]);
    o+=`<i class="pt ${A.kind}" style="--x:${(q*100).toFixed(1)}%;--y:${(q2*92).toFixed(1)}%;--s:${sz.toFixed(1)}px;--d:${d.toFixed(1)}s;--dl:-${(now%d).toFixed(2)}s;--sw:${((q3-.5)*40).toFixed(0)}px;--pc:${A.pc}"></i>`;
  }
  return `<div class="amb">${o}</div>`;
}
let banTimer=null;
function showBanner(text){
  let b=$("turnban");
  if(!b){b=document.createElement("div");b.id="turnban";document.body.appendChild(b)}
  b.textContent=text;b.classList.remove("on");void b.offsetWidth;b.classList.add("on");
  clearTimeout(banTimer);banTimer=setTimeout(()=>b.classList.remove("on"),1900);
  try{navigator.vibrate&&navigator.vibrate(160)}catch(e){}
}
function resetTurnClock(){lastTurnSeen=-1}
// 60 seconds per turn: the player whose turn it is ends it at zero; if that device is stuck, the opponent's device does it a few seconds later.
function tickTurnClock(){
  const t=$("tt");
  if(over>=0||!U.length||(typeof turn==="undefined"))return;
  const botTurn=!onlineGame&&turn===1;
  const left=Math.max(0,Math.ceil((turnDeadline-Date.now())/1000));
  if(t){t.textContent=botTurn?"":left+" วิ";t.classList.toggle("low",left<=10&&!botTurn)}
  if(botTurn)return;
  const meTeam=onlineGame?onlineMyTeam:0;
  const late=Date.now()-turnDeadline;
  if(late>=0&&turn===meTeam){msg="หมดเวลา! จบเทิร์นอัตโนมัติ";begin(1-meTeam)}
  else if(onlineGame&&late>=TURN_GRACE_MS&&turn!==meTeam){begin(1-turn)}
}
setInterval(()=>{try{tickTurnClock()}catch(e){}},250);

