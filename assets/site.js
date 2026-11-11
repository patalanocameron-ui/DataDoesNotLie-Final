// Data Does Not Lie / Daybreak marketing site. Dependency-free behavior.
// Every motion here demonstrates the product or orients the reader, and all of it
// stands down under prefers-reduced-motion (final states are shown instead).
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  // Run fn when el is on screen (once unless keep), with an optional pause callback.
  function onView(el, fn, opts) {
    opts = opts || {};
    if (!el) return;
    if (!hasIO) { fn(true); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { fn(true); if (!opts.keep) io.unobserve(el); }
        else if (opts.keep) fn(false);
      });
    }, { threshold: opts.threshold || 0.25, rootMargin: opts.margin || "0px" });
    io.observe(el);
  }

  /* ---------------- header ---------------- */
  var header = $(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Dropdowns: hover with a small intent delay on pointer devices, click and keyboard everywhere.
  var items = $$("[data-menu]");
  function closeAll(except) {
    items.forEach(function (it) {
      if (it === except) return;
      it.classList.remove("open");
      var b = $("button", it); if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  items.forEach(function (it) {
    var btn = $("button", it), t;
    var open = function () { closeAll(it); it.classList.add("open"); btn.setAttribute("aria-expanded", "true"); };
    var close = function () { it.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", function () { it.classList.contains("open") ? close() : open(); });
    it.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { clearTimeout(t); t = setTimeout(open, 60); } });
    it.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { clearTimeout(t); t = setTimeout(close, 160); } });
    it.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); btn.focus(); } });
    it.addEventListener("focusout", function (e) { if (!it.contains(e.relatedTarget)) close(); });
  });
  doc.addEventListener("click", function (e) { if (!e.target.closest("[data-menu]")) closeAll(); });

  var mbtn = $(".menu-btn"), mnav = $(".mobile-nav");
  if (mbtn && mnav) {
    var setMenu = function (open) {
      mnav.classList.toggle("open", open);
      mbtn.setAttribute("aria-expanded", open ? "true" : "false");
      doc.body.style.overflow = open ? "hidden" : "";
    };
    mbtn.addEventListener("click", function () { setMenu(!mnav.classList.contains("open")); });
    mnav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && mnav.classList.contains("open")) { setMenu(false); mbtn.focus(); } });
  }

  /* ---------------- reveals ---------------- */
  var reveals = $$(".reveal, [data-pain]");
  if (reduce || !hasIO) reveals.forEach(function (el) { el.classList.add("in"); });
  else {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { rio.observe(el); });
  }

  /* ---------------- mock choreography + counters ---------------- */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    var target = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    var pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    var fmt = function (v) { return pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US")) + suf; };
    if (reduce) { el.textContent = fmt(target); return; }
    var t0 = performance.now(), dur = 1300;
    requestAnimationFrame(function tick(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(tick);
    });
  }
  $$("[data-anim]").forEach(function (m) {
    var go = function () { m.classList.add("play"); $$("[data-count]", m).forEach(count); };
    if (reduce || !hasIO) go(); else onView(m, go, { threshold: 0.3 });
  });

  /* ---------------- hero showcase ---------------- */
  var show = $("[data-showcase]");
  if (show) {
    var tabs = $$("[data-tab]", show), imgs = $$(".screens img", show), floats = $$("[data-for]", show);
    var stage = $("[data-stage]", show);
    var cur = 0, DUR = 6500, timer = 0, running = false, left = DUR, startedAt = 0;
    var tablist = $(".show-tabs", show);
    var arm = function (ms) { clearTimeout(timer); startedAt = performance.now(); left = ms; timer = setTimeout(function () { select((cur + 1) % tabs.length); }, ms); };
    var select = function (i) {
      cur = i;
      tabs.forEach(function (b, k) {
        b.setAttribute("aria-selected", k === i ? "true" : "false"); b.tabIndex = k === i ? 0 : -1;
        var bar = $(".bar-p i", b); if (bar) { bar.classList.remove("run"); if (k === i && !reduce) { void bar.offsetWidth; bar.classList.add("run"); } }
      });
      imgs.forEach(function (im, k) { im.classList.toggle("on", k === i); if (k === i && im.loading === "lazy") im.loading = "eager"; });
      floats.forEach(function (f) { f.classList.remove("on"); });
      floats.filter(function (f) { return +f.dataset.for === i; }).forEach(function (f, k) { setTimeout(function () { if (cur === i) f.classList.add("on"); }, reduce ? 0 : 450 + k * 260); });
      if (running) arm(DUR);
    };
    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i); });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { e.preventDefault(); var n = (i + d + tabs.length) % tabs.length; tabs[n].focus(); select(n); }
      });
    });
    // preload the other screens after first paint
    window.addEventListener("load", function () { imgs.forEach(function (im) { im.loading = "eager"; }); });
    select(0);
    if (!reduce) {
      var userPaused = false, hold = false, visible = false;
      var sync = function () {
        var want = visible && !userPaused && !hold;
        if (want && !running) { running = true; tablist.classList.remove("paused"); arm(left); }
        else if (!want && running) { running = false; clearTimeout(timer); left = Math.max(400, left - (performance.now() - startedAt)); tablist.classList.add("paused"); }
      };
      var pbtn = $("[data-pause-show]", show);
      if (pbtn) pbtn.addEventListener("click", function () { userPaused = !userPaused; pbtn.setAttribute("aria-pressed", userPaused ? "true" : "false"); pbtn.setAttribute("aria-label", userPaused ? "Play the screen tour" : "Pause the screen tour"); sync(); });
      show.addEventListener("pointerenter", function () { hold = true; sync(); });
      show.addEventListener("pointerleave", function () { hold = false; sync(); });
      show.addEventListener("focusin", function () { hold = true; sync(); });
      show.addEventListener("focusout", function (e) { if (!show.contains(e.relatedTarget)) { hold = false; sync(); } });
      onView(show, function (vis) { visible = vis; sync(); }, { keep: true, threshold: 0.15 });
      // tilt flattens as you scroll into the product, a slight lean follows the pointer
      var sunEl = $("[data-hero] .sun"), lean = 0;
      var applyTilt = function () {
        var r = show.getBoundingClientRect(), vh = window.innerHeight;
        // A deeper lean that flattens over a longer scroll, so the screens read as curved on arrival.
        var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 1.5)));
        stage.style.transform = "rotateX(" + (22 * (1 - p)).toFixed(2) + "deg) rotateY(" + lean.toFixed(2) + "deg) translateY(" + (-10 * p).toFixed(1) + "px) scale(" + (0.96 + 0.04 * p).toFixed(4) + ")";
        if (sunEl) sunEl.style.opacity = (0.75 + p * 0.25).toFixed(3);
      };
      var ticking = false;
      var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { applyTilt(); ticking = false; }); } };
      window.addEventListener("scroll", req, { passive: true });
      window.addEventListener("resize", req);
      if (window.matchMedia("(pointer:fine)").matches) {
        show.addEventListener("pointermove", function (e) { var r = show.getBoundingClientRect(); lean = ((e.clientX - r.left) / r.width - 0.5) * 3; req(); });
        show.addEventListener("pointerleave", function () { lean = 0; req(); });
      }
      applyTilt();
    }
  }

  /* ---------------- the story: clock, chapters, dawn ---------------- */
  var story = $("[data-story]");
  if (story) {
    var chapters = $$("[data-chapter]", story), lis = $$(".chapters li", story);
    var clock = $("[data-clock]", story), ap = $("[data-ap]", story), sub = $("[data-clock-sub]", story);
    var fill = $(".chapters .fill", story), sky = $(".story-sky", story);
    var active = -1;
    var setChapter = function (i) {
      if (i === active) return; active = i;
      var c = chapters[i];
      lis.forEach(function (li, k) { li.classList.toggle("on", k === i); li.classList.toggle("done", k < i); });
      var swap = function () { clock.textContent = c.dataset.time; ap.textContent = c.dataset.ap; sub.textContent = c.dataset.sub; clock.style.opacity = 1; };
      if (reduce) swap(); else { clock.style.transition = "opacity .2s"; clock.style.opacity = 0; setTimeout(swap, 180); }
      if (fill) fill.style.setProperty("--prog", (i / (chapters.length - 1)) * 100 + "%");
      var dawn = parseFloat(c.dataset.dawn || 0);
      if (sky) { sky.style.setProperty("--dawn-amber", (dawn * 0.22).toFixed(3)); sky.style.setProperty("--dawn-mint", (dawn * 0.16).toFixed(3)); }
    };
    if (hasIO) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setChapter(chapters.indexOf(e.target)); });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      chapters.forEach(function (c) { cio.observe(c); });
    }
    setChapter(0);
  }

  /* ---------------- Ask Daybreak chat ---------------- */
  var chat = $("#chat");
  if (chat) {
    var turns = ["Which VIPs haven't been back since summer?", "How did October do against last year, by store?", "Draft a win-back for them"];
    var typed = $("[data-typed]", chat), umsg = $("[data-umsg]", chat), urow = $(".u-row", chat);
    var think = $(".think-row", chat), replies = $$(".reply", chat), chipsWrap = $("[data-chips]", chat), chips = $$("[data-chips] button", chat);
    var timers = [], curT = -1, auto = true;
    var clear = function () { timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = []; };
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    var showChips = function (i) { chips.forEach(function (c, k) { c.hidden = k === i; }); chipsWrap.classList.add("on"); };
    var final = function (i) {
      clear(); curT = i; umsg.textContent = turns[i]; urow.classList.add("on"); think.classList.remove("on");
      replies.forEach(function (r, k) { r.classList.toggle("on", k === i); r.classList.toggle("grown", k === i); });
      showChips(i);
    };
    var play = function (i) {
      clear(); curT = i;
      urow.classList.remove("on"); think.classList.remove("on"); chipsWrap.classList.remove("on");
      replies.forEach(function (r) { r.classList.remove("on", "grown"); });
      chat.classList.remove("sent"); chat.classList.add("typing"); typed.textContent = "";
      var q = turns[i], n = 0;
      var iv = setInterval(function () {
        n++; typed.textContent = q.slice(0, n);
        if (n >= q.length) {
          clearInterval(iv);
          later(function () {
            chat.classList.add("sent");
            later(function () {
              chat.classList.remove("typing", "sent"); typed.textContent = "";
              umsg.textContent = q; urow.classList.add("on");
              later(function () {
                think.classList.add("on");
                later(function () {
                  think.classList.remove("on"); replies[i].classList.add("on");
                  requestAnimationFrame(function () { requestAnimationFrame(function () { replies[i].classList.add("grown"); }); });
                  later(function () { showChips(i); }, 900);
                  if (auto && i < turns.length - 1) later(function () { play(i + 1); }, 8000);
                  else auto = false;
                }, 1100);
              }, 320);
            }, 220);
          }, 320);
        }
      }, 32);
      timers.push(iv);
    };
    chips.forEach(function (c) { c.addEventListener("click", function () { auto = false; var i = +c.dataset.q; reduce ? final(i) : play(i); }); });
    final(0);
    if (!reduce && hasIO) {
      onView(chat, function () { later(function () { if (auto) play(1); }, 3500); }, { threshold: 0.4 });
      chat.addEventListener("focusin", function () { if (auto) { auto = false; clear(); final(curT < 0 ? 0 : curT); } });
    }
  }

  /* ---------------- phone demo ---------------- */
  var phone = $("[data-phone]");
  if (phone) {
    var scenes = $$("[data-scene]", phone), steps = $$("[data-ps]"), tap = $("[data-tap]", phone), sheet = $("[data-sheet]", phone), ptime = $("[data-ptime]", phone);
    // per scene: how long it holds, the clock, and where the tap lands (in % of the screen) before moving on
    var plan = [
      { ms: 3600, time: "6:02", tap: [50, 52] },
      { ms: 3400, time: "6:03", tap: [50, 78] },
      { ms: 3800, time: "6:03", tap: [72, 56] },
      { ms: 4600, time: "6:04", tap: [72, 93], sheetAt: 1500 },
      { ms: 5200, time: "7:15" }
    ];
    var si = 0, ptimers = [], prun = false, pStart = 0, praf = 0;
    var pclear = function () { ptimers.forEach(clearTimeout); ptimers = []; cancelAnimationFrame(praf); };
    var setScene = function (i, animate) {
      scenes.forEach(function (s, k) { s.classList.toggle("on", k === i); s.classList.toggle("out", k === (i - 1 + scenes.length) % scenes.length && animate); });
      steps.forEach(function (s, k) { s.classList.toggle("on", k === i); var b = $(".pb i", s); if (b) b.style.transform = "scaleX(0)"; });
      if (ptime) ptime.textContent = plan[i].time;
      if (sheet) sheet.classList.remove("up");
      si = i;
    };
    var doTap = function (xy) {
      if (!tap || !xy) return;
      tap.style.left = "calc(" + xy[0] + "% - 22px)"; tap.style.top = "calc(" + xy[1] + "% - 22px)";
      tap.classList.remove("go"); void tap.offsetWidth; tap.classList.add("go");
    };
    var run = function (i) {
      pclear(); setScene(i, true); pStart = performance.now();
      var p = plan[i];
      if (p.sheetAt && sheet) ptimers.push(setTimeout(function () { doTap([72, 93]); sheet.classList.add("up"); }, p.sheetAt - 500));
      if (p.tap) ptimers.push(setTimeout(function () { doTap(p.tap); }, p.ms - 650));
      ptimers.push(setTimeout(function () { run((i + 1) % scenes.length); }, p.ms));
      var bar = $(".pb i", steps[i]);
      var tick = function (now) { var q = Math.min(1, (now - pStart) / p.ms); if (bar) bar.style.transform = "scaleX(" + q + ")"; if (q < 1 && prun) praf = requestAnimationFrame(tick); };
      praf = requestAnimationFrame(tick);
    };
    var pick = function (k) { if (reduce || pPaused) { pclear(); setScene(k); if (k === 3 && sheet) sheet.classList.add("up"); } else run(k); };
    steps.forEach(function (s, k) {
      s.addEventListener("click", function () { pick(k); });
      s.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(k); } });
    });
    var pPaused = false, pHold = false, pVis = false, pStage = phone.closest(".phone-grid");
    var psync = function () {
      var want = pVis && !pPaused && !pHold;
      if (want && !prun) { prun = true; run(si); }
      else if (!want && prun) { prun = false; pclear(); }
    };
    var ppb = $("[data-pause-phone]");
    if (ppb) ppb.addEventListener("click", function () { pPaused = !pPaused; ppb.setAttribute("aria-pressed", pPaused ? "true" : "false"); ppb.textContent = pPaused ? "Play demo" : "Pause demo"; psync(); });
    if (pStage) { pStage.addEventListener("pointerenter", function () { pHold = true; psync(); }); pStage.addEventListener("pointerleave", function () { pHold = false; psync(); }); }
    if (reduce || !hasIO) { setScene(2); if (ppb) ppb.hidden = true; }
    else onView(phone, function (vis) { pVis = vis; psync(); }, { keep: true, threshold: 0.3 });
  }

  /* ---------------- tabs (Also in Daybreak) ---------------- */
  $$("[data-more]").forEach(function (list) {
    var tabs2 = $$("[role=tab]", list);
    var pick = function (i, focus) {
      tabs2.forEach(function (t, k) {
        var on = k === i; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1;
        var panel = doc.getElementById(t.getAttribute("aria-controls")); if (panel) panel.hidden = !on;
      });
      if (focus) tabs2[i].focus();
    };
    tabs2.forEach(function (t, i) {
      t.addEventListener("click", function () { pick(i); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { e.preventDefault(); pick((i + d + tabs2.length) % tabs2.length, true); }
      });
    });
  });

  /* ---------------- white label: the same app, a partner's brand ---------------- */
  var wl = $("[data-wl]");
  if (wl && !reduce) {
    var brands = [
      { name: "Daybreak", url: "daybreak.datadoesnotlie.com", accent: "#2BE39B", letter: "D", client: "Seaside Cleaners, 3 stores" },
      { name: "Northwind Insights", url: "app.northwindinsights.com", accent: "#9B8CFF", letter: "N", client: "Corner Bakery, 2 stores" },
      { name: "Harbor Local", url: "portal.harborlocal.co", accent: "#F2A93B", letter: "H", client: "Bayside Florist" }
    ];
    var bi = 0, wt = 0;
    var swapBrand = function () {
      bi = (bi + 1) % brands.length; var b = brands[bi];
      wl.classList.add("swap");
      setTimeout(function () {
        $("[data-wl-name]", wl).textContent = b.name; $("[data-wl-url]", wl).textContent = b.url;
        $("[data-wl-logo]", wl).textContent = b.letter; $("[data-wl-client]", wl).textContent = b.client;
        wl.style.setProperty("--accent", b.accent); wl.classList.remove("swap");
      }, 300);
    };
    var rounds = 0;
    onView(wl, function (vis) { clearInterval(wt); if (vis && rounds < brands.length * 2) wt = setInterval(function () { swapBrand(); if (++rounds >= brands.length * 2) clearInterval(wt); }, 3200); }, { keep: true, threshold: 0.4 });
  }

  /* ---------------- tour video modal ---------------- */
  var modal = $("[data-vmodal]"), lastFocus = null;
  if (modal) {
    var vid = $("video", modal);
    var openV = function () {
      lastFocus = doc.activeElement;
      if (!vid.src) vid.src = vid.dataset.src;
      modal.hidden = false;
      requestAnimationFrame(function () { modal.classList.add("open"); setTimeout(function () { $("[data-video-close]", modal).focus(); }, 60); });
      doc.body.style.overflow = "hidden";
      var p = vid.play(); if (p && p.catch) p.catch(function () {});
    };
    var closeV = function () {
      modal.classList.remove("open"); vid.pause(); doc.body.style.overflow = "";
      setTimeout(function () { modal.hidden = true; }, 300);
      if (lastFocus) lastFocus.focus();
    };
    $$("[data-video-open]").forEach(function (b) { b.addEventListener("click", openV); });
    $("[data-video-close]", modal).addEventListener("click", closeV);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeV(); });
    doc.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") closeV();
      if (e.key === "Tab") {
        var f = [$("[data-video-close]", modal), vid];
        var i = f.indexOf(doc.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  }

  /* ---------------- product videos on other pages ---------------- */
  var vids = $$("video[data-autoplay]");
  if (reduce) vids.forEach(function (v) { v.removeAttribute("autoplay"); v.pause(); v.setAttribute("controls", ""); });
  else vids.forEach(function (v) { onView(v, function (vis) { if (vis) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }, { keep: true }); });

  /* ---------------- lead forms (Google Form, no backend) ---------------- */
  var GOOGLE_FORM_ID = "1FAIpQLSfa9CtHvBQI-y2EgTQ2nXJ-xQbM8VJCfgtkZCV927HiXuhjNQ";
  var ENTRY_IDS = { name: "entry.91645865", email: "entry.492368119", company: "entry.497609646", message: "entry.259026376" };
  $$("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = Object.fromEntries(new FormData(form).entries());
      var kind = form.getAttribute("data-lead");
      var extra = [];
      ["clients", "website", "plan", "role", "permission"].forEach(function (k) { if (data[k]) extra.push(k + ": " + data[k]); });
      var message = (kind === "partner" ? "Partner application: " : kind === "testimonial" ? "Testimonial: " : "") + (data.message || "") + (extra.length ? "\n" + extra.join("\n") : "");
      var params = new URLSearchParams();
      params.append(ENTRY_IDS.name, data.name || "");
      params.append(ENTRY_IDS.email, data.email || "");
      params.append(ENTRY_IDS.company, data.company || "");
      params.append(ENTRY_IDS.message, message);
      var submit = form.querySelector("[type=submit]");
      if (submit) { submit.disabled = true; submit.textContent = "Sending"; }
      fetch("https://docs.google.com/forms/d/e/" + GOOGLE_FORM_ID + "/formResponse", {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString()
      }).catch(function () {}).then(function () {
        var ok = form.querySelector(".form-ok");
        if (ok) ok.style.display = "block";
        if (submit) submit.textContent = "Sent";
        form.reset();
      });
    });
  });

  // Preselect a plan in the demo form when a link names one (?plan=enterprise#demo).
  var planQ = new URLSearchParams(location.search).get("plan");
  var sel = $("select[name=plan]");
  if (planQ && sel) for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === planQ) sel.selectedIndex = i;
})();

