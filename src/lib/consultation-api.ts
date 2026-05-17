import { getAuthSession } from "@/lib/auth-api";

export type ConsultationStatus = "PENDING" | "CONTACTED" | "CANCELLED";

export type ConsultationItem = {
  id: string;
  fullName: string;
  phone: string;
  interest: string;
  message: string | null;
  status: ConsultationStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateConsultationPayload = {
  fullName: string;
  phone: string;
  interest: string;
  message?: string;
};

export type ConsultationListResponse = {
  data: ConsultationItem[];
  total: number;
  page: number;
  limit: number;
};

export type ConsultationQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ConsultationStatus;
};

export const CONSULTATION_SUCCESS_MESSAGE =
  "Yêu cầu tư vấn đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.";
export const CONSULTATION_ERROR_MESSAGE =
  "Không thể gửi yêu cầu tư vấn. Vui lòng thử lại.";

export const ACTIVE_CONSULTATION_MESSAGE =
  "Bạn đang có yêu cầu tư vấn đang chờ xử lý. Vui lòng đợi tư vấn viên liên hệ trước khi gửi yêu cầu mới.";

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";
const VIETNAMESE_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

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

function parseConsultationItem(value: unknown): ConsultationItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const status = item.status;

  if (
    typeof item.id !== "string" ||
    typeof item.fullName !== "string" ||
    typeof item.phone !== "string" ||
    typeof item.interest !== "string" ||
    (status !== "PENDING" && status !== "CONTACTED" && status !== "CANCELLED") ||
    typeof item.createdAt !== "string" ||
    typeof item.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    fullName: item.fullName,
    phone: item.phone,
    interest: item.interest,
    message: typeof item.message === "string" ? item.message : null,
    status,
    note: typeof item.note === "string" ? item.note : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function parseErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message[0];
    }
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && `${value}`.trim() !== "") {
      query.set(key, String(value));
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function isValidVietnamesePhone(phone: string) {
  return VIETNAMESE_PHONE_REGEX.test(phone.trim());
}

export function validateConsultationPayload(payload: CreateConsultationPayload) {
  if (!payload.fullName.trim()) {
    return "Vui lòng nhập họ và tên.";
  }

  if (!payload.phone.trim()) {
    return "Vui lòng nhập số điện thoại.";
  }

  if (!isValidVietnamesePhone(payload.phone)) {
    return "Số điện thoại không hợp lệ.";
  }

  if (!payload.interest.trim()) {
    return "Vui lòng chọn nhu cầu quan tâm.";
  }

  return null;
}

export async function checkConsultationAvailability(phone: string) {
  const normalizedPhone = phone.trim();
  if (!isValidVietnamesePhone(normalizedPhone)) {
    return {
      canSubmit: true,
      activeConsultation: null as ConsultationItem | null,
      message: null as string | null,
    };
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/consultations/availability${buildQuery({ phone: normalizedPhone })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );
  } catch {
    return {
      canSubmit: true,
      activeConsultation: null,
      message: "Không thể kiểm tra trạng thái tư vấn lúc này.",
    };
  }

  if (!response.ok) {
    return {
      canSubmit: true,
      activeConsultation: null,
      message: "Không thể kiểm tra trạng thái tư vấn lúc này.",
    };
  }

  const payload = (await response.json().catch(() => ({}))) as {
    canSubmit?: boolean;
    activeConsultation?: unknown;
  };

  const activeConsultation = parseConsultationItem(payload.activeConsultation);

  if (payload.canSubmit === false || activeConsultation) {
    return {
      canSubmit: false,
      activeConsultation,
      message: ACTIVE_CONSULTATION_MESSAGE,
    };
  }

  return {
    canSubmit: true,
    activeConsultation: null,
    message: null,
  };
}

export async function createConsultation(payload: CreateConsultationPayload) {
  const validationError = validateConsultationPayload(payload);
  if (validationError) {
    throw new Error(validationError);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/consultations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: payload.fullName.trim(),
        phone: payload.phone.trim(),
        interest: payload.interest.trim(),
        message: payload.message?.trim() || undefined,
      }),
    });
  } catch {
    throw new Error(CONSULTATION_ERROR_MESSAGE);
  }

  if (response.status === 409) {
    const message = await parseErrorMessage(response, ACTIVE_CONSULTATION_MESSAGE);
    throw new Error(message || ACTIVE_CONSULTATION_MESSAGE);
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response, CONSULTATION_ERROR_MESSAGE);
    throw new Error(message || CONSULTATION_ERROR_MESSAGE);
  }

  return response.json().catch(() => ({ message: CONSULTATION_SUCCESS_MESSAGE }));
}

function requireAdminToken() {
  const token = getAuthSession()?.access_token;
  if (!token) {
    throw new Error("Session expired. Please sign in again.");
  }

  return token;
}

export async function adminGetConsultations(
  params: ConsultationQueryParams = {},
): Promise<ConsultationListResponse> {
  const token = requireAdminToken();

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/consultations${buildQuery({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status,
      })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please sign in again.");
    }
    if (response.status === 403) {
      throw new Error("Forbidden. Admin access is required.");
    }

    const message = await parseErrorMessage(response, "Failed to load consultations.");
    throw new Error(message);
  }

  const payload = (await response.json()) as Partial<ConsultationListResponse>;
  const data = Array.isArray(payload.data)
    ? payload.data
        .map((item) => parseConsultationItem(item))
        .filter((item): item is ConsultationItem => item !== null)
    : [];

  return {
    data,
    total: typeof payload.total === "number" ? payload.total : data.length,
    page: typeof payload.page === "number" ? payload.page : params.page ?? 1,
    limit: typeof payload.limit === "number" ? payload.limit : params.limit ?? 10,
  };
}

export async function adminUpdateConsultationStatus(
  id: string,
  status: ConsultationStatus,
) {
  const token = requireAdminToken();

  const response = await fetch(`${API_BASE_URL}/consultations/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Failed to update consultation status.");
    throw new Error(message);
  }

  return response.json().catch(() => ({}));
}

export async function adminUpdateConsultationNote(id: string, note: string) {
  const token = requireAdminToken();

  const response = await fetch(`${API_BASE_URL}/consultations/${id}/note`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Failed to update consultation note.");
    throw new Error(message);
  }

  return response.json().catch(() => ({}));
}
