// Decorative research studies. Coordinates are synthetic, not experimental data.
// The same geometry supplies the static HTML and the animated enhancement.
const TAU = Math.PI * 2;
const green = '#486b59', copper = '#ae7354', gold = '#bba57c';
const round = n => Math.round(n * 100) / 100;
const point = (x, y) => `${round(x)},${round(y)}`;
const line = (a, b, stroke, width = 1, opacity = 1) => ({tag:'line', attrs:{x1:round(a.x),y1:round(a.y),x2:round(b.x),y2:round(b.y),stroke,'stroke-width':width,opacity:round(opacity),'stroke-linecap':'round'}});
const circle = (x, y, r, fill, opacity = 1) => ({tag:'circle',attrs:{cx:round(x),cy:round(y),r:round(r),fill,opacity:round(opacity)}});
const path = (d, attrs) => ({tag:'path',attrs:{d,...attrs}});

function helix(t, pointer) {
  const shapes = [], rotation = -.38 + pointer.y * .05;
  function p(u, strand) {
    const angle = u * TAU * 1.65 + t * .36 + strand * Math.PI + pointer.x * .3;
    const z = Math.cos(angle), x = Math.sin(angle) * 53, y = (u - .5) * 223;
    return {x:210 + x * Math.cos(rotation) - y * Math.sin(rotation),y:140 + x * Math.sin(rotation) + y * Math.cos(rotation),z};
  }
  // Paired rungs and depth-shaded backbones rotate around the same axis.
  for (let i = 0; i < 21; i++) {
    const a=p(i/20,0), b=p(i/20,1), mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    shapes.push(line(a,mid,green,1.5,.2 + (a.z+1)*.23),line(mid,b,copper,1.5,.2 + (b.z+1)*.23));
  }
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < 64; i++) {
      const a=p(i/64,s), b=p((i+1)/64,s), depth=(a.z+1)/2;
      shapes.push(line(a,b,s?copper:green,round(1.4+depth*2.2),.2+depth*.78));
    }
  }
  for (let i = 0; i < 21; i++) for (let s = 0; s < 2; s++) {
    const a=p(i/20,s), depth=(a.z+1)/2;
    shapes.push(circle(a.x,a.y,2.2+depth*2.4,s?copper:green,.28+depth*.72));
    shapes.push(circle(a.x-.7,a.y-.9,.85,'#fffdf7',.2+depth*.45));
  }
  return shapes;
}

function network(t, pointer) {
  const shapes=[], counts=[4,6,5,3];
  const layers=counts.map((count,l)=>Array.from({length:count},(_,n)=>({x:65+l*96+Math.sin(t*.35+n)*2+pointer.x*(l-1.5)*2,y:140+(n-(count-1)/2)*35+Math.sin(t*.5+l+n*.6)*3+pointer.y*3})));
  for (let l=0;l<layers.length-1;l++) {
    for (const a of layers[l]) for (const b of layers[l+1]) {
      shapes.push(path(`M${point(a.x,a.y)} C${point(a.x+43,a.y)} ${point(b.x-43,b.y)} ${point(b.x,b.y)}`,{fill:'none',stroke:green,'stroke-width':.65,opacity:.16}));
    }
  }
  // Each signal travels through the layers in order, then rests briefly.
  const routes=[[1,2,1,1],[3,4,3,2],[0,1,2,0]];
  const phases=routes.map((_,route)=>(t*.48+route*1.3)%4);
  for(let route=0;route<routes.length;route++) {
    for(let l=0;l<3;l++) {
      const a=layers[l][routes[route][l]], b=layers[l+1][routes[route][l+1]];
      const d=`M${point(a.x,a.y)} C${point(a.x+43,a.y)} ${point(b.x-43,b.y)} ${point(b.x,b.y)}`;
      shapes.push(path(d,{fill:'none',stroke:route===1?copper:green,'stroke-width':1.2,opacity:.35}));
      const u=Math.max(0,Math.min(1,phases[route]-l)), v=1-u;
      const x=v*v*v*a.x+3*v*v*u*(a.x+43)+3*v*u*u*(b.x-43)+u*u*u*b.x;
      const y=v*v*v*a.y+3*v*v*u*a.y+3*v*u*u*b.y+u*u*u*b.y;
      const fade=Math.sin(u*Math.PI);
      shapes.push(circle(x,y,6,route===1?copper:green,.07*fade),circle(x,y,2.5,route===1?copper:green,.9*fade));
    }
  }
  layers.forEach((layer,l)=>layer.forEach((p,n)=>{
    const pulse=Math.max(0,...routes.map((route,r)=>route[l]===n?Math.max(0,1-Math.abs(phases[r]-l)/.48):0)), color=l===3?copper:green;
    shapes.push(circle(p.x,p.y,8+pulse*3,color,.055+pulse*.045));
    shapes.push(circle(p.x,p.y,4.1,'#faf9f3'));
    shapes.push({tag:'circle',attrs:{cx:round(p.x),cy:round(p.y),r:4.1,fill:color,'fill-opacity':round(.25+pulse*.65),stroke:color,'stroke-width':1}});
  }));
  return shapes;
}

