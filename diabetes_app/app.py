import os
import pickle
import numpy as np
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "ann_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")

FEATURES = ["Pregnancies", "Glucose", "BMI", "DiabetesPedigreeFunction", "Age"]

# ---- Load model ----
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# ---- Load scaler (optional but strongly recommended) ----
scaler = None
scaler_missing = True
if os.path.exists(SCALER_PATH):
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    scaler_missing = False


def validate_input(data):
    errors = {}
    ranges = {
        "Pregnancies": (0, 20),
        "Glucose": (0, 300),
        "BMI": (0, 80),
        "DiabetesPedigreeFunction": (0, 3),
        "Age": (1, 120),
    }
    values = []
    for feat in FEATURES:
        raw = data.get(feat, None)
        try:
            val = float(raw)
        except (TypeError, ValueError):
            errors[feat] = "Required, numeric value."
            values.append(0)
            continue
        lo, hi = ranges[feat]
        if val < lo or val > hi:
            errors[feat] = f"Expected between {lo} and {hi}."
        values.append(val)
    return values, errors


@app.route("/")
def index():
    return render_template("index.html", scaler_missing=scaler_missing)


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True, silent=True) or {}
    values, errors = validate_input(data)
    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    x = np.array(values, dtype=float).reshape(1, -1)

    if scaler is not None:
        x_scaled = scaler.transform(x)
    else:
        # Degraded mode: no scaler available, model was trained on
        # standardized inputs, so predictions in this mode are unreliable.
        x_scaled = x

    prob = float(model.predict(x_scaled, verbose=0).ravel()[0])
    prob = max(0.0, min(1.0, prob))
    outcome = int(prob >= 0.5)

    if prob < 0.3:
        risk_band = "low"
    elif prob < 0.6:
        risk_band = "moderate"
    else:
        risk_band = "high"

    return jsonify({
        "ok": True,
        "probability": round(prob, 4),
        "outcome": outcome,
        "risk_band": risk_band,
        "scaler_missing": scaler_missing,
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
