# Buscador del sitio

## Objetivo y decisiones

El buscador funciona en el navegador con JavaScript nativo, sin bibliotecas ni servicios externos. Se eligió esta solución porque el sitio es estático y no necesita un servidor de búsqueda ni una compilación.

La búsqueda combina el texto real del elemento `<main>` de las páginas con una lista breve de términos de respaldo en `SEARCH_PAGES`. Así no hay que copiar manualmente todo el contenido a un índice; los términos adicionales ayudan con sinónimos y la lista sigue dando resultados si falla una petición.

## Flujo de búsqueda

1. La lupa abre el panel, actualiza `aria-expanded` y enfoca el campo.
2. A partir de dos caracteres, el script descarga las seis páginas del idioma actual. `DOMParser` extrae el texto de `<main>`.
3. Consulta y contenido se normalizan para ignorar mayúsculas y acentos. En una consulta de varias palabras, todas deben aparecer.
4. Los resultados se muestran como enlaces dentro de una lista HTML.
5. El enlace lleva la consulta en `?q=`. La página destino recorre el texto de `<main>`, marca coincidencias con `<mark>` y desplaza la vista a la primera.
6. Escape cierra el panel y devuelve el foco a la lupa; un clic fuera también lo cierra.

El texto se carga bajo demanda y la promesa `pageContentPromise` conserva el resultado en memoria. Al seguir escribiendo no se repiten las seis peticiones. Si `fetch` falla, se puede buscar todavía por título y palabras clave. Al abrir directamente mediante `file://` el navegador puede bloquear `fetch`; el sitio publicado debe servirse por HTTP/HTTPS para buscar el texto completo.

## HTML

Cada página contiene el botón y el panel. La etiqueta asociada nombra el campo; `aria-live="polite"` anuncia las actualizaciones, y `aria-expanded` informa el estado del panel.

```html
<button class="nav__search-btn"
        aria-label="Abrir buscador"
        aria-expanded="false"
        aria-controls="search-panel">
  <svg class="icon" aria-hidden="true" focusable="false">
    <use href="img/icons.svg#magnifying-glass"></use>
  </svg>
</button>

<div class="search-panel" id="search-panel" hidden>
  <div class="search-panel__inner">
    <label for="search-input" class="visually-hidden">Buscar en el sitio</label>
    <input class="search-panel__input" id="search-input"
           type="search" placeholder="Buscar..." autocomplete="off">
    <ul class="search-panel__results"
        aria-label="Resultados de búsqueda" aria-live="polite"></ul>
  </div>
</div>
```

En las páginas de `/en/`, el texto accesible va en inglés y el icono apunta a `../img/icons.svg`. Los resultados son enlaces dentro de una lista; por eso el `<ul>` no lleva `role="listbox"`.

## Catálogo

`SEARCH_PAGES` contiene seis entradas por idioma: título, ruta relativa, idioma y palabras clave. El prefijo `../` se aplica desde las páginas inglesas.

```js
const SEARCH_PAGES = [
  { title: "Inicio", url: "index.html", lang: "es", keywords: "Manuel Ignacio Olan Máster Ingeniería Web presentación personal" },
  { title: "Sobre mí", url: "sobre-mi.html", lang: "es", keywords: "ingeniero infraestructura nube AWS DevOps UNAM Guadalajara México España viajes fútbol música" },
  { title: "Galería", url: "galeria.html", lang: "es", keywords: "fotos viajes Barcelona Berlín París Londres Praga Múnich Machu Picchu Medellín Bogotá" },
  { title: "Mis gustos", url: "gustos.html", lang: "es", keywords: "tecnología AWS Azure servidores Apple cine Harry Potter música viajes fútbol comida" },
  { title: "Contacto", url: "contacto.html", lang: "es", keywords: "correo teléfono ubicación LinkedIn GitHub Instagram" },
  { title: "Mapa del sitio", url: "mapa-del-sitio.html", lang: "es", keywords: "navegación páginas" },
  { title: "Home", url: "index.html", lang: "en", keywords: "Manuel Ignacio Olan Master Web Engineering personal introduction" },
  { title: "About me", url: "sobre-mi.html", lang: "en", keywords: "cloud infrastructure engineer AWS DevOps UNAM Guadalajara Mexico Spain travel football music" },
  { title: "Gallery", url: "galeria.html", lang: "en", keywords: "travel photos Barcelona Berlin Paris London Prague Munich Machu Picchu Medellin Bogota" },
  { title: "Interests", url: "gustos.html", lang: "en", keywords: "technology AWS Azure servers Apple movies Harry Potter music travel football food" },
  { title: "Contact", url: "contacto.html", lang: "en", keywords: "email phone location LinkedIn GitHub Instagram" },
  { title: "Site map", url: "mapa-del-sitio.html", lang: "en", keywords: "navigation pages" },
];
```

