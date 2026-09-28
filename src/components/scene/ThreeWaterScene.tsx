"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Dynamic procedural water surface using vertex manipulation
function OceanSurface() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Plane geometry
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(60, 40, 64, 48);
  }, []);

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
        color="#061226"
        emissive="#030814"
        roughness={0.15}
        metalness={0.85}
        wireframe={false}
        transparent
        opacity={0.82}
      />
    </mesh>
  );
}

// 3D Galleon with bobbing physics and glowing stern lantern
function SailingShip3D() {
  const shipRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!shipRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle nautical bobbing and pitch/roll
    shipRef.current.position.y = -2.2 + Math.sin(t * 1.1) * 0.25;
    shipRef.current.rotation.z = Math.sin(t * 0.8) * 0.04;
    shipRef.current.rotation.x = Math.cos(t * 0.7) * 0.03;
  });

  return (
    <group ref={shipRef} position={[-7, -2.2, -6]} scale={[0.85, 0.85, 0.85]}>
      {/* Ship Hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 1.2, 1.6]} />
        <meshStandardMaterial color="#2d1b0c" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Bow curve */}
      <mesh position={[2.4, 0.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <coneGeometry args={[0.9, 1.6, 4]} />
        <meshStandardMaterial color="#1a0f07" />
      </mesh>
      {/* Main Mast */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 4.2, 8]} />
        <meshStandardMaterial color="#4a2e15" />
      </mesh>
      {/* Main Sail (Cloth curved plane) */}
      <mesh position={[0.2, 2.5, 0]}>
        <planeGeometry args={[2.4, 2.2, 8, 8]} />
        <meshStandardMaterial
          color="#f4ebd9"
          side={THREE.DoubleSide}
          roughness={0.5}
        />
      </mesh>
      {/* Gala Flag waving on Masthead */}
      <mesh position={[-0.4, 4.1, 0]}>
        <planeGeometry args={[1.1, 0.55]} />
        <meshStandardMaterial color="#c41e3a" side={THREE.DoubleSide} />
      </mesh>
      {/* Warm Golden Stern Lantern */}
      <mesh position={[-2.1, 0.7, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#ffbf00" />
      </mesh>
      <pointLight
        position={[-2.1, 0.7, 0]}
        color="#ffbf00"
        intensity={3.5}
        distance={7}
      />
    </group>
  );
}

// Floating atmospheric gala lanterns on the ocean
function GalaLanterns() {
  const lanterns = useMemo(() => {
    return [
      { pos: [5, -3.2, -5], color: "#d4af37" },
      { pos: [9, -3.4, -8], color: "#ffbf00" },
      { pos: [-3, -3.6, -9], color: "#ff8c00" },
      { pos: [2, -3.5, -4], color: "#d4af37" },
    ];
  }, []);

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

export default function ThreeWaterScene() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-90">
      <Canvas
        camera={{ position: [0, 1.5, 9], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Ambient & Atmospheric Lighting */}
        <ambientLight intensity={0.4} color="#0c1d3d" />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          color="#d4af37"
        />
        <pointLight position={[0, -1, 3]} intensity={1.5} color="#38bdf8" />

        {/* 3D Elements */}
        <OceanSurface />
        <SailingShip3D />
        <GalaLanterns />

        {/* Ambient Golden Starlight Particles */}
        <Sparkles
          count={70}
          scale={[25, 12, 18]}
          size={2.5}
          speed={0.4}
          color="#d4af37"
        />
        <Sparkles
          count={40}
          scale={[20, 8, 12]}
          size={1.8}
          speed={0.25}
          color="#ffffff"
        />
      </Canvas>
    </div>
  );
}
