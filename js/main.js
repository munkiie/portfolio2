/* =====================================================
   Realeboha Mokodutlo — Personal Portfolio
   Shared JavaScript for all pages
   Features:
   1. Personalised welcome message + live clock
   2. Light / Dark mode toggle (saved in the browser)
   3. Mobile hamburger navigation
   4. Gallery category filtering
   5. Image lightbox (with keyboard + arrow navigation)
   6. Booking form validation with success message
   7. Scroll reveal animations & skill bars
   8. Friendly placeholders for photos not uploaded yet
   9. Soft background music (welcome pop-up + floating bubble + volume)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  welcomeAndClock();
  themeToggle();
  mobileNav();
  photoPlaceholders();
  galleryFilter();
  lightbox();
  bookingForm();
  scrollReveal();
  markActiveLink();
  softMusic();
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
});

/* 1. Welcome message + live clock ------------------------------ */
function welcomeAndClock() {
  var box = document.querySelector("[data-greeting]");
  if (!box) return;

  function paint() {
    var now = new Date();
    var h = now.getHours();
    var part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    var time = now.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    box.innerHTML =
      part + ", welcome to my portfolio &middot; <strong>" + time + "</strong>";
  }
  paint();
  setInterval(paint, 1000);
}

/* 2. Light / dark mode ----------------------------------------- */
function themeToggle() {
  var btn = document.querySelector("[data-theme-toggle]");
  var saved = null;
  try {
    saved = localStorage.getItem("rm-theme");
  } catch (e) {}
  if (saved === "dark") document.body.classList.add("dark");
  setIcon();

  function setIcon() {
    if (!btn) return;
    var dark = document.body.classList.contains("dark");
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  if (!btn) return;
  btn.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    try {
      localStorage.setItem(
        "rm-theme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    } catch (e) {}
    setIcon();
  });
}

/* 3. Mobile navigation ----------------------------------------- */
function mobileNav() {
  var btn = document.querySelector("[data-nav-toggle]");
  var list = document.getElementById("primary-nav");
  if (!btn || !list) return;

  btn.addEventListener("click", function () {
    var open = list.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "✕" : "☰";
  });

  list.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      list.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "☰";
    });
  });
}

/* 4. Placeholders for photos that are not uploaded yet ---------- */
function photoPlaceholders() {
  document.querySelectorAll("img[data-photo]").forEach(function (img) {
    function fail() {
      var holder = img.closest(".frame, .shot");
      if (holder) holder.classList.add("is-missing");
    }
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });
}

/* 5. Gallery filtering ----------------------------------------- */
function galleryFilter() {
  var buttons = document.querySelectorAll("[data-filter]");
  var shots = document.querySelectorAll(".shot");
  var counter = document.querySelector("[data-count]");
  if (!buttons.length) return;

  function apply(cat) {
    var shown = 0;
    shots.forEach(function (shot) {
      var match = cat === "all" || shot.dataset.category === cat;
      shot.hidden = !match;
      if (match) shown++;
    });
    if (counter) counter.textContent = shown + (shown === 1 ? " photo" : " photos");
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      buttons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      apply(btn.dataset.filter);
    });
  });

  apply("all");
}

/* 6. Lightbox --------------------------------------------------- */
function lightbox() {
  var box = document.getElementById("lightbox");
  if (!box) return;
  var img = box.querySelector("img");
  var note = box.querySelector(".lightbox__note");
  var caption = box.querySelector("figcaption");
  var index = 0;

  function visibleShots() {
    return Array.prototype.filter.call(document.querySelectorAll(".shot"), function (s) {
      return !s.hidden;
    });
  }

  function open(i) {
    var list = visibleShots();
    if (!list.length) return;
    index = (i + list.length) % list.length;
    var shot = list[index];
    var source = shot.querySelector("img");
    var label = shot.dataset.caption || (source ? source.alt : "");
    var missing = shot.classList.contains("is-missing");

    img.style.display = missing ? "none" : "block";
    note.style.display = missing ? "block" : "none";
    if (missing) {
      note.innerHTML =
        "Photo not uploaded yet<br><code>" + (source ? source.getAttribute("src") : "") + "</code>";
    } else {
      img.src = source.src;
      img.alt = source.alt;
    }
    caption.textContent = label;
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".shot").forEach(function (shot) {
    shot.addEventListener("click", function () {
      open(visibleShots().indexOf(shot));
    });
  });

  box.querySelector(".lightbox__close").addEventListener("click", close);
  box.querySelector(".prev").addEventListener("click", function () { open(index - 1); });
  box.querySelector(".next").addEventListener("click", function () { open(index + 1); });
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") open(index - 1);
    if (e.key === "ArrowRight") open(index + 1);
  });
}

