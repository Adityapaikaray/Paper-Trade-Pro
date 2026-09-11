/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stock } from "../types.ts";

export async function getStockAnalysis(stock: Stock): Promise<string> {
  try {
    const res = await fetch("/api/ai/analyze-stock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        sector: stock.sector,
        currency: stock.currency,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return errData.analysis || "AI analysis unavailable. Please check market indicators.";
    }

    const data = await res.json();
    return data.analysis || "Market sentiment analysis completed with neutral bias.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI analysis unavailable. Please check your market indicators.";
  }
}

