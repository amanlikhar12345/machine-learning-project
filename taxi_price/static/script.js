const form = document.getElementById("fareForm");
const resultBox = document.getElementById("resultBox");
const resultValue = document.getElementById("resultValue");
const errorBox = document.getElementById("errorBox");
const spinner = document.getElementById("spinner");
const predictBtn = document.querySelector(".predict-btn");

const passengerInput = document.getElementById("num_of_passengers");
document.getElementById("incPassenger").addEventListener("click", () => {
  passengerInput.value = Math.min(10, (parseInt(passengerInput.value) || 1) + 1);
});
document.getElementById("decPassenger").addEventListener("click", () => {
  passengerInput.value = Math.max(1, (parseInt(passengerInput.value) || 1) - 1);
});

const surgeToggle = document.getElementById("surge_toggle");
const surgeHidden = document.getElementById("surge_applied");
const surgeLabel = document.getElementById("surgeLabel");

surgeToggle.addEventListener("change", () => {
  if (surgeToggle.checked) {
    surgeHidden.value = "1";
    surgeLabel.textContent = "Surge Active";
    surgeLabel.classList.add("active");
  } else {
    surgeHidden.value = "0";
    surgeLabel.textContent = "No Surge";
    surgeLabel.classList.remove("active");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  resultBox.classList.remove("show");
  errorBox.classList.remove("show");

  const payload = {
    trip_duration: document.getElementById("trip_duration").value,
    distance_traveled: document.getElementById("distance_traveled").value,
    num_of_passengers: document.getElementById("num_of_passengers").value,
    surge_applied: surgeHidden.value
  };

  spinner.classList.add("show");
  predictBtn.disabled = true;

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.error || "Something went wrong.";
      errorBox.classList.add("show");
    } else {
      resultValue.textContent = `$${data.total_fare.toFixed(2)}`;
      resultBox.classList.add("show");
    }
  } catch (err) {
    errorBox.textContent = "Could not connect to the server.";
    errorBox.classList.add("show");
  } finally {
    spinner.classList.remove("show");
    predictBtn.disabled = false;
  }
});
