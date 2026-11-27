/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FacetName, PrismWorkspace } from "../core/types";

export interface StageCallbacks {
  onSelectNode: (target: "core" | FacetName | string) => void;
  onSelectInterference: (interferenceId: string) => void;
}

export class PrismStage {
  private container!: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private dirty = true;
  private activeTweens = 0;
  private animFrameId: number | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Scene interactive objects mapping
  private interactiveObjects = new Map<THREE.Object3D, { type: "core" | FacetName | string; id: string }>();

  // Camera tween state
  private cameraTargetPos = new THREE.Vector3();
  private cameraTargetLook = new THREE.Vector3();
  private cameraStartPos = new THREE.Vector3();
  private cameraStartLook = new THREE.Vector3();
  private cameraTweenProgress = 1.0;

  // Visual groups
  private coreMesh!: THREE.Mesh;
  private prismShellMesh!: THREE.Mesh;
  private facetPlanesGroup = new THREE.Group();
  private interferencesGroup = new THREE.Group();
  private raysGroup = new THREE.Group();

  private callbacks: StageCallbacks;
  private currentWorkspace: PrismWorkspace | null = null;
  private selectedTarget: string = "core";

  constructor(callbacks: StageCallbacks) {
    this.callbacks = callbacks;
  }

  mount(container: HTMLDivElement): void {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x090d16, 0.035);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 3.5, 7.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 25;
    this.controls.minDistance = 2;
    this.controls.addEventListener("change", () => this.invalidate());

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x6366f1, 2.5);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 3, 15);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);

    // Build static scene structure
    this.buildEnvironment();
    this.buildPrismCore();
    this.scene.add(this.facetPlanesGroup);
    this.scene.add(this.interferencesGroup);
    this.scene.add(this.raysGroup);

    // Event listeners
    window.addEventListener("resize", this.onWindowResize);
    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown);

    // Start render loop (demand-driven)
    this.startRenderLoop();
  }

  private startRenderLoop = () => {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);

      let needsRender = false;
      if (this.dirty) {
        needsRender = true;
      }

      if (this.cameraTweenProgress < 1.0) {
        this.cameraTweenProgress += 0.04;
        if (this.cameraTweenProgress > 1.0) this.cameraTweenProgress = 1.0;

        const t = this.easeOutCubic(this.cameraTweenProgress);
        this.camera.position.lerpVectors(this.cameraStartPos, this.cameraTargetPos, t);
        
        const currentLook = new THREE.Vector3();
        const tempLook = new THREE.Vector3().lerpVectors(this.cameraStartLook, this.cameraTargetLook, t);
        this.camera.lookAt(tempLook);
        this.controls.target.copy(tempLook);
        needsRender = true;
      }

      this.controls.update();

      if (needsRender || this.activeTweens > 0) {
        // Subtle ambient pulse on core
        const time = Date.now() * 0.002;
        if (this.coreMesh) {
          const scale = 1 + Math.sin(time) * 0.06;
          this.coreMesh.scale.set(scale, scale, scale);
        }
        this.renderer.render(this.scene, this.camera);
        this.dirty = false;
      }
    };
    loop();
  };

  invalidate(): void {
    this.dirty = true;
  }

  private easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.invalidate();
  };

  private onPointerDown = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        if (this.interactiveObjects.has(obj)) {
          const meta = this.interactiveObjects.get(obj)!;
          if (meta.type === "core" || meta.type === "geometry" || meta.type === "architecture" || meta.type === "cost" || meta.type === "human") {
            this.callbacks.onSelectNode(meta.type);
            this.focusOnTarget(meta.type);
          } else if (meta.type.startsWith("inf_")) {
            this.callbacks.onSelectInterference(meta.id);
          }
          return;
        }
        obj = obj.parent;
      }
    }
  };

  focusOnTarget(target: "core" | FacetName): void {
    this.selectedTarget = target;
    this.cameraStartPos.copy(this.camera.position);
    this.cameraStartLook.copy(this.controls.target);

    switch (target) {
      case "core":
        this.cameraTargetPos.set(0, 2.2, 5.2);
        this.cameraTargetLook.set(0, 0, 0);
        break;
      case "geometry": // +Z
        this.cameraTargetPos.set(0, 0.4, 6.2);
        this.cameraTargetLook.set(0, 0, 3.2);
        break;
      case "architecture": // +X
        this.cameraTargetPos.set(6.2, 0.4, 0);
        this.cameraTargetLook.set(3.2, 0, 0);
        break;
      case "cost": // -Z
        this.cameraTargetPos.set(0, 0.4, -6.2);
        this.cameraTargetLook.set(0, 0, -3.2);
        break;
      case "human": // -X
        this.cameraTargetPos.set(-6.2, 0.4, 0);
        this.cameraTargetLook.set(-3.2, 0, 0);
        break;
    }

    this.cameraTweenProgress = 0.0;
    this.invalidate();
  }

  private buildEnvironment(): void {
    // Subtle starfield / grid floor
    const grid = new THREE.GridHelper(30, 30, 0x38bdf8, 0x1e293b);
    grid.position.y = -2.2;
    this.scene.add(grid);
  }

  private buildPrismCore(): void {
    // 1. Central Luminous Core
    const coreGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 2.5,
      roughness: 0.1,
      metalness: 0.9
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.scene.add(this.coreMesh);
    this.interactiveObjects.set(this.coreMesh, { type: "core", id: "core" });

    // Inner core aura
    const auraGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    this.coreMesh.add(aura);

    // 2. Translucent Prism Shell (Octahedron / Bipyramid)
    const shellGeo = new THREE.OctahedronGeometry(1.2, 0);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x818cf8,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      thickness: 1.2,
      specularIntensity: 1.0,
      side: THREE.DoubleSide
    });
    this.prismShellMesh = new THREE.Mesh(shellGeo, shellMat);
    this.scene.add(this.prismShellMesh);
  }

  updateWorkspace(workspace: PrismWorkspace): void {
    this.currentWorkspace = workspace;
    this.rebuildSceneGraph();
    this.invalidate();
  }

  private rebuildSceneGraph(): void {
    if (!this.currentWorkspace) return;

    // Clear dynamic facet planes and rays
    while (this.facetPlanesGroup.children.length > 0) {
      this.facetPlanesGroup.remove(this.facetPlanesGroup.children[0]);
    }
    while (this.interferencesGroup.children.length > 0) {
      this.interferencesGroup.remove(this.interferencesGroup.children[0]);
    }
    while (this.raysGroup.children.length > 0) {
      this.raysGroup.remove(this.raysGroup.children[0]);
    }

    const facets: Array<{ name: FacetName; pos: THREE.Vector3; color: number; label: string }> = [
      { name: "geometry", pos: new THREE.Vector3(0, 0, 3.5), color: 0x38bdf8, label: "Geometry & Invariants" },
      { name: "architecture", pos: new THREE.Vector3(3.5, 0, 0), color: 0x818cf8, label: "System & Architecture" },
      { name: "cost", pos: new THREE.Vector3(0, 0, -3.5), color: 0xf43f5e, label: "Energetic Cost" },
      { name: "human", pos: new THREE.Vector3(-3.5, 0, 0), color: 0x10b981, label: "Human & Access" }
    ];

    facets.forEach((f) => {
      // 1. Facet floating card node
      const planeGroup = new THREE.Group();
      planeGroup.position.copy(f.pos);
      // Face toward center
      planeGroup.lookAt(0, 0, 0);

      const cardGeo = new THREE.PlaneGeometry(2.2, 1.4);
      const cardMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: f.color,
        emissiveIntensity: 0.2,
        roughness: 0.3,
        metalness: 0.8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      planeGroup.add(cardMesh);

      // Border frame
      const edges = new THREE.EdgesGeometry(cardGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: f.color, linewidth: 2 });
      const border = new THREE.LineSegments(edges, lineMat);
      planeGroup.add(border);

      this.facetPlanesGroup.add(planeGroup);
      this.interactiveObjects.set(cardMesh, { type: f.name, id: f.name });

      // 2. Light Ray from Core to Facet Plane
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        f.pos
      ]);
      const rayMat = new THREE.LineBasicMaterial({
        color: f.color,
        transparent: true,
        opacity: 0.6
      });
      const rayLine = new THREE.Line(rayGeo, rayMat);
      this.raysGroup.add(rayLine);
    });

    // 3. Interference Chords between facets
    const facetPosMap: Record<FacetName, THREE.Vector3> = {
      geometry: new THREE.Vector3(0, 0, 3.5),
      architecture: new THREE.Vector3(3.5, 0, 0),
      cost: new THREE.Vector3(0, 0, -3.5),
      human: new THREE.Vector3(-3.5, 0, 0)
    };

    this.currentWorkspace.interferences.forEach((inf, idx) => {
      const p1 = facetPosMap[inf.facets[0]];
      const p2 = facetPosMap[inf.facets[1]];
      if (!p1 || !p2) return;

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 0.8 + idx * 0.2; // Arc upward

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(30);
      const geom = new THREE.BufferGeometry().setFromPoints(points);

      const lineColor = inf.kind === "collision" ? 0xf43f5e : 0x38bdf8;
      const mat = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.8
      });
      const chord = new THREE.Line(geom, mat);
      this.interferencesGroup.add(chord);

      // Focal node at midpoint
      const sphereGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: lineColor,
        emissive: lineColor,
        emissiveIntensity: 1.5
      });
      const focalNode = new THREE.Mesh(sphereGeo, sphereMat);
      focalNode.position.copy(mid);
      this.interferencesGroup.add(focalNode);

      this.interactiveObjects.set(focalNode, { type: `inf_${inf.id}`, id: inf.id });
      this.interactiveObjects.set(chord, { type: `inf_${inf.id}`, id: inf.id });
    });
  }

  destroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener("resize", this.onWindowResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
