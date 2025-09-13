// app.js - gestione generale e caricamento partials

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
function loadHTML(elementId, url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if(callback) callback(); // chiama inizializzazioni aggiuntive
        });
}

// ------------------ INIZIALIZZAZIONI MENU FUTURI ------------------
function initMenus() {
    // Qui puoi aggiungere eventuali eventi per nuovi menu, dropdown, toggle
    // Esempio:
    const dropdowns = document.querySelectorAll(".dropdown-toggle");
    dropdowns.forEach(btn => {
        btn.addEventListener("click", () => {
            const menu = btn.nextElementSibling;
            if(menu) menu.classList.toggle("open");
        });
    });
}

// ------------------ INIT ------------------
document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    // Carica header, navbar, footer
    loadHTML("header-container", "partials/header.html", () => {
        initThemeToggle();  // toggle tema sempre inizializzato
        initMenus();        // eventuali menu in header
    });
    loadHTML("navbar-container", "partials/navbar.html", initMenus);
    loadHTML("footer-container", "partials/footer.html", initMenus);
});
