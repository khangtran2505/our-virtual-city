const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const app=express();app.use(express.static(__dirname));
const server=http.createServer(app);const io=new Server(server,{cors:{origin:false}});
const PORT=process.env.PORT||3000;
const players=new Map();const rooms=new Map();const dbPath=path.join(__dirname,'save.json');
let saved={};try{saved=JSON.parse(fs.readFileSync(dbPath,'utf8'))}catch{}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const clean=s=>String(s||'').replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,22);
function persist(){const data={};for(const p of players.values())if(p.saveKey)data[p.saveKey]={cash:p.cash,deliveries:p.deliveries};fs.writeFile(dbPath,JSON.stringify({...saved,...data},null,2),()=>{});Object.assign(saved,data)}
setInterval(persist,30000);
function snapshot(room){return [...(rooms.get(room)||[])].map(id=>players.get(id)).filter(Boolean).map(({id,name,x,z,rot,car,cash,deliveries})=>({id,name,x,z,rot,car,cash,deliveries}))}
io.on('connection',socket=>{
 socket.on('join',(payload,ack)=>{
  if(players.has(socket.id))return ack?.({error:'Already joined'});
  const room=clean(payload?.room).trim().toUpperCase().replace(/\s+/g,'-')||'HO-CHI-MINH';const name=clean(payload?.name)||'Player';
  if(!/^[\p{L}A-Z0-9_-]{3,22}$/u.test(room))return ack?.({error:'Tên phòng cần 3–22 ký tự, không có ký tự đặc biệt'});
  const members=rooms.get(room)||new Set();if(members.size>=2)return ack?.({error:'Phòng đã đủ 2 người'});
  // Local demo persistence keyed by room + name. Do not use for sensitive accounts.
  const saveKey=room+':'+name;const record=saved[saveKey]||{};
  const p={id:socket.id,room,name,x:members.size?6:0,z:members.size?6:0,rot:0,car:false,cash:clamp(Number(record.cash)||100,0,100000),deliveries:clamp(Number(record.deliveries)||0,0,10000),saveKey,last:Date.now(),lastJob:0};
  players.set(socket.id,p);members.add(socket.id);rooms.set(room,members);socket.join(room);
  ack?.({id:socket.id,room,players:snapshot(room),cash:p.cash,deliveries:p.deliveries});socket.to(room).emit('playerJoined',p);
 });
 socket.on('move',data=>{
  const p=players.get(socket.id);if(!p)return;const now=Date.now();if(now-p.last<25)return;
  const x=Number(data?.x),z=Number(data?.z),rot=Number(data?.rot);if(![x,z,rot].every(Number.isFinite))return;
  const maxDistance=(p.car?24:10)*Math.min((now-p.last)/1000,0.3)+1.5;
  const distance=Math.hypot(x-p.x,z-p.z);if(distance>maxDistance)return;
  p.x=clamp(x,-185,185);p.z=clamp(z,-185,185);p.rot=rot;p.last=now;
  io.to(p.room).emit('playerMoved',{id:p.id,x:p.x,z:p.z,rot:p.rot,car:p.car});
 });
 socket.on('car',state=>{const p=players.get(socket.id);if(!p)return;p.car=!!state;io.to(p.room).emit('playerMoved',{id:p.id,x:p.x,z:p.z,rot:p.rot,car:p.car});});
 socket.on('deliver',(_,ack)=>{
  const p=players.get(socket.id);if(!p)return;
  if(Math.hypot(p.x-72,p.z-72)>13)return ack?.({error:'Đến điểm giao hàng màu vàng trước.'});
  if(Date.now()-p.lastJob<12000)return ack?.({error:'Chờ 12 giây giữa các nhiệm vụ.'});
  p.lastJob=Date.now();p.cash+=50;p.deliveries++;persist();ack?.({cash:p.cash,deliveries:p.deliveries});io.to(p.room).emit('stats',{id:p.id,cash:p.cash,deliveries:p.deliveries});
 });
 socket.on('chat',message=>{const p=players.get(socket.id);if(!p)return;const msg=String(message||'').trim().slice(0,140);if(msg)io.to(p.room).emit('chat',{name:p.name,msg});});
 socket.on('disconnect',()=>{const p=players.get(socket.id);if(!p)return;persist();players.delete(socket.id);const members=rooms.get(p.room);members?.delete(socket.id);if(!members?.size)rooms.delete(p.room);io.to(p.room).emit('playerLeft',socket.id);});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Virtual City running on http://localhost:${PORT}`));
