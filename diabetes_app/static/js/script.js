const FEATURES = ["Pregnancies", "Glucose", "BMI", "DiabetesPedigreeFunction", "Age"];

const form = document.getElementById("predictForm");
const formError = document.getElementById("formError");
const gaugeFill = document.getElementById("gaugeFill");
const gaugeNeedle = document.getElementById("gaugeNeedle");
const probNumber = document.getElementById("probNumber");
const verdictBadge = document.getElementById("verdictBadge");
const verdictText = document.getElementById("verdictText");
const featureEcho = document.getElementById("featureEcho");

const GAUGE_CIRCUMFERENCE = 283; // matches stroke-dasharray in CSS

function formatValue(id, val) {
  if (id === "BMI") return val.toFixed(1);
  if (id === "DiabetesPedigreeFunction") return val.toFixed(2);
  return String(Math.round(val));
}

// Wire up sliders: live label + track fill percentage
FEATURES.forEach((id) => {
  const input = document.getElementById(id);
  const label = document.getElementById(id + "_val");

  const sync = () => {
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const val = parseFloat(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty("--pct", pct + "%");
    label.textContent = formatValue(id, val);
  };

  input.addEventListener("input", sync);
  sync();
});

function setGauge(prob) {
  const offset = GAUGE_CIRCUMFERENCE * (1 - prob);
  gaugeFill.style.strokeDashoffset = offset;

  // needle sweeps from -90deg (0%) to +90deg (100%)
  const angle = -90 + prob * 180;
  gaugeNeedle.style.transform = `rotate(${angle}deg)`;

  probNumber.textContent = Math.round(prob * 100) + "%";

  let color = "#2fbf9f";
  if (prob >= 0.6) color = "#e2604f";
  else if (prob >= 0.3) color = "#f2a93b";
  gaugeFill.style.stroke = color;
}

function setVerdict(band, prob, outcome) {
  verdictBadge.className = "verdict-badge " + band;
  const labels = {
    low: "LOW RISK",
    moderate: "MODERATE RISK",
    high: "ELEVATED RISK",
  };
  verdictBadge.textContent = labels[band];

  const texts = {
    low: "Model estimates a low likelihood of diabetes based on these markers.",
    moderate: "Model flags some signal here — worth a closer look with a clinician.",
    high: "Model estimates a high likelihood of diabetes. Recommend clinical follow-up.",
  };
  verdictText.textContent = texts[band];
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const payload = {};
  FEATURES.forEach((id) => {
    payload[id] = parseFloat(document.getElementById(id).value);
    document.getElementById("echo_" + id).textContent = formatValue(id, payload[id]);
  });

  const btn = form.querySelector(".run-btn span");
  const originalLabel = btn.textContent;
  btn.textContent = "Screening…";

  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!data.ok) {
      formError.textContent = "Check inputs: " + Object.values(data.errors || {}).join(" ");
      formError.hidden = false;
      return;
    }

    setGauge(data.probability);
    setVerdict(data.risk_band, data.probability, data.outcome);
    featureEcho.hidden = false;
  } catch (err) {
    formError.textContent = "Could not reach the prediction service. Is the Flask server running?";
    formError.hidden = false;
  } finally {
    btn.textContent = originalLabel;
  }
});
