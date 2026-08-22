const T_NAMES=["PLÁSTICO","PAPEL / CARTÓN","VIDRIO","ORGÁNICO"];
const T_COLORS=["#F1C40F","#3498DB","#2ECC71","#A66A3F"];

const U={
show:id=>{
document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
if(id)document.getElementById(id).classList.add("active");
},
upd:(l,s,p,t)=>{
document.getElementById("hud-lvl").innerText=l;
document.getElementById("hud-spd").innerText=s.toFixed(1);
document.getElementById("hud-pts").innerText=p;
document.getElementById("time-fill").style.width=Math.max(0,t)+"%";
},
showScores:()=>{
let scores=JSON.parse(localStorage.getItem("ecoPts")||'[{"n":"Rock","p":50},{"n":"Eco Master","p":30}]');
scores.sort((a,b)=>b.p-a.p);

document.getElementById("score-list").innerHTML=
scores.slice(0,5).map((x,i)=>
`<div class="score-row">
<span>${i+1}. ${x.n}</span>
<strong>${x.p}</strong>
</div>`
).join("");

U.show("menu-scores");
},
save:p=>{
let scores=JSON.parse(localStorage.getItem("ecoPts")||"[]");

scores.push({
n:"Jugador",
p:p
});

localStorage.setItem("ecoPts",JSON.stringify(scores));
},
addLbl:(id,txt,cls="")=>{
let d=document.createElement("div");

d.id=id;
d.className="lbl3d "+cls;
d.innerText=txt;

document.getElementById("labels-layer").appendChild(d);

return d;
},
floatTxt:(x,y,txt,col)=>{
let d=document.createElement("div");

d.className="float-txt";
d.innerText=txt;
d.style.color=col;
d.style.left=x+"px";
d.style.top=y+"px";

document.getElementById("labels-layer").appendChild(d);

setTimeout(()=>d.remove(),1000);
}
};

