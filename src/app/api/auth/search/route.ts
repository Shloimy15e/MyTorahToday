import { NextResponse } from 'next/server'
import { searchVideos } from '@/lib/videoData'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const results = await searchVideos(query)
  return NextResponse.json(results)
}
