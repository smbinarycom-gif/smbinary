
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, CandleData } from "../types.ts";

export const getMarketAnalysis = async (assetSymbol: string, currentPrice: number, history: CandleData[]): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following market data for ${assetSymbol}: Current Price: ${currentPrice}. Recent trend data: ${JSON.stringify(history)}. Provide a professional binary trading sentiment (Bullish/Bearish/Neutral) for a short-term (1-5 min) horizon.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, description: 'BULLISH, BEARISH, or NEUTRAL' },
            confidence: { type: Type.NUMBER, description: '0 to 100 confidence score' },
            reasoning: { type: Type.STRING, description: 'Brief expert reasoning' }
          },
          required: ["sentiment", "confidence", "reasoning"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("Gemini returned an empty response.");
    return JSON.parse(jsonStr.trim()) as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      sentiment: 'NEUTRAL',
      confidence: 50,
      reasoning: "AI analysis currently unavailable. Please rely on pure price action."
    };
  }
};
