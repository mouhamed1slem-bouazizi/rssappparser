"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      // Check initial state after a short delay to ensure content is rendered
      setTimeout(checkScrollPosition, 100)
      return () => container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="w-full">
      {/* Mobile/Tablet: Horizontal scroll with navigation arrows */}
      <div className="relative lg:hidden">
        {/* Left Arrow */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border shadow-md hover:bg-background"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        
        {/* Scrollable Categories */}
        <div className="overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 px-1 py-2 overflow-x-auto scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              paddingLeft: canScrollLeft ? '40px' : '8px',
              paddingRight: canScrollRight ? '40px' : '8px'
            }}
          >
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className="whitespace-nowrap min-w-fit px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 flex-shrink-0"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border shadow-md hover:bg-background"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Desktop: Wrap layout */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="whitespace-nowrap transition-all duration-200 hover:scale-105"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
