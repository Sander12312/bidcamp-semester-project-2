const STORAGE_KEY = "bidcamp-auth";

// Save Session

export function saveSession(session, rememberMe = false) {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);

  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem(STORAGE_KEY, JSON.stringify(session));

  window.dispatchEvent(new Event("bidcamp:session-changed"));
}

// Get Session

export function getSession() {
  const savedSession =
    localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);

  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession);
  } catch {
    return null;
  }
}

// Clear Session

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);

  window.dispatchEvent(new Event("bidcamp:session-changed"));
}
