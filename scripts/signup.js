const signupForm = document.getElementById("signupForm");

const signupSection = document.getElementById("signupSection");
const accountSection = document.getElementById("accountSection");

const logoutBtn = document.getElementById("logoutBtn");

const STORAGE_KEY = "BookNestUser";

function getAccount() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function displayAccount(user) {

    signupSection.classList.add("d-none");
    accountSection.classList.remove("d-none");

    document.getElementById("accountName").textContent =
        `Hello, ${user.fullName}!`;

    document.getElementById("profileName").textContent =
        user.fullName;

    document.getElementById("profileEmail").textContent =
        user.email;
}

function displaySignupForm() {

    accountSection.classList.add("d-none");
    signupSection.classList.remove("d-none");
}

window.addEventListener("DOMContentLoaded", () => {

    const savedAccount = getAccount();

    if (savedAccount) {
        displayAccount(savedAccount);
    } else {
        displaySignupForm();
    }

});

signupForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (password.length < 6) {
        showMessage("Please use at least 6 characters.", "danger");
        return;
    }

    const newUser = {
        id: Date.now(),
        fullName: fullName,
        email: email,
        password: password
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    displayAccount(newUser);

});


logoutBtn.addEventListener("click", function() {

    localStorage.removeItem(STORAGE_KEY);

    signupForm.reset();

    displaySignupForm();

});

function showMessage(message, type) {

    document.getElementById("signupMessage").innerHTML = `
        <div class="alert alert-${type} py-2">
            ${message}
        </div>
    `;

}