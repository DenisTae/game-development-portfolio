const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
const gameArea=document.getElementById("gameArea");

function resizeCanvas(){
canvas.width=gameArea.clientWidth;
canvas.height=gameArea.clientHeight
}

resizeCanvas();

window.addEventListener("resize",resizeCanvas);

const messageScreen=document.getElementById("messageScreen");
const messageTitle=document.getElementById("messageTitle");
const message=document.getElementById("message");
const startButton=document.getElementById("startButton");

const endScreen=document.getElementById("endScreen");
const endTitle=document.getElementById("endTitle");
const endText=document.getElementById("endText");
const endIcon=document.getElementById("endIcon");
const restartButton=document.getElementById("restartButton");

const toast=document.getElementById("toast");
const levelText=document.getElementById("levelText");
const healthyText=document.getElementById("healthyText");
const timerText=document.getElementById("timerText");
const visionText=document.getElementById("visionText");

const levels=[
{
time:90,
vision:115,
healthy:3,
unhealthy:3,
message:"Las frutas y verduras aportan vitaminas y nutrientes que ayudan a nuestro cuerpo a crecer y mantenerse fuerte."
},
{
time:75,
vision:105,
healthy:4,
unhealthy:4,
message:"Tomar agua es importante porque ayuda a mantener nuestro cuerpo hidratado durante el día."
},
{
time:65,
vision:95,
healthy:5,
unhealthy:5,
message:"Una alimentación variada nos ayuda a obtener diferentes nutrientes que nuestro cuerpo necesita."
},
{
time:55,
vision:85,
healthy:6,
unhealthy:6,
message:"Los alimentos muy azucarados pueden resultar atractivos, pero debemos aprender a elegir opciones más nutritivas."
},
{
time:45,
vision:75,
healthy:7,
unhealthy:8,
message:"¡Último reto! Piensa antes de elegir: una buena decisión alimentaria puede darte energía para continuar."
}
];

let currentLevel=0;
let levelData;
let gameRunning=false;
let timeLeft=0;
let timerInterval=null;
let visionRadius=100;
let foods=[];
let walls=[];
let particles=[];
let keys={};
let score=0;

const player={
x:0,
y:0,
radius:18,
speed:3.2,
angle:0,
squash:0
};

function distance(x1,y1,x2,y2){
return Math.hypot(x1-x2,y1-y2)
}

function circleRectCollision(c,r){
const x=Math.max(r.x,Math.min(c.x,r.x+r.w));
const y=Math.max(r.y,Math.min(c.y,r.y+r.h));
return (c.x-x)**2+(c.y-y)**2<c.radius**2
}

function canMove(x,y){
const t={
x,
y,
radius:player.radius
};

return !walls.some(w=>circleRectCollision(t,w))
}

function createMaze(){

walls=[];

const W=canvas.width;
const H=canvas.height;

walls.push(
{x:0,y:0,w:W,h:15},
{x:0,y:H-15,w:W,h:15},
{x:0,y:0,w:15,h:H},
{x:W-15,y:0,w:15,h:H}
);

const ww=18;

[
[.18,.12,.02,.38],
[.18,.65,.02,.25],
[.35,.08,.02,.35],
[.35,.55,.02,.35],
[.52,.12,.02,.38],
[.52,.65,.02,.25],
[.69,.08,.02,.35],
[.69,.55,.02,.35],
[.82,.25,.02,.45]
].forEach(p=>{

walls.push({
x:W*p[0],
y:H*p[1],
w:W*p[2]+ww,
h:H*p[3]
});

});

[
[.05,.28,.28],
[.43,.28,.20],
[.76,.28,.18],
[.20,.72,.22],
[.48,.72,.20],
[.78,.72,.15]
].forEach(p=>{

walls.push({
x:W*p[0],
y:H*p[1],
w:W*p[2],
h:ww
});

});

}

function randomPosition(){

let p;
let attempts=0;

do{

p={
x:35+Math.random()*(canvas.width-70),
y:35+Math.random()*(canvas.height-70)
};

attempts++;

}while(
attempts<500&&
(
walls.some(
w=>circleRectCollision(
{
x:p.x,
y:p.y,
radius:25
},
w
)
)||
distance(
p.x,
p.y,
player.x,
player.y
)<100
)
);

return p;

}

