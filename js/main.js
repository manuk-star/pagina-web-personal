const cursor = document.querySelector(".cursor");
const isEnglish = document.documentElement.lang === "en";
const iconSprite = isEnglish ? "../img/icons.svg" : "img/icons.svg";
const themeBtn = document.querySelector(".nav__theme");

const lastModified = document.getElementById("last-modified");
if (lastModified) {
  lastModified.setAttribute("datetime", "2026-11-12");
  lastModified.textContent = isEnglish ? "12 November 2026" : "12 de noviembre de 2026";
}

function setThemeIcon(theme) {
  const icon = themeBtn?.querySelector("use");
  if (icon) icon.setAttribute("href", `${iconSprite}#${theme === "light" ? "moon" : "sun"}`);
}

function setThemeLabel(theme) {
  if (!themeBtn) return;
  themeBtn.setAttribute("aria-label", theme == "light" ? (isEnglish ? "Enable dark mode" : "Activar modo oscuro")
  : (isEnglish ? "Enable light mode" : "Activar modo claro"));
  themeBtn.setAttribute("aria-pressed", theme == "light" ? "true" : "false");
}

if (cursor) {
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
  }, 530);
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
  setThemeLabel(savedTheme);
  setThemeIcon(savedTheme);
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setThemeIcon(next);
    setThemeLabel(next);
  });
}

const toggle = document.querySelector(".nav__toggle");
const navLinks = document.querySelector(".nav__links");

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("nav__links--open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open
      ? (isEnglish ? "Close menu" : "Cerrar menú")
      : (isEnglish ? "Open menu" : "Abrir menú"));
  });
}

const portrait = document.querySelector(".hero__portrait");
const portraitImage = portrait?.querySelector("img");
const portraitCanvas = portrait?.querySelector("canvas");

if (portrait && portraitImage && portraitCanvas) {
  const context = portraitCanvas.getContext("2d", { willReadFrequently: true });

  if (context) {
    const processPortrait = () => {
      const width = 360;
      const height = 440;

      portraitCanvas.width = width;
      portraitCanvas.height = height;

      const scale = Math.max(
        width / portraitImage.naturalWidth,
        height / portraitImage.naturalHeight
      );

      const sourceWidth = width / scale;
      const sourceHeight = height / scale;
      const sourceX = (portraitImage.naturalWidth - sourceWidth) / 2;
      const sourceY = (portraitImage.naturalHeight - sourceHeight) / 2;

      context.drawImage(
        portraitImage,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, width, height
      );

      const imageData = context.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const luminance =
          0.299 * pixels[i] +
          0.587 * pixels[i + 1] +
          0.114 * pixels[i + 2];

        const contrast = Math.max(0, Math.min(255, (luminance - 128) * 1.35 + 128));

        pixels[i] = contrast * 0.08;
        pixels[i + 1] = contrast * 0.92;
        pixels[i + 2] = contrast * 0.18;
      }

      context.putImageData(imageData, 0, 0);
      portrait.classList.add("hero__portrait--processed");
    };

    portraitImage.addEventListener("load", processPortrait);

    if (portraitImage.complete && portraitImage.naturalWidth > 0) {
      processPortrait();
    }
  }
}

// =====================
// Buscador
// =====================

