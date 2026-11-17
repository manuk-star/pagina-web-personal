# Trabajo II — Sitio web personal

**Manuel Ignacio Olan**  
Máster en Ingeniería Web — 2026

---

## Descripción

Sitio web personal desarrollado para el Máster en Ingeniería Web. Presenta información sobre el autor, sus intereses, una galería de fotos, contenido multimedia y una página de contacto. El diseño está inspirado en la estética de una terminal Linux: colores oscuros, tipografía monoespaciada y detalles visuales de consola.

## Estructura

```text
/
├── index.html
├── sobre-mi.html
├── galeria.html
├── gustos.html
├── contacto.html
├── mapa-del-sitio.html
│
├── en/                  ← versión en inglés
│
├── css/
│   └── main.css
│
├── js/
│   └── main.js
│
├── img/
│
└── media/
    ├── video.mp4
    └── podcast.mp3
```

## Tecnologías

El sitio usa HTML5, CSS3 y JavaScript puro, sin frameworks ni librerías externas. La idea es trabajar directamente con las tecnologías base de la web.

- **HTML5** — estructura semántica con `header`, `nav`, `main`, `section`, `footer`, `figure`, `address`, `video` y `audio`.
- **CSS3** — variables, Flexbox, Grid, media queries y diseño responsive.
- **JavaScript** — un único archivo `main.js` que gestiona el menú responsive, el cursor parpadeante, el buscador, la galería y el procesado de la foto de portada con Canvas.

## Páginas

- **Inicio** — presentación con el comando `$ whoami`, cursor parpadeante y foto procesada con Canvas.
- **Sobre mí** — información personal dentro de una interfaz inspirada en el editor GNU nano.
- **Galería** — fotos de viajes en cuadrícula, con botón «Mostrar más» y lightbox.
- **Gustos** — intereses personales con listas, vídeo y audio nativos.
- **Contacto** — datos de contacto con `<address>` y redes sociales.
- **Mapa del sitio** — índice de todas las páginas.

Todas las páginas tienen su versión en inglés dentro de `/en/`.

## Buscador

El buscador está integrado en la barra de navegación. Al escribir, hace fetch del HTML real de cada página (lazy, con caché) y busca en el título, las keywords y el contenido de `<main>`. Normaliza acentos con NFD para que «galería» y «galeria» den el mismo resultado. Al hacer clic en un resultado, navega a la página y resalta las coincidencias en el texto.

## Responsive

En pantallas pequeñas el menú se colapsa y se abre con un botón. La foto de portada pasa debajo del texto. El botón mantiene `aria-expanded` actualizado.

## Cómo ejecutarlo

No hay dependencias ni proceso de compilación. Basta con abrir los archivos con un servidor local (por ejemplo `npx serve` o la extensión Live Server de VS Code). Las rutas son todas relativas, así que la estructura de carpetas debe mantenerse.

## URL

[manuk-star.github.io/pagina-web-personal](https://manuk-star.github.io/pagina-web-personal/)

## Autor

Manuel Ignacio Olan — Máster en Ingeniería Web, 2026
