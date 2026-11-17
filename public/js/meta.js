/* ---------- server status, version check, mail, intro ---------- */
const ZXS={ready:false,info:null,state:"waking",startedAt:Date.now(),introAt:Date.now()};
const verCmp=(a,b)=>{const x=String(a||"0").split(".").map(n=>parseInt(n,10)||0),y=String(b||"0").split(".").map(n=>parseInt(n,10)||0);
  for(let i=0;i<3;i++){const d=(x[i]||0)-(y[i]||0);if(d)return d<0?-1:1}return 0};
const lsGet=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const serverReady=()=>ZXS.ready;

function setServerState(s){
  ZXS.state=s;
  ["srvDot","mmDot"].forEach(id=>{const e=document.getElementById(id);if(e)e.className="sdot "+s});
  const t=document.getElementById("srvText");
  if(t)t.textContent=s==="ready"?"เซิร์ฟเวอร์พร้อมแล้ว":s==="down"?"เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (ยังลองต่อเรื่อยๆ)":"กำลังปลุกเซิร์ฟเวอร์ ใช้เวลาประมาณ 1 นาที...";
  maybeLeaveIntro();
}
// Intro stays at least ZXCFG.introMs and then closes by itself once the server is ready ("เล่นก่อน" skips it right away).
function maybeLeaveIntro(){
  const el=document.getElementById("intro");
  if(!el||el.style.display==="none")return;
  if(ZXS.ready&&Date.now()-ZXS.introAt>=ZXCFG.introMs)el.style.display="none";
}
// Keep asking /health until the (possibly sleeping) server answers.
function pollServer(){
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),10000);
  fetch(SERVER_BASE+"/health",{cache:"no-store",signal:ctl.signal})
    .then(r=>r.ok?r.json():Promise.reject(new Error("bad")))
    .then(j=>{clearTimeout(to);if(!j||!j.ok)throw new Error("bad");onServerUp()})
    .catch(()=>{
      clearTimeout(to);
      if(!ZXS.ready)setServerState(Date.now()-ZXS.startedAt>90000?"down":"waking");
      setTimeout(pollServer,3000);
    });
}
function onServerUp(){
  ZXS.ready=true;
  setServerState("ready");
  connectOnlineLobby();
  fetchInfo();
}

/* ----- version + mail (server file info.json) ----- */
function fetchInfo(){
  fetch(SERVER_BASE+"/api/info",{cache:"no-store"}).then(r=>r.json()).then(applyInfo).catch(()=>{});
}
function applyInfo(info){
  if(!info)return;
  ZXS.info=info;lsSet("zx.info",info);
  window.__outdated=verCmp(ZXCFG.version,info.minimum)<0;
  updateBadge();
  checkForce();
}
// App older than info.json "minimum": nothing else can be used until it is updated (shown above the intro too).
function checkForce(){
  const el=document.getElementById("forceUpdate"),info=ZXS.info;
  if(!el)return;
  if(!info||verCmp(ZXCFG.version,info.minimum)>=0){el.style.display="none";return}
  document.getElementById("fuText").textContent="เวอร์ชันของคุณ ("+ZXCFG.version+") เก่าเกินไป ต้องอัปเดตเป็น "+(info.latest||info.minimum)+" ก่อนจึงจะเล่นต่อได้";
  const b=document.getElementById("fuBtn");
  if(window.ZHESS_APP){
    b.textContent=info.downloadUrl?"ดาวน์โหลดอัปเดต":"ยังไม่มีลิงก์ดาวน์โหลด";
    b.disabled=!info.downloadUrl;
    b.onclick=()=>openUrl(info.downloadUrl);
  }else{
    b.textContent="รีเฟรชเพื่ออัปเดต";b.disabled=false;b.onclick=()=>location.reload();
  }
  el.style.display="flex";
}
function mailItems(){
  const info=ZXS.info;if(!info)return[];
  const items=[];
  if(verCmp(ZXCFG.version,info.latest)<0)items.push({id:"update-"+info.latest,title:"มีเวอร์ชันใหม่ "+info.latest,date:"",
    body:"คุณใช้เวอร์ชัน "+ZXCFG.version+(window.__outdated?"\nต้องอัปเดตก่อนเล่นออนไลน์":"")+(info.downloadUrl?"":"\n(ยังไม่มีลิงก์ดาวน์โหลด)"),url:info.downloadUrl||"",btn:"ดาวน์โหลดอัปเดต"});
  return items.concat(info.mail||[]);
}
const unreadIds=()=>{const read=lsGet("zx.read")||[];return mailItems().map(i=>i.id).filter(id=>!read.includes(id))};
function updateBadge(){const d=document.getElementById("mailDot");if(d)d.style.display=unreadIds().length?"block":"none"}
function openUrl(u){if(window.ZHESS_APP)location.href=u;else window.open(u,"_blank")}
function openMail(){
  const items=mailItems(),un=unreadIds(),box=document.getElementById("mailList");
  box.innerHTML="";
  if(!items.length){const e=document.createElement("div");e.className="me";e.textContent="ไม่มีข้อความ";box.appendChild(e)}
  items.forEach(it=>{
    const d=document.createElement("div");d.className="mi";
    const b=document.createElement("b");b.textContent=it.title||"";
    if(un.includes(it.id)){const n=document.createElement("span");n.className="mn";n.textContent="NEW";b.appendChild(n)}
    d.appendChild(b);
    if(it.date){const s=document.createElement("small");s.textContent=it.date;d.appendChild(s)}
    const p=document.createElement("p");p.textContent=it.body||"";d.appendChild(p);
    if(it.url){const bt=document.createElement("button");bt.textContent=it.btn||"ดาวน์โหลด";bt.onclick=()=>openUrl(it.url);d.appendChild(bt)}
    box.appendChild(d);
  });
  document.getElementById("mailModal").style.display="flex";
  lsSet("zx.read",Array.from(new Set((lsGet("zx.read")||[]).concat(items.map(i=>i.id)))));
  updateBadge();
}

document.addEventListener("DOMContentLoaded",()=>{
  const cached=lsGet("zx.info");           // last known mail / version, so the mailbox works without the server too
  if(cached){ZXS.info=cached;window.__outdated=verCmp(ZXCFG.version,cached.minimum)<0}
  updateBadge();
  checkForce();
  document.getElementById("introBy").textContent="สร้างโดย "+ZXCFG.creator;
  document.getElementById("introPlay").onclick=()=>{document.getElementById("intro").style.display="none"};
  document.getElementById("mailBtn").onclick=openMail;
  document.getElementById("mailX").onclick=()=>{document.getElementById("mailModal").style.display="none"};
  setServerState("waking");
  setInterval(maybeLeaveIntro,300);
  pollServer();
});
