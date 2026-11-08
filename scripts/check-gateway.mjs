import assert from 'node:assert/strict';
import handler from '../api/stories.js';
async function call(req){let status,body,headers={};const res={setHeader(k,v){headers[k]=v},status(v){status=v;return this},json(v){body=v;return this}};await handler(req,res);return {status,body,headers}}
const request=(method='GET',extra={})=>({method,headers:{host:'example.vercel.app',origin:'https://example.vercel.app','content-type':'application/json'},query:{},...extra});
assert.equal((await call(request('DELETE'))).status,405);
assert.equal((await call(request())).status,503);
process.env.STORIES_BACKEND_URL='https://becoming-enough.jbcards2004.chatgpt.site';process.env.STORIES_BACKEND_TOKEN='test-token';process.env.STORIES_BRIDGE_KEY='test-bridge';
assert.equal((await call(request('POST',{headers:{host:'example.vercel.app',origin:'https://wrong.test'}}))).status,403);
let forwarded;const original=globalThis.fetch;globalThis.fetch=async(url,options)=>{forwarded={url,options};return Response.json({stories:[],next:null})};
assert.equal((await call(request())).status,200);assert.equal(forwarded.options.headers['OAI-Sites-Authorization'],'Bearer test-token');assert.equal(forwarded.url.origin,process.env.STORIES_BACKEND_URL);
const r=await call(request('POST',{body:{share:true,title:'A title',body:'A story',requestId:'test'}}));assert.equal(r.status,200);assert.equal(JSON.parse(forwarded.options.body).share,true);
assert.equal((await call(request('GET',{query:{before:['bad']}}))).status,400);
globalThis.fetch=async()=>new Response('<html>Sign in</html>',{headers:{'content-type':'text/html'}});assert.equal((await call(request())).status,503);globalThis.fetch=original;
console.log('Passed: gateway methods, unconfigured state, origin validation, server-only forwarding, pagination, backend error handling.');
