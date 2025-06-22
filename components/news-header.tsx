"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search } from "lucide-react"
import { LanguageSelector } from "./language-selector"
import { useState } from "react"
import { AIStatusIndicator } from "./ai-status-indicator"

interface NewsHeaderProps {
  onRefresh: () => void
  onSearch: (query: string) => void
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  isLoading: boolean
}

export function NewsHeader({ onRefresh, onSearch, selectedLanguage, onLanguageChange, isLoading }: NewsHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">AI News Hub</h1>
            <div className="flex items-center gap-2">
              <AIStatusIndicator />
              <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={onLanguageChange} />
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={!searchQuery.trim()}>
              Search
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
