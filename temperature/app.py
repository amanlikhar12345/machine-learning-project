from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
from sklearn.preprocessing import PolynomialFeatures

app = Flask(__name__)

# Load the trained model
with open("model/model.pkl", "rb") as f:
    model = pickle.load(f)

# IMPORTANT: These must be the SAME 6 months, in the SAME order,
# that were used as `x` (top6) when the model was trained.
# Update this list to match your notebook's `top6` output.
FEATURES = ["Jan", "Feb", "Mar", "Nov", "Oct", "Sep"]

DEGREE = 2  # matches PolynomialFeatures(degree=2) used during training


@app.route("/")
def home():
    return render_template("index.html", features=FEATURES)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}

    # Validate all required fields are present and numeric
    values = []
    for feat in FEATURES:
        if feat not in data:
            return jsonify({"error": f"Missing value for {feat}"}), 400
        try:
            values.append(float(data[feat]))
        except (TypeError, ValueError):
            return jsonify({"error": f"Invalid number for {feat}"}), 400

    x = np.array(values).reshape(1, -1)
    poly = PolynomialFeatures(degree=DEGREE)
    x_poly = poly.fit_transform(x)

    if x_poly.shape[1] != model.n_features_in_:
        return jsonify({
            "error": (
                f"Feature mismatch: model expects {model.n_features_in_} "
                f"features but got {x_poly.shape[1]}. Check FEATURES/DEGREE "
                f"in app.py match your training setup."
            )
        }), 400

    pred = model.predict(x_poly)
    pred_val = float(np.array(pred).reshape(-1)[0])

    return jsonify({"prediction": round(pred_val, 2)})


if __name__ == "__main__":
    app.run(debug=True)
