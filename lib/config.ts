// Environment configuration
export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    maxTokens: {
      summary: 150,
      translation: 500,
      categorization: 20,
    },
    temperature: {
      summary: 0.3,
      translation: 0.1,
      categorization: 0.1,
    },
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
  },

  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "AI News Hub",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  },

  // Feature Flags
  features: {
    aiSummarization: !!process.env.OPENAI_API_KEY,
    aiTranslation: !!process.env.OPENAI_API_KEY,
    aiCategorization: !!process.env.OPENAI_API_KEY,
  },
}

// Validation function
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.openai.apiKey) {
    errors.push("OPENAI_API_KEY is required for AI features")
  }

  if (!config.database.url) {
    console.warn("DATABASE_URL not set - using environment default")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Log configuration status (without sensitive data)
export function logConfigStatus(): void {
  console.log("🔧 Configuration Status:")
  console.log(`  App Name: ${config.app.name}`)
  console.log(`  App Version: ${config.app.version}`)
  console.log(`  OpenAI API: ${config.openai.apiKey ? "✅ Configured" : "❌ Missing"}`)
  console.log(`  Database: ${config.database.url ? "✅ Configured" : "⚠️  Using default"}`)
  console.log(`  AI Features: ${config.features.aiSummarization ? "✅ Enabled" : "❌ Disabled"}`)
}
