// ==============================
// DFA LOGIC (same spirit as Python)
// ==============================
function preprocessInput(text) {
  return (text ?? "").toLowerCase().trim();
}

function dfaKeywordPhishing(text) {
  const phishingKeywords = ["login", "verify", "update", "secure", "account", "confirm"];
  for (const keyword of phishingKeywords) {
    let state = 0;
    for (const ch of text) {
      if (ch === keyword[state]) {
        state++;
        if (state === keyword.length) return { detected: true, keyword };
      } else {
        state = 0;
      }
    }
  }
  return { detected: false, keyword: null };
}

function dfaStructurePhishing(text) {
  const reasons = [];
  if (text.startsWith("http://")) reasons.push("Menggunakan HTTP (tidak terenkripsi)");

  const ipPattern = /^http[s]?:\/\/\d+\.\d+\.\d+\.\d+/;
  if (ipPattern.test(text)) reasons.push("Domain menggunakan IP address");

  if (text.includes("@")) reasons.push("Mengandung karakter redirect '@'");

  const dotCount = (text.match(/\./g) || []).length;
  if (dotCount > 4) reasons.push("Jumlah subdomain berlebihan");

  return reasons;
}

function dfaSmsPhishing(text) {
  const smsKeywords = ["klik", "hadiah", "otp", "verifikasi", "menang", "gratis"];
  for (const keyword of smsKeywords) {
    let state = 0;
    for (const ch of text) {
      if (ch === keyword[state]) {
        state++;
        if (state === keyword.length) return { detected: true, keyword };
      } else {
        state = 0;
      }
    }
  }
  return { detected: false, keyword: null };
}

function phishingChecker(userInput) {
  const text = preprocessInput(userInput);
  const kw = dfaKeywordPhishing(text);
  const sms = dfaSmsPhishing(text);
  const structureIssues = dfaStructurePhishing(text);

  if (kw.detected || sms.detected || structureIssues.length) {
    return {
      status: "PHISHING",
      keyword: kw.keyword,
      sms_keyword: sms.keyword,
      structure_issues: structureIssues,
    };
  }
  return { status: "AMAN", message: "Tidak ditemukan pola phishing" };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ==============================
// UI ELEMENTS
// ==============================
const html = document.documentElement;
const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

const inputEl = document.getElementById("input");
const counterEl = document.getElementById("counter");
const hintEl = document.getElementById("hint");

const scanOverlay = document.getElementById("scanOverlay");
const scanStep = document.getElementById("scanStep");

const checkBtn = document.getElementById("checkBtn");
const clearBtn = document.getElementById("clearBtn");

const resultCard = document.getElementById("resultCard");
const resultInner = document.getElementById("resultInner");
const timeText = document.getElementById("timeText");

const radar = document.getElementById("radar");
const inputCard = document.getElementById("inputCard");

// DFA nodes
const nodeKeyword = document.getElementById("node-keyword");
const nodeStructure = document.getElementById("node-structure");
const nodeSms = document.getElementById("node-sms");
const nodeDecision = document.getElementById("node-decision");

// Confetti
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");
let confettiRAF = null;

function setTheme(mode) {
  if (mode === "dark") html.classList.add("dark");
  else html.classList.remove("dark");

  localStorage.setItem("theme", mode);
  themeIcon.textContent = mode === "dark" ? "🌙" : "☀️";
  themeText.textContent = `Theme: ${mode === "dark" ? "Dark" : "Light"}`;
}

function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  setTheme(saved);
}

themeBtn.addEventListener("click", () => {
  const isDark = html.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});

inputEl.addEventListener("input", () => {
  counterEl.textContent = `${inputEl.value.length} karakter`;
  hintEl.textContent = preprocessInput(inputEl.value) ? "Siap memindai" : "Menunggu input…";
});

document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    inputEl.value = btn.dataset.fill || "";
    inputEl.dispatchEvent(new Event("input"));
    inputEl.focus();
  });
});

// ==============================
// Helpers
// ==============================
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function showResultCard() {
  // pastikan terlihat
  resultCard.classList.remove("opacity-0", "translate-y-2", "scale-[.99]");
  resultCard.classList.add("opacity-100", "translate-y-0", "scale-100");

  // replay animasi pop
  resultCard.classList.remove("animate-pop");
  void resultCard.offsetWidth;
  resultCard.classList.add("animate-pop");
}

function nodeReset() {
  const base = "rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center text-slate-200/70";
  nodeKeyword.className = base;
  nodeStructure.className = base;
  nodeSms.className = base;
  nodeDecision.className = base;
}

function nodeActive(el, color) {
  // color: "violet" | "cyan" | "emerald" | "red"
  el.className =
    "rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center text-slate-100 " +
    `ring-4 ring-${color}-400/15 border-${color}-400/40`;
}

// ==============================
// Confetti (vanilla canvas)
// ==============================
function resizeConfetti() {
  confettiCanvas.width = window.innerWidth * devicePixelRatio;
  confettiCanvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeConfetti);

