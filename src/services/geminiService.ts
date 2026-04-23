/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Stock } from "../types.ts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getStockAnalysis(stock: Stock): Promise<string> {
  try {
    const prompt = `Analyze the current state of ${stock.name} (${stock.symbol}). 
    Current Price: $${stock.price}
    Change: ${stock.change} (${stock.changePercent}%)
    Sector: ${stock.sector}
    
    Provide a professional, concise market sentiment analysis in 3-4 sentences. 
    Focus on potential outlook based on this virtual data. 
    Note: This is for a paper trading simulation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI analysis unavailable. Please check your market indicators.";
  }
}
