"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Dynamic procedural water surface using vertex manipulation
function OceanSurface({ lite }: { lite: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Plane geometry
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(60, 40, lite ? 24 : 64, lite ? 18 : 48);
  }, [lite]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const position = geometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
      const u = position.getX(i);
      const v = position.getY(i);
      // Dual sine wave ocean swell
      const z =
        Math.sin(u * 0.3 + t * 1.2) * 0.45 +
        Math.cos(v * 0.4 + t * 0.9) * 0.35 +
        Math.sin((u + v) * 0.2 + t * 1.5) * 0.2;
      position.setZ(i, z);
    }
    position.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2.3, 0, 0]}
      position={[0, -4.5, -4]}
    >
      <meshStandardMaterial
        color="#073a45"
        emissive="#007c83"
        roughness={0.15}
        metalness={0.85}
        wireframe={false}
        transparent
        opacity={0.82}
      />
    </mesh>
  );
}

// 3D Galleon with bobbing physics, crow's nest, dual sails, and glowing gala lanterns
function rippleCloth(mesh: THREE.Mesh | null, time: number, width: number, strength: number) {
  if (!mesh) return;
  const positions = mesh.geometry.attributes.position as THREE.BufferAttribute;
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const looseEdge = Math.max(0, Math.min(1, (x + width / 2) / width));
    positions.setZ(index, Math.sin(time * 2.1 + x * 3.2 + y * 1.8) * strength * looseEdge);
  }
  positions.needsUpdate = true;
}

function SailingShip3D({ lite }: { lite: boolean }) {
  const shipRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const mainSailRef = useRef<THREE.Mesh>(null);
  const foreSailRef = useRef<THREE.Mesh>(null);
  const wakeRef = useRef<THREE.Mesh>(null);
  const baseX = lite ? 2.1 : 4.2;

  useFrame(({ clock, pointer }) => {
    if (!shipRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle nautical bobbing and pitch/roll
    shipRef.current.position.x = baseX + pointer.x * 0.14;
    shipRef.current.position.y = -3.2 + Math.sin(t * 1.1) * 0.14 - pointer.y * 0.06;
    shipRef.current.rotation.z = Math.sin(t * 0.8) * 0.05;
    shipRef.current.rotation.x = Math.cos(t * 0.7) * 0.035;

    // Organic flag waving in ocean breeze
    rippleCloth(flagRef.current, t, 1.2, 0.11);
    rippleCloth(mainSailRef.current, t, 2.5, 0.07);
    rippleCloth(foreSailRef.current, t + 0.8, 1.7, 0.055);
    if (wakeRef.current) {
      const swell = 1 + (Math.sin(t * 0.75) + 1) * 0.08;
      wakeRef.current.scale.set(swell, swell, 1);
      (wakeRef.current.material as THREE.MeshBasicMaterial).opacity = 0.035 + (Math.sin(t * 0.75) + 1) * 0.025;
    }
  });

  return (
    <group
      ref={shipRef}
      position={[baseX, -3.2, -4.2]}
      scale={lite ? [0.34, 0.34, 0.34] : [0.56, 0.56, 0.56]}
    >
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 2.4]} />
        <meshBasicMaterial color="#83c5be" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wakeRef} position={[-2.7, -1.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 1.2, 32]} />
        <meshBasicMaterial color="#62c5b5" transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Ship Hull (Dark Mahogany with Gold Trim) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.4, 1.3, 1.7]} />
        <meshStandardMaterial color="#2a1607" roughness={0.65} metalness={0.25} />
      </mesh>
      {/* Gold Trim Railing */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[4.45, 0.08, 1.75]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Bow Curve */}
      <mesh position={[2.5, 0.35, 0]} rotation={[0, 0, -Math.PI / 5.5]}>
        <coneGeometry args={[0.95, 1.7, 4]} />
        <meshStandardMaterial color="#1f1005" roughness={0.65} />
      </mesh>
      {/* Bowsprit (Nautical pole extending from bow) */}
      <mesh position={[3.6, 0.9, 0]} rotation={[0, 0, -Math.PI / 4.5]}>
        <cylinderGeometry args={[0.04, 0.07, 2.2, 6]} />
        <meshStandardMaterial color="#4a2e15" roughness={0.6} />
      </mesh>

      {/* Main Mast */}
      <mesh position={[0.2, 2.3, 0]}>
        <cylinderGeometry args={[0.07, 0.11, 4.4, 8]} />
        <meshStandardMaterial color="#4a2e15" />
      </mesh>
      {/* Crow's Nest */}
      <mesh position={[0.2, 3.6, 0]}>
        <cylinderGeometry args={[0.3, 0.22, 0.35, 8]} />
        <meshStandardMaterial color="#2d1b0c" roughness={0.7} />
      </mesh>

      {/* Main Sail (Handcrafted camber billow) */}
      <mesh ref={mainSailRef} position={[0.4, 2.5, 0]} rotation={[0, 0.1, 0]}>
        <planeGeometry args={[2.5, 2.3, 8, 8]} />
        <meshStandardMaterial
          color="#f4ebd9"
          side={THREE.DoubleSide}
          roughness={0.55}
        />
      </mesh>

      {/* Foremast & Foresail */}
      <mesh position={[1.8, 1.8, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 3.4, 8]} />
        <meshStandardMaterial color="#4a2e15" />
      </mesh>
      <mesh ref={foreSailRef} position={[1.9, 1.9, 0]} rotation={[0, 0.1, 0]}>
        <planeGeometry args={[1.7, 1.8, 6, 6]} />
        <meshStandardMaterial
          color="#ebdcc0"
          side={THREE.DoubleSide}
          roughness={0.55}
        />
      </mesh>

      {/* Ceremonial Gala Flag waving on Masthead */}
      <mesh ref={flagRef} position={[-0.3, 4.3, 0]}>
        <planeGeometry args={[1.2, 0.6, 8, 5]} />
        <meshStandardMaterial color="#e45756" side={THREE.DoubleSide} />
      </mesh>

      {/* Warm Golden Stern Lantern */}
      <mesh position={[-2.2, 0.8, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffbf00" />
      </mesh>
      <pointLight
        position={[-2.2, 0.8, 0]}
        color="#ffbf00"
        intensity={3.8}
        distance={8}
      />
    </group>
  );
}

