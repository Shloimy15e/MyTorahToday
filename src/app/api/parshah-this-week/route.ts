import { NextResponse } from "next/server";
import fetch from "node-fetch";
import https from "https";

export async function GET(request: Request): Promise<Response> {
  const url = `https://api.ginzburg.io/zmanim/shabbat?cl_offset=18&lat=32.09&lng=34.86&elevation=0&havdala=tzeis_8_5_degrees`;
  const response = await fetch(url, {
    method: "GET",
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
