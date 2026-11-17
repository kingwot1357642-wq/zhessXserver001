/* ---------- render ---------- */
function render(){
  const meTeam=onlineGame?onlineMyTeam:0,enemyTeam=1-meTeam;
  const vis=U.filter(u=>!hidden(u)),me=vis.filter(u=>u.team===meTeam),en=vis.filter(u=>u.team===enemyTeam),u=sel?byId(sel):null;
  const mv=u&&mode<0?moves(u):[];
  const sk=u&&mode>=0?eff(u,mode):null;if(!(sk&&sk.k==="W"))PW=[];
  const tg=sk&&["t","p","h","r","L","g","X","B"].includes(sk.k)?targetsFor(u,mode):[];
  const mc=sk&&["m","j"].includes(sk.k)?mcells(u,sk):sk&&sk.k==="q"?lineCells(u,sk):sk&&["n","N","z","c","H"].includes(sk.k)?cellsFor(u,sk):sk&&sk.k==="W"?cellsW(u).filter(c=>!PW.some(q=>q[0]===c[0]&&q[1]===c[1])):[];
  const rows=a=>a.map(x=>`<div class="row ${x.team!==meTeam?"e":""} ${sel===x.id?"s":""}" data-r="${x.id}">${shape(x.k,x.team!==meTeam?1:0)}<div class="bar"><i style="width:${Math.max(0,x.hp)/MHP(x)*100}%"></i></div><small>${x.hp}</small></div>`).join("");
  let cells="";const wm0=wfSet(meTeam),we0=wfSet(1-meTeam),wtype=(vx,vy)=>{if(vx<0||vy<0||vx>9||vy>9)return"";const X=onlineGame&&meTeam===1?9-vx:vx,Y=onlineGame&&meTeam===1?9-vy:vy,k=X+","+Y;return wm0.has(k)?"wm":we0.has(k)?"we":""};const cm0=cloudSet(meTeam),ce0=cloudSet(1-meTeam),rnS=rainSet();WCELLS=[];const ctype=(vx,vy)=>{if(vx<0||vy<0||vx>9||vy>9)return"";const X=onlineGame&&meTeam===1?9-vx:vx,Y=onlineGame&&meTeam===1?9-vy:vy,k=X+","+Y;return cm0.has(k)?"cm":ce0.has(k)?"ce":""};
  for(let vy=0;vy<10;vy++)for(let vx=0;vx<10;vx++){
    const x=onlineGame&&meTeam===1?9-vx:vx,y=onlineGame&&meTeam===1?9-vy:vy;
    const p0=at(x,y),p=p0&&!hidden(p0)?p0:null,isMv=mv.some(m=>m[0]===x&&m[1]===y);
    const cl=p&&tg.includes(p)?(p.team===meTeam?"al":"at"):"";
    const kk=x+","+y,ct=ctype(vx,vy),zc=ct+(ct?(ctype(vx,vy-1)!==ct?" bt":"")+(ctype(vx+1,vy)!==ct?" br":"")+(ctype(vx,vy+1)!==ct?" bb":"")+(ctype(vx-1,vy)!==ct?" bl":""):"")+(rnS.has(kk)?" rn":"");if(cm0.has(kk)||ce0.has(kk))WCELLS.push([vx,vy]);
    let inner="";const wt=wtype(vx,vy);if(wt)inner=`<i class="wf ${wt}${wtype(vx,vy-1)!==wt?" bt":""}${wtype(vx+1,vy)!==wt?" br":""}${wtype(vx,vy+1)!==wt?" bb":""}${wtype(vx-1,vy)!==wt?" bl":""}"></i>`;
    if(p){
      const ex=[p.team===meTeam&&p.ww>0?"ghost":"",p.fly>0?"fly":"",p.aura>0?"aura":"",p.sz>0?"sz":"",p.soul?"sl":"",p.st.freeze>0?"frz":""].join(" "),ic=icons(p);
      inner+=shape(p.k,p.team!==meTeam?1:0,ex)+`<div class="hb"><i style="width:${Math.max(0,p.hp)/MHP(p)*100}%"></i></div>${p.sh?`<span class="sb">${p.sh}</span>`:""}${ic?`<span class="stb">${ic}</span>`:""}`;
    }
    cells+=`<div class="cell ${(vx+vy)%2?"k":""} ${isMv?"mv":""} ${mc.some(c=>c[0]===x&&c[1]===y)?"mc":""} ${sk&&(sk.k==="a"||sk.k==="o")?"am":""} ${cl} ${zc} ${p&&p.id===sel?"sel":""}" data-x="${x}" data-y="${y}">${inner}</div>`;
  }
  let panel=`<div class="mu" style="text-align:center;margin-top:30%">แตะตัวหมากของคุณ<br>เพื่อดูข้อมูลและสกิล</div>`;
  if(u&&u.team===meTeam){
    const d=R[u.k],ic=icons(u),stx=[ic,u.ww>0?"Wind-Walk":"",u.fly>0?ICON("wing")+" บิน":"",u.awk>0?ICON("awaken")+" Awakening "+(u.awk-1)+" เทิร์น":"",u.sz>0?ICON("overload")+" Super Zone เหลืออีก "+(u.sz-1)+" เทิร์น":"",u.soul?ICON("puppet")+" เชื่อมวิญญาณ":"",u.k==="scarecrowd"?ICON("puppet")+" Puppet เหลือ "+(3-(u.pu||0))+" ครั้ง":"",d.pf&&!(u.fly>0)?"ลงพื้น (โดนระยะไกลไม่ได้)":"",u.aura?"ออร่าเหลือ "+u.aura+" ครั้ง":""].filter(Boolean).join(" ");
    let skills="";
    if(u.st.silent>0)skills=`<div class="ps" style="font-size:1.1em;text-align:center">${ICON("silent")} ถูกใบ้</div>`;
    else skills=d.s.map((s0,i)=>{const sk0=eff(u,i);return `<button class="sk ${mode===i?"on":""}" data-s="${i}" ${usable(u,i)?"":"disabled"}><span class="i">${ICON(sk0.i)}</span><span><b>${sk0.n}</b><small>${u.cd[i]>0?"cooldown "+u.cd[i]:info(sk0)}</small>${sk0.x&&u.cd[i]<1?`<small>${sk0.x}</small>`:""}${sk0.tags?`<small class="tg">${sk0.tags.map(g=>TAGN[g]||g).join(" · ")}</small>`:""}</span></button>`}).join("");
    panel=`<div class="por">${shape(u.k,0)}<div><div class="nm">${d.n}</div><small class="mu">${RAR[d.rar]} · Pop ${d.pop}</small></div></div>
    <div class="hp">${ICON("heart")}<div class="bar" style="flex:1"><i style="width:${u.hp/MHP(u)*100}%"></i></div><b>${u.hp}/${MHP(u)}</b></div>
    ${u.sh?`<div class="ps">${ICON("shield")} โล่ ${u.sh}</div>`:""}${stx?`<div class="ps">สถานะ: ${stx}</div>`:""}
    ${dis(u)?`<div class="ps">ใช้ตัวนี้ไม่ได้ในตานี้</div>`:""}
    ${d.pas?`<div class="ps">✦ ${d.pas}</div>`:""}<hr>${skills}
    <div class="mu" style="font-size:.8em">แตะช่องฟ้าเพื่อเดิน (หัก MP 1) · ใช้สกิลหัก AP 1</div>`;
  }else if(u&&!hidden(u)){
    panel=`<div class="por">${shape(u.k,1)}<div class="nm">${R[u.k].n}</div></div><hr><div class="mu" style="text-align:center">ข้อมูลของฝ่ายตรงข้าม</div>`;
  }
  if(over>=0)lastTurnSeen=-1;
  else if(turn!==lastTurnSeen){
    lastTurnSeen=turn;turnDeadline=Date.now()+TURN_SECONDS*1000;
    if(turn===meTeam)showBanner("ถึงตาของคุณแล้ว!");
  }
  const turnLabel=over>=0?"จบเกม":turn===meTeam?"ตาของคุณ":"ตาฝ่ายตรงข้าม";
  const leftNow=Math.max(0,Math.ceil((turnDeadline-Date.now())/1000));
  const endBtns=onlineGame
    ?`<button class="m" id="again" ${onlineRematchSent?"disabled":""}>${onlineRematchSent?"รออีกฝ่ายตอบรับ...":onlineRematchOpp?"อีกฝ่ายขอเล่นอีกครั้ง · กดเพื่อรับ":"เล่นอีกครั้ง"}</button><button class="m" id="leave" style="background:var(--sf2);color:var(--tx)">ออกจากห้อง</button>`
    :`<button class="m" id="again">กลับหน้าเลือกตัวละคร</button>`;
  $("g").innerHTML=`<div class="col left"><div class="mu">ฝ่ายคุณ</div>${rows(me)}<hr><div class="mu">ฝ่ายตรงข้าม</div>${rows(en)}</div>
  <div class="mid"><div class="top"><b>${turnLabel}</b><span>MP ${P[turn].mp}/2 · AP ${P[turn].ap}/2</span><span class="tt ${leftNow<=10?"low":""}" id="tt">${over>=0||(!onlineGame&&turn===1)?"":leftNow+" วิ"}</span><span class="msg">${esc(msg)}</span><button class="m" id="et" ${turn!==meTeam||over>=0?"disabled":""}>จบเทิร์น</button></div>
  <div class="bw"><div class="bwrap"><div class="board" id="bd">${cells}</div>${ambHTML()}${WCELLS.length?'<div class="wisps"><i class="wp" id="wp0"></i><i class="wp" id="wp1"></i></div>':""}<div class="fxl">${vxHTML()}${fxHTML()}</div>${over>=0?`<div class="ov"><div style="font-size:2.2em">${over===meTeam?ICON("trophy")+" คุณชนะ!":ICON("skull")+" ฝ่ายตรงข้ามชนะ"}</div>${endBtns}</div>`:""}</div></div></div>
  <div class="col right">${panel}</div>`;
  $("g").querySelectorAll("[data-r]").forEach(r=>r.onclick=()=>choose(+r.dataset.r));
  $("g").querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{
    const si=+b.dataset.s,ss=eff(u,si);
    if(["s","w","f","v","x"].includes(ss.k)){cast(u,si);mode=-1;render();broadcastGameState();}else mode=mode===si?-1:si;
    render();
  });
  $("bd").onclick=e=>{const c=e.target.closest(".cell");if(c)cellClick(+c.dataset.x,+c.dataset.y)};
  $("et").onclick=()=>{if(turn===meTeam&&over<0)begin(1-meTeam)};
  const ag=$("again");if(ag)ag.onclick=()=>{
    if(onlineGame){if(onlineRematchSent||!onlineSocket?.connected)return;onlineRematchSent=true;onlineSocket.emit("request_rematch",{roomCode:onlineRoom});render();}
    else{pick=[];setup();}
  };
  const lv=$("leave");if(lv)lv.onclick=()=>{if(onlineSocket?.connected)onlineSocket.emit("leave_room");backToLobby("",false);};
}

