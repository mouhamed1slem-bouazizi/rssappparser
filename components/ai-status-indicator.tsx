"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function AIStatusIndicator() {
  const [aiStatus, setAiStatus] = useState<"unknown" | "working" | "error">("unknown")
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const testAIConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-ai")
      const data = await response.json()

      if (data.success) {
        setAiStatus("working")
        setStatusMessage("AI features are working correctly")
      } else {
        setAiStatus("error")
        setStatusMessage(data.error || "AI connection failed")
      }
    } catch (error) {
      setAiStatus("error")
      setStatusMessage("Failed to test AI connection")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Test AI connection on component mount
    testAIConnection()
  }, [])

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />
    if (aiStatus === "working") return <CheckCircle className="w-4 h-4 text-green-600" />
    if (aiStatus === "error") return <AlertCircle className="w-4 h-4 text-red-600" />
    return <Sparkles className="w-4 h-4 text-gray-400" />
  }

  const getStatusColor = () => {
    if (aiStatus === "working") return "bg-green-100 text-green-800 border-green-200"
    if (aiStatus === "error") return "bg-red-100 text-red-800 border-red-200"
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs">
          {isLoading
            ? "Testing..."
            : aiStatus === "working"
              ? "AI Ready"
              : aiStatus === "error"
                ? "AI Error"
                : "AI Unknown"}
        </span>
      </Badge>

      {aiStatus === "error" && (
        <Button variant="outline" size="sm" onClick={testAIConnection} disabled={isLoading}>
          Retry
        </Button>
      )}
    </div>
  )
}
