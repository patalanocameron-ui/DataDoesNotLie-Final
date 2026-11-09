// Small, dependency-free behavior for the marketing site.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header border once the page scrolls.
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu.
  var btn = document.querySelector(".menu-btn");
  var menu = document.querySelector(".mobile-nav");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) { menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
  }

  // Entrance animations.
  var items = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Product videos play only while on screen, and never with reduced motion.
  var vids = document.querySelectorAll("video[data-autoplay]");
  if (reduce) {
    vids.forEach(function (v) { v.removeAttribute("autoplay"); v.pause(); v.setAttribute("controls", ""); });
  } else if ("IntersectionObserver" in window) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vo.observe(v); });
  }

  // Lead forms post to a Google Form (no backend). Partner applications are marked in the message.
  var GOOGLE_FORM_ID = "1FAIpQLSfa9CtHvBQI-y2EgTQ2nXJ-xQbM8VJCfgtkZCV927HiXuhjNQ";
  var ENTRY_IDS = { name: "entry.91645865", email: "entry.492368119", company: "entry.497609646", message: "entry.259026376" };
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = Object.fromEntries(new FormData(form).entries());
      var kind = form.getAttribute("data-lead");
      var extra = [];
      ["clients", "website", "plan"].forEach(function (k) { if (data[k]) extra.push(k + ": " + data[k]); });
      var message = (kind === "partner" ? "Partner application: " : "") + (data.message || "") + (extra.length ? "\n" + extra.join("\n") : "");
      var params = new URLSearchParams();
      params.append(ENTRY_IDS.name, data.name || "");
      params.append(ENTRY_IDS.email, data.email || "");
      params.append(ENTRY_IDS.company, data.company || "");
      params.append(ENTRY_IDS.message, message);
      var submit = form.querySelector("[type=submit]");
      if (submit) submit.disabled = true;
      fetch("https://docs.google.com/forms/d/e/" + GOOGLE_FORM_ID + "/formResponse", {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString()
      }).catch(function () {}).then(function () {
        var ok = form.querySelector(".form-ok");
        if (ok) ok.style.display = "block";
        form.reset();
      });
    });
  });

  // Preselect a plan in the demo form when a "Book a call" link names one.
  var plan = new URLSearchParams(location.search).get("plan");
  var sel = document.querySelector("select[name=plan]");
  if (plan && sel) { for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === plan) sel.selectedIndex = i; }
})();
