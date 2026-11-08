import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {localDB} from './local-db.mjs';
spawnSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
const {default:worker}=await import('../dist/server/index.js');mkdirSync('.sites-runtime',{recursive:true});const DB=localDB('.sites-runtime/preview.sqlite');
const port=Number(process.env.PORT||4173);
createServer(async(req,res)=>{try{const origin='http://'+req.headers.host;const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','local-preview-user');const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);const request=new Request(origin+req.url,{method:req.method,headers,...(body.length?{body}: {})});const response=await worker.fetch(request,{DB});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch{res.writeHead(500);res.end('Preview error')}}).listen(port,'0.0.0.0',()=>console.log('Local preview on http://127.0.0.1:'+port));
