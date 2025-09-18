document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".orario-table");
    const wrapper = document.querySelector("#orario-container");
    const rows = table.tBodies[0].rows;

    // Calcola il giorno corrente (0=domenica, 1=lunedì)
    let todayIndex = new Date().getDay() - 1; 
    if (todayIndex < 0) todayIndex = 5; // se domenica, punta a Sabato

    const currentHour = new Date().getHours();

    // Se siamo oltre l'ora limite, passa al giorno successivo
    const cutoffHour = 14;
    
    if (currentHour >= cutoffHour) {
        todayIndex += 1;
        if (todayIndex > 5) todayIndex = 0; // se supera Sabato, torna a Lunedì
    }
    
    for (let r = 0; r < rows.length; r++) {
        const cells = rows[r].cells;
        for (let c = 0; c < cells.length; c++) {
            const cell = cells[c];
            if (!cell.classList.contains("subject")) continue;

            if (c === todayIndex) {
                cell.classList.remove("not-today"); // giorno corrente resta colorato
            } else {
                cell.classList.add("not-today"); // tutti gli altri diventano grigi
            }
        }
    }

    // Centra la colonna del giorno corrente
    const headerCells = table.tHead.rows[0].cells;
    const targetCell = headerCells[todayIndex];
    if (targetCell) {
        const wrapperWidth = wrapper.offsetWidth;
        const cellLeft = targetCell.offsetLeft;
        const cellWidth = targetCell.offsetWidth;
        wrapper.scrollLeft = cellLeft - wrapperWidth / 2 + cellWidth / 2;
    }
});
