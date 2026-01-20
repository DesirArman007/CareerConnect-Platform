import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCareerAdvice = async (userQuery: string): Promise<string> => {
  try {
    if (!apiKey) {
      return "I'm sorry, I can't connect to the AI service right now (Missing API Key).";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert, encouraging, and concise AI Career Coach. 
      The user is asking: "${userQuery}".
      Provide a helpful, short (max 3 sentences) answer or suggestion relevant to job searching, tech skills, or career growth.
      Tone: Professional, witty, developer-focused (Vercel style).`,
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered a hiccup while thinking. Please try again.";
  }
};
