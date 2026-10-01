const cursor = document.querySelector(".cursor");

if (cursor) {
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === "0" ? "1" : "0";
  }, 530);
}

const toggle = document.querySelector(".nav__toggle");
const navLinks = document.querySelector(".nav__links");

if (toggle) {
  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("nav__links--open");
    toggle.setAttribute("aria-expanded", open);
  });
}