// Phone conversion bar: appears once the first screen has scrolled away, hides near the footer.
(function () {
  var bar = document.querySelector("[data-mcta]");
  if (!bar) return;
  var foot = document.querySelector(".site-footer");
  var tick = function () {
    var past = window.scrollY > window.innerHeight * 0.9;
    var nearFoot = foot && foot.getBoundingClientRect().top < window.innerHeight;
    bar.classList.toggle("show", past && !nearFoot);
  };
  window.addEventListener("scroll", tick, { passive: true });
  tick();
})();

// Sections below the fold render lazily (content-visibility), so their heights settle on approach.
// Jump links aim again once the target's real layout is known, so they land on the right section.
(function () {
  var cancelled = false;
  ["wheel", "touchstart", "keydown"].forEach(function (ev) { window.addEventListener(ev, function () { cancelled = true; }, { passive: true }); });
  var land = function (id, smooth) {
    var el = id && document.getElementById(id);
    if (!el) return;
    cancelled = false;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    [200, 500, 900, 1400, 2100, 3000].forEach(function (ms) {
      setTimeout(function () {
        if (cancelled) return;
        var top = el.getBoundingClientRect().top;
        if (Math.abs(top - 88) > 6) window.scrollTo({ top: window.scrollY + top - 88, behavior: "auto" });
      }, ms);
    });
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
    var id = decodeURIComponent(url.hash.slice(1));
    if (!document.getElementById(id)) return;
    e.preventDefault();
    history.pushState(null, "", url.hash);
    land(id, false);
  });
  if (location.hash) window.addEventListener("load", function () { land(decodeURIComponent(location.hash.slice(1)), false); });
})();

