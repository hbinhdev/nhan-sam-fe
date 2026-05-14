import { getAuthSession } from "@/lib/auth-api";

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

function resolveApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const candidate =
    rawBaseUrl && rawBaseUrl.trim() ? rawBaseUrl.trim() : DEFAULT_API_BASE_URL;

  try {
    const parsed = new URL(candidate);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_API_BASE_URL;
  }
}

const API_BASE_URL = resolveApiBaseUrl();

type UploadResponse = {
  url: string;
};

function getAdminToken() {
  const session = getAuthSession();
  if (!session?.access_token) {
    throw new Error("Session expired. Please sign in again.");
  }

  return session.access_token;
}

async function parseUploadError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message[0];
    }
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

async function uploadSingleFile(path: "/upload/image" | "/upload/video", file: File) {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (!response.ok) {
    const message = await parseUploadError(response, "Upload failed.");
    throw new Error(message);
  }

  const payload = (await response.json()) as Partial<UploadResponse>;
  if (!payload.url || typeof payload.url !== "string") {
    throw new Error("Upload response is invalid.");
  }

  return payload.url;
}

export async function uploadImage(file: File) {
  return uploadSingleFile("/upload/image", file);
}

export async function uploadVideo(file: File) {
  return uploadSingleFile("/upload/video", file);
}
