const isEnglish = document.documentElement.lang === "en";
const cursor = document.querySelector(".cursor");

function normalizeSearchText(value) {
  const lang = document.documentElement.lang || "en";
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase(lang);
}
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
  themeBtn.setAttribute("aria-label", theme === "light" ? (isEnglish ? "Enable dark mode" : "Activar modo oscuro")
  : (isEnglish ? "Enable light mode" : "Activar modo claro"));
  themeBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
}

if (cursor && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
  }, 530);
}

function readSavedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // The selected theme still applies for this page if storage is unavailable.
  }
}

const savedTheme = readSavedTheme();

if (savedTheme === "light" || savedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", savedTheme);
  setThemeLabel(savedTheme);
  setThemeIcon(savedTheme);
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    saveTheme(next);
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

const searchBtn = document.querySelector(".nav__search-btn");
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("search-input");
const searchResults = document.querySelector(".search-panel__results");

if (searchBtn && searchPanel && searchInput && searchResults) {
  const lang = isEnglish ? "en" : "es";
  const base = isEnglish ? "../" : "";
  const pages = SEARCH_PAGES.filter(page => page.lang === lang);
  let pageContentPromise;
  let searchRequest = 0;

  function loadPageContent() {
    if (!pageContentPromise) {
      pageContentPromise = Promise.all(pages.map(async page => {
        try {
          const response = await fetch(base + page.url);
          if (!response.ok) return { ...page, content: "" };
          const html = await response.text();
          const pageDocument = new DOMParser().parseFromString(html, "text/html");
          return { ...page, content: pageDocument.querySelector("main")?.textContent || "" };
        } catch {
          return { ...page, content: "" };
        }
      }));
    }
    return pageContentPromise;
  }

  function showMessage(message) {
    const item = document.createElement("li");
    item.textContent = message;
    searchResults.replaceChildren(item);
  }

  async function runSearch(query) {
    const request = ++searchRequest;
    searchResults.replaceChildren();
    if (query.length < 2) return;

    showMessage(isEnglish ? "Searching…" : "Buscando…");
    const indexedPages = await loadPageContent();
    if (request !== searchRequest) return;

    const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);
    const matches = indexedPages.filter(page => {
      const text = normalizeSearchText(page.title + " " + page.keywords + " " + page.content);
      return words.every(word => text.includes(word));
    });

    if (matches.length === 0) {
      showMessage(isEnglish ? "No results found" : "Sin resultados");
      return;
    }

    const fragment = document.createDocumentFragment();
    matches.forEach(page => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = base + page.url + "?q=" + encodeURIComponent(query);
      link.textContent = page.title;
      item.appendChild(link);
      fragment.appendChild(item);
    });
    searchResults.replaceChildren(fragment);
  }

  searchBtn.addEventListener("click", () => {
    const open = searchPanel.hidden;
    searchPanel.hidden = !open;
    searchBtn.setAttribute("aria-expanded", String(open));
    if (open) searchInput.focus();
  });

  searchInput.addEventListener("input", () => runSearch(searchInput.value.trim()));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !searchPanel.hidden) {
      searchPanel.hidden = true;
      searchBtn.setAttribute("aria-expanded", "false");
      searchBtn.focus();
    }
  });

  document.addEventListener("click", event => {
    if (!searchPanel.hidden && !searchPanel.contains(event.target) && !searchBtn.contains(event.target)) {
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

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    const normalizedQuery = normalizeSearchText(qParam);
    let firstMark = null;

    nodes.forEach(textNode => {
      const originalText = textNode.nodeValue;
      const offsets = [];
      let normalizedText = "";
      let originalOffset = 0;

      for (const character of originalText) {
        const normalizedCharacter = normalizeSearchText(character);
        normalizedText += normalizedCharacter;
        for (let index = 0; index < normalizedCharacter.length; index += 1) {
          offsets.push({ start: originalOffset, end: originalOffset + character.length });
        }
        originalOffset += character.length;
      }

      const ranges = [];
      let searchFrom = 0;
      let matchIndex = normalizedText.indexOf(normalizedQuery, searchFrom);
      while (matchIndex !== -1) {
        const firstOffset = offsets[matchIndex];
        const lastOffset = offsets[matchIndex + normalizedQuery.length - 1];
        if (firstOffset && lastOffset) ranges.push({ start: firstOffset.start, end: lastOffset.end });
        searchFrom = matchIndex + normalizedQuery.length;
        matchIndex = normalizedText.indexOf(normalizedQuery, searchFrom);
      }

      if (ranges.length === 0) return;

      const frag = document.createDocumentFragment();
      let last = 0;
      ranges.forEach(range => {
        if (range.start > last) frag.appendChild(document.createTextNode(originalText.slice(last, range.start)));
        const mark = document.createElement("mark");
        mark.className = "search-highlight";
        mark.textContent = originalText.slice(range.start, range.end);
        if (!firstMark) firstMark = mark;
        frag.appendChild(mark);
        last = range.end;
      });
      if (last < originalText.length) frag.appendChild(document.createTextNode(originalText.slice(last)));
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
