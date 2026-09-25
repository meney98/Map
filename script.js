
const v=document.getElementById('viewport'), stage=document.getElementById('stage');
const search=document.getElementById('search'), results=document.getElementById('results');
const hits=document.getElementById('hits'), card=document.getElementById('card'), houseName=document.getElementById('houseName');
let s=0.08,x=0,y=0,pointers=new Map(),lastDist=0,lastMid=null,dragStart=null,selected=null;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function fit(){
  const sw=14400,sh=11883, vw=v.clientWidth,vh=v.clientHeight;
  s=Math.min(vw/sw,vh/sh)*0.96; x=(vw-sw*s)/2; y=(vh-sh*s)/2; draw();
}
function draw(){stage.style.transform=`translate(${x}px,${y}px) scale(${s})`}
function zoomAt(cx,cy,newS){
  newS=clamp(newS,0.035,2.2);
  const mx=(cx-x)/s,my=(cy-y)/s;
  x=cx-mx*newS;y=cy-my*newS;s=newS;draw();
}
function focusLabel(d){
  const target=Math.max(s,0.75);
  x=v.clientWidth/2-d.x*target;y=v.clientHeight/2-d.y*target;s=target;draw();
  selectLabel(d);
}
function selectLabel(d){
  if(selected) selected.classList.remove('selected');
  selected=document.querySelector(`[data-i="${d.i}"]`);
  if(selected) selected.classList.add('selected');
  houseName.textContent=d.name;card.style.display='block';
}
const labels=(window.HOUSE_LABELS||[]).map((d,i)=>({...d,i}));
for(const d of labels){
  const b=document.createElement('button'); b.type='button'; b.className='hit'; b.dataset.i=d.i; b.title=d.name;
  const padX=Math.max(22,(d.x1-d.x0)*.35), padY=20;
  b.style.left=(d.x0-padX)+'px'; b.style.top=(d.y0-padY)+'px';
  b.style.width=(d.x1-d.x0+padX*2)+'px'; b.style.height=(d.y1-d.y0+padY*2)+'px';
  b.addEventListener('click',e=>{e.stopPropagation();selectLabel(d)});
  hits.appendChild(b);
}
search.addEventListener('input',()=>{
  const q=search.value.trim().toLowerCase(); results.innerHTML='';
  if(!q){results.style.display='none';return}
  const found=labels.filter(d=>d.name.toLowerCase().includes(q)).slice(0,30);
  for(const d of found){const b=document.createElement('button');b.type='button';b.className='result';b.textContent=d.name;
    b.addEventListener('click',()=>{search.value=d.name;results.style.display='none';focusLabel(d)});results.appendChild(b)}
  results.style.display=found.length?'block':'none';
});
search.addEventListener('keydown',e=>{
  if(e.key==='Enter'){const q=search.value.trim().toLowerCase();const d=labels.find(z=>z.name.toLowerCase()===q)||labels.find(z=>z.name.toLowerCase().includes(q));if(d){results.style.display='none';focusLabel(d)}}
});
document.getElementById('reset').addEventListener('click',()=>{card.style.display='none';search.value='';results.style.display='none';if(selected)selected.classList.remove('selected');selected=null;fit()});
document.getElementById('close').addEventListener('click',()=>{card.style.display='none';if(selected)selected.classList.remove('selected');selected=null});
v.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,s*(e.deltaY<0?1.18:.84))},{passive:false});
v.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});v.setPointerCapture(e.pointerId);dragStart={x:e.clientX,y:e.clientY,ox:x,oy:y};});
v.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const ps=[...pointers.values()];
  if(ps.length===1 && dragStart){x=dragStart.ox+(ps[0].x-dragStart.x);y=dragStart.oy+(ps[0].y-dragStart.y);draw()}
  if(ps.length===2){
    const dx=ps[0].x-ps[1].x,dy=ps[0].y-ps[1].y,dist=Math.hypot(dx,dy),mid={x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2};
    if(lastDist>0){zoomAt(mid.x,mid.y,s*(dist/lastDist)); if(lastMid){x+=mid.x-lastMid.x;y+=mid.y-lastMid.y;draw()}}
    lastDist=dist;lastMid=mid;dragStart=null;
  }
});
function end(e){pointers.delete(e.pointerId);if(pointers.size<2){lastDist=0;lastMid=null}if(pointers.size===1){const p=[...pointers.values()][0];dragStart={x:p.x,y:p.y,ox:x,oy:y}}else if(!pointers.size)dragStart=null}
v.addEventListener('pointerup',end);v.addEventListener('pointercancel',end);
window.addEventListener('resize',fit);fit();
