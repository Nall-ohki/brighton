import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

const DURATION_DAYS = 30;
const SECONDS_PER_DAY = 1.5;
const PARTICLE_COUNT = 20000;

const PREDEF_EVENTS = [
  { id: 'e1', day: 4, type: 'Publisher Sale', duration: 4, name: 'Autumn Sale', pos: new THREE.Vector3(-25, 10, -15), strength: 1.8, radius: 25 },
  { id: 'e2', day: 12, type: 'Next Fest', duration: 7, name: 'Steam Next Fest', pos: new THREE.Vector3(25, -10, 15), strength: 3.5, radius: 35 },
  { id: 'e3', day: 22, type: 'Themed Weekend', duration: 4, name: 'Co-op Weekend', pos: new THREE.Vector3(5, 25, 20), strength: 2.2, radius: 28 }
];

function ScoreDisplay({ scoreRef }) {
  const [score, setScore] = useState(0);
  useEffect(() => {
    let handle;
    const loop = () => {
      setScore(scoreRef.current);
      handle = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(handle);
  }, [scoreRef]);

  return (
    <div className="text-4xl font-bold text-white tracking-wider font-mono drop-shadow-md">
      {score.toLocaleString()} <span className="text-xl text-[#66c0f4] ml-1">PLAYERS</span>
    </div>
  );
}

function Particles({ playerPos, activeEvents, customEvent, day, onScore, isPlaying }) {
  const meshRef = useRef();
  
  const { positions, velocities, colors, states } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const st = new Uint8Array(PARTICLE_COUNT);
    
    const colorUntouched = new THREE.Color('#2a3746');
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 20 + Math.random() * 40;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      
      vel[i*3] = (Math.random() - 0.5) * 0.1;
      vel[i*3+1] = (Math.random() - 0.5) * 0.1;
      vel[i*3+2] = (Math.random() - 0.5) * 0.1;
      
      col[i*3] = colorUntouched.r;
      col[i*3+1] = colorUntouched.g;
      col[i*3+2] = colorUntouched.b;
      
      st[i] = 0;
    }
    return { positions: pos, velocities: vel, colors: col, states: st };
  }, []);

  const colorTouched = useMemo(() => new THREE.Color('#66c0f4'), []);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      tempObject.position.set(positions[i*3], positions[i*3+1], positions[i*3+2]);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      tempColor.fromArray(colors, i * 3);
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [colors, positions, tempColor, tempObject]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    let scoreDelta = 0;
    let colorChanged = false;
    
    const isCustomActive = customEvent && day >= customEvent.day && day <= customEvent.day + customEvent.duration;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let px = positions[i*3];
      let py = positions[i*3+1];
      let pz = positions[i*3+2];
      
      let vx = velocities[i*3];
      let vy = velocities[i*3+1];
      let vz = velocities[i*3+2];
      
      let ax = 0, ay = 0, az = 0;
      
      const distFromCenter = Math.sqrt(px*px + py*py + pz*pz);
      if (distFromCenter > 60) {
         ax -= px * 0.0005;
         ay -= py * 0.0005;
         az -= pz * 0.0005;
      } else {
         ax -= px * 0.0001;
         ay -= py * 0.0001;
         az -= pz * 0.0001;
      }
      
      for (let j=0; j<activeEvents.length; j++) {
        const ev = activeEvents[j];
        const dx = ev.pos.x - px;
        const dy = ev.pos.y - py;
        const dz = ev.pos.z - pz;
        const distSq = dx*dx + dy*dy + dz*dz;
        if (distSq < ev.radius * ev.radius) {
          const dist = Math.sqrt(distSq);
          const force = ev.strength / (dist + 1);
          ax += (dx / dist) * force;
          ay += (dy / dist) * force;
          az += (dz / dist) * force;
        }
      }
      
      if (isCustomActive) {
        const dx = playerPos.current.x - px;
        const dy = playerPos.current.y - py;
        const dz = playerPos.current.z - pz;
        const distSq = dx*dx + dy*dy + dz*dz;
        const customRadius = customEvent.radius;
        if (distSq < customRadius * customRadius) {
          const dist = Math.sqrt(distSq);
          const force = customEvent.strength / (dist + 1);
          ax += (dx / dist) * force;
          ay += (dy / dist) * force;
          az += (dz / dist) * force;
        }
      }
      
      ax += (Math.random() - 0.5) * 0.2;
      ay += (Math.random() - 0.5) * 0.2;
      az += (Math.random() - 0.5) * 0.2;
      
      vx += ax * dt * 15;
      vy += ay * dt * 15;
      vz += az * dt * 15;
      
      vx *= 0.95;
      vy *= 0.95;
      vz *= 0.95;
      
      px += vx * dt * 10;
      py += vy * dt * 10;
      pz += vz * dt * 10;
      
      positions[i*3] = px;
      positions[i*3+1] = py;
      positions[i*3+2] = pz;
      velocities[i*3] = vx;
      velocities[i*3+1] = vy;
      velocities[i*3+2] = vz;
      
      if (isPlaying) {
        const dxP = px - playerPos.current.x;
        const dyP = py - playerPos.current.y;
        const dzP = pz - playerPos.current.z;
        const distToPlayerSq = dxP*dxP + dyP*dyP + dzP*dzP;
        if (distToPlayerSq < 16) { 
          if (states[i] === 0) {
            states[i] = 1;
            scoreDelta++;
            tempColor.set(colorTouched);
            meshRef.current.setColorAt(i, tempColor);
            colorChanged = true;
          }
        }
      }
      
      tempObject.position.set(px, py, pz);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (colorChanged) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
    
    if (scoreDelta > 0) {
      onScore(scoreDelta);
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.15, 4, 4]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