function choose(id){sel=id;mode=-1;render()}
function cellClick(x,y){
  if(over>=0||turn!==(onlineGame?onlineMyTeam:0))return;
  const u=sel?byId(sel):null,p0=at(x,y),p=p0&&!hidden(p0)?p0:null,meTeam=onlineGame?onlineMyTeam:0;
  if(u&&u.team===meTeam){
    if(mode>=0){
      const s=eff(u,mode);
      if(usable(u,mode)){
        if(s.k==="W"&&cellsW(u).some(c=>c[0]===x&&c[1]===y)&&!PW.some(q=>q[0]===x&&q[1]===y)){
          const left=cellsW(u).filter(c=>!(c[0]===x&&c[1]===y)&&!PW.some(q=>q[0]===c[0]&&q[1]===c[1]));
          if(PW.length>=1||!left.length){const prev=PW;PW=[];cast(u,mode,x,y,prev);mode=-1;render();broadcastGameState();return}
          PW.push([x,y]);render();return;
        }
        const ok=s.k==="a"||s.k==="o"||(["m","j"].includes(s.k)&&mcells(u,s).some(c=>c[0]===x&&c[1]===y))||(s.k==="q"&&lineCells(u,s).some(c=>c[0]===x&&c[1]===y))||(["n","N","z","c","H"].includes(s.k)&&cellsFor(u,s).some(c=>c[0]===x&&c[1]===y))||(p&&targetsFor(u,mode).includes(p));
        if(ok){cast(u,mode,x,y);mode=-1;render();broadcastGameState();return}
      }
    }else if(moves(u).some(m=>m[0]===x&&m[1]===y)){enter(u,x,y);payMove(u);render();broadcastGameState();return}
  }
  if(p)return choose(p.id);
  sel=null;mode=-1;render();
}

