const API_URL = "https://v2.api.noroff.dev/auction/listings";

import { getSession } from "../auth/session.js";
import { CATEGORIES } from "../constants/categories.js";

// Categories

const CATEGORY_KEYWORDS = {
  Electronics: [
    "electronics",
    "phone",
    "smartphone",
    "iphone",
    "samsung",
    "laptop",
    "computer",
    "macbook",
    "headphones",
    "tablet",
    "camera",
    "speaker",
    "console",
    "gaming",
    "tv",
  ],

  Books: [
    "book",
    "books",
    "notebook",
    "notebooks",
    "novel",
    "textbook",
    "literature",
    "manga",
    "comic",
  ],

  Accessories: [
    "accessories",
    "accessory",
    "backpack",
    "bag",
    "handbag",
    "wallet",
    "watch",
    "watches",
    "jewelry",
    "jewellery",
    "necklace",
    "sunglasses",
  ],

  "Clothing & Shoes": [
    "clothing",
    "clothes",
    "shirt",
    "hoodie",
    "jacket",
    "dress",
    "shoes",
    "shoe",
    "sneakers",
    "boots",
    "vans",
  ],

  "Home & Furniture": [
    "home",
    "furniture",
    "chair",
    "desk",
    "table",
    "sofa",
    "lamp",
    "kitchen",
    "decor",
  ],

  Collectibles: [
    "collectibles",
    "collectible",
    "collection",
    "collectable",
    "toy",
    "toys",
    "vintage",
    "retro",
    "vinyl",
    "record",
    "records",
    "cassette",
    "cassettes",
    "antique",
  ],
};

// Categorize listings

function getListingCategory(listing) {
  const tags = Array.isArray(listing.tags) ? listing.tags : [];
  const selectedCategory = CATEGORIES.find((category) =>
    tags.some(
      (tag) =>
        typeof tag === "string" && tag.toLowerCase() === category.toLowerCase(),
    ),
  );

  if (selectedCategory) {
    return selectedCategory;
  }

  const searchableText = [listing.title ?? "", ...tags]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9æøå]+/g, " ");

  const normalizedText = ` ${searchableText} `;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.some((keyword) =>
      normalizedText.includes(` ${keyword} `),
    );

    if (matches) {
      return category;
    }
  }

  return "Other";
}

// Fetch listings

export async function getListings(searchTerm = "", signal, options = {}) {
  const activeListings = [];
  const pageSize = 100;
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      _active: "true",
      _bids: "true",
      limit: String(pageSize),
      page: String(page),
      sort: "created",
      sortOrder: "desc",
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, { signal });

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.status}`);
    }

    const result = await response.json();

    if (!Array.isArray(result.data)) {
      throw new Error("Unexpected response from the auction API.");
    }

    // Keep active auctions

    const now = Date.now();

    const validListings = result.data.filter((listing) => {
      const endTime = new Date(listing.endsAt).getTime();

      return Number.isFinite(endTime) && endTime > now;
    });

    activeListings.push(...validListings);

    if (result.meta?.isLastPage === true || result.data.length < pageSize) {
      break;
    }

    page++;
  }

  // Search and filter

  const query = searchTerm.trim().toLowerCase();
  const selectedCategory = options.category ?? "";

  const matches = activeListings.filter((listing) => {
    const title = listing.title ?? "";
    const description = listing.description ?? "";

    const matchesSearch =
      !query || `${title} ${description}`.toLowerCase().includes(query);

    const matchesCategory =
      !selectedCategory || getListingCategory(listing) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort

  matches.sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();

    return options.sort === "oldest" ? dateA - dateB : dateB - dateA;
  });

  return {
    listings: matches.slice(0, 12).map((listing) => ({
      ...listing,
      category: getListingCategory(listing),
    })),
    totalCount: matches.length,
    categories: CATEGORIES,
  };
}

/* Create Listing */

export async function createListing(listing) {
  const session = getSession();
  const apiKey = import.meta.env.VITE_NOROFF_API_KEY;

  if (!session?.accessToken) {
    throw new Error("You must be logged in.");
  }

  if (!apiKey) {
    throw new Error("Noroff API key is missing.");
  }

  // Validate Required Fields

  if (!listing.title?.trim()) {
    throw new Error("Please enter a title.");
  }

  const endDate = new Date(listing.endsAt);

  if (Number.isNaN(endDate.getTime()) || endDate.getTime() <= Date.now()) {
    throw new Error("Please choose a future end date.");
  }

  // Prepare Listing Data

  const listingData = {
    title: listing.title.trim(),
    description: listing.description?.trim() || "",
    tags: listing.tags || [],
    media: listing.media || [],
    endsAt: endDate.toISOString(),
  };

  // Send Listing to Noroff

  const response = await fetch("https://v2.api.noroff.dev/auction/listings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "X-Noroff-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingData),
  });

  const result = await response.json();

  if (!response.ok) {
    const message = result.errors?.[0]?.message || "Could not create listing.";

    throw new Error(message);
  }

  return result.data;
}

/* Update Listing */

export async function updateListing(id, changes) {
  const session = getSession();
  const apiKey = import.meta.env.VITE_NOROFF_API_KEY;

  if (!session?.accessToken) {
    throw new Error("You must be logged in.");
  }

  if (!apiKey) {
    throw new Error("Noroff API key is missing.");
  }

  if (!id) {
    throw new Error("Listing ID is missing.");
  }

  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "X-Noroff-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changes),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.message || "Could not update listing.");
  }

  return result.data;
}

/* Delete Listing */

export async function deleteListing(id) {
  const session = getSession();
  const apiKey = import.meta.env.VITE_NOROFF_API_KEY;

  if (!session?.accessToken) {
    throw new Error("You must be logged in.");
  }

  if (!apiKey) {
    throw new Error("Noroff API key is missing.");
  }

  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "X-Noroff-API-Key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Could not delete listing: ${response.status}`);
  }
}
