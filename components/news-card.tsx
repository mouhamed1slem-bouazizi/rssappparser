"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Globe, Clock, Sparkles } from "lucide-react"
import type { Article } from "@/lib/database"

interface NewsCardProps {
  article: Article
  userLanguage: string
  onTranslate: (text: string, language: string) => Promise<string>
}

export function NewsCard({ article, userLanguage, onTranslate }: NewsCardProps) {
  const [translatedTitle, setTranslatedTitle] = useState<string>("")
  const [translatedSummary, setTranslatedSummary] = useState<string>("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isTranslated, setIsTranslated] = useState(false)

  const handleTranslate = async () => {
    if (userLanguage === "en" || isTranslated) return

    setIsTranslating(true)
    try {
      const [titleTranslation, summaryTranslation] = await Promise.all([
        onTranslate(article.title, userLanguage),
        onTranslate(article.summary || article.description || "", userLanguage),
      ])

      setTranslatedTitle(titleTranslation)
      setTranslatedSummary(summaryTranslation)
      setIsTranslated(true)
    } catch (error) {
      console.error("Translation failed:", error)
    } finally {
      setIsTranslating(false)
    }
  }

  const displayTitle = isTranslated ? translatedTitle : article.title
  const displaySummary = isTranslated ? translatedSummary : article.summary || article.description

  return (
    <Card className="w-full h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="space-y-3 sm:space-y-0">
          <div className="space-y-2">
            <CardTitle className="text-base sm:text-lg font-semibold leading-tight line-clamp-2 sm:line-clamp-3">
              {displayTitle}
            </CardTitle>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                {article.pub_date ? new Date(article.pub_date).toLocaleDateString() : "Unknown date"}
              </span>
              {article.source && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="truncate text-xs sm:text-sm max-w-[120px] sm:max-w-none">
                    {article.source}
                  </span>
                </>
              )}
            </div>
          </div>

          {article.image_url && (
            <div className="flex justify-center sm:justify-start">
              <img
                src={article.image_url || "/placeholder.svg"}
                alt={article.title}
                className="w-full max-w-[200px] sm:w-20 sm:h-20 h-32 sm:h-20 object-cover rounded-md"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {article.category && (
            <Badge 
              variant="secondary" 
              className="text-xs w-fit"
            >
              {article.category}
            </Badge>
          )}

          {displaySummary && (
            <p className="text-sm text-muted-foreground line-clamp-3 sm:line-clamp-4 leading-relaxed flex-1">
              {displaySummary}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(article.link, "_blank")}
            className="flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Read Full Article</span>
          </Button>

          {userLanguage !== "en" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTranslate}
              disabled={isTranslating || isTranslated}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isTranslating ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span className="text-xs sm:text-sm">
                {isTranslated ? "Translated" : "Translate"}
              </span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
