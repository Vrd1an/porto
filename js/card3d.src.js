/*
 * card3d.src.js - interactive 3D ID card (three.js). Bundled to card3d.bundle.js:
 *   npm install && npm run build:card
 * - The lanyard + card is a small verlet-physics chain; the anchor follows #slot in the page.
 * - A transparent div ("grab") sits over the card so it can be dragged anywhere on screen.
 * - window.cardGlide / cardKick / cardPos are used by intro.js; window.setPhoto by app.js.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const st = document.getElementById('stage');
const NAME = st.dataset.name || 'Ferdian',
  ROLE = st.dataset.role || 'Web Designer',
  IDN = st.dataset.id || 'WD-2026',
  LOC = st.dataset.loc || 'Cianjur, Jawa Barat';
const b2b = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
const url = (s) => 'data:image/png;base64,' + s;
const R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
R.setPixelRatio(Math.min(devicePixelRatio, 1.75));
R.outputColorSpace = THREE.SRGBColorSpace;
const cv = R.domElement;
cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:30';
(document.getElementById('pg') || document.body).appendChild(cv);
const sc = new THREE.Scene(),
  cam = new THREE.PerspectiveCamera(25, 1, 0.1, 100);
cam.position.set(0, 0, 13);
sc.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), 0.04).texture;
sc.add(new THREE.AmbientLight(0xffffff, 1.2));
const PPU = 107.6;
let W = innerWidth,
  H = innerHeight;
function size() {
  W = innerWidth;
  H = innerHeight;
  R.setSize(W, H);
  cam.aspect = W / H;
  cam.fov = (2 * Math.atan(H / 2 / PPU / 13) * 180) / Math.PI;
  cam.updateProjectionMatrix();
}
size();
addEventListener('resize', size);
/* tekstur kartu: sisi depan digambar ulang, sisi belakang tetap bawaan */
const T = document.createElement('canvas');
T.width = T.height = 1024;
const x = T.getContext('2d');
let photo = null,
  back = null;
const tex = new THREE.CanvasTexture(T);
tex.flipY = false;
tex.colorSpace = THREE.SRGBColorSpace;
tex.anisotropy = 8;
function rr(a, b, w, h, r) {
  x.beginPath();
  x.roundRect(a, b, w, h, r);
}
function draw() {
  if (back) x.drawImage(back, 0, 0);
  else {
    x.fillStyle = '#fff';
    x.fillRect(0, 0, 1024, 1024);
  }
  x.save();
  x.beginPath();
  x.rect(0, 0, 512, 774);
  x.clip();
  const g = x.createLinearGradient(0, 0, 512, 774);
  g.addColorStop(0, '#4f46e5');
  g.addColorStop(1, '#7c3aed');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 774);
  x.strokeStyle = 'rgba(255,255,255,.25)';
  x.lineWidth = 3;
  rr(18, 18, 476, 738, 26);
  x.stroke();
  x.save();
  rr(116, 150, 280, 280, 28);
  x.clip();
  if (photo) {
    const s = Math.max(280 / photo.width, 280 / photo.height),
      w = photo.width * s,
      h = photo.height * s;
    x.drawImage(photo, 116 + (280 - w) / 2, 150 + (280 - h) / 2, w, h);
  } else {
    x.fillStyle = 'rgba(255,255,255,.2)';
    x.fillRect(116, 150, 280, 280);
    x.fillStyle = '#fff';
    x.font = '800 150px "Plus Jakarta Sans",system-ui,sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(NAME[0], 256, 296);
  }
  x.restore();
  x.strokeStyle = 'rgba(255,255,255,.7)';
  x.lineWidth = 4;
  rr(116, 150, 280, 280, 28);
  x.stroke();
  x.fillStyle = '#fff';
  x.textAlign = 'center';
  x.textBaseline = 'alphabetic';
  x.font = '800 58px "Plus Jakarta Sans",system-ui,sans-serif';
  x.fillText(NAME, 256, 505);
  x.globalAlpha = 0.9;
  x.font = '500 30px "Plus Jakarta Sans",system-ui,sans-serif';
  x.fillText(ROLE, 256, 550);
  x.textAlign = 'left';
  x.font = '500 22px "Plus Jakarta Sans",system-ui,sans-serif';
  x.fillText('ID ' + IDN, 50, 690);
  x.fillText(LOC, 50, 722);
  x.globalAlpha = 1;
  for (let i = 0, p = 300; p < 462; i++) {
    const w = [3, 6, 2, 4, 3, 7][i % 6];
    x.fillRect(p, 676, w, 52);
    p += w + [4, 3, 5][i % 3];
  }
  x.restore();
  tex.needsUpdate = true;
}
draw();
const bi = new Image();
bi.onload = () => {
  back = bi;
  draw();
};
bi.src = url(window.__TEX);
document.fonts &&
  document.fonts
    .load('800 58px "Plus Jakarta Sans"')
    .then(draw)
    .catch(() => {});
