import { getSession, clearSession } from "../auth/session.js";
import { getProfile } from "../api/profile.js";

const SVG_NS = "http://www.w3.org/2000/svg";

// Navigation Helpers

function createNavLink(href, label, className) {
  const link = document.createElement("a");

  link.href = href;
  link.textContent = label;
  link.className = className;

  return link;
}

function createIcon(paths) {
  const icon = document.createElementNS(SVG_NS, "svg");

  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("aria-hidden", "true");

  icon.classList.add("size-6");

  paths.forEach((pathData) => {
    const path = document.createElementNS(SVG_NS, "path");

    path.setAttribute("d", pathData);
    icon.append(path);
  });

  return icon;
}

function createBellIcon() {
  return createIcon([
    "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9",
    "M10 21h4",
  ]);
}

function createProfileIcon() {
  return createIcon([
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    "M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    "M6 20a6 6 0 0 1 12 0",
  ]);
}

// Authentication Navigation

export function initAuthNavigation() {
  const desktopActions = document.querySelector(".nav-actions");
  const mobileMenu = document.querySelector("#mobile-menu ul");
  const menuToggle = document.querySelector(".menu-toggle");

  if (!desktopActions || !mobileMenu || !menuToggle) {
    return;
  }

  let profileButton = null;
  let profileMenu = null;
  let profileWrapper = null;

  // Mobile Credits

  const mobileCredits = document.createElement("span");

  mobileCredits.className = "auth-credits auth-credits-mobile";

  mobileCredits.setAttribute("aria-live", "polite");
  mobileCredits.hidden = true;

  menuToggle.before(mobileCredits);

  // Mobile Navigation

  const mobileGuestLinks = [
    ...mobileMenu.querySelectorAll('a[href="/login"], a[href="/register"]'),
  ];

  const mobileLogoutItem = document.createElement("li");
  const mobileLogoutButton = document.createElement("button");

  mobileLogoutButton.type = "button";
  mobileLogoutButton.className = "auth-mobile-logout";
  mobileLogoutButton.textContent = "Log out";

  mobileLogoutItem.append(mobileLogoutButton);
  mobileMenu.append(mobileLogoutItem);

  // Profile Menu

  function closeProfileMenu() {
    if (!profileButton || !profileMenu) {
      return;
    }

    profileMenu.hidden = true;
    profileButton.setAttribute("aria-expanded", "false");
  }

  // Log Out

  function logOut() {
    closeProfileMenu();
    clearSession();

    const mobileNavigation = document.querySelector("#mobile-menu");

    if (mobileNavigation?.classList.contains("is-open")) {
      document.querySelector(".mobile-menu-close")?.click();
    }
  }

  mobileLogoutButton.addEventListener("click", logOut);

  // Update Navigation

  function updateNavigation() {
    const session = getSession();
    const isLoggedIn = Boolean(session?.accessToken);

    profileButton = null;
    profileMenu = null;
    profileWrapper = null;

    // Mobile State

    mobileCredits.hidden = !isLoggedIn;
    mobileCredits.textContent = isLoggedIn ? "Loading credits..." : "";

    mobileGuestLinks.forEach((link) => {
      link.parentElement.hidden = isLoggedIn;
    });

    mobileLogoutItem.hidden = !isLoggedIn;

    // Guest Navigation

    if (!isLoggedIn) {
      desktopActions.replaceChildren(
        createNavLink("/login", "Log in", "btn btn-outline-light"),
        createNavLink("/register", "Register", "btn btn-cta"),
      );

      return;
    }

    // Desktop Credits

    const creditsBadge = document.createElement("span");

    creditsBadge.className = "auth-credits";
    creditsBadge.textContent = "Loading credits...";

    // Notifications

    const notificationButton = document.createElement("button");

    notificationButton.type = "button";
    notificationButton.className = "auth-icon-button";

    notificationButton.setAttribute(
      "aria-label",
      "Notifications (coming soon)",
    );

    notificationButton.title = "Notifications coming soon";
    notificationButton.disabled = true;

    notificationButton.append(createBellIcon());

    // Profile Button

    profileWrapper = document.createElement("div");
    profileWrapper.className = "auth-profile-wrapper";

    profileButton = document.createElement("button");
    profileButton.type = "button";
    profileButton.className = "auth-icon-button";

    profileButton.setAttribute("aria-label", "Open profile menu");

    profileButton.setAttribute("aria-expanded", "false");
    profileButton.setAttribute("aria-controls", "auth-profile-menu");

    profileButton.append(createProfileIcon());

    // Profile Dropdown

    profileMenu = document.createElement("div");

    profileMenu.id = "auth-profile-menu";
    profileMenu.className = "auth-profile-menu";

    profileMenu.setAttribute("role", "group");
    profileMenu.setAttribute("aria-label", "Profile actions");

    profileMenu.hidden = true;

    const username = document.createElement("p");

    username.className = "auth-profile-name";
    username.textContent = session.name || "Student";

    const profileItem = createNavLink(
      "/profile",
      "My profile",
      "auth-profile-action block",
    );

    profileItem.addEventListener("click", closeProfileMenu);

    const logoutButton = document.createElement("button");

    logoutButton.type = "button";
    logoutButton.className = "auth-profile-action";
    logoutButton.textContent = "Log out";

    logoutButton.addEventListener("click", logOut);

    profileMenu.append(username, profileItem, logoutButton);

    profileWrapper.append(profileButton, profileMenu);

    // Toggle Profile Menu

    profileButton.addEventListener("click", () => {
      const shouldOpen = profileMenu.hidden;

      profileMenu.hidden = !shouldOpen;

      profileButton.setAttribute("aria-expanded", String(shouldOpen));
    });

    desktopActions.replaceChildren(
      creditsBadge,
      notificationButton,
      profileWrapper,
    );

    // Load Credits Once

    getProfile()
      .then((profile) => {
        if (
          !creditsBadge.isConnected ||
          getSession()?.accessToken !== session.accessToken
        ) {
          return;
        }

        const creditsText = Number.isFinite(profile.credits)
          ? `${new Intl.NumberFormat("nb-NO").format(profile.credits)} credits`
          : "Credits unavailable";

        creditsBadge.textContent = creditsText;
        mobileCredits.textContent = creditsText;
      })
      .catch((error) => {
        if (
          !creditsBadge.isConnected ||
          getSession()?.accessToken !== session.accessToken
        ) {
          return;
        }

        console.error("Could not load credits:", error);

        creditsBadge.textContent = "Credits unavailable";
        mobileCredits.textContent = "Credits unavailable";
      });
  }

  // Close Profile Menu

  document.addEventListener("click", (event) => {
    if (
      profileWrapper &&
      event.target instanceof Node &&
      !profileWrapper.contains(event.target)
    ) {
      closeProfileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && profileMenu && !profileMenu.hidden) {
      closeProfileMenu();
      profileButton.focus();
    }
  });

  // Session Updates

  window.addEventListener("bidcamp:session-changed", updateNavigation);

  window.addEventListener("storage", updateNavigation);

  updateNavigation();
}