function PlayerBubble({ playerPos, isCustomActive, customRadius }) {
  const ref = useRef();
  useFrame(() => {
    ref.current.position.copy(playerPos.current);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#66c0f4" transparent opacity={0.8} />
      </mesh>
      
      {isCustomActive && (
        <group>
          <mesh>
             <sphereGeometry args={[customRadius, 32, 32]} />
             <meshBasicMaterial color="#66c0f4" transparent opacity={0.1} />
          </mesh>
          <mesh>
             <sphereGeometry args={[customRadius, 16, 16]} />
             <meshBasicMaterial color="#66c0f4" wireframe transparent opacity={0.2} />
          </mesh>
        </group>
      )}

      <Html center position={[0, -3.5, 0]}>
        <div className="bg-[#171a21] text-white px-4 py-1.5 rounded-full text-sm font-bold border border-[#66c0f4] whitespace-nowrap shadow-[0_0_15px_rgba(102,192,244,0.6)] tracking-wide">
          YOUR GAME
        </div>
      </Html>
    </group>
  );
}

function EventBubble({ event, isJoined }) {
  return (
    <group position={event.pos}>
      <mesh>
        <sphereGeometry args={[event.radius, 32, 32]} />
        <meshBasicMaterial color={isJoined ? "#66c0f4" : "#ff9900"} transparent opacity={0.05} />
      </mesh>
      <mesh>
        <sphereGeometry args={[event.radius, 16, 16]} />
        <meshBasicMaterial color={isJoined ? "#66c0f4" : "#ff9900"} wireframe transparent opacity={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color={isJoined ? "#66c0f4" : "#ff9900"} />
      </mesh>
      <Html center position={[0, -2.5, 0]}>
        <div className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg tracking-wider ${isJoined ? 'bg-[#66c0f4] text-[#171a21]' : 'bg-[#ff9900] text-[#171a21]'}`}>
          {event.name}
        </div>
      </Html>
    </group>
  );
}

function Scene({ isPlaying, day, joinedEvents, customEvent, onScore }) {
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const playerTargetPos = useRef(new THREE.Vector3(0, 0, 0));

  const activeEvents = useMemo(() => {
    let evs = [];
    PREDEF_EVENTS.forEach(ev => {
      if (day >= ev.day && day <= ev.day + ev.duration) {
        evs.push(ev);
      }
    });
    return evs;
  }, [day]);

  useEffect(() => {
    let joinedActive = activeEvents.find(e => joinedEvents.includes(e.id));
    if (joinedActive) {
      playerTargetPos.current.copy(joinedActive.pos);
    } else {
      playerTargetPos.current.set(0, 0, 0);
    }
  }, [activeEvents, joinedEvents]);

  useFrame((state, delta) => {
    playerPos.current.lerp(playerTargetPos.current, delta * 3);
  });

  const isCustomActive = customEvent && day >= customEvent.day && day <= customEvent.day + customEvent.duration;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      <Particles playerPos={playerPos} activeEvents={activeEvents} customEvent={customEvent} day={day} onScore={onScore} isPlaying={isPlaying} />
      
      <PlayerBubble playerPos={playerPos} isCustomActive={isCustomActive} customRadius={customEvent?.radius || 20} />
      
      {activeEvents.map(ev => (
        <EventBubble key={ev.id} event={ev} isJoined={joinedEvents.includes(ev.id)} />
      ))}
      
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxDistance={80} minDistance={10} autoRotate={!isPlaying} autoRotateSpeed={0.5} />
    </>
  );
}

export default function App() {
  const [gameState, setGameState] = useState(0); 
  const [day, setDay] = useState(1);
  const scoreRef = useRef(0);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [customEvent, setCustomEvent] = useState(null);
  const customCooldown = useRef(0);

  useEffect(() => {
    if (gameState !== 1) return;
    
    const interval = setInterval(() => {
      setDay(d => {
        if (d >= DURATION_DAYS) {
          setGameState(2); 
          return DURATION_DAYS;
        }
        return d + 1;
      });
      if (customCooldown.current > 0) customCooldown.current--;
    }, SECONDS_PER_DAY * 1000);
    
    return () => clearInterval(interval);
  }, [gameState]);

  const handleCustomEvent = () => {
    if (customCooldown.current > 0) return;
    setCustomEvent({
      day: day,
      duration: 3,
      strength: 2.8,
      radius: 20
    });
    customCooldown.current = 10;
  };

  const handleScore = (pts) => {
    scoreRef.current += pts;
  };

  return (
    <div className="w-full h-full relative bg-[#171a21] select-none">
      <Canvas camera={{ position: [0, 20, 60], fov: 45 }}>
        <Scene 
          isPlaying={gameState === 1} 
          day={day} 
          joinedEvents={joinedEvents} 
          customEvent={customEvent} 
          onScore={handleScore} 
        />
      </Canvas>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-10">
        <div className="flex justify-between items-start w-full">
          <div className="valve-card p-5 rounded-lg pointer-events-auto min-w-[220px]">
            <div className="text-[#8f98a0] text-sm font-bold uppercase mb-1 tracking-widest">Total Unique Players</div>
            <ScoreDisplay scoreRef={scoreRef} />
          </div>
          
          <div className="valve-card p-5 rounded-lg pointer-events-auto w-1/3 min-w-[320px]">
            <div className="flex justify-between text-sm font-bold text-[#8f98a0] mb-3 uppercase tracking-wider">
              <span className={gameState === 1 ? 'text-[#66c0f4]' : ''}>Day {day}</span>
              <span>Day {DURATION_DAYS}</span>
            </div>
            <div className="w-full bg-[#101215] h-4 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-[#66c0f4] h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(102,192,244,0.8)]"
                style={{ width: `${(day / DURATION_DAYS) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-end w-full">
          <div className="flex gap-6 pointer-events-auto">
            {PREDEF_EVENTS.map(ev => {
              const isUpcoming = day >= ev.day - 3 && day < ev.day;
              const isActive = day >= ev.day && day <= ev.day + ev.duration;
              const isJoined = joinedEvents.includes(ev.id);
              const isPast = day > ev.day + ev.duration;
              
              if (!isUpcoming && !isActive && !isPast) return null;
              if (isPast) return null; 
              
              return (
                <div key={ev.id} className={`valve-card p-5 rounded-xl w-72 border-t-4 ${isJoined ? 'border-[#66c0f4]' : 'border-[#ff9900]'} flex flex-col gap-3 transition-transform hover:-translate-y-2 duration-300`}>
                  <div className="text-sm font-bold uppercase tracking-wider" style={{ color: isJoined ? '#66c0f4' : '#ff9900' }}>
                    {ev.type}
                  </div>
                  <div className="text-2xl font-bold text-white">{ev.name}</div>
                  <div className="text-sm text-[#8f98a0] font-medium">
                    {isActive ? `Ends in ${ev.day + ev.duration - day} days` : `Starts in ${ev.day - day} days`}
                  </div>
                  {!isJoined && (
                    <button 
                      className="valve-btn w-full py-3 mt-3 font-bold text-sm uppercase tracking-widest"
                      onClick={() => setJoinedEvents([...joinedEvents, ev.id])}
                    >
                      Register
                    </button>
                  )}
                  {isJoined && (
                    <div className="text-center py-3 mt-3 font-bold text-sm text-[#66c0f4] bg-[#171a21]/80 rounded border border-[#66c0f4]/30 tracking-widest">
                      REGISTERED
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="pointer-events-auto">
            <button 
              className={`valve-card p-5 rounded-xl border-2 ${customCooldown.current === 0 ? 'border-[#66c0f4] hover:bg-[#2a475e] hover:shadow-[0_0_20px_rgba(102,192,244,0.4)] cursor-pointer' : 'border-[#3b4a5a] opacity-60 cursor-not-allowed'} transition-all duration-300 text-left`}
              onClick={handleCustomEvent}
              disabled={customCooldown.current > 0}
            >
              <div className="text-xs font-bold text-[#66c0f4] uppercase mb-1 tracking-widest">Marketing Push</div>
              <div className="text-white font-bold text-xl mb-2">Run Custom Event</div>
              <div className="text-sm text-[#8f98a0] font-medium">
                {customCooldown.current === 0 ? 'Ready to launch!' : `Cooldown: ${customCooldown.current} days`}
              </div>
            </button>
          </div>
        </div>
      </div>

      {gameState === 0 && (
        <div className="absolute inset-0 bg-[#171a21]/80 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="valve-card p-12 rounded-2xl max-w-2xl text-center border-t-4 border-[#66c0f4] shadow-[0_20px_50px_rgba(0,0,0,0.8)] transform transition-all">
            <h1 className="text-5xl font-black text-white mb-6 tracking-widest drop-shadow-lg">STEAM EVENTS 2026</h1>
            <p className="text-[#8f98a0] mb-10 text-xl leading-relaxed">
              Manage your game's visibility across 30 days. Register for Steam events to capture massive traffic flows. Run your own marketing pushes. Maximize your unique player touches!
            </p>
            <button 
              className="valve-btn px-16 py-5 text-2xl font-bold uppercase tracking-widest rounded-lg shadow-xl"
              onClick={() => {
                setGameState(1);
                setDay(1);
                scoreRef.current = 0;
                setJoinedEvents([]);
                setCustomEvent(null);
                customCooldown.current = 0;
              }}
            >
              Start Simulation
            </button>
          </div>
        </div>
      )}

      {gameState === 2 && (
        <div className="absolute inset-0 bg-[#171a21]/90 backdrop-blur-md flex items-center justify-center z-50 pointer-events-auto">
          <div className="valve-card p-12 rounded-2xl max-w-xl text-center border-t-4 border-[#66c0f4] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">Month Complete</h2>
            <div className="text-[#8f98a0] mb-6 text-xl">Your game reached</div>
            <div className="text-7xl font-black text-[#66c0f4] mb-10 drop-shadow-[0_0_20px_rgba(102,192,244,0.5)]">
              <ScoreDisplay scoreRef={scoreRef} />
            </div>
            <button 
              className="valve-btn px-12 py-4 text-xl font-bold uppercase tracking-widest rounded-lg"
              onClick={() => {
                setGameState(1);
                setDay(1);
                scoreRef.current = 0;
                setJoinedEvents([]);
                setCustomEvent(null);
                customCooldown.current = 0;
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
