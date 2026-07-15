/* Syed Altaf Hussain portfolio — scroll choreography (GSAP + ScrollTrigger) */

/* ============================================================
   INTRO FILM SWITCH — set to false to remove the scroll-scrubbed
   intro video entirely (the section deletes itself on load).
   ============================================================ */
const SHOW_INTRO = true;

/* Fallback: if the GSAP CDN is unreachable, show everything statically */
const HAS_GSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

const reduceMotion =
  !HAS_GSAP || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!HAS_GSAP) {
  document.querySelectorAll("[data-reveal]").forEach((el) => (el.style.opacity = 1));
  document.querySelectorAll("[data-count]").forEach((el) => {
    const d = parseInt(el.dataset.decimals || "0", 10);
    el.textContent = parseFloat(el.dataset.count).toLocaleString("en-IN", {
      minimumFractionDigits: d, maximumFractionDigits: d,
    });
  });
  const viewport = document.querySelector(".strip__viewport");
  if (viewport) viewport.style.overflowX = "auto";
}

/* ---------- mobile nav ---------- */
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
if (burger) {
  burger.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("nav-open"))
  );
}

/* ---------- intro film: scroll scrubs the video ---------- */
/* The scrub only moves when the user scrolls, so it stays on even under
   prefers-reduced-motion (which OS-level "animations off" settings trigger). */
const intro = document.getElementById("intro");
const introVideo = document.getElementById("introVideo");
if (intro && (!SHOW_INTRO || !HAS_GSAP)) {
  intro.remove();
} else if (intro && introVideo) {
  introVideo.pause();
  const hint = document.getElementById("introHint");
  const proxy = { t: 0 };
  const wireScrub = () => {
    const dur = introVideo.duration || 15;
    gsap.to(proxy, {
      t: dur,
      ease: "none",
      scrollTrigger: {
        trigger: intro,
        start: "top top",
        end: "+=2800",
        pin: true,
        scrub: 0.4,
        anticipatePin: 1,
      },
      onUpdate() {
        if (Math.abs(introVideo.currentTime - proxy.t) > 0.02) {
          introVideo.currentTime = proxy.t;
        }
        // hint fades over the first ~1.5s of the film
        if (hint) hint.style.opacity = Math.max(0, 1 - proxy.t / 1.5);
      },
    });
    ScrollTrigger.refresh();
  };
  // Load as a blob: blob URLs are fully seekable even on servers without
  // HTTP Range support (e.g. python -m http.server), which otherwise makes
  // Chrome snap every seek back to 0.
  fetch(introVideo.dataset.src)
    .then((r) => {
      if (!r.ok) throw new Error("intro video HTTP " + r.status);
      return r.blob();
    })
    .then((blob) => {
      introVideo.src = URL.createObjectURL(blob);
      if (introVideo.readyState >= 1) wireScrub();
      else introVideo.addEventListener("loadedmetadata", wireScrub, { once: true });
    })
    .catch(() => {
      intro.remove();
      ScrollTrigger.refresh();
    });
}

/* ---------- scroll playhead + timecode HUD ---------- */
const playheadBar = document.getElementById("playheadBar");
const timecodeText = document.getElementById("timecodeText");
if (playheadBar && HAS_GSAP) {
  ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate(self) {
      playheadBar.style.width = (self.progress * 100).toFixed(2) + "%";
      if (timecodeText) {
        const totalFrames = Math.round(self.progress * 3 * 60 * 24); // pretend the page is a 3-min timeline @24fps
        const f = totalFrames % 24;
        const s = Math.floor(totalFrames / 24) % 60;
        const m = Math.floor(totalFrames / (24 * 60));
        const pad = (n) => String(n).padStart(2, "0");
        timecodeText.textContent = `TC 00:${pad(m)}:${pad(s)}:${pad(f)}`;
      }
    },
  });
}

/* ---------- entry reveals ---------- */
if (!HAS_GSAP) {
  /* handled by fallback above */
} else if (reduceMotion) {
  gsap.set("[data-reveal]", { opacity: 1 });
} else {
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 56, filter: "blur(10px)" },
      {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });
}

