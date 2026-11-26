import {
  getProfile,
  getProfileListings,
  getProfileBids,
} from "../api/profile.js";

import { createListingCard } from "../components/listingCard.js";
import { createListingModal } from "../components/createListingModal.js";
import { createEditProfileModal } from "../components/editProfileModal.js";
import { createEditListingModal } from "../components/editListingModal.js";
import { createDeleteListingModal } from "../components/deleteListingModal.js";

// Shared Helpers

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function openModal(dialog, container) {
  container.append(dialog);

  dialog.addEventListener("close", () => dialog.remove(), { once: true });

  dialog.showModal();
}

function createNewListingButton(onClick, className) {
  const button = createElement(
    "button",
    `profile-new-listing-button ${className}`,
    "+ New listing",
  );

  button.type = "button";
  button.addEventListener("click", onClick);

  return button;
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

function createProfileHeader(profile, onNewListing, onEditProfile) {
  const layout = createElement("div", "profile-layout");

  // Banner

  const banner = createElement("div", "profile-banner");
  const bannerImage = document.createElement("img");

  bannerImage.className = "profile-banner-image";
  bannerImage.src = profile.banner?.url || "/images/background.png";
  bannerImage.alt = profile.banner?.alt || "Profile banner";

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
  editButton.addEventListener("click", onEditProfile);

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

  // Mobile New Listing Button

  const mobileNewListing = createNewListingButton(
    onNewListing,
    "profile-new-listing-mobile",
  );

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

  overview.append(about, mobileNewListing, creditPanel);
  layout.append(banner, overview);

  return layout;
}

// Profile Auctions

function createMyListingsSection(onNewListing) {
  const section = createElement("section", "profile-listings-section");

  const heading = createElement("h2", "sr-only", "My auctions");

  // Toolbar

  const toolbar = createElement("div", "profile-listings-toolbar");

  // Reuse Login/Register Tab Classes

  const tabs = createElement("div", "auth-tabs profile-tabs");

  const listingsTab = createElement(
    "button",
    "auth-tab auth-tab-active",
    "My listings",
  );

  const bidsTab = createElement("button", "auth-tab", "My bids");

  listingsTab.type = "button";
  bidsTab.type = "button";

  listingsTab.setAttribute("aria-pressed", "true");
  bidsTab.setAttribute("aria-pressed", "false");

  tabs.append(listingsTab, bidsTab);

  // Desktop New Listing Button

  const desktopNewListing = createNewListingButton(
    onNewListing,
    "profile-new-listing-desktop",
  );

  toolbar.append(tabs, desktopNewListing);

  // Status

  const status = createElement(
    "p",
    "profile-listings-status",
    "Loading your listings...",
  );

  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  // Content Containers

  const grid = createElement("div", "profile-listings-grid");

  const bidsList = createElement("div", "profile-bids-list");

  bidsList.hidden = true;

  section.append(heading, toolbar, status, grid, bidsList);

  // Switch Tabs

  function selectTab(showBids) {
    grid.hidden = showBids;
    bidsList.hidden = !showBids;

    listingsTab.classList.toggle("auth-tab-active", !showBids);

    bidsTab.classList.toggle("auth-tab-active", showBids);

    listingsTab.setAttribute("aria-pressed", String(!showBids));

    bidsTab.setAttribute("aria-pressed", String(showBids));
  }

  // Load My Listings

  async function refresh() {
    if (grid.hidden) return;

    status.hidden = false;
    status.textContent = "Loading your listings...";
    grid.replaceChildren();

    try {
      const listings = await getProfileListings();

      if (!section.isConnected || grid.hidden) return;

      if (listings.length === 0) {
        status.textContent = "You haven't created any listings yet.";
        return;
      }

      const cards = listings.map((listing) => {
        // Reuse Existing Listing Card

        const card = createListingCard({
          ...listing,
          category: listing.tags?.[0] || "Other",
        });

        card.classList.add("profile-owned-listing");

        // Owner Actions

        const actions = createElement("div", "profile-listing-actions");

        // Edit Button

        const editButton = createElement(
          "button",
          "btn btn-cta profile-listing-edit",
          "Edit",
        );

        editButton.type = "button";

        editButton.setAttribute(
          "aria-label",
          `Edit ${listing.title || "listing"}`,
        );

        editButton.addEventListener("click", () => {
          const modal = createEditListingModal(listing, refresh);

          openModal(modal, section);
        });

        // Delete Button

        const deleteButton = createElement(
          "button",
          "btn profile-listing-delete",
          "Delete",
        );

        deleteButton.type = "button";

        deleteButton.setAttribute(
          "aria-label",
          `Delete ${listing.title || "listing"}`,
        );

        deleteButton.addEventListener("click", () => {
          const modal = createDeleteListingModal(listing, refresh);

          openModal(modal, section);
        });

        actions.append(editButton, deleteButton);
        card.append(actions);

        return card;
      });

      grid.replaceChildren(...cards);
      status.hidden = true;
    } catch (error) {
      if (!section.isConnected || grid.hidden) return;

      console.error("Could not load listings:", error);

      status.textContent =
        "Could not load your listings. Please try again later.";
    }
  }

  // Create My Bid Row

  function createBidRow(bid) {
    const listing = bid.listing;

    const row = createElement("article", "profile-bid-row");

    // Image

    const placeholder = createElement(
      "div",
      "profile-bid-image profile-bid-placeholder",
      "No image",
    );

    let image = placeholder;

    if (listing.media?.[0]?.url) {
      image = document.createElement("img");
      image.className = "profile-bid-image";
      image.src = listing.media[0].url;
      image.alt = listing.media[0].alt || listing.title || "Auction image";
      image.loading = "lazy";

      image.addEventListener("error", () => image.replaceWith(placeholder), {
        once: true,
      });
    }

    // Auction Information

    const info = createElement("div", "profile-bid-info");

    const title = createElement(
      "h3",
      "profile-bid-title",
      listing.title || "Untitled auction",
    );

    const amount = createElement(
      "p",
      "profile-bid-amount",
      `Your highest bid: ${new Intl.NumberFormat("nb-NO").format(bid.amount)} credits`,
    );

    const endTime = new Date(listing.endsAt).getTime();

    let auctionStatus = "End date unavailable";

    if (Number.isFinite(endTime)) {
      auctionStatus = endTime > Date.now() ? "Auction active" : "Auction ended";
    }

    const statusText = createElement("p", "profile-bid-status", auctionStatus);

    info.append(title, amount, statusText);

    // Details Link

    const detailsLink = createElement(
      "a",
      "profile-bid-details",
      "View details",
    );

    detailsLink.href = `/listing/${encodeURIComponent(listing.id)}`;

    row.append(image, info, detailsLink);

    return row;
  }

  // Load My Bids

  async function showMyBids() {
    selectTab(true);

    status.hidden = false;
    status.textContent = "Loading your bids...";
    bidsList.replaceChildren();

    try {
      const bids = await getProfileBids();

      if (!section.isConnected || bidsList.hidden) return;

      if (bids.length === 0) {
        status.textContent = "You haven't placed any bids yet.";
        return;
      }

      // Keep Highest Personal Bid Per Listing

      const bidsByListing = new Map();

      bids.forEach((bid) => {
        const listingId = bid.listing?.id;

        if (!listingId) return;

        const previousBid = bidsByListing.get(listingId);

        if (!previousBid || Number(bid.amount) > Number(previousBid.amount)) {
          bidsByListing.set(listingId, bid);
        }
      });

      if (bidsByListing.size === 0) {
        status.textContent =
          "Your bids were found, but their auction details are unavailable.";
        return;
      }

      const rows = Array.from(bidsByListing.values()).map(createBidRow);

      bidsList.replaceChildren(...rows);
      status.hidden = true;
    } catch (error) {
      if (!section.isConnected || bidsList.hidden) return;

      console.error("Could not load bids:", error);

      status.textContent = "Could not load your bids. Please try again later.";
    }
  }

  // Tab Events

  listingsTab.addEventListener("click", () => {
    selectTab(false);
    refresh();
  });

  bidsTab.addEventListener("click", showMyBids);

  return {
    element: section,
    refresh,
  };
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
    .then((initialProfile) => {
      if (!container.isConnected) return;

      let profile = initialProfile;
      let profileHeader;
      let listingsSection;

      // Create Listing Modal

      const listingModal = createListingModal(() => {
        listingsSection.refresh();
      });

      function openNewListing() {
        listingModal.showModal();
      }

      // Edit Profile Modal

      function openEditProfile() {
        const modal = createEditProfileModal(profile, async () => {
          profile = await getProfile();

          if (!container.isConnected) return;

          const updatedHeader = createProfileHeader(
            profile,
            openNewListing,
            openEditProfile,
          );

          profileHeader.replaceWith(updatedHeader);
          profileHeader = updatedHeader;
        });

        openModal(modal, content);
      }

      // Create Profile Content

      profileHeader = createProfileHeader(
        profile,
        openNewListing,
        openEditProfile,
      );

      listingsSection = createMyListingsSection(openNewListing);

      content.replaceChildren(
        profileHeader,
        listingsSection.element,
        listingModal,
      );

      status.remove();

      // Load Listings

      listingsSection.refresh();
    })
    .catch((error) => {
      if (!container.isConnected) return;

      console.error("Could not load profile:", error);

      status.textContent =
        "Could not load your profile. Please try again later.";
    });

  return container;
}
