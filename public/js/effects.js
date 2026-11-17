/* ---------- visual effects (SVG, 10 units per board cell) ---------- */
let FXLAG=0;
const FXD={slash:1100,windArrow:1400,arrowRain:1700,fireball:1400,meteor:1900,aura:1400,blast:1200,rejuv:1600,light:1900,dagger:1000,daggerB:1200,dash:1100,tele:1300,smoke:1500,lightning:1200,strike:1300,potion:1700,swirl:1400,block:1100,hit:1100,tick:1100,num:1200};
// milliseconds until the visual "impact", used to delay damage/heal numbers
const FXH={slash:180,windArrow:560,arrowRain:1020,fireball:560,meteor:860,blast:200,dagger:120,daggerB:120,lightning:220,strike:180,potion:680,rejuv:480,light:250};
const K=(c,a,b,x="")=>`class="fa ${c}" style="--a:${a};--b:${b};${x}"`;
const rd=(f,i)=>{const s=Math.sin(((f.x||0)*7.1+(f.y||0)*13.7+(f.x2||0)*17.3+(f.y2||0)*19.1+i*31.7)*12.9898)*43758.5453;return s-Math.floor(s)};
const TR=(x,y,body,sc=1)=>`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})${sc!==1?` scale(${sc})`:""}">${body}</g>`;
const glow=(g,r,a,b)=>`<circle r="${r}" fill="url(#${g})" ${K("burst",a,b)}/>`;
const ring=(r,col,w,a,b)=>`<circle r="${r}" fill="none" stroke="${col}" stroke-width="${w}" ${K("pulse",a,b)}/>`;
const rays=(n,r0,r1,col,w,a,b,rot=0)=>{let s="";for(let i=0;i<n;i++){const t=rot+i*6.2832/n,c=Math.cos(t),d=Math.sin(t);s+=`<line x1="${(c*r0).toFixed(1)}" y1="${(d*r0).toFixed(1)}" x2="${(c*r1).toFixed(1)}" y2="${(d*r1).toFixed(1)}"/>`}return `<g stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${K("burst",a,b)}>${s}</g>`};
const proj=(x,y,x2,y2,body,a,b)=>{const dx=x2-x,dy=y2-y,L=Math.hypot(dx,dy),ang=Math.atan2(dy,dx)*180/Math.PI;return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><g ${K("shot",a,b,`--dx:${L.toFixed(1)};--dy:0;`)}>${body}</g></g>`};
const bits=(f,n,shape,a,b,spread,lift,seed=0,cls="rise")=>{let s="";for(let i=0;i<n;i++){const ox=(rd(f,i+seed)-.5)*spread,oy=(rd(f,i+seed+9)-.5)*spread*.6,dx=(rd(f,i+seed+3)-.5)*spread*.8;s+=`<g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)})"><g ${K(cls,(a+i*.04).toFixed(2),b,`--dx:${dx.toFixed(1)};--dy:${lift};`)}>${shape}</g></g>`}return s};
const zig=(f,x,y,x2,y2,seed=0,amp=2.4)=>{const L=Math.hypot(x2-x,y2-y)||1,n=Math.max(4,Math.round(L/4.5)),nx=-(y2-y)/L,ny=(x2-x)/L;let d=`M${x.toFixed(1)} ${y.toFixed(1)}`;for(let i=1;i<n;i++){const t=i/n,j=(rd(f,i+seed)-.5)*2*amp;d+=`L${(x+(x2-x)*t+nx*j).toFixed(1)} ${(y+(y2-y)*t+ny*j).toFixed(1)}`}return d+`L${x2.toFixed(1)} ${y2.toFixed(1)}`};
const FL="M0 -7C3 -3 5 -1 4 3C3 6 -3 6 -4 3C-5 0 -2 -2 0 -7Z";
const SHL="M0 -7L6 -4V2C6 6 3 8 0 10C-3 8 -6 6 -6 2V-4Z";
const ARW=`<ellipse cx="-4" rx="8" ry="2.6" fill="url(#fxGreen)"/><path d="M-9 0H4" stroke="#8a5a2b" stroke-width="1.2" stroke-linecap="round"/><path d="M4 -2.2L9.5 0L4 2.2Z" fill="#e8f0ff" stroke="#1a1626" stroke-width=".4"/><path d="M-9 0L-11 -2M-9 0L-11 2M-7 0L-9 -2M-7 0L-9 2" stroke="#6fd08a" stroke-width="1" stroke-linecap="round"/>`;
const S_EMBER=`<path d="${FL}" transform="scale(.4)" fill="#ff9a3c"/>`;
const S_LEAF=`<path d="M0 -3.6C2.8 -1.8 2.8 1.8 0 3.6C-2.8 1.8 -2.8 -1.8 0 -3.6Z" fill="url(#gLeaf)" stroke="#2f6b3a" stroke-width=".4"/>`;
const S_PLUS=`<path d="M-.8 -2.6H.8V-.8H2.6V.8H.8V2.6H-.8V.8H-2.6V-.8H-.8Z" fill="#d8ffd8"/>`;
const S_STAR=`<path d="${SP}" fill="#fff6c8"/>`;
const S_STARP=`<path d="${SP}" fill="#e6c8ff"/>`;
const S_BUB=`<circle r="1.3" fill="none" stroke="#d8ffd8" stroke-width=".5"/>`;
const S_DROP=`<path d="M0 -2.2C1.6 .2 2 1 2 1.6C2 2.8 1 3.4 0 3.4C-1 3.4 -2 2.8 -2 1.6C-2 1 -1.6 .2 0 -2.2Z" fill="#c01c2e"/>`;
const S_PBUB=`<circle r="1.4" fill="#9be04a" fill-opacity=".7" stroke="#2f6a14" stroke-width=".4"/>`;
const S_PCLOUD=`<circle r="4.5" fill="url(#fxPoison)"/>`;
const IMP=(col,grad,a,r=12,n=8)=>glow(grad,r,a,.35)+rays(n,3,r-1,col,1.2,a,.3)+ring(r*.55,col,1.2,a,.38);

