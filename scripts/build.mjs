import {readFile,mkdir,writeFile,rm,copyFile} from 'node:fs/promises';
const assets={};for(const [name,type] of Object.entries({'index.html':'text/html; charset=utf-8','app.js':'text/javascript; charset=utf-8','style.css':'text/css; charset=utf-8','theme.css':'text/css; charset=utf-8','flowers.svg':'image/svg+xml'}))assets['/'+name]={type,body:await readFile('public/'+name,'utf8')};
await rm('dist',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
let worker=await readFile('worker/index.js','utf8');worker=worker.replace("import { assets } from './assets.js';",'const assets = '+JSON.stringify(assets)+';');await writeFile('dist/server/index.js',worker);await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built Worker with embedded site assets.');
