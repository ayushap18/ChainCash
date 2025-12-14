'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface RevealAnimationProps {
  isRevealing: boolean;
  onComplete?: () => void;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  position?: [number, number, number];
}

const rarityConfigs = {
  common: { color: '#9ca3af', sparkleCount: 20, intensity: 0.5 },
  uncommon: { color: '#22c55e', sparkleCount: 40, intensity: 0.7 },
  rare: { color: '#3b82f6', sparkleCount: 60, intensity: 0.9 },
  epic: { color: '#a855f7', sparkleCount: 100, intensity: 1.2 },
  legendary: { color: '#f59e0b', sparkleCount: 150, intensity: 1.5 },
};

export default function RevealAnimation({ 
  isRevealing, 
  onComplete,
  rarity = 'common',
  position = [0, 0, 0]
}: RevealAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  const [phase, setPhase] = useState<'closed' | 'opening' | 'revealed'>('closed');
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const config = rarityConfigs[rarity];

  useFrame((state, delta) => {
    if (!groupRef.current || !boxRef.current) return;

    if (isRevealing && phase === 'closed') {
      setPhase('opening');
    }

    if (phase === 'opening') {
      setAnimationProgress((prev) => {
        const next = prev + delta * 0.5;
        if (next >= 1) {
          setPhase('revealed');
          onComplete?.();
          return 1;
        }
        return next;
      });

      // Shake effect
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 20) * 0.1 * (1 - animationProgress);
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 20) * 0.1 * (1 - animationProgress);

      // Scale up the box as it opens
      const scale = 1 + animationProgress * 0.5;
      boxRef.current.scale.set(scale, scale, scale);

      // Fade out the box
      const material = boxRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 1 - animationProgress;
    }

    if (phase === 'revealed') {
      // Gentle floating after reveal
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!isRevealing && phase === 'closed') {
    return (
      <group position={position}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <mesh>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial 
              color="#1f2937" 
              metalness={0.8} 
              roughness={0.2}
            />
          </mesh>
          {/* Question mark */}
          <mesh position={[0, 0, 0.8]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial color={config.color} transparent opacity={0.8} />
          </mesh>
        </Float>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Opening box */}
      <mesh ref={boxRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <MeshWobbleMaterial
          color={config.color}
          metalness={0.8}
          roughness={0.2}
          factor={phase === 'opening' ? 2 : 0}
          speed={5}
          transparent
        />
      </mesh>

      {/* Sparkle effects during reveal */}
      {(phase === 'opening' || phase === 'revealed') && (
        <Sparkles
          count={config.sparkleCount}
          scale={3 + animationProgress * 2}
          size={3}
          speed={2}
          color={config.color}
          opacity={config.intensity}
        />
      )}

      {/* Light beam during opening */}
      {phase === 'opening' && (
        <>
          <pointLight 
            position={[0, 0, 0]} 
            intensity={animationProgress * 5} 
            color={config.color}
            distance={5}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, animationProgress * 2, 0]}>
            <coneGeometry args={[0.5 + animationProgress, 3 * animationProgress, 32]} />
            <meshBasicMaterial 
              color={config.color} 
              transparent 
              opacity={0.3 * (1 - animationProgress)}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Revealed content placeholder */}
      {phase === 'revealed' && (
        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.7}>
          <mesh>
            <octahedronGeometry args={[0.8]} />
            <meshStandardMaterial
              color={config.color}
              metalness={0.9}
              roughness={0.1}
              emissive={config.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
}
