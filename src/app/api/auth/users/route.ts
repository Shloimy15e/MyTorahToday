import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<Response> {
  const { username, password, email } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, ...(email && { email }) }),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data);
}
