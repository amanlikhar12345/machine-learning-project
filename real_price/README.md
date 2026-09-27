# Real Estate Price Predictor — Flask App

## Run locally
    pip install -r requirements.txt
    python app.py

Open http://127.0.0.1:5000

## Structure
- app.py — Flask backend, loads model/Gradient_Boosting_model.pkl, exposes /predict (POST JSON)
- templates/index.html — UI
- static/style.css, static/script.js — styling & interactivity (sliders, map picker, prediction history)
- model/Gradient_Boosting_model.pkl — your trained model

## Notes
- Model was trained on RAW (unscaled) features — confirmed from your notebook (gb.fit(x_train, y_train), not the scaled version). So the app sends raw values directly, no scaler needed.
- Feature order matches training exactly: X1-X6 as in your notebook.
