const track = document.querySelector(".carrusel__track");
const imgs = Array.from(track.children);
const prev = document.querySelector(".carrusel__btn--prev");
const next = document.querySelector(".carrusel__btn--next");

let current = 0;

function update() {
  imgs.forEach((img, i) => {
    const offset = i - current;
    img.style.transform = `translateX(${offset * 110}%) scale(${offset === 0 ? 1 : 0.75}) rotateY(${offset * -25}deg)`;
    img.style.opacity = Math.abs(offset) > 2 ? "0" : offset === 0 ? "1" : "0.5";
    img.style.zIndex = offset === 0 ? "1" : "0";
  });
}

prev.addEventListener("click", () => {
  current = current > 0 ? current - 1 : imgs.length - 1;
  update();
});

next.addEventListener("click", () => {
  current = current < imgs.length - 1 ? current + 1 : 0;
  update();
});

update();