window.setPhoto = (d) => {
  const i = new Image();
  i.onload = () => {
    photo = i;
    draw();
  };
  i.src = d;
};
/* tali */
const bt = new THREE.TextureLoader().load(url(window.__BAND));
bt.wrapS = bt.wrapT = THREE.RepeatWrapping;
bt.colorSpace = THREE.SRGBColorSpace;
const N = 32,
  pos = new Float32Array((N + 1) * 6),
  uv = new Float32Array((N + 1) * 4),
  idx = [];
for (let i = 0; i <= N; i++) {
  uv.set([(i / N) * 4, 0, (i / N) * 4, 1], i * 4);
  if (i < N) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
}
const bg = new THREE.BufferGeometry();
bg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
bg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
bg.setIndex(idx);
const band = new THREE.Mesh(
  bg,
  new THREE.MeshBasicMaterial({ map: bt, side: THREE.DoubleSide, color: 0xffffff }),
);
band.frustumCulled = false;
sc.add(band);
/* kartu */
const grp = new THREE.Group(),
  inner = new THREE.Group();
inner.scale.setScalar(2.25);
inner.position.set(0, -1.2, -0.05);
grp.add(inner);
sc.add(grp);
new GLTFLoader().parse(
  b2b(window.__GLB),
  '',
  (g) => {
    const m = (n) => g.scene.getObjectByName(n);
    inner.add(
      new THREE.Mesh(
        m('card').geometry,
        new THREE.MeshPhysicalMaterial({
          map: tex,
          clearcoat: 1,
          clearcoatRoughness: 0.15,
          roughness: 0.3,
          metalness: 0.25,
        }),
      ),
    );
    const mt = m('clip').material;
    mt.roughness = 0.3;
    inner.add(new THREE.Mesh(m('clip').geometry, mt), new THREE.Mesh(m('clamp').geometry, mt));
    ready = true;
    window.dispatchEvent(new Event('cardready'));
  },
  (e) => console.error(e),
);
/* fisika: rantai verlet; angkur mengikuti posisi slot di halaman */
const slot = document.getElementById('slot'),
  L = 2.9,
  intro = document.documentElement.classList.contains('js-intro');
let ready = false,
  glide = null;
window.cardGlide = (ms) => {
  glide = { t0: performance.now(), ms };
};
// Screen position of the lanyard anchor (centre of screen during intro, then above #slot).
function anchor() {
  const r = slot.getBoundingClientRect(),
    s = { x: r.left + r.width / 2, y: r.top - 120 };
  if (!intro || (glide && performance.now() - glide.t0 >= glide.ms)) return s;
  const c = { x: W / 2, y: Math.min(-60, H / 2 - 4.45 * PPU) };
  if (!glide) return c;
  const k = (performance.now() - glide.t0) / glide.ms,
    e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  return { x: c.x + (s.x - c.x) * e, y: c.y + (s.y - c.y) * e };
}
const a0 = anchor(),
  A = { x: (a0.x - W / 2) / PPU, y: (H / 2 - a0.y) / PPU },
  P = [{ x: A.x, y: A.y, px: A.x, py: A.y, w: 0 }];
let q = { x: A.x, y: A.y };
[
  [0.3, 0.954],
  [-0.5, 0.866],
  [0.4, 0.917],
].forEach((d) => {
  const n = Math.hypot(d[0], d[1]);
  q = { x: q.x + d[0] / n, y: q.y + d[1] / n };
  P.push({ x: q.x, y: q.y, px: q.x, py: q.y, w: 1 });
});
const Tp = P[3],
  Bp = { x: Tp.x, y: Tp.y - L, px: Tp.x - 0.04, py: Tp.y - L, w: 1 };
window.cardKick = (s, k) => {
  Bp.px -= s * 0.09 * k;
  Tp.px -= s * 0.035 * k;
};
window.cardPos = () => ({
  x: W / 2 + ((Tp.x + Bp.x) / 2) * PPU,
  y: H / 2 - ((Tp.y + Bp.y) / 2) * PPU,
});
// Distance constraint between two particles.
function con(a, b, l) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    d = Math.hypot(dx, dy) || 1e-6,
    f = (d - l) / d,
    s = a.w + b.w;
  if (!s) return;
  a.x += (dx * f * a.w) / s;
  a.y += (dy * f * a.w) / s;
  b.x -= (dx * f * b.w) / s;
  b.y -= (dy * f * b.w) / s;
}
let drag = false,
  off = { x: 0, y: 0 },
  tgt = { x: 0, y: 0 },
  yaw = 0,
  yv = 0,
  cprev = 0,
  seg = 1;
