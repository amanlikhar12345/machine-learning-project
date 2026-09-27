from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import os

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

FEATURE_ORDER = ["trip_duration", "distance_traveled", "num_of_passengers", "surge_applied"]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        trip_duration = float(data.get("trip_duration"))
        distance_traveled = float(data.get("distance_traveled"))
        num_of_passengers = float(data.get("num_of_passengers"))
        surge_applied = float(data.get("surge_applied"))

        if trip_duration < 0 or distance_traveled < 0 or num_of_passengers <= 0:
            return jsonify({"error": "Values must be positive (passengers must be at least 1)."}), 400

        features = np.array([[trip_duration, distance_traveled, num_of_passengers, surge_applied]])
        prediction = model.predict(features)[0]
        prediction = round(float(prediction), 2)

        return jsonify({"total_fare": prediction})

    except (TypeError, ValueError):
        return jsonify({"error": "Invalid input. Please enter valid numbers."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
