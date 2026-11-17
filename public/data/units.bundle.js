// archer.js
ZX.unit("archer",{order:20,n:"Archer",rar:"common",el:"wind",hp:60,mv:1,pop:2,pas:"",blk:[],
 s:[{n:"Wind Arrow",i:"windArrow",k:"t",r:2,d:5,c:"phys",l:"low",cd:1,tg:"arrow",v:"windArrow",tags:["phys","arrow","wind","ranged"]},
    {n:"Wind Meteorite",i:"arrowRain",k:"t",r:4,d:10,dt:"true",c:"phys",l:"mid",cd:3,tg:"arrow",v:"arrowRain",tags:["phys","arrow","wind","ranged"]}]});

// assassin.js
ZX.unit("assassin",{order:60,n:"Assassin",rar:"uncommon",el:"shadow",hp:60,mv:1,pop:2,pas:"",blk:[],
 s:[{n:"Dagger Strike",i:"dagger",v:"dagger",k:"t",r:1,d:7,c:"phys",l:"low",cd:1,tags:["phys","dagger","melee","ground"],alt:{on:"ww",v:"daggerB",n:"Sharpness-Dagger",d:8,bleed:99,xww:1,x:"ติด Bleeding (ไม่หมดจนกว่าจะถูกรักษา) และออกจาก Wind-Walk"}},
    {n:"Legging-Dash",i:"dash",v:"dash",k:"m",r:2,cd:1,x:"หัก MP 1 เดินไกล 2 ช่อง",alt:{on:"ww",v:"tele",n:"Teleport",r:"ทั้งกระดาน",tp:1,x:"หัก MP 1 วาร์ปได้ 1 ครั้งต่อ Wind-Walk"}},
    {n:"Invisible Bomb",i:"smoke",v:"smoke",k:"w",cd:4,x:"Wind-Walk 3 เทิร์น (CD นับหลังออก)"}]});

// hunter.js
ZX.unit("hunter",{order:100,n:"Beast Hunter",rar:"rare",el:"wind",hp:90,mv:1,pop:4,utags:["human"],
 beastDR:.3,
 pas:"Beast Ward: ลดดาเมจที่โดนจากมังกรและอสูร 30%",
 blk:[],
 s:[{n:"Jade Katana",i:"katana",v:"katana",k:"t",r:1,d:6,bd:12,bleedB:2,aa:1,c:"phys",l:"low",cd:1,tags:["phys","sword","melee","ground"],x:"ใส่มังกร/อสูร 12 + Bleeding 2 ตา · ตีมังกร/อสูรที่บินอยู่ได้"},
    {n:"Qi Tian Slash",i:"qislash",v:"qislash",k:"q",r:3,d:5,bd:9,aa:1,c:"phys",l:"mid",cd:3,tags:["phys","sword","ground","mid"],x:"คลื่นดาบตรง 3 ช่อง เลือก 1 ใน 8 ทิศ ทะลุโดนศัตรูทุกตัว · ใส่มังกร/อสูร 9 และตีตัวที่บินอยู่ได้"},
    {n:"Awakening",i:"awaken",v:"awaken",k:"v",cd:4,x:"3 เทิร์น: เดิน 2 ช่อง · ดาเมจ +1 (+3 ใส่มังกร/อสูร) · โดนมังกร/อสูร −90% (CD นับหลังหมด)"}]});

// jugger.js
ZX.unit("jugger",{order:90,n:"Juggerknight",rar:"rare",el:"royal",hp:150,mv:1,pop:4,utags:["human","armored"],
 pas:"Armored Human: 50% ปัดป้องการโจมตีกายภาพทุกชนิดทุกระยะ",
 blk:[{p:.5,c:["phys"],l:["low","mid","high"]}],
 s:[{n:"Steel Giant Sword",i:"gsword",v:"gsword",k:"t",r:1,d:3,c:"phys",l:"low",cd:1,stunP:.4,stun:1,tags:["phys","sword","melee","ground","kingdom"],x:"โอกาสสตัน 40% · ดาบอาณาจักร +50% ต่อมังกร/ภูติ/ตำนาน"},
    {n:"Crushing Leap",i:"leap",v:"leap",k:"L",r:2,d:6,c:"phys",l:"high",cd:3,stun:1,tags:["phys","high","sword","ground","kingdom"],x:"กระโดดใส่ศัตรู ผลักออก 1 ช่องแล้วยืนแทนที่ · สตัน 1 ตา"}]});

