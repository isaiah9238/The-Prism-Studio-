/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = Number(process.env.PORT) || 3000;

  // AI Refraction API route
  app.post("/api/refract", async (req, res) => {
    const { rawContent, constraints } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback response if no API key
      return res.json({
        projections: {
          geometry: {
            facet: "geometry",
            title: "Geometry & Invariants",
            claims: [
              `Analyzed spatial topology for: "${rawContent?.slice(0, 40) || "Intent"}..."`,
              "Optimized node hierarchy and structural invariants"
            ],
            invariantsOrBounds: ["Origin Attribution Active", "Strict isolation invariant"]
          },
          architecture: {
            facet: "architecture",
            title: "System & Code Architecture",
            claims: [
              "Decoupled pure state machine and adapter layer",
              "Unidirectional data flow with local vault persistence"
            ],
            invariantsOrBounds: ["Zero cross-facet pollution"]
          },
          cost: {
            facet: "cost",
            title: "Energetic & Operational Cost",
            claims: [
              "Demand-driven rendering (0 fps idle sleep)",
              "Procedural geometry VRAM footprint under 150MB"
            ],
            invariantsOrBounds: ["Maximum DPR capped at 2", "Zero cloud backend cost"]
          },
          human: {
            facet: "human",
            title: "Human & Open Access",
            claims: [
              "Distraction-free entry space with zero attention traps",
              "Full keyboard navigation and 2D accessible outline view"
            ],
            invariantsOrBounds: ["Neutral structural friction framing"]
          }
        },
        interferences: [
          {
            id: `inf_${Date.now()}_1`,
            facets: ["geometry", "cost"],
            kind: "collision",
            description: "High spatial fidelity in 3D optics can clash with lightweight operational cost budgets on mobile hardware.",
            resolution: "Use analytical TSL Fresnel materials and idle-zero frame loops to maintain high fidelity at near-zero battery cost."
          }
        ]
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the Prism Engine. Deconstruct the following raw emission and hard constraints into 4 independent orthogonal facets (geometry, architecture, cost, human) and key interferences (collisions or reinforcements) with engineered resolutions.
Raw Emission: ${rawContent}
Hard Constraints: ${constraints}

Return valid JSON with structure:
{
  "projections": {
    "geometry": { "facet": "geometry", "title": "Geometry & Invariants", "claims": ["..."], "invariantsOrBounds": ["..."] },
    "architecture": { "facet": "architecture", "title": "System & Code Architecture", "claims": ["..."], "invariantsOrBounds": ["..."] },
    "cost": { "facet": "cost", "title": "Energetic & Operational Cost", "claims": ["..."], "invariantsOrBounds": ["..."] },
    "human": { "facet": "human", "title": "Human & Open Access", "claims": ["..."], "invariantsOrBounds": ["..."] }
  },
  "interferences": [
    { "id": "inf_1", "facets": ["geometry", "cost"], "kind": "collision", "description": "...", "resolution": "..." }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "{}");
      return res.json(data);
    } catch (error) {
      console.error("Gemini API refraction error:", error);
      return res.status(500).json({ error: "Refraction generation failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Prism Studio running on port ${PORT}`);
  });
}

startServer();
