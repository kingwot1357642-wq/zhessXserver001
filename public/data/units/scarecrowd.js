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
