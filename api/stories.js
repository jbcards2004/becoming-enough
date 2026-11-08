// Server-only gateway to the existing private story database.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed.'})}
 const backend=process.env.STORIES_BACKEND_URL,token=process.env.STORIES_BACKEND_TOKEN,key=process.env.STORIES_BRIDGE_KEY;
 if(!backend||!token||!key)return res.status(503).json({error:'Story sharing is awaiting its secure database connection. Your draft stays in this browser.'});
 const origin=req.headers.origin;
 const expected='https://'+(req.headers.host||'');
 if(req.method==='POST'&&origin!==expected)return res.status(403).json({error:'Please share from this site.'});
 if(req.method==='POST'&&!(req.headers['content-type']||'').includes('application/json'))return res.status(415).json({error:'Invalid request.'});
 const body=req.method==='POST'?JSON.stringify(req.body):undefined;
 if(body?.length>16000)return res.status(413).json({error:'Please keep your story under 12,000 characters.'});
 try{
  const base=new URL(backend);if(base.protocol!=='https:'||base.hostname!=='becoming-enough.jbcards2004.chatgpt.site')throw Error('Invalid backend configuration');
  const url=new URL('/api/stories',base);if(req.method==='GET'&&req.query.before){if(typeof req.query.before!=='string'||req.query.before.length>70)return res.status(400).json({error:'Invalid page.'});url.searchParams.set('before',req.query.before)}
  const response=await fetch(url,{method:req.method,headers:{'Content-Type':'application/json','Origin':base.origin,'OAI-Sites-Authorization':'Bearer '+token,'X-Story-Bridge-Key':key},body,redirect:'error',signal:AbortSignal.timeout(15000)});
  const type=response.headers.get('content-type')||'';
  if(!type.includes('application/json'))throw Error('Unexpected backend response');
  const payload=await response.json();return res.status(response.status).json(payload);
 }catch{console.error('Story gateway request failed');return res.status(503).json({error:'We couldn’t reach the story database. Your words are still in this browser. Please try again later.'})}
}
