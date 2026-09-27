from flask import Flask, render_template, request
import pandas as pd
import pickle

app = Flask(__name__)

# -----------------------------
# Load Model and Preprocessing Objects
# -----------------------------
model = pickle.load(open("Polynomial_Regression_model6.pkl", "rb"))
poly = pickle.load(open("poly.pkl", "rb"))
columns = pickle.load(open("columns.pkl", "rb"))


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # -----------------------------
        # Get Form Data
        # -----------------------------
        experience = float(request.form["experience"])
        skills = int(request.form["skills"])
        certifications = int(request.form["certifications"])

        job_title = request.form["job_title"]
        education = request.form["education"]
        industry = request.form["industry"]
        company_size = request.form["company_size"]
        location = request.form["location"]
        remote_work = request.form["remote_work"]

        # -----------------------------
        # Create DataFrame
        # -----------------------------
        input_df = pd.DataFrame({
            "experience_years": [experience],
            "skills_count": [skills],
            "certifications": [certifications],
            "job_title": [job_title],
            "education_level": [education],
            "industry": [industry],
            "company_size": [company_size],
            "location": [location],
            "remote_work": [remote_work]
        })

        # -----------------------------
        # One-Hot Encoding
        # -----------------------------
        input_df = pd.get_dummies(input_df)

        # -----------------------------
        # Match Training Columns
        # -----------------------------
        input_df = input_df.reindex(columns=columns, fill_value=0)

        # -----------------------------
        # Polynomial Transformation
        # -----------------------------
        input_poly = poly.transform(input_df)

        # -----------------------------
        # Prediction
        # -----------------------------
        prediction = model.predict(input_poly)[0]

        prediction = round(float(prediction), 2)

        return render_template(
            "index.html",
            prediction_text=f"₹ {prediction:,.2f}"
        )

    except Exception as e:
        return render_template(
            "index.html",
            prediction_text=f"Error: {str(e)}"
        )


if __name__ == "__main__":
    app.run(debug=True)