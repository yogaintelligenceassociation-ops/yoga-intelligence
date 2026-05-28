// Centralised API client for Yoga Intelligence.
// `REACT_APP_API_BASE_URL` is inlined at build time. When unset (Vercel default)
// we hit relative `/api/*` paths so the same code works locally (via the Craco
// dev-server proxy) and in production (where the frontend and serverless
// functions share a domain).

const RAW_BASE = (process.env.REACT_APP_API_BASE_URL || "").trim().replace(/\/+$/, "");
export const API_BASE = RAW_BASE;
export const JWT_STORAGE_KEY = "yi_jwt_token";
export const PHONE_STORAGE_KEY = "yi_phone";
export const NAME_STORAGE_KEY = "yi_name";

function url(path) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
}

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem(JWT_STORAGE_KEY) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, { body, auth = false, signal } = {}) {
  const headers = { Accept: "application/json", ...(auth ? authHeaders() : {}) };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(url(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    throw new ApiError("Network error. Please check your connection and try again.", 0);
  }

  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(typeof message === "string" ? message : "Request failed", res.status, data);
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const api = {
  sendOtp: (phone) => request("POST", "/api/auth/send-otp", { body: { phone } }),
  verifyOtp: (phone, otp, name = "") =>
    request("POST", "/api/auth/verify-otp", { body: { phone, otp, name } }),
  me: () => request("GET", "/api/auth/me", { auth: true }),
  chat: (messages, sessionId, signal) =>
    request("POST", "/api/chat", {
      body: { messages, session_id: sessionId || null },
      auth: true,
      signal,
    }),
};
