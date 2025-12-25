const WEEKDAYS = ["D", "L", "M", "X", "J", "V", "S"];

function daysInMonth(year, monthIndex0) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}
function firstDayOfMonth(year, monthIndex0) {
  return new Date(year, monthIndex0, 1).getDay();
}

function groupEventsByDay(events = []) {
  const map = new Map();
  events.forEach(ev => {
    const day = Number(ev.date.slice(8, 10));
    if (!map.has(day)) map.set(day, []);
    map.get(day).push(ev);
  });
  return map;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function monthGrid(year, month, size = "small") {
  const monthIndex0 = month.id - 1;
  const total = daysInMonth(year, monthIndex0);
  const first = firstDayOfMonth(year, monthIndex0);
  const eventsByDay = groupEventsByDay(month.events);

  const wrap = el("div", size === "big" ? "month-big" : "");
  const weekdays = el("div", "weekdays");
  WEEKDAYS.forEach(w => weekdays.appendChild(el("div", "", w)));

  const grid = el("div", "calendar-grid");

  for (let i = 0; i < first; i++) grid.appendChild(el("div", "day empty", ""));

  for (let d = 1; d <= total; d++) {
    const cell = el("div", "day", String(d));
    const evs = eventsByDay.get(d) || [];
    if (evs.length > 0) {
      cell.classList.add("has-event");
      cell.title = evs.map(e => `${e.title} (${e.tag})`).join("\n");
    }
    grid.appendChild(cell);
  }

  wrap.appendChild(weekdays);
  wrap.appendChild(grid);
  return wrap;
}

function buildMonthCard(data, month) {
  const card = el("section", "month");

  const cover = document.createElement("img");
  cover.className = "month-cover";
  cover.src = month.image || "img/placeholder.webp";
  cover.alt = month.name;
  cover.loading = "lazy";
  cover.onerror = () => (cover.src = "img/placeholder.webp");

  const title = el("h2", "", month.name);

  const mini = monthGrid(data.year, month);

  card.appendChild(cover);
  card.appendChild(title);
  card.appendChild(mini);

  // click -> vista del mes
  card.addEventListener("click", () => {
    location.hash = `#month/${month.id}`;
  });

  // accesibilidad (Enter / Space)
  card.tabIndex = 0;
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.click();
    }
  });

  return card;
}

/* =========================
   NAV FLOTANTE (GLOBAL)
========================= */
function clearFloatingNav() {
  document.getElementById("navPrev")?.remove();
  document.getElementById("navNext")?.remove();
}

function setFloatingNav(monthId) {
  clearFloatingNav();

  // Botón anterior
  if (monthId > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.id = "navPrev";
    prevBtn.className = "floating-nav left";
    prevBtn.type = "button";
    prevBtn.textContent = "←";
    prevBtn.title = "Mes anterior";
    prevBtn.onclick = () => (location.hash = `#month/${monthId - 1}`);
    document.body.appendChild(prevBtn);
  }

  // Botón siguiente
  if (monthId < 12) {
    const nextBtn = document.createElement("button");
    nextBtn.id = "navNext";
    nextBtn.className = "floating-nav right";
    nextBtn.type = "button";
    nextBtn.textContent = "→";
    nextBtn.title = "Mes siguiente";
    nextBtn.onclick = () => (location.hash = `#month/${monthId + 1}`);
    document.body.appendChild(nextBtn);
  }
}

function renderYear(data) {
  const yearView = document.getElementById("year-view");
  yearView.innerHTML = "";

  // ✅ quitar botones flotantes al volver al año
  clearFloatingNav();

  data.months.forEach(month => {
    yearView.appendChild(buildMonthCard(data, month));
  });

  // UI
  document.getElementById("pageTitle").textContent = `CALENDARIO CARRERITAS ${data.year}`;
  document.getElementById("backBtn").classList.add("hidden");
}

