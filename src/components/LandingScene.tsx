import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

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
  return value;
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
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector2(), []);

  useFrame(({ pointer, clock }, rawDelta) => {
    const node = group.current;
    if (!node) return;
    const delta = Math.min(rawDelta, 0.05);
    target.set(pointer.y * 0.12, pointer.x * 0.2);
    node.rotation.x = THREE.MathUtils.damp(node.rotation.x, reducedMotion ? 0 : target.x, 3.8, delta);
    node.rotation.y = THREE.MathUtils.damp(node.rotation.y, reducedMotion ? -0.14 : target.y - 0.14, 3.8, delta);
    node.position.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.12;
  });

  return (
    <group ref={group} rotation-y={-0.14}>
      <pointLight position={[0, 0, -1.4]} color={colors.accent} intensity={18} distance={8} />
      <RoundedBox args={[4.25, 4.25, 0.42]} radius={0.24} smoothness={6} castShadow>
        <meshPhysicalMaterial color={colors.deep} roughness={0.24} metalness={0.45} clearcoat={1} clearcoatRoughness={0.18} />
      </RoundedBox>
      <group position={[-0.25, 0, 0.32]}>
        <RoundedBox args={[0.54, 2.7, 0.4]} radius={0.12} smoothness={5} position={[-0.62, 0, 0]} castShadow>
          <meshPhysicalMaterial color={colors.card} roughness={0.2} metalness={0.1} />
        </RoundedBox>
        <RoundedBox args={[2.25, 0.54, 0.4]} radius={0.12} smoothness={5} position={[0.22, 1.08, 0]} castShadow>
          <meshPhysicalMaterial color={colors.card} roughness={0.2} metalness={0.1} />
        </RoundedBox>
        <RoundedBox args={[1.72, 0.5, 0.42]} radius={0.12} smoothness={5} position={[-0.02, 0.04, 0]} castShadow>
          <meshPhysicalMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.2} roughness={0.18} />
        </RoundedBox>
      </group>
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
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8.4], fov: 38 }} gl={{ antialias: true, alpha: true }}>
      {colors && (
        <>
          <ambientLight intensity={0.65} color={colors.card} />
          <directionalLight position={[4, 5, 6]} intensity={3.2} color={colors.card} castShadow />
          <Monogram colors={colors} reducedMotion={reducedMotion} />
          <Environment>
            <Lightformer intensity={2.5} color={colors.accent} position={[0, 4, 2]} scale={[8, 2, 1]} />
            <Lightformer intensity={1.5} color={colors.card} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
          </Environment>
        </>
      )}
    </Canvas>
  );
}
