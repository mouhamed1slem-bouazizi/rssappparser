"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"

const CATEGORIES = [
  "All",
  "Technology",
  "World News", 
  "Business",
  "Sports",
  "Entertainment",
  "Health",
  "Science",
  "Politics",
  "Gaming",
  "AI",
]

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      const threshold = 5 // Small threshold to account for rounding
      
      setCanScrollLeft(scrollLeft > threshold)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - threshold)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      // Check initial scroll state
      const timeoutId = setTimeout(() => {
        checkScrollPosition()
      }, 100)

      // Add scroll listener
      const handleScroll = () => {
        checkScrollPosition()
        setIsScrolling(true)
        
        // Clear scrolling state after scroll ends
        clearTimeout(window.scrollTimeout)
        window.scrollTimeout = window.setTimeout(() => {
          setIsScrolling(false)
        }, 150)
      }

      container.addEventListener('scroll', handleScroll, { passive: true })
      
      // Handle resize
      const handleResize = () => {
        setTimeout(checkScrollPosition, 100)
      }
      window.addEventListener('resize', handleResize)

      return () => {
        clearTimeout(timeoutId)
        container.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
        clearTimeout(window.scrollTimeout)
      }
    }
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(200, scrollContainerRef.current.clientWidth * 0.8)
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.min(200, scrollContainerRef.current.clientWidth * 0.8)
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="w-full">
      {/* Mobile/Tablet: Horizontal scroll with navigation arrows */}
      <div className="relative lg:hidden">
        <div className="relative overflow-hidden">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg hover:bg-background transition-all duration-200 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm border shadow-lg hover:bg-background transition-all duration-200 ${
              canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Scrollable Categories */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-2"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              paddingLeft: '12px',
              paddingRight: '12px'
            }}
          >
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  console.log(`📂 Category clicked: ${category}`)
                  onCategoryChange(category)
                }}
                className={`whitespace-nowrap min-w-fit px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Gradient overlays for better visual indication */}
          <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`} />
          <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
      </div>

      {/* Desktop: Wrap layout */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-2 px-1">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log(`📂 Category clicked (desktop): ${category}`)
                onCategoryChange(category)
              }}
              className={`whitespace-nowrap transition-all duration-200 hover:scale-105 ${
                selectedCategory === category 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
