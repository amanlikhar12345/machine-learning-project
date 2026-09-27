from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np
import os

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "Gradient_Boosting_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

FEATURE_ORDER = [
    "X1 transaction date",
    "X2 house age",
    "X3 distance to the nearest MRT station",
    "X4 number of convenience stores",
    "X5 latitude",
    "X6 longitude",
]

RANGES = {
    "X1 transaction date": (2012.0, 2014.0),
    "X2 house age": (0, 45),
    "X3 distance to the nearest MRT station": (0, 6500),
    "X4 number of convenience stores": (0, 10),
    "X5 latitude": (24.93, 25.02),
    "X6 longitude": (121.47, 121.57),
}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        values = []
        for feat in FEATURE_ORDER:
            if feat not in data:
                return jsonify({"error": f"Missing field: {feat}"}), 400
            values.append(float(data[feat]))

        x = np.array(values).reshape(1, -1)
        prediction = model.predict(x)[0]
        prediction = round(float(prediction), 2)

        return jsonify({"prediction": prediction, "unit": "10,000 NTD / ping"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/ranges")
def ranges():
    return jsonify(RANGES)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