function createFoods(){

foods=[];

const healthy=[
"🍎",
"🍌",
"🥕",
"🥦",
"🍓",
"🍊",
"🍇",
"🥝",
"🥑",
"🍐"
];

const unhealthy=[
"🍔",
"🍟",
"🍕",
"🍩",
"🍭",
"🍫",
"🧁",
"🥤",
"🍪"
];

for(let i=0;i<levelData.healthy;i++){

const p=randomPosition();

foods.push({
x:p.x,
y:p.y,
type:"healthy",
emoji:healthy[
Math.floor(
Math.random()*healthy.length
)
],
eaten:false,
pulse:Math.random()*6.28
});

}

for(let i=0;i<levelData.unhealthy;i++){

const p=randomPosition();

foods.push({
x:p.x,
y:p.y,
type:"unhealthy",
emoji:unhealthy[
Math.floor(
Math.random()*unhealthy.length
)
],
eaten:false,
pulse:Math.random()*6.28
});

}

}

function createParticles(x,y,type){

for(let i=0;i<15;i++){

particles.push({
x,
y,
vx:(Math.random()-.5)*4,
vy:(Math.random()-.5)*4,
life:1,
type,
size:3+Math.random()*5
});

}

}

function updateParticles(dt){

particles.forEach(p=>{

p.x+=p.vx;
p.y+=p.vy;
p.life-=dt*2;

});

particles=
particles.filter(
p=>p.life>0
);

}

let toastTimeout;

function showToast(text,type){

toast.textContent=text;
toast.className="show "+type;

clearTimeout(toastTimeout);

toastTimeout=setTimeout(
()=>toast.className="",
1800
);

}

function checkFood(){

foods.forEach(food=>{

if(food.eaten)return;

if(
distance(
player.x,
player.y,
food.x,
food.y
)<28
){

food.eaten=true;

createParticles(
food.x,
food.y,
food.type
);

if(food.type==="healthy"){

visionRadius+=45;
score+=100;

showToast(
"🍎 ¡Excelente elección! ¡Tu visión aumenta!",
"good"
);

player.squash=1;

}else{

visionRadius=
Math.max(
55,
visionRadius-35
);

score=
Math.max(
0,
score-30
);

showToast(
"🍔 ¡Cuidado! Tu visión se redujo.",
"bad"
);

}

updateHUD();

checkVictory();

}

});

}

function checkVictory(){

if(
foods.filter(
f=>f.type==="healthy"&&!f.eaten
).length===0
){

nextLevel();

}

}

function nextLevel(){

gameRunning=false;

clearInterval(timerInterval);

currentLevel++;

if(currentLevel>=levels.length){

showEnd(true);

return;

}

showLevelMessage();

}

function showLevelMessage(){

levelData=levels[currentLevel];

messageScreen.style.display="flex";

messageTitle.textContent=
"⭐ Nivel "+(currentLevel+1);

message.textContent=
levelData.message;

startButton.textContent=
"¡Comenzar nivel "+(currentLevel+1)+"!";

}

function startLevel(){

messageScreen.style.display="none";
endScreen.style.display="none";

gameRunning=true;

timeLeft=levelData.time;

visionRadius=levelData.vision;

player.x=canvas.width/2;
player.y=canvas.height/2;
player.squash=0;

createMaze();

if(!canMove(player.x,player.y)){

player.x=50;
player.y=50;

}

createFoods();

updateHUD();

startTimer();

startMusic(currentLevel);

}

function startTimer(){

clearInterval(timerInterval);

timerInterval=setInterval(()=>{

if(!gameRunning)return;

timeLeft--;

updateHUD();

if(timeLeft<=0){

clearInterval(timerInterval);

gameRunning=false;

showEnd(false);

}

},1000);

}

function updateHUD(){

levelText.textContent=
"🌟 Nivel "+(currentLevel+1);

const remaining=
foods.filter(
f=>f.type==="healthy"&&!f.eaten
).length;

const total=
foods.filter(
f=>f.type==="healthy"
).length;

healthyText.textContent=
"🍎 Saludables: "+
(total-remaining)+
"/"+
total;

const m=
Math.floor(timeLeft/60)
.toString()
.padStart(2,"0");

const s=
(timeLeft%60)
.toString()
.padStart(2,"0");

timerText.textContent=
"⏱️ "+m+":"+s;

visionText.textContent=
Math.round(visionRadius);

}

