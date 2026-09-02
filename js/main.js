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
      part + ", welcome to my little space &middot; <strong>" + time + "</strong>";
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
