const form = document.getElementById("predict-form");
const btn = document.getElementById("predict-btn");
const btnText = btn.querySelector(".btn-text");
const spinner = btn.querySelector(".spinner");
const resultBox = document.getElementById("result");
const resultValue = document.getElementById("result-value");
const errorBox = document.getElementById("error");
const historyCard = document.getElementById("history-card");
const historyList = document.getElementById("history-list");

let history = [];

function setupToggle(groupId, hiddenInputId) {
  const group = document.getElementById(groupId);
  const hidden = document.getElementById(hiddenInputId);
  group.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      group.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      hidden.value = btn.dataset.value;
    });
  });
}
setupToggle("holiday-toggle", "holiday");
setupToggle("discount-toggle", "discount");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.hidden = true;
  resultBox.hidden = true;

  const payload = {
    store_id: document.getElementById("store_id").value,
    store_type: document.getElementById("store_type").value,
    location_type: document.getElementById("location_type").value,
    region_code: document.getElementById("region_code").value,
    holiday: document.getElementById("holiday").value,
    discount: document.getElementById("discount").value,
  };

  if (!payload.store_id) {
    showError("Please enter a Store ID.");
    return;
  }

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
    } else {
      resultValue.textContent = "$" + data.prediction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      resultBox.hidden = false;
      addToHistory(payload, data.prediction);
    }
  } catch (err) {
    showError("Could not reach the server. Is the Flask app running?");
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  btn.disabled = isLoading;
  spinner.hidden = !isLoading;
  btnText.textContent = isLoading ? "Predicting…" : "Predict Sales";
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
}

function addToHistory(payload, prediction) {
  history.unshift({ ...payload, prediction });
  history = history.slice(0, 5);

  historyList.innerHTML = "";
  history.forEach((h) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>Store ${h.store_id} · ${h.store_type} · ${h.location_type} · ${h.region_code}${h.holiday === "1" ? " · Holiday" : ""}${h.discount === "Yes" ? " · Discount" : ""}</span><span>$${prediction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>`;
    historyList.appendChild(li);
  });
  historyCard.hidden = false;
}