class E{

constructor(){

this.w=innerWidth;
this.h=innerHeight;

this.sc=new THREE.Scene();

this.sc.background=new THREE.Color(0x8ed8ee);
this.sc.fog=new THREE.Fog(0x8ed8ee,30,100);

this.cam=new THREE.PerspectiveCamera(
58,
this.w/this.h,
.1,
1000
);

this.ren=new THREE.WebGLRenderer({
antialias:true,
powerPreference:"high-performance"
});

this.ren.setSize(this.w,this.h);
this.ren.setPixelRatio(Math.min(devicePixelRatio,2));

this.ren.shadowMap.enabled=true;
this.ren.shadowMap.type=THREE.PCFSoftShadowMap;

this.ren.outputEncoding=THREE.sRGBEncoding;

document.querySelector(".game-wrapper").appendChild(this.ren.domElement);

const hemi=new THREE.HemisphereLight(
0xffffff,
0x315b4b,
1
);

this.sc.add(hemi);

const sun=new THREE.DirectionalLight(
0xfff4d6,
1.5
);

sun.position.set(-30,45,-25);
sun.castShadow=true;

sun.shadow.mapSize.width=2048;
sun.shadow.mapSize.height=2048;

sun.shadow.camera.left=-60;
sun.shadow.camera.right=60;
sun.shadow.camera.top=60;
sun.shadow.camera.bottom=-60;

this.sc.add(sun);

this.m={

p:new THREE.MeshStandardMaterial({
color:0xF1C40F,
roughness:.65
}),

pa:new THREE.MeshStandardMaterial({
color:0x3498DB,
roughness:.65
}),

g:new THREE.MeshStandardMaterial({
color:0x35D889,
roughness:.35
}),

o:new THREE.MeshStandardMaterial({
color:0xA66A3F,
roughness:.8
}),

wood:new THREE.MeshStandardMaterial({
color:0x70482d,
roughness:.8
}),

darkWood:new THREE.MeshStandardMaterial({
color:0x38251a,
roughness:.85
}),

capy:new THREE.MeshStandardMaterial({
color:0x8A5A36,
roughness:.9
}),

capyLight:new THREE.MeshStandardMaterial({
color:0xB8794C,
roughness:.85
}),

black:new THREE.MeshStandardMaterial({
color:0x111111,
roughness:.4
}),

water:new THREE.MeshStandardMaterial({
color:0x209bc1,
transparent:true,
opacity:.88,
roughness:.15
}),

sand:new THREE.MeshStandardMaterial({
color:0xd9c38b,
roughness:1
})

};

this.t=[
this.m.p,
this.m.pa,
this.m.g,
this.m.o
];

addEventListener("resize",()=>{
this.w=innerWidth;
this.h=innerHeight;

this.cam.aspect=this.w/this.h;
this.cam.updateProjectionMatrix();

this.ren.setSize(this.w,this.h);
});

}

cCapy(){

const g=new THREE.Group();

const body=new THREE.Mesh(
new THREE.SphereGeometry(1,24,16),
this.m.capy
);

body.scale.set(.8,.65,1.25);
body.position.y=.85;
body.castShadow=true;

g.add(body);

const head=new THREE.Mesh(
new THREE.SphereGeometry(.58,20,16),
this.m.capyLight
);

head.scale.set(.95,.85,1.15);
head.position.set(0,1.15,1.12);
head.castShadow=true;

g.add(head);

const snout=new THREE.Mesh(
new THREE.SphereGeometry(.3,16,12),
this.m.capyLight
);

snout.scale.set(1,.7,.9);
snout.position.set(0,1.08,1.57);

g.add(snout);

const nose=new THREE.Mesh(
new THREE.SphereGeometry(.09,10,8),
this.m.black
);

nose.position.set(0,1.17,1.83);

g.add(nose);

[-.25,.25].forEach(x=>{

const eye=new THREE.Mesh(
new THREE.SphereGeometry(.065,12,10),
this.m.black
);

eye.position.set(x,1.36,1.53);

g.add(eye);

});

[-.35,.35].forEach(x=>{

const ear=new THREE.Mesh(
new THREE.SphereGeometry(.15,12,10),
this.m.capy
);

ear.scale.set(1,.65,.55);
ear.position.set(x,1.52,1.05);

g.add(ear);

});

const legGeo=new THREE.CylinderGeometry(
.13,
.15,
.48,
10
);

[
[-.48,.45,.55],
[.48,.45,.55],
[-.48,.45,-.55],
[.48,.45,-.55]
].forEach(p=>{

const leg=new THREE.Mesh(
legGeo,
this.m.capy
);

leg.position.set(
p[0],
p[1],
p[2]
);

leg.castShadow=true;

g.add(leg);

});

g.rotation.y=Math.PI;

return g;
}

cBoat(){

const boat=new THREE.Group();

const hull=new THREE.Mesh(
new THREE.CylinderGeometry(1.8,1.25,4.8,4),
this.m.wood
);

hull.rotation.z=Math.PI/2;
hull.rotation.y=Math.PI/4;
hull.scale.y=.42;
hull.position.y=.45;
hull.castShadow=true;

boat.add(hull);

const inside=new THREE.Mesh(
new THREE.BoxGeometry(3.4,.28,1.6),
this.m.darkWood
);

inside.position.y=.68;

boat.add(inside);

[-.9,.9].forEach(z=>{

const rail=new THREE.Mesh(
new THREE.BoxGeometry(3.8,.18,.16),
this.m.capyLight
);

rail.position.set(0,.9,z);

boat.add(rail);

});

const paddle=new THREE.Group();

const stick=new THREE.Mesh(
new THREE.CylinderGeometry(.045,.045,2.5,8),
this.m.wood
);

stick.rotation.z=Math.PI/2;
stick.position.set(0,1.15,1.35);

paddle.add(stick);

const blade=new THREE.Mesh(
new THREE.BoxGeometry(.45,.12,.35),
this.m.capyLight
);

blade.position.set(1.3,1.15,1.35);

paddle.add(blade);

boat.add(paddle);

return boat;
}

cBin(i,p){

const g=new THREE.Group();
const m=this.t[i];

const body=new THREE.Mesh(
new THREE.BoxGeometry(2.8,2.1,2.8),
m
);

body.position.y=1.05;
body.castShadow=true;

g.add(body);

const lid=new THREE.Mesh(
new THREE.BoxGeometry(3,.25,3),
m
);

lid.position.y=2.2;
lid.castShadow=true;

g.add(lid);

g.position.set(p[0],0,p[1]);
g.type=i;

return g;
}

cTrsh(i){

let mesh;

if(i===0){

mesh=new THREE.Mesh(
new THREE.CylinderGeometry(.28,.22,.75,12),
this.m.p
);

}else if(i===1){

mesh=new THREE.Mesh(
new THREE.BoxGeometry(.75,.5,.08),
this.m.pa
);

mesh.rotation.y=Math.random()*.5;

}else if(i===2){

mesh=new THREE.Mesh(
new THREE.CylinderGeometry(.25,.2,.7,16),
this.m.g
);

}else{

mesh=new THREE.Mesh(
new THREE.SphereGeometry(.35,14,10),
this.m.o
);

}

mesh.castShadow=true;

return mesh;
}

cTree(){

const g=new THREE.Group();

const trunk=new THREE.Mesh(
new THREE.CylinderGeometry(.3,.42,2.8,8),
this.m.wood
);

trunk.position.y=1.4;
trunk.castShadow=true;

g.add(trunk);

const leafMat=new THREE.MeshStandardMaterial({
color:0x247a4a,
roughness:.95
});

[
[0,3.3,0,1.4],
[.7,3,.1,1],
[-.7,3.05,0,1]
].forEach(p=>{

const leaf=new THREE.Mesh(
new THREE.SphereGeometry(p[3],12,10),
leafMat
);

leaf.position.set(
p[0],
p[1],
p[2]
);

leaf.scale.y=.9;
leaf.castShadow=true;

g.add(leaf);

});

return g;
}

}

