import { GoogleGenAI } from "@google/genai";

// Collect all available Gemini API keys
const KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY_4,
].filter((key): key is string => !!key && key.length > 0);

if (KEYS.length === 0) {
  console.error("Missing VITE_GEMINI_API_KEY");
} else {
  console.log(`Initialized Gemini with ${KEYS.length} API keys`);
}

class RotatingAI {
  private clients: GoogleGenAI[];
  private currentIdx = 0;

  constructor(keys: string[]) {
    // If no keys, create one with empty string to allow app to start (will fail on use)
    const validKeys = keys.length > 0 ? keys : [""];
    this.clients = validKeys.map((k) => new GoogleGenAI({ apiKey: k }));
  }

  get models() {
    return {
      generateContent: async (params: any) => {
        return this.executeWithRetry((client) =>
          client.models.generateContent(params),
        );
      },
      embedContent: async (params: any) => {
        return this.executeWithRetry((client) =>
          client.models.embedContent(params),
        );
      },
    };
  }

  private async executeWithRetry<T>(
    fn: (client: GoogleGenAI) => Promise<T>,
  ): Promise<T> {
    let loopCount = 0;
    const initialIdx = this.currentIdx;

    while (loopCount < this.clients.length) {
      try {
        const client = this.clients[this.currentIdx];
        return await fn(client);
      } catch (error: any) {
        console.warn(
          `Gemini API error with key index ${this.currentIdx}:`,
          error.message || error,
        );

        // Rotate to next key
        this.currentIdx = (this.currentIdx + 1) % this.clients.length;
        loopCount++;

        // If we've tried all keys, accept defeat
        if (loopCount >= this.clients.length) {
          throw error;
        }
      }
    }
    throw new Error("All Gemini keys failed");
  }
}

// Export the rotating client as 'ai' to maintain compatibility
export const ai = new RotatingAI(KEYS) as unknown as GoogleGenAI;

// Deprecated: use ai.models.embedContent directly, but kept for backward compatibility if imported elsewhere
export const generateEmbedding = async (
  text: string,
): Promise<number[] | null> => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    if (response.embeddings && response.embeddings.length > 0) {
      return response.embeddings[0].values || null;
    }
    return null;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
};
