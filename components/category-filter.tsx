"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

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
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full">
      {/* Mobile/Tablet: Horizontal scroll with navigation arrows */}
      <div className="relative lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <ScrollArea className="w-full">
          <div 
            ref={scrollRef}
            className="flex gap-2 px-10 py-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className="whitespace-nowrap min-w-fit px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <Button
          variant="ghost"
          size="sm"
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
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
