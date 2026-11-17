/* ---------- bot ---------- */
function bot(){
  (function step(){
    if(over>=0)return;
    if(!botAct())return begin(0);
    render();setTimeout(step,750);
  })();
}
function botAct(){
  const mine=U.filter(u=>u.team===1),foes=U.filter(u=>u.team===0&&targetable(u));
  if(!mine.length||!U.some(u=>u.team===0))return false;
  const p=P[1];
  if(p.ap>0||p.mp>0){
    let best=null;
    const cand=(u,si,x,y,sc,ex)=>{if(!best||sc>best.sc)best={u,si,x,y,sc,ex}};
    mine.forEach(u=>R[u.k].s.forEach((s0,si)=>{
      if(!usable(u,si))return;
      const s=eff(u,si);
      if(s.k==="t")targetsFor(u,si).forEach(t=>cand(u,si,t.x,t.y,s.d+(t.hp<=s.d?20:0)+(s.chain?3:0)));
      else if(s.k==="a"){
        for(let x=0;x<10;x++)for(let y=0;y<10;y++){
          let sc=0;
          CR.forEach(d=>{const t=at(x+d[0],y+d[1]);if(t&&!(t.team===0&&t.ww>0))sc+=t.team===0?s.d+(t.hp<=s.d?15:0):-s.d-5});
          if(sc>5)cand(u,si,x,y,sc);
        }
      }else if(s.k==="s"){const n=foes.filter(e=>dist(u,e)===1).length;if(n)cand(u,si,0,0,s.d*n+3)}
      else if(s.k==="L")targetsFor(u,si).forEach(t=>cand(u,si,t.x,t.y,s.d+(t.hp<=s.d?20:0)+2));
      else if(s.k==="q")ADJ.forEach(d=>{
        let sc=0;
        for(let i=1;i<=s.r;i++){const t=at(u.x+d[0]*i,u.y+d[1]*i);if(t&&t.team===0&&!(t.ww>0)&&canHit(s,t))sc+=s.d+(t.hp<=s.d?15:0)}
        if(sc>0)cand(u,si,u.x+d[0],u.y+d[1],sc);
      });
      else if(s.k==="v"){if(foes.some(e=>dist(u,e)<=3))cand(u,si,0,0,4)}
      else if(s.k==="o"){
        for(let x=0;x<10;x++)for(let y=0;y<10;y++){
          const n=foes.filter(e=>Math.max(Math.abs(e.x-x),Math.abs(e.y-y))<=2&&canHit(s,e)).length;
          if(n>=2)cand(u,si,x,y,n*4);
        }
      }
      else if(s.k==="j")mcells(u,s).forEach(c=>{let sc=0;ADJ.forEach(d=>{const t=at(c[0]+d[0],c[1]+d[1]);if(t&&t.team===0&&!(t.fly>0))sc+=s.d});if(sc>0)cand(u,si,c[0],c[1],sc)});
      else if(s.k==="h")targetsFor(u,si).forEach(t=>{const miss=MHP(t)-t.hp;if(miss>=4)cand(u,si,t.x,t.y,Math.min(s.heal,miss)+(t.hp<MHP(t)/2?4:0))});
      else if(s.k==="r")targetsFor(u,si).forEach(t=>{if(MHP(t)-t.hp>=10)cand(u,si,t.x,t.y,7)});
      else if(s.k==="p")targetsFor(u,si).forEach(t=>{if(t.team===0)cand(u,si,t.x,t.y,3+t.st.poison)});
      else if(s.k==="n")cellsFor(u,s).forEach(c=>{let sc=0;const nr=e=>Math.max(Math.abs(e.x-c[0]),Math.abs(e.y-c[1]))<=1;foes.forEach(e=>{if(nr(e))sc+=4});mine.forEach(a=>{if(nr(a)&&MHP(a)-a.hp>=2)sc+=2});if(sc>=4)cand(u,si,c[0],c[1],sc)});
      else if(s.k==="N")cellsFor(u,s).forEach(c=>{const n=foes.filter(e=>Math.max(Math.abs(e.x-c[0]),Math.abs(e.y-c[1]))<=3&&canHit(STRIKE,e)).length;if(n)cand(u,si,c[0],c[1],6+n*2)});
      else if(s.k==="z"){let b=null;cellsFor(u,s).forEach(c=>{const g=foes.length?Math.min(...foes.map(e=>Math.hypot(e.x-c[0],e.y-c[1]))):9;if(!b||g<b.g)b={c,g}});if(b)cand(u,si,b.c[0],b.c[1],1)}
      else if(s.k==="x"){if(foes.some(e=>dist(u,e)<=5))cand(u,si,0,0,5)}
      else if(s.k==="W"){const c=cellsW(u);if(c.length){const a=rnd(c),b=c.filter(q=>q!==a);cand(u,si,a[0],a[1],1.5,b.length?[rnd(b)]:[])}}
      else if(s.k==="H"){cellsFor(u,s).forEach(c=>cand(u,si,c[0],c[1],7-(foes.length?Math.min(...foes.map(e=>dist({x:c[0],y:c[1]},e))):9)*.1))}
      else if(s.k==="X"){if(u.hp<MHP(u)*.5&&foes.length){const nd=q=>Math.min(...foes.map(e=>dist(q,e)));const z=targetsFor(u,si).sort((a,b)=>nd(b)-nd(a))[0];if(z&&nd(z)>nd(u))cand(u,si,z.x,z.y,6)}}
      else if(s.k==="B"){if(!mine.some(m=>m.soul)&&scarecrowCount(1)>0){const z=targetsFor(u,si).sort((a,b)=>MHP(b)-MHP(a))[0];if(z)cand(u,si,z.x,z.y,4)}}
    }));
    if(best){cast(best.u,best.si,best.x,best.y,best.ex);return true}
  }
  if((p.mp>0||mine.some(x=>R[x.k].freeMove&&!x.fm))&&foes.length){
    let b=null;
    const nd=(x,y)=>Math.min(...foes.map(e=>Math.hypot(e.x-x,e.y-y)));
    mine.forEach(u=>{const cur=nd(u.x,u.y);moves(u).forEach(m=>{const g=cur-nd(m[0],m[1]);if(g>0.01&&(!b||g>b.g))b={u,m,g}})});
    if(b){enter(b.u,b.m[0],b.m[1]);payMove(b.u);return true}
  }
  return false;
}

