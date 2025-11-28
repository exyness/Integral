import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing VITE_GEMINI_API_KEY");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

export const generateEmbedding = async (
  text: string,
): Promise<number[] | null> => {
  if (!API_KEY) {
    console.error("Gemini API Key is missing");
    return null;
  }

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
