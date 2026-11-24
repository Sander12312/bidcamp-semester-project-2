import { registerUser } from "../api/auth.js";

export function createRegisterPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.innerHTML = `
    <section class="auth-layout" aria-labelledby="register-title">

      <!-- Authentication Tabs -->

      <nav class="auth-tabs" aria-label="Authentication">
        <a href="/login" class="auth-tab">
          Log in
        </a>

        <a
          href="/register"
          class="auth-tab auth-tab-active"
          aria-current="page"
        >
          Register
        </a>
      </nav>

      <!-- Register Card -->

      <div class="auth-card">
        <p class="auth-brand">BIDCAMP</p>

        <h1 id="register-title" class="auth-title">
          Register to BIDCAMP
        </h1>

        <p class="auth-description">
          Use a valid Noroff address to register
        </p>

        <!-- Register Form -->

        <form id="register-form" class="auth-form">

          <div class="auth-field">
            <label for="register-name" class="auth-label">
              Name
            </label>

            <input
              type="text"
              id="register-name"
              name="name"
              class="auth-input"
              autocomplete="username"
              required
            />
          </div>

          <div class="auth-field">
            <label for="register-email" class="auth-label">
              Email
            </label>

            <input
              type="email"
              id="register-email"
              name="email"
              class="auth-input"
              autocomplete="email"
              required
            />
          </div>

          <div class="auth-field">
            <label for="register-password" class="auth-label">
              Password
            </label>

            <input
              type="password"
              id="register-password"
              name="password"
              class="auth-input"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </div>

          <div class="auth-field">
            <label
              for="register-confirm-password"
              class="auth-label"
            >
              Confirm password
            </label>

            <input
              type="password"
              id="register-confirm-password"
              name="confirmPassword"
              class="auth-input"
              autocomplete="new-password"
              minlength="8"
              required
            />
          </div>

          <p
            id="register-status"
            role="status"
            aria-live="polite"
          ></p>

          <button
            type="submit"
            class="btn btn-cta auth-submit"
          >
            Register
          </button>
        </form>

        <!-- Switch to Login -->

        <div class="auth-divider">
          <span></span>
          <span>Or</span>
          <span></span>
        </div>

        <p class="auth-description">
          Already have an account?
        </p>

        <a
          href="/login"
          class="btn btn-outline-light auth-secondary-link"
        >
          Log in
        </a>
      </div>
    </section>
  `;

  const form = container.querySelector("#register-form");
  const status = container.querySelector("#register-status");
  const submitButton = form.querySelector('button[type="submit"]');

  // Form Validation

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = form.elements.namedItem("name").value.trim();
    const email = form.elements.namedItem("email").value.trim();
    const password = form.elements.namedItem("password").value;
    const confirmPassword = form.elements.namedItem("confirmPassword").value;

    status.textContent = "";
    status.className = "auth-error";

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      status.textContent =
        "Name can only contain letters, numbers and underscores.";
      return;
    }

    if (!/^[^\s@]+@stud\.noroff\.no$/i.test(email)) {
      status.textContent = "Please use a valid @stud.noroff.no email address.";
      return;
    }

    if (password.length < 8) {
      status.textContent = "Password must be at least 8 characters.";
      return;
    }

    if (password !== confirmPassword) {
      status.textContent = "Passwords do not match.";
      return;
    }

    // Register User

    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";

    status.className = "";
    status.textContent = "Creating your account...";

    try {
      await registerUser({
        name,
        email,
        password,
      });

      // Success

      status.className = "auth-success";
      status.textContent = "Account created successfully! You can now log in.";

      form.reset();
    } catch (error) {
      // Error

      status.className = "auth-error";
      status.textContent =
        error.message || "Registration failed. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Register";
    }
  });

  return container;
}
