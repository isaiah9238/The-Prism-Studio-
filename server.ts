/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRISM_SKILL_PATH = path.resolve(__dirname, "prism-skill.md");

function loadPrismSkillDocument(): string {
  try {
    if (fs.existsSync(PRISM_SKILL_PATH)) {
      return fs.readFileSync(PRISM_SKILL_PATH, "utf-8");
    }
  } catch (error) {
    console.warn("Unable to read prism-skill.md:", error);
  }
  return "";
}

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  const PORT = Number(process.env.PORT) || 3000;

  // Serve the live prism-skill.md specification
  app.get("/api/skill", (_req, res) => {
    const markdown = loadPrismSkillDocument();
    return res.json({
      name: "prism-skill",
      version: "1.0.0",
      available: Boolean(markdown),
      markdown,
    });
  });

  // AI-assisted Prism Refraction endpoint aligned to prism-skill.md v1.0.0
  app.post("/api/refract", async (req, res) => {
    const {
      incidentInput,
      rawContent,
      constraints,
      facets,
      targetConvergenceMode,
    } = req.body ?? {};

    const subject =
      typeof incidentInput === "string" && incidentInput.trim()
        ? incidentInput.trim()
        : typeof rawContent === "string"
        ? rawContent.trim()
        : "";

    if (!subject) {
      return res.status(400).json({
        error: "incidentInput (or rawContent) is required for refraction.",
      });
    }

    const ai = createGeminiClient();
    if (!ai) {
      return res.status(503).json({
        code: "GEMINI_API_KEY_MISSING",
        error:
          "GEMINI_API_KEY is not configured. Configure it in Settings > Secrets to use Gemini AI refraction, or use the local In-Process Harness.",
      });
    }

    const normalizedConstraints: string[] = Array.isArray(constraints)
      ? constraints.map((c) => String(c).trim()).filter(Boolean)
      : typeof constraints === "string"
      ? constraints
          .split("\n")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    const activeFacets: string[] =
      Array.isArray(facets) && facets.length > 0
        ? facets.map((f) => String(f))
        : ["geometry", "system_arch", "energetic_cost", "human_access"];

    const mode =
      targetConvergenceMode === "tradeoff-matrix" ||
      targetConvergenceMode === "executable-spec"
        ? targetConvergenceMode
        : "unified-architecture";

    const skillDoc = loadPrismSkillDocument();
    const systemInstruction = `You are the Prism Multi-Facet System Refraction & Synthesis Engine (prism-skill v1.0.0).
Follow the prism-skill specification strictly:
- Keep the four analytical lenses (geometry, system_arch, energetic_cost, human_access) strictly isolated during refraction so trade-offs stay visible.
- Identify genuine cross-facet constructive reinforcements (synergy) and destructive collisions (conflict + concrete resolutionStrategy).
- Phrase tensions and collisions as neutral structural mechanics without flattery or filler.
- Do not fabricate external runtime execution or network calls.
${skillDoc ? `\n--- Reference prism-skill.md ---\n${skillDoc.slice(0, 6000)}` : ""}`;

    const userPrompt = `Execute prism-skill refraction on the following input:
- incidentInput: ${subject}
- constraints: ${JSON.stringify(normalizedConstraints)}
- facets: ${JSON.stringify(activeFacets)}
- targetConvergenceMode: ${mode}

Return structured JSON matching the PrismResult schema with exactly one FacetRefraction entry per requested facet ("geometry", "system_arch", "energetic_cost", "human_access"), each containing 2-4 crisp findings, 2 invariants, and 1-2 tensions, plus an interferenceReport with 1-2 constructive reinforcements and 2-3 destructive collisions with concrete resolutionStrategy strings.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              incidentInput: { type: Type.STRING },
              convergenceMode: { type: Type.STRING },
              refractions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    facetName: { type: Type.STRING },
                    invariants: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    findings: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    tensions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["facetName", "invariants", "findings", "tensions"],
                },
              },
              interferenceReport: {
                type: Type.OBJECT,
                properties: {
                  reinforcements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        facets: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        synergy: { type: Type.STRING },
                      },
                      required: ["facets", "synergy"],
                    },
                  },
                  collisions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        facets: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        conflict: { type: Type.STRING },
                        resolutionStrategy: { type: Type.STRING },
                      },
                      required: ["facets", "conflict", "resolutionStrategy"],
                    },
                  },
                },
                required: ["reinforcements", "collisions"],
              },
              convergedSummary: { type: Type.STRING },
            },
            required: [
              "incidentInput",
              "convergenceMode",
              "refractions",
              "interferenceReport",
              "convergedSummary",
            ],
          },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        return res.status(502).json({
          error: "Gemini returned an empty refraction payload.",
        });
      }

      const parsed = JSON.parse(rawText);

      const prismResult = {
        incidentInput: parsed.incidentInput || subject,
        convergenceMode: mode,
        refractions: Array.isArray(parsed.refractions) ? parsed.refractions : [],
        interferenceReport: parsed.interferenceReport || {
          reinforcements: [],
          collisions: [],
        },
        convergedOutput: {
          mode,
          skillVersion: "1.0.0",
          summary: parsed.convergedSummary || `Converged analysis under ${mode}`,
          resolvedConstraintsCount: normalizedConstraints.length,
        },
        timestamp: new Date().toISOString(),
      };

      return res.json({ result: prismResult });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Refraction generation failed";
      console.error("Gemini API refraction error:", error);
      return res.status(502).json({
        code: "GEMINI_API_ERROR",
        error: message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Prism Studio running on port ${PORT}`);
  });
}

startServer();