// leviathan.js
ZX.unit("leviathan",{order:110,n:"Ocean Leviathan",rar:"epic",el:"frost",hp:170,mv:1,pop:6,utags:["legend","monster","water"],
 res:{water:.7,earth:1.5,wind:1.5},stunRes:.1,mulRanged:.8,mulMelee:1.2,
 pas:"Iron Body: โอกาสโดนสตัน −10% · โดนระยะไกล −20% · โดนระยะใกล้ +20% · โดนแท็กน้ำ −30% · โดนแท็กดิน/ลม +50%",
 blk:[],
 s:[{n:"Ocean Spear",i:"oceanSpear",v:"tide",k:"t",r:2,d:5,c:"phys",l:"mid",cd:1,stunP:.1,stun:1,tags:["phys","water","ground","mid","melee"],x:"หอกน้ำพุ่งจากพื้น เป้าเดี่ยว · โอกาสสตัน 10%"},
    {n:"Tide Shield",i:"tideShield",v:"bubble",k:"g",r:2,sh:10,cd:2,x:"โล่ 10 ให้พวกเดียวกัน/ตัวเอง ระยะ 2"},
    {n:"Whirlpool",i:"whirlpool",v:"vortex",k:"o",r:"ทั้งกระดาน",d:3,c:"magic",l:"mid",cd:4,stunP:.05,stun:1,tags:["water","ground","ranged","magic","mid"],x:"สร้างวังวน 5×5 ดูดศัตรูเข้าหาศูนย์กลางทีละช่อง ตอนร่ายและต้นเทิร์นผู้ร่าย รวม 5 ครั้ง · ดาเมจ 3 ครั้งแรก ต่อมา 2 · สตัน 5% (CD 4 นับหลังวังวนหาย)"}]});

// mage.js
ZX.unit("mage",{order:30,n:"Firemage",rar:"common",el:"fire",hp:60,mv:1,pop:3,pas:"",blk:[],
 s:[{n:"Fireball",i:"fireball",k:"t",r:2,d:7,c:"magic",l:"low",cd:1,tg:"fire",v:"fireball",tags:["magic","fire","ranged"]},
    {n:"Meteorite",i:"meteor",v:"meteor",k:"a",r:"ทั้งกระดาน",d:5,c:"magic",l:"mid",cd:4,tg:"meteor",tags:["magic","fire","ranged"],x:"โดน 5 ช่อง (กากบาท) โดนพวกเดียวกันได้"},
    {n:"Fire Aura",i:"aura",v:"aura",k:"s",r:"รอบตัว 1",d:5,c:"magic",l:"mid",cd:6,tg:"fire",sh:5,tags:["magic","fire","melee"],x:"โล่ 5 + ดาเมจรอบตัว 3 ครั้ง"}]});

// meric.js
ZX.unit("meric",{order:50,n:"Meric",rar:"uncommon",el:"holy",hp:60,mv:1,pop:3,pas:"Healer",blk:[],
 s:[{n:"Rejuvenation",i:"rejuv",v:"rejuv",k:"h",r:3,heal:6,cd:1,x:"ล้าง Bleeding/Poison ด้วย"},
    {n:"Light of Gentle",i:"light",v:"light",k:"r",r:3,heal:5,cd:5,x:"ฟื้น 5 ทันที + อีก 2 ครั้งตอนเริ่มเทิร์น"}]});

