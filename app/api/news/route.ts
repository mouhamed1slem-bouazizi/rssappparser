import { type NextRequest, NextResponse } from "next/server"
import { fetchAllNews, fetchNewsByCategory } from "@/lib/news-service"
import { insertArticle, getAllArticles } from "@/lib/database"
import { summarizeArticle } from "@/lib/ai-service"
import { getAvailableCategories } from "@/lib/rss-proxy"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const refresh = searchParams.get("refresh") === "true"
  const debug = searchParams.get("debug") === "true"

  try {
    if (debug) {
      // Debug endpoint to check available categories
      const availableCategories = getAvailableCategories()
      return NextResponse.json({
        debug: true,
        availableCategories,
        message: "RSS feeds with proxy support configured for these categories",
        rssMode: true,
        proxyEnabled: true,
      })
    }

    if (refresh) {
      console.log(`🔄 Refreshing RSS news${category ? ` for category: ${category}` : " for all categories"}`)

      let newsItems: any[] = []
      let fetchError: string | null = null

      try {
        if (category && category !== "All") {
          console.log(`📂 Fetching RSS for category: ${category}`)
          newsItems = await fetchNewsByCategory(category)
        } else {
          console.log("📰 Fetching RSS from all categories")
          newsItems = await fetchAllNews()
        }

        console.log(`✅ Successfully fetched ${newsItems.length} RSS news items`)
      } catch (error) {
        console.error("❌ RSS fetch error:", error)
        fetchError = error instanceof Error ? error.message : "Failed to fetch RSS feeds"
        console.log("🔄 RSS fetch failed, will try to return cached articles")
      }

      // Process articles if we have any
      if (newsItems.length > 0) {
        const itemsToProcess = newsItems.slice(0, 20)
        let processedCount = 0

        console.log(`🔄 Processing ${itemsToProcess.length} RSS articles...`)

        for (const item of itemsToProcess) {
          try {
            if (!item.title || !item.link) {
              console.warn("⚠️ Skipping item with missing title or link")
              continue
            }

            let summary = item.description || item.title
            const detectedCategory = item.category || category || "World News"

            try {
              // Add delay to prevent rate limiting
              if (processedCount > 0 && processedCount % 3 === 0) {
                console.log("⏳ Adding delay to prevent AI rate limiting...")
                await new Promise((resolve) => setTimeout(resolve, 1000))
              }

              // Only summarize if we have a substantial description
              if (item.description && item.description.length > 100) {
                console.log(`🤖 AI summarizing: ${item.title.substring(0, 50)}...`)
                summary = await summarizeArticle(item.title, item.description)
                console.log(`✅ AI processing complete`)
              }
            } catch (aiError) {
              console.warn("⚠️ AI processing failed, using original content:", aiError)
            }

            await insertArticle({
              title: item.title.substring(0, 500),
              description: item.description ? item.description.substring(0, 1000) : null,
              link: item.link,
              pub_date: item.pubDate ? new Date(item.pubDate) : new Date(),
              source: item.source || "RSS Feed",
              category: detectedCategory,
              image_url: item.imageUrl || null,
              summary: summary.substring(0, 500),
            })

            processedCount++
            console.log(`✅ Processed RSS article ${processedCount}/${itemsToProcess.length}`)
          } catch (error) {
            console.error("❌ Error processing individual article:", error)
            continue
          }
        }

        console.log(`🎉 Successfully processed ${processedCount} RSS articles`)
      }
    }

    // Fetch articles from database
    console.log(`📖 Fetching articles from database for category: ${category || "All"}`)

    const articles =
      category && category !== "All"
        ? await import("@/lib/database").then((db) => db.getArticlesByCategory(category))
        : await getAllArticles()

    console.log(`📊 Returning ${articles.length} articles from database`)

    // Determine response message
    let responseMessage = undefined
    let isError = false

    if (refresh && articles.length === 0) {
      responseMessage = `No articles available${category ? ` for ${category}` : ""}. RSS feeds may be blocked or unavailable.`
      isError = true
    } else if (refresh && articles.length > 0) {
      responseMessage = `Loaded ${articles.length} articles from RSS feeds${category ? ` for ${category}` : ""}`
    }

    return NextResponse.json({
      articles,
      success: !isError,
      rssMode: true,
      proxyEnabled: true,
      category: category || "All",
      message: responseMessage,
      stats: {
        total: articles.length,
        category: category || "All",
        source: "RSS Feeds with Proxy Support",
      },
    })
  } catch (error) {
    console.error("💥 Critical error in news API:", error)

    // Try to return cached articles
    try {
      const articles =
        category && category !== "All"
          ? await import("@/lib/database").then((db) => db.getArticlesByCategory(category))
          : await getAllArticles()

      return NextResponse.json({
        articles,
        success: false,
        error: "RSS feeds temporarily unavailable - showing cached articles",
        cached: true,
        rssMode: true,
        proxyEnabled: true,
      })
    } catch (dbError) {
      console.error("💥 Database error:", dbError)
      return NextResponse.json(
        {
          error: "News service temporarily unavailable. RSS feeds and database are not accessible.",
          articles: [],
          success: false,
          rssMode: true,
          proxyEnabled: true,
        },
        { status: 500 },
      )
    }
  }
}
