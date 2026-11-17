/* ---------- The Scarecrow of Death: wheat fields, Scarecrows and the soul link ---------- */
// WF = wheat fields [x,y,team]. A field is only a floor condition (walkable, no effect). Every team has its own fields and they may overlap.
const MHP=u=>u.mhp||R[u.k].hp;                       // max HP (the soul link can lower it to 40)
const wfSet=team=>{const s=new Set();WF.forEach(f=>{if(f[2]===team)s.add(f[0]+","+f[1])});return s};
const scarecrowCount=team=>U.filter(x=>x.k==="scarecrow"&&x.team===team).length;
// free neighbour cells (distance 1, not the unit's own cell) that are not yet a wheat field of its team
function cellsW(u){
  const r=[];
  ADJ.forEach(d=>{const x=u.x+d[0],y=u.y+d[1];if(onBoard(x,y)&&!WF.some(f=>f[2]===u.team&&f[0]===x&&f[1]===y))r.push([x,y])});
  return r;
}
function plantWF(team,cells,dl=0){
  const add=cells.filter(c=>!WF.some(f=>f[2]===team&&f[0]===c[0]&&f[1]===c[1]));
  add.forEach(c=>WF.push([c[0],c[1],team]));
  if(add.length)addFx({type:"wheat",cells:add,dl});
  return add.length;
}
// a Scarecrow walks for free (once per turn); everybody else pays 1 MP
const payMove=u=>{if(R[u.k].freeMove)u.fm=1;else P[u.team].mp--};
// Scarecrow Puppet: a soul-linked unit that would die swaps with a random Scarecrow of its team instead,
// its max HP becomes 40, it is fully healed, every status is cleared and the link is removed.
function soulSave(t){
  const c=U.filter(e=>e.k==="scarecrow"&&e.team===t.team&&e!==t);
  if(!c.length)return false;
  const z=rnd(c),ox=t.x,oy=t.y;
  addFx({type:"soulsave",x:ox,y:oy,x2:z.x,y2:z.y,dl:FXLAG});
  t.x=z.x;t.y=z.y;z.x=ox;z.y=oy;
  if(t.awk>0){const v=R[t.k].s.findIndex(q=>q.k==="v");if(v>=0)t.cd[v]=R[t.k].s[v].cd}
  if(t.sz>0){const v=R[t.k].s.findIndex(q=>q.k==="x");if(v>=0)t.cd[v]=R[t.k].s[v].cd}
  t.mhp=40;t.hp=40;t.sh=0;
  t.st={poison:0,burn:0,bleed:0,stun:0,freeze:0,silent:0,regen:null};
  t.stunned=false;t.aura=0;t.ww=0;t.awk=0;t.sz=0;t.soul=0;if(!R[t.k].pf)t.fly=0;
  msg=R[t.k].n+" ถูกเชื่อมวิญญาณ สลับที่กับ Scarecrow · HP 40/40";
  return true;
}
