import { updateListing } from "../api/listings.js";
import { CATEGORIES } from "../constants/categories.js";

// Edit Listing Modal

export function createEditListingModal(listing, onSaved) {
  const dialog = document.createElement("dialog");
  dialog.className = "modal-dialog";
  dialog.setAttribute("aria-labelledby", "edit-listing-title");

  const form = document.createElement("form");
  form.className = "modal-form";

  form.innerHTML = `
    <h2 id="edit-listing-title" class="modal-title">
      Edit listing
    </h2>

    <label for="edit-listing-name">Title</label>
    <input
      id="edit-listing-name"
      name="title"
      type="text"
      required
    >

    <label for="edit-listing-description">Description</label>
    <textarea
      id="edit-listing-description"
      name="description"
      rows="4"
    ></textarea>

    <label for="edit-listing-category">Category</label>
    <select
      id="edit-listing-category"
      name="category"
      required
    ></select>

    <label for="edit-listing-image">Image URL</label>
    <input
      id="edit-listing-image"
      name="imageUrl"
      type="url"
      placeholder="https://example.com/image.jpg"
    >

    <label for="edit-listing-image-alt">
      Image description
    </label>
    <input
      id="edit-listing-image-alt"
      name="imageAlt"
      type="text"
      placeholder="Describe the image"
    >

    <p class="modal-hint">
      Images must have a public URL.
      Clear the image URL to remove the first image.
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
        Save changes
      </button>
    </div>
  `;

  dialog.append(form);

  // Form Elements

  const titleInput = form.querySelector('[name="title"]');
  const descriptionInput = form.querySelector('[name="description"]');
  const categorySelect = form.querySelector('[name="category"]');
  const imageInput = form.querySelector('[name="imageUrl"]');
  const imageAltInput = form.querySelector('[name="imageAlt"]');

  // Fill Existing Listing Data

  titleInput.value = listing.title || "";
  descriptionInput.value = listing.description || "";
  imageInput.value = listing.media?.[0]?.url || "";
  imageAltInput.value = listing.media?.[0]?.alt || "";

  // Categories

  const currentCategory =
    listing.tags?.find((tag) => CATEGORIES.includes(tag)) ||
    listing.tags?.[0] ||
    "";

  const placeholder = new Option("Choose category", "");
  placeholder.disabled = true;
  categorySelect.append(placeholder);

  CATEGORIES.forEach((category) => {
    categorySelect.append(new Option(category, category));
  });

  // Preserve an existing category not in CATEGORIES

  if (currentCategory && !CATEGORIES.includes(currentCategory)) {
    categorySelect.append(new Option(currentCategory, currentCategory));
  }

  categorySelect.value = currentCategory;

  // Buttons and Feedback

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

  // Save Changes

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

    // Preserve Other Tags

    const tags = (listing.tags || []).filter(
      (tag) => !CATEGORIES.includes(tag) && tag !== category,
    );

    tags.unshift(category);

    // Preserve Any Additional Images

    const media = (listing.media || []).slice(1);

    if (imageUrl) {
      media.unshift({
        url: imageUrl,
        alt: imageAlt || title,
      });
    }

    // Updated Listing Data

    const changes = {
      title,
      description,
      tags,
      media,
    };

    // Save to Noroff API

    saveButton.disabled = true;
    cancelButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
      await updateListing(listing.id, changes);

      dialog.close();
      onSaved();
    } catch (error) {
      console.error("Could not update listing:", error);

      feedback.textContent = error.message || "Could not save listing changes.";
    } finally {
      saveButton.disabled = false;
      cancelButton.disabled = false;
      saveButton.textContent = "Save changes";
    }
  });

  return dialog;
}
