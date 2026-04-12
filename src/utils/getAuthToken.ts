import { cookies } from "next/headers";

export async function getAuthToken(request: Request): Promise<string | null> {
  const cookieToken = (await cookies()).get("auth_token")?.value;
  if (cookieToken) return cookieToken;
  return request.headers.get("Authorization") || null;
}
