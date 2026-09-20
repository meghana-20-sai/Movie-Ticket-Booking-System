import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Ticket, Eye, RotateCw, Sparkles as SparklesIcon, Compass, Play } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

// -- 3D Popcorn Bucket ----------------------------------------
function PopcornBucket({ position }) {
  const groupRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.6 + 1.5) * 0.08;
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.12;
    }
  });
  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.32, 0.22, 0.65, 20]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.1} />
      </mesh>
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.cos(rad) * 0.28, 0, Math.sin(rad) * 0.28]} rotation={[0, -rad, 0]}>
            <boxGeometry args={[0.06, 0.65, 0.01]} />
            <meshBasicMaterial color="#fef2f2" />
          </mesh>
        );
      })}
      {[
        [0, 0.42, 0], [-0.14, 0.38, -0.09], [0.13, 0.4, 0.12],
        [-0.08, 0.5, 0.1], [0.09, 0.48, -0.12], [0, 0.55, 0.05],
        [0.16, 0.44, -0.05], [-0.15, 0.52, 0.08],
      ].map((pos, i) => (
        <mesh key={"pc" + i} position={pos} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#fef9c3" : "#fbbf24"} roughness={0.8} />
        </mesh>
      ))}
      <pointLight intensity={0.8} distance={2.5} color="#f59e0b" />
    </group>
  );
}

// -- 3D Cinema Drink Cup --------------------------------------
function DrinkCup({ position }) {
  const groupRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.7 + 2.5) * 0.07;
    }
  });
  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.22, 0.17, 0.72, 18]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.225, 0.225, 0.18, 18]} />
        <meshStandardMaterial color="#e11d48" roughness={0.2} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.24, 0.22, 0.08, 18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0.08, 0.72, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.018, 0.018, 0.55, 8]} />
        <meshStandardMaterial color="#f97316" roughness={0.5} />
      </mesh>
      <pointLight intensity={0.5} distance={2} color="#3b82f6" />
    </group>
  );
}

// -- 3D Cinema Curtains ---------------------------------------
function CinemaCurtains() {
  const leftRef = useRef();
  const rightRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (leftRef.current) {
      leftRef.current.rotation.z = Math.sin(t * 0.3) * 0.015;
    }
    if (rightRef.current) {
      rightRef.current.rotation.z = -Math.sin(t * 0.3 + 0.5) * 0.015;
    }
  });
  return (
    <>
      <group ref={leftRef} position={[-5.8, 0.5, -2.8]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 5.0, 0.08]} />
          <meshStandardMaterial color="#5c0a18" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.55, 0, 0.05]}>
          <boxGeometry args={[0.06, 5.0, 0.04]} />
          <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} emissive="#6b4c0a" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 2.55, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.5, 10]} />
          <meshStandardMaterial color="#c0972a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      <group ref={rightRef} position={[5.8, 0.5, -2.8]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 5.0, 0.08]} />
          <meshStandardMaterial color="#5c0a18" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.55, 0, 0.05]}>
          <boxGeometry args={[0.06, 5.0, 0.04]} />
          <meshStandardMaterial color="#b8860b" metalness={0.8} roughness={0.3} emissive="#6b4c0a" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 2.55, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.5, 10]} />
          <meshStandardMaterial color="#c0972a" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </>
  );
}

