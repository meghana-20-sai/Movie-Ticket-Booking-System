/**
 * CinemaCanvas.jsx — Premium 3D Cinema Background
 *
 * Camera angle: seated audience perspective looking toward the IMAX screen.
 * Matches reference: red velvet seats filling foreground, massive screen ahead,
 * red curtains on both sides, amber projector beam, neon floor aisles.
 */
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// -- IMAX Screen -----------------------------------------------
function CinemaScreen({ movies }) {
  const screenRef = useRef();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!movies || movies.length < 2) return;
    const iv = setInterval(() => setIdx((p) => (p + 1) % Math.min(movies.length, 8)), 4500);
    return () => clearInterval(iv);
  }, [movies]);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = 0.18 + Math.sin(t * 0.7) * 0.055;
    }
  });
  return (
    <group position={[0, 3.2, -14]}>
      {/* Outer black frame */}
      <mesh>
        <boxGeometry args={[18, 9.5, 0.22]} />
        <meshStandardMaterial color="#030408" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Thin gold trim border */}
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[17.7, 9.2, 0.03]} />
        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.2} emissive="#7a5500" emissiveIntensity={0.55} />
      </mesh>
      {/* Glowing screen surface */}
      <mesh ref={screenRef} position={[0, 0, 0.14]}>
        <planeGeometry args={[17.2, 8.8]} />
        <meshStandardMaterial
          color="#b8d4f0"
          emissive="#3060a8"
          emissiveIntensity={0.18}
          roughness={0.96}
        />
      </mesh>
      {/* Screen glow onto scene */}
      <pointLight position={[0, 0, 2]} intensity={8} distance={28} color="#4a90e2" decay={2} />
      <spotLight position={[0, 3, 3]} target-position={[0, 0, -14]} intensity={10} angle={0.55} penumbra={1} color="#7ab0f5" distance={35} decay={2} />
    </group>
  );
}

// -- Projector Beam (upper-left corner, like reference) --------
function ProjectorBeam() {
  const beamRef = useRef();
  const dustRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (beamRef.current) beamRef.current.material.opacity = 0.038 + Math.sin(t * 2.1) * 0.012;
    if (dustRef.current) dustRef.current.material.opacity = 0.025 + Math.sin(t * 1.4 + 1) * 0.01;
  });
  return (
    <group>
      {/* Main projector cone */}
      <mesh ref={beamRef} position={[-4, 7, 5]} rotation={[Math.PI * 0.12, Math.PI * 0.08, 0]}>
        <coneGeometry args={[5.5, 22, 28, 1, true]} />
        <meshBasicMaterial color="#d0b870" transparent opacity={0.04} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Secondary softer glow */}
      <mesh ref={dustRef} position={[-4, 7.5, 4]} rotation={[Math.PI * 0.12, Math.PI * 0.09, 0]}>
        <coneGeometry args={[6, 24, 24, 1, true]} />
        <meshBasicMaterial color="#e0c880" transparent opacity={0.025} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Point light source (projector box location) */}
      <pointLight position={[-5, 8, 6]} intensity={3} color="#d4b060" distance={35} decay={2} />
    </group>
  );
}

