export function initMobileMenu() {
  const menuButton = document.querySelector(".menu-toggle");
  const closeButton = document.querySelector(".mobile-menu-close");
  const mobileMenu = document.querySelector("#mobile-menu");

  if (!menuButton || !closeButton || !mobileMenu) return;

  mobileMenu.inert = true;

  function setMenuOpen(isOpen) {
    mobileMenu.classList.toggle("is-open", isOpen);
    mobileMenu.inert = !isOpen;

    menuButton.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      closeButton.focus();
    } else {
      menuButton.focus();
    }
  }

  menuButton.addEventListener("click", () => {
    setMenuOpen(true);
  });

  closeButton.addEventListener("click", () => {
    setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      setMenuOpen(false);
    }
  });
}
