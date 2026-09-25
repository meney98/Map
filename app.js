const vp=document.querySelector('#viewport'),stage=document.querySelector('#stage'),labels=document.querySelector('#labels'),q=document.querySelector('#q'),status=document.querySelector('#status');
let s=.7,x=0,y=70,drag=false,sx=0,sy=0,ox=0,oy=0,data=[];
const apply=()=>stage.style.transform=`translate(${x}px,${y}px) scale(${s})`;
function fit(){s=Math.min(vp.clientWidth/1440,vp.clientHeight/1188.3);x=(vp.clientWidth-1440*s)/2;y=(vp.clientHeight-1188.3*s)/2;apply()}
function zoom(f,cx=vp.clientWidth/2,cy=vp.clientHeight/2){const ns=Math.max(.15,Math.min(6,s*f));x=cx-(cx-x)*ns/s;y=cy-(cy-y)*ns/s;s=ns;apply()}
vp.onpointerdown=e=>{drag=true;vp.classList.add('dragging');sx=e.clientX;sy=e.clientY;ox=x;oy=y;vp.setPointerCapture(e.pointerId)};
vp.onpointermove=e=>{if(drag){x=ox+e.clientX-sx;y=oy+e.clientY-sy;apply()}};
vp.onpointerup=()=>{drag=false;vp.classList.remove('dragging')};
vp.onwheel=e=>{e.preventDefault();const r=vp.getBoundingClientRect();zoom(e.deltaY<0?1.15:.87,e.clientX-r.left,e.clientY-r.top)},{passive:false};
document.querySelector('#plus').onclick=()=>zoom(1.25);document.querySelector('#minus').onclick=()=>zoom(.8);document.querySelector('#fit').onclick=fit;
document.querySelector('#clear').onclick=()=>{q.value='';search('')};

// Hide B reference numbers from our household-name layer.
const isBNumber=n=>/^\(?\s*B\s*-?\s*\d+\s*\)?$/i.test((n||'').trim());

// Combine source words that belong to one nearby household name.
function groupHouseNames(items){
  const clean=items.filter(h=>h.name&&!isBNumber(h.name));
  clean.sort((a,b)=>a.y-b.y||a.x-b.x);
  const rows=[];
  for(const h of clean){let row=rows.find(r=>Math.abs(r.y-h.y)<=7);if(!row){row={y:h.y,items:[]};rows.push(row)}row.items.push(h)}
  const out=[];
  for(const row of rows){
    row.items.sort((a,b)=>a.x-b.x);let g=[];
    const flush=()=>{if(!g.length)return;const name=g.map(v=>v.name).join(' ').replace(/\s+/g,' ').trim();out.push({name,x:g.reduce((a,v)=>a+v.x,0)/g.length,y:g.reduce((a,v)=>a+v.y,0)/g.length});g=[]};
    for(const h of row.items){if(g.length&&h.x-g[g.length-1].x>430)flush();g.push(h)}flush();
  }
  return out;
}

// Smaller text for longer household names so labels stay inside compact blocks.
function fontFor(name){const n=name.length;if(n>26)return 4.4;if(n>20)return 4.8;if(n>15)return 5.2;if(n>10)return 5.7;return 6.2}

fetch('houses.json').then(r=>r.json()).then(raw=>{
  data=groupHouseNames(raw);
  for(const h of data){
    const a=document.createElement('span');
    a.className='label';a.textContent=h.name;a.dataset.name=h.name.toLowerCase();
    a.style.left=(h.x/10)+'px';a.style.top=(h.y/10)+'px';a.style.fontSize=fontFor(h.name)+'px';
    a.onclick=e=>{e.stopPropagation();q.value=h.name;search(h.name)};
    labels.appendChild(a);
  }
  status.textContent=`${data.length} household/place names`;fit();
});

function search(v){
  v=v.trim().toLowerCase();let first=null,n=0;
  for(const a of labels.children){
    const hit=!!v&&a.dataset.name.includes(v);
    a.classList.toggle('hit',hit);a.style.display='block';
    if(hit&&!first)first=a;if(hit)n++;
  }
  status.textContent=v?`${n} match${n===1?'':'es'}`:`${data.length} household/place names`;
  if(first){const px=parseFloat(first.style.left),py=parseFloat(first.style.top);s=Math.max(s,3.2);x=vp.clientWidth/2-px*s;y=vp.clientHeight/2-py*s;apply()}
}
q.oninput=()=>search(q.value);window.onresize=fit;apply();