/* ---------- pinned horizontal film strip ---------- */
const strip = document.getElementById("strip");
const stripTrack = document.getElementById("stripTrack");
if (strip && stripTrack && !reduceMotion) {
  const getDistance = () => Math.max(0, stripTrack.scrollWidth - window.innerWidth);
  const stripTween = gsap.to(stripTrack, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: strip,
      start: "top 12%",
      end: () => "+=" + getDistance(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  // frames dim as they leave, brighten as they arrive
  stripTrack.querySelectorAll(".frame").forEach((frame) => {
    gsap.fromTo(
      frame, { opacity: 0.55 },
      {
        opacity: 1, ease: "none",
        scrollTrigger: {
          trigger: frame, containerAnimation: stripTween,
          start: "left 90%", end: "left 55%", scrub: true,
        },
      }
    );
  });
} else if (strip && reduceMotion) {
  strip.querySelector(".strip__viewport").style.overflowX = "auto";
}

/* ---------- manifesto word scrub ---------- */
const manifesto = document.getElementById("manifesto");
if (manifesto && HAS_GSAP) {
  // wrap each word (preserving .accent spans) in .w spans
  const splitWords = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
          const span = document.createElement("span");
          span.className = "w";
          span.textContent = word;
          frag.appendChild(span);
          frag.appendChild(document.createTextNode(" "));
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        splitWords(child);
      }
    });
  };
  splitWords(manifesto);

  if (reduceMotion) {
    gsap.set(manifesto.querySelectorAll(".w"), { opacity: 1 });
  } else {
    gsap.to(manifesto.querySelectorAll(".w"), {
      opacity: 1,
      stagger: 0.6,
      ease: "none",
      scrollTrigger: {
        trigger: manifesto,
        start: "top 78%",
        end: "bottom 45%",
        scrub: 0.6,
      },
    });
  }
}

/* ---------- animated counters ---------- */
if (HAS_GSAP) document.querySelectorAll("[data-count]").forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: reduceMotion ? 0 : 2.2,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 88%", once: true },
    onUpdate() {
      el.textContent = obj.v.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
  });
});

/* ---------- process stack: cards settle + scale as the next arrives ---------- */
if (!reduceMotion) {
  const cards = gsap.utils.toArray(".stack__card");
  cards.forEach((card, i) => {
    if (i === cards.length - 1) return;
    gsap.to(card, {
      scale: 0.94,
      opacity: 0.55,
      transformOrigin: "center top",
      ease: "none",
      scrollTrigger: {
        trigger: cards[i + 1],
        start: "top 85%",
        end: "top 30%",
        scrub: true,
      },
    });
  });
}

/* ---------- proof of work reels: hover plays, click toggles sound ---------- */
const reelCards = document.querySelectorAll(".reel");
reelCards.forEach((card) => {
  const video = card.querySelector("video");
  const chip = card.querySelector(".reel__sound");
  if (!video) return;
  const ensureSrc = () => {
    if (!video.src) video.src = video.dataset.src;
  };
  card.addEventListener("mouseenter", () => {
    ensureSrc();
    video.play().catch(() => {});
  });
  card.addEventListener("mouseleave", () => {
    if (video.muted) video.pause();
  });
  card.addEventListener("click", () => {
    ensureSrc();
    video.muted = !video.muted;
    if (video.paused) video.play().catch(() => {});
    card.classList.toggle("sound-on", !video.muted);
    if (chip) chip.textContent = video.muted ? "Sound off" : "Sound on";
    // only one reel speaks at a time
    reelCards.forEach((other) => {
      if (other === card) return;
      const v = other.querySelector("video");
      if (v && !v.muted) {
        v.muted = true;
        other.classList.remove("sound-on");
        const c = other.querySelector(".reel__sound");
        if (c) c.textContent = "Sound off";
      }
    });
  });
});

/* drag-to-scroll for the reel row */
const reelrow = document.getElementById("reelrow");
if (reelrow) {
  let isDown = false, startX = 0, startScroll = 0, moved = false;
  reelrow.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return; // touch scrolls natively
    isDown = true; moved = false;
    startX = e.clientX; startScroll = reelrow.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) {
      moved = true;
      reelrow.classList.add("dragging");
      reelrow.scrollLeft = startScroll - dx;
    }
  });
  window.addEventListener("pointerup", () => {
    isDown = false;
    reelrow.classList.remove("dragging");
  });
  // a real drag shouldn't fire the click/sound toggle
  reelrow.addEventListener("click", (e) => {
    if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);
}

/* Hero portrait is centered via translateX(-50%); no parallax tween on it —
   GSAP's transform would fight the centering. */
