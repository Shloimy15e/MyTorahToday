import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const url = `https://api.ginzburg.io/zmanim/shabbat?cl_offset=18&lat=32.09&lng=34.86&elevation=0&havdala=tzeis_8_5_degrees`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }
  return NextResponse.json(data, { status: response.status });
}
