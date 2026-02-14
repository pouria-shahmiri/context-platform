import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedButton } from "@/components/ui/animated-button";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { cn } from "@/lib/utils";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { LucideIcon } from "lucide-react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type Props = {
  title: string;
  description: string;
  to: string;
  modelPath?: string;
  icon?: LucideIcon;
  colorClass?: string;
  preset?: "lowpoly-bot" | "pyramid" | "nodes-graph" | "workshop-tools" | "picture-frame" | "old-book" | "airplane" | "technician";
};

export const AppCard3D: React.FC<Props> = ({ title, description, to, modelPath, icon, colorClass = "bg-primary", preset }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const Line = ({ className = "" }) => (
    <div
      className={cn(
        "h-px w-full via-zinc-400 from-1% from-zinc-200 to-zinc-600 absolute z-0 dark:via-zinc-700 dark:from-zinc-900 dark:to-zinc-500",
        className,
      )}
    />
  );
  const Lines = () => (
    <>
      <Line className="bg-linear-to-l left-0 top-2 sm:top-4 md:top-6" />
      <Line className="bg-linear-to-r bottom-2 sm:bottom-4 md:bottom-6 left-0" />
      <Line className="w-px bg-linear-to-t right-2 sm:right-4 md:right-6 h-full inset-y-0" />
      <Line className="w-px bg-linear-to-t left-2 sm:left-4 md:left-6 h-full inset-y-0" />
    </>
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(2, 1.5, 3);
    camera.lookAt(0, 0, 0);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 0.8);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(3, 5, 2);
    scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dir2.position.set(-4, -3, -2);
    scene.add(dir2);

    const group = new THREE.Group();
    scene.add(group);

    let loaded: THREE.Object3D | null = null;

    const centerAndScale = (obj: THREE.Object3D) => {
      const pivot = new THREE.Group();
      pivot.add(obj);
      const box = new THREE.Box3().setFromObject(pivot);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 1.8 / maxDim;
      pivot.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(pivot);
      const center = new THREE.Vector3();
      box2.getCenter(center);
      pivot.position.set(-center.x, -center.y, -center.z);
      return pivot;
    };

    if (preset === "lowpoly-bot") {
      const bot = new THREE.Group();
      const matBody = new THREE.MeshPhysicalMaterial({ color: 0x7c3aed, metalness: 0.35, roughness: 0.35, clearcoat: 0.25 });
      const matAccent = new THREE.MeshPhysicalMaterial({ color: 0x22d3ee, metalness: 0.4, roughness: 0.28, clearcoat: 0.15, emissive: 0x0b9edb, emissiveIntensity: 0.2 });
      const matDark = new THREE.MeshPhysicalMaterial({ color: 0x1f2937, metalness: 0.15, roughness: 0.7 });

      const body = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.9, 0.6, 4, 0.18), matBody);
      body.position.set(0, -0.1, 0);
      bot.add(body);

      const head = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.6, 0.6, 4, 0.16), matBody);
      head.position.set(0, 0.6, 0);
      bot.add(head);

      const eyeL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), matAccent);
      eyeL.rotation.x = Math.PI / 2;
      eyeL.position.set(-0.22, 0.65, 0.32);
      const eyeR = eyeL.clone();
      eyeR.position.x = 0.22;
      bot.add(eyeL, eyeR);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6), matDark);
      stem.position.set(0, 0.95, 0);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matAccent);
      tip.position.set(0, 1.12, 0);
      bot.add(stem, tip);

      const armL = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.6, 0.2, 2, 0.08), matBody);
      armL.position.set(-0.8, 0.1, 0);
      const armR = armL.clone();
      armR.position.x = 0.8;
      bot.add(armL, armR);

      const visor = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.22, 0.05, 2, 0.05), matDark);
      visor.position.set(0, 0.65, 0.33);
      bot.add(visor);

      const pivot = centerAndScale(bot);
      loaded = pivot;
      group.add(pivot);
    } else if (preset === "pyramid") {
      const g = new THREE.Group();
      const matSand = new THREE.MeshPhysicalMaterial({ color: 0xC8A76F, roughness: 0.65, metalness: 0.06 });
      const levels = 4;
      for (let i = 0; i < levels; i++) {
        const s = 1.4 - i * 0.3;
        const h = 0.22 + i * 0.02;
        const step = new THREE.Mesh(new RoundedBoxGeometry(s, h, s, 2, 0.04), matSand);
        step.position.y = -0.5 + i * h + i * 0.05;
        g.add(step);
      }
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.35, 4), matSand);
      cap.rotation.y = Math.PI / 4;
      cap.position.y = 0.15;
      g.add(cap);
      const base = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.08, 1.8, 3, 0.05), new THREE.MeshPhysicalMaterial({ color: 0x9E7F4F, roughness: 0.8 }));
      base.position.y = -0.54;
      g.add(base);
      const pivot = centerAndScale(g);
      loaded = pivot; group.add(pivot);
    } else if (preset === "nodes-graph") {
      const g = new THREE.Group();
      const matNode = new THREE.MeshPhysicalMaterial({ color: 0x4F46E5, roughness: 0.35, metalness: 0.25, clearcoat: 0.1 });
      const matEdge = new THREE.MeshPhysicalMaterial({ color: 0x22D3EE, roughness: 0.25, metalness: 0.25 });
      const positions = [
        new THREE.Vector3(-0.9, 0.5, 0),
        new THREE.Vector3(0.9, 0.5, 0.1),
        new THREE.Vector3(-0.6, -0.6, -0.1),
        new THREE.Vector3(0.6, -0.6, 0),
        new THREE.Vector3(0, 0.1, 0.6),
        new THREE.Vector3(0.2, -0.1, -0.6),
        new THREE.Vector3(-0.2, 0.3, -0.4),
        new THREE.Vector3(0.4, 0.2, 0.4),
      ];
      positions.forEach(p => {
        const n = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), matNode);
        n.position.copy(p);
        g.add(n);
      });
      const connectCurve = (a: THREE.Vector3, b: THREE.Vector3, off: THREE.Vector3) => {
        const curve = new THREE.QuadraticBezierCurve3(a, new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5).add(off), b);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.035, 8, false), matEdge);
        g.add(tube);
      };
      connectCurve(positions[0], positions[2], new THREE.Vector3(0, 0.2, 0));
      connectCurve(positions[1], positions[3], new THREE.Vector3(0, 0.25, 0.15));
      connectCurve(positions[0], positions[4], new THREE.Vector3(0.1, 0.15, 0));
      connectCurve(positions[1], positions[4], new THREE.Vector3(-0.1, 0.15, 0));
      connectCurve(positions[2], positions[3], new THREE.Vector3(0, -0.15, 0));
      connectCurve(positions[6], positions[7], new THREE.Vector3(0.1, -0.05, 0.1));
      const pivot = centerAndScale(g);
      loaded = pivot; group.add(pivot);
    } else if (preset === "workshop-tools") {
      const g = new THREE.Group();
      const matMetal = new THREE.MeshPhysicalMaterial({ color: 0x9CA3AF, roughness: 0.4, metalness: 0.7, clearcoat: 0.1 });
      const matWood = new THREE.MeshPhysicalMaterial({ color: 0x8B5E3C, roughness: 0.65, metalness: 0.12 });
      const handle = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.7, 0.15, 3, 0.05), matWood);
      handle.position.set(-0.4, 0.0, 0);
      const head = new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.18, 0.18, 3, 0.06), matMetal);
      head.position.set(-0.4, 0.35, 0);
      g.add(handle, head);
      const jaw = new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.12, 0.18, 3, 0.06), matMetal);
      jaw.position.set(0.35, 0.18, 0);
      const shaft = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.6, 0.12, 3, 0.05), matMetal);
      shaft.position.set(0.35, -0.15, 0);
      g.add(jaw, shaft);
      const screwdriverHandle = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.35, 0.12, 3, 0.05), new THREE.MeshPhysicalMaterial({ color: 0xEF4444, roughness: 0.5, metalness: 0.2 }));
      screwdriverHandle.position.set(0.05, -0.1, 0.25);
      const screwdriverShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.35, 12), matMetal);
      screwdriverShaft.position.set(0.05, 0.15, 0.25);
      g.add(screwdriverHandle, screwdriverShaft);
      const pivot = centerAndScale(g);
      loaded = pivot; group.add(pivot);
    } else if (preset === "picture-frame") {
      const g = new THREE.Group();
      const matFrame = new THREE.MeshPhysicalMaterial({ color: 0xA78BFA, roughness: 0.45, metalness: 0.25, clearcoat: 0.15 });
      const frame = new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.0, 0.12, 4, 0.12), matFrame);
      const inner = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.6, 0.02, 3, 0.03), new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.85 }));
      inner.position.z = 0.06;
      g.add(frame, inner);
      const matBorder = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.9 });
      const mat1 = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.8, 0.015, 2, 0.02), matBorder);
      mat1.position.z = 0.055;
      g.add(mat1);
      const pivot = centerAndScale(g);
      loaded = pivot; group.add(pivot);
    } else if (preset === "old-book") {
      const g = new THREE.Group();
      const cover = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.7, 0.2, 4, 0.08), new THREE.MeshPhysicalMaterial({ color: 0x6B4E2E, roughness: 0.7, metalness: 0.08 }));
      const pages = new THREE.Mesh(new RoundedBoxGeometry(1.02, 0.62, 0.18, 2, 0.05), new THREE.MeshPhysicalMaterial({ color: 0xF2E9D8, roughness: 0.95 }));
      pages.position.set(0, 0, 0.01);
      g.add(cover, pages);
      const strap = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.08, 0.05, 2, 0.02), new THREE.MeshPhysicalMaterial({ color: 0x3f3f46, roughness: 0.6 }));
      strap.position.set(0, 0, 0.12);
      g.add(strap);
      const pivot = centerAndScale(g);
      loaded = pivot; group.add(pivot);
    } else if (preset === "airplane") {
      const g = new THREE.Group();
      const mat = new THREE.MeshPhysicalMaterial({ color: 0x60A5FA, metalness: 0.45, roughness: 0.35, clearcoat: 0.2 });
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.1, 8, 16), mat);
      body.rotation.z = Math.PI / 2;
      const wing = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.06, 0.3, 3, 0.06), mat);
      const tail = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.06, 0.22, 3, 0.05), mat);
      wing.position.set(0, 0, 0);
      tail.position.set(-0.45, 0.18, 0);
      const finV = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.25, 0.06, 2, 0.04), mat);
      finV.position.set(-0.5, 0.22, 0);
      const finH = new THREE.Mesh(new RoundedBoxGeometry(0.25, 0.06, 0.15, 2, 0.04), mat);
      finH.position.set(-0.52, 0.1, 0);
      const propHub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), mat);
      propHub.rotation.x = Math.PI / 2;
      propHub.position.set(0.55, 0, 0);
      const blade1 = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.35, 0.08, 2, 0.01), mat);
      blade1.position.set(0.55, 0.18, 0);
      const blade2 = blade1.clone();
      blade2.position.set(0.55, -0.18, 0);
      g.add(body, wing, tail, finV, finH, propHub, blade1, blade2);
      const pivot = centerAndScale(g);
      loaded = pivot; group.add(pivot);
    } else if (preset === "technician") {
      const g = new THREE.Group();
      const matSuit = new THREE.MeshPhysicalMaterial({ color: 0x2563EB, roughness: 0.45, metalness: 0.25 });
      const matSkin = new THREE.MeshPhysicalMaterial({ color: 0xF2C7A5, roughness: 0.65, metalness: 0.08 });
      const matTool = new THREE.MeshPhysicalMaterial({ color: 0x9CA3AF, roughness: 0.5, metalness: 0.7 });
      const torso = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.8, 0.3, 3, 0.1), matSuit);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), matSkin);
      head.position.set(0, 0.6, 0);
      const legL = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.6, 0.18, 2, 0.06), matSuit);
      legL.position.set(-0.15, -0.6, 0);
      const legR = legL.clone(); legR.position.x = 0.15;
      const armL = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.5, 0.16, 2, 0.06), matSuit);
      armL.position.set(-0.45, 0.0, 0);
      const armR = armL.clone(); armR.position.x = 0.45;
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), matSuit);
      helmet.position.set(0, 0.7, 0);
      const belt = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.12, 0.32, 2, 0.04), new THREE.MeshPhysicalMaterial({ color: 0x1f2937, roughness: 0.6 }));
      belt.position.set(0, -0.1, 0);
      const tablet = new THREE.Mesh(new RoundedBoxGeometry(0.35, 0.22, 0.02, 2, 0.03), matTool);
      tablet.position.set(0.5, 0.05, 0.15);
      g.add(torso, head, legL, legR, armL, armR, helmet, belt, tablet);
      const pivot = centerAndScale(g);
      loaded = pivot; group.add(pivot);
    } else {
      const loader = new GLTFLoader();
      const slug = (title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const src = modelPath || `/${slug}.glb`;
      loader.load(
        src,
        (gltf) => {
          const pivot = centerAndScale(gltf.scene);
          loaded = pivot;
          group.add(pivot);
        },
        undefined,
        () => {
          const geo = new THREE.TorusKnotGeometry(0.6, 0.2, 120, 16);
          const mat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.5, roughness: 0.3 });
          loaded = new THREE.Mesh(geo, mat);
          group.add(loaded as THREE.Object3D);
        }
      );
    }

    const resize = () => {
      const w = container.clientWidth;
      const h = w; // keep square
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let raf = 0;
    const tick = () => {
      if (group) {
        group.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (loaded && loaded.parent) loaded.parent.remove(loaded);
      renderer.dispose();
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose?.();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose?.());
          else obj.material.dispose?.();
        }
      });
    };
  }, [title, modelPath]);

  return (
    <div className="relative">
      <Lines />
      <Card className="w-full border-none shadow-none bg-card/60 backdrop-blur rounded-xl overflow-hidden h-full flex flex-col">
        <div className="p-4">
          <div
            ref={containerRef}
            className="w-full aspect-square rounded-lg border border-border/50 bg-muted/10 backdrop-blur supports-[backdrop-filter]:bg-muted/20 overflow-hidden"
          >
            <canvas ref={canvasRef} className="block w-full h-full" />
          </div>
        </div>
        <CardHeader className="pt-0">
          <div className="flex items-center gap-3">
            {icon ? (
              <div className={cn("w-9 h-9 rounded-md flex items-center justify-center", colorClass)}>
                <AnimatedIcon icon={icon} size={18} className="text-white" animation="scale" />
              </div>
            ) : null}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 mt-auto">
          <Link to={to} className="w-full block">
            <AnimatedButton variant="secondary" className="w-full justify-between group">
              Open App <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </AnimatedButton>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
