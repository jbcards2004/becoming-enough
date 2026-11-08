import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function localDB(path=':memory:'){
 const db=new DatabaseSync(path);
 const exists=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='stories'").get();
 if(!exists)db.exec(readFileSync('drizzle/0000_anonymous_stories.sql','utf8'));
 return {prepare(sql){return {bind(...args){const stmt=db.prepare(sql);return {async all(){return {results:stmt.all(...args)}},async run(){return stmt.run(...args)}}}}},close(){db.close()}};
}
