import { assets } from './assets.js';
const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
async function bridgeAuthorized(request, env) {
 const key=env.VERCEL_STORY_BRIDGE_KEY;const supplied=request.headers.get('x-story-bridge-key');
 if(!key||!supplied)return false;
 const hash=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
 const [a,b]=await Promise.all([hash(key),hash(supplied)]);let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a[i]^b[i];return mismatch===0;
}
const json = (body,status=200)=>new Response(JSON.stringify(body),{status,headers});
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/stories'){
   try {
    if(request.method==='GET'){
     const before=url.searchParams.get('before')||'9999';
     if(before.length>70)return json({error:'Invalid page.'},400);
     const result=await env.DB.prepare('SELECT id,title,body,created_at FROM stories WHERE id < ? ORDER BY id DESC LIMIT 11').bind(before).all();
     const rows=result.results||[];
     return json({stories:rows.slice(0,10),next:rows.length>10?rows[9].id:null});
    }
    if(request.method==='POST'){
     if(request.headers.get('Origin')!==url.origin)return json({error:'Please share from this site.'},403);
     if(!request.headers.get('oai-authenticated-user-id') && !await bridgeAuthorized(request,env))return json({error:'Please sign in to share your story.',signIn:true},401);
     if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'Invalid request.'},415);
     if(Number(request.headers.get('Content-Length')||0)>60000)return json({error:'Please keep your story under 12,000 characters.'},413);
     const raw=await request.text();if(raw.length>16000)return json({error:'Please keep your story under 12,000 characters.'},413);
     let input;try{input=JSON.parse(raw)}catch{return json({error:'Invalid story.'},400)}
     if(input.share!==true)return json({error:'Choose to share anonymously before publishing.'},400);
     const title=typeof input.title==='string'?input.title.trim():'';
     const body=typeof input.body==='string'?input.body.trim():'';
     if(!body||body.length>12000||title.length>120)return json({error:'Please add a story of up to 12,000 characters and a title of up to 120 characters.'},400);
     if(typeof input.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(input.requestId))return json({error:'Invalid submission. Please refresh and try again.'},400);
     const created=new Date().toISOString();const id=created+'_'+input.requestId;
     await env.DB.prepare('INSERT INTO stories (id,request_id,title,body,created_at) VALUES (?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(id,input.requestId,title||'A moment in my story',body,created).run();
     return json({saved:true},201);
    }
    return json({error:'Method not allowed.'},405);
   }catch(error){console.error('Story database request failed');return json({error:'Stories are unavailable right now. Please try again shortly.'},503)}
  }
  if(url.pathname.startsWith('/api/'))return json({error:'Not found.'},404);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  const asset=assets[url.pathname==='/'?'/index.html':url.pathname];
  if(!asset)return new Response('Not found',{status:404});
  return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
 }
};
