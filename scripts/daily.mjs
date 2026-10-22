// No paid inference or secret is required. Research runs in the desktop schedule.
import fs from 'node:fs';
import {editions} from './lib.mjs';
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const found=editions().find(e=>e.date===today&&e.kind==='briefing');
const summary=found?`Research edition for ${today} is committed: ${found.title}. The Pages workflow can publish it.`:`No researched edition for ${today} yet. The 7:00 AM Asia/Kolkata desktop task may still be researching, or the computer may be offline. Existing editions are preserved. No paid API calls were made and no replacement content was invented.`;
console.log(summary);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary+'\n');
