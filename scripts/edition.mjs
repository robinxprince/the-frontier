import {Marked} from 'marked';
import {esc,render} from './lib.mjs';
const lexer=new Marked();
export const sectionId=s=>'section-'+s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function splitSections(body){
 const sections=[];
 for(const token of lexer.lexer(body)){
  if(token.type==='heading'&&token.depth===2)sections.push({title:token.text,tokens:[]});
  else {if(!sections.length)sections.push({title:'Introduction',tokens:[]});sections.at(-1).tokens.push(token)}
 }
 return sections;
}
function entries(tokens){
 const intro=[],items=[];
 for(const t of tokens){if(t.type==='heading'&&t.depth===3)items.push({title:t.text,tokens:[]});else (items.length?items.at(-1).tokens:intro).push(t)}
 return {intro,items};
}
const content=tokens=>render(tokens.map(t=>t.raw).join(''));
export function figure(key,images,url,cover=false){
 const i=images[key];if(!i)throw Error('Unknown editorial image: '+key);
 return `<figure class="edition-figure${cover?' edition-cover-image':''}"><div><img src="${url(i.file)}" alt="${esc(i.alt)}" width="${i.width}" height="${i.height}" ${cover?'fetchpriority="high"':'loading="lazy"'} decoding="async"></div><figcaption><a href="${url('about/#image-credits')}">${esc(i.caption)} Source & license</a></figcaption></figure>`;
}
function experiment(){
 return `<div class="inverse-experiment" data-experiment="inverse-problems"><div><h3>Try changing the hidden pattern</h3><p>Different arrangements can give a sensor the same reading. Pick a pattern and compare the measurement.</p><div class="pattern-controls" role="group" aria-label="Choose a hidden pixel pattern"><button data-pattern="vertical" aria-pressed="true">Vertical stripes</button><button data-pattern="horizontal" aria-pressed="false">Horizontal stripes</button><button data-pattern="checker" aria-pressed="false">Checkerboard</button></div><p class="pattern-result" role="status" aria-live="polite">Every two-by-two block is 50% light. All three patterns produce the same average.</p></div><div class="experiment-pictures"><figure><div class="pixel-grid" role="img" aria-label="Vertical stripes, 8 by 8 pixels">${Array.from({length:64},(_,i)=>`<i class="${i%2?'light':''}"></i>`).join('')}</div><figcaption>Hidden pattern · 8 × 8</figcaption></figure><figure><div class="average-grid" role="img" aria-label="Sixteen block averages, all 50 percent light">${'<i></i>'.repeat(16)}</div><figcaption>Sensor reading · 4 × 4</figcaption></figure></div><p class="experiment-note">Illustrative noiseless example: averaging removes arrangement, so the reading cannot uniquely reconstruct the original. Without scripts, compare the vertical stripes with the uniform averages.</p></div>`;
}
export function editionPage({edition:e,images,url,date,topics}){
 const sections=splitSections(e.body),minutes=Math.ceil(e.body.split(/\s+/).length/210);
 const heading=`<section class="edition-opening${e.cover?' has-cover':''}"><div class="edition-opening-copy"><h1>${esc(e.title)}</h1><p class="edition-deck">${esc(e.description)}</p><div class="edition-facts"><time datetime="${e.date}">${date(e.date)}</time><span>${e.kind==='guide'?'Opening guide':'Research edition'}</span><span>${minutes} min read</span></div><a class="button" href="#${sectionId(sections[0].title)}">Start this edition <span aria-hidden="true">↓</span></a><div class="edition-topics">${e.topics.map(t=>`<a href="${url('topics/'+t+'/')}">${esc(topics.find(x=>x.id===t).name)}</a>`).join('')}</div></div>${e.cover?figure(e.cover,images,url,true):''}</section>`;
 const nav=`<aside class="edition-navigator"><nav aria-label="In this edition"><h2>In this edition</h2>${sections.map(s=>`<a href="#${sectionId(s.title)}">${esc(s.title)}</a>`).join('')}</nav><a href="${url('markdown/'+e.slug+'.md')}">Download Markdown</a><a href="https://github.com/robinxprince/the-frontier/commits/main/content/editions/${e.slug}.md">Revision history</a></aside>`;
 const body=sections.map(s=>{
  const id=sectionId(s.title),title=s.title.toLowerCase(),{intro,items}=entries(s.tokens);
  if(title==='signals'&&items.length){
   return `<section class="edition-section signal-section" id="${id}"><div class="edition-section-intro"><h2>${esc(s.title)}</h2><p>${items.length} discoveries. Start with the idea, then open the mechanism and evidence.</p><div class="depth-controls" hidden><button data-depth="skim" aria-pressed="true">Highlights</button><button data-depth="full" aria-pressed="false">Full analysis</button></div></div>${content(intro)}<div class="edition-signals">${items.map(item=>{
    const key=e.visuals?.[item.title];const first=item.tokens.findIndex(t=>t.type==='paragraph'&&!(t.text.includes(' · ')&&t.text.length<90));
    const lead=first>=0?content([item.tokens[first]]):'';const rest=item.tokens.filter((t,i)=>i!==first);
    return `<article class="signal-story" id="signal-${sectionId(item.title).slice(8)}">${key?figure(key,images,url):''}<div class="signal-copy"><h3>${esc(item.title)}</h3><div class="signal-lead">${lead}</div><details class="signal-analysis"><summary>Mechanism, evidence & sources</summary><div class="edition-prose">${content(rest)}</div></details></div></article>`;
   }).join('')}</div></section>`;
  }
  const interactive=title==='the rabbit hole'&&e.interactive==='inverse-problems'?experiment():'';
  const videoItems=title==='watch and learn'&&items.length?`<div class="edition-learning">${items.map(item=>`<article class="learning-story"><h3>${esc(item.title)}</h3>${content(item.tokens)}</article>`).join('')}</div>`:null;
  return `<section class="edition-section ${title==='one question'?'question-section':''}" id="${id}"><h2>${esc(s.title)}</h2><div class="edition-prose">${videoItems?content(intro)+videoItems:content(s.tokens)}</div>${interactive}</section>`;
 }).join('');
 return `${heading}<div class="edition-reading">${nav}<article class="edition-content">${body}</article></div><section class="reading-note"><h2>Keep exploring</h2><a class="button" href="${url('archive/')}">Browse the archive <span aria-hidden="true">↗</span></a></section>`;
}
