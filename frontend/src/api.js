const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function buildImageUrl(path) {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

function sanitizeFilenamePart(value) {
  return (value || "image").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "image";
}

export function buildDownloadFilename(title, path) {
  const imageUrl = buildImageUrl(path);
  let extension = "jpg";

  try {
    const pathname = new URL(imageUrl, window.location.origin).pathname;
    const fileName = pathname.split("/").pop() || "";
    const extensionParts = fileName.split(".");

    if (extensionParts.length > 1) {
      extension = extensionParts.pop().toLowerCase();
    }
  } catch {
    extension = "jpg";
  }

  return `${sanitizeFilenamePart(title)}.${extension}`;
}

export async function downloadImage(path, filename) {
  const imageUrl = buildImageUrl(path);
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("Khong the tai anh luc nay.");
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename || "image";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}

export async function apiRequest(path, options = {}, token) {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Khong ket noi duoc toi backend. Hay kiem tra backend dang chay.");
  }

  const rawText = await response.text();
  let data = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    const detail = typeof data === "object" && data ? data.detail : null;
    throw new Error(detail || "Co loi xay ra.");
  }

  return data;
}

export { API_BASE_URL };