function renderMonth(data, monthId) {
  const month = data.months.find(m => m.id === monthId);
  const yearView = document.getElementById("year-view");
  yearView.innerHTML = "";

  if (!month) {
    yearView.textContent = "Mes no encontrado";
    return;
  }

  // ✅ setear botones flotantes globales
  setFloatingNav(month.id);

  // Top UI
  document.getElementById("pageTitle").textContent = `${month.name} ${data.year}`;
  const backBtn = document.getElementById("backBtn");
  backBtn.classList.remove("hidden");
  backBtn.onclick = () => (location.hash = "#year");

  /* =========================
     CONTENEDOR PRINCIPAL
  ========================= */
  const container = el("section", "month-view");

  /* =========================
     HERO (IMAGEN ARRIBA)
  ========================= */
  const hero = el("div", "month-hero");

  const cover = document.createElement("img");
  cover.className = "month-hero-img";
  cover.src = month.image || "img/placeholder.webp";
  cover.alt = month.name;
  cover.loading = "lazy";
  cover.onerror = () => (cover.src = "img/placeholder.webp");

  hero.appendChild(cover);

  /* =========================
     BODY
  ========================= */
  const body = el("div", "month-body");

  /* ---- TÍTULOS: ENERO | EVENTOS ---- */
  const titles = el("div", "month-titles");
  const leftTitle = el("h2", "month-title", month.name);
  const rightTitle = el("h3", "events-title", "Eventos");

  titles.appendChild(leftTitle);
  titles.appendChild(rightTitle);

  /* ---- CONTENIDO: CALENDARIO | LISTA ---- */
  const content = el("div", "month-content");

  const left = el("div", "month-left");
  const right = el("div", "month-right");

  // Calendario grande
  const big = monthGrid(data.year, month, "big");
  big.classList.add("big-grid");
  left.appendChild(big);

  // Lista de eventos
  const list = el("ul", "events-list");
  const ordered = [...(month.events || [])].sort((a, b) => a.date.localeCompare(b.date));

  if (ordered.length === 0) {
    list.appendChild(el("li", "empty", "Sin eventos 💤"));
  } else {
    ordered.forEach(ev => {
      const li = el("li", "event-row");

      // Fecha: "Enero 01"
      const day = ev.date.slice(8, 10);
      const dateCell = el("div", "event-date", `${month.name} ${day}`);

      // Título
      const titleCell = el("div", "event-title", ev.title);

      // Icono según tag
      const tagNorm = (ev.tag || "").toLowerCase();
      let icon = "📌";
      if (tagNorm.includes("feriado")) icon = "🦙";
      else if (tagNorm.includes("cumple")) icon = "🎂";

      const iconCell = el("div", "event-icon", icon);
      iconCell.title = ev.tag || "Evento";

      li.appendChild(dateCell);
      li.appendChild(titleCell);
      li.appendChild(iconCell);

      list.appendChild(li);
    });
  }

  right.appendChild(list);

  content.appendChild(left);
  content.appendChild(right);

  body.appendChild(titles);
  body.appendChild(content);

  /* =========================
     ENSAMBLADO FINAL
  ========================= */
  container.appendChild(hero);
  container.appendChild(body);
  yearView.appendChild(container);

  enableSwipeForMonth(container, month.id);

}

function enableSwipeForMonth(container, monthId) {
  let startX = 0;
  let startY = 0;
  let isTracking = false;

  const THRESHOLD = 60;   // px para considerar swipe
  const RESTRAINT = 80;   // tolerancia vertical

  container.addEventListener("touchstart", (e) => {
    const t = e.changedTouches[0];
    startX = t.clientX;
    startY = t.clientY;
    isTracking = true;
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    if (!isTracking) return;
    isTracking = false;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // Si se movió mucho vertical, no es swipe horizontal
    if (Math.abs(dy) > RESTRAINT) return;

    // Swipe derecha (dx > 0) => mes anterior
    if (dx > THRESHOLD && monthId > 1) {
      location.hash = `#month/${monthId - 1}`;
    }

    // Swipe izquierda (dx < 0) => mes siguiente
    if (dx < -THRESHOLD && monthId < 12) {
      location.hash = `#month/${monthId + 1}`;
    }
  }, { passive: true });
}


function route(data) {
  const hash = location.hash || "#year";

  if (hash.startsWith("#month/")) {
    const id = Number(hash.split("/")[1]);
    renderMonth(data, id);
  } else {
    renderYear(data);
  }
}

async function main() {
  const res = await fetch("./events.json");
  if (!res.ok) throw new Error("No se pudo cargar events.json: " + res.status);

  const data = await res.json();

  window.addEventListener("hashchange", () => route(data));

  // default
  if (!location.hash) location.hash = "#year";
  route(data);
}

main().catch(err => {
  console.error(err);
  alert("Algo falló, revisar la consola (F12).");
});
