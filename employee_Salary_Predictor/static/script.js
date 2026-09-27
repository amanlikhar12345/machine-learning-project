// ================================
// Salary Predictor Script
// ================================

// Form
const form = document.getElementById("salaryForm");

// Buttons
const predictBtn = document.querySelector(".predict-btn");
const resetBtn = document.querySelector(".reset-btn");

// ================================
// Form Validation + Loading
// ================================

if (form) {

    form.addEventListener("submit", function (e) {

        const experience = parseFloat(document.querySelector("input[name='experience']").value);
        const skills = parseInt(document.querySelector("input[name='skills']").value);
        const certifications = parseInt(document.querySelector("input[name='certifications']").value);

        // Validation

        if (experience < 0) {
            alert("Experience cannot be negative.");
            e.preventDefault();
            return;
        }

        if (skills < 1) {
            alert("Skills count should be at least 1.");
            e.preventDefault();
            return;
        }

        if (certifications < 0) {
            alert("Certifications cannot be negative.");
            e.preventDefault();
            return;
        }

        // Loading Effect

        predictBtn.disabled = true;

        predictBtn.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i> Predicting...`;

    });

}


// ================================
// Reset Button
// ================================

if (resetBtn) {

    resetBtn.addEventListener("click", function () {

        setTimeout(() => {

            window.location.href = "/";

        }, 200);

    });

}


// ================================
// Salary Counter Animation
// ================================

window.onload = function () {

    const salary = document.getElementById("salaryResult");

    if (salary) {

        let finalText = salary.innerText;

        // Extract Number

        let number = finalText.replace(/[₹, ]/g, "");

        let target = parseFloat(number);

        if (!isNaN(target)) {

            let current = 0;

            let increment = target / 80;

            let counter = setInterval(function () {

                current += increment;

                if (current >= target) {

                    current = target;

                    clearInterval(counter);

                }

                salary.innerHTML =
                    "₹ " +
                    Math.round(current).toLocaleString("en-IN");

            }, 20);

        }

    }

};


// ================================
// Input Focus Animation
// ================================

const inputs = document.querySelectorAll("input, select");

inputs.forEach(input => {

    input.addEventListener("focus", () => {

        input.style.transform = "scale(1.03)";

    });

    input.addEventListener("blur", () => {

        input.style.transform = "scale(1)";

    });

});


// ================================
// Button Hover Animation
// ================================

document.querySelectorAll("button").forEach(btn => {

    btn.addEventListener("mouseenter", () => {

        btn.style.transition = ".3s";

    });

});


// ================================
// Fade-in Animation
// ================================

window.addEventListener("load", () => {

    document.body.style.opacity = "0";

    setTimeout(() => {

        document.body.style.transition = "opacity .8s";

        document.body.style.opacity = "1";

    }, 100);

});