const G={

k:{},

init:function(){

this.e=new E();

this.p=this.e.cCapy();

this.e.sc.add(this.p);

this.gM=new THREE.MeshStandardMaterial({
color:0x2d944f,
roughness:1
});

this.gr=new THREE.Mesh(
new THREE.PlaneGeometry(140,140),
this.gM
);

this.gr.rotation.x=-Math.PI/2;
this.gr.receiveShadow=true;

this.e.sc.add(this.gr);

this.scn=new THREE.Group();

this.e.sc.add(this.scn);

this.b=[];
this.bL=[];

const positions=[
[-15,-15],
[15,-15],
[-15,15],
[15,15]
];

for(let i=0;i<4;i++){

const b=this.e.cBin(
i,
positions[i]
);

this.e.sc.add(b);
this.b.push(b);

const l=U.addLbl(
"b"+i,
T_NAMES[i]
);

l.style.color=T_COLORS[i];

this.bL.push({
o:b,
e:l
});

}

this.iL=U.addLbl(
"iL",
"",
"lbl-item"
);

addEventListener("keydown",e=>{
this.k[e.code]=true;
});

addEventListener("keyup",e=>{
this.k[e.code]=false;
});

this.anim=this.anim.bind(this);

requestAnimationFrame(this.anim);

},

start:function(){

U.show(null);

document.getElementById("hud").style.display="flex";

this.l=1;
this.pts=0;
this.sp=.25;
this.mT=50;
this.t=this.mT;
this.tC=8;
this.st=[];
this.tr=[];
this.vy=0;
this.run=true;
this.errC=false;
this.lF=performance.now();

this.p.position.set(0,0,0);
this.p.rotation.set(0,0,0);

if(this.boat){

this.p.remove(this.boat);
this.boat=null;

}

this.bS(1);
this.sT();

},

bS:function(l){

while(this.scn.children.length){
this.scn.remove(this.scn.children[0]);
}

if(l===1){

this.gr.visible=true;

this.gM.color.setHex(0x2d944f);

this.e.sc.background.set(0x8ed8ee);
this.e.sc.fog.color.set(0x8ed8ee);

for(let i=0;i<28;i++){

const tree=this.e.cTree();

const a=Math.random()*Math.PI*2;
const r=32+Math.random()*28;

tree.position.set(
Math.cos(a)*r,
0,
Math.sin(a)*r
);

this.scn.add(tree);

}

}

if(l===2){

this.gr.visible=false;

this.e.sc.background.set(0x75cbe4);
this.e.sc.fog.color.set(0x75cbe4);

this.water=new THREE.Mesh(
new THREE.PlaneGeometry(120,120,40,40),
this.e.m.water
);

this.water.rotation.x=-Math.PI/2;
this.water.position.y=-.05;

this.e.sc.add(this.water);

for(let i=0;i<12;i++){

const island=new THREE.Mesh(
new THREE.CylinderGeometry(
2+Math.random()*3,
3+Math.random()*3,
.5,
12
),
this.e.m.sand
);

const a=Math.random()*Math.PI*2;
const r=28+Math.random()*28;

island.position.set(
Math.cos(a)*r,
-.1,
Math.sin(a)*r
);

this.scn.add(island);

}

this.boat=this.e.cBoat();

this.p.add(this.boat);

this.boat.position.set(
0,
-.35,
0
);

}

if(l>=3){

this.gr.visible=true;

this.gM.color.setHex(0x26363a);

this.e.sc.background.set(0x273844);
this.e.sc.fog.color.set(0x273844);

for(let i=0;i<20;i++){

const tree=this.e.cTree();

tree.scale.setScalar(
.7+Math.random()*.6
);

const a=Math.random()*Math.PI*2;
const r=30+Math.random()*25;

tree.position.set(
Math.cos(a)*r,
0,
Math.sin(a)*r
);

this.scn.add(tree);

}

}

},

sT:function(){

this.tr.forEach(t=>{
this.e.sc.remove(t);
});

this.tr=[];

for(let i=0;i<this.tC;i++){

const type=Math.floor(Math.random()*4);

const t=this.e.cTrsh(type);

let x=(Math.random()-.5)*70;
let z=(Math.random()-.5)*70;

if(
Math.abs(x)<12&&
Math.abs(z)<12
){
i--;
continue;
}

t.position.set(
x,
this.l===2?.35:.4,
z
);

t.type=type;

this.e.sc.add(t);

this.tr.push(t);

}

},

prj:function(o,yO){

const v=new THREE.Vector3();

o.getWorldPosition(v);

v.y+=yO;

v.project(this.e.cam);

return{
x:(v.x*.5+.5)*innerWidth,
y:(v.y*-.5+.5)*innerHeight,
z:v.z
};

},

collectEffect:function(pos,color){

for(let i=0;i<7;i++){

const dot=new THREE.Mesh(
new THREE.SphereGeometry(.07,8,8),
new THREE.MeshBasicMaterial({
color
})
);

dot.position.copy(pos);

dot.userData.vel=new THREE.Vector3(
(Math.random()-.5)*.15,
Math.random()*.18,
(Math.random()-.5)*.15
);

dot.userData.life=1;

this.e.sc.add(dot);

const animate=()=>{

if(dot.userData.life<=0){

this.e.sc.remove(dot);

return;

}

dot.position.add(dot.userData.vel);

dot.userData.life-=.025;

dot.scale.setScalar(dot.userData.life);

requestAnimationFrame(animate);

};

animate();

}

},

anim:function(n){

requestAnimationFrame(this.anim);

if(!this.run){

this.e.ren.render(
this.e.sc,
this.e.cam
);

return;
}

let dt=(n-this.lF)/1000;

this.lF=n;

this.t-=dt;

U.upd(
this.l,
1+(this.l-1)*.3,
this.pts,
(this.t/this.mT)*100
);

if(this.t<=0){

this.run=false;

document.getElementById("hud").style.display="none";

document.getElementById("end-lvl").innerText=this.l;

document.getElementById("end-score").innerText=this.pts;

U.save(this.pts);

U.show("menu-end");

return;

}

let s=this.sp+this.l*.05;

if(this.k.ArrowUp)
this.p.translateZ(-s);

if(this.k.ArrowDown)
this.p.translateZ(s);

if(this.k.ArrowLeft)
this.p.rotation.y+=.075;

if(this.k.ArrowRight)
this.p.rotation.y-=.075;

if(
this.k.Space&&
this.p.position.y<=.01
){
this.vy=.5;
}

this.p.position.y+=this.vy;

if(this.p.position.y>0){

this.vy-=.04;

}else{

this.p.position.y=0;
this.vy=0;

}

this.p.position.x=Math.max(
-45,
Math.min(45,this.p.position.x)
);

this.p.position.z=Math.max(
-45,
Math.min(45,this.p.position.z)
);

if(this.l===2&&this.boat){

this.boat.position.y=
-.35+
Math.sin(n*.0025)*.045;

this.boat.rotation.z=
Math.sin(n*.0018)*.025;

}

const camOffset=new THREE.Vector3(
0,
9.5,
14
).applyEuler(this.p.rotation);

this.e.cam.position.lerp(
this.p.position.clone().add(camOffset),
.09
);

this.e.cam.lookAt(
this.p.position.clone().add(
new THREE.Vector3(0,1.5,0)
)
);

this.bL.forEach(b=>{

const c=this.prj(b.o,3.3);

if(c.z<1){

b.e.style.display="block";
b.e.style.left=c.x+"px";
b.e.style.top=c.y+"px";

}else{

b.e.style.display="none";

}

});

if(this.st.length){

const top=this.st[this.st.length-1];

const c=this.prj(
this.p,
3.2+this.st.length*.6
);

if(c.z<1){

this.iL.style.display="block";
this.iL.style.left=c.x+"px";
this.iL.style.top=c.y+"px";
this.iL.innerText=T_NAMES[top.type];
this.iL.style.background=T_COLORS[top.type];
this.iL.style.color=
top.type===0?"#000":"#fff";

}else{

this.iL.style.display="none";

}

}else{

this.iL.style.display="none";

}

for(
let i=this.tr.length-1;
i>=0;
i--
){

const tr=this.tr[i];

if(
this.p.position.distanceTo(tr.position)<2
){

this.e.sc.remove(tr);

this.tr.splice(i,1);

tr.position.set(
0,
2+this.st.length*.7,
0
);

tr.rotation.set(0,0,0);

this.p.add(tr);

this.st.push(tr);

const c=this.prj(
this.p,
4
);

U.floatTxt(
c.x,
c.y,
"✨ + BASURA",
"#8dffc3"
);

}

}

if(this.st.length){

const top=this.st[this.st.length-1];

for(const b of this.b){

if(
this.p.position.distanceTo(b.position)<3.5
){

if(top.type===b.type){

this.p.remove(top);

this.st.pop();

this.pts+=15;

this.t=Math.min(
this.mT,
this.t+3
);

this.collectEffect(
this.p.position.clone(),
T_COLORS[top.type]
);

const c=this.prj(
this.p,
5
);

U.floatTxt(
c.x,
c.y,
"+15 ✨",
"#35e58a"
);

break;

}else if(!this.errC){

this.t-=5;

const c=this.prj(
this.p,
5
);

U.floatTxt(
c.x,
c.y,
"-5s ✕",
"#ff6269"
);

this.errC=true;

setTimeout(()=>{
this.errC=false;
},1500);

}

}

}

}

if(
this.tr.length===0&&
this.st.length===0
){

this.l++;

this.tC+=3;

this.mT=Math.max(
20,
this.mT-2
);

this.t=this.mT;

this.bS(
this.l>3?
(this.l%3)+1:
this.l
);

this.sT();

}

this.e.ren.render(
this.e.sc,
this.e.cam
);

}

};

window.onload=()=>G.init();