function updatePlayer(){

if(!gameRunning)return;

let dx=0;
let dy=0;

if(
keys.ArrowUp||
keys.w||
keys.W
)dy=-1;

if(
keys.ArrowDown||
keys.s||
keys.S
)dy=1;

if(
keys.ArrowLeft||
keys.a||
keys.A
)dx=-1;

if(
keys.ArrowRight||
keys.d||
keys.D
)dx=1;

if(dx||dy){

const l=
Math.hypot(dx,dy);

dx/=l;
dy/=l;

const nx=
player.x+
dx*player.speed;

const ny=
player.y+
dy*player.speed;

if(
canMove(nx,player.y)
){

player.x=nx;

}

if(
canMove(player.x,ny)
){

player.y=ny;

}

player.angle+=.08;

}

}

function drawMaze(){

const W=canvas.width;
const H=canvas.height;

ctx.fillStyle="#02040b";

ctx.fillRect(
0,
0,
W,
H
);

ctx.save();

ctx.beginPath();

ctx.arc(
player.x,
player.y,
visionRadius,
0,
Math.PI*2
);

ctx.clip();

const g=
ctx.createLinearGradient(
0,
0,
W,
H
);

g.addColorStop(
0,
"#151c38"
);

g.addColorStop(
1,
"#080d22"
);

ctx.fillStyle=g;

ctx.fillRect(
0,
0,
W,
H
);

ctx.strokeStyle=
"rgba(255,255,255,.035)";

ctx.lineWidth=1;

for(
let x=0;
x<W;
x+=40
){

ctx.beginPath();

ctx.moveTo(x,0);
ctx.lineTo(x,H);

ctx.stroke();

}

for(
let y=0;
y<H;
y+=40
){

ctx.beginPath();

ctx.moveTo(0,y);
ctx.lineTo(W,y);

ctx.stroke();

}

walls.forEach(w=>{

ctx.fillStyle="#26345c";

ctx.fillRect(
w.x,
w.y,
w.w,
w.h
);

ctx.strokeStyle="#536aa5";

ctx.lineWidth=2;

ctx.strokeRect(
w.x,
w.y,
w.w,
w.h
);

});

foods.forEach(food=>{

if(food.eaten)return;

const pulse=
Math.sin(
performance.now()/300+
food.pulse
)*3;

ctx.font=
`${26+pulse}px Arial`;

ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.fillText(
food.emoji,
food.x,
food.y
);

});

ctx.restore();

const d=
ctx.createRadialGradient(
player.x,
player.y,
visionRadius*.45,
player.x,
player.y,
visionRadius
);

d.addColorStop(
0,
"rgba(0,0,0,0)"
);

d.addColorStop(
.65,
"rgba(0,0,0,.2)"
);

d.addColorStop(
1,
"rgba(0,0,0,.98)"
);

ctx.fillStyle=d;

ctx.fillRect(
0,
0,
W,
H
);

const glow=
ctx.createRadialGradient(
player.x,
player.y,
0,
player.x,
player.y,
visionRadius
);

glow.addColorStop(
0,
"rgba(255,230,109,.08)"
);

glow.addColorStop(
.6,
"rgba(255,230,109,.025)"
);

glow.addColorStop(
1,
"rgba(255,230,109,0)"
);

ctx.fillStyle=glow;

ctx.fillRect(
player.x-visionRadius,
player.y-visionRadius,
visionRadius*2,
visionRadius*2
);

}

function drawStar(){

const x=player.x;
const y=player.y;

let scale=
1+
Math.sin(
performance.now()/120
)*.025;

if(player.squash>0){

scale+=
player.squash*.15;

player.squash-=.04;

if(player.squash<0){

player.squash=0;

}

}

ctx.save();

ctx.translate(x,y);

ctx.rotate(
Math.sin(
performance.now()/1000
)*.04
);

ctx.scale(
scale,
scale
);

ctx.shadowColor=
"rgba(255,230,109,.8)";

ctx.shadowBlur=25;

const spikes=5;
const outer=22;
const inner=11;

ctx.beginPath();

for(
let i=0;
i<10;
i++
){

const r=
i%2===0
?outer
:inner;

const a=
i*Math.PI/5-
Math.PI/2;

const px=
Math.cos(a)*r;

const py=
Math.sin(a)*r;

if(i){

ctx.lineTo(px,py);

}else{

ctx.moveTo(px,py);

}

}

ctx.closePath();

const sg=
ctx.createRadialGradient(
-5,
-7,
2,
0,
0,
25
);

sg.addColorStop(
0,
"#fff9c4"
);

sg.addColorStop(
.35,
"#ffe66d"
);

sg.addColorStop(
1,
"#ffb703"
);

ctx.fillStyle=sg;

ctx.fill();

ctx.shadowBlur=0;

ctx.strokeStyle="#fff7ae";

ctx.lineWidth=2;

ctx.stroke();

ctx.fillStyle="#25213b";

ctx.beginPath();

ctx.arc(
-7,
-2,
2.7,
0,
Math.PI*2
);

ctx.fill();

ctx.beginPath();

ctx.arc(
7,
-2,
2.7,
0,
Math.PI*2
);

ctx.fill();

ctx.beginPath();

ctx.arc(
0,
2,
7,
0,
Math.PI
);

ctx.strokeStyle="#25213b";

ctx.lineWidth=2;

ctx.stroke();

ctx.restore();

}

