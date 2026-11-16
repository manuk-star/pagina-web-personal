# Buscador — Documentación

## Decisión de arquitectura

Se evaluaron tres opciones para implementar el buscador en el sitio estático:

| Opción | Descripción | Estado |
|---|---|---|
| **fetch + JSON** ✅ | Archivo `search-index.json` precargado al cargar la página, búsqueda instantánea en cliente | Elegida |
| Pagefind | Escanea el HTML y genera índice automáticamente | Descartada — latencia inaceptable en GitHub Pages en el primer fetch |
| Lunr.js | Índice construido en el navegador | Descartada — dependencia externa innecesaria para 10 páginas |

**fetch + JSON** es la solución correcta para este caso: 10 páginas, JSON de ~2kb, carga instantánea, búsqueda en cliente sin dependencias externas.

El JSON se precarga al cargar la página (no al abrir el panel), filtrando por idioma desde el inicio, por lo que cuando el usuario abre el buscador los resultados son inmediatos.

---

## Archivos

| Archivo | Cambio |
|---|---|
| `search-index.json` | Índice con 10 entradas (5 ES + 5 EN) |
| `img/icons.svg` | Icono `magnifying-glass` añadido |
| `css/main.css` | Estilos del panel y resultados |
| `js/main.js` | Lógica de fetch, búsqueda, highlight y toggle |
| 12 HTML | Botón `.nav__search-btn` y panel `#search-panel` |

---

## search-index.json

Campos por entrada:

```json
{
  "title": "Nombre de la página",
  "url": "ruta/relativa.html",
  "lang": "es",
  "keywords": "palabras clave separadas por espacios"
}
```

- `lang` puede ser `"es"` o `"en"`
- `url` es relativa a la raíz del sitio (sin `/`)
- Para añadir una página nueva, añadir una entrada al JSON

---

## HTML — estructura en cada página

En el nav, dentro de `.nav__actions`, después del botón de tema:

```html
<!-- ES -->
<button class="nav__search-btn" aria-label="Abrir buscador" aria-expanded="false" aria-controls="search-panel">
  <svg class="icon" aria-hidden="true" focusable="false">
    <use href="img/icons.svg#magnifying-glass"></use>
  </svg>
</button>

<!-- EN (desde /en/) -->
<button class="nav__search-btn" aria-label="Open search" aria-expanded="false" aria-controls="search-panel">
  <svg class="icon" aria-hidden="true" focusable="false">
    <use href="../img/icons.svg#magnifying-glass"></use>
  </svg>
</button>
```

Panel entre `</nav>` y `</header>`:

```html
<!-- ES -->
<div class="search-panel" id="search-panel" hidden>
  <div class="search-panel__inner">
    <label for="search-input" class="visually-hidden">Buscar en el sitio</label>
    <input class="search-panel__input" id="search-input" type="search" placeholder="Buscar..." autocomplete="off">
    <ul class="search-panel__results" role="listbox" aria-label="Resultados de búsqueda" aria-live="polite"></ul>
  </div>
</div>

<!-- EN -->
<div class="search-panel" id="search-panel" hidden>
  <div class="search-panel__inner">
    <label for="search-input" class="visually-hidden">Search the site</label>
    <input class="search-panel__input" id="search-input" type="search" placeholder="Search..." autocomplete="off">
    <ul class="search-panel__results" role="listbox" aria-label="Search results" aria-live="polite"></ul>
  </div>
</div>
```

---

## CSS — `main.css`

```css
.search-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 99;
}

.search-panel[hidden] { display: none; }

.search-panel__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.75rem var(--space-md);
}

.search-panel__input {
  width: 100%;
  padding: 0.55rem 0.9rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 0.95rem;
}

.search-panel__input:focus {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.search-panel__results {
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
}

.search-panel__results li {
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.search-panel__results li:hover { background: var(--color-bg); }

.search-panel__results a {
  color: var(--color-text);
  text-decoration: none;
  display: block;
}

.search-panel__results a:hover { color: var(--color-accent); }

.search-panel__results mark {
  background: transparent;
  color: var(--color-accent);
  font-weight: 700;
}
```

---

## JS — `main.js`

```js
const searchBtn = document.querySelector(".nav__search-btn");
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("search-input");
const searchResults = document.querySelector(".search-panel__results");

if (searchBtn && searchPanel && searchInput && searchResults) {
  const indexUrl = isEnglish ? "../search-index.json" : "search-index.json";
  const lang = isEnglish ? "en" : "es";
  let searchIndex = [];

  // Precarga el JSON al cargar la página — búsqueda instantánea al abrir el panel
  fetch(indexUrl)
    .then(r => r.json())
    .then(data => { searchIndex = data.filter(p => p.lang === lang); })
    .catch(() => {});

  function sanitize(str) {
    return str.replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function highlight(text, query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
  }

  function runSearch(query) {
    searchResults.innerHTML = "";
    if (query.length < 2) return;

    const q = query.toLowerCase();
    const matches = searchIndex.filter(p =>
      p.title.toLowerCase().includes(q) || p.keywords.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      const li = document.createElement("li");
      li.style.color = "var(--color-muted)";
      li.textContent = isEnglish ? "No results found" : "Sin resultados";
      searchResults.appendChild(li);
      return;
    }

    matches.forEach(page => {
      const li = document.createElement("li");
      const url = isEnglish ? `../${page.url}` : page.url;
      const a = document.createElement("a");
      a.href = url;
      a.innerHTML = highlight(sanitize(page.title), sanitize(query));
      li.appendChild(a);
      searchResults.appendChild(li);
    });
  }

  searchBtn.addEventListener("click", () => {
    const isHidden = searchPanel.hidden;
    searchPanel.hidden = !isHidden;
    searchBtn.setAttribute("aria-expanded", String(!isHidden));
    if (isHidden) searchInput.focus();
  });

  searchInput.addEventListener("input", () => runSearch(searchInput.value.trim()));

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !searchPanel.hidden) {
      searchPanel.hidden = true;
      searchBtn.setAttribute("aria-expanded", "false");
      searchBtn.focus();
    }
  });

  document.addEventListener("click", e => {
    if (!searchPanel.hidden && !searchPanel.contains(e.target) && e.target !== searchBtn) {
      searchPanel.hidden = true;
      searchBtn.setAttribute("aria-expanded", "false");
    }
  });
}
```

---

## Comportamiento

- El JSON se descarga al cargar la página, filtrado por idioma — cuando el usuario abre el panel la búsqueda es instantánea
- Busca en `title` y `keywords` de cada entrada
- Resalta las coincidencias con `<mark>` (color accent, sin fondo)
- El panel se cierra con `Escape` o click fuera
- El foco va al input al abrir y vuelve al botón al cerrar
- `aria-expanded` y `aria-live` mantienen la accesibilidad

---

## Mantenimiento

Si se añade una página nueva al sitio, añadir una entrada a `search-index.json`:

```json
{
  "title": "Título de la página",
  "url": "nueva-pagina.html",
  "lang": "es",
  "keywords": "palabras clave relevantes"
}
```

Y su equivalente en inglés con `"lang": "en"` y `"url": "en/nueva-pagina.html"`.
