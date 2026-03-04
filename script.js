(function(){
"use strict";

const canvas=document.getElementById("bg");
const ctx=canvas.getContext("2d",{alpha:false});
const parEls=document.querySelectorAll(".parallax");
const reveals=document.querySelectorAll(".reveal");
const themeToggle=document.getElementById("themeToggle");
const loader=document.getElementById("loader");
const socialBtns=document.querySelectorAll(".social-btn[data-magnet!='false']");
const isTouch=("ontouchstart" in window)||navigator.maxTouchPoints>0;

let DPR=Math.min(window.devicePixelRatio||1,2);
let W=innerWidth,H=innerHeight;

function resizeCanvas(){ DPR=Math.min(window.devicePixelRatio||1,2); W=window.innerWidth; H=window.innerHeight; canvas.width=Math.round(W*DPR); canvas.height=Math.round(H*DPR); canvas.style.width=W+"px"; canvas.style.height=H+"px"; ctx.setTransform(DPR,0,0,DPR,0,0);}
window.addEventListener("resize",resizeCanvas,{passive:true});
resizeCanvas();

/* Pointer */
const pointer={x:null,y:null,moved:false};
canvas.addEventListener("pointermove",e=>{pointer.x=e.clientX;pointer.y=e.clientY;pointer.moved=true;});
canvas.addEventListener("pointerleave",()=>{pointer.x=null;pointer.y=null;pointer.moved=false;});

/* Particles */
class Particle{ constructor(){ this.reset(true);} reset(initial=true){ this.x=Math.random()*W; this.y=Math.random()*H; this.vx=(Math.random()-0.5)*0.6; this.vy=(Math.random()-0.5)*0.6; this.r=Math.random()*2.1+0.8;} update(){ this.x+=this.vx; this.y+=this.vy; if(this.x<-10||this.x>W+10)this.vx*=-1; if(this.y<-10||this.y>H+10)this.vy*=-1; if(pointer.x!==null&&pointer.y!==null){ const dx=this.x-pointer.x, dy=this.y-pointer.y, d2=dx*dx+dy*dy; if(d2<120*120){ const f=0.02*(1-Math.sqrt(d2)/120); this.x+=dx*f; this.y+=dy*f;}}} draw(hue){ ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=`hsl(${hue},78%,57%)`; ctx.fill(); } }
let PARTICLE_COUNT=isTouch?70:140;
let particles=[];
function initParticles(count=PARTICLE_COUNT){ particles=[]; for(let i=0;i<count;i++)particles.push(new Particle()); }
initParticles();

function connectParticles(hue){ for(let i=0;i<particles.length;i++){ for(let j=i+1;j<particles.length;j++){ const a=particles[i],b=particles[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy; if(d2<12000){ ctx.beginPath(); ctx.strokeStyle=`hsla(${hue},78%,66%,${0.12*(1-d2/12000)})`; ctx.lineWidth=0.9; ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }}}}

let hue=200;
function drawBackground(){ const g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,`hsl(${hue},62%,14%)`); g.addColorStop(1,`hsl(${(hue+60)%360},62%,9%)`); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); if(pointer.x!==null&&pointer.y!==null){ const rg=ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,150); rg.addColorStop(0,`hsla(${hue},100%,65%,0.14)`); rg.addColorStop(1,"transparent"); ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(pointer.x,pointer.y,150,0,Math.PI*2); ctx.fill();}}

function animate(){ hue=(hue+0.28)%360; drawBackground(); for(let i=0;i<particles.length;i++){particles[i].update();particles[i].draw(hue);} connectParticles(hue); requestAnimationFrame(animate);}
animate();

/* Parallax */
function updateParallax(){ const cx=pointer.x!==null?(pointer.x/W-0.5):0; const cy=pointer.y!==null?(pointer.y/H-0.5):0; const scrollFactor=(window.scrollY||window.pageYOffset)/(document.body.scrollHeight||1); parEls.forEach((el,idx)=>{ const speed=parseFloat(el.dataset.speed)||0.06; const tx=cx*speed*100+scrollFactor*(idx-1)*12; const ty=cy*speed*70+scrollFactor*(idx-1)*18; el.style.transform=`translate3d(${tx}px,${ty}px,0)`;}); requestAnimationFrame(updateParallax);}
updateParallax();

/* Scroll reveal */
if('IntersectionObserver' in window){ const obs=new IntersectionObserver((entries)=>{ entries.forEach(ent=>{ if(ent.isIntersecting)ent.target.classList.add('active'); else ent.target.classList.remove('active'); });},{threshold:0.15}); reveals.forEach(r=>obs.observe(r));}
else{ function fallbackReveal(){ const t=window.innerHeight*0.85; reveals.forEach(el=>{ const top=el.getBoundingClientRect().top; if(top<t)el.classList.add('active'); else el.classList.remove('active'); });} window.addEventListener('scroll',fallbackReveal,{passive:true}); fallbackReveal();}

/* Magnetic buttons */
const magnets=Array.from(document.querySelectorAll('.social-btn'));
const magnetState=new Map();
magnets.forEach(btn=>magnetState.set(btn,{tx:0,ty:0,scale:1}));
function updateMagnets(){ magnets.forEach(btn=>{ const rect=btn.getBoundingClientRect(); const centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2; let ms=magnetState.get(btn); if(!ms)ms={tx:0,ty:0,scale:1}; if(pointer.x!==null){ const dx=pointer.x-centerX,dy=pointer.y-centerY,dist=Math.sqrt(dx*dx+dy*dy); const threshold=Math.max(90,rect.width*1.8); if(dist<threshold){ const strength=0.18,factor=(1-(dist/threshold)); ms.tx=dx*strength*factor; ms.ty=dy*strength*factor; ms.scale=1+0.08*factor;} else{ ms.tx+=(0-ms.tx)*0.18; ms.ty+=(0-ms.ty)*0.18; ms.scale+=(1-ms.scale)*0.12;} }else{ ms.tx+=(0-ms.tx)*0.18; ms.ty+=(0-ms.ty)*0.18; ms.scale+=(1-ms.scale)*0.12;} btn.style.transform=`translate3d(${ms.tx.toFixed(2)}px,${ms.ty.toFixed(2)}px,0) scale(${ms.scale.toFixed(3)})`; magnetState.set(btn,ms); }); requestAnimationFrame(updateMagnets);}
updateMagnets();

/* Theme toggle */
const THEME_KEY="gaurav_theme_v1";
function setTheme(light){ if(light){ document.body.classList.add("light"); themeToggle.innerHTML='<i class="fas fa-sun"></i>'; } else{ document.body.classList.remove("light"); themeToggle.innerHTML='<i class="fas fa-moon"></i>'; } try{ localStorage.setItem(THEME_KEY,light?"light":"dark"); }catch(e){} }
(function initTheme(){ try{ const saved=localStorage.getItem(THEME_KEY); if(saved) setTheme(saved==="light"); else{ const prefersLight=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches; setTheme(prefersLight);}}catch(e){ setTheme(false);}})();
themeToggle.addEventListener('click',()=>{ const light=document.body.classList.toggle('light'); setTheme(light); });

/* Loader hide */
window.addEventListener('load',()=>{ setTimeout(()=>{ loader.style.opacity='0'; loader.style.pointerEvents='none'; setTimeout(()=>loader.classList.add('hidden'),450); },350); });

})();