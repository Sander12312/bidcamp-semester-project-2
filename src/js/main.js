import { initMobileMenu } from "./mobileMenu.js";
import { getListings } from "./api/listings.js";
import { createListingCard } from "./components/listingCard.js";
import { initRouter } from "./router.js";
import { initAuthNavigation } from "./components/authNavigation.js";

// Initialize Navigation

initMobileMenu();
initRouter();
initAuthNavigation();

// Initialize Listings

function initListings() {
  const grid = document.querySelector("#auctions-grid");
  const status = document.querySelector("#auctions-status");
  const heading = document.querySelector("#auctions-title");

  const searchInput = document.querySelector("#auction-search");
  const categorySelect = document.querySelector("#auction-category");
  const sortSelect = document.querySelector("#auction-sort");
  const categoryWrapper = document.querySelector("#auction-category-wrapper");
  const filterButton = document.querySelector("#auction-filter-button");

  if (!grid || !status || !searchInput || !categorySelect || !sortSelect) {
    return;
  }

  let searchTimeout;
  let activeController;

  // Category Options

  function updateCategories(categories) {
    const selectedCategory = categorySelect.value;

    const options = categories.map(
      (category) => new Option(category, category),
    );

    categorySelect.replaceChildren(
      new Option("All categories", ""),
      ...options,
    );

    categorySelect.value = selectedCategory;
  }

  // Load Auctions

  async function loadListings() {
    activeController?.abort();

    const controller = new AbortController();
    activeController = controller;

    status.hidden = false;
    status.textContent = "Loading auctions...";
    grid.replaceChildren();

    try {
      const { listings, totalCount, categories } = await getListings(
        searchInput.value,
        controller.signal,
        {
          category: categorySelect.value,
          sort: sortSelect.value,
        },
      );

      if (controller.signal.aborted) return;

      updateCategories(categories);

      // Reuse the Shared Listing Card

      const cards = listings.map(createListingCard);

      grid.replaceChildren(...cards);

      // Update Auction Count

      if (heading) {
        const count = totalCount > 99 ? "99+" : totalCount;
        heading.textContent = `Auctions(${count})`;
      }

      // Empty State

      if (listings.length === 0) {
        status.textContent = "No auctions found.";
      } else {
        status.hidden = true;
      }
    } catch (error) {
      if (controller.signal.aborted) return;

      console.error("Could not load auctions:", error);

      if (heading) {
        heading.textContent = "Auctions";
      }

      status.textContent = "Could not load auctions. Please try again later.";
    }
  }

  // Search Auctions

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    activeController?.abort();

    status.hidden = false;
    status.textContent = "Searching auctions...";
    grid.replaceChildren();

    searchTimeout = setTimeout(loadListings, 350);
  });

  // Category Filter

  categorySelect.addEventListener("change", () => {
    clearTimeout(searchTimeout);
    loadListings();
  });

  // Sort Auctions

  sortSelect.addEventListener("change", () => {
    clearTimeout(searchTimeout);
    loadListings();
  });

  // Mobile Category Filter

  if (categoryWrapper && filterButton) {
    filterButton.setAttribute("aria-controls", "auction-category-wrapper");

    const mobileView = window.matchMedia("(max-width: 767px)");

    function syncFilterState() {
      filterButton.setAttribute(
        "aria-expanded",
        String(
          !mobileView.matches || !categoryWrapper.classList.contains("hidden"),
        ),
      );
    }

    filterButton.addEventListener("click", () => {
      if (!mobileView.matches) {
        categorySelect.focus();
        return;
      }

      const isHidden = categoryWrapper.classList.toggle("hidden");

      syncFilterState();

      if (isHidden) {
        filterButton.focus();
      } else {
        categorySelect.focus();
      }
    });

    mobileView.addEventListener("change", syncFilterState);

    syncFilterState();
  }

  // Initial Auctions

  loadListings();
}

initListings();
