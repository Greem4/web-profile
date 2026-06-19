/* greemlab logo kit — параллакс по курсору
 * Добавь класс .logo--parallax на нужный элемент.
 * Скрипт сам найдёт все такие элементы и подружит с курсором.
 */
(() => {
  const els = document.querySelectorAll(".logo--parallax");
  if (!els.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover)").matches) return;

  const MAX = 18;
  const EASE = 0.08;
  const items = Array.from(els).map((el) => ({ el, tx: 0, ty: 0, cx: 0, cy: 0 }));
  let rafId = 0;

  window.addEventListener("pointermove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const nx = (e.clientX - cx) / cx;
    const ny = (e.clientY - cy) / cy;
    for (const it of items) {
      it.tx = nx * MAX;
      it.ty = ny * MAX;
    }
    if (!rafId) rafId = requestAnimationFrame(tick);
  });

  window.addEventListener("pointerleave", () => {
    for (const it of items) { it.tx = 0; it.ty = 0; }
    if (!rafId) rafId = requestAnimationFrame(tick);
  });

  function tick() {
    let alive = false;
    for (const it of items) {
      it.cx += (it.tx - it.cx) * EASE;
      it.cy += (it.ty - it.cy) * EASE;
      it.el.style.setProperty("--px", it.cx.toFixed(2) + "px");
      it.el.style.setProperty("--py", it.cy.toFixed(2) + "px");
      if (Math.abs(it.tx - it.cx) > 0.1 || Math.abs(it.ty - it.cy) > 0.1) alive = true;
    }
    rafId = alive ? requestAnimationFrame(tick) : 0;
  }
})();
