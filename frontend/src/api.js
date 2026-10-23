export const API = "http://127.0.0.1:8000";
export async function api(method, path, body) {
  let response;
  try {
    response = await fetch(API + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Backend is not responding. Run: .venv/bin/uvicorn main:app --reload --port 8000",
    );
  }
  
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(readDetail(data, response.status));
  }
  return { status: response.status, data, method, path };
}
function readDetail(data, status) {
  const detail = data.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = Array.isArray(item.loc)
          ? item.loc.slice(1).join(".")
          : "";
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join("; ");
  }
  return `Request failed (${status}).`;
}
