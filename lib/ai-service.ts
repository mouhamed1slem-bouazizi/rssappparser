import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Ensure we have the API key
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set in environment variables")
}

export async function summarizeArticle(title: string, description: string): Promise<string> {
  try {
    console.log(`Summarizing article: ${title.substring(0, 50)}...`)

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a professional news summarization expert. Create concise, informative summaries in 2-3 sentences that capture the key points of news articles. Focus on the most important facts and implications.",
      prompt: `Summarize this news article in 2-3 sentences:
      
Title: ${title}
Description: ${description}

Provide a clear, concise summary that captures the main points and significance of the story.`,
      maxTokens: 150,
      temperature: 0.3,
    })

    console.log(`Successfully summarized article: ${text.substring(0, 50)}...`)
    return text
  } catch (error) {
    console.error("Error summarizing article:", error)

    // Provide a fallback summary if AI fails
    const fallbackSummary = description
      ? description.substring(0, 200) + (description.length > 200 ? "..." : "")
      : title

    console.log("Using fallback summary")
    return fallbackSummary
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    console.log(`Translating text to ${targetLanguage}: ${text.substring(0, 50)}...`)

    const { text: translatedText } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a professional translator. Translate the given text accurately to ${getLanguageName(targetLanguage)} while maintaining the original meaning, tone, and style. Provide only the translation without any additional commentary.`,
      prompt: `Translate the following text to ${getLanguageName(targetLanguage)}:

${text}

Provide only the translation:`,
      maxTokens: 500,
      temperature: 0.1,
    })

    console.log(`Successfully translated text to ${targetLanguage}`)
    return translatedText
  } catch (error) {
    console.error("Error translating text:", error)

    // Return original text if translation fails
    console.log("Translation failed, returning original text")
    return text
  }
}

export async function categorizeArticle(title: string, description: string): Promise<string> {
  try {
    console.log(`Categorizing article: ${title.substring(0, 50)}...`)

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a news categorization expert. Categorize news articles into one of these categories: Technology, World News, Business, Sports, Entertainment, Health, Science, Politics, Gaming, AI. Respond with only the category name, nothing else.",
      prompt: `Categorize this news article into the most appropriate category:
      
Title: ${title}
Description: ${description}

Available categories: Technology, World News, Business, Sports, Entertainment, Health, Science, Politics, Gaming, AI

Category:`,
      maxTokens: 20,
      temperature: 0.1,
    })

    const category = text.trim()
    console.log(`Categorized article as: ${category}`)

    // Validate the category is one of our expected categories
    const validCategories = [
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

    if (validCategories.includes(category)) {
      return category
    } else {
      console.warn(`Invalid category returned: ${category}, using World News as fallback`)
      return "World News"
    }
  } catch (error) {
    console.error("Error categorizing article:", error)

    // Return a default category if categorization fails
    console.log("Categorization failed, using World News as fallback")
    return "World News"
  }
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    ar: "Arabic",
    zh: "Chinese (Simplified)",
    ja: "Japanese",
    pt: "Portuguese",
    ru: "Russian",
    it: "Italian",
    ko: "Korean",
    hi: "Hindi",
    nl: "Dutch",
    sv: "Swedish",
    no: "Norwegian",
    da: "Danish",
    fi: "Finnish",
    pl: "Polish",
    tr: "Turkish",
    th: "Thai",
    vi: "Vietnamese",
  }
  return languages[code] || "English"
}

// Test function to verify API key is working
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    console.log("Testing OpenAI API connection...")

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "Say 'Hello, AI News Hub!' to confirm the connection is working.",
      maxTokens: 20,
    })

    console.log("OpenAI API test successful:", text)
    return true
  } catch (error) {
    console.error("OpenAI API test failed:", error)
    return false
  }
}
