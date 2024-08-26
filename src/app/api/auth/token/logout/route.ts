import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";
import { cookies } from "next/headers";
import { serialize } from "cookie"

const agent = new https.Agent({
  rejectUnauthorized: false,
});
/**
 * function for logging out
 * @param request
 * @returns {NextResponse}
 */
export async function POST(request: Request): Promise<Response> {
  // Get the token from the request headers
  const token = cookies().get("auth_token")?.value || null;
  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  const response = await fetch(
    "https://mttbackend-production.up.railway.app/api/auth/token/logout/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      agent: agent,
    }
  );

  if (response.ok) {
    // Clear the auth_token cookie
    const authTokenCookie = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });
    // Handle successful logout
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200, headers: { 'Set-Cookie': authTokenCookie } }
    );
  } else {
    // Handle error responses
    try {
      const errorData = await response.json();
      console.error("Error logging out:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "Logout failed" },
        { status: response.status }
      );
    } catch (error) {
      console.error("Error parsing error response:", error);
      return NextResponse.json(
        { error: "Unexpected server response" },
        { status: response.status }
      );
    }
  }
}
