import { type NextRequest, NextResponse } from "next/server"
import { testOpenAIConnection } from "@/lib/ai-service"
import { config, validateConfig, logConfigStatus } from "@/lib/config"

export async function GET(request: NextRequest) {
  try {
    // Log configuration status
    logConfigStatus()

    // Validate configuration
    const { isValid, errors } = validateConfig()

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration errors",
          details: errors,
          config: {
            hasApiKey: !!config.openai.apiKey,
            features: config.features,
          },
        },
        { status: 400 },
      )
    }

    // Test OpenAI connection
    const connectionTest = await testOpenAIConnection()

    if (connectionTest) {
      return NextResponse.json({
        success: true,
        message: "OpenAI API connection successful",
        config: {
          model: config.openai.model,
          features: config.features,
          app: config.app,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API connection failed",
          config: {
            hasApiKey: !!config.openai.apiKey,
            features: config.features,
          },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "API test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
