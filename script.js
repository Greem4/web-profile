(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  document.querySelectorAll(".link").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", x + "%");
      el.style.setProperty("--my", y + "%");
    });
  });

  const logoWrap = document.querySelector(".logo-wrap");
  if (logoWrap && window.matchMedia("(hover: hover)").matches) {
    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    const MAX = 18;

    window.addEventListener("pointermove", (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const nx = (e.clientX - cx) / cx;
      const ny = (e.clientY - cy) / cy;
      targetX = nx * MAX;
      targetY = ny * MAX;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    window.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    function animate() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      logoWrap.style.setProperty("--px", curX.toFixed(2) + "px");
      logoWrap.style.setProperty("--py", curY.toFixed(2) + "px");
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = 0;
      }
    }
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let stars = [];
  let shootingStars = [];
  let lastTime = performance.now();
  let nextShootingAt = performance.now() + 2000;
  let raf = 0;

  const STAR_DENSITY = 0.00018;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
  }

  function initStars() {
    const count = Math.max(80, Math.floor(width * height * STAR_DENSITY));
    stars = new Array(count).fill(0).map(() => makeStar());
  }

  function makeStar() {
    const layer = Math.random();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: layer < 0.6 ? Math.random() * 0.7 + 0.2 : Math.random() * 1.4 + 0.5,
      base: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.02,
      vy: 0.005 + Math.random() * 0.02,
    };
  }

  function spawnShooting() {
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -50 : width + 50;
    const startY = Math.random() * height * 0.5;
    const angle = fromLeft ? (Math.PI / 6) + (Math.random() * 0.2) : (Math.PI - Math.PI / 6) - (Math.random() * 0.2);
    const speed = 600 + Math.random() * 400;
    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 0.9 + Math.random() * 0.5,
      length: 120 + Math.random() * 80,
    });
  }

  function draw(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    for (const s of stars) {
      s.phase += dt * s.speed;
      s.x += s.vx;
      s.y += s.vy;
      if (s.y > height + 2) { s.y = -2; s.x = Math.random() * width; }
      if (s.x > width + 2) s.x = -2;
      if (s.x < -2) s.x = width + 2;

      const tw = 0.6 + Math.sin(s.phase) * 0.4;
      const alpha = Math.max(0.05, Math.min(1, s.base * tw));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      if (s.r > 1.1) {
        ctx.globalAlpha = alpha * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    if (now >= nextShootingAt) {
      spawnShooting();
      nextShootingAt = now + 3500 + Math.random() * 4500;
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const t = s.life / s.maxLife;
      if (t >= 1 || s.x < -200 || s.x > width + 200 || s.y > height + 200) {
        shootingStars.splice(i, 1);
        continue;
      }
      const alpha = Math.sin(Math.PI * t);
      const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.length;
      const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.length;
      const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    raf = requestAnimationFrame(draw);
  }

  function start() {
    cancelAnimationFrame(raf);
    lastTime = performance.now();
    raf = requestAnimationFrame(draw);
  }

  function stop() {
    cancelAnimationFrame(raf);
  }

  resize();
  start();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop(); else start();
  });
})();