// -- Red Velvet Curtains with Gold Trim ------------------------
function Curtains() {
  const leftRef = useRef();
  const rightRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (leftRef.current) {
      leftRef.current.rotation.z = Math.sin(t * 0.25) * 0.012;
    }
    if (rightRef.current) {
      rightRef.current.rotation.z = -Math.sin(t * 0.28 + 0.8) * 0.012;
    }
  });
  // Left curtain
  const leftCurtain = (
    <group ref={leftRef} position={[-10.5, 2.5, -12]}>
      {/* Main velvet panel */}
      <mesh castShadow>
        <boxGeometry args={[3.0, 10.5, 0.12]} />
        <meshStandardMaterial color="#4a0812" roughness={0.88} side={THREE.DoubleSide} />
      </mesh>
      {/* Gold right trim */}
      <mesh position={[1.42, 0, 0.07]}>
        <boxGeometry args={[0.12, 10.5, 0.05]} />
        <meshStandardMaterial color="#c09820" metalness={0.88} roughness={0.22} emissive="#805510" emissiveIntensity={0.45} />
      </mesh>
      {/* Curtain rod */}
      <mesh position={[0, 5.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 3.5, 14]} />
        <meshStandardMaterial color="#c8a030" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Rod end caps */}
      <mesh position={[1.75, 5.3, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#d4b040" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[-1.75, 5.3, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#d4b040" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
  // Right curtain
  const rightCurtain = (
    <group ref={rightRef} position={[10.5, 2.5, -12]}>
      <mesh castShadow>
        <boxGeometry args={[3.0, 10.5, 0.12]} />
        <meshStandardMaterial color="#4a0812" roughness={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-1.42, 0, 0.07]}>
        <boxGeometry args={[0.12, 10.5, 0.05]} />
        <meshStandardMaterial color="#c09820" metalness={0.88} roughness={0.22} emissive="#805510" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 5.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 3.5, 14]} />
        <meshStandardMaterial color="#c8a030" metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh position={[1.75, 5.3, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#d4b040" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[-1.75, 5.3, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#d4b040" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
  return <>{leftCurtain}{rightCurtain}</>;
}

// -- Single Seat -----------------------------------------------
function Seat({ position, color }) {
  const arm = "#0c0c16";
  return (
    <group position={position}>
      {/* Seat cushion */}
      <mesh castShadow>
        <boxGeometry args={[0.82, 0.14, 0.72]} />
        <meshStandardMaterial color={color} roughness={0.68} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.44, -0.28]} rotation={[-0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.82, 0.75, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.60} />
      </mesh>
      {/* Left armrest */}
      <mesh position={[-0.43, 0.23, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.65]} />
        <meshStandardMaterial color={arm} roughness={0.8} metalness={0.7} />
      </mesh>
      {/* Right armrest */}
      <mesh position={[0.43, 0.23, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.65]} />
        <meshStandardMaterial color={arm} roughness={0.8} metalness={0.7} />
      </mesh>
      {/* Cup holder (left armrest) */}
      <mesh position={[-0.43, 0.42, 0.12]}>
        <cylinderGeometry args={[0.055, 0.05, 0.07, 10]} />
        <meshStandardMaterial color="#1a1a28" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
}

// -- A Full Row of Seats ---------------------------------------
function SeatRow({ z, y, count, color }) {
  const spacing = 1.0;
  const startX = -((count - 1) / 2) * spacing;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const skip = i === 5 || i === count - 6;
        return (
          <Seat
            key={i}
            position={[startX + i * spacing + (skip && i >= count / 2 ? 0.35 : skip ? -0.35 : 0), y, z]}
            color={color}
          />
        );
      })}
    </>
  );
}

// -- Reflective Theater Floor with LED Aisles ------------------
function TheaterFloor() {
  return (
    <group>
      {/* Main dark polished floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, -3]} receiveShadow>
        <planeGeometry args={[32, 36]} />
        <meshStandardMaterial color="#050810" roughness={0.08} metalness={0.55} />
      </mesh>
      {/* Left red LED aisle strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.2, -2.58, -3]}>
        <planeGeometry args={[0.13, 36]} />
        <meshBasicMaterial color="#e11d48" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Right red LED aisle strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.2, -2.58, -3]}>
        <planeGeometry args={[0.13, 36]} />
        <meshBasicMaterial color="#e11d48" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Amber stair-edge accent strips */}
      {[-5, -2.5, 0, 2.5].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.57, z]}>
          <planeGeometry args={[12.5, 0.065]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {/* Ambient floor glow from aisles */}
      <pointLight position={[-6.2, -2.3, -2]} intensity={2.5} distance={12} color="#cc1030" decay={2} />
      <pointLight position={[6.2, -2.3, -2]} intensity={2.5} distance={12} color="#cc1030" decay={2} />
    </group>
  );
}

