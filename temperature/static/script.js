const form = document.getElementById("predict-form");
const btn = document.getElementById("predict-btn");
const btnText = document.getElementById("btn-text");
const btnSpinner = document.getElementById("btn-spinner");
const resultBox = document.getElementById("result");
const resultValue = document.getElementById("result-value");
const errorBox = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorBox.classList.add("hidden");
  resultBox.classList.add("hidden");

  const formData = new FormData(form);
  const payload = {};
  formData.forEach((value, key) => {
    payload[key] = value;
  });

  setLoading(true);

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    resultValue.textContent = `${data.prediction} °C`;
    resultBox.classList.remove("hidden");
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove("hidden");
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  btn.disabled = isLoading;
  btnText.classList.toggle("hidden", isLoading);
  btnSpinner.classList.toggle("hidden", !isLoading);
}
