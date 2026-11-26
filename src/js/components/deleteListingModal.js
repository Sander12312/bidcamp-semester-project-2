import { deleteListing } from "../api/listings.js";

// Delete Listing Modal

export function createDeleteListingModal(listing, onDeleted) {
  const dialog = document.createElement("dialog");

  dialog.className = "modal-dialog delete-listing-dialog";

  dialog.setAttribute("aria-labelledby", "delete-listing-title");

  const form = document.createElement("form");
  form.className = "modal-form";

  form.innerHTML = `
    <h2 id="delete-listing-title" class="modal-title">
      Delete listing
    </h2>

    <p class="delete-listing-message">
      Are you sure you want to delete
      <strong data-listing-title></strong>?
    </p>

    <p class="modal-hint delete-listing-hint">
      This action cannot be undone.
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
        class="btn modal-delete-button"
        data-delete
      >
        Delete
      </button>
    </div>
  `;

  dialog.append(form);

  // Listing Title

  form.querySelector("[data-listing-title]").textContent =
    listing.title || "this listing";

  // Buttons and Feedback

  const feedback = form.querySelector(".modal-feedback");
  const deleteButton = form.querySelector("[data-delete]");
  const cancelButton = form.querySelector("[data-cancel]");

  // Cancel

  cancelButton.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("cancel", (event) => {
    if (deleteButton.disabled) {
      event.preventDefault();
    }
  });

  // Delete Listing

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (deleteButton.disabled) return;

    feedback.textContent = "";

    deleteButton.disabled = true;
    cancelButton.disabled = true;
    deleteButton.textContent = "Deleting...";

    try {
      await deleteListing(listing.id);

      dialog.close();
      onDeleted();
    } catch (error) {
      console.error("Could not delete listing:", error);

      feedback.textContent = error.message || "Could not delete listing.";
    } finally {
      deleteButton.disabled = false;
      cancelButton.disabled = false;
      deleteButton.textContent = "Delete";
    }
  });

  return dialog;
}
