import * as db from "./db.js";


/*CAMBIA TEMA*/
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-theme");
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
});

/*IMPOSTAZIONI*/
document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settings");
  settingsBtn.addEventListener("click", () => {
    //da implementare
  });
});


// registra il service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker registrato"))
    .catch(err => console.error("Errore Service Worker:", err));
}

/*REFRESHA LA CACHE DEL BROWSER*/
if (navigator.onLine && navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage("refreshCache");
} // all'avvio

setInterval(() => {
  if (navigator.online && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage("refreshCache");
  }
}, 10 * 60 * 1000); // ogni 10 minuti



db.archiveTasks(); //archivia i task passati
