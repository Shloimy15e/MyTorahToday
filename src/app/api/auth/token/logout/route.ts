import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false,
});
/**
 * function for logging out
 * @param request
 * @returns {NextResponse}
 */
export async function POST(request: Request): Promise<Response>{
  // Get the token from the request headers
  const token = request.headers.get("Authorization");
  console.log("Token: ", token);
  const response = await fetch(
    "https://mttbackend-production.up.railway.app/api/auth/token/logout/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': "Token " + token,
      },
      agent: agent,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Error logging out:", data);
    return NextResponse.json({ error: data }, { status: response.status });
  }

  return NextResponse.json(data);
}
