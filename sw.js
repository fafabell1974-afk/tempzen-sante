const CACHE = "tempzen-v1";


const files = [

"./",
"./index.html",
"./styles.css",
"./app.js",
"./db.js",
"./manifest.json",

"./icon-192.png",
"./icon-512.png"

];




self.addEventListener("install",e=>{


e.waitUntil(

caches.open(CACHE)
.then(cache=>cache.addAll(files))

);


});






self.addEventListener("fetch",e=>{


e.respondWith(

caches.match(e.request)
.then(r=>r || fetch(e.request))

);


});
