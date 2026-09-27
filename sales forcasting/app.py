from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import os

app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "Decision_Tree_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# Exact column order the model was trained on
FEATURE_ORDER = [
    "Store_id", "Holiday",
    "Store_Type_S2", "Store_Type_S3", "Store_Type_S4",
    "Location_Type_L2", "Location_Type_L3", "Location_Type_L4", "Location_Type_L5",
    "Region_Code_R2", "Region_Code_R3", "Region_Code_R4",
    "Discount_Yes"
]


def build_feature_vector(data):
    """Turn raw form inputs into the one-hot encoded row the model expects."""
    store_id = float(data["store_id"])
    holiday = int(data["holiday"])
    store_type = data["store_type"]      # 'S1'..'S4'
    location_type = data["location_type"]  # 'L1'..'L5'
    region_code = data["region_code"]      # 'R1'..'R4'
    discount = data["discount"]            # 'Yes' / 'No'

    row = {
        "Store_id": store_id,
        "Holiday": holiday,
        "Store_Type_S2": 1 if store_type == "S2" else 0,
        "Store_Type_S3": 1 if store_type == "S3" else 0,
        "Store_Type_S4": 1 if store_type == "S4" else 0,
        "Location_Type_L2": 1 if location_type == "L2" else 0,
        "Location_Type_L3": 1 if location_type == "L3" else 0,
        "Location_Type_L4": 1 if location_type == "L4" else 0,
        "Location_Type_L5": 1 if location_type == "L5" else 0,
        "Region_Code_R2": 1 if region_code == "R2" else 0,
        "Region_Code_R3": 1 if region_code == "R3" else 0,
        "Region_Code_R4": 1 if region_code == "R4" else 0,
        "Discount_Yes": 1 if discount == "Yes" else 0,
    }
    return [row[col] for col in FEATURE_ORDER]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        required = ["store_id", "store_type", "location_type",
                    "region_code", "holiday", "discount"]
        missing = [k for k in required if k not in data or data[k] in (None, "")]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        vector = build_feature_vector(data)
        X = np.array(vector).reshape(1, -1)
        prediction = model.predict(X)[0]

        return jsonify({"prediction": round(float(prediction), 2)})

    except ValueError:
        return jsonify({"error": "Store ID must be a number."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
