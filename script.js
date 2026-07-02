/* ===================================================================
   Alexia Rucker — interactions
=================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Custom cursor ---------- */
  if (finePointer) {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('[data-cursor="hover"]').forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hovering"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hovering"));
    });
  }

  /* ---------- Nav scrolled + progress ---------- */
  const nav = document.getElementById("nav");
  const progress = document.getElementById("scrollProgress");
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle("scrolled", y > 20);
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => { toggle.classList.remove("open"); navLinks.classList.remove("open"); })
  );

  /* ---------- Prep hand-drawn strokes (set dash length) ---------- */
  document.querySelectorAll(".draw path").forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = reduceMotion ? 0 : len;
    p.style.transition = "stroke-dashoffset 1.1s var(--ease)";
  });

  /* ---------- Scroll reveal + draw + highlight ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("in-view");
      // once the entrance finishes, drop the stagger delay so hover reacts instantly
      setTimeout(() => { el.style.transitionDelay = "0s"; }, 1100);

      // marks inside
      el.querySelectorAll(".mark").forEach((m, i) => setTimeout(() => m.classList.add("lit"), 250 + i * 160));
      if (el.classList.contains("mark")) setTimeout(() => el.classList.add("lit"), 250);

      // strokes inside (or self)
      const strokes = el.matches(".draw") ? [el] : el.querySelectorAll(".draw");
      strokes.forEach((s) => {
        s.classList.add("drawn");
        s.querySelectorAll("path").forEach((p) => { p.style.strokeDashoffset = "0"; });
      });

      io.unobserve(el);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -60px 0px" });

  document.querySelectorAll(".reveal, .mark, .draw, .about-vine").forEach((el) => io.observe(el));

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Card tilt ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".tilt").forEach((el) => {
      const max = 7;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-6px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Contact form (AJAX submit) ---------- */
  const cform = document.getElementById("contactForm");
  if (cform) {
    cform.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = cform.querySelector('button[type="submit"]');
      const note = cform.querySelector(".form-note");
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…";
      if (note) { note.textContent = "I'll never share your info. You'll hear back within one business day."; note.style.color = ""; }
      try {
        const res = await fetch(cform.action, {
          method: "POST",
          body: new FormData(cform),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          cform.innerHTML = '<div class="form-thanks"><h3>Thank you!</h3><p>Your inquiry is on its way — I\'ll be in touch within one business day.</p></div>';
        } else {
          throw new Error("bad response");
        }
      } catch (err) {
        btn.disabled = false; btn.textContent = orig;
        if (note) { note.textContent = "Hmm, something went wrong. Please try again in a moment."; note.style.color = "var(--red)"; }
      }
    });
  }

  /* ---------- Hero aurora parallax ---------- */
  const aurora = document.querySelector(".hero-aurora");
  if (aurora && finePointer && !reduceMotion) {
    const hero = aurora.closest(".hero");
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      aurora.style.transform = `translate(${px * 24}px, ${py * 24}px)`;
    });
    hero.addEventListener("mouseleave", () => { aurora.style.transform = ""; });
  }
})();
