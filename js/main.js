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

if (cursor) {
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
  }, 530);
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
  if (themeBtn) themeBtn.setAttribute("aria-label", savedTheme === "light"
    ? (isEnglish ? "Enable dark mode" : "Activar modo oscuro")
    : (isEnglish ? "Enable light mode" : "Activar modo claro"));
  setThemeIcon(savedTheme);
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setThemeIcon(next);
    themeBtn.setAttribute("aria-label", next === "light"
      ? (isEnglish ? "Enable dark mode" : "Activar modo oscuro")
      : (isEnglish ? "Enable light mode" : "Activar modo claro"));
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
const portraitCanvas = document.querySelector("#perfil-terminal");

if (portrait && portraitImage && portraitCanvas) {
  const context = portraitCanvas.getContext("2d");

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
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height
      );

      const imageData = context.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const luminance =
          0.299 * pixels[i] +
          0.587 * pixels[i + 1] +
          0.114 * pixels[i + 2];

        const contrast = Math.max(
          0,
          Math.min(255, (luminance - 128) * 1.35 + 128)
        );

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
    buttonIcon.setAttribute("href", `${iconSprite}#${showingAll ? "chevron-up" : "chevron-down"}`);
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
