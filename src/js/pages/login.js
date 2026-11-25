import { loginUser } from "../api/auth.js";
import { saveSession } from "../auth/session.js";

export function createLoginPage() {
  const container = document.createElement("div");
  container.className = "page-container";

  container.innerHTML = `
    <section class="auth-layout" aria-labelledby="login-title">

      <!-- Authentication Tabs -->

      <nav class="auth-tabs" aria-label="Authentication">
        <a
          href="/login"
          class="auth-tab auth-tab-active"
          aria-current="page"
        >
          Log in
        </a>

        <a href="/register" class="auth-tab">
          Register
        </a>
      </nav>

      <!-- Login Card -->

      <div class="auth-card">
        <p class="auth-brand">BIDCAMP</p>

        <h1 id="login-title" class="auth-title">
          Log in to BIDCAMP
        </h1>

        <p class="auth-description">
          Log in with your BIDCAMP account
        </p>

        <!-- Login Form -->

        <form id="login-form" class="auth-form">

          <div class="auth-field">
            <label for="login-email" class="auth-label">
              Email
            </label>

            <input
              type="email"
              id="login-email"
              name="email"
              class="auth-input"
              placeholder="@stud.noroff.no"
              autocomplete="email"
              required
            />
          </div>

          <div class="auth-field">
            <label for="login-password" class="auth-label">
              Password
            </label>

            <input
              type="password"
              id="login-password"
              name="password"
              class="auth-input"
              autocomplete="current-password"
              required
            />
          </div>

          <!-- Remember Me -->

          <label class="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="login-remember"
              name="remember"
              class="size-4 accent-cta"
            />

            <span class="auth-label">
              Remember me
            </span>
          </label>

          <!-- Feedback -->

          <p
            id="login-status"
            role="status"
            aria-live="polite"
          ></p>

          <button
            type="submit"
            class="btn btn-cta auth-submit"
          >
            Log in
          </button>
        </form>

        <!-- Switch to Register -->

        <div class="auth-divider">
          <span></span>
          <span>Or</span>
          <span></span>
        </div>

        <p class="auth-description">
          Don't have an account?
        </p>

        <a
          href="/register"
          class="btn btn-outline-light auth-secondary-link"
        >
          Register
        </a>
      </div>
    </section>
  `;

  const form = container.querySelector("#login-form");
  const status = container.querySelector("#login-status");
  const submitButton = form.querySelector('button[type="submit"]');

  // Login

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.elements.namedItem("email").value.trim();
    const password = form.elements.namedItem("password").value;
    const rememberMe = form.elements.namedItem("remember").checked;

    // Loading

    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";
    form.setAttribute("aria-busy", "true");

    status.className = "";
    status.textContent = "Logging in to your account...";

    try {
      const user = await loginUser(email, password);

      // Save Session

      const session = {
        accessToken: user.accessToken,
        name: user.name,
        email: user.email,
      };

      saveSession(session, rememberMe);

      // Success

      form.reset();

      window.history.replaceState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo(0, 0);
    } catch (error) {
      // Error

      status.className = "auth-error";
      status.textContent =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Log in";
      form.removeAttribute("aria-busy");
    }
  });

  return container;
}
