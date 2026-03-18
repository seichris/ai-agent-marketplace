import type {
  ServiceDetail,
  ServiceSummary,
  SuggestionRecord,
  SuggestionStatus,
  SuggestionType
} from "@marketplace/shared";

function getApiBaseUrl(): string {
  return process.env.MARKETPLACE_API_BASE_URL ?? "http://localhost:3000";
}

function getAdminToken(): string {
  const token = process.env.MARKETPLACE_ADMIN_TOKEN;
  if (!token) {
    throw new Error("MARKETPLACE_ADMIN_TOKEN is required for admin web actions.");
  }

  return token;
}

async function fetchMarketplace<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Marketplace request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchServices(): Promise<ServiceSummary[]> {
  const data = await fetchMarketplace<{ services: ServiceSummary[] }>("/catalog/services");
  return data.services;
}

export async function fetchServiceDetail(slug: string): Promise<ServiceDetail | null> {
  const response = await fetch(`${getApiBaseUrl()}/catalog/services/${slug}`, {
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<ServiceDetail>;
}

export async function createSuggestion(input: {
  type: SuggestionType;
  serviceSlug?: string;
  title: string;
  description: string;
  sourceUrl?: string;
  requesterName?: string;
  requesterEmail?: string;
}): Promise<SuggestionRecord> {
  return fetchMarketplace<SuggestionRecord>("/catalog/suggestions", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  });
}

export async function fetchAdminSuggestions(status?: SuggestionStatus): Promise<SuggestionRecord[]> {
  const query = status ? `?status=${status}` : "";
  const data = await fetchMarketplace<{ suggestions: SuggestionRecord[] }>(`/internal/suggestions${query}`, {
    headers: {
      Authorization: `Bearer ${getAdminToken()}`
    }
  });

  return data.suggestions;
}

export async function patchAdminSuggestion(
  id: string,
  input: { status?: SuggestionStatus; internalNotes?: string | null }
): Promise<SuggestionRecord> {
  return fetchMarketplace<SuggestionRecord>(`/internal/suggestions/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getAdminToken()}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  });
}
