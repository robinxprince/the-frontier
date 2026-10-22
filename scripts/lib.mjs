import fs from 'node:fs';
import {Marked} from 'marked';
export const topics=JSON.parse(fs.readFileSync(new URL('../data/topics.json',import.meta.url)));
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const safeURL=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}};
const md=new Marked({renderer:{html:({text})=>esc(text),image:({text})=>esc(text),link({href,tokens}){return safeURL(href)?`<a href="${esc(href)}" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`:this.parser.parseInline(tokens)}}});
export const render=s=>md.parse(s);
export function parseEdition(raw,file='edition'){
 const match=raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);if(!match)throw Error(`${file}: JSON front matter required`);
 const meta=JSON.parse(match[1]);
 for(const k of ['title','date','description','kind'])if(typeof meta[k]!=='string'||!meta[k].trim())throw Error(`${file}: missing ${k}`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)||new Date(meta.date).toISOString().slice(0,10)!==meta.date)throw Error('Invalid date');
 if(!['briefing','guide'].includes(meta.kind))throw Error('Invalid kind');
 if(!Array.isArray(meta.topics)||!meta.topics.length||meta.topics.some(t=>!topics.some(x=>x.id===t)))throw Error('Invalid topics');
 const body=match[2];if(body.length<300)throw Error('Edition too short');
 const links=[...body.matchAll(/\]\((https:\/\/[^\s)]+)\)/g)].map(x=>x[1]);
 if(!links.length)throw Error('Sources required');
 if(meta.kind==='briefing')for(const section of ['The big picture','Signals','The rabbit hole','Connect the dots','The unsolved problem','Watch and learn','Communities','One question'])if(!body.toLowerCase().includes('## '+section.toLowerCase()))throw Error(`Missing section: ${section}`);
 return {...meta,body,links};
}
export function editions(){return fs.readdirSync('content/editions').filter(x=>x.endsWith('.md')).map(file=>({...parseEdition(fs.readFileSync('content/editions/'+file,'utf8'),file),slug:file.slice(0,-3)})).sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug))}
