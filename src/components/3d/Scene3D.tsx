'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, ReactNode } from 'react';
import { 
  Environment, 
  OrbitControls, 
  PerspectiveCamera,
  Preload 
} from '@react-three/drei';

interface Scene3DProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  enableOrbitControls?: boolean;
  environmentPreset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
}

export default function Scene3D({ 
  children, 
  cameraPosition = [0, 2, 8],
  enableOrbitControls = true,
  environmentPreset = 'city'
}: Scene3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
        }}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera 
          makeDefault 
          position={cameraPosition} 
          fov={50}
        />
        
        {enableOrbitControls && (
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={20}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}

        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />

        <Suspense fallback={<LoadingFallback />}>
          <Environment preset={environmentPreset} />
          {children}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
