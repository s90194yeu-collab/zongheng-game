// A chapter host waits for an explicit return. Repeated close/save callbacks must
// settle the same entry once, and a busy standalone editor must never leave the
// original story waiting on a promise that cannot be reached.
export function createChapterSession(){
 let active=null;
 return {
  get active(){return active;},
  begin(id,context={}){
   if(active){if(active.id!==id)throw Error('另一篇角色冒險尚未離開。');return active.promise;}
   let resolve;const promise=new Promise(done=>resolve=done);
   active={id,context,promise,resolve};return promise;
  },
  finish(outcome={}){
   if(!active)return false;const own=active;active=null;
   const completed=outcome.completed===true;
   own.resolve({...outcome,id:own.id,status:completed?'completed':outcome.status==='failed'?'failed':'left',completed,left:!completed});return true;
  }
 };
}