// -- 3D Clapperboard Prop -------------------------------------
function Clapperboard3D({ position, onSelect }) {
  const groupRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={groupRef} position={position} onClick={onSelect}>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[1.6, 1.1, 0.08]} />
          <meshStandardMaterial color="#12151e" roughness={0.4} metalness={0.7} />
        </mesh>
        {[-0.2, 0, 0.2].map((y, i) => (
          <mesh key={i} position={[0, -0.4 + y, 0.045]}>
            <boxGeometry args={[1.4, 0.04, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        <group position={[0, 0.2, 0]} rotation={[0, 0, -0.2]}>
          <mesh castShadow>
            <boxGeometry args={[1.7, 0.22, 0.09]} />
            <meshStandardMaterial color="#1e2230" roughness={0.3} metalness={0.8} />
          </mesh>
          {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
            <mesh key={i} position={[x, 0, 0.05]} rotation={[0, 0, 0.6]}>
              <boxGeometry args={[0.08, 0.2, 0.01]} />
              <meshBasicMaterial color="#f5c518" />
            </mesh>
          ))}
        </group>
        <pointLight position={[0, 0.5, 1]} intensity={1.5} distance={3} color="#f5c518" />
      </group>
    </Float>
  );
}

// -- 3D Golden VIP Ticket --------------------------------------
function GoldTicket3D({ position, onSelect }) {
  const meshRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.6;
      meshRef.current.rotation.x = Math.sin(t * 0.8) * 0.15;
    }
  });
  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1}>
      <group position={position} onClick={onSelect}>
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[1.8, 0.9, 0.05]} />
          <meshStandardMaterial color="#f5c518" metalness={0.95} roughness={0.2} emissive="#d4af37" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.9, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
          <meshBasicMaterial color="#070913" />
        </mesh>
        <mesh position={[0.9, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
          <meshBasicMaterial color="#070913" />
        </mesh>
        <pointLight intensity={2.5} distance={4} color="#ffd700" />
      </group>
    </Float>
  );
}

// -- 3D Film Reel -----------------------------------------------
function FilmReel3D({ position, onSelect }) {
  const reelRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (reelRef.current) {
      reelRef.current.rotation.z = t * 0.5;
      reelRef.current.rotation.y = Math.sin(t * 0.4) * 0.25;
    }
  });
  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.7}>
      <group position={position} onClick={onSelect}>
        <group ref={reelRef}>
          <mesh castShadow>
            <torusGeometry args={[0.9, 0.12, 16, 40]} />
            <meshStandardMaterial color="#8a99ad" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 24]} />
            <meshStandardMaterial color="#e11d48" metalness={0.7} roughness={0.3} />
          </mesh>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.cos(rad) * 0.5, Math.sin(rad) * 0.5, 0]} rotation={[0, 0, rad]}>
                <boxGeometry args={[0.6, 0.08, 0.06]} />
                <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
              </mesh>
            );
          })}
        </group>
        <pointLight intensity={2} distance={3.5} color="#e11d48" />
      </group>
    </Float>
  );
}

// -- Dynamic Cinema Screen -------------------------------------
function CinemaScreen3D({ movies }) {
  const screenRef = useRef();
  const [displayIdx, setDisplayIdx] = useState(0);
  useEffect(() => {
    if (!movies || movies.length < 2) return;
    const iv = setInterval(() => setDisplayIdx((p) => (p + 1) % Math.min(movies.length, 8)), 4000);
    return () => clearInterval(iv);
  }, [movies]);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (screenRef.current) screenRef.current.material.emissiveIntensity = 0.18 + Math.sin(t * 1.2) * 0.05;
  });
  return (
    <group position={[0, 1.5, -4.5]}>
      <mesh>
        <boxGeometry args={[9.2, 5.0, 0.18]} />
        <meshStandardMaterial color="#04060d" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[9.0, 4.8, 0.02]} />
        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.2} emissive="#5a3a00" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0, 0.11]}>
        <planeGeometry args={[8.6, 4.5]} />
        <meshStandardMaterial color="#d6e8f8" emissive="#4090c0" emissiveIntensity={0.18} roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.5, 0.15]}>
        <planeGeometry args={[7, 0.6]} />
        <meshStandardMaterial color="#000820" emissive="#000820" emissiveIntensity={0.8} roughness={1} transparent opacity={0.75} />
      </mesh>
      <pointLight position={[0, 0, 1.5]} intensity={5} distance={12} color="#60a5fa" decay={2} />
      <spotLight position={[0, 0, 2]} intensity={6} angle={0.25} penumbra={0.9} color="#c8d8f0" distance={20} decay={2} />
    </group>
  );
}

