const API_SOURCE = (import.meta.env.VITE_API_SOURCE || "backend").toLowerCase();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const MOCK_SERVER_URL =
  import.meta.env.VITE_MOCK_SERVER_URL || "http://localhost:4000/api";

const resourcePaths = {
  backend: {
    stores: "/stores.json",
    books: "/books.json",
    authors: "/authors.json",
    inventory: "/inventory.json",
  },
  mock: {
    stores: "/stores",
    books: "/books",
    authors: "/authors",
    inventory: "/inventory",
  },
};

const selectedMode = API_SOURCE === "mock" ? "mock" : "backend";
const baseUrl = selectedMode === "mock" ? MOCK_SERVER_URL : BACKEND_URL;

const getResourceUrl = (resource) => {
  const path = resourcePaths[selectedMode][resource];
  if (!path) throw new Error(`Unknown resource "${resource}"`);
  return `${baseUrl}${path}`;
};

export const fetchResource = async (resource) => {
  const response = await fetch(getResourceUrl(resource));
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${resource}: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
};

export const apiConfig = {
  mode: selectedMode,
  baseUrl,
};

export const apiRequest = async (path, options = {}) => {
  const target = `${baseUrl}${path}`;
  const response = await fetch(target, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.error) errorMsg = body.error;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
};
