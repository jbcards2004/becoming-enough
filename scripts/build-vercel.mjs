import {cp,mkdir,rm,readFile,access} from 'node:fs/promises';
await rm('vercel-dist',{recursive:true,force:true});await mkdir('vercel-dist',{recursive:true});
await cp('public','vercel-dist',{recursive:true});
for(const file of ['index.html','app.js','style.css','theme.css','flowers.svg'])await access('vercel-dist/'+file);
const html=await readFile('vercel-dist/index.html','utf8');if(!html.includes('id="community"'))throw Error('Community section missing');
console.log('Vercel static output verified: vercel-dist/');
