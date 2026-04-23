import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const TWELVE_DATA_API_KEY = process.env.VITE_TWELVE_DATA_API_KEY;

// API routes
app.get("/api/market-data", async (req, res) => {
  if (!TWELVE_DATA_API_KEY || TWELVE_DATA_API_KEY === "your_twelve_data_api_key_here") {
    return res.status(200).json({ 
      error: "API_KEY_MISSING",
      message: "Please provide a valid VITE_TWELVE_DATA_API_KEY in the settings." 
    });
  }

  const symbols = req.query.symbols as string;
  if (!symbols) {
    return res.status(400).json({ error: "No symbols provided" });
  }

  try {
    const response = await axios.get(`https://api.twelvedata.com/quote`, {
      params: {
        symbol: symbols,
        apikey: TWELVE_DATA_API_KEY,
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Market data fetch error:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
