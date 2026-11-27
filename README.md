# The Prism Studio

A local-first, 3D cognitive and architectural refracting workspace that decomposes raw ideas and constraints across four orthogonal lenses, surfaces structural tensions and synergies, converges them into executable specifications, and persists your work locally.

> *"The light begins in you and I, and the light from you reflects off me to you."*

## How It Works

1. **Author an Emission at the Core:** In the Center Core Emission modal, define a title, a raw spark/intent, and line-by-line hard constraints (such as local-first ownership, idle-zero rendering, or access invariants).
2. **Refract Across Four Facets:** Triggering **Refract Ray Across 4 Facets** sends the emission and constraints to `POST /api/refract` (using `gemini-2.5-flash` when `GEMINI_API_KEY` is set, or a structured fallback otherwise) to project them into four orthogonal facets:
   - **Geometry & Invariants** (`+Z`)
   - **System & Code Architecture** (`+X`)
   - **Energetic & Operational Cost** (`-Z`)
   - **Human & Open Access** (`-X`)
3. **Inspect & Resolve Interferences:** Arcs and focal nodes connect facets in the 3D scene to highlight interferences (collisions or reinforcements) along with engineered resolutions, which can be inspected and updated in the interference panel.
4. **Navigate & View in Multiple Modes:** Orbit or pan the 3D WebGL scene (`PrismStage`), focus on the core (`0`), facets (`1`–`4`), or interference nodes (`I`), open convergence (`C`), toggle a 2D outline view (`Cmd/Ctrl+Shift+V`), or switch between preset subjects (*The Luminous Self*, *Neural Synthesis Engine*, *Biomimetic City Transit*).
5. **Persist & Export Locally:** Workspace updates save through the local vault (`opfsVault`) and can be exported to Markdown.

## Quick Start

```bash
npm install
npm run dev