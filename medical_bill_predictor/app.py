from flask import Flask, render_template, request
import pickle
import pandas as pd

app = Flask(__name__)

model = pickle.load(open("model.pkl", "rb"))

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    age = int(request.form["age"])
    bmi = float(request.form["bmi"])
    children = int(request.form["children"])

    sex = request.form["sex"]
    smoker = request.form["smoker"]
    region = request.form["region"]

    # Manual One-Hot Encoding
    sex_male = 1 if sex == "male" else 0
    smoker_yes = 1 if smoker == "yes" else 0

    region_northwest = 1 if region == "northwest" else 0
    region_southeast = 1 if region == "southeast" else 0
    region_southwest = 1 if region == "southwest" else 0

    data = pd.DataFrame([[
        age,
        bmi,
        children,
        sex_male,
        smoker_yes,
        region_northwest,
        region_southeast,
        region_southwest
    ]], columns=[
        "age",
        "bmi",
        "children",
        "sex_male",
        "smoker_yes",
        "region_northwest",
        "region_southeast",
        "region_southwest"
    ])

    prediction = model.predict(data)[0]

    return render_template(
        "index.html",
        prediction=f"₹ {prediction:,.2f}"
    )


if __name__ == "__main__":
    app.run(debug=True)