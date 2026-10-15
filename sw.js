/* KONG 회원관리 · 오프라인 지원 */
const V = "kong-v3";
const CORE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k.startsWith("kong-")).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.pathname.endsWith("/license.json")) return;   /* 사용 허가는 항상 인터넷에서 확인 */
  if (u.origin === location.origin){
    /* 앱 파일: 인터넷 되면 최신, 안 되면 저장본 */
    e.respondWith(fetch(r).then(res => { if (res.ok){ const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
  } else if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|storage\.googleapis\.com/.test(u.host)){
    /* 글꼴 · 자세 인식 AI: 한 번 받으면 저장해서 재사용 */
    e.respondWith(caches.open(V + "-ext").then(c => c.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === "opaque") c.put(r, res.clone()); return res; }))));
  }
});
