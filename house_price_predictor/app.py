from flask import Flask, render_template, request
import pickle
import pandas as pd

app = Flask(__name__)

# Load the trained model
model = pickle.load(open("Lasso_Regression_model.pkl", "rb"))


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        sqft_living = float(request.form["sqft_living"])
        sqft_above = float(request.form["sqft_above"])
        bathrooms = float(request.form["bathrooms"])
        view = int(request.form["view"])
        sqft_basement = float(request.form["sqft_basement"])

        data = pd.DataFrame([{
            "sqft_living": sqft_living,
            "sqft_above": sqft_above,
            "bathrooms": bathrooms,
            "view": view,
            "sqft_basement": sqft_basement
        }])

        prediction = model.predict(data)[0]

        return render_template(
            "index.html",
            prediction_text=f"Estimated House Price: ${prediction:,.2f}"
        )

    except Exception as e:
        return render_template(
            "index.html",
            prediction_text=f"Error: {e}"
        )


if __name__ == "__main__":
    app.run(debug=True)