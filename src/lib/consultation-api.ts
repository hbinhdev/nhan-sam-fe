export type CreateConsultationPayload = {
  fullName: string;
  phone: string;
  interest: string;
  message?: string;
};

export const CONSULTATION_SUCCESS_MESSAGE =
  "Yêu cầu tư vấn đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.";
export const CONSULTATION_ERROR_MESSAGE =
  "Không thể gửi yêu cầu tư vấn. Vui lòng thử lại.";

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

  if (!response.ok) {
    throw new Error(CONSULTATION_ERROR_MESSAGE);
  }

  return response.json().catch(() => ({ message: CONSULTATION_SUCCESS_MESSAGE }));
}
