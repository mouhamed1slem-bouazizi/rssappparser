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
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{displayTitle}</CardTitle>
          {article.image_url && (
            <img
              src={article.image_url || "/placeholder.svg"}
              alt={article.title}
              className="w-20 h-20 object-cover rounded-md flex-shrink-0"
            />
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{article.pub_date ? new Date(article.pub_date).toLocaleDateString() : "Unknown date"}</span>
          {article.source && (
            <>
              <span>•</span>
              <span>{article.source}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {article.category && (
            <Badge variant="secondary" className="text-xs">
              {article.category}
            </Badge>
          )}

          {displaySummary && <p className="text-sm text-muted-foreground line-clamp-3">{displaySummary}</p>}

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(article.link, "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Read Full Article
            </Button>

            {userLanguage !== "en" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating || isTranslated}
                className="flex items-center gap-2"
              >
                {isTranslating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {isTranslated ? "Translated" : "Translate"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
