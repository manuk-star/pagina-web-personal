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

## Índice (`SEARCH_INDEX`)

10 entradas: 5 en español (`lang: "es"`) y 5 en inglés (`lang: "en"`).  
Campos: `title`, `url`, `lang`, `keywords`.  
Las URLs son relativas a la raíz del sitio (`index.html`, `galeria.html`, etc.).  
Las páginas EN están en `/en/` — `main.js` añade el prefijo `../` automáticamente cuando `isEnglish` es `true`.

## Mantenimiento

Para añadir o modificar páginas, editar el array `SEARCH_INDEX` en `main.js`.  
No hay ningún archivo JSON externo que mantener.