const SEARCH_INDEX = [
  { title: "Inicio", url: "index.html", lang: "es", keywords: "Manuel Ignacio Olan Máster Ingeniería Web whoami presentación personal" },
  { title: "Sobre mí", url: "sobre-mi.html", lang: "es", keywords: "sobre mí ingeniero infraestructura nube AWS DevOps UNAM Guadalajara México España viajes fútbol música tequila Puebla CONTPAQi FinOps" },
  { title: "Galería", url: "galeria.html", lang: "es", keywords: "galería fotos viajes Barcelona Berlín París Londres Praga Múnich Bruselas Colonia Luxemburgo Machu Picchu Medellín Bogotá Guadalajara Guanajuato UNAM Eindhoven Maastricht Cartagena" },
  { title: "Mis gustos", url: "gustos.html", lang: "es", keywords: "gustos tecnología AWS Azure servidores Apple cine Harry Potter Toy Story estilo vida café zapatillas música viajes fútbol PSG Barcelona Pumas comida autos podcast vídeo" },
  { title: "Contacto", url: "contacto.html", lang: "es", keywords: "contacto correo teléfono ubicación España LinkedIn GitHub Instagram referencias" },
  { title: "Home", url: "index.html", lang: "en", keywords: "Manuel Ignacio Olan Master Web Engineering whoami personal introduction" },
  { title: "About me", url: "sobre-mi.html", lang: "en", keywords: "about me cloud infrastructure engineer AWS DevOps UNAM Guadalajara Mexico Spain travel football music tequila Puebla CONTPAQi FinOps" },
  { title: "Gallery", url: "galeria.html", lang: "en", keywords: "gallery travel photos Barcelona Berlin Paris London Prague Munich Brussels Cologne Luxembourg Machu Picchu Medellin Bogota Guadalajara Guanajuato UNAM Eindhoven Maastricht Cartagena" },
  { title: "Interests", url: "gustos.html", lang: "en", keywords: "interests technology AWS Azure servers Apple movies Harry Potter Toy Story lifestyle coffee sneakers music travel football PSG Barcelona Pumas food cars podcast video" },
  { title: "Contact", url: "contacto.html", lang: "en", keywords: "contact email phone location Spain LinkedIn GitHub Instagram references" },
];

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

// =====================
// Resaltado por ?q=
// =====================

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

// =====================
// Galería
// =====================

const gallery = document.querySelector(".galeria-grid");
const loadMore = document.querySelector(".galeria-mas");
const galleryDialog = document.querySelector("[data-gallery-dialog]");

if (gallery && galleryDialog) {
  const dialogImage = galleryDialog.querySelector("[data-gallery-dialog-image]");
  const dialogTitle = galleryDialog.querySelector("[data-gallery-dialog-title]");
  const dialogCaption = galleryDialog.querySelector("[data-gallery-dialog-caption]");
  const closeDialog = galleryDialog.querySelector("[data-gallery-close]");

  gallery.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-gallery-open]");
    if (!openButton) return;

    const image = openButton.querySelector("img");
    const caption = image.dataset.imageAlt;
    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = caption;
    dialogTitle.textContent = isEnglish
      ? `Enlarged photo: ${caption}`
      : `Fotografía ampliada: ${caption}`;
    dialogCaption.textContent = caption;
    galleryDialog.showModal();
    closeDialog.focus();
  });

  closeDialog.addEventListener("click", () => galleryDialog.close());

  galleryDialog.addEventListener("click", (event) => {
    if (event.target === galleryDialog) galleryDialog.close();
  });
}

if (gallery && loadMore) {
  const cards = Array.from(gallery.querySelectorAll("figure"));
  const button = loadMore.querySelector("[data-gallery-more]");
  const buttonLabel = button.querySelector("[data-gallery-more-label]");
  const buttonIcon = button.querySelector("[data-gallery-more-icon] use");
  const status = document.querySelector("[data-gallery-status]");
  const batchSize = 6;
  let visibleCount = Math.min(batchSize, cards.length);

  function updateGallery() {
    cards.forEach((card, index) => {
      card.hidden = index >= visibleCount;
    });
    loadMore.hidden = cards.length <= batchSize;
    const showingAll = visibleCount >= cards.length;
    buttonLabel.textContent = showingAll
      ? (isEnglish ? "Show fewer" : "Mostrar menos")
      : (isEnglish ? "Show more" : "Mostrar más");
    buttonIcon.setAttribute("href", `${iconSprite}#${showingAll ? "caret-up" : "caret-down"}`);
    status.textContent = isEnglish
      ? `Showing ${visibleCount} of ${cards.length} destinations.`
      : `Se muestran ${visibleCount} de ${cards.length} destinos.`;
  }

  button.addEventListener("click", () => {
    visibleCount = visibleCount >= cards.length
      ? Math.min(batchSize, cards.length)
      : Math.min(visibleCount + batchSize, cards.length);
    updateGallery();
  });

  updateGallery();
}
