// Medical Insurance Cost Prediction
// script.js

const form = document.getElementById("predictionForm");
const loader = document.getElementById("loader");

// Show loader when form is submitted
form.addEventListener("submit", function (e) {

    let age = parseInt(document.querySelector('[name="age"]').value);
    let bmi = parseFloat(document.querySelector('[name="bmi"]').value);
    let children = parseInt(document.querySelector('[name="children"]').value);

    // Age Validation
    if (age < 1 || age > 100) {
        alert("Age must be between 1 and 100.");
        e.preventDefault();
        return;
    }

    // BMI Validation
    if (bmi < 10 || bmi > 60) {
        alert("BMI must be between 10 and 60.");
        e.preventDefault();
        return;
    }

    // Children Validation
    if (children < 0 || children > 10) {
        alert("Children must be between 0 and 10.");
        e.preventDefault();
        return;
    }

    // Display Loading Screen
    loader.style.display = "flex";
});

// Reset Button Animation
document.querySelector(".reset-btn").addEventListener("click", function () {

    setTimeout(() => {

        const result = document.querySelector(".result-card");

        if (result) {
            result.style.display = "none";
        }

    }, 100);

});

// Automatically hide loader after page loads
window.addEventListener("load", function () {
    loader.style.display = "none";
});

// Input Animation
const inputs = document.querySelectorAll("input, select");

inputs.forEach(input => {

    input.addEventListener("focus", function () {
        this.style.transform = "scale(1.03)";
    });

    input.addEventListener("blur", function () {
        this.style.transform = "scale(1)";
    });

});

// Live BMI Indicator
const bmiInput = document.querySelector('[name="bmi"]');

bmiInput.addEventListener("input", function () {

    let bmi = parseFloat(this.value);

    if (isNaN(bmi)) return;

    if (bmi < 18.5) {
        this.style.border = "3px solid #3498db";
        this.title = "Underweight";
    }
    else if (bmi < 25) {
        this.style.border = "3px solid #2ecc71";
        this.title = "Normal";
    }
    else if (bmi < 30) {
        this.style.border = "3px solid #f1c40f";
        this.title = "Overweight";
    }
    else {
        this.style.border = "3px solid #e74c3c";
        this.title = "Obese";
    }

});

// Smooth Scroll to Result
window.onload = function () {

    loader.style.display = "none";

    const result = document.querySelector(".result-card");

    if (result) {

        result.scrollIntoView({

            behavior: "smooth",
            block: "center"

        });

    }

};

// Predict Button Click Animation
const predictBtn = document.querySelector(".predict-btn");

predictBtn.addEventListener("mouseover", function () {

    this.style.transform = "scale(1.05)";

});

predictBtn.addEventListener("mouseout", function () {

    this.style.transform = "scale(1)";

});