# Buscador del sitio

## Arquitectura

Búsqueda client-side sin dependencias externas. El índice está embebido directamente en `main.js` como constante `SEARCH_INDEX`, eliminando cualquier petición de red y haciendo la búsqueda instantánea.

## Flujo

1. El usuario abre el panel con el botón de la lupa en la navegación.
2. Al escribir (mínimo 2 caracteres), se filtra `SEARCH_INDEX` por `title` y `keywords`.
3. Cada resultado es un enlace a `pagina.html?q=termino`.
4. Al cargar la página destino, `main.js` lee `?q=`, recorre los nodos de texto de `<main>` con `TreeWalker` y envuelve las coincidencias en `<mark class="search-highlight">`. El primer resultado queda visible con `scrollIntoView`.

## Archivos implicados

- `js/main.js` — constante `SEARCH_INDEX`, lógica del panel, lógica de resaltado
- `css/main.css` — estilos `.search-panel`, `.search-panel__results mark`, `mark.search-highlight`
- Todos los HTML — botón `.nav__search-btn` y `<div id="search-panel">` en el `<header>`

---

## Código — HTML

Botón en `.nav__actions` dentro del `<nav>` de cada página:

```html
<button class="nav__search-btn" aria-label="Abrir buscador" aria-expanded="false" aria-controls="search-panel">
  <svg class="icon" aria-hidden="true" focusable="false">
    <use href="img/icons.svg#magnifying-glass"></use>
  </svg>
</button>
```

Panel entre `</nav>` y `</header>`:

```html
<div class="search-panel" id="search-panel" hidden>
  <div class="search-panel__inner">
    <label for="search-input" class="visually-hidden">Buscar en el sitio</label>
    <input class="search-panel__input" id="search-input" type="search" placeholder="Buscar..." autocomplete="off">
    <ul class="search-panel__results" role="listbox" aria-label="Resultados de búsqueda" aria-live="polite"></ul>
  </div>
</div>
```

En páginas EN (`/en/`) el `href` del icono usa `../img/icons.svg#magnifying-glass` y el label dice `"Search the site"`.

---

## Código — CSS

```css
.search-panel {
  position: fixed;
  top: var(--header-offset);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 99;
}

.search-panel[hidden] {
  display: none;
}

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

.search-panel__results li:hover {
  background: var(--color-bg);
}

.search-panel__results a {
  color: var(--color-text);
  text-decoration: none;
  display: block;
}

.search-panel__results a:hover {
  color: var(--color-accent);
}

/* Mark en resultados del panel */
.search-panel__results mark {
  background: transparent;
  color: var(--color-accent);
  font-weight: 700;
}

/* Mark en página destino tras navegar con ?q= */
mark.search-highlight {
  background: rgb(88 166 255 / 18%);
  color: var(--color-primary);
  border-radius: 2px;
  padding: 0 2px;
  font-weight: 700;
}
```

---

## Código — JavaScript

### Índice inline

```js
const SEARCH_INDEX = [
  { title: "Inicio", url: "index.html", lang: "es", keywords: "..." },
  // ... 10 entradas totales, 5 ES + 5 EN
];
```

### Panel — toggle, búsqueda, cierre

```js
const searchBtn = document.querySelector(".nav__search-btn");
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("search-input");
const searchResults = document.querySelector(".search-panel__results");

if (searchBtn && searchPanel && searchInput && searchResults) {
  const lang = isEnglish ? "en" : "es";
  const base = isEnglish ? "../" : "";
  const searchIndex = SEARCH_INDEX.filter(p => p.lang === lang);

  function sanitize(str) {
    return str.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
      const a = document.createElement("a");
      a.href = `${base}${page.url}?q=${encodeURIComponent(query)}`;
      a.innerHTML = highlight(sanitize(page.title), sanitize(query));
      li.appendChild(a);
      searchResults.appendChild(li);
    });
  }

  // Abrir/cerrar con botón
  searchBtn.addEventListener("click", () => {
    const isHidden = searchPanel.hidden;
    searchPanel.hidden = !isHidden;
    searchBtn.setAttribute("aria-expanded", String(!isHidden));
    if (isHidden) searchInput.focus();
  });

  // Buscar al escribir
  searchInput.addEventListener("input", () => runSearch(searchInput.value.trim()));

  // Cerrar con Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !searchPanel.hidden) {
      searchPanel.hidden = true;
      searchBtn.setAttribute("aria-expanded", "false");
      searchBtn.focus();
    }
  });

  // Cerrar al hacer click fuera
  document.addEventListener("click", e => {
    if (!searchPanel.hidden && !searchPanel.contains(e.target) && e.target !== searchBtn) {
      searchPanel.hidden = true;
      searchBtn.setAttribute("aria-expanded", "false");
    }
  });
}
```

### Resaltado en página destino (`?q=`)

```js
const qParam = new URLSearchParams(location.search).get("q");

if (qParam && qParam.length >= 2) {
  const mainEl = document.querySelector("main");
  if (mainEl) {
    const walker = document.createTreeWalker(mainEl, NodeFilter.SHOW_TEXT, {
      acceptNode: node => {
        const tag = node.parentElement?.tagName;
        if (["SCRIPT", "STYLE", "MARK"].includes(tag)) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });

    const escaped = qParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    let firstMark = null;
    nodes.forEach(textNode => {
      if (!regex.test(textNode.nodeValue)) return;
      regex.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, match;
      while ((match = regex.exec(textNode.nodeValue)) !== null) {
        if (match.index > last) frag.appendChild(document.createTextNode(textNode.nodeValue.slice(last, match.index)));
        const mark = document.createElement("mark");
        mark.className = "search-highlight";
        mark.textContent = match[1];
        if (!firstMark) firstMark = mark;
        frag.appendChild(mark);
        last = match.index + match[1].length;
      }
      if (last < textNode.nodeValue.length) frag.appendChild(document.createTextNode(textNode.nodeValue.slice(last)));
      textNode.parentElement.replaceChild(frag, textNode);
    });

    if (firstMark) firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
```

---

## Índice (`SEARCH_INDEX`)

10 entradas: 5 en español (`lang: "es"`) y 5 en inglés (`lang: "en"`).  
Campos: `title`, `url`, `lang`, `keywords`.  
Las URLs son relativas a la raíz del sitio (`index.html`, `galeria.html`, etc.).  
Las páginas EN están en `/en/` — `main.js` añade el prefijo `../` automáticamente cuando `isEnglish` es `true`.

---

## Posicionamiento del panel

El panel usa `position: fixed` con `top: var(--header-offset)` (4.5rem) para aparecer justo debajo del header fijo. No usa `position: absolute` relativo al header porque el header tiene `overflow` y dimensiones que colapsaban el panel a `width: 0, height: 0`.

---

## Mantenimiento

Para añadir o modificar páginas, editar el array `SEARCH_INDEX` en `main.js`.  
No hay ningún archivo JSON externo que mantener.