// nimbora.js
ZX.unit("nimbora",{order:120,n:"Nimbora",rar:"epic",el:"storm",hp:100,mv:1,pop:6,utags:[],blk:[],
 pas:"Cloud Domain: ช่องรอบตัว 3×3 (Super Zone 5×5) เป็นโซนเมฆของฝ่ายคุณ ตามตัวไปทุกที่ · สกิลใช้ได้เฉพาะกับโซนเมฆของตัวเอง · ต้นเทิร์นโซนฝนฟื้นเพื่อน 2-3 / ศัตรูโดนดาเมจจริงธาตุน้ำ 3 และ 20% ที่จะโดนสายฟ้า 1 คน",
 s:[{n:"Nimbocumulus",i:"nimbus",k:"n",r:3,cd:1,cost:0,tags:["water","magic"],x:"เลือกโซนเมฆของคุณในระยะ 3 เป็นจุดกลาง สร้างโซนฝน 3×3 ตกครั้งเดียวต้นเทิร์นถัดไป · ไม่ใช้ AP",
     alt:{on:"sz",n:"Lightning Field",i:"lfield",k:"N",r:"โซนเมฆทั้งหมด",cd:1,tags:["magic","lightning"],x:"เลือกช่องโซนเมฆ ผ่าสายฟ้าที่จุดนั้น + ศัตรูสุ่ม 1 คนในระยะ 3 จากจุดกลาง + 30% สายฟ้าสุ่มอีก 1 ลูก (ชิ่งได้) · ไม่ใช้ AP"}},
    {n:"Zone Created",i:"zonecloud",k:"z",r:2,cd:0,x:"ชั้น 1 ฟรี → ชั้น 2 ใช้ 2 AP → ชั้น 3 ฟรี แต่ละชั้นเปลี่ยน 1 ช่องในระยะ 2 เป็นโซนเมฆถาวร · รีเซ็ตต้นเทิร์นถัดไป",
     alt:{on:"sz",n:"Cloud Dash",i:"cdash",k:"c",r:3,cd:2,x:"พุ่งไปช่องโซนเมฆรอบตัวในระยะ 3 ไม่ใช้แต้ม"}},
    {n:"Overload",i:"overload",k:"x",cd:4,x:"Super Zone 4 เทิร์น (ไม่รวมเทิร์นที่ร่าย): เมฆประจำตัว 5×5 ทุกโซนเมฆมีฝนตกตลอด · สกิล 1 → Lightning Field · สกิล 2 → Cloud Dash (CD 4 นับหลังจบ)"}]});

// redscales.js
ZX.unit("redscales",{order:80,n:"Red Scales",rar:"epic",el:"dragon",hp:160,mv:1,pop:6,pf:1,utags:["dragon","fire"],
 flyRangedMul:2,rangedGroundImmune:1,res:{fire:.5,water:3},
 pas:"มังกร: บินตลอด โจมตีแล้วลงพื้นจนถึงเทิร์นตัวเอง · ตอนบินรับดาเมจระยะไกล ×2 · ตอนอยู่พื้นโดนระยะไกลไม่ได้ · รับดาเมจแท็กไฟ −50% แท็กน้ำ +200%",
 blk:[],
 s:[{n:"Dragon's Claws",i:"claws",v:"claws",k:"t",r:1,d:7,c:"phys",l:"low",cd:1,bleed:2,tags:["phys","claw","melee"],x:"ติด Bleeding 2 ตา"},
    {n:"Red Breath",i:"breath",v:"breath",k:"t",r:2,d:3,c:"magic",l:"mid",cd:3,burn:3,tags:["magic","fire","breath","ranged"],x:"ติด Burning 3 สแต็ก"},
    {n:"Asteroid",i:"asteroid",v:"asteroid",k:"j",r:"ทุกช่อง",d:10,c:"phys",l:"mid",cd:5,tp:1,fl:1,tags:["phys","tail","melee","ground"],x:"ใช้ได้เฉพาะตอนบิน · กระโดดไปช่องไหนก็ได้ ดาเมจรอบตัว 8 ช่อง (เฉพาะศัตรูพื้นดิน)"}]});

// scarecrow.js
ZX.unit("scarecrow",{order:140,n:"Scarecrow",rar:"common",el:"straw",hp:25,mv:1,pop:0,summon:1,freeMove:1,utags:["straw","spirit"],
 res:{fire:2},blk:[],
 pas:"เดินฟรีไม่ใช้ MP แต่เดินได้ 1 ครั้งต่อเทิร์น · โดนไฟ +100% · เรียกมาแล้วใช้ไม่ได้จนถึงเทิร์นถัดไป",
 s:[
  {n:"Soul Steal Fist",i:"soulfist",k:"t",r:1,d:5,c:"magic",l:"high",pierce:1,ls:4,cd:1,mpc:1,v:"soulfist",tags:["magic","spirit","ground","high"],x:"ดาเมจทะลวง (ไม่โดนปัดป้อง) เวทย์ระดับสูง 5 ฟื้น HP ให้ตัวเอง 4 · ใช้ MP 1"}
 ]});

