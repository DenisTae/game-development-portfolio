const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");

const startScreen=document.getElementById("start-screen");
const mathScreen=document.getElementById("math-screen");
const winScreen=document.getElementById("win-screen");

const winTitle=document.getElementById("win-title");
const winMsg=document.getElementById("win-msg");

const startBtn=document.getElementById("start-btn");
const nextBtn=document.getElementById("next-btn");

const btnCat=document.getElementById("btn-cat");
const btnDog=document.getElementById("btn-dog");

const mathQuestionEl=document.getElementById("math-question");
const mathAnswerEl=document.getElementById("math-answer");
const mathForm=document.getElementById("math-form");
const mathFeedback=document.getElementById("math-feedback");

const speedFill=document.getElementById("speed-fill");
const speedText=document.getElementById("speed-text");

let selectedChar="🐱";
let level=1;
let attempts=0;
let questionsAnswered=0;
let currentCorrectAnswer=0;
let isPlaying=false;
let animationId;
let score=0;
let currentSpeed=4;

const minSpeed=4;
const maxSpeed=16;

const levelConfigs=[
{baseSpeed:4,spawnRate:90},
{baseSpeed:7,spawnRate:75},
{baseSpeed:10,spawnRate:60}
];

let player={
x:80,
y:320,
w:35,
h:35,
vy:0,
gravity:.7,
jumpPower:-12,
isGrounded:true
};

let obstacles=[];
let frameCount=0;

btnCat.onclick=()=>{
selectedChar="🐱";
btnCat.classList.add("selected");
btnDog.classList.remove("selected");
};

btnDog.onclick=()=>{
selectedChar="🐶";
btnDog.classList.add("selected");
btnCat.classList.remove("selected");
};

startBtn.onclick=()=>{
startScreen.classList.add("hidden");
level=1;
attempts=0;
resetLevelData();
isPlaying=true;
gameLoop();
};

nextBtn.onclick=()=>{
winScreen.classList.add("hidden");

if(level<3){
level++;
resetLevelData();
isPlaying=true;
gameLoop();
}else{
level=1;
attempts=0;
startScreen.classList.remove("hidden");
}
};

window.addEventListener("keydown",e=>{
if(e.code==="Space"){
e.preventDefault();

if(isPlaying&&player.isGrounded){
player.vy=player.jumpPower;
player.isGrounded=false;
}
}
});

function resetLevelData(){
player.y=320;
player.vy=0;
player.isGrounded=true;
obstacles=[];
frameCount=0;
score=0;
questionsAnswered=0;
updateSpeedBar();
}

function updateSpeedBar(){
const cfg=levelConfigs[level-1];

currentSpeed=cfg.baseSpeed+(score*.002);

let pct=((currentSpeed-minSpeed)/(maxSpeed-minSpeed))*100;

pct=Math.min(100,Math.max(0,pct));

speedFill.style.width=pct+"%";

if(pct<35){
speedText.innerText="Lento";
}else if(pct<70){
speedText.innerText="Medio";
}else{
speedText.innerText="¡Muy Rápido!";
}
}

function generateMathProblem(lvl){
let a;
let b;
let question;
let answer;

if(lvl===1){
a=Math.floor(Math.random()*10)+1;
b=Math.floor(Math.random()*10)+1;

if(Math.random()>.5){
question=`${a} + ${b} = ?`;
answer=a+b;
}else{
if(a<b){
let t=a;
a=b;
b=t;
}

question=`${a} - ${b} = ?`;
answer=a-b;
}
}else if(lvl===2){
a=Math.floor(Math.random()*10)+2;
b=Math.floor(Math.random()*10)+2;

question=`${a} × ${b} = ?`;
answer=a*b;
}else{
a=Math.floor(Math.random()*9)+2;

let x=Math.floor(Math.random()*12)+1;

b=a*x;

question=`Si ${a} × X = ${b}, ¿cuánto vale X?`;

answer=x;
}

return{
question,
answer
};
}

function triggerMathModal(){
isPlaying=false;

cancelAnimationFrame(animationId);

const problem=generateMathProblem(level);

mathQuestionEl.innerText=problem.question;
currentCorrectAnswer=problem.answer;

mathAnswerEl.value="";
mathFeedback.innerText="";

mathScreen.classList.remove("hidden");

setTimeout(()=>{
mathAnswerEl.focus();
},100);
}

mathForm.onsubmit=e=>{
e.preventDefault();

const userAnswer=parseInt(mathAnswerEl.value,10);

attempts++;

if(userAnswer===currentCorrectAnswer){

questionsAnswered++;

mathScreen.classList.add("hidden");

obstacles=[];

if(questionsAnswered>=5){

if(level===3){

winTitle.innerText="¡FELICIDADES!";

winMsg.innerText=`¡Completaste MathVenture! Superaste los 3 niveles en un total de ${attempts} intentos.`;

nextBtn.innerText="VOLVER AL INICIO";

}else{

winTitle.innerText="¡BIEN HECHO!";

winMsg.innerText=`Completaste el Nivel ${level} tras responder 5 preguntas. Intentos acumulados: ${attempts}.`;

nextBtn.innerText="SIGUIENTE NIVEL";
}

winScreen.classList.remove("hidden");

}else{

isPlaying=true;

gameLoop();
}

}else{

mathFeedback.style.color="#ff4757";

mathFeedback.innerText="Incorrecto. Inténtalo de nuevo.";

mathAnswerEl.value="";

setTimeout(()=>{
mathAnswerEl.focus();
},100);
}
};

function gameLoop(){
if(!isPlaying)return;

update();
draw();

animationId=requestAnimationFrame(gameLoop);
}

function update(){
const cfg=levelConfigs[level-1];

frameCount++;

score++;

updateSpeedBar();

player.vy+=player.gravity;

player.y+=player.vy;

if(player.y>=320){
player.y=320;
player.vy=0;
player.isGrounded=true;
}

if(frameCount%cfg.spawnRate===0){

const h=20+Math.random()*30;

obstacles.push({
x:canvas.width,
y:355-h,
w:20,
h:h
});
}

for(let i=obstacles.length-1;i>=0;i--){

obstacles[i].x-=currentSpeed;

if(checkCollision(player,obstacles[i])){
triggerMathModal();
return;
}

if(obstacles[i].x+obstacles[i].w<0){
obstacles.splice(i,1);
}
}
}

function checkCollision(player,obstacle){
return player.x<obstacle.x+obstacle.w&&
player.x+player.w>obstacle.x&&
player.y<obstacle.y+obstacle.h&&
player.y+player.h>obstacle.y;
}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#252525";
ctx.fillRect(0,355,canvas.width,45);

ctx.fillStyle="#ffd500";

for(let i=0;i<canvas.width;i+=40){
ctx.fillRect(i,355,20,3);
}

ctx.font="30px sans-serif";

ctx.fillText(
selectedChar,
player.x,
player.y+28
);

ctx.fillStyle="#ff4757";

for(let obstacle of obstacles){
ctx.fillRect(
obstacle.x,
obstacle.y,
obstacle.w,
obstacle.h
);
}

ctx.fillStyle="#ffd500";

ctx.font="bold 15px Rajdhani";

ctx.fillText(`NIVEL: ${level}/3`,15,25);

ctx.fillText(
`PREGUNTAS: ${questionsAnswered}/5`,
15,
50
);

ctx.fillText(
`INTENTOS: ${attempts}`,
15,
75
);
}

draw();