Al añadir una página, agrega una entrada por cada idioma disponible y los términos alternativos que ayuden a encontrarla.

## Normalización y búsqueda

La normalización Unicode descompone caracteres acentuados y elimina sus marcas; así `busqueda` coincide con `búsqueda`.

```js
function normalizeSearchText(value) {
  const lang = document.documentElement.lang || "en";
  return value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase(lang);
}

const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);
const matches = indexedPages.filter(page => {
  const text = normalizeSearchText(
    page.title + " " + page.keywords + " " + page.content
  );
  return words.every(word => text.includes(word));
});
```

El mínimo de dos caracteres evita resultados poco útiles para consultas muy cortas. Todos los términos deben coincidir; pueden aparecer en cualquier parte del título, las palabras clave o el contenido.

Los enlaces se crean con la API del DOM y asignan el título con `textContent`. La consulta se agrega a la URL con `encodeURIComponent`. Esto evita interpretar el texto buscado como HTML y conserva espacios y caracteres especiales.

## Carga de páginas

```js
function loadPageContent() {
  if (!pageContentPromise) {
    pageContentPromise = Promise.all(pages.map(async page => {
      try {
        const response = await fetch(base + page.url);
        if (!response.ok) return { ...page, content: "" };

        const html = await response.text();
        const pageDocument = new DOMParser().parseFromString(html, "text/html");
        return {
          ...page,
          content: pageDocument.querySelector("main")?.textContent || "",
        };
      } catch {
        return { ...page, content: "" };
      }
    }));
  }
  return pageContentPromise;
}
```

Se lee solo `<main>` para excluir navegación y pie. Las peticiones se hacen en paralelo; los errores se aíslan por página para que una ruta que falle no cancele el índice completo.

## Resaltado en destino

`URLSearchParams` lee `q`. `TreeWalker` recorre nodos de texto de `<main>` y omite `script`, `style` y marcas ya creadas. Para que una búsqueda sin tilde resalte una palabra con tilde, el código relaciona el texto normalizado con las posiciones de los caracteres originales. Las marcas se crean con nodos DOM y mantienen intactos los acentos; no se inserta la consulta con `innerHTML`.

## Accesibilidad e interacción

- `aria-expanded` refleja el estado real del panel.
- El campo tiene una etiqueta asociada por `for` y `id`.
- Los resultados son enlaces HTML en una lista y se anuncian mediante `aria-live`.
- Escape cierra el panel y devuelve el foco al botón.
- El clic exterior comprueba `!searchBtn.contains(event.target)`. Se usa `contains` porque el destino puede ser el `<svg>` o `<use>` hijo de la lupa, y no el botón.

## Presentación y archivos

`css/main.css` define el panel fijo bajo la cabecera con `top: var(--header-offset)`, los resultados y `mark.search-highlight`. El atributo `hidden` oculta el panel cerrado. Se eligió `position: fixed` porque el encabezado también es fijo y el panel debe ocupar el ancho de la ventana, sin quedar recortado por el contenedor de navegación.

- `js/main.js`: catálogo, carga, normalización, filtrado, apertura/cierre y resaltado.
- `css/main.css`: panel, resultados y resaltado.
- Los doce HTML: botón y panel traducidos al idioma de cada página.

## Bug de apertura resuelto

Antes, el cierre por clic exterior comprobaba `event.target !== searchBtn`. Al pulsar la lupa, el evento suele tener como destino el `svg` o el `use` interno, así que el panel se cerraba inmediatamente. Ahora se comprueba si el destino está contenido dentro del botón y solo se cierra cuando el clic ocurre realmente fuera del panel y del botón.
