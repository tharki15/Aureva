/* AUREVA welcome intro — Three.js emerald gem + gold halo, then a curtain reveal.
   Works offline (three.min.js is bundled in assets/vendor). Falls back to a CSS gem
   when WebGL is unavailable, and is skipped entirely for reduced-motion users. */
(() => {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  const ready = () => root.classList.add('is-ready');

  if (!intro || !root.classList.contains('is-intro')) { ready(); return; }

  const MIN_MS = 4200;      // minimum time the intro stays before the curtain opens
  const MAX_MS = 9000;      // never wait longer than this for assets
  const bar = intro.querySelector('.intro-bar i');
  const skip = intro.querySelector('.intro-skip');
  const canvas = document.getElementById('intro-canvas');
  const t0 = performance.now();
  let exiting = false, exitAt = 0, raf = 0, three = null;

  /* ---------- real asset progress ---------- */
  const imgs = [...document.querySelectorAll('img[data-preload]')];
  let loaded = 0;
  const bump = () => { loaded++; };
  imgs.forEach(img => {
    if (img.complete) bump(); else { img.addEventListener('load', bump, { once: true }); img.addEventListener('error', bump, { once: true }); }
  });
  let fontsDone = !document.fonts;
  if (document.fonts) document.fonts.ready.then(() => { fontsDone = true; });
  const assetsReady = () => fontsDone && loaded >= imgs.length;

  /* ---------- exit (curtain) ---------- */
  const finish = fast => {
    if (exiting) return;
    exiting = true; exitAt = performance.now();
    intro.classList.add('intro-exit');
    if (fast) intro.classList.add('intro-fast');
    setTimeout(() => {
      root.classList.remove('is-intro');
      ready();
    }, fast ? 650 : 1250);
    setTimeout(() => {
      intro.hidden = true;
      cancelAnimationFrame(raf);
      if (three) { three.dispose(); }
      window.clearTimeout(window.__introFailsafe);
    }, fast ? 1300 : 2200);
  };
  skip && skip.addEventListener('click', () => finish(true));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !exiting) finish(true); });

  /* ---------- Three.js scene ---------- */
  function initThree() {
    const THREE = window.THREE;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

    /* generated studio environment so the gold and gem actually reflect something */
    const envScene = new THREE.Scene();
    const panel = (c, w, h, x, y, z, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
    };
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: 0x06251c, side: THREE.BackSide })));
    panel(0xffffff, 14, 8, 0, 14, 4, 2.6);
    panel(0xffe3a6, 10, 14, 16, 2, 6, 2.2);
    panel(0x6fffc4, 8, 12, -16, -2, 4, 1.4);
    panel(0xfff4dc, 12, 5, 0, -12, 10, 1.4);
    panel(0xffffff, 6, 6, -6, 6, -14, 1.8);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(envScene, 0.02).texture;
    scene.environment = env;

    scene.add(new THREE.AmbientLight(0xffffff, 0.08));
    const key = new THREE.DirectionalLight(0xffe2a8, 0.9); key.position.set(3, 5, 6); scene.add(key);
    const green = new THREE.PointLight(0x2fe39a, 1.6, 20); green.position.set(-4, -1, 3); scene.add(green);
    const gold = new THREE.PointLight(0xffc766, 1.6, 20); gold.position.set(4, -3, 2); scene.add(gold);

    const rig = new THREE.Group(); scene.add(rig);
    const tilt = new THREE.Group(); tilt.rotation.x = 0.6; rig.add(tilt);

    /* emerald-cut gem: an 8-sided lathe with stepped crown & pavilion */
    const profile = [[0, -1.0], [0.55, -0.72], [0.86, -0.42], [1.05, -0.14], [1.1, 0], [1.1, 0.08], [1.0, 0.22], [0.82, 0.34], [0.6, 0.44], [0, 0.44]]
      .map(p => new THREE.Vector2(p[0], p[1]));
    const gemGeo = new THREE.LatheGeometry(profile, 8);
    gemGeo.rotateY(Math.PI / 8);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0x03623d, metalness: 0.45, roughness: 0.12, clearcoat: 0.5, clearcoatRoughness: 0.1,
      flatShading: true, emissive: 0x022a19, emissiveIntensity: 0.5, envMapIntensity: 1.25, reflectivity: 0.6
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.scale.set(1.15, 1.0, 0.8);
    tilt.add(gem);
    const gemWire = new THREE.LineSegments(new THREE.EdgesGeometry(gemGeo, 12), new THREE.LineBasicMaterial({ color: 0xcdf7e2, transparent: true, opacity: 0.55 }));
    gemWire.scale.copy(gem.scale); tilt.add(gemWire);

    /* gold halo: a band of small stones around the gem + a gold ring */
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9b25f, metalness: 1, roughness: 0.2, envMapIntensity: 1.6 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.075, 24, 120), goldMat);
    ring.rotation.x = Math.PI / 2; tilt.add(ring);
    const stoneMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.02, flatShading: true, envMapIntensity: 1.6, clearcoat: 1 });
    const stones = new THREE.Group(); tilt.add(stones);
    const N = 28;
    for (let i = 0; i < N; i++) {
      const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), stoneMat);
      const a = (i / N) * Math.PI * 2;
      s.position.set(Math.cos(a) * 1.62, 0.07, Math.sin(a) * 1.62);
      s.scale.y = 0.8; s.rotation.y = a;
      stones.add(s);
    }
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.012, 8, 160), goldMat);
    orbit.rotation.set(Math.PI / 2.4, 0.4, 0); rig.add(orbit);
    const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.008, 8, 160), goldMat);
    orbit2.rotation.set(Math.PI / 1.9, -0.6, 0.5); rig.add(orbit2);

    /* gold dust */
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.2, 'rgba(255,226,150,.85)'); grad.addColorStop(1, 'rgba(255,200,90,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(255,240,200,.9)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(32, 4); g.lineTo(32, 60); g.moveTo(4, 32); g.lineTo(60, 32); g.stroke();
    const sprite = new THREE.CanvasTexture(c);
    const COUNT = 150, pos = new Float32Array(COUNT * 3), spd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 2.6 + Math.random() * 5, a = Math.random() * 6.283;
      pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 9; pos[i * 3 + 2] = Math.sin(a) * r * 0.6 - 1;
      spd[i] = 0.12 + Math.random() * 0.3;
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ size: 0.2, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 });
    const dust = new THREE.Points(pg, pm); scene.add(dust);

    let w = 0, h = 0, camZ = 9;
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camZ = Math.max(9.5, 6.4 / (2 * camera.aspect * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))));
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', e => { mouse.tx = (e.clientX / window.innerWidth - 0.5); mouse.ty = (e.clientY / window.innerHeight - 0.5); }, { passive: true });

    const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
    const easeInOut = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const clock = new THREE.Clock();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;

      const appear = Math.min(Math.max((t - 0.2) / 1.5, 0), 1);
      const s = easeOutBack(appear);
      rig.scale.setScalar(Math.max(s * 0.82, 0.0001));
      rig.position.y = 0.5 + Math.sin(t * 1.1) * 0.06;
      rig.rotation.y = t * 0.55 + (1 - appear) * 2.6;
      tilt.rotation.x = 0.6 + mouse.y * 0.35;
      tilt.rotation.z = mouse.x * 0.2;
      stones.rotation.y = -t * 0.4;
      orbit.rotation.z = t * 0.25; orbit2.rotation.z = -t * 0.18;
      gemMat.emissiveIntensity = 0.5 + Math.sin(t * 2.2) * 0.2;
      green.position.x = -4 + Math.sin(t * 0.8) * 1.5; gold.position.y = -3 + Math.cos(t * 0.9) * 1.2;

      const p = pg.attributes.position.array;
      for (let i = 0; i < COUNT; i++) { p[i * 3 + 1] += spd[i] * 0.012; if (p[i * 3 + 1] > 4.6) p[i * 3 + 1] = -4.6; }
      pg.attributes.position.needsUpdate = true;
      dust.rotation.y = t * 0.04;

      let zoom = 0;
      if (exiting) zoom = easeInOut(Math.min((performance.now() - exitAt) / 1100, 1));
      camera.position.set(mouse.x * 0.8, -mouse.y * 0.5 + 0.2, camZ - zoom * (camZ - 3.2));
      camera.lookAt(0, -0.55, 0);
      pm.opacity = 0.9 * (1 - zoom);
      renderer.render(scene, camera);
    };
    frame();

    return {
      dispose() {
        window.removeEventListener('resize', resize);
        [gemGeo, pg].forEach(o => o.dispose()); [gemMat, goldMat, stoneMat, pm].forEach(o => o.dispose());
        env.dispose(); pmrem.dispose(); renderer.dispose();
      }
    };
  }

  if (window.THREE && canvas) three = initThree();
  if (!three) { intro.classList.add('intro-css'); }   // CSS-only gem fallback

  /* ---------- timeline ---------- */
  const tick = () => {
    if (exiting) return;
    const el = performance.now() - t0;
    const timeP = Math.min(el / MIN_MS, 1);
    const assetP = imgs.length ? Math.min(loaded / imgs.length, 1) : 1;
    const p = Math.min(timeP, 0.25 + 0.75 * assetP);
    if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`;
    if ((el >= MIN_MS && assetsReady()) || el >= MAX_MS) { if (bar) bar.style.transform = 'scaleX(1)'; setTimeout(() => finish(false), 250); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  // cheap rAF loop if three isn't running (fallback mode)
  if (!three) raf = 0;
})();
