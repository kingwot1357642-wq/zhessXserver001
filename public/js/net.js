/* ---------- ONLINE LOBBY ---------- */
let onlineSocket = null;
let onlineRoom = null;
let onlinePlayer = 0;
let onlineReady = false;
let onlineStarted = false;
let onlineGame = false;
let onlineMyTeam = 0;
let onlinePicks = [[], []];
let onlineSubmitted = false;
let onlineRematchSent = false;
let onlineRematchOpp = false;
let onlineEverConnected = false;
let applyingRemoteState = false;

let roomUI=false;
function lobbyStatus(text){
  const el=document.getElementById("lobbyStatus");
  if(el) el.textContent=text;
}
// small popup used for "under development" and for messages
function showDev(title,text){
  document.getElementById("devTitle").textContent=title;
  document.getElementById("devText").textContent=text||"กำลังพัฒนา";
  document.getElementById("devModal").style.display="flex";
}
function showLobbyRoom(data){
  onlineRoom=data.roomCode;
  onlinePlayer=data.playerNumber;
  document.getElementById("roomCodeDisplay").textContent=onlineRoom;
  document.getElementById("joinModal").style.display="none";
  document.getElementById("roomModal").style.display="flex";
  updateLobbyPlayers(data.players || []);
}
// players = [slot1, slot2]; an empty slot is null. Also keeps the Ready button in sync with what the server knows.
function updateLobbyPlayers(players){
  const p1=players[0],p2=players[1];
  const label=p=>p?(p.ready?"พร้อม":"ยังไม่พร้อม"):"รอผู้เล่น";
  document.getElementById("p1State").textContent=label(p1);
  document.getElementById("p2State").textContent=label(p2);
  const mine=players[onlinePlayer-1];
  onlineReady=!!(mine&&mine.ready);
  const both=!!(p1&&p2),btn=document.getElementById("readyBtn");
  btn.disabled=!both||onlineReady;
  btn.textContent=!both?"รอผู้เล่นอีกฝ่าย":(p1.ready&&p2.ready)?"ทั้งสองฝ่ายพร้อม":onlineReady?"กำลังรออีกฝ่าย...":"พร้อม";
}
// Offline (bot) game: no lobby any more, straight into the setup screen.
function startBot(){
  onlineGame=false;onlineStarted=false;pick=[];U=[];over=-1;
  $("mainMenu").style.display="none";$("battlePage").style.display="none";
  setup();
}
// Leave the board / pick screens and go back to the Main menu (inRoom=true keeps the room popup open with its code).
function backToLobby(message,inRoom){
  onlineStarted=false;onlineGame=false;onlineSubmitted=false;onlineRematchSent=false;onlineRematchOpp=false;onlineReady=false;
  stopDeploy();
  U=[];over=-1;FX=[];fxOut=[];CZ={pc:[],rz:[]};WF=[];sel=null;mode=-1;msg="";pick=[];
  $("g").innerHTML="";$("su").style.display="none";
  $("battlePage").style.display="none";$("mainMenu").style.display="block";
  if(inRoom){
    $("roomCodeDisplay").textContent=onlineRoom||"------";
    updateLobbyPlayers([]);
    $("roomModal").style.display="flex";
    lobbyStatus(message||"");
  }else{
    onlineRoom=null;onlinePlayer=0;roomUI=false;
    $("roomModal").style.display="none";
    if(message)showDev("ZHESS X",message);
  }
}
function returnToBoardArena(){
  if(onlineStarted)return;
  onlineStarted=true;onlineGame=true;onlineMyTeam=onlinePlayer-1;pick=[];onlineSubmitted=false;onlineRematchSent=false;onlineRematchOpp=false;
  document.getElementById("roomModal").style.display="none";
  $("battlePage").style.display="none";$("mainMenu").style.display="none";
  setup();
}
// Sends the current snapshot plus the visual effects produced since the last snapshot.
function broadcastGameState(){
  if(!onlineGame||applyingRemoteState||!onlineSocket?.connected||!onlineRoom)return;
  onlineSocket.emit("game_state",{roomCode:onlineRoom,state:{U,P,turn,over,nid,msg,VX,CZ,WF,fx:fxOut}});
  fxOut=[];
}
function startOnlineGame(data){
  onlineGame=true;onlinePicks=data.picks;onlineMyTeam=onlinePlayer-1;U=[];over=-1;nid=1;msg="เกมเริ่มแล้ว";FX=[];fxOut=[];VX=[];CZ={pc:[],rz:[]};WF=[];sel=null;mode=-1;
  onlineRematchSent=false;onlineRematchOpp=false;
  stopDeploy();
  setArena(Number.isInteger(data.theme)?data.theme:0);resetTurnClock();msg="เกมเริ่มแล้ว · สนาม: "+ARENA[arena].n;
  for(let team=0;team<2;team++){
    const lay=data.layouts&&data.layouts[team];
    if(lay)lay.forEach(l=>U.push(mk(l.k,team,l.x,l.y)));
    else{const chosen=data.picks[team]||[],coords=spread(chosen.length);chosen.forEach((k,i)=>U.push(mk(k,team,coords[i],team===0?9:0)))}
  }
  $("su").style.display="none";
  // Both clients build the identical opening position, so neither needs to send it to the other.
  applyingRemoteState=true;
  try{begin(data.firstTurn===0?0:1)}finally{applyingRemoteState=false}
}
// Where the game server lives: "" = the same site (web version); the APK sets window.ZHESS_SERVER to the server address.
const SERVER_BASE=(window.ZHESS_SERVER||"").replace(/\/$/,"");
// Used by the Customs / Join buttons: online play needs a running server and an up-to-date app.
function onlineGate(){
  if(window.__outdated){showDev("UPDATE","ต้องอัปเดตแอปก่อนเล่นออนไลน์ ดูรายละเอียดในกล่องจดหมาย");return false}
  if(typeof serverReady==="function"&&!serverReady()){showDev("SERVER","กำลังเปิดเซิร์ฟเวอร์ ใช้เวลาประมาณ 1 นาที ลองใหม่อีกครั้งในอีกสักครู่");return false}
  return true;
}
function connectOnlineLobby(){
  if(onlineSocket)return;
  if(typeof io!=="function"){
    // socket.io's browser script comes from the game server itself (loaded once the server is awake)
    if(!window.__sioTry){
      window.__sioTry=true;
      const sc=document.createElement("script");
      sc.src=SERVER_BASE+"/socket.io/socket.io.js";
      sc.onload=()=>{window.__sioTry=false;connectOnlineLobby()};
      sc.onerror=()=>{window.__sioTry=false;lobbyStatus("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กำลังลองใหม่...");setTimeout(connectOnlineLobby,4000)};
      document.head.appendChild(sc);
    }
    return;
  }
  onlineSocket=io(SERVER_BASE||undefined,{query:{v:ZXCFG.version}});
  onlineSocket.on("connect",()=>{
    if(onlineEverConnected&&onlineRoom){
      // The server drops a player's room when the connection breaks, so the old room no longer exists.
      backToLobby("การเชื่อมต่อหลุด ห้องเดิมถูกปิดแล้ว กรุณาสร้างห้องใหม่หรือเข้าร่วมอีกครั้ง",false);
    }else lobbyStatus("เชื่อมต่อเซิร์ฟเวอร์แล้ว");
    onlineEverConnected=true;
  });
  onlineSocket.on("connect_error",err=>{if(err&&err.message==="outdated"){window.__outdated=true;lobbyStatus("ต้องอัปเดตแอปก่อนเล่นออนไลน์")}else lobbyStatus("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองรีเฟรชอีกครั้ง")});
  onlineSocket.on("room_created",data=>{
    if(!roomUI){onlineSocket.emit("leave_room");return}
    showLobbyRoom(data);
    lobbyStatus("สร้างห้องสำเร็จ ส่งรหัสนี้ให้อีกฝ่ายได้เลย");
  });
  onlineSocket.on("room_joined",data=>{
    if(!roomUI){onlineSocket.emit("leave_room");return}
    showLobbyRoom(data);
    lobbyStatus("เข้าห้องสำเร็จ");
  });
  onlineSocket.on("room_update",data=>{
    const ps=data.players||[];
    updateLobbyPlayers(ps);
    if(onlineStarted)return;
    const both=ps.length===2&&ps.every(p=>p);
    if(both&&ps.every(p=>p.ready)){
      lobbyStatus("ผู้เล่นทั้งสองฝ่ายพร้อมแล้ว! กำลังกลับเข้าสู่ Zhess X...");
      setTimeout(returnToBoardArena,700);
    }else{
      lobbyStatus(both?"รอผู้เล่นทั้งสองฝ่ายกดพร้อม...":"รอผู้เล่นอีกฝ่ายเข้าห้อง...");
    }
  });
  onlineSocket.on("deploy_start",data=>{
    lobbyStatus("เริ่มวางตัว!");
    deployStart(data.picks[onlineMyTeam]||[],onlineMyTeam,data.seconds||DEPLOY_SECONDS,layout=>{
      onlineSocket.emit("submit_deploy",{roomCode:onlineRoom,layout});
    });
  });
  onlineSocket.on("deploy_opponent_ready",()=>{if(DEP){DEP.oppReady=true;depDraw()}});
  onlineSocket.on("deploy_error",data=>{if(DEP){DEP.submitted=false;DEP.err=(data&&data.message)||"วางตัวไม่ถูกต้อง";depDraw()}});
  onlineSocket.on("game_start",data=>{lobbyStatus("เริ่มการแข่งขัน!");startOnlineGame(data);});
  onlineSocket.on("game_state",data=>{
    if(!onlineGame||!data?.state)return;
    applyingRemoteState=true;
    try{
      const st=data.state;
      U=st.U;P=st.P;turn=st.turn;over=st.over;nid=st.nid;VX=st.VX||[];CZ=st.CZ||{pc:[],rz:[]};WF=st.WF||[];msg=st.msg||"";sel=null;mode=-1;
      (st.fx||[]).forEach(f=>addFx(f));
      render();
    }finally{applyingRemoteState=false}
  });
  onlineSocket.on("rematch_requested",()=>{onlineRematchOpp=true;if(over>=0)render();});
  onlineSocket.on("rematch_start",()=>{
    stopDeploy();
    U=[];over=-1;FX=[];fxOut=[];CZ={pc:[],rz:[]};WF=[];sel=null;mode=-1;msg="";pick=[];
    onlineSubmitted=false;onlineRematchSent=false;onlineRematchOpp=false;
    $("g").innerHTML="";
    setup();
  });
  onlineSocket.on("room_error",data=>{
    const text=data.message||"เกิดข้อผิดพลาด";
    if(onlineStarted&&onlineSubmitted&&!U.length){onlineSubmitted=false;setup();$("pickWait").textContent=text;}
    else if(document.getElementById("joinModal").style.display==="flex")document.getElementById("joinErr").textContent=text;
    else lobbyStatus(text);
  });
  onlineSocket.on("player_left",()=>{
    if(onlineStarted)backToLobby("ผู้เล่นอีกฝ่ายออกจากห้อง กลับมารอที่ล็อบบี้ ส่งรหัสห้องให้คนใหม่ได้เลย",true);
    else lobbyStatus("ผู้เล่นอีกฝ่ายออกจากห้องแล้ว");
  });
  onlineSocket.on("disconnect",()=>lobbyStatus("การเชื่อมต่อขาดหาย กำลังเชื่อมต่อใหม่..."));
}
document.addEventListener("DOMContentLoaded",()=>{
  const mm=document.getElementById("mainMenu"),bp=document.getElementById("battlePage"),jm=document.getElementById("joinModal"),rm=document.getElementById("roomModal"),dm=document.getElementById("devModal");
  document.getElementById("mmOffline").onclick=startBot;
  document.getElementById("mmBattle").onclick=()=>{mm.style.display="none";bp.style.display="block"};
  document.getElementById("mmChars").onclick=()=>showDev("CHARACTERS");
  document.getElementById("bpBack").onclick=()=>{bp.style.display="none";mm.style.display="block"};
  document.getElementById("bpCampaign").onclick=()=>showDev("CAMPAIGN MODE");
  document.getElementById("bpArcade").onclick=()=>showDev("ARCADE MODE");
  document.getElementById("bpAI").onclick=startBot;
  document.getElementById("devOk").onclick=()=>{dm.style.display="none"};
  // Customs: popup with the room code, Ready and Cancel
  document.getElementById("bpCustoms").onclick=()=>{
    if(!onlineGate())return;
    roomUI=true;
    document.getElementById("roomCodeDisplay").textContent="------";
    updateLobbyPlayers([]);
    rm.style.display="flex";
    if(onlineSocket?.connected){lobbyStatus("กำลังสร้างห้อง...");onlineSocket.emit("create_room")}
    else lobbyStatus("ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์");
  };
  document.getElementById("roomCancel").onclick=()=>{
    if(onlineSocket?.connected)onlineSocket.emit("leave_room");
    onlineRoom=null;onlinePlayer=0;onlineReady=false;roomUI=false;
    rm.style.display="none";
  };
  document.getElementById("readyBtn").onclick=()=>{
    if(!onlineRoom||!onlineSocket?.connected)return;
    onlineSocket.emit("set_ready",{roomCode:onlineRoom});
    lobbyStatus("ส่งสถานะพร้อมแล้ว");
  };
  // Join: popup with the code field, JOIN button and an X to close
  document.getElementById("bpJoin").onclick=()=>{if(!onlineGate())return;const i=document.getElementById("joinCode");i.value="";document.getElementById("joinErr").textContent="";jm.style.display="flex";i.focus()};
  document.getElementById("joinX").onclick=()=>{jm.style.display="none";roomUI=false};
  const joinGo=()=>{
    const code=document.getElementById("joinCode").value.trim().toUpperCase(),err=document.getElementById("joinErr");
    if(code.length!==6){err.textContent="กรุณากรอกรหัสห้อง 6 ตัว";return}
    if(!onlineSocket?.connected){err.textContent="ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์";return}
    err.textContent="";roomUI=true;onlineSocket.emit("join_room",{roomCode:code});
  };
  document.getElementById("joinGo").onclick=joinGo;
  document.getElementById("joinCode").addEventListener("keydown",e=>{if(e.key==="Enter")joinGo()});
});

