import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 * @description This function handles the POST request to create a new user.
 */
export async function POST(request: Request): Promise<Response> {
  console.log('POST /api/auth/users/');
  const { username, password, email } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username, and password are required' }, { status: 400 });
  }

  const response = await fetch(`${process.env.BACKEND_URL}/api/auth/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, ...(email && { email }) }),
    agent: agent
  });

  const data = await response.json();

  if (!response.ok) {
    console.error({ error: data }, { status: response.status });
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data);
}