function drawParticles(){

particles.forEach(p=>{

ctx.globalAlpha=p.life;

ctx.fillStyle=
p.type==="healthy"
?"#8cff98"
:"#ff7b8a";

ctx.beginPath();

ctx.arc(
p.x,
p.y,
p.size,
0,
Math.PI*2
);

ctx.fill();

});

ctx.globalAlpha=1;

}

function gameLoop(){

updatePlayer();

checkFood();

updateParticles(1/60);

drawMaze();

drawParticles();

drawStar();

requestAnimationFrame(gameLoop);

}

window.addEventListener(
"keydown",
e=>{

keys[e.key]=true;

if(
[
"ArrowUp",
"ArrowDown",
"ArrowLeft",
"ArrowRight"
].includes(e.key)
){

e.preventDefault();

}

}
);

window.addEventListener(
"keyup",
e=>{
keys[e.key]=false
}
);

document
.querySelectorAll(".controlButton")
.forEach(b=>{

const k=b.dataset.key;

b.addEventListener(
"pointerdown",
e=>{
e.preventDefault();
keys[k]=true
}
);

b.addEventListener(
"pointerup",
e=>{
e.preventDefault();
keys[k]=false
}
);

b.addEventListener(
"pointerleave",
()=>{
keys[k]=false
}
);

});

startButton.addEventListener(
"click",
startLevel
);

function showEnd(victory){

gameRunning=false;

clearInterval(timerInterval);

stopMusic();

endScreen.style.display="flex";

if(victory){

endIcon.textContent="🏆";

endTitle.textContent=
"¡Healthy Star! ⭐";

endText.textContent=
"¡Felicidades! Completaste todos los niveles. Estrellita aprendió que elegir alimentos saludables puede ayudarla a mantenerse con energía y superar retos.";

}else{

endIcon.textContent="⏰";

endTitle.textContent=
"¡Se acabó el tiempo!";

endText.textContent=
"No te preocupes. Inténtalo otra vez y recuerda: debes encontrar y comer TODAS las comidas saludables antes de que se acabe el tiempo.";

}

}

restartButton.addEventListener(
"click",
()=>{
currentLevel=0;
score=0;
endScreen.style.display="none";
showLevelMessage();
}
);

let audioContext=null;
let musicInterval=null;
let musicPlaying=false;

function startMusic(level){

stopMusic();

try{

if(!audioContext){

audioContext=
new(
window.AudioContext||
window.webkitAudioContext
)();

}

if(
audioContext.state==="suspended"
){

audioContext.resume();

}

musicPlaying=true;

const tempos=[
500,
420,
350,
280,
190
];

const tempo=
tempos[level]||200;

const notes=[
261.63,
329.63,
392,
523.25,
392,
329.63
];

let index=0;

musicInterval=
setInterval(()=>{

if(musicPlaying){

playTone(
notes[
index++%notes.length
],
.16,
level
);

}

},tempo);

}catch(e){}

}

function playTone(
frequency,
duration,
level
){

if(!audioContext)return;

const o=
audioContext.createOscillator();

const g=
audioContext.createGain();

o.frequency.value=
frequency+
level*8;

o.type=
level>=3
?"sawtooth"
:"triangle";

g.gain.setValueAtTime(
.035,
audioContext.currentTime
);

g.gain.exponentialRampToValueAtTime(
.001,
audioContext.currentTime+
duration
);

o.connect(g);

g.connect(
audioContext.destination
);

o.start();

o.stop(
audioContext.currentTime+
duration
);

}

function stopMusic(){

musicPlaying=false;

if(musicInterval){

clearInterval(
musicInterval
);

musicInterval=null;

}

}

showLevelMessage();

gameLoop();