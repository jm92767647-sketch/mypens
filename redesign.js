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
  'Ballpoint Pen':{art:artOf(56),ko:'볼펜',note:()=>`${two(daily('Ballpoint Pen').length)} PENS`},
  'Multi Pen':{art:artOf(46),ko:'멀티펜',note:()=>`${two(daily('Multi Pen').length)} PENS`},
  'Mechanical Pencil':{art:artOf(68),ko:'샤프펜슬',note:()=>`${two(daily('Mechanical Pencil').length)} PENS`},
  'Fountain Pen':{art:artOf(11),ko:'만년필',note:()=>`${two(fountain.length)} PENS`},
  'By Brand':{art:artOf(11),ko:'브랜드별',note:()=>`${two(fountainBrands.length)} MAKERS`},
  'By Style':{art:artOf(12),ko:'스타일별',note:()=>`${two(fountainStyles.length)} STYLES`}
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
   const show=()=>setHero(i);
   button.addEventListener('mouseenter',show);
   button.addEventListener('focus',show);
  });
  const want=stage==='types'?buttons.length-1:0;
  if(heroIndex===null||heroIndex>=buttons.length)setHero(want,true);
  else setHero(heroIndex,true);
 }
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
  setTimeout(paint,170);
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
 const numbers=$('#numbers'),oldButton=$('#number');
 const openButton=document.createElement('button');
 openButton.id='index-open';openButton.type='button';
 openButton.setAttribute('aria-haspopup','dialog');
 openButton.setAttribute('aria-label','컬렉션 통계');
 openButton.innerHTML='<span class="ix-dots" aria-hidden="true">'+'<i></i>'.repeat(3)+'</span>';
 header.append(openButton);
 function foldSections(){
  if(!numbers)return;
  numbers.querySelectorAll('.number-section').forEach(section=>{
   if(section.closest('details'))return;
   const heading=section.querySelector('h3');
   const list=section.querySelector('ul');
   if(!heading||!list)return;
   const fold=document.createElement('details');
   const summary=document.createElement('summary');
   summary.innerHTML=`<span>${heading.textContent} · ${String(list.children.length).padStart(2,'0')}</span><span class="ix-sign">+</span>`;
   section.replaceWith(fold);fold.append(summary,section);
  });
 }
 openButton.onclick=()=>{oldButton?.click();setTimeout(foldSections,0)};

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
