const form = document.getElementById("predictForm");
const predictBtn = document.getElementById("predictBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const resultCard = document.getElementById("resultCard");
const resultValue = document.getElementById("resultValue");
const resultSub = document.getElementById("resultSub");
const errorCard = document.getElementById("errorCard");
const errorText = document.getElementById("errorText");
const geoBtn = document.getElementById("geoBtn");
const geoStatus = document.getElementById("geoStatus");
const historyBox = document.getElementById("history");
const historyList = document.getElementById("historyList");

let predictions = [];

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    geoStatus.textContent = "Geolocation not supported by this browser.";
    return;
  }
  geoStatus.textContent = "Locating…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById("lat").value = pos.coords.latitude.toFixed(6);
      document.getElementById("long").value = pos.coords.longitude.toFixed(6);
      geoStatus.textContent = "Location filled in.";
    },
    () => {
      geoStatus.textContent = "Couldn't get location. Enter manually.";
    }
  );
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  resultCard.classList.add("hidden");

  const payload = {
    id: document.getElementById("id").value,
    year: document.getElementById("year").value,
    odometer: document.getElementById("odometer").value,
    lat: document.getElementById("lat").value,
    long: document.getElementById("long").value,
  };

  setLoading(true);

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong.");
      return;
    }

    showResult(data.prediction, payload);
  } catch (err) {
    showError("Could not reach the prediction server.");
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  predictBtn.disabled = isLoading;
  btnText.textContent = isLoading ? "Predicting…" : "Predict Price";
  spinner.classList.toggle("hidden", !isLoading);
}

function showResult(price, payload) {
  resultValue.textContent = formatCurrency(price);
  resultSub.textContent = `Year ${payload.year} · ${Number(payload.odometer).toLocaleString()} mi`;
  resultCard.classList.remove("hidden");

  predictions.unshift({ price, year: payload.year, odometer: payload.odometer });
  predictions = predictions.slice(0, 5);
  renderHistory();
}

function renderHistory() {
  if (predictions.length === 0) return;
  historyBox.classList.remove("hidden");
  historyList.innerHTML = predictions
    .map(
      (p) =>
        `<li><span>${p.year} · ${Number(p.odometer).toLocaleString()} mi</span><span>${formatCurrency(p.price)}</span></li>`
    )
    .join("");
}

function showError(msg) {
  errorText.textContent = msg;
  errorCard.classList.remove("hidden");
}

function hideError() {
  errorCard.classList.add("hidden");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
