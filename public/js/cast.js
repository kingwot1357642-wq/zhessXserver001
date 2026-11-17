function cast(u,si,tx,ty,extra){
  const s=eff(u,si),T=at(tx,ty);
  if(s.mpc)P[u.team].mp-=s.mpc;else if(s.k==="m")P[u.team].mp--;else P[u.team].ap-=(s.cost!==undefined?s.cost:1);
  u.cd[si]=(s.k==="w"||s.k==="f"||s.k==="v"||s.k==="o"||s.k==="x")?0:s.cd;
  FXLAG=FXH[s.v]||0;
  if(s.k==="t"){
    showFx(u,s,T);
    const ok=hurt(u,T,s,s.d);
    if(ok&&s.ls&&U.includes(u))heal(u,s.ls,false);
    if(s.chain&&over<0){
      const cs=U.filter(e=>e.team!==u.team&&e!==T&&targetable(e));
      if(cs.length){
        const m=Math.min(...cs.map(e=>dist(T,e))),c=cs.filter(e=>dist(T,e)===m),z=c[Math.floor(Math.random()*c.length)];
        FXLAG=(FXH.lightning||0)+380;
        addFx({type:"lightning",x:T.x,y:T.y,x2:z.x,y2:z.y,dl:380});hurt(u,z,s,s.d);
      }
    }
    // status effects only land when the hit itself landed (not parried, not blocked)
    if(ok&&U.includes(T)){
      if(s.bleed)T.st.bleed=Math.max(T.st.bleed,s.bleed);
      if(s.bleedB&&isBeast(T))T.st.bleed=Math.max(T.st.bleed,s.bleedB);
      if(s.burn)T.st.burn+=s.burn;
      if(s.stunP&&Math.random()<s.stunP-(R[T.k].stunRes||0))T.st.stun=Math.max(T.st.stun,s.stun||1);
    }
    if(s.xww)exitWW(u);
  }else if(s.k==="L"){
    const pc=pushCell(u,T),ox=T.x,oy=T.y;
    addFx({type:"leap",x:u.x,y:u.y,x2:ox,y2:oy,px:pc[0],py:pc[1]});
    T.x=pc[0];T.y=pc[1];u.x=ox;u.y=oy;
    const ok=hurt(u,T,s,s.d);
    if(ok&&U.includes(T))T.st.stun=Math.max(T.st.stun,s.stun||1);
  }else if(s.k==="j"){
    addFx({type:"asteroid",x:u.x,y:u.y,x2:tx,y2:ty});
    enter(u,tx,ty,1250);
    if(U.includes(u))ADJ.forEach(d=>{const t=at(tx+d[0],ty+d[1]);if(t&&t.team!==u.team&&over<0)hurt(u,t,s,s.d)});
  }else if(s.k==="a"){
    const cs=CR.map(d=>[tx+d[0],ty+d[1]]).filter(c=>c[0]>=0&&c[1]>=0&&c[0]<10&&c[1]<10);
    addFx({type:"meteor",x:tx,y:ty,cells:cs});
    cs.forEach(c=>{const t=at(c[0],c[1]);if(t&&over<0)hurt(u,t,s,s.d)});
  }else if(s.k==="s"){u.sh+=s.sh;u.aura=2;tick(u,s)}
  else if(s.k==="h"){addFx({type:"rejuv",x:u.x,y:u.y,x2:T.x,y2:T.y});heal(T,s.heal,true);msg=R[u.k].n+" ฟื้นฟู "+R[T.k].n}
  else if(s.k==="r"){addFx({type:"light",x:u.x,y:u.y,x2:T.x,y2:T.y});heal(T,s.heal,false);T.st.regen={left:2,amt:s.heal};msg=R[u.k].n+" ใช้ "+s.n+" กับ "+R[T.k].n}
  else if(s.k==="p"){
    const ally=T.team===u.team;
    addFx({type:"potion",x:u.x,y:u.y,x2:T.x,y2:T.y,ally:ally?1:0});
    if(ally){T.st.regen={left:2,amt:3};msg=R[u.k].n+" ให้ยาฟื้นฟู "+R[T.k].n}
    else{T.st.poison++;msg=R[u.k].n+" ทำให้ "+R[T.k].n+" ติดพิษ"}
  }else if(s.k==="m"){
    // A unit that is invisible must not reveal where it went to the opponent.
    const H=u.ww>0?{hid:1,team:u.team}:{};
    addFx({type:s.tp?"tele":"dash",x:u.x,y:u.y,x2:tx,y2:ty,...H});
    enter(u,tx,ty,s.tp?650:450);if(s.tp&&U.includes(u))u.tpUsed=true;
  }else if(s.k==="q"){
    const dx=Math.sign(tx-u.x),dy=Math.sign(ty-u.y),cs=[];
    for(let i=1;i<=s.r;i++){const cx=u.x+dx*i,cy=u.y+dy*i;if(cx<0||cy<0||cx>9||cy>9)break;cs.push([cx,cy])}
    const last=cs[cs.length-1]||[u.x,u.y];
    addFx({type:"qislash",x:u.x,y:u.y,x2:last[0],y2:last[1],cells:cs});
    msg=R[u.k].n+" ใช้ "+s.n;
    cs.forEach(c=>{const t=at(c[0],c[1]);if(t&&t.team!==u.team&&over<0)hurt(u,t,s,s.d)});
  }else if(s.k==="g"){
    addFx({type:"bubble",x:u.x,y:u.y,x2:T.x,y2:T.y});
    T.sh+=s.sh;
    msg=R[u.k].n+" ใช้ "+s.n+(T===u?"":" ให้ "+R[T.k].n)+" · โล่ +"+s.sh+" แต่ติดใบ้";
  }else if(s.k==="o"){
    const v={id:nid++,owner:u.id,team:u.team,x:tx,y:ty,left:5,hit:{}};
    VX.push(v);msg=R[u.k].n+" สร้างวังวน (Whirlpool)";
    pullVortex(v);
  }else if(s.k==="W"){
    const cs=[...(extra||[]),[tx,ty]];
    plantWF(u.team,cs);msg=R[u.k].n+" ปลูก Wheat Field "+cs.length+" ช่อง";
  }else if(s.k==="H"){
    const own=WF.filter(f=>f[2]===u.team),ch=own.find(f=>f[0]===tx&&f[1]===ty);
    const rm=[ch,...own.filter(f=>f!==ch).sort(()=>Math.random()-.5).slice(0,3)];
    WF=WF.filter(f=>!rm.includes(f));
    const z=mk("scarecrow",u.team,tx,ty);z.fm=1;z.ss=1;U.push(z);
    addFx({type:"strawup",x:tx,y:ty});
    const rest=rm.slice(1).map(f=>[f[0],f[1]]);if(rest.length)addFx({type:"wheatout",cells:rest,dl:250});
    msg=R[u.k].n+" สร้าง Scarecrow · สลาย Wheat Field "+rm.length+" ช่อง";
  }else if(s.k==="X"){
    const ox=u.x,oy=u.y;addFx({type:"swapx",x:ox,y:oy,x2:T.x,y2:T.y});
    u.x=T.x;u.y=T.y;T.x=ox;T.y=oy;msg=R[u.k].n+" สลับที่กับ Scarecrow (Scarecrow Mirage)";
  }else if(s.k==="B"){
    T.soul=1;u.pu=(u.pu||0)+1;addFx({type:"soulbind",x:u.x,y:u.y,x2:T.x,y2:T.y});
    msg=R[u.k].n+" ผูกวิญญาณ "+R[T.k].n+" (Scarecrow Puppet "+u.pu+"/1)";
  }else if(s.k==="n"){
    CZ.rz.push({id:nid++,team:u.team,x:tx,y:ty});
    addFx({type:"nimbus",x:u.x,y:u.y,x2:tx,y2:ty});msg=R[u.k].n+" สร้างโซนฝน (Nimbocumulus)";
  }else if(s.k==="N"){
    msg=R[u.k].n+" ใช้ Lightning Field";lightningField(u,tx,ty);
  }else if(s.k==="z"){
    CZ.pc.push([tx,ty,u.team]);u.zs=(u.zs||0)+1;
    addFx({type:"cloudup",x:tx,y:ty});msg=R[u.k].n+" สร้างโซนเมฆถาวร (ชั้น "+u.zs+")";
  }else if(s.k==="c"){
    addFx({type:"cdash",x:u.x,y:u.y,x2:tx,y2:ty});enter(u,tx,ty,450);msg=R[u.k].n+" พุ่งผ่านเมฆ (Cloud Dash)";
  }else if(s.k==="x"){
    u.sz=5;addFx({type:"overload",x:u.x,y:u.y});msg=R[u.k].n+" เข้าสู่ Super Zone (Overload)";
  }else if(s.k==="v"){u.awk=4;addFx({type:"awaken",x:u.x,y:u.y});msg=R[u.k].n+" ปลุกพลัง (Awakening)"}
  else if(s.k==="w"){u.ww=4;addFx({type:"smoke",x:u.x,y:u.y});msg=R[u.k].n+" หายตัว (Wind-Walk)"}
  else if(s.k==="f"){u.fly=4;addFx({type:"swirl",x:u.x,y:u.y});msg=R[u.k].n+" ขึ้นบิน"}
  // a permanently flying unit lands after using any skill, until its own next turn
  if(R[u.k].pf&&u.fly>0&&U.includes(u)){u.fly=0;addFx({type:"smoke",x:u.x,y:u.y,sz:.6,dl:s.k==="j"?1300:350})}
  FXLAG=0;
}

