/* ---------- rules ---------- */
function loseHP(t,d){
  const a=Math.min(t.sh,d);t.sh-=a;t.hp-=d-a;
  num(t,"-"+d,"#ff5a66");
  if(d>0&&t.ww>0)exitWW(t);
  if(t.hp<=0&&t.soul&&soulSave(t))return;
  if(t.hp<=0){U=U.filter(x=>x!==t);VX=VX.filter(v=>v.owner!==t.id);if(t.k==="nimbora")CZ.rz=CZ.rz.filter(z=>z.team!==t.team);if(sel===t.id)sel=null;if(!U.some(x=>x.team===t.team))over=1-t.team}
}
// the Tide Shield cooldown only starts once the silence it caused is gone (it ends by time or is cured)
function endSilence(u){const g=R[u.k].s.findIndex(x=>x.k==="g");if(g>=0)u.cd[g]=R[u.k].s[g].cd}
function heal(t,a,cure){
  // Curse of Master: healing is allowed but reduced (rounded, at least 1); curing Bleeding/Poison still works
  if(R[t.k].healMul)a=Math.max(1,Math.round(a*R[t.k].healMul));
  t.hp=Math.min(MHP(t),t.hp+a);num(t,"+"+a,"#43c07a");
  if(cure){t.st.bleed=0;t.st.poison=0;if(t.st.silent>0){t.st.silent=0;endSilence(t)}}
}
function hurt(src,t,s,d){
  if(!canHit(s,t)){
    if(U.includes(t)&&t.st.freeze<1&&isRanged(s)&&R[t.k].rangedGroundImmune&&!(t.fly>0))msg=R[t.k].n+" อยู่บนพื้น โดนระยะไกลไม่ได้";
    return false;
  }
  const rule=s.pierce?null:(R[t.k].blk||[]).find(b=>b.c.includes(s.c)&&b.l.includes(s.l)&&(!b.tg||b.tg===s.tg)&&Math.random()<b.p);
  if(rule){addFx({type:"block",x:t.x,y:t.y});msg=R[t.k].n+" กันการโจมตีได้!";return false}
  // damage modifiers multiply: kingdom sword vs dragon/spirit/legend, ranged vs a flying dragon, element resistance
  let m=1;const T=R[t.k],beast=isBeast(t);
  // Beast Hunter: fixed damage against dragons/monsters, then Awakening adds +1 (+3 against beasts) before the multipliers
  if(beast&&s.bd!==undefined)d=s.bd;
  if(src.awk>0&&s.d)d+=beast?3:1;
  // takes more from ranged skills, except when the attacker is itself a dragon/monster
  if(T.rngIn&&isRanged(s)&&!isBeast(src))m*=T.rngIn;
  // Awakening: only 10% of the damage dealt by dragons/monsters
  if(isBeast(src)){if(t.awk>0)m*=.1;else if(T.beastDR)m*=1-T.beastDR}
  if(T.mulRanged&&isRanged(s))m*=T.mulRanged;
  if(T.mulMelee&&hasT(s,"melee"))m*=T.mulMelee;
  if(hasT(s,"kingdom")&&unitTags(t).some(g=>["dragon","spirit","legend"].includes(g)))m*=1.5;
  if(isRanged(s)&&T.flyRangedMul&&t.fly>0)m*=T.flyRangedMul;
  if(T.res)(s.tags||[]).forEach(g=>{if(T.res[g]!==undefined)m*=T.res[g]});
  d=Math.max(0,Math.round(d*m));
  msg=R[src.k].n+" ใช้ "+s.n+" ใส่ "+R[t.k].n+" -"+d;
  loseHP(t,d);
  return true;
}
function exitWW(u){
  u.ww=0;
  const w=R[u.k].s.findIndex(x=>x.k==="w");if(w>=0)u.cd[w]=R[u.k].s[w].cd;
  if(u.tpUsed){const m=R[u.k].s.findIndex(x=>x.k==="m");if(m>=0)u.cd[m]=1}
  u.tpUsed=false;addFx({type:"smoke",x:u.x,y:u.y,sz:.8});
}
function land(u){
  u.fly=0;
  const f=R[u.k].s.findIndex(x=>x.k==="f");if(f>=0)u.cd[f]=R[u.k].s[f].cd;
  addFx({type:"swirl",x:u.x,y:u.y,dur:1000});
}
function tick(u,s){
  addFx({type:"aura",x:u.x,y:u.y});
  FXLAG=320;
  U.filter(e=>e.team!==u.team&&dist(u,e)===1).forEach(e=>{if(over<0){addFx({type:"hit",v:"fire",x:e.x,y:e.y,dl:300});hurt(u,e,s,s.d)}});
  FXLAG=0;
}
function begin(t){
  turn=t;sel=null;mode=-1;P[t]={mp:2,ap:2};
  U.filter(u=>u.team===t).forEach(u=>{
    if(!U.includes(u)||over>=0)return;
    u.cd=u.cd.map((c,i)=>R[u.k].s[i].k==="H"&&scarecrowCount(u.team)>=3?c:Math.max(0,c-1));u.fm=0;u.ss=0;
    u.stunned=u.st.stun>0;u.st.stun=0;
    if(u.st.silent>0){u.st.silent--;if(u.st.silent===0)endSilence(u)}
    if(u.st.regen){addFx({type:"tick",v:"regen",x:u.x,y:u.y});heal(u,u.st.regen.amt);u.st.regen.left--;if(u.st.regen.left<=0)u.st.regen=null}
    if(u.st.bleed>0&&U.includes(u)){addFx({type:"tick",v:"bleed",x:u.x,y:u.y});loseHP(u,2);u.st.bleed--}
    if(u.st.poison&&U.includes(u)){addFx({type:"tick",v:"poison",x:u.x,y:u.y});loseHP(u,u.st.poison)}
    if(u.st.burn&&U.includes(u)){addFx({type:"tick",v:"burn",x:u.x,y:u.y});loseHP(u,2*u.st.burn);u.st.burn--}
    if(!U.includes(u)||over>=0)return;
    if(u.aura>0){u.aura--;tick(u,R[u.k].s.find(x=>x.k==="s"))}
    if(u.ww>0){u.ww--;if(u.ww===0)exitWW(u)}
    if(U.includes(u)&&over<0)VX.filter(v=>v.owner===u.id).forEach(pullVortex);
    if(!U.includes(u)||over>=0)return;
    if(u.awk>0){u.awk--;if(u.awk===0){const v=R[u.k].s.findIndex(x=>x.k==="v");if(v>=0)u.cd[v]=R[u.k].s[v].cd;addFx({type:"smoke",x:u.x,y:u.y,sz:.7})}}
    if(u.k==="nimbora"){
      u.zs=0;
      if(u.sz>0){u.sz--;if(u.sz===0){const xi=R[u.k].s.findIndex(q=>q.k==="x");if(xi>=0)u.cd[xi]=R[u.k].s[xi].cd;addFx({type:"smoke",x:u.x,y:u.y,sz:1.1})}}
      if(over<0)rain(u);
    }
    if(u.k==="scarecrowd"&&Math.random()<.75){const c=cellsW(u);if(c.length)plantWF(u.team,[rnd(c)])}
    if(!U.includes(u)||over>=0)return;
    if(R[u.k].pf)u.fly=1;else if(u.fly>0){u.fly--;if(u.fly===0)land(u)}
  });
  render();
  if(onlineGame){broadcastGameState();}
  else if(t===1&&over<0)setTimeout(bot,600);
}
function usable(u,si){
  const s=eff(u,si),p=P[u.team];
  if(turn!==u.team||over>=0||u.cd[si]>0||dis(u)||u.st.silent>0)return false;
  if(s.mpc?p.mp<s.mpc:s.k==="m"?p.mp<1:p.ap<(s.cost!==undefined?s.cost:1))return false;
  if(s.k==="w"&&u.ww>0)return false;
  if(s.k==="v"&&u.awk>0)return false;
  if(s.k==="x"&&u.sz>0)return false;
  if(s.k==="z"&&(u.zs||0)>=3)return false;
  if(s.k==="c"&&!cellsFor(u,s).length)return false;
  if(s.k==="W"&&!cellsW(u).length)return false;
  if(s.k==="H"&&!(WF.filter(f=>f[2]===u.team).length>3&&scarecrowCount(u.team)<3&&cellsFor(u,s).length))return false;
  if(s.k==="X"&&!targetsFor(u,si).length)return false;
  if(s.k==="B"&&((u.pu||0)>=1||!targetsFor(u,si).length))return false;
  if(s.k==="o"&&VX.some(v=>v.owner===u.id))return false;
  if(s.k==="f"&&u.fly>0)return false;
  if(s.fl&&!(u.fly>0))return false;
  if(s.tp&&u.tpUsed)return false;
  return true;
}
function targetable(e){return !(e.ww>0)&&!(e.st.freeze>0)}
function targetsFor(u,si){
  const s=eff(u,si),d=e=>dist(u,e);
  if(s.k==="t")return U.filter(e=>e.team!==u.team&&targetable(e)&&d(e)>=1&&d(e)<=s.r&&canHit(s,e));
  if(s.k==="L")return U.filter(e=>e.team!==u.team&&targetable(e)&&d(e)>=1&&d(e)<=s.r&&canHit(s,e)&&pushCell(u,e));
  if(s.k==="p")return U.filter(e=>e.st.freeze<1&&d(e)<=s.r&&(e.team===u.team||(targetable(e)&&d(e)>=1)));
  if(s.k==="g")return U.filter(e=>e.team===u.team&&e.st.freeze<1&&d(e)<=s.r&&allyBuffOK(u,e));
  if(s.k==="h"||s.k==="r")return U.filter(e=>e.team===u.team&&e.st.freeze<1&&d(e)<=s.r);
  if(s.k==="X")return U.filter(e=>e.k==="scarecrow"&&e.team===u.team&&e!==u);
  if(s.k==="B")return U.filter(e=>e.team===u.team&&e!==u&&!e.soul&&e.st.freeze<1);
  return[];
}
// A cell is open to a unit when it is empty, or when it holds a HIDDEN enemy (Wind-Walk): the mover cannot see it,
// so it may walk (or dash, teleport, jump) onto it and trigger an ambush. A visible unit, or an ally's hidden unit, blocks.
function open(u,x,y){const e=at(x,y);return !e||(e!==u&&e.team!==u.team&&e.ww>0)}
// Walking onto a hidden enemy: the mover is stunned, takes 5 damage and bleeds for 2 turns; the hidden unit is revealed,
// stunned and pushed out to the free neighbouring cell farthest from the mover (or swapped onto the mover's old cell).
function enter(u,x,y,dl=0){
  const w=at(x,y);
  if(!w||w===u||w.team===u.team||!(w.ww>0)){u.x=x;u.y=y;return false}
  const ox=u.x,oy=u.y,pc=pushCell(u,w)||[ox,oy];
  u.x=x;u.y=y;w.x=pc[0];w.y=pc[1];
  addFx({type:"ambush",x,y,x2:pc[0],y2:pc[1],dl});
  exitWW(w);
  w.st.stun=Math.max(w.st.stun,1);
  u.st.stun=Math.max(u.st.stun,1);u.st.bleed=Math.max(u.st.bleed,2);
  msg=R[u.k].n+" เหยียบ "+R[w.k].n+" ที่ซ่อนอยู่! สตัน · -5 · Bleeding 2 ตา";
  const keep=FXLAG;FXLAG=dl+250;
  loseHP(u,5);
  FXLAG=keep;
  return true;
}
function mcells(u,s){
  const r=[];
  for(let x=0;x<10;x++)for(let y=0;y<10;y++)
    if(open(u,x,y)&&(s.tp||Math.max(Math.abs(x-u.x),Math.abs(y-u.y))<=s.r))r.push([x,y]);
  return r;
}
// the cells a line skill (Qi Tian Slash) can cover: up to s.r cells in each of the 8 directions
function lineCells(u,s){
  const r=[];
  ADJ.forEach(d=>{for(let i=1;i<=s.r;i++){const x=u.x+d[0]*i,y=u.y+d[1]*i;if(x<0||y<0||x>9||y>9)break;r.push([x,y])}});
  return r;
}
function moves(u){
  const m=Math.max(R[u.k].mv,(u.fly>0&&!R[u.k].pf)?2:0,u.awk>0?2:0),r=[];
  if(turn!==u.team||dis(u))return r;
  if(R[u.k].freeMove){if(u.fm)return r}else if(P[u.team].mp<1)return r;
  for(let x=u.x-m;x<=u.x+m;x++)for(let y=u.y-m;y<=u.y+m;y++)
    if(x>=0&&y>=0&&x<10&&y<10&&open(u,x,y))r.push([x,y]);
  return r;
}
// Whirlpool: every enemy within 2 cells of the centre (5x5) that the skill can touch is pulled one step toward the centre
// (the closest first, so the others pack around whoever sits in the middle) and takes 3 damage the first time, 2 afterwards.
function pullVortex(v){
  const o=byId(v.owner);
  if(!o){VX=VX.filter(z=>z!==v);return}
  const si=R[o.k].s.findIndex(x=>x.k==="o"),s=R[o.k].s[si],d2=e=>(e.x-v.x)**2+(e.y-v.y)**2;
  addFx({type:"vortex",x:v.x,y:v.y});
  const keep=FXLAG;FXLAG=500;
  U.filter(e=>e.team!==o.team&&Math.max(Math.abs(e.x-v.x),Math.abs(e.y-v.y))<=2&&canHit(s,e)).sort((a,b)=>d2(a)-d2(b)).forEach(e=>{
    if(!U.includes(e)||over>=0)return;
    const cur=d2(e);let best=null;
    ADJ.forEach(d=>{const x=e.x+d[0],y=e.y+d[1];if(x<0||y<0||x>9||y>9||at(x,y))return;const q=(x-v.x)**2+(y-v.y)**2;if(q<cur&&(!best||q<best.q))best={x,y,q}});
    if(best){e.x=best.x;e.y=best.y}
    const ok=hurt(o,e,s,v.hit[e.id]?2:3);v.hit[e.id]=1;
    if(ok&&U.includes(e)&&Math.random()<s.stunP-(R[e.k].stunRes||0))e.st.stun=Math.max(e.st.stun,s.stun||1);
  });
  FXLAG=keep;
  v.left--;
  if(v.left<=0){VX=VX.filter(z=>z!==v);o.cd[si]=s.cd;addFx({type:"smoke",x:v.x,y:v.y,sz:1.2})}
}
