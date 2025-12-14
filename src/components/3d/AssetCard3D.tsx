'use client';

import { useRef, useState, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { GameAsset } from '@/types';

interface AssetCard3DProps {
  asset: GameAsset;
  position: [number, number, number];
  onClick?: () => void;
  isSelected?: boolean;
}

// Rarity colors
const rarityColors: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

// Category icons (simplified geometric shapes)
const categoryShapes: Record<string, ReactNode> = {
  character: (
    <mesh position={[0, 0.3, 0]}>
      <capsuleGeometry args={[0.3, 0.6, 4, 16]} />
      <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
    </mesh>
  ),
  weapon: (
    <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.1, 1.2, 0.1]} />
      <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.1} />
    </mesh>
  ),
  skin: (
    <mesh position={[0, 0.3, 0]}>
      <torusGeometry args={[0.4, 0.15, 16, 32]} />
      <meshStandardMaterial color="#06b6d4" metalness={0.7} roughness={0.3} />
    </mesh>
  ),
  item: (
    <mesh position={[0, 0.3, 0]}>
      <octahedronGeometry args={[0.4]} />
      <meshStandardMaterial color="#22c55e" metalness={0.6} roughness={0.4} />
    </mesh>
  ),
  vehicle: (
    <mesh position={[0, 0.3, 0]}>
      <coneGeometry args={[0.4, 0.8, 6]} />
      <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
    </mesh>
  ),
};

export default function AssetCard3D({ 
  asset, 
  position, 
  onClick,
  isSelected = false 
}: AssetCard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const rarityColor = rarityColors[asset.rarity] || '#9ca3af';

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Scale on hover/select
      const targetScale = hovered || isSelected ? 1.1 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Card base */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <RoundedBox args={[2, 2.5, 0.2]} radius={0.1} smoothness={4}>
          <MeshDistortMaterial
            color={hovered || isSelected ? rarityColor : '#1f2937'}
            metalness={0.5}
            roughness={0.3}
            distort={hovered ? 0.1 : 0}
            speed={2}
          />
        </RoundedBox>

        {/* Glow ring based on rarity */}
        <mesh position={[0, 0, 0.15]}>
          <ringGeometry args={[0.85, 0.95, 32]} />
          <meshBasicMaterial 
            color={rarityColor} 
            transparent 
            opacity={hovered || isSelected ? 0.8 : 0.4}
          />
        </mesh>

        {/* Category shape/icon */}
        <group position={[0, 0.2, 0.2]}>
          {categoryShapes[asset.category]}
        </group>

        {/* Price tag */}
        <group position={[0, -0.8, 0.15]}>
          <RoundedBox args={[1.2, 0.35, 0.05]} radius={0.05}>
            <meshStandardMaterial color="#8b5cf6" metalness={0.8} roughness={0.2} />
          </RoundedBox>
        </group>

        {/* Sold indicator */}
        <group position={[0.7, 1, 0.15]}>
          <mesh>
            <circleGeometry args={[0.2, 32]} />
            <meshBasicMaterial 
              color={asset.soldCount >= asset.totalSupply ? '#ef4444' : '#22c55e'} 
            />
          </mesh>
        </group>
      </Float>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, -0.2]}>
          <planeGeometry args={[2.4, 2.9]} />
          <meshBasicMaterial color={rarityColor} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