// -- Reflective Premium Floor ----------------------------------
function PremiumFloor() {
  return (
    <group position={[0, -2.0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#060a12" roughness={0.12} metalness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.02, 1]}>
        <planeGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#e11d48" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.02, 1]}>
        <planeGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#e11d48" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.02, 3]}>
        <planeGeometry args={[0.06, 6]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.02, 3]}>
        <planeGeometry args={[0.06, 6]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
      </mesh>
      <pointLight position={[0, 0.2, 1]} intensity={2} distance={8} color="#cc2233" />
    </group>
  );
}

// -- Theater Seats (two rows) ----------------------------------
function TheaterSeating() {
  const seatColor = "#5c1625";
  const armColor = "#0d0d18";
  const Seat = ({ x, y, z, k }) => (
    <group key={k} position={[x, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.72, 0.13, 0.65]} />
        <meshStandardMaterial color={seatColor} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.4, -0.24]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.72, 0.68, 0.13]} />
        <meshStandardMaterial color={seatColor} roughness={0.55} />
      </mesh>
      <mesh position={[-0.39, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.36, 0.58]} />
        <meshStandardMaterial color={armColor} roughness={0.8} metalness={0.7} />
      </mesh>
      <mesh position={[0.39, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.36, 0.58]} />
        <meshStandardMaterial color={armColor} roughness={0.8} metalness={0.7} />
      </mesh>
    </group>
  );
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => <Seat key={"f" + i} x={(i - 4) * 0.95} y={-1.9} z={3.8} k={"f" + i} />)}
      {Array.from({ length: 9 }, (_, i) => <Seat key={"b" + i} x={(i - 4) * 0.95} y={-1.55} z={5.0} k={"b" + i} />)}
    </>
  );
}

// -- Mouse-Tracking Parallax Camera ---------------------------
function ParallaxCamera({ mousePos, cameraView }) {
  const { camera } = useThree();
  useFrame(() => {
    let tx = mousePos.current.x * 0.6;
    let ty = mousePos.current.y * 0.3 + 1.2;
    let tz = 6.0;
    let ly = 0.5;
    if (cameraView === "screen") { tx *= 0.2; ty = 1.8 + mousePos.current.y * 0.1; tz = 2.2; ly = 1.5; }
    else if (cameraView === "directors") { tx = mousePos.current.x * 0.4; ty = 0.3 + mousePos.current.y * 0.15; tz = 5.2; }
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, 0.04);
    camera.lookAt(0, ly, -1);
  });
  return null;
}

