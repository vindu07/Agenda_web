function loadHTML(elementId, url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            if(callback) callback(); // inizializza pulsanti/menu subito dopo il caricamento
        });
}

// Inizializza toggle tema
function initThemeToggle() {
    const toggleBtn = document.getElementById("toggle-theme");
    if(toggleBtn){
        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            document.body.classList.toggle("light-mode");
            localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
        });
    }
}

// Inizializza eventuali menu
function initMenus() {
    const dropdowns = document.querySelectorAll(".dropdown-toggle");
    dropdowns.forEach(btn => {
        btn.addEventListener("click", () => {
            const menu = btn.nextElementSibling;
            if(menu) menu.classList.toggle("open");
        });
    });
}

// Carica partials e inizializza pulsanti/menu
document.addEventListener("DOMContentLoaded", () => {
    loadHTML("header-container", "partials/header.html", () => {
        initThemeToggle();
        initMenus();
    });
    loadHTML("navbar-container", "partials/navbar.html", initMenus);
    loadHTML("footer-container", "partials/footer.html", initMenus);
});
