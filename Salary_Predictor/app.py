from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

with open("gradient_boosting_model.pkl", "rb") as file:
    model = pickle.load(file)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    age = float(request.form["age"])
    experience = float(request.form["experience"])

    data = np.array([[age, experience]])

    prediction = model.predict(data)

    return jsonify({
        "salary": round(prediction[0], 2)
    })


if __name__ == "__main__":
    app.run(debug=True)