function distribution(t, pointer) {
  const shapes=[], mu=193+Math.sin(t*.24)*12+pointer.x*8, sigma=47+Math.sin(t*.19)*3;
  const shoulder=38+Math.sin(t*.16)*5;
  const density=x=>Math.exp(-.5*((x-mu)/sigma)**2)*126+Math.exp(-.5*((x-282)/27)**2)*shoulder;
  const pts=Array.from({length:83},(_,i)=>{const x=44+i*4;return {x,y:216-density(x)};});
  const d=pts.map((p,i)=>`${i?'L':'M'}${point(p.x,p.y)}`).join(' ');
  shapes.push(path(`${d} L372,216 L44,216 Z`,{fill:'url(#distribution-wash)',stroke:'none'}));
  // Fine guide lines give the form a plotted, rather than decorative-wave, quality.
  for(let i=1;i<=3;i++) shapes.push(line({x:44,y:216-i*46},{x:373,y:216-i*46},green,.7,.1));
  shapes.push(line({x:44,y:216},{x:375,y:216},green,1,.35));
  shapes.push(line({x:mu,y:53},{x:mu,y:228},copper,1,.35));
  shapes.push(path(d,{fill:'none',stroke:green,'stroke-width':2.3,'stroke-linecap':'round'}));
  for(let i=0;i<57;i++) {
    const u=((i*37)%59+.5)/59, v=((i*23)%61+.5)/61;
    const sample=Math.sqrt(-2*Math.log(Math.max(.03,u)))*Math.cos(TAU*v);
    const x=Math.max(49,Math.min(368,mu+sample*sigma*.87));
    const y=231+(i%3)*7+Math.sin(t*.7+i)*1.5;
    shapes.push(circle(x,y,1.8+(i%3)*.3,i%5===0?copper:green,.35+(i%4)*.12));
  }
  for(let i=0;i<12;i++) {
    const x=78+i*24, y=216-density(x)+Math.sin(i*1.7)*15;
    shapes.push(circle(x,y,2.3,gold,.72));
  }
  shapes.push(circle(mu,216-density(mu),4,copper));
  return shapes;
}

const scenes={helix,network,distribution};
const frame=(kind,t,pointer={x:0,y:0})=>scenes[kind](t,pointer);

export function scienceFigure(kind) {
  if(!scenes[kind]) throw new Error(`Unknown science study: ${kind}`);
  const shapes=frame(kind,0).map(({tag,attrs})=>`<${tag} ${Object.entries(attrs).map(([k,v])=>`${k}="${v}"`).join(' ')} />`).join('');
  const defs=kind==='distribution'?'<defs><linearGradient id="distribution-wash" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#78937b" stop-opacity=".25"/><stop offset="1" stop-color="#78937b" stop-opacity=".02"/></linearGradient></defs>':'';
  return `<svg class="science-study" data-science="${kind}" viewBox="0 0 420 280" aria-hidden="true" focusable="false">${defs}<g data-science-shapes>${shapes}</g></svg>`;
}

function startStudies() {
  const figures=Array.from(document.querySelectorAll('[data-science]'));
  if(!figures.length) return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const control=document.querySelector('[data-science-toggle]');
  let paused=false, printing=false, request=0, previous=0, elapsed=0;
  const studies=figures.map(svg=>({svg,kind:svg.dataset.science,nodes:Array.from(svg.querySelector('[data-science-shapes]').children),visible:false,pointer:{x:0,y:0},target:{x:0,y:0}}));
  function draw(study) {
    study.pointer.x+=(study.target.x-study.pointer.x)*.06;
    study.pointer.y+=(study.target.y-study.pointer.y)*.06;
    frame(study.kind,elapsed,study.pointer).forEach(({attrs},i)=>{
      const node=study.nodes[i];
      for(const [key,value] of Object.entries(attrs)) if(node.getAttribute(key)!==String(value)) node.setAttribute(key,value);
    });
  }
  function tick(now) {
    request=0;
    if(previous && now-previous<33) { request=requestAnimationFrame(tick); return; }
    elapsed+=previous?Math.min((now-previous)/1000,.1):0;
    previous=now;
    studies.forEach(study=>{if(study.visible) draw(study);});
    request=requestAnimationFrame(tick);
  }
  function update() {
    const enabled=!paused&&!preference.matches&&!document.hidden&&!printing;
    studies.forEach(study=>{study.svg.dataset.motion=enabled&&study.visible?'playing':'still';});
    if(enabled&&studies.some(study=>study.visible)) {
      if(!request) request=requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(request); request=0; previous=0;
    }
    if(control) {
      control.hidden=preference.matches;
      control.dataset.paused=String(paused);
      control.querySelector('[data-science-label]').textContent=paused?control.dataset.resume:control.dataset.pause;
    }
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{studies.find(study=>study.svg===entry.target).visible=entry.isIntersecting;});
    update();
  });
  studies.forEach(study=>{
    observer.observe(study.svg);
    study.svg.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse') return;
      const box=study.svg.getBoundingClientRect();
      study.target={x:(event.clientX-box.left)/box.width*2-1,y:(event.clientY-box.top)/box.height*2-1};
    });
    study.svg.addEventListener('pointerleave',()=>{study.target={x:0,y:0};});
  });
  control?.addEventListener('click',()=>{paused=!paused;update();});
  preference.addEventListener('change',update);
  document.addEventListener('visibilitychange',update);
  window.addEventListener('beforeprint',()=>{printing=true;update();});
  window.addEventListener('afterprint',()=>{printing=false;update();});
  update();
}

if(typeof document!=='undefined' && 'IntersectionObserver' in window) startStudies();
