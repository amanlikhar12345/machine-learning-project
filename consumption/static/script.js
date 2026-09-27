const els = {
  temperature: document.getElementById("temperature"),
  humidity: document.getElementById("humidity"),
  squareFootage: document.getElementById("squareFootage"),
  occupancy: document.getElementById("occupancy"),
  renewable: document.getElementById("renewable"),
  lightingUsage: document.getElementById("lightingUsage"),
  holiday: document.getElementById("holiday"),
};

const labels = {
  temperature: document.getElementById("temperatureVal"),
  humidity: document.getElementById("humidityVal"),
  squareFootage: document.getElementById("squareFootageVal"),
  occupancy: document.getElementById("occupancyVal"),
  renewable: document.getElementById("renewableVal"),
};

const units = {
  temperature: "°C",
  humidity: "%",
  squareFootage: "sqft",
  occupancy: "people",
  renewable: "kWh",
};

function syncLabels() {
  labels.temperature.textContent = `${els.temperature.value} ${units.temperature}`;
  labels.humidity.textContent = `${els.humidity.value} ${units.humidity}`;
  labels.squareFootage.textContent = `${els.squareFootage.value} ${units.squareFootage}`;
  labels.occupancy.textContent = `${els.occupancy.value} ${units.occupancy}`;
  labels.renewable.textContent = `${els.renewable.value} ${units.renewable}`;
}

["temperature", "humidity", "squareFootage", "occupancy", "renewable"].forEach((key) => {
  els[key].addEventListener("input", syncLabels);
});

els.lightingUsage.addEventListener("change", () => {
  document.getElementById("lightingState").textContent = els.lightingUsage.checked ? "On" : "Off";
});

els.holiday.addEventListener("change", () => {
  document.getElementById("holidayState").textContent = els.holiday.checked ? "Yes" : "No";
});

syncLabels();

const btn = document.getElementById("predictBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const errorMsg = document.getElementById("errorMsg");
const resultNumber = document.getElementById("resultNumber");
const resultStatus = document.getElementById("resultStatus");
const gaugeFill = document.getElementById("gaugeFill");
const historyList = document.getElementById("historyList");

const GAUGE_MAX = 200; // assumed upper bound (kWh) for gauge scaling; adjust to your data's range
const CIRC = 267;
let history = [];

function setGauge(value) {
  const pct = Math.max(0, Math.min(1, value / GAUGE_MAX));
  const offset = CIRC - pct * CIRC;
  gaugeFill.style.strokeDashoffset = offset;

  let color = "#4fd1c5";
  if (pct > 0.7) color = "#fc8181";
  else if (pct > 0.4) color = "#f6ad55";
  gaugeFill.style.stroke = color;
}

function addHistory(value) {
  history.unshift({ value, time: new Date().toLocaleTimeString() });
  history = history.slice(0, 6);

  historyList.innerHTML = "";
  history.forEach((h) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="history-value">${h.value} kWh</span><span class="history-time">${h.time}</span>`;
    historyList.appendChild(li);
  });
}

async function predict() {
  errorMsg.classList.add("hidden");
  btn.disabled = true;
  btnText.textContent = "Predicting...";
  btnSpinner.classList.remove("hidden");

  const payload = {
    Temperature: parseFloat(els.temperature.value),
    Humidity: parseFloat(els.humidity.value),
    SquareFootage: parseFloat(els.squareFootage.value),
    Occupancy: parseFloat(els.occupancy.value),
    RenewableEnergy: parseFloat(els.renewable.value),
    LightingUsage: els.lightingUsage.checked ? "On" : "Off",
    Holiday: els.holiday.checked ? "Yes" : "No",
  };

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.error || "Prediction failed");

    resultNumber.textContent = data.prediction;
    resultStatus.textContent = "Estimated energy consumption";
    setGauge(data.prediction);
    addHistory(data.prediction);
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btnText.textContent = "Predict Energy Consumption";
    btnSpinner.classList.add("hidden");
  }
}

btn.addEventListener("click", predict);