// Floating atmospheric gala lanterns on the ocean
function GalaLanterns({ lite }: { lite: boolean }) {
  const lanterns = useMemo(() => {
    return [
      { pos: [5, -3.2, -5], color: "#e9b949" },
      { pos: [9, -3.4, -8], color: "#83c5be" },
      { pos: [-3, -3.6, -9], color: "#e45756" },
      { pos: [2, -3.5, -4], color: "#f6e7c1" },
    ].slice(0, lite ? 2 : 4);
  }, [lite]);

  return (
    <>
      {lanterns.map((l, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <group position={l.pos as [number, number, number]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.22, 0.35, 8]} />
              <meshBasicMaterial color={l.color} />
            </mesh>
            <pointLight color={l.color} intensity={2} distance={5} />
          </group>
        </Float>
      ))}
    </>
  );
}

export default function ThreeWaterScene({ lite = false }: { lite?: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-90">
      <Canvas
        camera={{ position: [0, 1.5, 9], fov: 48 }}
        dpr={lite ? [1, 1.2] : [1, 1.5]}
        gl={{ antialias: !lite, alpha: true, powerPreference: "low-power" }}
      >
        {/* Ambient & Atmospheric Lighting */}
        <fog attach="fog" args={["#062f3b", 11, 36]} />
        <ambientLight intensity={0.4} color="#101a35" />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          color="#e9b949"
        />
        <pointLight position={[0, -1, 3]} intensity={1.5} color="#83c5be" />

        {/* 3D Elements */}
        <OceanSurface lite={lite} />
        <SailingShip3D lite={lite} />
        <GalaLanterns lite={lite} />

        {/* Ambient Golden Starlight Particles */}
        <Sparkles
          count={lite ? 22 : 70}
          scale={[25, 12, 18]}
          size={2.5}
          speed={0.4}
          color="#e9b949"
        />
        <Sparkles
          count={lite ? 12 : 40}
          scale={[20, 8, 12]}
          size={1.8}
          speed={0.25}
          color="#83c5be"
        />
      </Canvas>
    </div>
  );
}
