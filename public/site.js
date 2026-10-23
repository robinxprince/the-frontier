const search=document.querySelector('#search'),topic=document.querySelector('#topic');
if(search&&topic){const rows=[...document.querySelectorAll('.edition-row')];function filter(){const q=search.value.trim().toLowerCase(),t=topic.value;let count=0;for(const row of rows){row.hidden=!(row.dataset.search.includes(q)&&(!t||row.dataset.topics.split(' ').includes(t)));if(!row.hidden)count++}document.querySelector('#results').textContent=`${count} edition${count===1?'':'s'}`;document.querySelector('#empty').hidden=count>0}search.addEventListener('input',filter);topic.addEventListener('change',filter)}

// Keep the date-specific promise accurate even when a cached build crosses midnight.
const indiaToday=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
for(const link of document.querySelectorAll('.read-action')){
 const label=link.dataset.kind==='guide'?'Start reading':link.dataset.date===indiaToday?'Read today’s edition':'Read latest edition';
 link.firstChild.textContent=label;
}

// Native disclosure controls remain usable with JavaScript disabled.
const choices=[...document.querySelectorAll('.topic-choice')];
const explorerImage=document.querySelector('.explorer-image');
let imageRequest=0;
for(const choice of choices){
 choice.addEventListener('toggle',()=>{
  if(!choice.open)return;
  for(const other of choices)if(other!==choice)other.open=false;
  if(!explorerImage)return;
  const request=++imageRequest, next=new Image();
  next.onload=()=>{
   if(request!==imageRequest)return;
   explorerImage.src=choice.dataset.imageSrc;
   explorerImage.alt=choice.dataset.imageAlt;
   document.querySelector('#explorer-caption').textContent=choice.dataset.imageCaption;
   explorerImage.classList.toggle('explorer-image-thinker',choice.dataset.imageFit==='thinker');
   explorerImage.classList.remove('image-change');
   requestAnimationFrame(()=>explorerImage.classList.add('image-change'));
  };
  next.src=choice.dataset.imageSrc;
 });
}

// Content is visible by default. Motion never gates reading or navigation.
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const reveal=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('reveal-in');reveal.unobserve(entry.target)}
 },{threshold:.15});
 document.querySelectorAll('.desk-intro,.featured-copy,.edition-contents,.section-intro>*,.topic-choice,.explorer-figure,.watch-title>*,.watch-sources>a,.archive-invite>*,.footer-top>*,.front-signal,.edition-spread,.topic-tile,.field-opening>*,.cover-argument>*,.cover-context>*,.edition-row-visual>img,.edition-row-copy>*,.topic-tile>a>*').forEach(el=>reveal.observe(el));
}

// Every dated edition shares the same reading controls and optional explanations.
const depthControls=document.querySelector('.depth-controls');
if(depthControls){
 const panels=[...document.querySelectorAll('.signal-analysis')];
 depthControls.hidden=false;
 const updateDepth=()=>{for(const button of depthControls.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.depth==='full'?panels.every(p=>p.open):panels.every(p=>!p.open)))};
 depthControls.addEventListener('click',event=>{const button=event.target.closest('[data-depth]');if(!button)return;for(const panel of panels)panel.open=button.dataset.depth==='full';updateDepth()});
 for(const panel of panels)panel.addEventListener('toggle',updateDepth);
}
for(const experiment of document.querySelectorAll('[data-experiment="inverse-problems"]')){
 const grid=experiment.querySelector('.pixel-grid'),result=experiment.querySelector('.pattern-result');
 const labels={vertical:'Vertical stripes',horizontal:'Horizontal stripes',checker:'Checkerboard'};
 for(const button of experiment.querySelectorAll('[data-pattern]'))button.addEventListener('click',()=>{
  const pattern=button.dataset.pattern;
  for(const [i,pixel] of [...grid.children].entries()){const row=Math.floor(i/8),column=i%8;pixel.classList.toggle('light',Boolean(pattern==='vertical'?column%2:pattern==='horizontal'?row%2:(row+column)%2))}
  for(const other of experiment.querySelectorAll('[data-pattern]'))other.setAttribute('aria-pressed',String(other===button));
  grid.setAttribute('aria-label',labels[pattern]+', 8 by 8 pixels');
  result.textContent=labels[pattern]+'. Every two-by-two block is still 50% light; the sensor reading stays the same.';
  experiment.classList.remove('pattern-changing');requestAnimationFrame(()=>experiment.classList.add('pattern-changing'));
 });
}
if('IntersectionObserver' in window){
 const sections=[...document.querySelectorAll('.edition-section')];
 const currentSection=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){for(const link of document.querySelectorAll('.edition-navigator nav a')){if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}}},{rootMargin:'0px 0px -65% 0px'});
 for(const section of sections)currentSection.observe(section);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const motion=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('reveal-in');motion.unobserve(entry.target)}},{threshold:.08});document.querySelectorAll('.edition-section>h2,.edition-section-intro,.signal-story,.learning-story,.inverse-experiment,.edition-cover-image').forEach(el=>motion.observe(el))}
}
