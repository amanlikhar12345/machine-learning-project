from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np
import os

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "gradient_boosting_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        required = ["id", "year", "odometer", "lat", "long"]
        missing = [k for k in required if k not in data or data[k] in ("", None)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            id_val = float(data["id"])
            year = float(data["year"])
            odometer = float(data["odometer"])
            lat = float(data["lat"])
            long_ = float(data["long"])
        except ValueError:
            return jsonify({"error": "All fields must be numeric."}), 400

        if not (1900 <= year <= 2026):
            return jsonify({"error": "Year must be between 1900 and 2026."}), 400
        if odometer < 0:
            return jsonify({"error": "Odometer cannot be negative."}), 400
        if not (-90 <= lat <= 90):
            return jsonify({"error": "Latitude must be between -90 and 90."}), 400
        if not (-180 <= long_ <= 180):
            return jsonify({"error": "Longitude must be between -180 and 180."}), 400

        features = np.array([[id_val, year, odometer, lat, long_]])
        prediction = model.predict(features)[0]
        prediction = max(0, float(prediction))

        return jsonify({"prediction": round(prediction, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
