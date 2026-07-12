/* Meta Ads case study — data, chart, counters
   ============================================================
   EDIT YOUR REAL NUMBERS HERE.
   All figures on this page are driven by this one object.
   Values are in ₹ lakh unless noted.
   ============================================================ */
const ADS_DATA = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  spend: [0.62, 0.68, 0.75, 0.8, 0.88, 0.87], // ₹ lakh per month
  revenue: [4.1, 5.3, 6.2, 7.4, 8.9, 9.9], // ₹ lakh per month
  campaigns: [
    { name: "Real estate lead gen — villas", objective: "Leads", spend: "₹1.9L", revenue: "₹21.4L", roas: "11.3×", cpl: "₹318" },
    { name: "Occasion-wear launch", objective: "Sales", spend: "₹1.2L", revenue: "₹9.6L", roas: "8.0×", cpl: "—" },
    { name: "Walkthrough retargeting", objective: "Conversions", spend: "₹0.8L", revenue: "₹7.9L", roas: "9.9×", cpl: "₹402" },
    { name: "Brand film awareness", objective: "Reach + Leads", spend: "₹0.7L", revenue: "₹2.9L", roas: "4.1×", cpl: "₹455" },
  ],
};

/* Validated series colors (dark surface): spend = blue, revenue = gold */
const COLORS = { spend: "#5e96dc", revenue: "#bb8c26" };

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
}

/* ---------- nav / playhead / reveals / counters (shared behaviours) ---------- */
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
if (burger) {
  burger.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("nav-open"))
  );
}

const playheadBar = document.getElementById("playheadBar");
if (playheadBar && HAS_GSAP) {
  ScrollTrigger.create({
    start: 0,
    end: () => document.documentElement.scrollHeight - window.innerHeight,
    onUpdate(self) { playheadBar.style.width = (self.progress * 100).toFixed(2) + "%"; },
  });
}

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

if (HAS_GSAP) document.querySelectorAll("[data-count]").forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: reduceMotion ? 0 : 2.2,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 90%", once: true },
    onUpdate() {
      el.textContent = obj.v.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
  });
});

/* ---------- grouped bar chart: spend vs revenue ---------- */
(function buildChart() {
  const wrap = document.getElementById("chartWrap");
  const tip = document.getElementById("chartTip");
  if (!wrap) return;

  // legend
  const legend = document.getElementById("chartLegend");
  legend.innerHTML =
    `<span><i style="background:${COLORS.spend}"></i>Spend</span>` +
    `<span><i style="background:${COLORS.revenue}"></i>Revenue</span>`;

  const W = 960, H = 420;
  const pad = { top: 24, right: 16, bottom: 44, left: 52 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...ADS_DATA.revenue, ...ADS_DATA.spend);
  const yMax = Math.ceil(maxVal / 2) * 2; // round up to an even ₹ lakh
  const ySteps = 5;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Monthly Meta Ads spend versus revenue in rupees lakh");

  const yFor = (v) => pad.top + plotH - (v / yMax) * plotH;

  // recessive gridlines + y labels
  for (let i = 0; i <= ySteps; i++) {
    const v = (yMax / ySteps) * i;
    const y = yFor(v);
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", pad.left); line.setAttribute("x2", W - pad.right);
    line.setAttribute("y1", y); line.setAttribute("y2", y);
    line.setAttribute("stroke", "rgba(244,241,234,0.07)");
    line.setAttribute("stroke-width", i === 0 ? "1.5" : "1");
    svg.appendChild(line);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", pad.left - 10); label.setAttribute("y", y + 4);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("fill", "rgba(244,241,234,0.4)");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-family", "Satoshi, sans-serif");
    label.textContent = "₹" + v + "L";
    svg.appendChild(label);
  }

  // rounded-top bar path (4px radius, anchored to baseline)
  const barPath = (x, y, w, h) => {
    const r = Math.min(4, w / 2, h);
    return `M ${x} ${y + h} V ${y + r} Q ${x} ${y} ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h} Z`;
  };

  const n = ADS_DATA.months.length;
  const slot = plotW / n;
  const barW = Math.min(30, slot * 0.22);
  const gapBetween = 2; // 2px surface gap between adjacent bars

  const bars = [];
  ADS_DATA.months.forEach((month, i) => {
    const cx = pad.left + slot * i + slot / 2;
    const series = [
      { key: "Spend", val: ADS_DATA.spend[i], color: COLORS.spend, x: cx - barW - gapBetween / 2 },
      { key: "Revenue", val: ADS_DATA.revenue[i], color: COLORS.revenue, x: cx + gapBetween / 2 },
    ];
    series.forEach((s) => {
      const y = yFor(s.val);
      const h = pad.top + plotH - y;
      const p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", barPath(s.x, y, barW, h));
      p.setAttribute("fill", s.color);
      svg.appendChild(p);

      // oversized invisible hit target for hover
      const hit = document.createElementNS(svgNS, "rect");
      hit.setAttribute("x", s.x - 6); hit.setAttribute("y", pad.top);
      hit.setAttribute("width", barW + 12); hit.setAttribute("height", plotH);
      hit.setAttribute("fill", "transparent");
      hit.style.cursor = "pointer";
      hit.addEventListener("mouseenter", () => {
        p.setAttribute("opacity", "0.85");
        tip.innerHTML = `<strong>${month} — ${s.key}</strong>₹${s.val.toLocaleString("en-IN", { minimumFractionDigits: 1 })} lakh`;
        tip.classList.add("on");
      });
      hit.addEventListener("mousemove", (e) => {
        const r = wrap.getBoundingClientRect();
        tip.style.left = Math.min(e.clientX - r.left + 14, r.width - tip.offsetWidth - 8) + "px";
        tip.style.top = e.clientY - r.top - tip.offsetHeight - 10 + "px";
      });
      hit.addEventListener("mouseleave", () => {
        p.removeAttribute("opacity");
        tip.classList.remove("on");
      });
      svg.appendChild(hit);
      bars.push(p);
    });

    // month label
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", cx); label.setAttribute("y", H - 16);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", "rgba(244,241,234,0.55)");
    label.setAttribute("font-size", "13");
    label.setAttribute("font-family", "Satoshi, sans-serif");
    label.textContent = month;
    svg.appendChild(label);
  });

  wrap.appendChild(svg);

  // grow-in animation (GSAP owns the SVG transform end to end)
  if (!HAS_GSAP) return;
  gsap.set(bars, { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.to(bars, {
    scaleY: 1,
    duration: reduceMotion ? 0 : 1.1,
    ease: "power3.out",
    stagger: reduceMotion ? 0 : 0.06,
    scrollTrigger: { trigger: wrap, start: "top 82%", once: true },
  });
})();

/* ---------- campaign table ---------- */
(function buildTable() {
  const table = document.getElementById("campTable");
  if (!table) return;
  table.innerHTML =
    `<thead><tr><th>Campaign</th><th>Objective</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>CPL</th></tr></thead>` +
    `<tbody>` +
    ADS_DATA.campaigns
      .map(
        (c) =>
          `<tr><td>${c.name}</td><td>${c.objective}</td><td>${c.spend}</td><td>${c.revenue}</td><td class="roas">${c.roas}</td><td>${c.cpl}</td></tr>`
      )
      .join("") +
    `</tbody>`;
})();
