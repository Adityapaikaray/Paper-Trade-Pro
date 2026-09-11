const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `async function startServer() {`;
const replacement = `// Copilot API Route
app.post("/api/copilot", express.json(), async (req, res) => {
  const { prompt, context } = req.body;
  const ai = getGenAI();
  
  if (!ai) {
    return res.status(500).json({ error: "Gemini API key is not configured.", text: "Sorry, the AI Copilot is currently offline due to missing configuration." });
  }

  try {
    const systemInstruction = \`You are TRADEPRO's AI Copilot, a sophisticated financial assistant for a premium private banking and institutional asset management platform.
Your job is to provide world-class insights into the user's portfolio.
Do not just list numbers; explain *why* things are happening. Be concise, trustworthy, and extremely readable.
Use an elegant, professional tone (like a premium wealth manager). Focus on risk, diversification, and performance drivers.
Do not output markdown headers unless necessary for structure, but prefer concise paragraphs.
Here is the user's current portfolio and market context:
\${JSON.stringify(context, null, 2)}
\`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Copilot Error:", err);
    res.status(500).json({ error: "Failed to generate copilot response", text: "I'm sorry, I encountered an issue analyzing your portfolio. Please try again." });
  }
});

async function startServer() {`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
