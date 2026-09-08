// cache buster 2
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
function HologramScene({
  onComplete
}: {
  onComplete: () => void;
}) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(120, 120, 60, 60), []);
  const wireMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);
  const textRef = useRef<THREE.Group>(null);
  const completed = useRef(false);

  // Initialize random particle colors to match the image (blue and magenta mix)
  const colors = useMemo(() => {
    const arr = new Float32Array(geometry.attributes.position.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      // 70% blue/cyan, 30% magenta/pink
      if (Math.random() > 0.7) {
        color.set('#d946ef'); // magenta
      } else {
        color.set('#3b82f6'); // blue
      }
      arr[i * 3] = color.r;
      arr[i * 3 + 1] = color.g;
      arr[i * 3 + 2] = color.b;
    }
    return arr;
  }, [geometry]);

  // Apply colors to geometry
  useMemo(() => {
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [geometry, colors]);
  useFrame(state => {
    const t = state.clock.elapsedTime;

    // --- Wave Animation (Calm & Sophisticated) ---
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const wave1 = Math.sin(x * 0.08 + t * 0.4) * Math.cos(y * 0.08 + t * 0.3) * 3.5;
      const wave2 = Math.sin(x * 0.04 - t * 0.2) * 2;
      const wave3 = Math.cos(y * 0.05 + t * 0.25) * 2;
      pos.setZ(i, wave1 + wave2 + wave3);
    }
    pos.needsUpdate = true;

    // --- Fluid Camera Movement ---
    const targetY = THREE.MathUtils.lerp(3, 12, Math.min(t / 6, 1));
    const targetZ = THREE.MathUtils.lerp(18, 30, Math.min(t / 6, 1));
    const targetX = Math.sin(t * 0.15) * 8;
    state.camera.position.set(targetX, targetY, targetZ);
    state.camera.lookAt(0, 2, 0);

    // --- Transitions & Fades ---
    let opacityMulti = 1;
    if (t < 2) {
      opacityMulti = t / 2; // Fade in
    } else if (t > 7) {
      opacityMulti = Math.max(0, 1 - (t - 7) / 1.5); // Fade out smoothly
    }
    if (wireMatRef.current) wireMatRef.current.opacity = 0.15 * opacityMulti;
    if (pointsMatRef.current) pointsMatRef.current.opacity = 0.9 * opacityMulti;

    // --- Text Animation ---
    if (textRef.current) {
      if (t > 2.5) {
        textRef.current.visible = true;

        // Smooth arrival easing
        const textProgress = Math.min((t - 2.5) / 2.5, 1);
        const easeOutQuart = 1 - Math.pow(1 - textProgress, 4);
        textRef.current.position.y = THREE.MathUtils.lerp(-3, 4, easeOutQuart);

        // Soft floating sine wave after arrival
        if (t > 5) {
          textRef.current.position.y = 4 + Math.sin((t - 5) * 1.5) * 0.4;
        }
        textRef.current.scale.setScalar(THREE.MathUtils.lerp(0.8, 1.1, easeOutQuart));

        // Text fade out at the end
        if (t > 7) {
          const textFade = Math.max(0, 1 - (t - 7));
          textRef.current.children.forEach(child => {
            if ((child as any).material) {
              (child as any).material.opacity = textFade;
              (child as any).material.transparent = true;
            }
          });
        }
      }
    }

    // --- End Sequence ---
    if (t >= 8.5) {
      if (!completed.current) {
        completed.current = true;
        onComplete();
      }
    }
  });
  return <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 15, 45]} />
      
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
        {/* The thin glowing lines */}
        <mesh geometry={geometry}>
          <meshBasicMaterial ref={wireMatRef} color="#38bdf8" wireframe transparent opacity={0} blending={THREE.AdditiveBlending} />
        </mesh>
        
        {/* The glowing intersection nodes */}
        <points geometry={geometry}>
          <pointsMaterial ref={pointsMatRef} size={0.25} vertexColors={true} transparent opacity={0} sizeAttenuation={true} blending={THREE.AdditiveBlending} />
        </points>
      </group>

      {/* Elegant Floating Text */}
      <group ref={textRef} visible={false} position={[0, -3, 0]}>
        <Text position={[0, 0.8, 0]} fontSize={2.5} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#c026d3" font="https://cdn.jsdelivr.net/npm/@fontsource/plus-jakarta-sans@5.0.19/files/plus-jakarta-sans-latin-700-normal.woff">
          Iniciando Ecosistema Qubits
        </Text>
        <Text position={[0, -1, 0]} fontSize={1} color="#94a3b8" anchorX="center" anchorY="middle" font="https://cdn.jsdelivr.net/npm/@fontsource/plus-jakarta-sans@5.0.19/files/plus-jakarta-sans-latin-400-normal.woff">
          a sua empresa inteligente e com fluidez
        </Text>
      </group>
    </>;
}
export function HologramIntro({
  onComplete
}: {
  onComplete: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const handleComplete = () => {
    setIsVisible(false);
    // Transição super fluida e suave com 2000ms
    setTimeout(onComplete, 2000);
  };
  return <div className={`fixed inset-0 z-[100] transition-opacity duration-[2000ms] ease-in-out bg-[#020617] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <Canvas camera={{
      position: [0, 2, 10],
      fov: 60
    }}>
        <React.Suspense fallback={null}>
          <HologramScene onComplete={handleComplete} />
        </React.Suspense>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Vignette Overlay for sophistication */}
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#020617]/50 to-[#020617]" />
      </div>
    </div>;
}