export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";
export const AUTH_STORAGE_KEY = "customer_auth_session";
export const AUTH_SESSION_CHANGED_EVENT = "customer-auth-session-changed";

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

function toUserFriendlyError(status: number, fallback: string) {
  if (status === 400) {
    return "Thông tin đăng ký chưa hợp lệ hoặc email đã tồn tại.";
  }

  if (status === 401) {
    return "Email hoặc mật khẩu không đúng.";
  }

  if (status >= 500) {
    return "Hệ thống đang bận. Vui lòng thử lại sau.";
  }

  return fallback;
}

async function parseErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    const rawMessage = data?.message;

    if (Array.isArray(rawMessage) && rawMessage.length > 0) {
      return rawMessage[0];
    }

    if (typeof rawMessage === "string" && rawMessage.trim()) {
      return rawMessage;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

async function parseAuthResponse(response: Response, fallbackError: string): Promise<AuthResponse> {
  if (!response.ok) {
    const friendly = toUserFriendlyError(response.status, fallbackError);
    const apiMessage = await parseErrorMessage(response, friendly);

    if (response.status === 400 && apiMessage.toLowerCase().includes("email already exists")) {
      throw new Error("Email đã được sử dụng. Vui lòng dùng email khác.");
    }

    if (response.status === 401) {
      throw new Error("Email hoặc mật khẩu không đúng.");
    }

    throw new Error(apiMessage || friendly);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error(fallbackError);
  }

  const data = payload as Partial<AuthResponse>;

  if (
    typeof data.access_token !== "string" ||
    typeof data.refresh_token !== "string" ||
    !data.user ||
    typeof data.user !== "object"
  ) {
    throw new Error(fallbackError);
  }

  const userRaw = data.user as Partial<AuthUser>;

  if (typeof userRaw.id !== "string" || typeof userRaw.email !== "string") {
    throw new Error(fallbackError);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: {
      id: userRaw.id,
      email: userRaw.email,
      name: typeof userRaw.name === "string" ? userRaw.name : null,
      phone: typeof userRaw.phone === "string" ? userRaw.phone : null,
      role: typeof userRaw.role === "string" ? userRaw.role : null,
    },
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
      }),
    });
  } catch {
    throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại.");
  }

  return parseAuthResponse(response, "Đăng nhập thất bại. Vui lòng thử lại.");
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      }),
    });
  } catch {
    throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại.");
  }

  return parseAuthResponse(response, "Đăng ký thất bại. Vui lòng thử lại.");
}

function notifyAuthSessionChanged(session: AuthResponse | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AuthResponse | null>(AUTH_SESSION_CHANGED_EVENT, {
      detail: session,
    }),
  );
}

export function storeAuthSession(data: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  notifyAuthSessionChanged(data);
}

export function getAuthSession(): AuthResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw) as Partial<AuthResponse>;
    if (
      typeof data.access_token !== "string" ||
      typeof data.refresh_token !== "string" ||
      !data.user ||
      typeof data.user !== "object"
    ) {
      return null;
    }

    return data as AuthResponse;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  notifyAuthSessionChanged(null);
}
