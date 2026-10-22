import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {safeURL,render,parseEdition,editions} from '../scripts/lib.mjs';
test('Markdown neutralizes scripts, images and dangerous links',()=>{const html=render('<script>alert(1)</script>\n\n[x](javascript:alert%281%29)\n\n![remote](https://example.org/track)');assert(!html.includes('<script>'));assert(!html.includes('href="javascript:'));assert(!html.includes('<img'));assert(safeURL('https://example.org/paper'));assert(!safeURL('https://user:pass@example.org'));assert(!safeURL('data:text/html,x'))});
test('rejects missing source citations and unstructured daily briefings',()=>{const guide=fs.readFileSync('content/editions/2026-10-22-start-here.md','utf8');assert.throws(()=>parseEdition(guide.replaceAll(/\]\(https:[^)]+\)/g,']')));assert.throws(()=>parseEdition(guide.replace('"guide"','"briefing"')));assert(editions().length>0)});
test('build supports GitHub project subpaths and all internal links resolve',()=>{execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,SITE_URL:'https://example.github.io/the-frontier'}});const files=fs.readdirSync('dist',{recursive:true}).filter(x=>x.endsWith('.html'));for(const file of files){const html=fs.readFileSync('dist/'+file,'utf8');for(const m of html.matchAll(/(?:href|src)="(\/the-frontier\/[^"#]*)"/g)){let p=m[1].slice('/the-frontier/'.length);if(!p||p.endsWith('/'))p+='index.html';assert(fs.existsSync('dist/'+p),file+' links to missing '+p)}assert(html.includes('id="main"'));}assert(fs.readFileSync('dist/rss.xml','utf8').includes('https://example.github.io/the-frontier/editions/'))});

test('homepage never labels an old briefing or a guide as today’s edition',async()=>{const {readingLabel}=await import('../scripts/home.mjs');assert.equal(readingLabel({kind:'guide',date:'2026-10-22'},'2026-10-22'),'Start reading');assert.equal(readingLabel({kind:'briefing',date:'2026-10-22'},'2026-10-22'),'Read today’s edition');assert.equal(readingLabel({kind:'briefing',date:'2026-10-21'},'2026-10-22'),'Read latest edition')});

test('visual editions use registered images and preserve analysis in static HTML',()=>{
 const e=fs.readFileSync('content/editions/2026-10-22.md','utf8');
 assert.throws(()=>parseEdition(e.replace('"cover": "eland"','"cover": "../../secret"')));
 assert.throws(()=>parseEdition(e.replace('"inverse-problems"','"unknown-script"')));
 const html=fs.readFileSync('dist/editions/2026-10-22/index.html','utf8');
 assert(html.includes('class="signal-analysis"'));
 assert(html.includes('type I collagen')||html.includes('collagen'));
 assert(html.includes('data-experiment="inverse-problems"'));
 assert(html.includes('Source & license'));
 assert(html.includes('id="section-watch-and-learn"'));
 assert.equal((html.match(/class="signal-story"/g)||[]).length,6);
});
