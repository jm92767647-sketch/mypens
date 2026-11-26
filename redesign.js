/* 2026 refresh: always-on bar, LIST/ROAM, fanned entry, one INDEX mark. */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s),body=document.body;
 const header=document.querySelector('body > header');
 const pane=$('#catalog-pane');
 const pens=(typeof PENS!=='undefined'&&PENS)||window.PENS||[];
 const ART=window.PEN_ART||{};
 const artOf=id=>{const a=ART[id];return a?(a.previewPath||a.detailPath):''};

 const keepOpen=()=>{if(body.dataset.menuOpen!=='true'){body.dataset.menuOpen='true';header.inert=false;header.setAttribute('aria-hidden','false');}};
 keepOpen();new MutationObserver(keepOpen).observe(body,{attributes:true,attributeFilter:['data-menu-open']});

 const label=(sel,text)=>{const b=$(sel);if(b)b.textContent=text};
 label('[data-presentation-button="list"]','LIST');
 label('[data-presentation-button="free"]','ROAM');

 const entry=$('#collection-entry');
 const syncHome=()=>{body.dataset.entryHome=String(!!entry&&!entry.hidden)};
 if(entry){syncHome();new MutationObserver(syncHome).observe(entry,{attributes:true,attributeFilter:['hidden']});}

 const daily=g=>pens.filter(p=>p.section==='daily'&&p.group===g);
 const fountain=pens.filter(p=>p.section==='fountain');
 const fountainBrands=[...new Set(fountain.map(p=>(typeof brandOf==='function'?brandOf(p)[0]:'')||p.name.split(' ')[0]))].filter(Boolean);
 const fountainStyles=[...new Set(fountain.map(p=>p.style))].filter(Boolean);
 const two=n=>String(n).padStart(2,'0');
 const CARDS_META={
  'Ballpoint Pen':{art:artOf(64),ko:'볼펜',note:()=>`${two(daily('Ballpoint Pen').length)} PENS`},
  'Multi Pen':{art:artOf(47),ko:'멀티펜',note:()=>`${two(daily('Multi Pen').length)} PENS`},
  'Mechanical Pencil':{art:artOf(61),ko:'샤프펜슬',note:()=>`${two(daily('Mechanical Pencil').length)} PENS`},
  'Fountain Pen':{art:artOf(11),ko:'만년필',note:()=>`${two(fountain.length)} PENS`},
  'By Brand':{art:artOf(35),ko:'브랜드별',note:()=>`${two(fountainBrands.length)} MAKERS`},
  'By Style':{art:artOf(14),ko:'스타일별',note:()=>`${two(fountainStyles.length)} STYLES`}
 };
 const STAGE={types:['Elect','pens.'],fountain:['Fountain','pens.']};
 let heroIndex=null;
 function decorate(){
  if(!entry)return;
  const stage=entry.dataset.menu||'types';
  let hero=entry.querySelector('.entry-hero');
  if(!hero){
   hero=document.createElement('div');hero.className='entry-hero';hero.setAttribute('aria-hidden','true');
   hero.innerHTML='<div class="hero-text"><div class="hero-eyebrow"></div><div class="entry-heading"><span></span><em></em></div><p class="hero-sub"></p></div><img class="hero-pen" alt="" decoding="async">';
   entry.prepend(hero);
   heroIndex=null;
  }
  const words=STAGE[stage]||STAGE.types;
  hero.querySelector('.entry-heading span').textContent=words[0];
  hero.querySelector('.entry-heading em').textContent=words[1];

  const buttons=[...entry.querySelectorAll('.collection-choice')];
  entry.style.setProperty('--cols',String(Math.max(buttons.length,1)));
  buttons.forEach((button,i)=>{
   const title=button.querySelector('.collection-choice-title');
   const meta=CARDS_META[title?.textContent.trim()];
   if(!meta)return;
   button.dataset.heroName=title.textContent.trim();
   button.dataset.heroArt=meta.art;
   button.dataset.heroKo=meta.ko;
   button.dataset.heroNote=meta.note();
   button.dataset.heroNo=String(i+1).padStart(2,'0');
   if(button.dataset.carded)return;
   button.dataset.carded='true';
   const no=document.createElement('span');no.className='entry-card-no';no.textContent=button.dataset.heroNo;
   const count=document.createElement('span');count.className='entry-card-count';count.textContent=meta.note().replace(/\s*(PENS|MAKERS|STYLES)$/,'');
   const ko=document.createElement('span');ko.className='entry-card-ko';ko.textContent=meta.ko;
   button.prepend(no);
   button.append(count,ko);
   const show=()=>{setHero(i);autoplay()};
   button.addEventListener('mouseenter',show);
   button.addEventListener('focus',show);
  });
  const want=stage==='types'?buttons.length-1:0;
  if(heroIndex===null||heroIndex>=buttons.length)setHero(want,true);
  else setHero(heroIndex,true);
  autoplay();
 }
 let rotate=null;
 const phone=()=>matchMedia('(max-width:760px)').matches;
 function autoplay(){
  clearInterval(rotate);rotate=null;
  if(!entry||entry.hidden||!phone())return;
  rotate=setInterval(()=>{
   if(document.hidden||!entry||entry.hidden)return;
   const n=entry.querySelectorAll('.collection-choice').length;
   if(n>1)setHero(((heroIndex??0)+1)%n);
  },2700);
 }
 addEventListener('resize',autoplay);
 function setHero(i,instant){
  const hero=entry&&entry.querySelector('.entry-hero');
  if(!hero)return;
  const buttons=[...entry.querySelectorAll('.collection-choice')];
  const button=buttons[i];
  if(!button||!button.dataset.heroName)return;
  if(heroIndex===i&&!instant)return;
  heroIndex=i;
  buttons.forEach((b,n)=>b.classList.toggle('on',n===i));
  const paint=()=>{
   hero.querySelector('.hero-eyebrow').textContent=`${button.dataset.heroNo} — ${button.dataset.heroName.toUpperCase()}`;
   hero.querySelector('.hero-sub').textContent=`${button.dataset.heroKo} · ${button.dataset.heroNote}`;
   const img=hero.querySelector('.hero-pen');
   if(img.getAttribute('src')!==button.dataset.heroArt)img.src=button.dataset.heroArt;
   hero.classList.remove('swap');
  };
  if(instant){paint();return;}
  hero.classList.add('swap');
  setTimeout(paint,560);
 }
 if(entry){decorate();new MutationObserver(decorate).observe(entry,{childList:true});}

 /* directory rows */
 function groupPens(key){
  const section=pane?.dataset.catalogSection||'fountain';
  const sort=pane?.dataset.catalogSort||'brand';
  return pens.filter(p=>{
   if(p.section!==section)return false;
   if(section==='daily')return p.group===key;
   if(sort==='brand')return (((typeof brandOf==='function'?brandOf(p)[0]:'')||p.name.split(' ')[0])===key);
   return p.style===key;
  });
 }
 function decorateDirectory(){
  const directory=pane&&pane.querySelector('.catalog-directory');
  if(!directory)return;
  directory.querySelectorAll('.catalog-entry').forEach(button=>{
   if(button.dataset.rowed)return;
   const key=button.dataset.catalogGroup;
   if(!key)return;
   const group=groupPens(key);
   if(!group.length)return;
   button.dataset.rowed='true';
   if(!button.querySelector('.cat-name')){
    const span=document.createElement('span');span.className='cat-name';span.textContent=button.textContent.trim();
    button.textContent='';button.append(span);
   }
   const count=document.createElement('span');count.className='cat-count';count.textContent=String(group.length).padStart(2,'0');
   const arrow=document.createElement('span');arrow.className='cat-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='\u2192';
   button.append(count,arrow);
  });
 }
 if(pane){decorateDirectory();new MutationObserver(decorateDirectory).observe(pane,{childList:true,subtree:true});}

 /* INDEX mark opens the statistics */
 const openButton=document.createElement('button');
 openButton.id='index-open';openButton.type='button';
 openButton.setAttribute('aria-haspopup','dialog');
 openButton.setAttribute('aria-label','컬렉션 통계');
 openButton.innerHTML='<span class="ix-dots" aria-hidden="true">'+'<i></i>'.repeat(3)+'</span>';
 header.append(openButton);

 const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const bars=entries=>{
  const max=Math.max(...entries.map(([,n])=>n),1);
  return entries.map(([lab,n])=>`<div class="ix-bar"><span>${esc(lab)}</span><u style="--w:${Math.round(n/max*100)}%"></u><b>${String(n).padStart(2,'0')}</b></div>`).join('');
 };
 const fold=(title,count,entries)=>`<details><summary><span>${title} · ${String(count).padStart(2,'0')}</span><span class="ix-sum-right">COUNT<span class="ix-sign">+</span></span></summary><div class="ix-bars">${bars(entries)}</div></details>`;
 const brandName=p=>((typeof brandOf==='function'?brandOf(p)[0]:'')||p.name.split(' ')[0]);
 const sortCount=list=>list.sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));

 const dialog=document.createElement('dialog');
 dialog.id='index-dialog';dialog.setAttribute('aria-labelledby','index-title');
 document.body.append(dialog);
 function build(){
  const typeEntries=[['볼펜',daily('Ballpoint Pen').length],['멀티펜',daily('Multi Pen').length],['샤프펜슬',daily('Mechanical Pencil').length],['만년필',fountain.length]];
  const brandEntries=sortCount(fountainBrands.map(b=>[b,fountain.filter(p=>brandName(p)===b).length]));
  const styleEntries=sortCount(fountainStyles.map(st=>[st,fountain.filter(p=>p.style===st).length]));
  dialog.innerHTML=`<button type="button" class="ix-close" aria-label="닫기">✕</button><div class="ix-wrap">
   <div class="ix-head">
    <div><div class="ix-eyebrow">PEN COLLECTION × NUMBERS</div><h2 id="index-title">Index <em>&amp; Numbers</em></h2></div>
    <div class="ix-stats">
     <div><b>${pens.length}</b><span>PENS</span></div>
     <div><b>${fountain.length}</b><span>FOUNTAIN</span></div>
     <div><b>${fountainBrands.length}</b><span>BRANDS</span></div>
     <div><b>${String(fountainStyles.length).padStart(2,'0')}</b><span>STYLES</span></div>
    </div>
   </div>
   <div class="ix-folds">
    ${fold('종류별',typeEntries.length,typeEntries)}
    ${fold('브랜드별',brandEntries.length,brandEntries)}
    ${fold('스타일별',styleEntries.length,styleEntries)}
   </div>
  </div>`;
  dialog.querySelector('.ix-close').onclick=()=>dialog.close();
 }
 openButton.onclick=()=>{build();dialog.showModal()};
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
 });

 /* list and roam hand over behind a paper veil */
 const main=document.querySelector('main');
 const stillMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function handover(swap){
  if(stillMotion()||!main){swap();return}
  const veil=document.createElement('div');veil.className='mode-veil';document.body.append(veil);
  requestAnimationFrame(()=>{veil.dataset.on='1';main.dataset.modeLeaving='1'});
  setTimeout(()=>{
   swap();
   main.removeAttribute('data-mode-leaving');
   main.dataset.modeEntering='1';
   requestAnimationFrame(()=>veil.removeAttribute('data-on'));
   setTimeout(()=>{main.removeAttribute('data-mode-entering');veil.remove()},660);
  },280);
 }
 document.querySelectorAll('[data-presentation-button]').forEach(button=>{
  const original=button.onclick;
  if(!original)return;
  button.onclick=null;
  button.addEventListener('click',event=>{
   if(button.getAttribute('aria-pressed')==='true')return;
   handover(()=>original.call(button,event));
  });
 });
})();
