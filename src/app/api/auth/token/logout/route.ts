import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serialize } from "cookie";

export async function POST(request: Request): Promise<Response> {
  const token = (await cookies()).get("auth_token")?.value || null;
  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/auth/token/logout/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (response.ok) {
    const authTokenCookie = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200, headers: { "Set-Cookie": authTokenCookie } }
    );
  } else {
    try {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || "Logout failed" },
        { status: response.status }
      );
    } catch {
      return NextResponse.json(
        { error: "Unexpected server response" },
        { status: response.status }
      );
    }
  }
}