/* 7. Booking form validation ------------------------------------ */
function bookingForm() {
  var form = document.getElementById("booking-form");
  if (!form) return;
  var status = form.querySelector(".form-status");

  function setError(field, message) {
    var wrap = field.closest(".field");
    var slot = wrap.querySelector(".error");
    if (message) {
      wrap.classList.add("invalid");
      field.setAttribute("aria-invalid", "true");
    } else {
      wrap.classList.remove("invalid");
      field.removeAttribute("aria-invalid");
    }
    if (slot) slot.textContent = message || "";
    return !message;
  }

  function validate() {
    var ok = true;
    var name = form.fullname;
    var email = form.email;
    var phone = form.phone;
    var shoot = form.shoottype;
    var message = form.message;

    ok = setError(name, name.value.trim().length < 2 ? "Please enter your full name." : "") && ok;
    ok = setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? "" : "Please enter a valid email address.") && ok;
    ok = setError(phone, /^[0-9+()\s-]{8,15}$/.test(phone.value.trim()) ? "" : "Please enter a valid phone number.") && ok;
    ok = setError(shoot, shoot.value ? "" : "Please choose a type of shoot.") && ok;
    ok = setError(message, message.value.trim().length < 10 ? "Please tell me a little more (at least 10 characters)." : "") && ok;
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.classList.remove("is-visible");
    if (!validate()) {
      var first = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
      if (first) first.focus();
      return;
    }

    /* The booking details are collected here. A real email service or
       backend can be connected later by sending `booking` to an API. */
    var booking = {
      fullName: form.fullname.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      shootType: form.shoottype.value,
      preferredDate: form.date.value,
      location: form.location.value.trim(),
      message: form.message.value.trim(),
      sentAt: new Date().toISOString(),
    };
    console.log("Booking request ready to send:", booking);

    status.innerHTML =
      "Thank you, <strong>" +
      booking.fullName.split(" ")[0] +
      "</strong>! Your booking request for a <strong>" +
      booking.shootType +
      "</strong> shoot has been received. I will get back to you on <strong>" +
      booking.email +
      "</strong> soon.";
    status.classList.add("is-visible");
    form.reset();
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* 8. Scroll reveal + skill bars --------------------------------- */
function scrollReveal() {
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
    fillBars();
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach(function (el) { io.observe(el); });

  var bars = document.querySelectorAll(".bar i");
  if (bars.length) {
    var bo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.level + "%";
            bo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach(function (b) { bo.observe(b); });
  }
}

function fillBars() {
  document.querySelectorAll(".bar i").forEach(function (b) {
    b.style.width = b.dataset.level + "%";
  });
}

/* 9. Highlight the current page in the navigation ---------------- */
function markActiveLink() {
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.classList.add("is-active");
  });
}


/* 10. Soft background music ------------------------------------- */
/* The music is generated live in the browser with the Web Audio API,
   so there is no audio file to download and it never repeats exactly.
   It is a gentle lo-fi "vlog" beat: warm chords, a soft bass line,
   a light kick and hat. The welcome pop-up shows only on the home
   page (first visit); after that a bubble on every page controls it,
   and if music was on, it starts again automatically on each page. */