// One physics step.
function step(dt) {
  const an = anchor();
  A.x = (an.x - W / 2) / PPU;
  A.y = (H / 2 - an.y) / PPU;
  for (const p of [P[1], P[2], P[3], Bp]) {
    const vx = (p.x - p.px) * 0.978,
      vy = (p.y - p.py) * 0.978;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy - 40 * dt * dt;
  }
  let tg = 1;
  if (drag) {
    const cx = (Tp.x + Bp.x) / 2,
      cy = (Tp.y + Bp.y) / 2,
      dx = (tgt.x - off.x - cx) * 0.4,
      dy = (tgt.y - off.y - cy) * 0.4;
    Tp.x += dx;
    Bp.x += dx;
    Tp.y += dy;
    Bp.y += dy;
    tg = Math.max(1, Math.hypot(tgt.x - off.x - A.x, tgt.y - off.y + 1.45 - A.y) / 2.94);
  }
  seg += (tg - seg) * (drag ? 0.5 : 0.05);
  for (let k = 0; k < 10; k++) {
    P[0].x = A.x;
    P[0].y = A.y;
    con(P[0], P[1], seg);
    con(P[1], P[2], seg);
    con(P[2], P[3], seg);
    con(Tp, Bp, L);
  }
  const cx = (Tp.x + Bp.x) / 2,
    vx = (cx - cprev) / dt;
  cprev = cx;
  yv += (-yaw * 8 - yv * 1.6 + vx * 0.55) * dt;
  yaw = Math.max(-1.2, Math.min(1.2, yaw + yv * dt));
}
/* area tarik: div transparan di atas kartu, bebas ke seluruh layar */
const grab = document.createElement('div');
grab.style.cssText =
  'position:fixed;left:0;top:0;width:190px;height:270px;z-index:31;touch-action:none;cursor:grab;will-change:transform;display:none';
(document.getElementById('pg') || document.body).appendChild(grab);
const wp = (e) => ({ x: (e.clientX - W / 2) / PPU, y: (H / 2 - e.clientY) / PPU });
grab.addEventListener('pointerdown', (e) => {
  grab.setPointerCapture(e.pointerId);
  const p = wp(e);
  drag = true;
  tgt = p;
  off = { x: p.x - (Tp.x + Bp.x) / 2, y: p.y - (Tp.y + Bp.y) / 2 };
  grab.style.cursor = 'grabbing';
});
grab.addEventListener('pointermove', (e) => {
  if (drag) tgt = wp(e);
});
const up = () => {
  drag = false;
  grab.style.cursor = 'grab';
};
grab.addEventListener('pointerup', up);
grab.addEventListener('pointercancel', up);
// Update the card/lanyard meshes and the drag area.
function render() {
  const cx = (Tp.x + Bp.x) / 2,
    cy = (Tp.y + Bp.y) / 2,
    ux = Tp.x - Bp.x,
    uy = Tp.y - Bp.y,
    roll = Math.atan2(-ux, uy),
    sx = W / 2 + cx * PPU,
    sy = H / 2 - cy * PPU;
  grp.position.set(cx, cy, 0);
  grp.rotation.set(0, yaw, roll, 'ZYX');
  grab.style.display = ready ? 'block' : 'none';
  grab.style.transform =
    'translate(' + (sx - 95) + 'px,' + (sy - 135) + 'px) rotate(' + -roll + 'rad)';
  if (!drag && (sy < -500 || sy > H + 500)) return;
  const pts = new THREE.CatmullRomCurve3(
    [Tp, P[2], P[1], P[0]].map((p) => new THREE.Vector3(p.x, p.y, 0)),
    false,
    'chordal',
  ).getPoints(N);
  pts.forEach((p, i) => {
    const q = pts[Math.min(i + 1, N)],
      o = pts[Math.max(i - 1, 0)],
      tx = q.x - o.x,
      ty = q.y - o.y,
      d = Math.hypot(tx, ty) || 1,
      nx = (-ty / d) * 0.1,
      ny = (tx / d) * 0.1;
    pos.set([p.x + nx, p.y + ny, 0, p.x - nx, p.y - ny, 0], i * 6);
  });
  bg.attributes.position.needsUpdate = true;
  R.render(sc, cam);
}
let last = performance.now(),
  acc = 0;
(function loop(t) {
  requestAnimationFrame(loop);
  const d = Math.min((t - last) / 1000, 0.05);
  last = t;
  acc = ready ? acc + d : 0;
  let n = 0;
  while (acc >= 1 / 60 && n++ < 4) {
    step(1 / 60);
    acc -= 1 / 60;
  }
  render();
})(last);
