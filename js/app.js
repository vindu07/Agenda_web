// app.js - gestione generale e caricamento header/navbar/footer

// ------------------ THEME ------------------
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
    } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
    }
}

function initThemeToggle() {
    const toggleBtn = document.getElementById("toggle-theme");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleTheme);
    }
}

// ------------------ PARTIALS INCLUDE ------------------
function loadHTML(elementId, url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if(elementId === "header-container") initThemeToggle(); // inizializza toggle dopo il caricamento
        });
}

// ------------------ INIT ------------------
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadHTML("header-container", "partials/header.html");
    loadHTML("navbar-container", "partials/navbar.html");
    loadHTML("footer-container", "partials/footer.html");
});
