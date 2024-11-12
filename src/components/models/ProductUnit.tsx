import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Shape } from 'three';
import { ChimneySmoke } from '../effects/ChimneySmoke';

// Separate smoke component to avoid re-renders
const StaticChimney = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow>
      <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
      <meshStandardMaterial color="#666666" />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.08, 0.1, 8]} />
      <meshStandardMaterial color="#555555" />
    </mesh>
  </group>
);

export function ProductUnit({ color, isSelected }: { color: string; isSelected: boolean }) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isSelected ? 1.2 : 1;
      groupRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
    }
  });

  const glowIntensity = isSelected ? 1.5 : 0.8;
  const glowColor = "#4488ff";

  // Create sawtooth roof shape
  const createSawtoothSection = (x: number) => {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.4, 0.4);
    shape.lineTo(0.4, 0);
    shape.lineTo(0, 0);

    return (
      <group key={`roof-section-${x}`} position={[x - 1, 2, -1]}>
        <mesh castShadow>
          <extrudeGeometry 
            args={[shape, {
              depth: 2,
              bevelEnabled: false
            }]}
          />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
      </group>
    );
  };

  return (
    <>
      {/* Static chimneys with smoke outside the animated group */}
      {[-0.4, 0.4].map((x, i) => (
        <group key={`chimney-smoke-${i}`} position={[x, 2.95, -0.8]}>
          <ChimneySmoke position={[0, 0, 0]} />
        </group>
      ))}

      <group ref={groupRef}>
        {/* Base Platform */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[2.4, 0.1, 2.4]} />
          <meshStandardMaterial 
            color="#cccccc"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>

        {/* Extended Main Warehouse Structure */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color="#e8e8e8"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Back Extension for Roof Support */}
        <mesh position={[0, 1, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 1]} />
          <meshStandardMaterial 
            color="#e8e8e8"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Sawtooth Roof Sections */}
        {[0, 0.8, 1.6].map((x) => createSawtoothSection(x))}

        {/* Static Chimneys */}
        {[-0.4, 0.4].map((x, i) => (
          <StaticChimney key={`chimney-${i}`} position={[x, 2.5, -0.8]} />
        ))}

        {/* Loading Bay Door */}
        <mesh position={[0, 0.8, 1.01]} castShadow>
          <boxGeometry args={[1.2, 1.4, 0.05]} />
          <meshPhysicalMaterial
            color="#666666"
            metalness={0.6}
            roughness={0.2}
            emissive={glowColor}
            emissiveIntensity={glowIntensity * 0.3}
          />
        </mesh>

        {/* Side Windows */}
        {[-1.01, 1.01].map((x) => (
          <group key={`windows-${x}`} position={[x, 1, 0]}>
            {[-0.4, 0.4].map((z) => (
              <mesh key={`window-${x}-${z}`} position={[0, 0, z]} castShadow>
                <boxGeometry args={[0.05, 0.6, 0.4]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  metalness={0.1}
                  roughness={0.1}
                  transmission={0.8}
                  thickness={0.5}
                  emissive={glowColor}
                  emissiveIntensity={glowIntensity}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Loading Bay Ramp */}
        <mesh position={[0, 0.1, 1.2]} rotation={[-Math.PI / 16, 0, 0]} receiveShadow>
          <boxGeometry args={[1.4, 0.1, 0.4]} />
          <meshStandardMaterial
            color="#aaaaaa"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Window Lights */}
        {[-1, 1].map((x) => (
          <pointLight
            key={`light-${x}`}
            position={[x, 1, 0]}
            color={glowColor}
            intensity={isSelected ? 0.4 : 0.2}
            distance={2}
            decay={2}
          />
        ))}

        {/* Loading Bay Light */}
        <spotLight
          position={[0, 2, 1]}
          angle={Math.PI / 6}
          penumbra={0.5}
          intensity={isSelected ? 0.3 : 0.15}
          color={glowColor}
          castShadow
          distance={3}
          decay={2}
        />
      </group>
    </>
  );
}