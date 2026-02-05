const floor=document.getElementById('floor');
const panel=document.getElementById('panel');
const clock=document.getElementById('clock');

panel.innerHTML='<h1>Start</h1><p>Ziehe Möbel. Sie stoßen zusammen und haben Trägheit.</p>';

const furniture=[
"Bett","Sofa","Sessel","Couchtisch","Esstisch","Stuhl","Hocker","Schrank","Kleiderschrank",
"Kommode","Nachttisch","Regal","Bücherregal","Sideboard","Vitrine","Schreibtisch","Bürostuhl",
"TV-Board","Wohnwand","Bank","Truhe","Spiegel","Garderobe","Schuhschrank","Küchenzeile",
"Barhocker","Liege","Beistelltisch","Wickelkommode","Sekretär"
];

const objects=[];
const COPIES=3;

function createObj(title,sub){
  const el=document.createElement('div');
  el.className='obj';
  el.innerHTML=`<div class="obj__title">${title}</div><div class="obj__sub">${sub}</div>`;
  floor.appendChild(el);
  const o={el,x:Math.random()*500,y:Math.random()*300,vx:0,vy:0,w:150,h:86,drag:false};
  el.onpointerdown=e=>{o.drag=true;o.vx=o.vy=0;};
  window.onpointerup=()=>o.drag=false;
  window.onpointermove=e=>{
    if(!o.drag)return;
    o.x=e.clientX-75;o.y=e.clientY-43;
  };
  objects.push(o);
}

let i=1;
furniture.forEach(f=>{
  for(let c=0;c<COPIES;c++){
    createObj(f,'Objekt '+(i++));
  }
});

function step(){
  const W=floor.clientWidth,H=floor.clientHeight;
  objects.forEach(o=>{
    if(!o.drag){
      o.vy+=600*0.016;
      o.x+=o.vx*0.016;
      o.y+=o.vy*0.016;
      if(o.x<0||o.x+o.w>W)o.vx*=-0.8;
      if(o.y<0||o.y+o.h>H)o.vy*=-0.8;
    }
    o.el.style.left=o.x+'px';
    o.el.style.top=o.y+'px';
  });
  requestAnimationFrame(step);
}
step();

setInterval(()=>{
  clock.textContent=new Date().toLocaleTimeString('de-CH',{timeZone:'Europe/Zurich'});
},1000);
