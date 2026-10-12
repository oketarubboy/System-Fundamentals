import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {questions} from '../content/questions.mjs';
import {validateBank} from '../public/core.js';
validateBank(questions);
await mkdir('dist',{recursive:true});
const files=['index.html','style.css','app.js','core.js','manifest.webmanifest','icon.svg'];
for(const file of files)await copyFile(`public/${file}`,`dist/${file}`);
await writeFile('dist/questions.json',JSON.stringify(questions,null,2)+'\n');
// Small geometric IT icon, encoded as PNG without external dependencies.
function crc(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),check=Buffer.alloc(4);len.writeUInt32BE(data.length);check.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,check]);}
function png(size){const raw=Buffer.alloc(size*(size*4+1));for(let y=0;y<size;y++)for(let x=0;x<size;x++){const a=x*192/size,b=y*192/size;let color=[18,51,68];if(a>=45&&a<67&&b>=52&&b<140||a>=83&&a<150&&b>=52&&b<73||a>=105&&a<128&&b>=73&&b<140)color=[255,255,255];if(a>=45&&a<150&&b>=151&&b<160)color=[54,182,162];const off=y*(size*4+1)+1+x*4;raw.set([...color,255],off);}const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
for(const size of [192,512])await writeFile(`dist/icon-${size}.png`,png(size));
const hash=createHash('sha256');for(const f of [...files,'questions.json','icon-192.png','icon-512.png'])hash.update(await readFile(`dist/${f}`));const template=await readFile('public/sw-template.js','utf8');hash.update(template);const version=hash.digest('hex').slice(0,12);await writeFile('dist/sw.js',template.replace('__VERSION__',version));await writeFile('dist/.nojekyll','');
console.log(`Built ${questions.length} questions / ${new Set(questions.map(q=>q.category)).size} categories / version ${version}`);
