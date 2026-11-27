/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PresetProject } from "./types";

export const PRESET_PROJECTS: PresetProject[] = [
  {
    id: "luminous-self",
    title: "The Luminous Self",
    summary: "A local-first 3D spatial studio where light is created and reflected.",
    emission: {
      title: "The Luminous Self: A Local-First 3D Cognitive Studio",
      rawContent: "A quiet digital space where the human center originates raw sparks of intent without interruption, passes them through four orthogonal lenses (Geometry, Architecture, Cost, Human), detects interference tensions honestly, and converges them into executable specs.",
      hardConstraints: [
        "100% local-first ownership with zero mandatory cloud sync",
        "Demand-driven 3D rendering (0 fps when idle, zero battery drain)",
        "Zero skewed text; dual 3D canvas and crisp DOM focus parity",
        "Neutral, non-sycophantic interference reflection"
      ]
    },
    projections: {
      geometry: {
        title: "Geometry & Invariants",
        claims: [
          "Radial star topology with core at (0,0,0) and 4 orbital facet planes at 3.2m radius",
          "1:1 optical truth mapping every spatial ray and chord directly to persisted records",
          "Orthogonal camera locking ensures zero skewed reading or text distortion"
        ],
        invariantsOrBounds: [
          "Origin Attribution Invariant: No convergence without an authored emission",
          "Lens Isolation Invariant: Facets execute independently without cross-talk"
        ]
      },
      architecture: {
        title: "System & Code Architecture",
        claims: [
          "Decoupled pure TypeScript core engine with zero DOM or WebGL dependencies",
          "Universal OPFS local vault adapter with filesystem sync and ZIP archiving",
          "Hybrid viewport combining Three.js WebGPU/WebGL2 canvas with ARIA DOM overlay"
        ],
        invariantsOrBounds: [
          "Unidirectional data flow: Capture -> Refract -> Interfere -> Converge",
          "Stateless 3D scene recomputed deterministically from domain store"
        ]
      },
      cost: {
        title: "Energetic & Operational Cost",
        claims: [
          "Zero background animation loops; invalidation-driven rendering saves laptop batteries",
          "Lightweight procedural meshes and analytical Fresnel node materials (<150 MB VRAM)",
          "$0 baseline hosting cost with offline PWA caching capability"
        ],
        invariantsOrBounds: [
          "Maximum DPR capped at 2 for retina display efficiency",
          "Heavy AI semantic synthesis gated behind explicit opt-in triggers"
        ]
      },
      human: {
        title: "Human & Open Access",
        claims: [
          "Calm zero-friction entry space with no attention traps, streaks, or gamification",
          "Full keyboard navigation (0-4 keys, I cycles interferences, Cmd+Shift+V outline view)",
          "100% human-owned plain Markdown and JSON files on disk"
        ],
        invariantsOrBounds: [
          "Brutal honesty in collision mapping phrased as structural mechanics",
          "Universal accessibility parity across visual and screen-reader modes"
        ]
      }
    },
    interferences: [
      {
        facets: ["geometry", "human"],
        kind: "collision",
        description: "Rotating 3D viewports and floating text labels can disorient users or blur reading.",
        resolution: "Hybrid focus lock: clicking any facet instantly glides the camera head-on and opens a crisp ARIA DOM panel."
      },
      {
        facets: ["architecture", "cost"],
        kind: "collision",
        description: "Continuous 3D animation and real-time optical refraction consume high GPU power and battery.",
        resolution: "Adopt idle-zero demand rendering (0 fps when static) and analytical TSL Fresnel glass shaders."
      },
      {
        facets: ["geometry", "architecture"],
        kind: "reinforcement",
        description: "Radial 4-plane geometry perfectly mirrors the unidirectional state machine and decoupled storage architecture.",
        resolution: "Maintain 1:1 structural correspondence between spatial nodes and core domain objects."
      }
    ]
  },
  {
    id: "neural-synthesis",
    title: "Neural Synthesis Engine",
    summary: "Decentralized real-time semantic modeling across edge compute nodes.",
    emission: {
      title: "Decentralized Edge Neural Synthesis",
      rawContent: "An autonomous multi-agent swarm that processes decentralized encrypted knowledge graphs directly on local client GPUs, synchronizing state via gossip protocols without centralized server bottlenecks.",
      hardConstraints: [
        "Sub-50ms inference latency on consumer hardware",
        "Zero unencrypted data transmission over public relays",
        "Deterministic model weight verification via zero-knowledge proofs"
      ]
    },
    projections: {
      geometry: {
        title: "Geometry & Invariants",
        claims: [
          "Distributed peer-to-peer mesh topology with dynamic ring routing",
          "Cryptographic state anchoring via append-only Merkle DAGs"
        ],
        invariantsOrBounds: [
          "Zero single point of failure invariant",
          "Merkle root consistency across all peer state partitions"
        ]
      },
      architecture: {
        title: "System & Code Architecture",
        claims: [
          "WebAssembly runtime sandboxing for untrusted neural weight execution",
          "CRDT-based state reconciliation for offline-first peer replication"
        ],
        invariantsOrBounds: [
          "Strict memory isolation between worker threads",
          "Event-driven gossip message passing over WebRTC channels"
        ]
      },
      cost: {
        title: "Energetic & Operational Cost",
        claims: [
          "Quantized 4-bit model weights reducing memory bandwidth by 75%",
          "Adaptive power throttling based on thermal sensors and battery level"
        ],
        invariantsOrBounds: [
          "Maximum VRAM footprint under 4GB",
          "Strict power envelope of 15W during heavy inference bursts"
        ]
      },
      human: {
        title: "Human & Open Access",
        claims: [
          "Transparent node health visualizer with intuitive trust scoring",
          "One-click export of local knowledge graphs to standard RDF/JSON-LD"
        ],
        invariantsOrBounds: [
          "Zero telemetry or user fingerprinting",
          "Human-readable governance proposals for network parameter updates"
        ]
      }
    },
    interferences: [
      {
        facets: ["architecture", "cost"],
        kind: "collision",
        description: "Full zero-knowledge cryptographic verification imposes severe compute and battery overhead on mobile edge devices.",
        resolution: "Implement selective proof sampling where routine state transitions use optimistic validation with cryptographic challenge windows."
      },
      {
        facets: ["geometry", "human"],
        kind: "reinforcement",
        description: "Decentralized P2P mesh architecture inherently reinforces user data ownership and privacy.",
        resolution: "Highlight peer autonomy directly in the human dashboard interface."
      }
    ]
  },
  {
    id: "biomimetic-transit",
    title: "Biomimetic City Transit",
    summary: "Mycelial network inspired public transit routing algorithms.",
    emission: {
      title: "Mycelial Urban Mobility Grid",
      rawContent: "A self-optimizing public transit routing system modeled on fungal nutrient transport networks, dynamically shifting vehicle frequencies and path corridors in response to real-time pedestrian density signals.",
      hardConstraints: [
        "Dynamic adaptability to flash crowds and transit blockages within 30 seconds",
        "Equitable service distribution to underserved outer districts",
        "Zero reliance on cloud infrastructure for local intersection controllers"
      ]
    },
    projections: {
      geometry: {
        title: "Geometry & Invariants",
        claims: [
          "Non-hierarchical polycentric path graph with redundant failover loops",
          "Voronoi-based spatial partitioning for localized traffic density balancing"
        ],
        invariantsOrBounds: [
          "Continuous connectivity invariant during road closures",
          "Minimum 3 alternative routing corridors per major urban hub"
        ]
      },
      architecture: {
        title: "System & Code Architecture",
        claims: [
          "Edge micro-controllers running decentralized ant-colony optimization algorithms",
          "Event bus publish-subscribe topology over low-power LoRaWAN mesh"
        ],
        invariantsOrBounds: [
          "Autonomous islanding capability during central network outages",
          "Deterministic fallback routing rules hardcoded in ROM"
        ]
      },
      cost: {
        title: "Energetic & Operational Cost",
        claims: [
          "Solar-powered roadside sensor nodes with multi-year battery lifespans",
          "Minimal compute requirements per intersection node (ARM Cortex-M4)"
        ],
        invariantsOrBounds: [
          "Total power consumption under 5W per intersection unit",
          "Zero expensive centralized server infrastructure maintenance"
        ]
      },
      human: {
        title: "Human & Open Access",
        claims: [
          "Intuitive augmented reality transit wayfinding for visually impaired commuters",
          "Open municipal API providing real-time routing feeds to any third-party app"
        ],
        invariantsOrBounds: [
          "Absolute accessibility compliance (ADA / WCAG AAA standards)",
          "Community participatory budgeting hooks built into network expansion rules"
        ]
      }
    },
    interferences: [
      {
        facets: ["cost", "human"],
        kind: "collision",
        description: "Solar-powered roadside sensors have limited energy budgets during extended winter storms, potentially blinding density sensors.",
        resolution: "Implement kinetic energy harvesting from passing vehicle vibrations and low-power passive infrared backup arrays."
      }
    ]
  }
];
