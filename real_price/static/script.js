const sliders = ["x1", "x2", "x3", "x4"];
const decimals = { x1: 2, x2: 1, x3: 0, x4: 0 };

function updateFill(el) {
  const min = parseFloat(el.min), max = parseFloat(el.max), val = parseFloat(el.value);
  const pct = ((val - min) / (max - min)) * 100;
  el.style.setProperty("--fill", pct + "%");
}

sliders.forEach((id) => {
  const el = document.getElementById(id);
  const badge = document.getElementById(id + "-val");
  updateFill(el);
  el.addEventListener("input", () => {
    badge.textContent = parseFloat(el.value).toFixed(decimals[id]);
    updateFill(el);
  });
});

// ---- Map picker ----
const mapToggle = document.getElementById("mapToggle");
const mapPreview = document.getElementById("mapPreview");
const mapSvg = document.getElementById("mapSvg");
const mapPin = document.getElementById("mapPin");
const gridLines = document.getElementById("gridLines");
const x5Input = document.getElementById("x5");
const x6Input = document.getElementById("x6");

const LAT_MIN = 24.93, LAT_MAX = 25.02;
const LON_MIN = 121.47, LON_MAX = 121.57;
const MAP_W = 300, MAP_H = 220, PAD = 14;

// build faint grid
for (let i = 1; i < 6; i++) {
  const gx = (i * MAP_W) / 6;
  const gy = (i * MAP_H) / 6;
  gridLines.innerHTML += `<line x1="${gx}" y1="0" x2="${gx}" y2="${MAP_H}" stroke="#c9a15a" stroke-opacity="0.15"/>`;
  gridLines.innerHTML += `<line x1="0" y1="${gy}" x2="${MAP_W}" y2="${gy}" stroke="#c9a15a" stroke-opacity="0.15"/>`;
}

function latLonToXY(lat, lon) {
  const x = PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (MAP_W - 2 * PAD);
  const y = PAD + (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * (MAP_H - 2 * PAD);
  return { x, y };
}

function xyToLatLon(x, y) {
  const lon = LON_MIN + ((x - PAD) / (MAP_W - 2 * PAD)) * (LON_MAX - LON_MIN);
  const lat = LAT_MIN + (1 - (y - PAD) / (MAP_H - 2 * PAD)) * (LAT_MAX - LAT_MIN);
  return { lat: Math.max(LAT_MIN, Math.min(LAT_MAX, lat)), lon: Math.max(LON_MIN, Math.min(LON_MAX, lon)) };
}

function setPin() {
  const lat = parseFloat(x5Input.value);
  const lon = parseFloat(x6Input.value);
  const { x, y } = latLonToXY(lat, lon);
  mapPin.setAttribute("cx", x);
  mapPin.setAttribute("cy", y);
}
setPin();

mapToggle.addEventListener("click", () => {
  mapPreview.classList.toggle("hidden");
});

mapSvg.addEventListener("click", (e) => {
  const rect = mapSvg.getBoundingClientRect();
  const scaleX = MAP_W / rect.width;
  const scaleY = MAP_H / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const { lat, lon } = xyToLatLon(x, y);
  x5Input.value = lat.toFixed(4);
  x6Input.value = lon.toFixed(4);
  setPin();
});

x5Input.addEventListener("change", setPin);
x6Input.addEventListener("change", setPin);

// ---- Prediction ----
const predictBtn = document.getElementById("predictBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const errorBox = document.getElementById("errorBox");
const priceValue = document.getElementById("priceValue");
const priceCircle = document.getElementById("priceCircle");
const usdApprox = document.getElementById("usdApprox");
const summaryList = document.getElementById("summaryList");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

let history = [];

function fieldValues() {
  return {
    "X1 transaction date": parseFloat(document.getElementById("x1").value),
    "X2 house age": parseFloat(document.getElementById("x2").value),
    "X3 distance to the nearest MRT station": parseFloat(document.getElementById("x3").value),
    "X4 number of convenience stores": parseFloat(document.getElementById("x4").value),
    "X5 latitude": parseFloat(x5Input.value),
    "X6 longitude": parseFloat(x6Input.value),
  };
}

async function predict() {
  errorBox.classList.add("hidden");
  predictBtn.disabled = true;
  btnText.textContent = "Predicting...";
  btnSpinner.classList.remove("hidden");

  const payload = fieldValues();

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Prediction failed");
    }

    const price = data.prediction;
    priceValue.textContent = price;
    priceCircle.style.borderColor = "var(--gold-bright)";

    // NTD 10k/ping -> rough total price approx for a 30-ping unit, USD ~0.031
    const totalNTD = price * 10000 * 30;
    const usd = totalNTD * 0.031;
    usdApprox.textContent = `≈ NT$${Math.round(totalNTD).toLocaleString()} total (≈ US$${Math.round(usd).toLocaleString()}) for a 30-ping unit`;

    summaryList.innerHTML = `
      <div class="row"><span>Transaction date</span><span>${payload["X1 transaction date"].toFixed(2)}</span></div>
      <div class="row"><span>House age</span><span>${payload["X2 house age"].toFixed(1)} yrs</span></div>
      <div class="row"><span>Distance to MRT</span><span>${payload["X3 distance to the nearest MRT station"]} m</span></div>
      <div class="row"><span>Convenience stores</span><span>${payload["X4 number of convenience stores"]}</span></div>
      <div class="row"><span>Location</span><span>${payload["X5 latitude"].toFixed(4)}, ${payload["X6 longitude"].toFixed(4)}</span></div>
    `;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    history.unshift({ price, time });
    if (history.length > 8) history.pop();
    renderHistory();
  } catch (err) {
    errorBox.textContent = "Error: " + err.message;
    errorBox.classList.remove("hidden");
  } finally {
    predictBtn.disabled = false;
    btnText.textContent = "Predict Price";
    btnSpinner.classList.add("hidden");
  }
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = `<p class="placeholder-text small">No predictions yet.</p>`;
    clearHistoryBtn.classList.add("hidden");
    return;
  }
  historyList.innerHTML = history
    .map(
      (h) =>
        `<div class="history-item"><span class="h-price">${h.price} /unit</span><span class="h-meta">${h.time}</span></div>`
    )
    .join("");
  clearHistoryBtn.classList.remove("hidden");
}

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  renderHistory();
});

predictBtn.addEventListener("click", predict);