// -- Dark Theater Walls with Gold Accent Panels ----------------
function TheaterWalls() {
  return (
    <>
      {/* Back wall (behind camera) */}
      <mesh position={[0, 3, 10]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#080810" roughness={0.98} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-13, 3, -3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial color="#09091a" roughness={0.97} />
      </mesh>
      {/* Right wall */}
      <mesh position={[13, 3, -3]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial color="#09091a" roughness={0.97} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 9, -3]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#05050e" roughness={0.99} />
      </mesh>
      {/* Front wall (below/around screen) */}
      <mesh position={[0, 3, -15]} rotation={[0, 0, 0]}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#06060e" roughness={0.98} />
      </mesh>

      {/* Left wall gold accent sconces (like the reference) */}
      {[-4, -1, 2, 5].map((z, i) => (
        <group key={"ls" + i} position={[-12.5, 4.5, z]}>
          <mesh>
            <boxGeometry args={[0.05, 0.6, 0.3]} />
            <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.2} emissive="#7a4800" emissiveIntensity={0.5} />
          </mesh>
          <pointLight intensity={0.8} distance={4} color="#d4a040" decay={2} />
        </group>
      ))}
      {/* Right wall gold accent sconces */}
      {[-4, -1, 2, 5].map((z, i) => (
        <group key={"rs" + i} position={[12.5, 4.5, z]}>
          <mesh>
            <boxGeometry args={[0.05, 0.6, 0.3]} />
            <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.2} emissive="#7a4800" emissiveIntensity={0.5} />
          </mesh>
          <pointLight intensity={0.8} distance={4} color="#d4a040" decay={2} />
        </group>
      ))}

      {/* Left wall gold frame panels (like reference) */}
      {[-2, 2, 6].map((z, i) => (
        <mesh key={"lp" + i} position={[-12.8, 3.5, z]}>
          <boxGeometry args={[0.04, 3.5, 2.5]} />
          <meshStandardMaterial color="#8a6010" metalness={0.85} roughness={0.25} emissive="#4a3008" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {[-2, 2, 6].map((z, i) => (
        <mesh key={"rp" + i} position={[12.8, 3.5, z]}>
          <boxGeometry args={[0.04, 3.5, 2.5]} />
          <meshStandardMaterial color="#8a6010" metalness={0.85} roughness={0.25} emissive="#4a3008" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </>
  );
}

// -- Mouse-Parallax Camera Rig ---------------------------------
function CameraRig() {
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  useFrame((state) => {
    // Subtle parallax — camera shifts slightly with mouse
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.current.x * 0.55, 0.035);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.8 + mouse.current.y * 0.22, 0.035);
    // Always look toward the screen
    state.camera.lookAt(0, 2.5, -14);
  });
  // Camera is seated in the audience, looking toward the screen
  return <PerspectiveCamera makeDefault position={[0, 1.8, 8]} fov={62} />;
}

// -- Floating Movie Posters ------------------------------------
function PosterPlane({ posterUrl, position, rotation }) {
  const meshRef = useRef();
  const [tex, setTex] = useState(null);
  useEffect(() => {
    if (!posterUrl) return;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(posterUrl, (t) => setTex(t), undefined, () => {});
  }, [posterUrl]);
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(t * 0.4 + position[0]) * 0.06;
    }
  });
  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
      <planeGeometry args={[1.1, 1.65]} />
      {tex ? (
        <meshStandardMaterial map={tex} roughness={0.1} metalness={0.05} />
      ) : (
        <meshStandardMaterial color="#151825" roughness={0.6} />
      )}
    </mesh>
  );
}