// scarecrowd.js
ZX.unit("scarecrowd",{order:130,n:"The Scarecrow of Death",rar:"epic",el:"shadow",hp:120,mv:1,pop:6,utags:["spirit","straw","dark"],
 res:{fire:2,earth:.8,wind:.8,water:.8},blk:[],
 pas:"Farmer Spirit: ต้นเทิร์น 75% ปลูก Wheat Field 1 ช่องรอบตัว (ระยะ 1) · โดนไฟ +100% · โดนดิน/ลม/น้ำ −20%",
 s:[
  {n:"Wheat Master's Soul",i:"wheatsoul",k:"W",r:1,cd:1,tags:["spirit"],x:"เลือก 2 ช่องรอบตัว (ระยะ 1) เปลี่ยนเป็น Wheat Field ของฝ่ายคุณ"},
  {n:"The Reaper of Death",i:"reaper",k:"t",r:1,d:7,c:"magic",l:"high",cd:0,v:"reap",tags:["magic","dark","high","ground","melee"],x:"ดาเมจเวทย์ระดับสูง 7 · ไม่มีคูลดาวน์"},
  {n:"Handmade Scarecrow",i:"handmade",k:"H",r:"Wheat Field ว่างของคุณ",cd:3,tags:["spirit","straw"],x:"สร้าง Scarecrow บน Wheat Field ว่าง แล้วสลายทุ่งนั้นและอีก 3 ช่องสุ่ม · ต้องมีทุ่งมากกว่า 3 ช่อง และ Scarecrow ไม่เกิน 3 ตัว (ครบ 3 ตัว คูลดาวน์หยุดนับ)"},
  {n:"Scarecrow Mirage",i:"mirage",k:"X",r:"Scarecrow ของคุณ",cd:3,mpc:1,tags:["spirit","straw"],x:"สลับตำแหน่งกับ Scarecrow 1 ตัว · ใช้ MP 1"},
  {n:"Scarecrow Puppet",i:"puppet",k:"B",r:"เพื่อนร่วมทีม",cd:0,tags:["spirit"],x:"ผูกวิญญาณเพื่อนร่วมทีม 1 คน (ไม่รวมตัวเอง) ถ้าโดนดาเมจจนจะตาย จะสลับที่กับ Scarecrow สุ่ม HP สูงสุด 40 ฟื้นเต็ม ล้างสถานะ · ใช้ได้ 1 ครั้งต่อเกม"}
 ]});

// shield.js
ZX.unit("shield",{order:40,n:"Shield man",rar:"common",el:"frost",hp:120,mv:1,pop:2,
 pas:"Blocker: โอกาส 40% กันกายภาพต่ำ/กลาง และเวทย์ต่ำ",
 blk:[{p:.4,c:["phys"],l:["low","mid"]},{p:.4,c:["magic"],l:["low"]}],
 s:[{n:"Shield Blast",i:"blast",k:"t",r:1,d:5,c:"phys",l:"low",cd:0,v:"blast",tags:["phys","melee","ground"]}]});

// sword.js
ZX.unit("sword",{order:10,n:"Swordman",rar:"common",el:"steel",hp:100,mv:1,pop:2,
 pas:"รีเฟล็กซ์ นักรบ: โอกาส 15% ปัดป้องลูกธนูระดับต่ำ",
 blk:[{p:.15,c:["phys"],l:["low"],tg:"arrow"}],
 s:[{n:"Slash",i:"slash",k:"t",r:1,d:7,c:"phys",l:"low",cd:0,v:"slash",tags:["phys","sword","melee","ground"]}]});

// witch.js
ZX.unit("witch",{order:70,n:"Wandering Witch",rar:"rare",el:"arcane",hp:60,mv:1,pop:3,pas:"",blk:[],
 s:[{n:"Lightning Oak Wand",i:"lightning",v:"lightning",k:"t",r:2,d:4,c:"magic",l:"low",cd:1,tg:"lightning",chain:1,tags:["magic","lightning","ranged"],x:"ชิ่งไปศัตรูใกล้เคียง 1 ตัว",
     alt:{on:"fly",v:"strike",n:"Lightning Strike",d:8,chain:0,x:"บิน: เป้าเดียว ×2"}},
    {n:"Alchemist Potions",i:"potion",v:"potion",k:"p",r:1,cd:2,x:"เพื่อน = ฟื้นฟู 2 ตา ตาละ 3 · ศัตรู = Poison"},
    {n:"Witch's Broomstick",i:"broom",v:"swirl",k:"f",cd:3,x:"บิน 3 เทิร์น เดิน 2 ช่อง (CD นับหลังลงพื้น)"}]});