// -- Main Export -----------------------------------------------
export default function Interactive3DTheater({ movies = [], onWatchTrailer }) {
  const [activeProp, setActiveProp] = useState("ticket");
  const [cameraView, setCameraView] = useState("orbit");
  const [orbitMode, setOrbitMode] = useState(true);
  const mousePos = useRef({ x: 0, y: 0 });

  const selectedMovie = movies[0] || { title: "Pushpa 2: The Rule", imdbRating: 8.5 };

  useEffect(() => {
    const onMove = (e) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const switchView = (v) => { setCameraView(v); setOrbitMode(v === "orbit"); };

  const btnCls = (v) =>
    `px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
      cameraView === v ? "bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md" : "text-slate-400 hover:text-white"
    }`;

  return (
    <section className="relative rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#0b0f22]/90 to-[#070913]/95 p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(225,29,72,0.25)] backdrop-blur-xl overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600/20 to-amber-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-widest mb-2">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>SmartCine 3D Experience Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Interactive 3D Virtual Cinema</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {orbitMode ? "Drag to rotate 360°, scroll to zoom." : "Move cursor to shift camera parallax."}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#080b16] border border-slate-800 rounded-2xl p-1.5 self-start sm:self-auto shadow-inner">
          <button onClick={() => switchView("orbit")} className={btnCls("orbit")}><Compass className="w-3.5 h-3.5" /><span>360° Orbit</span></button>
          <button onClick={() => switchView("screen")} className={btnCls("screen")}><Play className="w-3.5 h-3.5" /><span>Screen View</span></button>
          <button onClick={() => switchView("directors")} className={btnCls("directors")}><Eye className="w-3.5 h-3.5" /><span>Director's Cut</span></button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-[480px] sm:h-[560px] rounded-2xl overflow-hidden bg-[#030508] border border-slate-800/80 shadow-2xl mt-6">
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-slate-300">
          <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{orbitMode ? "Click & Drag to Orbit • Scroll to Zoom" : "Move Mouse to Shift Camera Parallax"}</span>
        </div>
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600/90 border border-rose-400/40 shadow-lg backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Now Playing</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 shadow-xl">
            <span className="text-[10px] font-black text-slate-400 px-2 uppercase">3D Props:</span>
            {[["clapper","?? Clapper","rose"],["ticket","??? VIP Ticket","amber"],["reel","??? Film Reel","rose"]].map(([id,label,color]) => (
              <button key={id} onClick={() => setActiveProp(id)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${activeProp===id ? (color==="amber" ? "bg-amber-500 text-black shadow" : "bg-rose-600 text-white shadow") : "text-slate-400 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
          {selectedMovie && (
            <div className="hidden sm:flex items-center gap-3 bg-black/80 backdrop-blur-md border border-rose-500/40 rounded-2xl px-4 py-2 shadow-2xl">
              <div>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Spotlight</p>
                <p className="text-xs font-bold text-white line-clamp-1">{selectedMovie.title}</p>
              </div>
              <Link to={`/movies/${selectedMovie._id || ""}`}>
                <Button size="sm" className="h-8 text-xs font-black bg-gradient-to-r from-rose-600 to-amber-500 text-white border-0 shadow-md">
                  <Ticket className="w-3.5 h-3.5 mr-1" /> Book In 3D
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
          <PerspectiveCamera makeDefault position={[0, 1.2, 6]} fov={52} />
          {orbitMode ? (
            <OrbitControls enableDamping dampingFactor={0.05} minDistance={2.5} maxDistance={10} maxPolarAngle={Math.PI / 2 + 0.1} target={[0, 0.5, -1]} />
          ) : (
            <ParallaxCamera mousePos={mousePos} cameraView={cameraView} />
          )}

          <ambientLight intensity={0.2} color="#12101e" />
          <pointLight position={[0, 3, -3]} intensity={4} color="#b8c8e0" distance={18} decay={2} />
          <spotLight position={[0, 5.5, 7]} intensity={14} angle={0.2} penumbra={0.85} color="#d0c888" distance={28} decay={2} castShadow />
          <pointLight position={[-6.5, 0, 1]} intensity={2.2} color="#8b1a2c" distance={12} decay={2} />
          <pointLight position={[6.5, 0, 1]} intensity={2.2} color="#8b1a2c" distance={12} decay={2} />
          <pointLight position={[-5.5, 2, -2.5]} intensity={1.5} color="#b8860b" distance={6} decay={2} />
          <pointLight position={[5.5, 2, -2.5]} intensity={1.5} color="#b8860b" distance={6} decay={2} />
          <pointLight position={[0, 5, 0]} intensity={0.6} color="#1e3060" distance={15} decay={2} />

          <CinemaScreen3D movies={movies} />
          <CinemaCurtains />
          <TheaterSeating />
          <PremiumFloor />

          <Clapperboard3D position={[-2.6, 0.3, 1.0]} onSelect={() => setActiveProp("clapper")} />
          <GoldTicket3D position={[0, 0.6, 1.5]} onSelect={() => setActiveProp("ticket")} />
          <FilmReel3D position={[2.6, 0.3, 1.0]} onSelect={() => setActiveProp("reel")} />

          <PopcornBucket position={[-4.2, -1.5, 3.5]} />
          <DrinkCup position={[4.2, -1.5, 3.5]} />

          <Sparkles count={65} scale={[14, 9, 10]} size={2.2} speed={0.3} opacity={0.38} color="#f5c518" />
          <Sparkles count={25} scale={[8, 5, 4]} position={[0, 1.5, -3]} size={1.5} speed={0.2} opacity={0.2} color="#60a5fa" />
        </Canvas>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center gap-2 mt-4 relative z-10">
        {[["??","3D Clapperboard"],["???","VIP Gold Ticket"],["???","Film Reel"],["??","Popcorn Station"],["??","Drink Bar"],["??","Red Velvet Curtains"],["??","Premium Seating"],["???","IMAX Screen"]].map(([icon, label]) => (
          <span key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0e1424] border border-slate-800 text-[11px] font-bold text-slate-400">
            <span>{icon}</span><span>{label}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
