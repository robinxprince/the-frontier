import {esc,render} from './lib.mjs';
import {splitSections,sectionId} from './edition.mjs';
export const signalId=title=>'signal-'+sectionId(title).slice('section-'.length);
export const imageTag=(key,images,url,cls='',priority=false)=>{
 const i=images[key];if(!i)throw Error('Unknown image '+key);
 return `<img class="${cls}" src="${url(i.file)}" alt="${esc(i.alt)}" width="${i.width}" height="${i.height}" ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
};
export function signals(edition){
 const section=splitSections(edition.body).find(s=>s.title.toLowerCase()==='signals');
 const items=[];
 for(const t of section?.tokens||[]){if(t.type==='heading'&&t.depth===3)items.push({title:t.text});else if(t.type==='paragraph'&&items.length&&!items.at(-1).lead)items.at(-1).lead=render(t.raw)}
 return items.map(s=>({...s,image:edition.visuals?.[s.title],id:signalId(s.title)}));
}
export function editionSpread(e,{images,url,date,topicNames}){
 const keys=[e.cover,...Object.values(e.visuals||{})].filter((k,i,a)=>k&&a.indexOf(k)===i&&images[k]).slice(0,1);
 return `<article class="edition-row edition-spread" data-search="${esc((e.title+' '+e.description+' '+topicNames(e)).toLowerCase())}" data-topics="${e.topics.join(' ')}"><a class="edition-row-visual" href="${url('editions/'+e.slug+'/')}" aria-label="Open ${esc(e.title)}">${keys.map(k=>imageTag(k,images,url)).join('')}</a><div class="edition-row-copy"><h2><a href="${url('editions/'+e.slug+'/')}">${esc(e.title)}</a></h2><div class="edition-facts"><time datetime="${e.date}">${date(e.date)}</time><span>${signals(e).length} discoveries</span></div><p>${esc(e.description)}</p><p class="meta">${esc(topicNames(e))}</p><a class="text-link" href="${url('editions/'+e.slug+'/')}">Read the edition <span aria-hidden="true">↗</span></a></div></article>`;
}
