import { updateProfile } from "../api/profile.js";

// Edit Profile Modal

export function createEditProfileModal(profile, onSaved) {
  const dialog = document.createElement("dialog");
  dialog.className = "modal-dialog";
  dialog.setAttribute("aria-labelledby", "edit-profile-title");

  const form = document.createElement("form");
  form.className = "modal-form";

  form.innerHTML = `
    <h2 id="edit-profile-title" class="modal-title">
      Edit profile
    </h2>

    <div class="edit-profile-preview">
      <img
        class="edit-profile-banner-preview"
        alt=""
        data-banner-preview
      >
      <img
        class="edit-profile-avatar-preview"
        alt=""
        data-avatar-preview
      >
    </div>

    <label for="edit-profile-name">Username</label>
    <input
      id="edit-profile-name"
      name="name"
      type="text"
      readonly
    >

    <label for="edit-profile-bio">Bio</label>
    <textarea
      id="edit-profile-bio"
      name="bio"
      rows="4"
      placeholder="Tell us about yourself..."
    ></textarea>

    <label for="edit-profile-avatar">Profile picture URL</label>
    <input
      id="edit-profile-avatar"
      name="avatarUrl"
      type="url"
      placeholder="https://example.com/avatar.jpg"
    >

    <label for="edit-profile-banner">Banner image URL</label>
    <input
      id="edit-profile-banner"
      name="bannerUrl"
      type="url"
      placeholder="https://example.com/banner.jpg"
    >

    <p class="modal-hint">
      Images must have a public URL.
      Leave an image field empty to keep the current image.
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

  // Existing Profile Data

  const nameInput = form.querySelector('[name="name"]');
  const bioInput = form.querySelector('[name="bio"]');
  const avatarInput = form.querySelector('[name="avatarUrl"]');
  const bannerInput = form.querySelector('[name="bannerUrl"]');

  nameInput.value = profile.name || "";
  bioInput.value = profile.bio || "";
  avatarInput.value = profile.avatar?.url || "";
  bannerInput.value = profile.banner?.url || "";

  // Image Previews

  const bannerPreview = form.querySelector("[data-banner-preview]");

  const avatarPreview = form.querySelector("[data-avatar-preview]");

  bannerPreview.src = profile.banner?.url || "/images/background.png";

  if (profile.avatar?.url) {
    avatarPreview.src = profile.avatar.url;
  } else {
    avatarPreview.hidden = true;
  }

  // Buttons

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
    feedback.textContent = "";
  });

  // Save Profile

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (saveButton.disabled) return;

    feedback.textContent = "";

    const bio = bioInput.value.trim();
    const avatarUrl = avatarInput.value.trim();
    const bannerUrl = bannerInput.value.trim();

    const changes = {
      bio,
    };

    // Only update images when a new URL is provided

    if (avatarUrl && avatarUrl !== profile.avatar?.url) {
      changes.avatar = {
        url: avatarUrl,
        alt: `Profile picture of ${profile.name}`,
      };
    }

    if (bannerUrl && bannerUrl !== profile.banner?.url) {
      changes.banner = {
        url: bannerUrl,
        alt: `Profile banner of ${profile.name}`,
      };
    }

    saveButton.disabled = true;
    cancelButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {
      await updateProfile(changes);

      await onSaved();

      dialog.close();
    } catch (error) {
      console.error("Could not update profile:", error);

      feedback.textContent = error.message || "Could not save profile changes.";
    } finally {
      saveButton.disabled = false;
      cancelButton.disabled = false;
      saveButton.textContent = "Save changes";
    }
  });

  return dialog;
}
