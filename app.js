const WEEKDAYS = ["D", "L", "M", "X", "J", "V", "S"]; // domingo a sábado

function daysInMonth(year, monthIndex0) {
  // monthIndex0: 0=enero ... 11=diciembre
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function firstDayOfMonth(year, monthIndex0) {
  // 0=domingo ... 6=sábado
  return new Date(year, monthIndex0, 1).getDay();
}

function buildMonthCard(year, month) {
  const monthIndex0 = month.id - 1;

  // Mapa: dia -> eventos
  const eventsByDay = new Map();
  (month.events || []).forEach(ev => {
    const day = Number(ev.date.slice(8, 10)); // "2026-01-05" -> 5
    if (!eventsByDay.has(day)) eventsByDay.set(day, []);
    eventsByDay.get(day).push(ev);
  });

  const card = document.createElement("section");
  card.className = "month";

  // Cover placeholder
  const cover = document.createElement("img");
  cover.className = "month-cover";
  cover.src = month.image || "img/placeholder.webp";
  cover.alt = month.name;
  cover.loading = "lazy";

  // Title centered
  const title = document.createElement("h2");
  title.textContent = month.name;

  // Weekdays header
  const weekdays = document.createElement("div");
  weekdays.className = "weekdays";
  WEEKDAYS.forEach(w => {
    const el = document.createElement("div");
    el.textContent = w;
    weekdays.appendChild(el);
  });

  // Calendar grid
  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const first = firstDayOfMonth(year, monthIndex0);
  const total = daysInMonth(year, monthIndex0);

  // Relleno previo (celdas vacías antes del 1)
  for (let i = 0; i < first; i++) {
    const empty = document.createElement("div");
    empty.className = "day empty";
    grid.appendChild(empty);
  }

  // Días
  for (let d = 1; d <= total; d++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = d;

    const evs = eventsByDay.get(d) || [];
    if (evs.length > 0) {
      cell.classList.add("has-event");

      // Tooltip con títulos
      cell.title = evs.map(e => `${e.title} (${e.tag})`).join("\n");
    }

    grid.appendChild(cell);
  }

  card.appendChild(cover);
  card.appendChild(title);
  card.appendChild(weekdays);
  card.appendChild(grid);

  return card;
}

async function main() {
  const res = await fetch("./events.json");
  if (!res.ok) throw new Error("No se pudo cargar events.json: " + res.status);

  const data = await res.json();

  const yearView = document.getElementById("year-view");
  yearView.innerHTML = "";

  data.months.forEach(month => {
    yearView.appendChild(buildMonthCard(data.year, month));
  });
}

main().catch(err => {
  console.error(err);
  alert("Algo falló, revisar la consola (F12).");
});
