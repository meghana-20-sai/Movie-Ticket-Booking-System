import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, Sparkles, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// 3D Cinema Seat Mesh
function CinemaSeat({ position, rotation, scale = 1, color = '#e11d48' }) {
  const meshRef = useRef();

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Seat Cushion */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.9, 0.2, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.5, -0.35]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Headrest */}
      <mesh position={[0, 1.05, -0.4]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.7, 0.25, 0.25]} />
        <meshStandardMaterial color="#be123c" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.5, 0.3, 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.7]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.8} />
      </mesh>
      <mesh position={[0.5, 0.3, 0]} castShadow>
        <boxGeometry args={[0.12, 0.5, 0.7]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.8} />
      </mesh>
    </group>
  );
}

// 3D Film Reel Mesh
function FilmReel({ position, scale = 1 }) {
  const reelRef = useRef();

  useFrame((state, delta) => {
    if (reelRef.current) {
      reelRef.current.rotation.z += delta * 0.4;
      reelRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={reelRef} position={position} scale={scale}>
      {/* Outer Ring */}
      <mesh>
        <torusGeometry args={[1.2, 0.12, 16, 64]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} emissive="#b45309" emissiveIntensity={0.2} />
      </mesh>
      {/* Inner Hub */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Film Spokes */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, idx) => (
        <mesh key={idx} rotation={[0, 0, angle]}>
          <boxGeometry args={[2.2, 0.08, 0.15]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Floating Cinema Golden Ticket Mesh
function FloatingTicket({ position, rotation, scale = 1 }) {
  const ticketRef = useRef();

  useFrame((state) => {
    if (ticketRef.current) {
      const t = state.clock.getElapsedTime();
      ticketRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.15;
      ticketRef.current.rotation.y = rotation[1] + Math.cos(t * 0.8) * 0.2;
    }
  });

  return (
    <group ref={ticketRef} position={position} rotation={rotation} scale={scale}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.9, 0.04]} />
        <meshStandardMaterial
          color="#f43f5e"
          metalness={0.6}
          roughness={0.2}
          emissive="#be123c"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Gold Strip */}
      <mesh position={[0.4, 0, 0.025]}>
        <planeGeometry args={[0.3, 0.8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

// Cinematic Projector Light Beam
function ProjectorLightBeam() {
  const beamRef = useRef();

  useFrame((state) => {
    if (beamRef.current) {
      const t = state.clock.getElapsedTime();
      beamRef.current.material.opacity = 0.15 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <mesh ref={beamRef} position={[0, 4, -4]} rotation={[0.6, 0, 0]}>
      <coneGeometry args={[5, 12, 32, 1, true]} />
      <meshBasicMaterial
        color="#38bdf8"
        transparent
        opacity={0.18}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Interactive Camera Rig with Smooth Mouse Parallax
function CameraRig() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.x * 0.8, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouse.y * 0.5 + 1.2, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return <PerspectiveCamera makeDefault position={[0, 1.2, 5.5]} fov={50} />;
}

// 3D Scene Root
function CinemaScene() {
  return (
    <>
      <CameraRig />

      {/* Cinematic Studio Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" castShadow />
      <pointLight position={[-4, 2, 2]} intensity={2.5} color="#e11d48" distance={10} />
      <pointLight position={[4, -2, 1]} intensity={2.0} color="#38bdf8" distance={10} />
      <spotLight position={[0, 6, 2]} intensity={3} angle={0.6} penumbra={0.8} color="#fbbf24" />

      {/* Projector Light Beam */}
      <ProjectorLightBeam />

      {/* Floating 3D Cinema Seats */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <CinemaSeat position={[-2.8, -0.6, 0.2]} rotation={[0.2, 0.4, -0.1]} scale={0.9} color="#e11d48" />
        <CinemaSeat position={[2.9, -0.4, -0.5]} rotation={[0.1, -0.5, 0.1]} scale={0.85} color="#be123c" />
        <CinemaSeat position={[0, -1.8, -1]} rotation={[0.1, 0, 0]} scale={1.1} color="#9f1239" />
      </Float>

      {/* Floating 3D Film Reels */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
        <FilmReel position={[-3.2, 1.8, -1.5]} scale={0.7} />
        <FilmReel position={[3.3, 1.5, -1.2]} scale={0.6} />
      </Float>

      {/* Floating Golden Cinema Tickets */}
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.8}>
        <FloatingTicket position={[-1.8, 1.2, 0.5]} rotation={[0.1, 0.3, 0.2]} scale={0.8} />
        <FloatingTicket position={[2.0, 1.6, 0.2]} rotation={[-0.2, -0.4, -0.2]} scale={0.75} />
      </Float>

      {/* Atmospheric Cinematic Dust / Stardust Particles */}
      <Sparkles
        count={75}
        scale={[10, 8, 8]}
        size={2.5}
        speed={0.4}
        opacity={0.6}
        color="#fbbf24"
      />
      <Sparkles
        count={50}
        scale={[12, 10, 10]}
        size={3}
        speed={0.3}
        opacity={0.4}
        color="#f43f5e"
      />
    </>
  );
}

export default function CinemaCanvas() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-950/40 via-cinema-950 to-cinema-950 pointer-events-none opacity-80" />
    );
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <CinemaScene />
      </Canvas>
    </div>
  );
}
