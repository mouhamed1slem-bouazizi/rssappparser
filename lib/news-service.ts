import { fetchNewsByCategory as fetchRSSByCategory, fetchAllNews as fetchAllRSSNews } from "./rss-proxy"

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  source?: string
  category?: string
  imageUrl?: string
}

export async function fetchNewsByCategory(category: string): Promise<RSSItem[]> {
  console.log(`🔄 Fetching RSS news for category: ${category}`)

  try {
    const items = await fetchRSSByCategory(category)
    console.log(`✅ Successfully fetched ${items.length} articles for ${category}`)
    return items
  } catch (error) {
    console.error(`❌ Failed to fetch RSS news for ${category}:`, error)
    throw new Error(
      `Failed to load ${category} news: ${error instanceof Error ? error.message : "RSS feeds unavailable"}`,
    )
  }
}

export async function fetchAllNews(): Promise<RSSItem[]> {
  console.log("🔄 Fetching RSS news from all categories")

  try {
    const items = await fetchAllRSSNews()
    console.log(`✅ Successfully fetched ${items.length} articles from all categories`)
    return items
  } catch (error) {
    console.error("❌ Failed to fetch RSS news from all categories:", error)
    throw new Error(`Failed to load news: ${error instanceof Error ? error.message : "All RSS feeds unavailable"}`)
  }
}

export async function searchNews(query: string): Promise<RSSItem[]> {
  console.log(`🔍 Searching news for: "${query}"`)

  try {
    // For search, we'll fetch from all categories and filter
    const allNews = await fetchAllNews()
    const searchResults = allNews.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()),
    )

    console.log(`✅ Found ${searchResults.length} search results for: "${query}"`)
    return searchResults.map((item) => ({ ...item, category: "Search" }))
  } catch (error) {
    console.error(`❌ Search failed for: "${query}"`, error)
    throw new Error(`Search failed: ${error instanceof Error ? error.message : "RSS feeds unavailable"}`)
  }
}
