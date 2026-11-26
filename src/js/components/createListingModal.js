import { createListing } from "../api/listings.js";
import { CATEGORIES } from "../constants/categories.js";

// Create Listing Modal

export function createListingModal(onCreated) {
  const dialog = document.createElement("dialog");
  dialog.className = "modal-dialog";
  dialog.setAttribute("aria-labelledby", "new-listing-title");

  const form = document.createElement("form");
  form.className = "modal-form";

  form.innerHTML = `
    <h2 id="new-listing-title" class="modal-title">
      Create new listing
    </h2>

    <label for="listing-title">Title</label>
    <input
      id="listing-title"
      name="title"
      type="text"
      placeholder="What are you selling?"
      required
    >

    <label for="listing-description">Description</label>
    <textarea
      id="listing-description"
      name="description"
      rows="4"
      placeholder="Describe your item..."
    ></textarea>

    <label for="listing-category">Category</label>
    <select
      id="listing-category"
      name="category"
      required
    ></select>

    <label for="listing-image">Image URL (optional)</label>
    <input
      id="listing-image"
      name="imageUrl"
      type="url"
      placeholder="https://example.com/image.jpg"
    >

    <label for="listing-image-alt">Image description</label>
    <input
      id="listing-image-alt"
      name="imageAlt"
      type="text"
      placeholder="Describe the image"
    >

    <label for="listing-end">Auction ends</label>
    <input
      id="listing-end"
      name="endsAt"
      type="datetime-local"
      required
    >

    <p class="modal-hint">
      Images must have a public URL.
    </p>

    <p
      class="modal-feedback"
      role="status"
      aria-live="polite"
    ></p>

    <div class="modal-actions">
      <button
        type="button"
        class="btn btn-outline-light"
        data-cancel
      >
        Cancel
      </button>

      <button
        type="submit"
        class="btn btn-cta"
        data-save
      >
        Create listing
      </button>
    </div>
  `;

  dialog.append(form);

  // Categories

  const categorySelect = form.querySelector("#listing-category");

  const placeholder = new Option("Choose category", "");
  placeholder.disabled = true;
  placeholder.selected = true;

  categorySelect.append(placeholder);

  CATEGORIES.forEach((category) => {
    const option = new Option(category, category);
    categorySelect.append(option);
  });

  // Form Elements

  const feedback = form.querySelector(".modal-feedback");

  const saveButton = form.querySelector("[data-save]");
  const cancelButton = form.querySelector("[data-cancel]");

  // Close Modal

  cancelButton.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("cancel", (event) => {
    if (saveButton.disabled) {
      event.preventDefault();
    }
  });

  dialog.addEventListener("close", () => {
    form.reset();
    feedback.textContent = "";
  });

  // Create Listing

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (saveButton.disabled) return;

    feedback.textContent = "";

    const formData = new FormData(form);

    const title = formData.get("title").trim();
    const description = formData.get("description").trim();
    const category = formData.get("category");
    const imageUrl = formData.get("imageUrl").trim();
    const imageAlt = formData.get("imageAlt").trim();
    const endsAt = formData.get("endsAt");

    // Optional Image

    const media = [];

    if (imageUrl) {
      media.push({
        url: imageUrl,
        alt: imageAlt || title,
      });
    }

    // Listing Data

    const listingData = {
      title,
      description,
      tags: [category],
      media,
      endsAt,
    };

    // Save to Noroff API

    saveButton.disabled = true;
    cancelButton.disabled = true;
    saveButton.textContent = "Creating...";

    try {
      await createListing(listingData);

      dialog.close();
      onCreated();
    } catch (error) {
      console.error("Could not create listing:", error);

      feedback.textContent = error.message || "Could not create the listing.";
    } finally {
      saveButton.disabled = false;
      cancelButton.disabled = false;
      saveButton.textContent = "Create listing";
    }
  });

  return dialog;
}
