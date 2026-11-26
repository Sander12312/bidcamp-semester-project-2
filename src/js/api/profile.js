import { getSession } from "../auth/session.js";

const API_URL = "https://v2.api.noroff.dev/auction/profiles";

// Get Profile

export async function getProfile() {
  const session = getSession();
  const apiKey = import.meta.env.VITE_NOROFF_API_KEY;

  if (!session?.accessToken || !session?.name) {
    throw new Error("You must be logged in.");
  }

  if (!apiKey) {
    throw new Error("Noroff API key is missing.");
  }

  const response = await fetch(
    `${API_URL}/${encodeURIComponent(session.name)}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Could not load profile: ${response.status}`);
  }

  const result = await response.json();

  if (!result?.data) {
    throw new Error("Unexpected profile response.");
  }

  return result.data;
}

// Update Profile

export async function updateProfile(updates) {
  const session = getSession();
  const apiKey = import.meta.env.VITE_NOROFF_API_KEY;

  if (!session?.accessToken || !session?.name) {
    throw new Error("You must be logged in.");
  }

  if (!apiKey) {
    throw new Error("Noroff API key is missing.");
  }

  const allowedFields = ["avatar", "banner", "bio"];

  const profileData = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key)),
  );

  if (Object.keys(profileData).length === 0) {
    throw new Error("No profile changes provided.");
  }

  const response = await fetch(
    `${API_URL}/${encodeURIComponent(session.name)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "X-Noroff-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message = result.errors?.[0]?.message || "Could not update profile.";

    throw new Error(message);
  }

  if (!result?.data) {
    throw new Error("Unexpected profile response.");
  }

  return result.data;
}

// Get Profile Listings

export async function getProfileListings() {
  const session = getSession();
  const apiKey = import.meta.env.VITE_NOROFF_API_KEY;

  if (!session?.accessToken || !session?.name) {
    throw new Error("You must be logged in.");
  }

  if (!apiKey) {
    throw new Error("Noroff API key is missing.");
  }

  const response = await fetch(
    `${API_URL}/${encodeURIComponent(session.name)}/listings?_bids=true`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message =
      result.errors?.[0]?.message || "Could not load your listings.";

    throw new Error(message);
  }

  if (!Array.isArray(result.data)) {
    throw new Error("Unexpected listings response.");
  }

  return result.data;
}

/* Get Profile Bids */

export async function getProfileBids() {
  const session = getSession();
  const apiKey = import.meta.env.VITE_NOROFF_API_KEY;

  if (!session?.accessToken || !session?.name) {
    throw new Error("You must be logged in.");
  }

  if (!apiKey) {
    throw new Error("Noroff API key is missing.");
  }

  const response = await fetch(
    `${API_URL}/${encodeURIComponent(session.name)}/bids?_listings=true`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "X-Noroff-API-Key": apiKey,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    const message = result.errors?.[0]?.message || "Could not load your bids.";

    throw new Error(message);
  }

  if (!Array.isArray(result.data)) {
    throw new Error("Unexpected bids response.");
  }

  return result.data;
}