const FXR={
slash:(f,x,y,x2,y2)=>TR(x2,y2,`<path pathLength="1" d="M-8 -8Q3 -3 8 8" fill="none" stroke="#7fb4ff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round" ${K("draw",.04,.5)}/><path pathLength="1" d="M-8 -8Q3 -3 8 8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" ${K("draw",.04,.5)}/>`+glow("fxWhite",10,.18,.5)+rays(6,2,9,"#cfe4ff",1,.2,.45)),
windArrow:(f,x,y,x2,y2)=>TR(x,y,glow("fxGreen",7,0,.25))+proj(x,y,x2,y2,ARW+`<path d="M-12 -2.4Q-16 -4.6 -20 -1.4M-12 2.4Q-17 4.6 -22 1.4" stroke="#bfe8ff" stroke-width=".9" fill="none" stroke-linecap="round"/>`,0,.4)+TR(x2,y2,IMP("#c8ffe0","fxGreen",.4,12,8)+bits(f,4,S_LEAF,.4,.5,10,-12)),
arrowRain:(f,x,y,x2,y2)=>TR(x,y,glow("fxGreen",8,0,.25))+TR(x2,y2,ring(8,"#ffd25a",1,0,.45)+ring(8,"#ffd25a",.8,.12,.45)+[0,1,2,3,4].map(i=>`<g transform="translate(${((i-2)*3.4).toFixed(1)} 0)"><g ${K("drop",(.06+i*.07).toFixed(2),.28,`--sx:${(i-2)*-2};--sy:-52;`)}><g transform="rotate(90)">${ARW}</g></g></g>`).join("")+IMP("#ffe27a","fxGold",.6,14,10)+ring(10,"#fff6c8",1.6,.6,.4)+bits(f,5,S_STAR,.6,.4,12,-10)),
fireball:(f,x,y,x2,y2)=>TR(x,y,glow("fxFire",8,0,.25))+proj(x,y,x2,y2,`<path d="M-3 0Q-11 -4 -19 0Q-11 4 -3 0Z" fill="#ff7a2a" fill-opacity=".8"/><path d="M-3 0Q-8 -2 -13 0Q-8 2 -3 0Z" fill="#ffe27a"/><circle r="5.8" fill="url(#fxFire)"/><circle r="2.4" fill="#fff6c8"/>`,0,.4)+TR(x2,y2,IMP("#ffb04a","fxFire",.4,18,10)+ring(11,"#ff5a2a",1.6,.42,.45)+bits(f,6,S_EMBER,.4,.55,14,-14)),
meteor:(f,x,y,x2,y2,V)=>{
  const cs=f.cells||[[f.x,f.y]];
  let s=TR(x,y,`<g ${K("drop",0,.45,"--sx:-42;--sy:-84;")}><path d="M-3 -1L-17 -34L2.5 -3Z" fill="#ff8a2a"/><path d="M-1.5 -1L-9 -22L1 -2Z" fill="#ffe27a"/><circle r="9" fill="url(#fxFire)"/><circle r="3.6" fill="#6a3424" stroke="#ff8a2a" stroke-width="1"/><circle cx="-1" cy="-1" r=".9" fill="#3a1c12"/></g>`);
  cs.forEach((c,i)=>{s+=TR(V(c[0])*10+5,V(c[1])*10+5,glow("fxFire",i?13:15,.45,.4)+rays(8,2,i?10:12,"#ffb04a",1.2,.45,.35)+bits(f,3,S_EMBER,.46,.5,9,-10,i*5))});
  return s+TR(x,y,ring(14,"#fff6c8",1.8,.45,.35)+ring(18,"#ff7a2a",1.6,.5,.45)+glow("fxWhite",20,.44,.18));
},
aura:(f,x,y)=>TR(x,y,glow("fxFire",17,0,.55)+ring(10,"#ff9a3c",1.8,0,.5)+ring(10,"#ffd25a",1.1,.12,.5)+ring(10,"#ff5a2a",1.3,.26,.55)+`<g ${K("spin",0,.85,"--rot:220deg;")}>`+[0,1,2,3,4,5,6,7].map(i=>{const a=i*45,t=a*Math.PI/180;return `<path d="${FL}" transform="translate(${(11*Math.cos(t)).toFixed(1)} ${(11*Math.sin(t)).toFixed(1)}) rotate(${a+90}) scale(.55)" fill="#ff9a3c"/>`}).join("")+`</g>`),
blast:(f,x,y,x2,y2)=>TR(x2,y2,glow("fxWhite",13,.05,.4)+ring(6,"#ffd25a",2,.08,.4)+ring(6,"#fff",1,.2,.4)+rays(8,4,12,"#fff0b0",1.4,.12,.35)+`<path d="${SHL}" fill="url(#gSteel)" stroke="#ffd25a" stroke-width="1.2" ${K("burst",.05,.5)}/>`),
rejuv:(f,x,y,x2,y2)=>{
  let s="";if(Math.hypot(x2-x,y2-y)>3)for(let i=0;i<3;i++)s+=proj(x,y,x2,y2,S_LEAF,i*.07,.3);
  return s+TR(x2,y2,glow("fxGreen",15,.28,.6)+ring(8,"#7fe08a",1.4,.3,.5)+bits(f,6,S_LEAF,.3,.55,12,-18)+bits(f,3,S_PLUS,.4,.5,10,-20,7));
},
light:(f,x,y,x2,y2)=>TR(x2,y2,`<rect x="-6" y="-70" width="12" height="70" fill="url(#fxBeam)" ${K("beam",.05,.7)}/>`+glow("fxGold",16,.08,.7)+ring(9,"#ffd25a",1.5,.1,.5)+ring(9,"#fff6c8",1,.3,.5)+bits(f,7,S_STAR,.12,.6,13,-24)),
dagger:(f,x,y,x2,y2)=>TR(x2,y2,`<path pathLength="1" d="M-7 -7L7 7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" ${K("draw",.05,.28)}/><path pathLength="1" d="M7 -7L-7 7" fill="none" stroke="#cfe4ff" stroke-width="2" stroke-linecap="round" ${K("draw",.22,.28)}/>`+glow("fxWhite",9,.2,.4)+rays(6,2,8,"#e8f0ff",1,.22,.35)),
daggerB:(f,x,y,x2,y2)=>FXR.dagger(f,x,y,x2,y2)+TR(x2,y2,bits(f,7,S_DROP,.22,.5,6,12,3,"fall")+rays(8,3,10,"#ff4a5a",1.1,.22,.35)),
dash:(f,x,y,x2,y2)=>{
  let s=TR(x,y,glow("fxSmoke",9,0,.4));
  for(let i=0;i<5;i++){const t=i/5,px=x+(x2-x)*t,py=y+(y2-y)*t,a=(i*.07).toFixed(2);s+=TR(px,py,`<circle r="4.4" fill="#6a5fa0" ${K("fade",a,.4)}/><circle r="2" fill="#c8bfff" ${K("fade",a,.4)}/>`)}
  s+=`<path pathLength="1" d="M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#bfb4ff" stroke-width="1.6" stroke-linecap="round" ${K("draw",0,.4)}/>`;
  return s+TR(x2,y2,glow("fxSmoke",10,.35,.5)+rays(6,3,9,"#d8d0ff",1,.35,.35));
},
tele:(f,x,y,x2,y2)=>TR(x,y,glow("fxPurple",14,0,.45)+ring(8,"#c58bff",1.4,0,.4)+bits(f,5,S_STARP,0,.45,10,-14))+`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#c58bff" stroke-width=".8" stroke-dasharray="1.5 2.5" ${K("fade",.05,.5)}/>`+TR(x2,y2,glow("fxPurple",15,.35,.5)+ring(8,"#c58bff",1.4,.35,.45)+rays(8,2,11,"#e6c8ff",1.2,.35,.35)+bits(f,6,S_STARP,.38,.5,11,-16,4)),
smoke:(f,x,y)=>TR(x,y,glow("fxWhite",10,0,.3)+[0,1,2,3,4,5,6].map(i=>{const a=i*.9+rd(f,i)*.5,r=2+rd(f,i+4)*3;return `<g transform="translate(${(Math.cos(a)*r).toFixed(1)} ${(Math.sin(a)*r).toFixed(1)})"><circle r="${(4+rd(f,i+8)*2.5).toFixed(1)}" fill="url(#fxSmoke)" ${K("puff",(i*.05).toFixed(2),.7,`--dx:${(Math.cos(a)*6).toFixed(1)};--dy:${(Math.sin(a)*5-3).toFixed(1)};`)}/></g>`}).join(""),f.sz||1),
lightning:(f,x,y,x2,y2)=>{
  const d=zig(f,x,y,x2,y2),fk=zig(f,(x+x2)/2,(y+y2)/2,(x+x2)/2+(rd(f,50)-.5)*16,(y+y2)/2+(rd(f,51)-.5)*16,20,1.4);
  return `<g ${K("flick",0,.7)}><path pathLength="1" d="${d}" fill="none" stroke="#ffe84d" stroke-opacity=".45" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" ${K("draw",.02,.45)}/><path pathLength="1" d="${d}" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${K("draw",.02,.45)}/><path pathLength="1" d="${fk}" fill="none" stroke="#fff6a0" stroke-width="1" stroke-linecap="round" ${K("draw",.1,.4)}/></g>`+TR(x,y,glow("fxGold",7,0,.3))+TR(x2,y2,glow("fxGold",13,.2,.45)+rays(8,2,10,"#fff6a0",1.2,.22,.35)+ring(6,"#ffe84d",1.2,.22,.4));
},
strike:(f,x,y,x2,y2)=>{
  const d=zig(f,x2,y2-70,x2,y2,5,3.2);
  return TR(x,y,glow("fxGold",8,0,.3))+`<g ${K("flick",.02,.55)}><path pathLength="1" d="${d}" fill="none" stroke="#ffe84d" stroke-opacity=".45" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" ${K("draw",.02,.3)}/><path pathLength="1" d="${d}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${K("draw",.02,.3)}/></g>`+`<rect x="${(x2-5).toFixed(1)}" y="${(y2-5).toFixed(1)}" width="10" height="10" fill="#fff" ${K("flash",.14,.25)}/>`+TR(x2,y2,glow("fxGold",18,.14,.45)+ring(10,"#ffe84d",1.8,.14,.45)+rays(10,3,14,"#fff6a0",1.4,.14,.35)+bits(f,4,S_STAR,.16,.5,10,-12));
},
potion:(f,x,y,x2,y2)=>{
  const ally=f.ally,c=ally?"#7be39a":"#b46bff",L=Math.hypot(x2-x,y2-y);
  const flask=`<path d="M-1.4 -5H1.4V-2.6C4 -1.2 4.6 3 3 4.6C1.5 6 -1.5 6 -3 4.6C-4.6 3 -4 -1.2 -1.4 -2.6Z" fill="${c}" stroke="#1a1626" stroke-width=".6"/><rect x="-1.7" y="-6.8" width="3.4" height="2" rx=".5" fill="#8a5a2b"/><ellipse cx="-1.3" cy="2" rx=".9" ry="1.5" fill="#fff" fill-opacity=".55"/>`;
  const fly=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g ${K("arcx",0,.4,`--dx:${(x2-x).toFixed(1)};`)}><g ${K("arcy",0,.4,`--dy:${(y2-y).toFixed(1)};--ah:${(8+L*.18).toFixed(1)};`)}>${flask}</g></g></g>`;
  return fly+(ally
    ?TR(x2,y2,glow("fxGreen",14,.4,.55)+ring(8,"#7fe08a",1.4,.4,.5)+bits(f,6,S_BUB,.4,.55,11,-16)+bits(f,3,S_PLUS,.45,.5,9,-18,6))
    :TR(x2,y2,glow("fxPoison",15,.4,.55)+bits(f,5,S_PCLOUD,.4,.55,8,-3,11,"puff")+bits(f,6,S_PBUB,.42,.55,11,-14)+rays(7,3,10,"#9be04a",1,.4,.3)));
},
swirl:(f,x,y)=>TR(x,y,glow("fxWhite",11,0,.4)+[0,1,2].map(i=>`<ellipse cy="${3-i*3.2}" rx="${9-i*1.5}" ry="2.6" fill="none" stroke="#dff6ff" stroke-width="1.2" ${K("pulse",(i*.1).toFixed(2),.5)}/>`).join("")+`<g ${K("spin",0,.85,"--rot:360deg;")}><path d="M-9 2A9 3 0 0 1 9 2M-6 -3A6 2.2 0 0 0 6 -3" fill="none" stroke="#bfe8ff" stroke-width="1.3" stroke-linecap="round"/></g>`+bits(f,6,S_LEAF,.1,.55,12,-14,2)),
block:(f,x,y)=>TR(x,y,glow("fxWhite",12,0,.4)+rays(8,5,12,"#fff",1.2,0,.35)+ring(7,"#ffd25a",1.5,.05,.4)+`<path d="${SHL}" fill="url(#gSteel)" stroke="#ffd25a" stroke-width="1.2" ${K("burst",0,.55)}/>`),
hit:(f,x,y)=>{const m={fire:["#ffb04a","fxFire"]}[f.v]||["#fff","fxWhite"];return TR(x,y,IMP(m[0],m[1],0,12,8))},
tick:(f,x,y)=>TR(x,y,f.v==="bleed"?bits(f,4,S_DROP,0,.7,7,8,1,"fall"):f.v==="poison"?glow("fxPoison",11,0,.6)+bits(f,5,S_PBUB,0,.7,9,-12):f.v==="burn"?glow("fxFire",10,0,.5)+bits(f,4,S_EMBER,0,.7,8,-12):glow("fxGreen",11,0,.6)+bits(f,3,S_PLUS,0,.7,8,-14)),
num:(f,x,y)=>`<text x="${x.toFixed(1)}" y="${(y-2).toFixed(1)}" text-anchor="middle" font-size="6.2" font-weight="800" fill="${f.c||"#fff"}" stroke="#000" stroke-width=".9" stroke-linejoin="round" paint-order="stroke" font-family="system-ui,sans-serif" ${K("numt",0,1)}>${esc(f.e)}</text>`
};
/* ---------- extra effects for the dragon and the knight ---------- */
Object.assign(FXD,{claws:1100,breath:1500,asteroid:2000,gsword:1200,leap:1600});
Object.assign(FXH,{claws:150,breath:560,asteroid:1320,gsword:220,leap:670});
const S_SMK=`<circle r="4" fill="url(#fxSmoke)"/>`;
const WING=`<path d="M0 0C-6 -10 -16 -12 -26 -8C-22 -4 -20 0 -18 4C-14 3 -10 3 -8 6C-6 4 -3 2 0 0Z" fill="#ff4a3a" fill-opacity=".55" stroke="#ff9a7a" stroke-width=".8"/>`;
Object.assign(FXR,{
claws:(f,x,y,x2,y2)=>TR(x2,y2,[-3.5,0,3.5].map((o,i)=>{const a=(.04+i*.07).toFixed(2),d=`M${-8+o} -9Q${-1+o} -1 ${6+o} 9`;return `<path pathLength="1" d="${d}" fill="none" stroke="#ff3a2a" stroke-opacity=".55" stroke-width="3.2" stroke-linecap="round" ${K("draw",a,.4)}/><path pathLength="1" d="${d}" fill="none" stroke="#ffe0d0" stroke-width="1.2" stroke-linecap="round" ${K("draw",a,.4)}/>`}).join("")+glow("fxFire",11,.2,.4)+bits(f,6,S_DROP,.22,.5,7,12,3,"fall")+rays(6,3,9,"#ff6a4a",1,.22,.3)),
breath:(f,x,y,x2,y2)=>{
  let s=TR(x,y,glow("fxFire",9,0,.3));
  for(let i=0;i<7;i++)s+=proj(x,y,x2,y2,`<g transform="scale(${(.7+i*.12).toFixed(2)})"><circle r="4.5" fill="url(#fxFire)"/><path d="${FL}" transform="rotate(90) scale(.7)" fill="#ffb04a"/></g>`,(i*.05).toFixed(2),.34);
  return s+TR(x2,y2,IMP("#ffb04a","fxFire",.4,18,10)+ring(11,"#ff5a2a",1.6,.42,.45)+bits(f,6,S_EMBER,.4,.55,14,-14)+bits(f,3,S_EMBER,.5,.5,10,-18,7));
},
asteroid:(f,x,y,x2,y2)=>{
  const L=Math.hypot(x2-x,y2-y),ah=(10+L*.2).toFixed(1);
  let s=TR(x,y,`<g ${K("burst",0,.32)}>${WING}<g transform="scale(-1 1)">${WING}</g></g>`+glow("fxFire",9,0,.3));
  // the dragon crosses the board as a glowing red shape with faint wings
  s+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g ${K("arcx",.28,.34,`--dx:${(x2-x).toFixed(1)};`)}><g ${K("arcy",.28,.34,`--dy:${(y2-y).toFixed(1)};--ah:${ah};`)}><circle r="8" fill="url(#fxFire)"/><g transform="scale(.6)">${WING}<g transform="scale(-1 1)">${WING}</g></g><ellipse rx="3" ry="4" fill="#5a0e0a" stroke="#ff6a4a" stroke-width=".6"/></g></g></g>`;
  let t=glow("fxFire",20,.64,.3)+ring(12,"#ff6a4a",2.2,.64,.34)+ring(8,"#ffe27a",1.4,.68,.3)
   +`<g ${K("spin",.64,.3,"--rot:360deg;")}><path d="M13 0A13 13 0 0 1 0 13" fill="none" stroke="#ff3a2a" stroke-width="3.4" stroke-linecap="round"/><path d="M-13 0A13 13 0 0 1 0 -13" fill="none" stroke="#ff9a3c" stroke-width="2.6" stroke-linecap="round"/><path d="M0 13A13 13 0 0 1 -13 0" fill="none" stroke="#ffd25a" stroke-width="1.6" stroke-linecap="round"/></g>`
   +bits(f,6,S_EMBER,.66,.5,14,-12);
  ADJ.forEach((d,i)=>{t+=`<g transform="translate(${d[0]*10} ${d[1]*10})">${glow("fxFire",7,.7+(i%2)*.02,.3)}</g>`});
  return s+TR(x2,y2,t);
},
gsword:(f,x,y,x2,y2)=>TR(x2,y2,`<path pathLength="1" d="M-9 -10Q6 -4 9 10" fill="none" stroke="#9fc4ff" stroke-opacity=".55" stroke-width="6" stroke-linecap="round" ${K("draw",.04,.45)}/><path pathLength="1" d="M-9 -10Q6 -4 9 10" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" ${K("draw",.04,.45)}/>`+glow("fxWhite",13,.2,.45)+ring(7,"#cfe4ff",2,.2,.4)+rays(8,3,12,"#fff",1.2,.2,.35)+bits(f,4,S_STAR,.22,.5,10,-10)),
leap:(f,x,y,x2,y2,V)=>{
  const px=V(f.px)*10+5,py=V(f.py)*10+5,L=Math.hypot(x2-x,y2-y),ah=(10+L*.2).toFixed(1);
  const body=`<circle r="7" fill="url(#fxWhite)"/><path d="M-3 -4L3 -4L4 4L0 7L-4 4Z" fill="url(#gSteel)" stroke="#fff" stroke-width=".5"/>`;
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g ${K("arcx",0,.4,`--dx:${(x2-x).toFixed(1)};`)}><g ${K("arcy",0,.4,`--dy:${(y2-y).toFixed(1)};--ah:${ah};`)}>${body}</g></g></g>`
   +`<path pathLength="1" d="M${x2.toFixed(1)} ${y2.toFixed(1)}L${px.toFixed(1)} ${py.toFixed(1)}" fill="none" stroke="#cfe4ff" stroke-width="2.2" stroke-linecap="round" ${K("draw",.42,.3)}/>`
   +TR(x2,y2,glow("fxWhite",17,.42,.4)+ring(8,"#fff",2,.42,.4)+ring(12,"#ffd25a",1.4,.46,.45)+rays(10,3,13,"#fff0b0",1.4,.42,.35)+bits(f,4,S_SMK,.44,.5,10,-6,5,"puff"))
   +TR(px,py,ring(5,"#ffe27a",1,.5,.4)+bits(f,3,S_STAR,.5,.5,8,-10));
}
});
/* ---------- effects for the Beast Hunter and the hidden-unit ambush ---------- */
Object.assign(FXD,{katana:1100,qislash:1400,awaken:1500,ambush:1200,tide:1300,bubble:1400,vortex:1500});
Object.assign(FXH,{katana:200,qislash:330,tide:300,bubble:300});
const CRESC=`<path d="M3 -8Q10 0 3 8Q5 0 3 -8Z" fill="#a8ffe9"/><path d="M0 -7Q6 0 0 7Q2 0 0 -7Z" fill="#16b394" fill-opacity=".8"/><path d="M-3 -5Q1 0 -3 5" stroke="#5ff5d4" stroke-opacity=".5" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
Object.assign(FXR,{
katana:(f,x,y,x2,y2)=>TR(x2,y2,`<path pathLength="1" d="M-9 -9Q4 -3 9 9" fill="none" stroke="#5ff5d4" stroke-opacity=".55" stroke-width="5.5" stroke-linecap="round" ${K("draw",.04,.4)}/><path pathLength="1" d="M-9 -9Q4 -3 9 9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" ${K("draw",.04,.4)}/><path pathLength="1" d="M9 -8Q-2 -2 -9 8" fill="none" stroke="#a8ffe9" stroke-width="1.6" stroke-linecap="round" ${K("draw",.2,.35)}/>`+glow("fxGreen",12,.18,.45)+ring(7,"#a8ffe9",1.6,.2,.4)+rays(7,3,11,"#d8fff4",1.1,.2,.4)+bits(f,4,S_LEAF,.22,.5,10,-10)),
qislash:(f,x,y,x2,y2,V)=>{
  let s=TR(x,y,glow("fxGreen",10,0,.3)+ring(7,"#a8ffe9",1.4,0,.3))+proj(x,y,x2,y2,CRESC,0,.42);
  const cs=f.cells||[];
  cs.forEach((c,i)=>{const t=+(.1+(i+1)/Math.max(1,cs.length)*.3).toFixed(2);s+=TR(V(c[0])*10+5,V(c[1])*10+5,glow("fxGreen",12,t,.4)+rays(6,2,10,"#d8fff4",1.2,t,.35)+bits(f,3,S_LEAF,t,.5,9,-10,i*5))});
  return s;
},
awaken:(f,x,y)=>TR(x,y,glow("fxGreen",18,0,.6)+glow("fxGold",12,.05,.5)+ring(8,"#a8ffe9",1.8,0,.5)+ring(8,"#fff6c8",1.2,.14,.5)+ring(8,"#5ff5d4",1.4,.28,.55)+rays(10,4,15,"#d8fff4",1.3,.1,.5)+bits(f,6,S_STAR,.1,.6,12,-22)+bits(f,4,S_LEAF,.2,.6,12,-18,5)),
tide:(f,x,y,x2,y2)=>TR(x2,y2,glow("fxWater",14,.15,.5)+[-5,0,5].map((o,i)=>`<g transform="translate(${o} 6)"><g ${K("drop",(.08+i*.06).toFixed(2),.35,"--sx:0;--sy:14;")}><path d="M0 -${14-Math.abs(o)} L3 6 L-3 6Z" fill="#bfe8ff" stroke="#2a7fd8" stroke-width=".7"/></g></g>`).join("")+ring(8,"#8fd3ff",1.6,.3,.45)+bits(f,6,S_BUB,.3,.55,12,-14)+rays(7,3,11,"#d9f2ff",1,.3,.35)),
bubble:(f,x,y,x2,y2)=>(Math.hypot(x2-x,y2-y)>3?proj(x,y,x2,y2,`<circle r="3" fill="url(#fxWater)"/>`,0,.3):"")+TR(x,y,glow("fxWater",9,0,.3)+ring(6,"#8fd3ff",1.2,0,.4))+TR(x2,y2,`<circle r="10" fill="url(#fxWater)" ${K("burst",.25,.6)}/><circle r="10" fill="none" stroke="#d9f2ff" stroke-width="1.6" ${K("pulse",.25,.6)}/>`+ring(12,"#8fd3ff",1.2,.4,.5)+bits(f,6,S_BUB,.3,.6,12,-14)),
vortex:(f,x,y)=>TR(x,y,glow("fxWater",24,0,.7)+ring(10,"#bfe8ff",2,0,.55)+ring(18,"#4fb0f0",1.6,.1,.6)+ring(25,"#8fd3ff",1.2,.2,.6)+`<g ${K("spin",0,.9,"--rot:-300deg;")}><path d="M0 0C0 -6 9 -6 9 2C9 12 -8 12 -8 -2C-8 -17 16 -17 19 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`+bits(f,8,S_BUB,.1,.7,34,-8)),
ambush:(f,x,y,x2,y2)=>TR(x,y,glow("fxPurple",17,0,.4)+ring(9,"#ff4a5a",2,0,.4)+ring(9,"#ffd0e4",1.2,.1,.4)+rays(10,3,14,"#ffd0e4",1.3,0,.35)+bits(f,5,S_DROP,.1,.55,8,12,3,"fall")+bits(f,3,S_STAR,.1,.5,10,-12))
  +(Math.hypot(x2-x,y2-y)>3?`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#c58bff" stroke-width="1.2" stroke-dasharray="1.5 2" ${K("fade",.05,.5)}/>`+TR(x2,y2,glow("fxPurple",11,.3,.45)+bits(f,4,S_STARP,.32,.5,9,-12)):"")
});

/* ---------- Nimbora: cloud effects ---------- */
Object.assign(FXD,{nimbus:1500,rain:1500,nstrike:1500,cloudup:1200,cdash:1100,overload:1800});
const CLD=(fill,op=1)=>`<g fill="${fill}" fill-opacity="${op}"><circle cx="-5" cy="1" r="4.2"/><circle cx="0" cy="-1.5" r="5.4"/><circle cx="5.5" cy="1" r="4"/><rect x="-9" y="1" width="18.5" height="4.2" rx="2.1"/></g>`;
const S_RAIN=`<path d="M0 -2.6L.6 2.6" stroke="#bfe8ff" stroke-width=".9" stroke-linecap="round"/>`;
Object.assign(FXR,{
nimbus:(f,x,y,x2,y2)=>TR(x,y,glow("fxWater",9,0,.3)+ring(6,"#8fd3ff",1.2,0,.4))
  +TR(x2,y2,`<g transform="translate(0 -12) scale(1.7)"><g ${K("burst",.04,.45)}>${CLD("#e4f1ff",.92)}</g></g>`+glow("fxWater",16,.2,.6)+bits(f,16,S_RAIN,.25,.55,28,16,3,"fall")+ring(14,"#8fd3ff",1.4,.3,.5)+bits(f,5,S_BUB,.4,.5,18,-8,9)),
rain:(f,x,y,x2,y2,V)=>(f.cells||[]).map((c,i)=>TR(V(c[0])*10+5,V(c[1])*10+5,bits({x:c[0],y:c[1]},3,S_RAIN,.04+(i%4)*.05,.5,8,12,i,"fall")+((i%2)?"":ring(3.5,"#bfe8ff",.7,.42+(i%3)*.05,.4)))).join(""),
nstrike:(f,x,y,x2,y2)=>{
  const d=zig(f,0,-26,0,0,5,3);
  return TR(x2,y2,`<g transform="translate(0 -27) scale(1.55)"><g ${K("fade",0,.64)}>${CLD("#2b304d",.96)}</g><g transform="translate(1.5 -1.5) scale(.8)"><g ${K("fade",.05,.6)}>${CLD("#454d78",.8)}</g></g></g>`
   +`<g ${K("flick",.36,.4)}><path pathLength="1" d="${d}" fill="none" stroke="#9fd0ff" stroke-opacity=".5" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" ${K("draw",.38,.22)}/><path pathLength="1" d="${d}" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ${K("draw",.38,.22)}/></g>`
   +`<rect x="-5" y="-5" width="10" height="10" fill="#fff" ${K("flash",.46,.2)}/>`
   +glow("fxGold",17,.46,.4)+ring(10,"#bfe8ff",1.8,.46,.4)+rays(10,3,14,"#fff6a0",1.4,.46,.35)+bits(f,5,S_STAR,.48,.45,12,-10));
},
cloudup:(f,x,y)=>TR(x,y,glow("fxWhite",13,0,.5)+`<g transform="translate(0 -2)"><g ${K("burst",0,.75)}>${CLD("#e8f4ff",.9)}</g></g>`+ring(8,"#8fd3ff",1.2,.1,.5)+bits(f,5,S_BUB,.15,.6,12,-10)),
cdash:(f,x,y,x2,y2)=>{
  let s=TR(x,y,glow("fxWhite",10,0,.4));
  for(let i=0;i<5;i++){const t=i/5,px=x+(x2-x)*t,py=y+(y2-y)*t,a=(i*.07).toFixed(2);s+=TR(px,py,`<g transform="scale(.8)"><g ${K("fade",a,.45)}>${CLD("#cfe3ff",.7)}</g></g>`)}
  s+=`<path pathLength="1" d="M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#dff0ff" stroke-width="1.6" stroke-linecap="round" ${K("draw",0,.4)}/>`;
  return s+TR(x2,y2,glow("fxWater",11,.35,.5)+rays(6,3,9,"#eaf6ff",1,.35,.35)+bits(f,4,S_BUB,.38,.5,10,-8));
},
overload:(f,x,y)=>TR(x,y,glow("fxWater",24,0,.7)+glow("fxWhite",12,.05,.45)+ring(10,"#bfe8ff",2,0,.55)+ring(10,"#fff",1.2,.12,.55)+ring(10,"#4fb0f0",1.6,.26,.6)+rays(12,4,20,"#d9f2ff",1.3,.05,.5)
  +`<g transform="translate(0 -15) scale(1.9)"><g ${K("burst",.02,.6)}>${CLD("#cfe0ff",.85)}</g></g>`
  +`<g ${K("spin",0,.9,"--rot:300deg;")}>`+[0,1,2,3,4,5].map(i=>`<path d="M0 -13L-2 -8L1 -8L-1 -3" transform="rotate(${i*60})" fill="none" stroke="#fff6a0" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`).join("")+`</g>`
  +bits(f,8,S_STAR,.1,.6,20,-22)+bits(f,6,S_RAIN,.2,.6,24,16,2,"fall"))
});

/* ---------- The Scarecrow of Death: effects ---------- */
Object.assign(FXD,{wheat:1200,wheatout:1100,reap:1000,soulfist:1000,strawup:1200,swapx:1000,soulbind:1300,soulsave:1500});
Object.assign(FXH,{reap:330,soulfist:300});
const S_WHEAT=`<path d="M0 3V-3M0 -3l-1.6-2M0 -3l1.6-2M0 0l-1.8-1.6M0 0l1.8-1.6" stroke="#f0c84a" stroke-width=".8" stroke-linecap="round" fill="none"/>`;
const S_STRAW=`<path d="M-3 -1L3 1M-3 1L3 -1" stroke="#e6cf7a" stroke-width=".9" stroke-linecap="round"/>`;
const S_WISP=`<circle r="1.7" fill="#b99cff" fill-opacity=".8"/><circle r=".7" fill="#fff"/>`;
Object.assign(FXR,{
wheat:(f,x,y,x2,y2,V)=>(f.cells||[]).map((c,i)=>TR(V(c[0])*10+5,V(c[1])*10+5,glow("fxGold",9,i*.04,.5)+bits({x:c[0],y:c[1]},5,S_WHEAT,.05+i*.03,.55,12,-9,i)+ring(5,"#f0c84a",.9,.15,.5))).join(""),
wheatout:(f,x,y,x2,y2,V)=>(f.cells||[]).map((c,i)=>TR(V(c[0])*10+5,V(c[1])*10+5,glow("fxGold",8,0,.5)+bits({x:c[0],y:c[1]},6,S_WHEAT,0,.7,14,-14,i))).join(""),
reap:(f,x,y,x2,y2)=>TR(x2,y2,glow("fxPurple",13,.18,.5)
  +`<g ${K("spin",.05,.5,"--rot:110deg;")}><path d="M-9 -5C-3 -13 10 -10 12 0C8 -6 -2 -8 -9 -5Z" fill="#efe4ff" stroke="#6a3fa0" stroke-width=".7"/><path d="M-9 -5L-13 -9" stroke="#6a3fa0" stroke-width="1.2" stroke-linecap="round"/></g>`
  +rays(8,5,13,"#c9a8ff",1.1,.22,.4)+ring(9,"#b99cff",1.3,.2,.5)+bits(f,6,S_WISP,.25,.6,16,-12)),
soulfist:(f,x,y,x2,y2)=>proj(x,y,x2,y2,`<circle r="3.2" fill="url(#fxPurple)"/><circle r="1.4" fill="#fff"/>`,.04,.28)
  +TR(x2,y2,glow("fxPurple",12,.28,.45)+ring(8,"#c9a8ff",1.4,.28,.45)+rays(6,4,10,"#e6d8ff",1,.28,.35)+bits(f,5,S_WISP,.3,.5,12,-8))
  +proj(x2,y2,x,y,S_WISP,.38,.4)+proj(x2,y2,x,y,S_WISP,.44,.4)
  +TR(x,y,glow("fxGreen",9,.72,.3)+bits(f,3,S_PLUS,.74,.3,8,-9)),
strawup:(f,x,y)=>TR(x,y,glow("fxGold",12,0,.5)
  +`<g ${K("burst",.05,.5)}><path d="M0 8V-8M-7 -3H7" stroke="#b08a3a" stroke-width="1.6" stroke-linecap="round"/><circle cy="-10" r="4" fill="#e6cf7a" stroke="#8a6a22" stroke-width=".8"/></g>`
  +ring(8,"#e6cf7a",1.2,.1,.5)+bits(f,8,S_STRAW,.1,.6,20,-14)+bits(f,5,S_WISP,.3,.6,14,-12)),
swapx:(f,x,y,x2,y2)=>TR(x,y,glow("fxPurple",10,0,.4)+ring(6,"#c9a8ff",1.2,.05,.45))+TR(x2,y2,glow("fxPurple",10,0,.4)+ring(6,"#c9a8ff",1.2,.05,.45))
  +proj(x,y,x2,y2,S_WISP,.1,.5)+proj(x2,y2,x,y,S_WISP,.1,.5)+proj(x,y,x2,y2,S_WISP,.2,.5)+proj(x2,y2,x,y,S_WISP,.2,.5)
  +TR(x2,y2,bits(f,4,S_STARP,.5,.4,10,-8))+TR(x,y,bits(f,4,S_STARP,.5,.4,10,-8)),
soulbind:(f,x,y,x2,y2)=>TR(x,y,glow("fxPurple",9,0,.35))+[0,1,2,3].map(i=>proj(x,y,x2,y2,S_WISP,i*.1,.5)).join("")
  +TR(x2,y2,glow("fxPurple",13,.4,.5)+ring(9,"#c9a8ff",1.4,.42,.5)+ring(6,"#9be0a8",1,.5,.45)+bits(f,6,S_WISP,.45,.5,14,-10)),
soulsave:(f,x,y,x2,y2)=>TR(x,y,glow("fxGreen",16,0,.5)+glow("fxWhite",9,.05,.4)+ring(10,"#9be0a8",1.8,.05,.5)+rays(8,5,15,"#d8ffd8",1.2,.05,.45)+bits(f,8,S_PLUS,.1,.6,16,-14))
  +proj(x,y,x2,y2,S_WISP,.3,.4)+proj(x2,y2,x,y,S_WISP,.3,.4)
  +TR(x2,y2,glow("fxPurple",12,.4,.5)+ring(8,"#c9a8ff",1.4,.45,.45)+bits(f,5,S_STRAW,.45,.5,16,-10))
});
function addFx(o){
  o.dur=o.dur||FXD[o.type]||1200;o.x2=o.x2===undefined?o.x:o.x2;o.y2=o.y2===undefined?o.y:o.y2;
  if(onlineGame&&!applyingRemoteState){fxOut.push({...o});if(fxOut.length>60)fxOut.shift()}
  o.t0=Date.now();FX.push(o);setTimeout(()=>{FX=FX.filter(f=>f!==o)},o.dur+(o.dl||0)+150);
}
const num=(t,txt,c)=>addFx({type:"num",x:t.x,y:t.y,e:txt,c,dl:FXLAG,...(NUMHID?{hid:1,team:t.team}:{})});
function fxHTML(){
  // Player 2 sees the board rotated 180deg, so effect coordinates are rotated the same way.
  const n=Date.now(),flip=onlineGame&&onlineMyTeam===1,V=v=>flip?9-v:v,my=onlineGame?onlineMyTeam:0;
  return `<svg class="fxs" viewBox="0 0 100 100" aria-hidden="true">`+FX.filter(f=>!f.hid||f.team===my).map(f=>{
    const r=FXR[f.type];if(!r)return "";
    return `<g style="--d:${f.dur}ms;--dl:${Math.round((f.dl||0)-(n-f.t0))}ms">${r(f,V(f.x)*10+5,V(f.y)*10+5,V(f.x2)*10+5,V(f.y2)*10+5,V)}</g>`;
  }).join("")+`</svg>`;
}
function vxHTML(){
  if(!VX.length)return "";
  const flip=onlineGame&&onlineMyTeam===1,V=v=>flip?9-v:v,dl=-(Date.now()/1000%3.2).toFixed(2);
  return `<svg class="fxs" viewBox="0 0 100 100" aria-hidden="true">`+VX.map(v=>{
    const cx=V(v.x)*10+5,cy=V(v.y)*10+5;
    return `<g transform="translate(${cx} ${cy})"><rect x="-25" y="-25" width="50" height="50" fill="#2a7fd8" fill-opacity=".12" stroke="#8fd3ff" stroke-opacity=".55" stroke-width=".5" stroke-dasharray="2 2"/><circle r="22" fill="#4fb0f0" fill-opacity=".1"/><g class="vsp" style="animation-delay:${dl}s"><path d="M0 0C0 -6 9 -6 9 2C9 12 -8 12 -8 -2C-8 -17 16 -17 19 0C22 19 -4 26 -16 14" fill="none" stroke="#bfe8ff" stroke-width="1.8" stroke-linecap="round" stroke-opacity=".85"/><path d="M0 0C-5 -4 -9 3 -5 7C2 13 14 6 12 -4C9 -15 -8 -14 -14 -6" fill="none" stroke="#4fb0f0" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".7"/></g><circle r="2.2" fill="#e8f8ff"/></g>`;
  }).join("")+`</svg>`;
}
function showFx(u,s,T){
  if(!T||!s.v)return;
  addFx({type:s.v,x:u.x,y:u.y,x2:T.x,y2:T.y});
}
$("rot").innerHTML=ICON("rotate")+"กรุณาหมุนจอเป็นแนวนอน";

