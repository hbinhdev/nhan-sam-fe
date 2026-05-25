export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

function resolveApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const candidate = rawBaseUrl && rawBaseUrl.trim() ? rawBaseUrl.trim() : DEFAULT_API_BASE_URL;

  try {
    const parsed = new URL(candidate);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_API_BASE_URL;
  }
}

const API_BASE_URL = resolveApiBaseUrl();

export async function getCategories(): Promise<Category[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
  } catch {
    throw new Error("Failed to fetch categories: network error");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return [];
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item): item is Category => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const value = item as Record<string, unknown>;
      return (
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        typeof value.slug === "string"
      );
    })
    .map((item) => {
      const value = item as unknown as Record<string, unknown>;
      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: typeof value.description === "string" ? value.description : null,
        image: typeof value.image === "string" ? value.image : null,
      };
    });
}