// -- Full Cinema Scene -----------------------------------------
function CinemaScene({ movies }) {
  const posterMovies = movies.slice(0, 3);
  const posterPositions = [
    { pos: [-11.5, 3.5, -6], rot: [0, Math.PI / 2, 0] },
    { pos: [-11.5, 3.5, -1], rot: [0, Math.PI / 2, 0] },
    { pos: [11.5, 3.5, -6], rot: [0, -Math.PI / 2, 0] },
  ];

  return (
    <>
      <CameraRig />

      {/* -- Lighting -- */}
      {/* Minimal ambient — keep theater dark */}
      <ambientLight intensity={0.12} color="#0e0d1e" />

      {/* Primary screen blue glow (already in CinemaScreen) */}

      {/* Warm projector from upper rear-left */}
      <spotLight
        position={[-4, 8, 6]}
        intensity={18}
        angle={0.24}
        penumbra={0.9}
        color="#c8b068"
        distance={36}
        decay={2}
        castShadow
      />

      {/* Ruby/crimson side fills for seat atmosphere */}
      <pointLight position={[-10, 0, 0]} intensity={1.8} color="#7a1020" distance={16} decay={2} />
      <pointLight position={[10, 0, 0]} intensity={1.8} color="#7a1020" distance={16} decay={2} />

      {/* Gold accent for curtain illumination */}
      <pointLight position={[-10, 3, -12]} intensity={2.2} color="#b8860b" distance={8} decay={2} />
      <pointLight position={[10, 3, -12]} intensity={2.2} color="#b8860b" distance={8} decay={2} />

      {/* Ceiling downlights */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <pointLight key={i} position={[x, 8.5, -4]} intensity={0.6} distance={12} color="#1a1030" decay={2} />
      ))}

      {/* -- Scene Elements -- */}
      <TheaterWalls />
      <TheaterFloor />
      <CinemaScreen movies={movies} />
      <ProjectorBeam />
      <Curtains />

      {/* -- TIERED SEATING — rows going from close (foreground) to far -- */}
      {/* Row 1 - very close, partially visible at bottom of screen */}
      <SeatRow count={13} z={6.5} y={-2.3} color="#5a1222" />
      {/* Row 2 */}
      <SeatRow count={13} z={5.2} y={-2.5} color="#541020" />
      {/* Row 3 */}
      <SeatRow count={13} z={3.9} y={-2.7} color="#4e0e1e" />
      {/* Row 4 */}
      <SeatRow count={13} z={2.6} y={-2.9} color="#480c1c" />
      {/* Row 5 — middle distance */}
      <SeatRow count={13} z={1.3} y={-3.05} color="#420a1a" />
      {/* Row 6 */}
      <SeatRow count={13} z={0.0} y={-3.2} color="#3e0818" />
      {/* Row 7 - getting smaller in distance */}
      <SeatRow count={13} z={-1.3} y={-3.35} color="#380616" />
      {/* Row 8 — far rows near screen */}
      <SeatRow count={13} z={-2.6} y={-3.45} color="#320514" />
      {/* Row 9 */}
      <SeatRow count={13} z={-3.8} y={-3.55} color="#2c0412" />

      {/* -- Movie Posters on side walls -- */}
      {posterMovies.map((movie, i) => (
        <PosterPlane
          key={movie._id || i}
          posterUrl={movie.poster}
          position={posterPositions[i].pos}
          rotation={posterPositions[i].rot}
        />
      ))}

      {/* -- Atmospheric Particles -- */}
      {/* Warm golden cinema dust */}
      <Sparkles count={80} scale={[20, 12, 18]} size={1.8} speed={0.2} opacity={0.3} color="#c09040" />
      {/* Blue projector light scatter */}
      <Sparkles count={35} scale={[12, 7, 6]} position={[0, 3.5, -8]} size={1.3} speed={0.15} opacity={0.2} color="#5090e0" />
      {/* Subtle red aisle glow particles near floor */}
      <Sparkles count={20} scale={[14, 0.5, 12]} position={[0, -2.4, -2]} size={1.0} speed={0.1} opacity={0.18} color="#e11d48" />
    </>
  );
}

// -- Exported Canvas (background layer) -----------------------
export default function CinemaCanvas({ movies = [] }) {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const h = (e) => setPrefersReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  if (prefersReduced) {
    return <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#030409] via-[#07091a] to-[#040408] pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        className="w-full h-full"
      >
        <CinemaScene movies={movies} />
      </Canvas>
    </div>
  );
}
