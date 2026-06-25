/* STRATA — plain DOM, no modules. Guard every lookup. */
(function () {
  "use strict";

  /* ---------- Nav: scrolled state ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 24) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile hamburger ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close menu after tapping a link
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll(".fade-in");
  if (revealables.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Contact form -> MSI-Forms backend ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Honeypot: silently drop bots
      var honey = form.querySelector('input[name="company"]');
      if (honey && honey.value) return;

      var btn = form.querySelector('button[type="submit"]');
      var data = {
        name: (form.querySelector('[name="name"]') || {}).value || "",
        email: (form.querySelector('[name="email"]') || {}).value || "",
        message: (form.querySelector('[name="message"]') || {}).value || "",
        source: "STRATA"
      };

      if (btn) { btn.disabled = true; }
      if (status) { status.textContent = "Sending…"; }

      fetch("https://forms.caiomsi.com/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          if (!r.ok) throw new Error("Request failed");
          return r.json().catch(function () { return {}; });
        })
        .then(function () {
          form.reset();
          if (status) { status.textContent = "Thank you — we'll be in touch."; }
        })
        .catch(function () {
          if (status) { status.textContent = "Something went wrong. Please email hello@strata.example."; }
        })
        .finally(function () {
          if (btn) { btn.disabled = false; }
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yr = document.querySelector("#year");
  if (yr) { yr.textContent = new Date().getFullYear(); }
})();
