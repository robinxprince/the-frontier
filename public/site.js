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
 document.querySelectorAll('.desk-intro,.featured-copy,.edition-contents,.section-intro>*,.topic-choice,.explorer-figure,.watch-title>*,.watch-sources>a,.archive-invite>*,.footer-top>*').forEach(el=>reveal.observe(el));
}
