"use client"

import { useState, useEffect, useCallback } from "react"
import { NewsCard } from "@/components/news-card"
import { CategoryFilter } from "@/components/category-filter"
import { NewsHeader } from "@/components/news-header"
import { Button } from "@/components/ui/button"
import { Loader2, Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react"
import type { Article } from "@/lib/database"

export default function NewsApp() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRSSMode, setIsRSSMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`)

  const fetchNews = useCallback(async (refresh = false, category?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (refresh) params.append("refresh", "true")
      if (category && category !== "All") params.append("category", category)

      console.log(`🔄 Fetching REAL RSS news with params: ${params.toString()}`)

      const response = await fetch(`/api/news?${params}`)
      const data = await response.json()

      // Check if we're in RSS mode
      setIsRSSMode(data.rssMode || false)

      if (!response.ok && !data.cached) {
        throw new Error(data.error || "Failed to fetch news")
      }

      // Show appropriate messages based on response
      if (data.cached) {
        setError("📱 RSS feeds unavailable - showing cached articles")
      } else if (data.message) {
        setError(data.success ? `✅ ${data.message}` : `⚠️ ${data.message}`)
      } else if (data.articles.length === 0) {
        setError(`❌ No articles available${category ? ` for ${category}` : ""}. RSS feeds may be down.`)
      }

      setArticles(data.articles || [])
      console.log(`✅ Loaded ${data.articles?.length || 0} articles for category: ${category || "All"}`)

      // Log stats
      if (data.stats) {
        console.log("📊 Stats:", data.stats)
      }
    } catch (error) {
      console.error("❌ Error fetching news:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch RSS news feeds")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchDebugInfo = useCallback(async () => {
    try {
      const response = await fetch("/api/news?debug=true")
      const data = await response.json()
      setDebugInfo(data)
      console.log("🐛 Debug info:", data)
    } catch (error) {
      console.error("❌ Failed to fetch debug info:", error)
    }
  }, [])

  const handleTranslate = useCallback(async (text: string, targetLanguage: string): Promise<string> => {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Translation failed")
      }

      return data.translatedText
    } catch (error) {
      console.error("❌ Translation error:", error)
      return text
    }
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Search failed")
      }

      // Convert search results to article format
      const searchArticles = data.results.map((result: any, index: number) => ({
        id: `search-${index}`,
        title: result.title,
        description: result.description,
        link: result.link,
        pub_date: new Date(result.pubDate),
        source: result.source,
        category: "Search",
        summary: result.description,
        created_at: new Date(),
        updated_at: new Date(),
      }))

      setArticles(searchArticles)
      console.log(`🔍 Search completed: ${searchArticles.length} results for "${query}"`)
    } catch (error) {
      console.error("❌ Search error:", error)
      setError("Search failed - RSS feeds may be unavailable")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCategoryChange = useCallback(
    (category: string) => {
      console.log(`📂 Changing category to: ${category}`)
      setSelectedCategory(category)
      fetchNews(false, category)
    },
    [fetchNews],
  )

  const handleRefresh = useCallback(() => {
    console.log(`🔄 Refreshing RSS news for category: ${selectedCategory}`)
    fetchNews(true, selectedCategory === "All" ? undefined : selectedCategory)
  }, [fetchNews, selectedCategory])

  // Load initial news and debug info
  useEffect(() => {
    console.log("🚀 App starting - loading RSS news")
    fetchNews(true)
    fetchDebugInfo()
  }, [fetchNews, fetchDebugInfo])

  // Save user preferences
  useEffect(() => {
    const savePreferences = async () => {
      try {
        await fetch("/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            preferences: {
              preferred_language: selectedLanguage,
              preferred_categories: selectedCategory === "All" ? [] : [selectedCategory],
            },
          }),
        })
      } catch (error) {
        console.error("❌ Failed to save preferences:", error)
      }
    }

    savePreferences()
  }, [userId, selectedLanguage, selectedCategory])

  const filteredArticles =
    selectedCategory === "All" ? articles : articles.filter((article) => article.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background">
      <NewsHeader
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        isLoading={isLoading}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {isRSSMode && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Wifi className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="text-green-900 font-semibold text-lg">🌐 Live RSS Mode - Real News Feeds</h3>
                  <p className="text-green-800">
                    Connected to real RSS feeds with proxy support to bypass CORS restrictions. All articles are fetched
                    live from actual news sources.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">📡 RSS + Proxy</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">🤖 AI Summarization</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      🌍 Multi-language Translation
                    </span>
                  </div>
                  {debugInfo && (
                    <details className="mt-3">
                      <summary className="text-green-700 cursor-pointer text-sm">
                        📊 RSS Feed Info (Click to expand)
                      </summary>
                      <div className="mt-2 text-xs bg-green-100 p-2 rounded">
                        <p>Available Categories: {debugInfo.availableCategories?.join(", ")}</p>
                        <p className="mt-1 text-green-600">Using multiple RSS sources with proxy fallbacks</p>
                        <p className="mt-1 text-green-600">
                          Includes: TechCrunch, BBC, Reuters, ESPN, GameSpot, and more
                        </p>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />

          {error && (
            <div
              className={`border rounded-lg p-4 ${
                error.includes("✅")
                  ? "bg-green-50 border-green-200"
                  : error.includes("📱") || error.includes("⚠️")
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-2">
                {error.includes("❌") ? (
                  <WifiOff className="w-5 h-5 text-red-600 mt-0.5" />
                ) : error.includes("⚠️") || error.includes("📱") ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                ) : (
                  <Wifi className="w-5 h-5 text-green-600 mt-0.5" />
                )}
                <div>
                  <p
                    className={`text-sm ${
                      error.includes("✅")
                        ? "text-green-800"
                        : error.includes("📱") || error.includes("⚠️")
                          ? "text-yellow-800"
                          : "text-red-800"
                    }`}
                  >
                    {error}
                  </p>
                  {(error.includes("❌") || error.includes("⚠️")) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="mt-2 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry RSS Feeds
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {isLoading && articles.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium">Loading RSS feeds...</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory !== "All"
                      ? `Fetching ${selectedCategory} from Google News`
                      : "Fetching from all RSS categories"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {filteredArticles.length > 0 && (
                <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-600" />
                  Showing {filteredArticles.length} articles from RSS feeds
                  {selectedCategory !== "All" && ` in ${selectedCategory}`}
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    userLanguage={selectedLanguage}
                    onTranslate={handleTranslate}
                  />
                ))}
              </div>
            </>
          )}

          {!isLoading && filteredArticles.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="space-y-4">
                <WifiOff className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground">No RSS articles available</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory !== "All"
                      ? `No ${selectedCategory} articles found in RSS feeds`
                      : "RSS feeds may be temporarily unavailable"}
                  </p>
                </div>
                <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Loading RSS Feeds
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
