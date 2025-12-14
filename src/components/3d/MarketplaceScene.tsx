'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import AssetCard3D from './AssetCard3D';
import ProgressMeter from './ProgressMeter';
import { GameAsset } from '@/types';
import { useCampaignStore } from '@/stores/campaignStore';

interface MarketplaceSceneProps {
  assets: GameAsset[];
  currentAmount?: number;
  targetAmount?: number;
}

export default function MarketplaceScene({ 
  assets,
  currentAmount = 0,
  targetAmount = 100
}: MarketplaceSceneProps) {
  const floorRef = useRef<THREE.Mesh>(null);
  const { selectedAsset, selectAsset } = useCampaignStore();

  // Calculate positions in a circular pattern
  const assetPositions = useMemo(() => {
    const radius = 5;
    return assets.map((_, index) => {
      const angle = (index / assets.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return [x, 0, z] as [number, number, number];
    });
  }, [assets.length]);

  useFrame((state) => {
    if (floorRef.current) {
      // Subtle floor animation
      const material = floorRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms?.time) {
        material.uniforms.time.value = state.clock.elapsedTime;
      }
    }
  });

  return (
    <group>
      {/* Animated floor grid */}
      <mesh 
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30, 50, 50]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.4}
          wireframe
        />
      </mesh>

      {/* Solid floor beneath grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#020617" />
      </mesh>

      {/* Asset cards arranged in circle */}
      {assets.map((asset, index) => (
        <AssetCard3D
          key={asset.id}
          asset={asset}
          position={assetPositions[index]}
          onClick={() => selectAsset(asset)}
          isSelected={selectedAsset?.id === asset.id}
        />
      ))}

      {/* Central progress meter */}
      <ProgressMeter
        current={currentAmount}
        target={targetAmount}
        position={[0, 0.5, 0]}
        label="Campaign Progress"
      />

      {/* Ambient particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[useMemo(() => {
              const positions = new Float32Array(200 * 3);
              for (let i = 0; i < 200; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 30;
                positions[i * 3 + 1] = Math.random() * 10;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
              }
              return positions;
            }, []), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#8b5cf6"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Fog effect */}
      <fog attach="fog" args={['#0f172a', 10, 30]} />
    </group>
  );
}
