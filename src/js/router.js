import { createLoginPage } from "./pages/login.js";
import { createRegisterPage } from "./pages/register.js";
import { createProfilePage } from "./pages/profilePage.js";
import { getSession } from "./auth/session.js";

export function initRouter() {
  const homePage = document.querySelector("#home-page");
  const authPage = document.querySelector("#auth-page");

  if (!homePage || !authPage) return;

  const supportedPaths = ["/", "/explore", "/login", "/register", "/profile"];

  // Render Current Page

  function renderPage() {
    let path = window.location.pathname;

    // Protect Profile Page

    if (path === "/profile" && !getSession()?.accessToken) {
      window.history.replaceState({}, "", "/login");
      path = "/login";
    }

    const isLoginPage = path === "/login";
    const isRegisterPage = path === "/register";
    const isProfilePage = path === "/profile";

    const isDynamicPage = isLoginPage || isRegisterPage || isProfilePage;

    homePage.hidden = isDynamicPage;
    authPage.hidden = !isDynamicPage;

    // Render Page Content

    if (isLoginPage) {
      authPage.replaceChildren(createLoginPage());
    } else if (isRegisterPage) {
      authPage.replaceChildren(createRegisterPage());
    } else if (isProfilePage) {
      authPage.replaceChildren(createProfilePage());
    } else {
      authPage.replaceChildren();
    }

    // Update Active Navigation Link

    const navLinks = document.querySelectorAll(".site-header a[href]");

    navLinks.forEach((link) => {
      link.removeAttribute("aria-current");

      const linkPath = new URL(link.href).pathname;

      if (linkPath === path && !link.classList.contains("site-logo")) {
        link.setAttribute("aria-current", "page");
      }
    });

    // Update Document Title

    const pageTitles = {
      "/": "Online Auctions",
      "/explore": "Explore",
      "/login": "Log in",
      "/register": "Register",
      "/profile": "My Profile",
    };

    document.title = `BIDCAMP | ${pageTitles[path] || "Online Auctions"}`;
  }

  // SPA Link Navigation

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest("a[href]");

    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      link.hasAttribute("download") ||
      (link.target && link.target !== "_self")
    ) {
      return;
    }

    const url = new URL(link.href);

    if (
      url.origin !== window.location.origin ||
      !supportedPaths.includes(url.pathname)
    ) {
      return;
    }

    event.preventDefault();

    // Close Mobile Menu

    if (link.closest("#mobile-menu")) {
      document.querySelector(".mobile-menu-close")?.click();
    }

    // Navigate Without Reloading

    if (url.pathname !== window.location.pathname) {
      window.history.pushState({}, "", url.pathname);
      renderPage();
      window.scrollTo(0, 0);
    }
  });

  // Browser Back and Forward

  window.addEventListener("popstate", renderPage);

  // Protect Profile After Logout

  window.addEventListener("bidcamp:session-changed", () => {
    if (window.location.pathname === "/profile") {
      renderPage();
    }
  });

  window.addEventListener("storage", () => {
    if (window.location.pathname === "/profile") {
      renderPage();
    }
  });

  renderPage();
}
