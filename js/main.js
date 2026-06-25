/* STRATA — plain DOM, no modules. Guard every lookup. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- Header scrolled state ---------------- */
  var hdr = $(".hdr");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Announcement rotator ---------------- */
  (function () {
    var msgs = $$(".announce__msg");
    if (msgs.length < 2) return;
    var i = 0, timer, animating = false;
    var show = function (n) {
      if (animating) return;
      animating = true;
      msgs[i].classList.remove("is-active");          // fade current out
      var ni = (n + msgs.length) % msgs.length;
      setTimeout(function () {                          // then fade next in (no overlap)
        i = ni; msgs[i].classList.add("is-active"); animating = false;
      }, 340);
    };
    var start = function () { timer = setInterval(function () { show(i + 1); }, 4500); };
    var reset = function () { clearInterval(timer); start(); };
    $$(".announce__arrow").forEach(function (b) {
      b.addEventListener("click", function () { show(i + parseInt(b.getAttribute("data-dir"), 10)); reset(); });
    });
    start();
  })();

  /* ---------------- Search toggle ---------------- */
  var searchBar = $("#search-bar");
  if (searchBar) {
    var openSearch = function (open) {
      searchBar.hidden = !open;
      if (open) { var inp = $("input", searchBar); if (inp) inp.focus(); }
    };
    on($("#search-toggle"), "click", function () { openSearch(searchBar.hidden); });
    on($("#search-close"), "click", function () { openSearch(false); });
  }

  /* ---------------- Mobile nav drawer ---------------- */
  var overlay = $("#overlay");
  var mnav = $("#mobile-nav");
  var reveal = function (el) { el.hidden = false; void el.offsetWidth; el.classList.add("show"); };
  var setOverlay = function (on) {
    if (!overlay) return;
    if (on) { reveal(overlay); }
    else { overlay.classList.remove("show"); setTimeout(function () { if (!anyDrawerOpen()) overlay.hidden = true; }, 380); }
  };
  var anyDrawerOpen = function () {
    return (mnav && mnav.classList.contains("show")) || (cart && cart.classList.contains("show"));
  };
  var openMobileNav = function (open) {
    if (!mnav) return;
    if (open) { reveal(mnav); setOverlay(true); }
    else { mnav.classList.remove("show"); setTimeout(function () { mnav.hidden = true; }, 420); setOverlay(false); }
  };
  on($(".nav-toggle"), "click", function () { openMobileNav(true); });
  on($(".mobile-nav__close"), "click", function () { openMobileNav(false); });
  if (mnav) $$("a", mnav).forEach(function (a) { on(a, "click", function () { openMobileNav(false); }); });

  /* ---------------- Size selection ---------------- */
  $$(".product__sizes").forEach(function (group) {
    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".size");
      if (!btn) return;
      $$(".size", group).forEach(function (s) { s.classList.remove("selected"); });
      btn.classList.add("selected");
    });
  });

  /* ---------------- Cart ---------------- */
  var cart = $("#cart");
  var bagCount = $("#bag-count");
  var items = [];

  var fmt = function (n) {
    return "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: (n % 1 ? 2 : 0), maximumFractionDigits: 2 });
  };

  var totalQty = function () { return items.reduce(function (a, it) { return a + it.qty; }, 0); };
  var subtotal = function () { return items.reduce(function (a, it) { return a + it.price * it.qty; }, 0); };

  var openCart = function (open) {
    if (!cart) return;
    if (open) { reveal(cart); setOverlay(true); }
    else { cart.classList.remove("show"); setTimeout(function () { cart.hidden = true; }, 440); setOverlay(false); }
  };
  on($("#bag-toggle"), "click", function () { openCart(true); });
  on($("#cart-close"), "click", function () { openCart(false); });
  on(overlay, "click", function () { openCart(false); openMobileNav(false); });

  var addItem = function (p, size) {
    var key = p.id + "|" + (size || "");
    var found = null;
    items.forEach(function (it) { if (it.key === key) found = it; });
    if (found) found.qty += 1;
    else items.push({ key: key, id: p.id, name: p.name, price: +p.price, size: size || "", img: p.img, qty: 1 });
    render();
  };

  var render = function () {
    var box = $("#cart-items");
    if (bagCount) { bagCount.textContent = totalQty(); bagCount.classList.toggle("show", totalQty() > 0); }
    var q = $("#cart-qty"); if (q) q.textContent = totalQty();
    var st = $("#cart-subtotal"); if (st) st.textContent = fmt(subtotal());
    var ck = $("#cart-checkout"); if (ck) ck.disabled = items.length === 0;
    if (!box) return;
    if (!items.length) { box.innerHTML = '<p class="cart__empty">Your bag is empty — every STRATA piece is made to be kept.</p>'; return; }
    box.innerHTML = items.map(function (it, idx) {
      return '<div class="cart-line">' +
        '<img src="' + it.img + '" alt="">' +
        '<div><div class="cart-line__name">' + it.name + '</div>' +
        '<div class="cart-line__meta">' + (it.size ? "Size " + it.size + " · " : "") + fmt(it.price) + '</div>' +
        '<div class="cart__qty-ctrl"><button data-dec="' + idx + '" aria-label="Decrease">−</button><span>' + it.qty + '</span><button data-inc="' + idx + '" aria-label="Increase">+</button></div>' +
        '<button class="cart-line__remove" data-rm="' + idx + '">Remove</button></div>' +
        '<div class="cart-line__price">' + fmt(it.price * it.qty) + '</div>' +
        '</div>';
    }).join("");
  };

  // Delegate qty/remove
  on($("#cart-items"), "click", function (e) {
    var t = e.target;
    var inc = t.getAttribute("data-inc"), dec = t.getAttribute("data-dec"), rm = t.getAttribute("data-rm");
    if (inc !== null) { items[+inc].qty += 1; render(); }
    else if (dec !== null) { items[+dec].qty -= 1; if (items[+dec].qty < 1) items.splice(+dec, 1); render(); }
    else if (rm !== null) { items.splice(+rm, 1); render(); }
  });

  // Add-to-bag buttons
  $$("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".product");
      if (!card) return;
      var sel = $(".size.selected", card);
      var p = { id: card.getAttribute("data-id"), name: card.getAttribute("data-name"), price: card.getAttribute("data-price"), img: card.getAttribute("data-img") };
      addItem(p, sel ? sel.textContent.trim() : "");
      toast(p.name + " added to bag");
      openCart(true);
    });
  });

  // Capsule add
  on($("#capsule-add"), "click", function (btn) {
    var data;
    try { data = JSON.parse(this.getAttribute("data-bundle")); } catch (e) { data = []; }
    data.forEach(function (p) { addItem(p, ""); });
    toast("The Foundation Capsule added to bag");
    openCart(true);
  });

  /* ---------------- Toast ---------------- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    reveal(toastEl);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 320);
    }, 2400);
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealables = $$(".fade-in");
  if (revealables.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else { revealables.forEach(function (el) { el.classList.add("visible"); }); }

  /* ---------------- Contact form ---------------- */
  var form = $("#contact-form");
  if (form) {
    var status = $(".form-status", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var honey = $('input[name="company"]', form);
      if (honey && honey.value) return;
      var btn = $('button[type="submit"]', form);
      var data = {
        name: ($('[name="name"]', form) || {}).value || "",
        email: ($('[name="email"]', form) || {}).value || "",
        message: ($('[name="message"]', form) || {}).value || "",
        source: "STRATA"
      };
      if (btn) btn.disabled = true;
      if (status) status.textContent = "Sending…";
      fetch("https://forms.caiomsi.com/api/submit", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      })
        .then(function (r) { if (!r.ok) throw new Error("fail"); return r.json().catch(function () { return {}; }); })
        .then(function () { form.reset(); if (status) status.textContent = "Thank you — we'll be in touch."; })
        .catch(function () { if (status) status.textContent = "Something went wrong. Please email hello@strata.example."; })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  }

  /* ---------------- Footer year ---------------- */
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------- Esc closes drawers ---------------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { openCart(false); openMobileNav(false); if (searchBar) searchBar.hidden = true; }
  });

  /* helper */
  function on(el, evt, fn) { if (el) el.addEventListener(evt, function (e) { fn.call(el, e); }); }
})();