function softMusic() {
  var POP_KEY = "rm-music-greeted";
  var ON_KEY = "rm-music-on";
  var VOL_KEY = "rm-music-vol";
  var page = location.pathname.split("/").pop() || "index.html";
  var isHome = page === "index.html";

  function remember(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function recall(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---- build the pop-up (home page only) ---- */
  var pop = document.createElement("div");
  pop.className = "music-pop";
  pop.setAttribute("aria-hidden", "true");
  pop.innerHTML =
    '<div class="music-pop__card" role="dialog" aria-modal="true" aria-label="Soft music welcome">' +
      '<span class="music-note">&#9834;</span>' +
      "<h3>Welcome, friend</h3>" +
      "<p>I never want you to feel bored here. Let a little soft music play while you walk through my life &mdash; " +
      "slow, warm and light, the way heaven feels on a quiet morning. Turn it up, turn it down, or switch it off anytime.</p>" +
      '<div class="music-panel is-open" style="width:100%;margin-bottom:1rem">' +
        "<strong>Volume</strong>" +
        '<input type="range" min="0" max="100" value="35" data-music-volume aria-label="Music volume" />' +
      "</div>" +
      '<div class="btn-row" style="justify-content:center">' +
        '<button class="btn btn--gold" type="button" data-music-yes>Play soft music</button>' +
        '<button class="btn btn--ghost" type="button" data-music-no>Continue in silence</button>' +
      "</div>" +
    "</div>";

  /* ---- build the bubble ---- */
  var bubble = document.createElement("div");
  bubble.className = "music-bubble";
  bubble.innerHTML =
    '<div class="music-panel" data-music-panel>' +
      "<strong>Soft music</strong>" +
      '<input type="range" min="0" max="100" value="35" data-music-volume aria-label="Music volume" />' +
      '<div class="music-row">' +
        '<button class="btn btn--gold" type="button" data-music-toggle>Play</button>' +
      "</div>" +
    "</div>" +
    '<button class="music-bubble__btn" type="button" data-music-bubble aria-label="Music controls" aria-expanded="false">&#9834;</button>';

  document.body.appendChild(pop);
  document.body.appendChild(bubble);

  var bubbleBtn = bubble.querySelector("[data-music-bubble]");
  var panel = bubble.querySelector("[data-music-panel]");
  var toggleBtn = bubble.querySelector("[data-music-toggle]");
  var sliders = document.querySelectorAll("[data-music-volume]");

  /* ---- the audio engine: a gentle lo-fi "vlog" beat ----
     Warm jazzy chords, a soft walking bass, a light kick and hat,
     and a few plucked melody notes. About 84 BPM, 4 bars per loop. */
  var ctx = null, master = null, timer = null, playing = false;
  var volume = parseInt(recall(VOL_KEY) || "35", 10) / 100;

  /* Cmaj7 - Am7 - Fmaj7 - G7 (frequencies of each chord tone) */
  var CHORDS = [
    [261.63, 329.63, 392.0, 493.88],
    [220.0, 261.63, 329.63, 392.0],
    [174.61, 220.0, 261.63, 329.63],
    [196.0, 246.94, 293.66, 349.23],
  ];
  var MELODY = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
  var BAR = 60 / 84 * 4; /* seconds per bar */
  var bar = 0;

  function tone(freq, when, length, gain, type) {
    var osc = ctx.createOscillator();
    var env = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(gain, when + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, when + length);
    osc.connect(env);
    env.connect(master);
    osc.start(when);
    osc.stop(when + length + 0.1);
  }

  function kick(when) {
    var osc = ctx.createOscillator();
    var env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, when);
    osc.frequency.exponentialRampToValueAtTime(45, when + 0.12);
    env.gain.setValueAtTime(0.35, when);
    env.gain.exponentialRampToValueAtTime(0.0001, when + 0.25);
    osc.connect(env);
    env.connect(master);
    osc.start(when);
    osc.stop(when + 0.3);
  }

  function hat(when) {
    var len = 0.05;
    var buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    var env = ctx.createGain();
    env.gain.value = 0.08;
    src.connect(filter);
    filter.connect(env);
    env.connect(master);
    src.start(when);
  }

  function loop() {
    if (ctx.state !== "running") return;
    var t = ctx.currentTime + 0.1;
    var chord = CHORDS[bar % 4];
    /* warm chord, slightly broken like lo-fi keys */
    for (var c = 0; c < chord.length; c++) {
      tone(chord[c], t + c * 0.06, BAR * 0.9, 0.05, "triangle");
    }
    /* soft bass on beat 1 and the "and" of 3 */
    tone(chord[0] / 2, t, 0.5, 0.12);
    tone(chord[0] / 2, t + BAR * 0.625, 0.4, 0.09);
    /* laid-back beat: kick on 1 and 3, hat on every off-beat */
    kick(t);
    kick(t + BAR * 0.5);
    for (var h = 0; h < 4; h++) hat(t + BAR * (h / 4 + 0.125));
    /* sparse plucked melody on top */
    if (Math.random() < 0.8) {
      var n = 1 + Math.floor(Math.random() * 2);
      for (var m = 0; m < n; m++) {
        var pick = MELODY[Math.floor(Math.random() * MELODY.length)];
        tone(pick, t + BAR * (0.25 + Math.random() * 0.6), 0.6, 0.05);
      }
    }
    bar++;
  }

  function start() {
    if (playing) return;
    try {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = volume;
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      playing = true;
      loop();
      timer = setInterval(loop, BAR * 1000);
      paint();
      remember(ON_KEY, "yes");
    } catch (e) {}
  }

  function stop() {
    playing = false;
    if (timer) clearInterval(timer);
    timer = null;
    if (ctx) { try { ctx.suspend(); } catch (e) {} }
    paint();
    remember(ON_KEY, "no");
  }

  function paint() {
    toggleBtn.textContent = playing ? "Pause" : "Play";
    bubbleBtn.classList.toggle("is-playing", playing);
    bubbleBtn.innerHTML = playing ? "&#9835;" : "&#9834;";
    bubbleBtn.setAttribute("aria-label", playing ? "Music playing - open controls" : "Music off - open controls");
  }

  function setVolume(v) {
    volume = v;
    if (master) master.gain.value = v;
    remember(VOL_KEY, Math.round(v * 100));
    sliders.forEach(function (s) { s.value = Math.round(v * 100); });
  }

  sliders.forEach(function (s) {
    s.value = Math.round(volume * 100);
    s.addEventListener("input", function () { setVolume(this.value / 100); });
  });

  toggleBtn.addEventListener("click", function () { playing ? stop() : start(); });

  bubbleBtn.addEventListener("click", function () {
    var open = panel.classList.toggle("is-open");
    bubbleBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.addEventListener("click", function (e) {
    if (!bubble.contains(e.target)) {
      panel.classList.remove("is-open");
      bubbleBtn.setAttribute("aria-expanded", "false");
    }
  });

  function closePop() {
    pop.classList.remove("is-open");
    pop.setAttribute("aria-hidden", "true");
    remember(POP_KEY, "yes");
  }

  pop.querySelector("[data-music-yes]").addEventListener("click", function () { closePop(); start(); });
  pop.querySelector("[data-music-no]").addEventListener("click", closePop);
  pop.addEventListener("click", function (e) { if (e.target === pop) closePop(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && pop.classList.contains("is-open")) closePop();
  });

  paint();

if (isHome) {
  /* welcome pop-up: show once per browser tab session */
  var greetedThisSession = sessionStorage.getItem(POP_KEY);

  if (!greetedThisSession) {
    setTimeout(function () {
      pop.classList.add("is-open");
      pop.setAttribute("aria-hidden", "false");
      sessionStorage.setItem(POP_KEY, "yes");
    }, 200);
  }
}

  if (recall(ON_KEY) === "yes" && (isHome ? recall(POP_KEY) : true)) {
    /* Music was on: try to start right away (allowed once the visitor has
       interacted with the site before), and fall back to the first tap/key
       on this page if the browser still asks for a gesture. */
    start();
    var once = function () {
      document.removeEventListener("click", once);
      document.removeEventListener("keydown", once);
      if (ctx && ctx.state === "suspended") ctx.resume();
      start();
    };
    document.addEventListener("click", once);
    document.addEventListener("keydown", once);
  }
}
