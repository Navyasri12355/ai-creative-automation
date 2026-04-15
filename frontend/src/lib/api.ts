const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function clearToken() {
  localStorage.removeItem("access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const auth = {
  register: (payload: { email: string; password: string; name: string; role?: string }) =>
    request<{ access_token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),
};

// ── Brands ────────────────────────────────────────────────────────────────
export const brands = {
  list: () => request<Brand[]>("/brands"),
  get: (id: string) => request<Brand>(`/brands/${id}`),
  create: (payload: BrandCreate) =>
    request<Brand>("/brands", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: BrandCreate) =>
    request<Brand>(`/brands/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  uploadLogo: async (brandId: string, file: File) => {
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_URL}/brands/${brandId}/logo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error("Logo upload failed");
    return res.json() as Promise<{ logo_url: string }>;
  },
};

// ── Creatives ─────────────────────────────────────────────────────────────
export const creatives = {
  list: (brandId: string, limit = 20, offset = 0) =>
    request<Creative[]>(`/creatives?brand_id=${brandId}&limit=${limit}&offset=${offset}`),
  get: (id: string) => request<Creative>(`/creatives/${id}`),
  generate: (payload: CreativeGenerateRequest) =>
    request<Creative>("/creatives/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStatus: (id: string, status: string) =>
    request<{ id: string; status: string }>(`/creatives/${id}/status?status=${status}`, {
      method: "PATCH",
    }),
  trackDownload: (id: string) =>
    request<{ ok: boolean }>(`/creatives/${id}/download`, { method: "POST" }),
  delete: (id: string) => request<void>(`/creatives/${id}`, { method: "DELETE" }),
};

// ── Festivals ─────────────────────────────────────────────────────────────
export const festivals = {
  list: (params?: { upcoming_only?: boolean; days_ahead?: number; region?: string }) => {
    const qs = new URLSearchParams();
    if (params?.upcoming_only) qs.set("upcoming_only", "true");
    if (params?.days_ahead) qs.set("days_ahead", String(params.days_ahead));
    if (params?.region) qs.set("region", params.region);
    return request<Festival[]>(`/festivals?${qs.toString()}`);
  },
  upcoming: (days = 30) => request<Festival[]>(`/festivals/upcoming?days=${days}`),
  get: (id: string) => request<Festival>(`/festivals/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────
export const analytics = {
  summary: (brandId: string) =>
    request<AnalyticsSummary>(`/analytics/summary?brand_id=${brandId}`),
};

// ── Types ─────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: "brand-admin" | "marketing-manager" | "content-creator";
  brand_id: string | null;
  created_at: string;
}

export interface BrandColor {
  name: string;
  hex: string;
  usage: "primary" | "secondary" | "accent" | "background";
}

export interface BrandCreate {
  name: string;
  industry: string;
  target_regions: string[];
  design_style: "modern" | "traditional" | "minimal" | "vibrant";
  cultural_sensitivity: string;
  language_preferences: string[];
  guidelines?: string;
  colors: BrandColor[];
}

export interface Brand extends BrandCreate {
  id: string;
  owner_id: string;
  logo_url: string | null;
  created_at: string;
}

export interface Festival {
  id: string;
  name: string;
  name_translations: Record<string, string>;
  festival_type: "national" | "regional" | "religious" | "cultural";
  regions: string[];
  start_date: string;
  end_date: string;
  colors: string[];
  symbols: string[];
  themes: string[];
  greetings: Record<string, string>;
  marketing_relevance: string;
  days_until?: number;
}

export interface CreativeGenerateRequest {
  brand_id: string;
  festival_id?: string;
  occasion_type?: string;
  platforms: string[];
  languages: string[];
  custom_message?: string;
  tone?: string;
  include_offer?: string;
}

export interface GeneratedImage {
  platform: string;
  width: number;
  height: number;
  url: string;
  format: string;
}

export interface Creative {
  id: string;
  brand_id: string;
  festival_id?: string;
  occasion_type: string;
  platforms: string[];
  texts: Record<string, string>;
  images: GeneratedImage[];
  ai_prompt_used?: string;
  status: "draft" | "approved" | "published";
  generated_at: string;
  views: number;
  downloads: number;
}

export interface AnalyticsSummary {
  total_creatives: number;
  total_downloads: number;
  total_views: number;
  top_platforms: { platform: string; count: number }[];
  top_festivals: { festival_id: string; count: number }[];
  recent_creatives: {
    id: string;
    occasion_type: string;
    status: string;
    generated_at: string;
    downloads: number;
  }[];
}