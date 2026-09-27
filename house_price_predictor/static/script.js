// ==============================
// House Price Predictor
// script.js
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("predictionForm");
    const resetBtn = document.querySelector(".reset-btn");
    const predictBtn = document.querySelector(".predict-btn");

    // -----------------------------
    // Predict Button Loading Effect
    // -----------------------------
    form.addEventListener("submit", function () {

        predictBtn.disabled = true;

        predictBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Predicting...';

    });

    // -----------------------------
    // Reset Button Animation
    // -----------------------------
    resetBtn.addEventListener("click", () => {

        predictBtn.disabled = false;

        predictBtn.innerHTML =
            '<i class="fa-solid fa-wand-magic-sparkles"></i> Predict Price';

        const result = document.querySelector(".result-card");

        if(result){

            result.style.opacity = "0";

            setTimeout(()=>{
                result.remove();
            },300);

        }

    });

    // -----------------------------
    // Input Animation
    // -----------------------------
    const inputs = document.querySelectorAll("input,select");

    inputs.forEach(input=>{

        input.addEventListener("focus",()=>{

            input.style.transform="scale(1.03)";

        });

        input.addEventListener("blur",()=>{

            input.style.transform="scale(1)";

        });

    });

});