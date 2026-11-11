# Trabajo II — Sitio web personal

**Manuel Ignacio Olan**  
Máster en Ingeniería Web — 2026

## 1. Descripción

Este proyecto consiste en un sitio web personal desarrollado como parte del Máster en Ingeniería Web.

El sitio presenta información personal, intereses, fotografías, vídeo y audio, además de una navegación entre diferentes páginas.

El diseño utiliza una estética inspirada en terminales Linux, manteniendo una estructura basada en estándares web y elementos HTML semánticos.

## 2. Estructura del proyecto

```text
/
├── index.html
├── sobre-mi.html
├── galeria.html
├── gustos.html
├── contacto.html
│
├── css/
│   └── main.css
│
├── js/
│   └── main.js
│
├── img/
│   └── imágenes utilizadas en el sitio
│
└── media/
    ├── video.mp4
    └── podcast.mp3
```

## 3. Tecnologías utilizadas

### HTML5

HTML5 define la estructura y el contenido del sitio.

Se utilizan elementos semánticos como `header`, `nav`, `main`, `section`, `footer`, `figure` y `address`, procurando que cada elemento represente correctamente el significado del contenido.

También se utilizan los elementos multimedia nativos `video` y `audio`.

La galería utiliza `figure` y `figcaption` para asociar cada fotografía con su título.

### CSS3

CSS3 define la presentación visual del sitio.

El diseño utiliza:

- Variables CSS.
- Flexbox.
- CSS Grid.
- Media queries.
- Selectores modernos.
- Diseño responsive.

La estética visual está inspirada en una interfaz de terminal Linux, con colores oscuros, tipografía monoespaciada y elementos visuales similares a una consola.

### JavaScript

JavaScript añade la interacción y el comportamiento dinámico del sitio.

Se utiliza `main.js` para el comportamiento común del sitio, como el menú responsive, el cursor parpadeante de la página principal y el procesamiento de la fotografía mediante Canvas.

La fotografía de la página principal se procesa mediante la API Canvas para generar una representación visual con el estilo de color de la interfaz terminal.

## 4. Justificación de las tecnologías

Se decidió utilizar HTML5, CSS3 y JavaScript sin frameworks ni bibliotecas externas porque el objetivo del proyecto es desarrollar directamente las funcionalidades utilizando las tecnologías fundamentales de la Web.

HTML5 permite crear una estructura semántica y accesible.

CSS3 permite separar la presentación del contenido y desarrollar un diseño responsive sin depender de frameworks externos.

JavaScript permite añadir interactividad manteniendo una implementación sencilla y adecuada para las necesidades del proyecto.

JavaScript se mantiene en un único archivo. En la galería, el botón «Mostrar más» revela las tarjetas por grupos.

## 5. Funcionamiento

### Página principal

La página principal presenta la identidad del autor y utiliza un cursor parpadeante junto al comando visual `$ whoami`.

También muestra una fotografía procesada mediante Canvas para integrarla visualmente con la estética de terminal.

### Sobre mí

La página contiene información personal y una fotografía presentada mediante `figure` y `figcaption`.

La información se muestra dentro de una interfaz visual inspirada en el editor de terminal GNU nano.

### Galería

La galería contiene fotografías de diferentes viajes organizadas en una cuadrícula de tarjetas adaptable.

Cada fotografía se encuentra dentro de un `figure` y dispone de un `figcaption`.

### Gustos

La página presenta diferentes intereses personales organizados mediante listas HTML.

También incorpora contenido multimedia mediante los elementos nativos `video` y `audio`, acompañados de sus correspondientes descripciones.

### Contacto

La página contiene información de contacto mediante el elemento `address`, incluyendo teléfono, correo electrónico y ubicación.

También contiene un apartado de redes sociales.

## 6. Diseño responsive

El sitio adapta su navegación y distribución al tamaño de la pantalla.

En dispositivos pequeños:

- Se muestra un botón para abrir el menú.
- La navegación pasa a una disposición vertical.
- El menú puede abrirse y cerrarse mediante JavaScript.
- La fotografía de la página principal pasa debajo del contenido textual.

El botón de navegación mantiene actualizado el atributo `aria-expanded` y su etiqueta accesible según el estado del menú.

## 7. Ejecución y despliegue

El proyecto está compuesto exclusivamente por archivos HTML, CSS, JavaScript, imágenes y recursos multimedia.

No se requieren dependencias externas ni un proceso de compilación para ejecutar el sitio.

Puede ejecutarse mediante un servidor web local o mediante un servidor de alojamiento web.

Las rutas utilizadas para hojas de estilo, scripts, imágenes y recursos multimedia son relativas a la estructura del proyecto.

## 8. Separación de responsabilidades

El proyecto mantiene una separación clara entre estructura, presentación y comportamiento:

- **HTML** define la estructura y el contenido.
- **CSS** define la presentación visual.
- **JavaScript** define la interacción y el comportamiento dinámico.
- **Canvas** se utiliza desde JavaScript para procesar la fotografía de la página principal.

No se utilizan frameworks ni bibliotecas externas.

## 9. Recursos

Los recursos utilizados por el sitio se mantienen dentro de las carpetas correspondientes:

- `img/`: fotografías.
- `media/`: vídeo y audio.
- `css/`: hojas de estilo.
- `js/`: código JavaScript.

Las rutas relativas permiten que el sitio pueda revisarse y ejecutarse localmente manteniendo la misma estructura.

## 10. URL de despliegue

URL:

## 11. Autor

**Manuel Ignacio Olan**

Máster en Ingeniería Web  
2026
