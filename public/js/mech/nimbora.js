/* ---------- Nimbora: clouds, rain and lightning ---------- */
// CZ.pc = permanent cloud cells [x,y,team]; CZ.rz = rain zones from Nimbocumulus {id,team,x,y} (they rain once, at the start of the owner's next turn).
// The personal cloud is not stored: it is the 3x3 (Super Zone: 5x5) area around the living Nimbora of that team.
const RAINS={n:"Rain",tags:["water","rain"]};                                   // no c / l => cannot be blocked (true damage)
const STRIKE={n:"Lightning Strike",c:"magic",l:"mid",tags:["magic","lightning","ground","mid"]};
const CHAIN_S={n:"Lightning Strike",c:"magic",l:"mid",tags:["magic","lightning","mid"]};   // the chained bolts have no ground tag
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const onBoard=(x,y)=>x>=0&&y>=0&&x<10&&y<10;
const NB=team=>U.find(u=>u.k==="nimbora"&&u.team===team);
let NUMHID=false;
function cloudSet(team){
  const s=new Set(),n=NB(team);
  if(n){const r=n.sz>0?2:1;for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)if(onBoard(n.x+dx,n.y+dy))s.add((n.x+dx)+","+(n.y+dy))}
  CZ.pc.forEach(c=>{if(c[2]===team)s.add(c[0]+","+c[1])});
  return s;
}
function rainSet(){   // every cell that is raining right now (for drawing)
  const s=new Set();
  CZ.rz.forEach(z=>{for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(onBoard(z.x+dx,z.y+dy))s.add((z.x+dx)+","+(z.y+dy))});
  [0,1].forEach(t=>{const n=NB(t);if(n&&n.sz>0)cloudSet(t).forEach(k=>s.add(k))});
  return s;
}
// cells a Nimbora skill can be aimed at
function cellsFor(u,s){
  const r=[],cs=cloudSet(u.team);
  for(let x=0;x<10;x++)for(let y=0;y<10;y++){
    const d=Math.max(Math.abs(x-u.x),Math.abs(y-u.y)),k=x+","+y;
    if(s.k==="n"){if(d<=s.r&&cs.has(k))r.push([x,y])}
    else if(s.k==="N"){if(cs.has(k))r.push([x,y])}
    else if(s.k==="z"){if(d<=s.r&&!CZ.pc.some(c=>c[2]===u.team&&c[0]===x&&c[1]===y))r.push([x,y])}
    else if(s.k==="c"){if(d>=1&&d<=s.r&&cs.has(k)&&open(u,x,y))r.push([x,y])}
    else if(s.k==="H"){if(!at(x,y)&&WF.some(f=>f[2]===u.team&&f[0]===x&&f[1]===y))r.push([x,y])}
  }
  return r;
}
// Lightning Strike: dark cloud, bolt on t (9 magic, ground tag), 40% chain 8 to another enemy, then 20% chain 7 (chains ignore the ground tag)
function strike(src,t,dl=0){
  const keep=FXLAG,fx0=t.x,fy0=t.y;
  addFx({type:"nstrike",x:fx0,y:fy0,dl});
  FXLAG=dl+660;
  let ok=hurt(src,t,STRIKE,9);
  FXLAG=keep;
  let from={x:fx0,y:fy0};const hit=[t];
  for(let i=0;ok&&i<2&&over<0;i++){
    if(Math.random()>=(i?.2:.4))break;
    const cs=U.filter(e=>e.team!==src.team&&!hit.includes(e)&&targetable(e)&&canHit(CHAIN_S,e));
    if(!cs.length)break;
    const z=rnd(cs),d2=dl+660+(i+1)*420;hit.push(z);
    addFx({type:"lightning",x:from.x,y:from.y,x2:z.x,y2:z.y,dl:d2-220});
    FXLAG=d2;ok=hurt(src,z,CHAIN_S,i?7:8);FXLAG=keep;
    from={x:z.x,y:z.y};
  }
}
// a bolt onto a cell: it only hurts an enemy standing there, but it is always drawn
function boltAt(src,x,y,dl){
  const e=at(x,y);
  if(e&&e.team!==src.team&&targetable(e)&&canHit(STRIKE,e))strike(src,e,dl);
  else addFx({type:"nstrike",x,y,x2:x,y2:y,dl});
}
// Lightning Field (Super Zone): bolt on the chosen cloud cell, a second bolt on a random enemy within 3 of it, 30% for one more bolt on a random cell within 3
function lightningField(u,tx,ty){
  boltAt(u,tx,ty,0);
  if(over<0){
    const c=U.filter(e=>e.team!==u.team&&targetable(e)&&canHit(STRIKE,e)&&Math.max(Math.abs(e.x-tx),Math.abs(e.y-ty))<=3&&!(e.x===tx&&e.y===ty));
    if(c.length)strike(u,rnd(c),760);
  }
  if(over<0&&Math.random()<.3){
    const cells=[];for(let x=tx-3;x<=tx+3;x++)for(let y=ty-3;y<=ty+3;y++)if(onBoard(x,y))cells.push([x,y]);
    const c=rnd(cells);boltAt(u,c[0],c[1],1520);
  }
}
// Start of the Nimbora owner's turn: rain on the rain zones (once) and, during Super Zone, on every cloud cell.
function rain(u){
  const team=u.team,area=new Set();
  CZ.rz.filter(z=>z.team===team).forEach(z=>{for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(onBoard(z.x+dx,z.y+dy))area.add((z.x+dx)+","+(z.y+dy))});
  CZ.rz=CZ.rz.filter(z=>z.team!==team);
  if(u.sz>0)cloudSet(team).forEach(k=>area.add(k));
  if(!area.size)return;
  addFx({type:"rain",cells:[...area].map(k=>k.split(",").map(Number))});
  const inA=e=>area.has(e.x+","+e.y),keep=FXLAG;FXLAG=520;
  U.slice().forEach(e=>{
    if(!U.includes(e)||over>=0||!inA(e)||e.st.freeze>0)return;
    if(e.team===team){const amt=2+Math.floor(Math.random()*2);NUMHID=e.ww>0;heal(e,amt,false);NUMHID=false}
    else if(!(e.ww>0))hurt(u,e,{...RAINS,d:3},3);
  });
  if(over<0&&Math.random()<.2){
    const c=U.filter(e=>e.team!==team&&inA(e)&&targetable(e)&&canHit(STRIKE,e));
    if(c.length)strike(u,rnd(c),900);
  }
  FXLAG=keep;
}

