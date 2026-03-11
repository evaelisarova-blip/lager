
const floor = document.getElementById("floor");
const clock = document.getElementById("clock");

const lightbox = document.getElementById("lightbox");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxImage = document.getElementById("lightboxImage");

const BOOKS = [
"./books/book1.jpg",
"./books/book2.jpg",
"./books/book3.jpg"
];

const FURNITURE=[
"Bett","Sofa","Stuhl","Tisch","Regal","Bücherregal","Kommode","Bank","Schrank"
];

const TOTAL_OBJECTS=15;
const objects=[];

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

function openBook(){
const book=BOOKS[Math.floor(Math.random()*BOOKS.length)];
lightboxImage.src=book;
lightbox.classList.add("is-open");
}

function closeBook(){
lightbox.classList.remove("is-open");
}

lightboxBackdrop.onclick=closeBook;
lightboxClose.onclick=closeBook;

function makeObject(title,click){
const el=document.createElement("div");
el.className="obj";
el.innerText=title;
floor.appendChild(el);

const o={el,x:0,y:0,vx:0,vy:0,drag:false};

el.onpointerdown=e=>{
o.drag=true;
};

window.onpointerup=e=>{
if(!o.drag) return;
o.drag=false;
if(click) click();
};

window.onpointermove=e=>{
if(!o.drag) return;
o.x=e.clientX-75;
o.y=e.clientY-40;
render(o);
};

objects.push(o);
}

function render(o){
o.el.style.left=o.x+"px";
o.el.style.top=o.y+"px";
}

function randomSpawn(){
const W=floor.clientWidth;
const H=floor.clientHeight;

objects.forEach(o=>{
o.x=Math.random()*(W-160);
o.y=Math.random()*(H-100);
render(o);
});
}

function init(){

clock.textContent=new Date().toLocaleTimeString("de-CH");

setInterval(()=>{
clock.textContent=new Date().toLocaleTimeString("de-CH");
},1000);

for(let i=0;i<TOTAL_OBJECTS;i++){
let name=FURNITURE[Math.floor(Math.random()*FURNITURE.length)];
if(name==="Bücherregal"){
makeObject(name,openBook);
}else{
makeObject(name);
}
}

randomSpawn();
}

init();
