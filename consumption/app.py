from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)

# Load the trained model (Linear Regression fit on degree-2 polynomial features)
with open("linear_Regression_model.pkl", "rb") as f:
    model = pickle.load(f)

# Same feature order used during training in the notebook
FEATURE_ORDER = [
    "Temperature",
    "Humidity",
    "SquareFootage",
    "Occupancy",
    "RenewableEnergy",
    "LightingUsage_On",
    "Holiday_Yes",
]

poly = PolynomialFeatures(degree=2)
# Fit once on a dummy row just to lock in the transform shape (deterministic for given n_features)
poly.fit(np.zeros((1, len(FEATURE_ORDER))))


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        values = [
            float(data["Temperature"]),
            float(data["Humidity"]),
            float(data["SquareFootage"]),
            float(data["Occupancy"]),
            float(data["RenewableEnergy"]),
            1.0 if data["LightingUsage"] == "On" else 0.0,
            1.0 if data["Holiday"] == "Yes" else 0.0,
        ]

        x = np.array(values).reshape(1, -1)
        x_poly = poly.transform(x)

        prediction = model.predict(x_poly)
        pred_value = float(np.ravel(prediction)[0])

        return jsonify({"success": True, "prediction": round(pred_value, 2)})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
