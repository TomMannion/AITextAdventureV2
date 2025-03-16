import dotenv from "dotenv";
dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  ai: {
    // Default providers configuration
    providers: {
      // OpenAI configuration
      openai: {
        defaultModel: "gpt-4",
        apiEndpoint: "https://api.openai.com/v1/chat/completions",
      },
      // Anthropic configuration
      anthropic: {
        defaultModel: "claude-3-opus-20240229",
        apiEndpoint: "https://api.anthropic.com/v1/messages",
      },
      // Groq configuration
      groq: {
        defaultModel: "llama-3.1-8b-instant",
        apiEndpoint: "https://api.groq.com/openai/v1/chat/completions",
      },
      gemini: {
        defaultModel: "gemini-2.0-flash",
        apiEndpoint: "https://generativelanguage.googleapis.com/v1beta",
      },
    },
    // Default prompt settings
    prompts: {
      maxTokens: 6000,
      temperature: 0.7,
    },
  },
};

export default config;
