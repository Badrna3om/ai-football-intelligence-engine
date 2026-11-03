const CACHE="tactic-static-v1";
const STATIC_PREFIXES=["/_next/static/","/icons/"];

self.addEventListener("install",()=>self.skipWaiting());

self.addEventListener("activate",(event)=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",(event)=>{
  const request=event.request;
  if(request.method!=="GET") return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;

  const isStatic=STATIC_PREFIXES.some(prefix=>url.pathname.startsWith(prefix));
  if(!isStatic) return;

  event.respondWith(
    caches.match(request).then(cached=>{
      if(cached) return cached;
      return fetch(request).then(response=>{
        if(response.ok){
          const clone=response.clone();
          caches.open(CACHE).then(cache=>cache.put(request,clone));
        }
        return response;
      });
    })
  );
});
