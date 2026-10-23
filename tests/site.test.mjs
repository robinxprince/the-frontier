import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {safeURL,render,parseEdition,editions} from '../scripts/lib.mjs';
test('Markdown neutralizes scripts, images and dangerous links',()=>{const html=render('<script>alert(1)</script>\n\n[x](javascript:alert%281%29)\n\n![remote](https://example.org/track)');assert(!html.includes('<script>'));assert(!html.includes('href="javascript:'));assert(!html.includes('<img'));assert(safeURL('https://example.org/paper'));assert(!safeURL('https://user:pass@example.org'));assert(!safeURL('data:text/html,x'))});
test('rejects missing source citations and unstructured daily briefings',()=>{const guide=fs.readFileSync('tests/fixtures/opening-guide.md','utf8');assert.throws(()=>parseEdition(guide.replaceAll(/\]\(https:[^)]+\)/g,']')));assert.throws(()=>parseEdition(guide.replace('"guide"','"briefing"')));assert(editions().length>0)});
test('build supports GitHub project subpaths and all internal links resolve',()=>{execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,SITE_URL:'https://example.github.io/the-frontier'}});const files=fs.readdirSync('dist',{recursive:true}).filter(x=>x.endsWith('.html'));for(const file of files){const html=fs.readFileSync('dist/'+file,'utf8');for(const m of html.matchAll(/(?:href|src)="(\/the-frontier\/[^"#]*)"/g)){let p=m[1].slice('/the-frontier/'.length).split('?')[0];if(!p||p.endsWith('/'))p+='index.html';assert(fs.existsSync('dist/'+p),file+' links to missing '+p)}assert(html.includes('id="main"'));}assert(fs.readFileSync('dist/rss.xml','utf8').includes('https://example.github.io/the-frontier/editions/'))});

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

test('briefings require six to eight signals and an image for each',()=>{
 const raw=fs.readFileSync('content/editions/2026-10-23.md','utf8');
 const parts=raw.split('---\n'),meta=JSON.parse(parts[1]);
 delete meta.visuals['Education rewires a village'];
 assert.throws(()=>parseEdition('---\n'+JSON.stringify(meta)+'\n---\n'+parts[2]),/visual is required/);
 const five=raw.replace(/### AI beyond word chunks[\s\S]*?(?=## The rabbit hole)/,'');
 assert.throws(()=>parseEdition(five),/6–8/);
 for(const e of editions()){
  const html=fs.readFileSync('dist/editions/'+e.slug+'/index.html','utf8');
  const count=(html.match(/class="signal-story"/g)||[]).length;
  assert(count>=6&&count<=8);
  assert.equal((html.match(/class="edition-figure"/g)||[]).length,count);
 }
});

test('archive covers and distinct topic images are rendered from editorial data',()=>{
 const archive=fs.readFileSync('dist/archive/index.html','utf8');
 assert.equal((archive.match(/class="edition-row-visual"/g)||[]).length,editions().length);
 const topics=JSON.parse(fs.readFileSync('data/topics.json','utf8'));
 assert.equal(new Set(topics.map(t=>t.image)).size,topics.length);
 for(const t of topics){const html=fs.readFileSync('dist/topics/'+t.id+'/index.html','utf8');assert(html.includes('class="field-opening"'))}
 const home=fs.readFileSync('dist/index.html','utf8');
 const previews=(home.match(/class="front-signal"/g)||[]).length;assert(previews>=6&&previews<=8);
 assert(home.includes('Stay curious.')&&home.includes('Go deeper.'));
 assert(home.includes('Inside today’s edition'));
 assert(home.includes('orion-nebula-hubble-2006-mosaic-18000.webp'));
 assert(!home.includes('AI-generated'));
});

test('homepage explorer frames the Thinker in a square and uses a credited GPU photo',()=>{
 const home=fs.readFileSync('dist/index.html','utf8');
 assert(home.includes('data-image-fit="square-top"'));
 assert(home.includes('nvidia-gpu-chip.webp'));
 assert(fs.existsSync('public/images/nvidia-gpu-chip.webp'));
 assert(!fs.existsSync('public/images/multicrystalline-silicon-wafer-with-thin-film-iridescence.webp'));
 const images=JSON.parse(fs.readFileSync('data/images.json','utf8'));
 assert.equal(images.chip.creator,'Mickael Courtiade');
 assert.equal(images.chip.license,'CC BY 2.0');
 assert(fs.readFileSync('public/site.js','utf8').includes("choice.dataset.imageFit==='square-top'"));
 assert(fs.readFileSync('public/style.css','utf8').includes('.explorer-image.explorer-image-square-top'));
});