function fireConfetti() {
  // show canvas
  confettiCanvas.classList.remove("hidden");
  resizeConfetti();

  const W = window.innerWidth;
  const H = window.innerHeight;

  const colors = ["#22c55e", "#06b6d4", "#a78bfa", "#f472b6", "#fbbf24"];
  const pieces = Array.from({ length: 120 }, () => ({
    x: W * (0.2 + Math.random() * 0.6),
    y: -20 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 4,
    vy: 3 + Math.random() * 5,
    r: 3 + Math.random() * 4,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.2,
    color: colors[(Math.random() * colors.length) | 0],
    life: 70 + (Math.random() * 40) | 0,
  }));

  // stop previous
  if (confettiRAF) cancelAnimationFrame(confettiRAF);

  function tick() {
    ctx.clearRect(0, 0, W, H);

    for (const p of pieces) {
      p.life -= 1;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2.2, p.r);
      ctx.restore();
    }

    // remove dead
    for (let i = pieces.length - 1; i >= 0; i--) {
      if (pieces[i].life <= 0 || pieces[i].y > H + 40) pieces.splice(i, 1);
    }

    if (pieces.length) confettiRAF = requestAnimationFrame(tick);
    else {
      confettiCanvas.classList.add("hidden");
      ctx.clearRect(0, 0, W, H);
      confettiRAF = null;
    }
  }
  tick();
}

// ==============================
// Render Result
// ==============================
function renderResult(res) {
  if (res.status === "PHISHING") {
    const items = [];
    if (res.keyword) items.push(`Keyword phishing (URL): <code class="px-2 py-0.5 rounded-lg border border-white/10 bg-black/20">${escapeHtml(res.keyword)}</code>`);
    if (res.sms_keyword) items.push(`Keyword phishing (SMS): <code class="px-2 py-0.5 rounded-lg border border-white/10 bg-black/20">${escapeHtml(res.sms_keyword)}</code>`);
    for (const issue of res.structure_issues) items.push(`Struktur mencurigakan: ${escapeHtml(issue)}`);

    resultInner.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span class="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs text-red-200">
          🚨 <b class="tracking-wide">PHISHING TERDETEKSI</b>
        </span>
        <span class="text-xs text-slate-300/70">L<sub>p</sub></span>
      </div>

      <ul class="mt-3 space-y-2 text-slate-100/90">
        ${items.map((x) => `<li class="leading-relaxed">• ${x}</li>`).join("")}
      </ul>

      <p class="mt-4 text-sm text-slate-300/80"><b class="text-slate-100">Kesimpulan:</b> String input termasuk dalam bahasa phishing (L<sub>p</sub>).</p>
    `;

    // shake + red glow
    resultCard.classList.remove("animate-shake");
    void resultCard.offsetWidth;
    resultCard.classList.add("animate-shake");
    resultCard.classList.add("ring-4", "ring-red-500/15", "border-red-400/20");
    setTimeout(() => {
      resultCard.classList.remove("ring-4", "ring-red-500/15", "border-red-400/20");
    }, 700);
  } else {
    resultInner.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span class="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
          ✅ <b class="tracking-wide">AMAN</b>
        </span>
        <span class="text-xs text-slate-300/70">L<sub>a</sub></span>
      </div>

      <p class="mt-3 text-slate-300/80">${escapeHtml(res.message)}</p>
      <p class="mt-4 text-sm text-slate-300/80"><b class="text-slate-100">Kesimpulan:</b> String input termasuk dalam bahasa aman (L<sub>a</sub>).</p>
    `;

    // confetti!
    fireConfetti();
  }

  showResultCard();
}

// ==============================
// Scan & Check (with DFA node highlight + radar)
// ==============================
async function scanAndCheck() {
  const t = preprocessInput(inputEl.value);
  if (!t) {
    hintEl.textContent = "Input kosong — isi dulu ya 🙂";
    inputEl.focus();
    return;
  }

  checkBtn.disabled = true;
  clearBtn.disabled = true;

  // show scan overlay + radar
  scanOverlay.classList.remove("hidden");
  radar.classList.remove("hidden");
  inputCard.classList.add("ring-4", "ring-cyan-400/10");
  nodeReset();

  scanStep.textContent = "DFA Init";

  const steps = [
    { label: "DFA Keyword", node: nodeKeyword, color: "violet" },
    { label: "DFA Struktur URL", node: nodeStructure, color: "cyan" },
    { label: "DFA SMS Pattern", node: nodeSms, color: "pink" }, // note: pink ring class exists in tailwind
    { label: "Decision Engine", node: nodeDecision, color: "emerald" },
  ];

  const start = performance.now();

  for (const s of steps) {
    nodeReset();
    scanStep.textContent = s.label;
    // fallback if "pink" ring not configured on some builds? (tailwind supports it)
    nodeActive(s.node, s.color === "pink" ? "pink" : s.color);
    await sleep(230);
  }

  const res = phishingChecker(inputEl.value);
  const end = performance.now();
  timeText.textContent = `${Math.round(end - start)} ms`;

  // hide scan overlay + radar
  scanOverlay.classList.add("hidden");
  radar.classList.add("hidden");
  inputCard.classList.remove("ring-4", "ring-cyan-400/10");

  renderResult(res);

  checkBtn.disabled = false;
  clearBtn.disabled = false;
  hintEl.textContent = "Selesai memindai";
}

checkBtn.addEventListener("click", scanAndCheck);

clearBtn.addEventListener("click", () => {
  inputEl.value = "";
  inputEl.dispatchEvent(new Event("input"));
  timeText.textContent = "—";
  resultInner.innerHTML = `Masukkan teks lalu tekan <b class="text-slate-100">Cek Sekarang</b>. Hasil akan muncul di sini.`;
  showResultCard();
});

// Init
initTheme();
inputEl.dispatchEvent(new Event("input"));
