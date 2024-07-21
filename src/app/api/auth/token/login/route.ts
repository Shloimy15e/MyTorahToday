import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false
});

export async function POST(request: Request) {
  const { username, password } = await request.json();
  
  const response = await fetch('https://mttbackend-production.up.railway.app/api/auth/token/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    agent: agent
  });

  const data = await response.json();
  console.log(data);
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }

  return NextResponse.json(data);
}
