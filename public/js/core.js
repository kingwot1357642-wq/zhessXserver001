const R=ZX.buildR(); // all units, built from data/units/*.js
const KEYS=Object.keys(R).filter(k=>!R[k].summon),CAP=15,RAR={common:"Common",uncommon:"Uncommon",rare:"Rare",epic:"Epic",legend:"Legend"};
const TAGN={phys:"กายภาพ",magic:"เวทย์",melee:"ระยะใกล้",ranged:"ระยะไกล",ground:"พื้นดิน",fire:"ไฟ",water:"น้ำ",sword:"ดาบ",arrow:"ธนู",kingdom:"ดาบอาณาจักร",claw:"กรงเล็บ",dagger:"มีด",lightning:"สายฟ้า",wind:"ลม",earth:"ดิน",breath:"ลมหายใจ",tail:"หาง",high:"โจมตีระดับสูง",mid:"โจมตีระดับกลาง",dark:"มืด",spirit:"วิญญาณ",straw:"ฟาง"};
const hasT=(s,g)=>(s.tags||[]).includes(g);
// A skill counts as ranged ONLY when it carries the "ranged" tag. Reach alone (range 2+) does not make it ranged,
// so every ranged attack is declared explicitly on the skill and the rules cannot contradict each other.
const isRanged=s=>hasT(s,"ranged");
const unitTags=u=>[...(R[u.k].utags||[]),...(R[u.k].rar==="legend"?["legend"]:[])];
// "beast" = dragon or monster (the hunter's quarry)
// Curse of Master: a unit with curse:1 cannot receive shields or helpful statuses from its teammates (itself is fine)
const allyBuffOK=(src,t)=>!(R[t.k].curse&&t.team===src.team&&t!==src);
const isBeast=u=>unitTags(u).some(g=>g==="dragon"||g==="monster");
// can this skill touch this target at all? (frozen, flying vs ground skills, grounded dragon vs ranged skills)
// A skill with aa (anti-air) can still hit a flying beast although it carries the ground tag.
function canHit(s,t){
  if(!U.includes(t)||t.st.freeze>0)return false;
  if(hasT(s,"ground")&&t.fly>0&&!(s.aa&&isBeast(t)))return false;
  if(isRanged(s)&&R[t.k].rangedGroundImmune&&!(t.fly>0))return false;
  return true;
}
const ADJ=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
// empty cell around t where the leaping unit pushes it: farthest from the attacker
function pushCell(u,t){
  let best=null;
  ADJ.forEach(d=>{
    const x=t.x+d[0],y=t.y+d[1];
    if(x<0||y<0||x>9||y>9||at(x,y))return;
    const sc=Math.hypot(x-u.x,y-u.y);
    if(!best||sc>best.sc)best={x,y,sc};
  });
  return best?[best.x,best.y]:null;
}
const CR=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
let U=[],P=[{mp:2,ap:2},{mp:2,ap:2}],sel=null,mode=-1,turn=0,over=-1,pick=[],msg="",FX=[],fxOut=[],nid=1,VX=[],CZ={pc:[],rz:[]},WF=[],PW=[];
const $=id=>document.getElementById(id);
const at=(x,y)=>U.find(u=>u.x===x&&u.y===y);
const byId=id=>U.find(u=>u.id===id);
const dist=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const eff=(u,si)=>{const s=R[u.k].s[si],a=s.alt;let r=s;
  if(a&&(a.on==="ww"?u.ww:a.on==="sz"?u.sz:u.fly)>0)r={...s,...a};
  if(r.k==="z"){const st=u.zs||0;r={...r,cost:st===1?2:0,n:r.n+" · ชั้น "+(st>=3?3:st+1)}}
  return r};
const dis=u=>u.stunned||u.st.freeze>0||u.ss>0;
const hidden=u=>(onlineGame?u.team!==onlineMyTeam:u.team===1)&&u.ww>0;
const shape=(k,team,ex="")=>{const e=R[k].rar==="legend"?EL[R[k].el]:RC[R[k].rar];return `<div class="sh s-${R[k].rar} ${ex}" style="--ea:${e.a};--eb:${e.b};--tc:var(${team?"--en":"--me"});--tg:${team?"rgba(255,90,102,.85)":"rgba(53,168,255,.85)"}"><span class="o"></span><span class="n"></span>${CHAR(k)}</div>`};
const info=s=>[s.d?((s.dt==="true"?"ดาเมจจริง":s.c==="phys"?"กายภาพ":"เวทย์")+" "+s.d):(s.heal?"ฟื้นฟู "+s.heal:null),s.r!==undefined?"ระยะ "+s.r:null,"CD "+s.cd].filter(Boolean).join(" · ");
const icons=u=>[u.st.bleed>0?stI("bleed",u.st.bleed<10?u.st.bleed:""):"",u.st.poison?stI("poison",u.st.poison):"",u.st.burn?stI("burn",u.st.burn):"",u.st.freeze>0?stI("freeze"):"",u.st.silent>0?stI("silent"):"",u.stunned&&turn===u.team?stI("stun"):"",u.st.regen?stI("regen"):"",u.ww>0?stI("ghost"):"",u.awk>0?stI("awaken"):"",u.sz>0?stI("overload"):"",u.soul?stI("puppet"):""].join("");

/* ---------- ART: silhouette characters (dark figure, rim light, element colour) ---------- */
const SP="M0 -4L1.1 -1.1L4 0L1.1 1.1L0 4L-1.1 1.1L-4 0L-1.1 -1.1Z";
// a = rim / highlight, b = metal + mid tone, d = dark edge, gl = glow
// Pictures live in /img as separate SVG files (img/char/<unit>.svg, img/icon/<name>.svg).
// To change a picture, replace the file with the same name; nothing else needs editing.
const IMG="img/";
const CHAR=k=>`<img class="ch" src="${IMG}char/${k}.svg" alt="" draggable="false" onerror="this.style.visibility='hidden'">`;
const ICON=n=>`<img class="ic" src="${IMG}icon/${n}.svg" alt="" draggable="false" onerror="this.style.visibility='hidden'">`;
const ICON_NAMES="arrowRain asteroid aura awaken blast bleed breath broom burn claws dagger dash fireball freeze ghost gsword heart katana leap light lightning meteor oceanSpear poison potion qislash regen rejuv rotate shield silent skull slash smoke stun swords tideShield trophy whirlpool windArrow wing nimbus lfield zonecloud cdash overload wheatsoul reaper handmade mirage puppet soulfist".split(" ");
// preload everything so frames never flash empty
Object.keys(R).forEach(k=>{new Image().src=IMG+"char/"+k+".svg"});ICON_NAMES.forEach(n=>{new Image().src=IMG+"icon/"+n+".svg"});
// icons of skills from newly added units are picked up automatically
Object.values(R).forEach(u=>u.s.forEach(s=>[s.i,s.alt&&s.alt.i].forEach(n=>{if(n&&!ICON_NAMES.includes(n))new Image().src=IMG+"icon/"+n+".svg"})));
const stI=(n,num)=>`<span class="st">${ICON(n)}${num?`<b>${num}</b>`:""}</span>`;

