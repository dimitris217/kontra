/* ΚΟΝΤΡΑ — service worker
   Δουλεια του: να παιζει το παιχνιδι ΚΑΙ χωρις ιντερνετ, και να
   ανοιγει ακαριαια. Οι ζωγραφιες μενουν στην cache για παντα, το
   HTML το ζηταει παντα φρεσκο (για να βλεπεις τις αλλαγες σου).

   ΟΤΑΝ ΑΝΕΒΑΖΕΙΣ ΝΕΑ ΕΚΔΟΣΗ: αλλαξε τον αριθμο στο VER.  */
const VER = "kontra-v3";
const CORE = [
  "./",
  "index.html",
  "kontra-grigora.html",
  "manifest.json",
  "img/icon-192.png",
  "img/icon-512.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  /* HTML: πρωτα το δικτυο, cache μονο αν ειμαστε offline */
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    e.respondWith(
      fetch(req)
        .then(res => { const c = res.clone(); caches.open(VER).then(x => x.put(req, c)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
    );
    return;
  }

  /* ολα τα υπολοιπα (εικονες, css, js): πρωτα η cache */
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const c = res.clone();
      caches.open(VER).then(x => x.put(req, c));
      return res;
    }).catch(() => hit))
  );
});
