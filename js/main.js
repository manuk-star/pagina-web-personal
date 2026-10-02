const cursor = document.querySelector(".cursor");

if (cursor) {
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
  }, 530);
}

const toggle = document.querySelector(".nav__toggle");
const navLinks = document.querySelector(".nav__links");

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("nav__links--open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
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
