'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';

interface ProgressMeterProps {
  current: number;
  target: number;
  position?: [number, number, number];
  label?: string;
}

export default function ProgressMeter({ 
  current, 
  target, 
  position = [0, 0, 0],
  label = 'Progress'
}: ProgressMeterProps) {
  const fillRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const progress = Math.min(current / target, 1);
  const fillHeight = progress * 3;

  useFrame((state) => {
    if (fillRef.current) {
      // Animate fill height
      const currentHeight = fillRef.current.scale.y;
      const targetHeight = fillHeight;
      fillRef.current.scale.y = THREE.MathUtils.lerp(currentHeight, targetHeight, 0.05);
      fillRef.current.position.y = (fillRef.current.scale.y * 0.5) - 1.5;
    }

    if (glowRef.current) {
      // Pulsing glow effect
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.5;
    }
  });

  // Color based on progress
  const getProgressColor = () => {
    if (progress >= 1) return '#22c55e'; // Green - completed
    if (progress >= 0.75) return '#84cc16'; // Lime - almost there
    if (progress >= 0.5) return '#eab308'; // Yellow - halfway
    if (progress >= 0.25) return '#f97316'; // Orange - quarter
    return '#8b5cf6'; // Purple - starting
  };

  return (
    <group position={position}>
      {/* Outer glass cylinder */}
      <Cylinder args={[0.5, 0.5, 3.2, 32]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#1f2937"
          metalness={0.1}
          roughness={0}
          transmission={0.9}
          thickness={0.5}
        />
      </Cylinder>

      {/* Fill level */}
      <mesh ref={fillRef} position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 1, 32]} />
        <meshStandardMaterial
          color={getProgressColor()}
          metalness={0.3}
          roughness={0.2}
          emissive={getProgressColor()}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 3.2, 32]} />
        <meshBasicMaterial
          color={getProgressColor()}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Progress markers */}
      {[0.25, 0.5, 0.75, 1].map((marker, index) => (
        <mesh key={index} position={[0.55, -1.5 + marker * 3, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.1]} />
          <meshStandardMaterial 
            color={progress >= marker ? getProgressColor() : '#4b5563'} 
          />
        </mesh>
      ))}

      {/* Base */}
      <Cylinder args={[0.7, 0.8, 0.3, 32]} position={[0, -1.7, 0]}>
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Top cap */}
      <Cylinder args={[0.55, 0.5, 0.15, 32]} position={[0, 1.65, 0]}>
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Label */}
      <Text
        position={[0, -2.3, 0]}
        fontSize={0.2}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Percentage */}
      <Text
        position={[0, 2.1, 0]}
        fontSize={0.3}
        color={getProgressColor()}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {`${Math.round(progress * 100)}%`}
      </Text>
    </group>
  );
}
