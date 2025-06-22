import { type NextRequest, NextResponse } from "next/server"
import { searchNews } from "@/lib/news-service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Search query required" }, { status: 400 })
  }

  try {
    const results = await searchNews(query)

    return NextResponse.json({
      results,
      success: true,
      query,
      demo: true,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      {
        error: "Search failed",
        results: [],
        success: false,
      },
      { status: 500 },
    )
  }
}
