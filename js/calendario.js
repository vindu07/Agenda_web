const days = document.querySelectorAll("#calendar .day-number");

// metto i numeri dei giorni
days.forEach((el, i) => {
  if(i<=3){ el.textContent = i + 1;} // esempio: 1..35
});

// aggiungo 3 pallini al giorno 10
const dotsDiv = document.querySelectorAll("#calendar .tasks")[9];
["red", "green", "blue"].forEach(c => {
  const d = document.createElement("div");
  d.className = `dot ${c}`;
  dotsDiv.appendChild(d);
});

