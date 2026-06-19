(() => {
  const toast = document.getElementById("toast");
  let toastTimer = 0;

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1500);
  }

  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sel = btn.getAttribute("data-target");
      const target = sel ? document.querySelector(sel) : null;
      if (!target) return;
      const text = target.innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("is-copied");
        const old = btn.textContent;
        btn.textContent = "Скопировано";
        showToast("Сниппет в буфере");
        setTimeout(() => {
          btn.classList.remove("is-copied");
          btn.textContent = old;
        }, 1400);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel2 = window.getSelection();
        sel2.removeAllRanges();
        sel2.addRange(range);
        showToast("Выдели и скопируй вручную");
      }
    });
  });
})();
