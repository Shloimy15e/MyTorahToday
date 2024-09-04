import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";
import { cookies } from "next/headers";

const agent = new https.Agent({
  rejectUnauthorized: false,
});

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    "${process.env.BACKEND_URL}/api/auth/token/login/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      agent: agent,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
   const accessToken = data.auth_token;
   cookies().set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "strict",
    maxAge: 3600 * 24 * 30, // 30 days
  });
  return NextResponse.json(data);
}
