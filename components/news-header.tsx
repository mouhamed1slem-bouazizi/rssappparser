"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Menu, X } from "lucide-react"
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
      setIsMobileMenuOpen(false) // Close mobile menu after search
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden">
          <h1 className="text-xl sm:text-2xl font-bold">AI News Hub</h1>
          <div className="flex items-center gap-2">
            <AIStatusIndicator />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl xl:text-3xl font-bold">AI News Hub</h1>
            <div className="flex items-center gap-3">
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
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
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

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-200 ease-in-out ${
          isMobileMenuOpen 
            ? "max-h-96 opacity-100 mt-4" 
            : "max-h-0 opacity-0 overflow-hidden"
        }`}>
          <div className="space-y-4 pb-4">
            {/* Mobile Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <LanguageSelector 
                selectedLanguage={selectedLanguage} 
                onLanguageChange={onLanguageChange} 
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Mobile Search */}
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
              <Button type="submit" disabled={!searchQuery.trim()} size="sm">
                <Search className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
