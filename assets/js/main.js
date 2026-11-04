/* Citybound Limo — site interactions */
(function () {
  "use strict";

  /* ---------- Icon sprite (referenced via <svg><use href="#i-name"/></svg>) ---------- */
  var s = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var icons = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a5.8 5.8 0 0 1 7.1-.9l.5.3a4 4 0 0 0 2.6.5L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    baby: '<path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    luggage: '<rect x="6" y="6" width="12" height="15" rx="2"/><path d="M9 6V3h6v3M10 10v7M14 10v7M8 21v1M16 21v1"/>',
    timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    rings: '<circle cx="9" cy="14" r="6"/><circle cx="15" cy="14" r="6"/><path d="m9 4 3-2 3 2-3 2z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    party: '<path d="M5.8 11.3 2 22l10.7-3.8M4 3h.01M22 8h.01M15 2h.01M22 20h.01"/><path d="m22 2-2.2.7a3 3 0 0 0-2 3.3c.1.8-.4 1.6-1.2 1.8L16 8"/><path d="m22 13-.8-.3a2.6 2.6 0 0 0-3.2 1.4c-.3.7-1.1 1-1.8.7L15 14.5"/><path d="M11 2l.3.8a2.6 2.6 0 0 1-1.4 3.2c-.7.3-1 1.1-.7 1.8L9.5 9"/><path d="M10.3 13.7c2 2 3 4.2 2.3 4.9s-2.9-.3-4.9-2.3-3-4.2-2.3-4.9 2.9.3 4.9 2.3z"/>',
    school: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 .6-.5 1-1 1.2-1.2.5-2 2-2 3.8M14 14.7V17c0 .6.5 1 1 1.2 1.2.5 2 2 2 3.8M18 2H6v7a6 6 0 0 0 12 0z"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7z"/><path d="M5 20h14"/>',
    wine: '<path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/>',
    tree: '<path d="m12 2 5 6h-3l4 5h-3l4 5H5l4-5H6l4-5H7z"/><path d="M12 18v4"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    restroom: '<circle cx="7" cy="4" r="2"/><circle cx="17" cy="4" r="2"/><path d="M7 22v-6M5 9h4l1 7H4zM17 22V9M15 9h4v7h-4M12 2v20"/>'
  };
  var brand = {
    facebook: '<path fill="currentColor" d="M14 13.5h2.5l1-4H14v-2c0-1 0-2 2-2h1.5V2.1A28 28 0 0 0 14.6 2C12 2 10 3.7 10 6.7v2.8H7v4h3V22h4z"/>',
    linkedin: '<path fill="currentColor" d="M6.9 21H3.1V8.9h3.8zM5 7.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4zM21 21h-3.8v-5.9c0-1.4 0-3.2-2-3.2s-2.2 1.5-2.2 3.1v6H9.2V8.9h3.6v1.7h.1c.5-1 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8z"/>',
    yelp: '<path fill="currentColor" d="M12.3 2.2c-.6-.4-4.6.7-5.5 1.6-.3.3-.4.7-.3 1l3.7 6.2c.6 1 2 .6 2-.5V3c0-.3-.1-.6-.4-.8zm-2.6 12.4c.5-.2.8-.7.6-1.2a1 1 0 0 0-.9-.7L4.3 11c-.6-.2-1.1.3-1.2.9-.1 1.1 0 3 .7 4 .3.4.7.5 1.2.3zm1.4 1.4c-.4-.4-1-.4-1.4 0l-3.6 3.9c-.4.4-.3 1 .1 1.3 1 .7 2.7 1.3 3.9 1.3.5 0 .9-.4.9-.9l.2-5.1c0-.2 0-.4-.1-.5zm8.5-3.9c-.4-1-1.9-2.8-2.8-3.2-.4-.2-.9-.1-1.2.3l-3.1 4.4c-.6.8.2 1.9 1.1 1.6l5.3-1.7c.6-.2.9-.8.7-1.4zm-5.4 3.5c-.9-.3-1.7.7-1.2 1.5l2.7 4.6c.3.5 1 .6 1.4.2.9-.7 2-2.3 2.2-3.5.1-.4-.2-.9-.6-1z"/>'
  };
  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">';
  Object.keys(icons).forEach(function (k) {
    sprite += '<symbol id="i-' + k + '" viewBox="0 0 24 24" ' + s + '>' + icons[k] + "</symbol>";
  });
  Object.keys(brand).forEach(function (k) {
    sprite += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + brand[k] + "</symbol>";
  });
  sprite += "</svg>";
  document.body.insertAdjacentHTML("afterbegin", sprite);

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector("use").setAttribute("href", "#i-menu");
      }
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Vehicle photo thumbs ---------- */
  document.querySelectorAll(".vehicle").forEach(function (card) {
    var main = card.querySelector(".vehicle-media img");
    var thumbs = card.querySelectorAll(".vehicle-thumbs button");
    thumbs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        main.src = btn.dataset.src;
        thumbs.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      });
    });
  });

  /* ---------- Fleet filter ---------- */
  var filters = document.querySelectorAll(".filter");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var key = f.dataset.filter;
      filters.forEach(function (b) { b.setAttribute("aria-pressed", b === f ? "true" : "false"); });
      document.querySelectorAll(".fleet-grid .vehicle").forEach(function (v) {
        var cats = (v.dataset.cat || "").split(" ");
        v.hidden = !(key === "all" || cats.indexOf(key) !== -1);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var gallery = document.querySelectorAll("[data-lightbox]");
  if (gallery.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML =
      '<img alt="">' +
      '<button class="lb-btn lb-close" aria-label="Close"><svg><use href="#i-x"/></svg></button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous photo"><svg><use href="#i-left"/></svg></button>' +
      '<button class="lb-btn lb-next" aria-label="Next photo"><svg><use href="#i-right"/></svg></button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lb-count");
    var idx = 0;
    var lastFocus = null;
    var items = Array.prototype.slice.call(gallery);

    var show = function (i) {
      idx = (i + items.length) % items.length;
      var img = items[idx].querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCount.textContent = idx + 1 + " / " + items.length;
    };
    var close = function () {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };
    items.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        lastFocus = btn;
        show(i);
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
        lb.querySelector(".lb-close").focus();
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }
})();
