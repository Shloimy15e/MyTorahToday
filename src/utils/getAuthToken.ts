import { cookies } from "next/headers";

export function getAuthToken(request: Request): string | null {
  const cookieToken = cookies().get("auth_token")?.value;
  if (cookieToken) return cookieToken;
  return request.headers.get("Authorization") || null;
}
