import { Environment, Lightformer, RoundedBox, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import artwork from "@/assets/fazti-portal-artwork.jpg.asset.json";

type SceneColors = {
  deep: string;
  accent: string;
  ring: string;
  card: string;
};

function resolveCssColor(variable: string) {
  const swatch = document.createElement("span");
  swatch.style.color = `var(${variable})`;
  swatch.style.display = "none";
  document.body.appendChild(swatch);
  const value = getComputedStyle(swatch).color;
  swatch.remove();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return value;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

function useSceneColors() {
  const [colors, setColors] = useState<SceneColors | null>(null);
  useEffect(() => {
    setColors({
      deep: resolveCssColor("--deep"),
      accent: resolveCssColor("--accent"),
      ring: resolveCssColor("--ring"),
      card: resolveCssColor("--card"),
    });
  }, []);
  return colors;
}

function Monogram({ colors, reducedMotion }: { colors: SceneColors; reducedMotion: boolean }) {
  const texture = useTexture(artwork.url, (loaded) => { loaded.colorSpace = THREE.SRGBColorSpace; });
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector2(), []);

  useFrame(({ pointer, clock }, rawDelta) => {
    const node = group.current;
    if (!node) return;
    const delta = Math.min(rawDelta, 0.05);
    target.set(pointer.y * 0.12, pointer.x * 0.2);
    node.rotation.x = THREE.MathUtils.damp(node.rotation.x, reducedMotion ? 0 : target.x + Math.sin(clock.elapsedTime * 0.43) * 0.055, 3.8, delta);
    node.rotation.y = THREE.MathUtils.damp(node.rotation.y, reducedMotion ? -0.14 : target.y + Math.sin(clock.elapsedTime * 0.36) * 0.12 - 0.14, 3.8, delta);
    node.position.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.12;
  });

  return (
    <group ref={group} rotation-y={-0.14}>
      <pointLight position={[0, 0, -1.4]} color={colors.accent} intensity={18} distance={8} />
      <RoundedBox args={[6.1, 5.1, 0.25]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial color={colors.deep} roughness={0.24} metalness={0.5} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0, 0.135]}>
        <planeGeometry args={[6, 5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.35]}>
        <ringGeometry args={[2.8, 3.05, 64]} />
        <meshBasicMaterial color={colors.ring} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function LandingScene({ reducedMotion }: { reducedMotion: boolean }) {
  const colors = useSceneColors();
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 10.4], fov: 38 }} gl={{ antialias: true, alpha: true }}>
      {colors && (
        <>
          <ambientLight intensity={0.65} color={colors.card} />
          <directionalLight position={[4, 5, 6]} intensity={3.2} color={colors.card} castShadow />
          <Suspense fallback={null}>
            <Monogram colors={colors} reducedMotion={reducedMotion} />
          </Suspense>
          <Environment>
            <Lightformer intensity={2.5} color={colors.accent} position={[0, 4, 2]} scale={[8, 2, 1]} />
            <Lightformer intensity={1.5} color={colors.card} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
          </Environment>
        </>
      )}
    </Canvas>
  );
}
