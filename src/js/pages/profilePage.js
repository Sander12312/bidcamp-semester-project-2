import { getProfile } from "../api/profile.js";

// Element Helper

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

// Profile Avatar

function createProfileAvatar(profile) {
  const fallback = createElement(
    "div",
    "profile-avatar profile-avatar-fallback",
    profile.name?.charAt(0).toUpperCase() || "?",
  );

  if (!profile.avatar?.url) {
    return fallback;
  }

  const image = document.createElement("img");
  image.className = "profile-avatar";
  image.src = profile.avatar.url;
  image.alt = profile.avatar.alt || `Profile picture of ${profile.name}`;

  image.addEventListener("error", () => image.replaceWith(fallback), {
    once: true,
  });

  return image;
}

// Profile Header

function createProfileHeader(profile) {
  const layout = createElement("div", "profile-layout");

  // Banner

  const banner = createElement("div", "profile-banner");

  const bannerImage = document.createElement("img");

  bannerImage.className = "profile-banner-image";
  bannerImage.src = "/images/background.png";
  bannerImage.alt = "Sunset over a rocky coastline";

  banner.append(bannerImage);

  const bannerContent = createElement("div", "profile-banner-content");

  const avatar = createProfileAvatar(profile);

  const bannerIdentity = createElement("div", "profile-banner-identity");

  const mobileName = createElement(
    "span",
    "profile-banner-name",
    profile.name || "Student",
  );

  const editButton = createElement(
    "button",
    "profile-edit-button",
    "Edit profile",
  );

  editButton.type = "button";
  editButton.disabled = true;
  editButton.title = "Profile editing is coming soon";

  bannerIdentity.append(mobileName, editButton);
  bannerContent.append(avatar, bannerIdentity);
  banner.append(bannerContent);

  // Profile Overview

  const overview = createElement("div", "profile-overview");

  const about = createElement("div", "profile-about");

  const desktopName = createElement(
    "h2",
    "profile-name",
    profile.name || "Student",
  );

  const bio = createElement(
    "p",
    "profile-bio",
    profile.bio?.trim() || "No bio added yet.",
  );

  about.append(desktopName, bio);

  // Credit Score

  const creditPanel = createElement("div", "profile-credit-panel");

  const creditTitle = createElement(
    "h3",
    "profile-credit-title",
    "Credit score:",
  );

  const creditBadge = createElement(
    "span",
    "auth-credits profile-credits-badge",
  );

  const creditIcon = createElement("span", "profile-credit-coin", "C");

  creditIcon.setAttribute("aria-hidden", "true");

  const creditAmount = createElement(
    "span",
    "",
    Number.isFinite(profile.credits)
      ? `${new Intl.NumberFormat("nb-NO").format(profile.credits)} credits`
      : "Credits unavailable",
  );

  creditBadge.append(creditIcon, creditAmount);
  creditPanel.append(creditTitle, creditBadge);

  overview.append(about, creditPanel);
  layout.append(banner, overview);

  return layout;
}

// Profile Page

export function createProfilePage() {
  const container = createElement("div", "page-container");

  const section = createElement("section", "profile-section");

  const heading = createElement("h1", "sr-only", "My profile");

  const status = createElement("p", "body-text", "Loading profile...");

  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const content = document.createElement("div");

  section.append(heading, status, content);
  container.append(section);

  // Load Profile

  getProfile()
    .then((profile) => {
      if (!container.isConnected) return;

      content.replaceChildren(createProfileHeader(profile));

      status.remove();
    })
    .catch((error) => {
      if (!container.isConnected) return;

      console.error("Could not load profile:", error);

      status.textContent =
        "Could not load your profile. Please try again later.";
    });

  return container;
}
