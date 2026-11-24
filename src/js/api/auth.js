const API_URL = "https://v2.api.noroff.dev/auth";

// Authentication Request

async function authRequest(endpoint, userData) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = Array.isArray(result?.errors)
      ? result.errors
          .map((error) => error.message)
          .filter(Boolean)
          .join(" ")
      : null;

    throw new Error(errorMessage || "Something went wrong. Please try again.");
  }

  if (!result?.data) {
    throw new Error("Unexpected response from the API.");
  }

  return result.data;
}

// Register

export async function registerUser(userData) {
  return authRequest("register", userData);
}

// Login

export async function loginUser(email, password) {
  const user = await authRequest("login", {
    email,
    password,
  });

  if (!user.accessToken) {
    throw new Error("Login failed: no access token received.");
  }

  return user;
}