// Conversion events for Google Analytics and Tag Manager (only when the tags are on the page).
(function () {
  var send = function (name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {}); // Google Analytics
    if (window.dataLayer) { var o = { event: name }; for (var k in params || {}) o[k] = params[k]; window.dataLayer.push(o); } // Tag Manager triggers
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a, button");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var text = (a.textContent || "").trim().slice(0, 60);
    var plan = (href.match(/checkout\?plan=([a-z]+)/) || [])[1];
    if (plan) send("begin_checkout", { plan: plan, link_text: text });
    else if (/Start (your )?free month/i.test(text)) send("start_free_month_click", { link_text: text, page: location.pathname });
    if (a.getAttribute("data-track") === "open_demo" || /\/demo$/.test(href)) send("open_demo", { link_text: text, page: location.pathname });
    if (a.hasAttribute("data-video-open")) send("watch_tour", {});
  });
  document.querySelectorAll("form[data-lead]").forEach(function (f) {
    f.addEventListener("submit", function () { if (f.checkValidity()) send("generate_lead", { form: f.getAttribute("data-lead") }); });
  });
})();

// Phones: the founder bio opens on request.
document.querySelectorAll("[data-more-bio]").forEach(function (b) {
  b.addEventListener("click", function () { var f = b.closest(".founder"); f.classList.add("open"); b.setAttribute("aria-expanded", "true"); });
});
