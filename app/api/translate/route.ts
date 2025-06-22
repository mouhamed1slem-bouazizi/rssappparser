import { type NextRequest, NextResponse } from "next/server"
import { translateText } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Missing text or target language" }, { status: 400 })
    }

    const translatedText = await translateText(text, targetLanguage)

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error("Error translating text:", error)
    return NextResponse.json({ error: "Translation failed" }, { status: 500 })
  }
}
