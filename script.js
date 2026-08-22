const menuButton=document.getElementById("menuButton");
const navMenu=document.querySelector(".nav-menu");
const navLinks=document.querySelectorAll(".nav-link");
const sections=document.querySelectorAll("section[id]");
const gameCards=document.querySelectorAll(".game-card");
const visual=document.querySelector(".game-screen");

menuButton.addEventListener("click",()=>{
navMenu.classList.toggle("active");
});

navLinks.forEach(link=>{
link.addEventListener("click",()=>{
navMenu.classList.remove("active");
});
});

window.addEventListener("scroll",()=>{
let currentSection="";

sections.forEach(section=>{
const sectionTop=section.offsetTop-150;
const sectionHeight=section.offsetHeight;

if(window.scrollY>=sectionTop&&window.scrollY<sectionTop+sectionHeight){
currentSection=section.getAttribute("id");
}
});

navLinks.forEach(link=>{
link.classList.remove("active");

if(link.getAttribute("href")==="#"+currentSection){
link.classList.add("active");
}
});
});

const observer=new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("show-card");
}
});
},{threshold:.15});

gameCards.forEach(card=>{
observer.observe(card);
});

document.addEventListener("mousemove",event=>{
if(!visual||window.innerWidth<=1000)return;

const x=(window.innerWidth/2-event.clientX)/60;
const y=(window.innerHeight/2-event.clientY)/60;

visual.style.transform=`rotateY(${x*-1}deg) rotateX(${y}deg)`;
});

window.addEventListener("load",()=>{
document.body.classList.add("loaded");
});