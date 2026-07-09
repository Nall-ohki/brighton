import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Users, BatteryCharging } from 'lucide-react';
import './App.css';

const MOVEMENT_SPEED = 7;
const SLOW_SPEED = 2;
const BATTERY_DRAIN = 2.5;
const BATTERY_RECHARGE = 20;
const SCARE_RADIUS = 2.5;
const SWEET_SPOT_RADIUS = 4.5;
const KEYS = ['Q', 'E', 'R', 'F', 'C', 'V'];

class GameState {
  battery = 100;
  connections = 0;
  totalNpcs = 0;
  playerPos = new THREE.Vector3(0, 0, 0);
  isMoving = false;
  
  addConnection() {
    this.connections++;
  }
}
const stateStore = new GameState();

const npcsData = [
  { id: 1, pos: [4, -5] as [number, number] },
  { id: 2, pos: [-6, 3] as [number, number] },
  { id: 3, pos: [14, -12] as [number, number] },
  { id: 4, pos: [-15, -10] as [number, number] },
  { id: 5, pos: [8, 14] as [number, number] },
  { id: 6, pos: [-8, -15] as [number, number] },
  { id: 7, pos: [16, 5] as [number, number] },
  { id: 8, pos: [-2, 12] as [number, number] },
];
stateStore.totalNpcs = npcsData.length;

const quietZones = [
  { pos: [-10, -10] as [number, number], size: [8, 8] as [number, number] },
  { pos: [12, 8] as [number, number], size: [10, 6] as [number, number] }
];

function CameraController() {
  const { camera } = useThree();
  useFrame(() => {
    const targetX = stateStore.playerPos.x + 15;
    const targetZ = stateStore.playerPos.z + 15;
    camera.position.lerp(new THREE.Vector3(targetX, 20, targetZ), 0.05);
    camera.lookAt(camera.position.x - 15, 0, camera.position.z - 15);
  });
  return null;
}

function Player() {
  const playerRef = useRef<THREE.Group>(null);
  const lowBatteryRef = useRef<THREE.Group>(null);
  const keys = useRef<{ [k: string]: boolean }>({});
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = true;
    const up = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { 
      window.removeEventListener('keydown', down); 
      window.removeEventListener('keyup', up); 
    }
  }, []);

  useFrame((_, delta) => {
    if (!playerRef.current) return;
    
    let inputX = 0;
    let inputY = 0;
    if (keys.current['w'] || keys.current['arrowup']) inputY += 1;
    if (keys.current['s'] || keys.current['arrowdown']) inputY -= 1;
    if (keys.current['a'] || keys.current['arrowleft']) inputX -= 1;
    if (keys.current['d'] || keys.current['arrowright']) inputX += 1;
    
    if (inputX !== 0 || inputY !== 0) {
      const len = Math.sqrt(inputX*inputX + inputY*inputY);
      inputX /= len;
      inputY /= len;
    }

    const dx = inputX - inputY;
    const dz = -inputX - inputY;
    
    let worldDx = 0, worldDz = 0;
    if (dx !== 0 || dz !== 0) {
       const len = Math.sqrt(dx*dx + dz*dz);
       worldDx = dx / len;
       worldDz = dz / len;
    }

    const isMoving = worldDx !== 0 || worldDz !== 0;
    stateStore.isMoving = isMoving;

    const speed = stateStore.battery > 0 ? MOVEMENT_SPEED : SLOW_SPEED;
    
    playerRef.current.position.x += worldDx * speed * delta;
    playerRef.current.position.z += worldDz * speed * delta;
    
    playerRef.current.position.x = THREE.MathUtils.clamp(playerRef.current.position.x, -22, 22);
    playerRef.current.position.z = THREE.MathUtils.clamp(playerRef.current.position.z, -22, 22);

    stateStore.playerPos.copy(playerRef.current.position);

    let inQuietZone = false;
    for (let qz of quietZones) {
       if (Math.abs(stateStore.playerPos.x - qz.pos[0]) < qz.size[0]/2 && 
           Math.abs(stateStore.playerPos.z - qz.pos[1]) < qz.size[1]/2) {
           inQuietZone = true;
           break;
       }
    }
    
    if (inQuietZone) {
       stateStore.battery = THREE.MathUtils.clamp(stateStore.battery + BATTERY_RECHARGE * delta, 0, 100);
    } else {
       stateStore.battery = THREE.MathUtils.clamp(stateStore.battery - BATTERY_DRAIN * delta, 0, 100);
    }

    if (lowBatteryRef.current) {
      lowBatteryRef.current.visible = stateStore.battery <= 15;
      lowBatteryRef.current.position.y = 2.5 + Math.sin(Date.now() * 0.005) * 0.2;
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1, 4, 16]} />
        <meshStandardMaterial color="#83c5be" />
      </mesh>
      <group ref={lowBatteryRef} position={[0, 2.5, 0]} visible={false}>
         <Billboard>
            <Text fontSize={0.6} color="#0077b6">💧</Text>
         </Billboard>
      </group>
    </group>
  );
}

function NPC({ initialPos }: { initialPos: [number, number] }) {
  const [state, setState] = useState<'IDLE' | 'HOVERING' | 'CONNECTED' | 'SCARED'>('IDLE');
  const [reqKey, setReqKey] = useState('E');
  const [scaredTime, setScaredTime] = useState(0);
  const npcRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (state === 'HOVERING') {
      setReqKey(KEYS[Math.floor(Math.random() * KEYS.length)]);
    }
  }, [state]);

  useFrame((_, delta) => {
    if (!npcRef.current) return;
    const pos = new THREE.Vector3(initialPos[0], 0, initialPos[1]);
    const dist = stateStore.playerPos.distanceTo(pos);
    
    if (state === 'SCARED') {
      if (scaredTime > 0) {
        setScaredTime(t => t - delta);
        npcRef.current.position.x = initialPos[0] + Math.sin(Date.now() * 0.03) * 0.1;
      } else {
        setState('IDLE');
        npcRef.current.position.x = initialPos[0];
      }
      return;
    }
    
    if (state === 'CONNECTED') {
       npcRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.2;
       return;
    }

    if (dist < SCARE_RADIUS) {
       setState('SCARED');
       setScaredTime(3);
    } else if (dist < SWEET_SPOT_RADIUS) {
       if (state !== 'HOVERING') setState('HOVERING');
    } else {
       if (state !== 'IDLE') setState('IDLE');
    }
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (state !== 'HOVERING') return;
      const k = e.key.toUpperCase();
      if (k === reqKey) {
        setState('CONNECTED');
        stateStore.addConnection();
      } else if (KEYS.includes(k)) {
        setState('SCARED');
        setScaredTime(3);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state, reqKey]);

  let color = "#f4a261";
  if (state === 'HOVERING') color = "#e9c46a";
  if (state === 'CONNECTED') color = "#2a9d8f";
  if (state === 'SCARED') color = "#e76f51";

  return (
    <group ref={npcRef} position={[initialPos[0], 0, initialPos[1]]}>
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1, 4, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {state !== 'CONNECTED' && (
        <group rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
          <mesh>
            <ringGeometry args={[SCARE_RADIUS - 0.1, SCARE_RADIUS, 32]} />
            <meshBasicMaterial color="#e76f51" transparent opacity={0.3} />
          </mesh>
          <mesh>
            <ringGeometry args={[SWEET_SPOT_RADIUS - 0.1, SWEET_SPOT_RADIUS, 32]} />
            <meshBasicMaterial color="#e9c46a" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {state === 'HOVERING' && (
        <Billboard position={[0, 2.6, 0]}>
          <mesh position={[0, 0, -0.01]}>
             <planeGeometry args={[1.0, 0.8]} />
             <meshBasicMaterial color="white" transparent opacity={0.9} />
          </mesh>
          <Text fontSize={0.4} color="#333" fontWeight="bold">
            [{reqKey}]
          </Text>
        </Billboard>
      )}
      
      {state === 'SCARED' && (
        <Billboard position={[0, 2.6, 0]}>
           <Text fontSize={0.6} color="#e76f51" fontWeight="bold">!</Text>
        </Billboard>
      )}
      
      {state === 'CONNECTED' && (
        <Billboard position={[0, 2.6, 0]}>
           <Text fontSize={0.6} color="#2a9d8f">♥</Text>
        </Billboard>
      )}
    </group>
  );
}

function QuietZone({ pos, size }: { pos: [number, number], size: [number, number] }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial color="#cde8e6" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0]*0.6, 0.8, size[1]*0.6]} />
        <meshStandardMaterial color="#b2d8d8" />
      </mesh>
      <mesh position={[size[0]*0.3, 1, size[1]*0.3]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.8]} />
        <meshStandardMaterial color="#8fb3a3" />
      </mesh>
    </group>
  );
}

function EnvironmentProps() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#f0f4f8" />
      </mesh>
      <gridHelper args={[50, 50, "#d9e2ec", "#e2e8f0"]} position={[0, 0.001, 0]} />
      
      <mesh position={[0, 1, -25]} receiveShadow castShadow>
        <boxGeometry args={[50, 2, 1]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 1, 25]} receiveShadow castShadow>
        <boxGeometry args={[50, 2, 1]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[-25, 1, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 2, 50]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[25, 1, 0]} receiveShadow castShadow>
        <boxGeometry args={[1, 2, 50]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}

function UIOverlay() {
  const [battery, setBattery] = useState(100);
  const [connections, setConnections] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBattery(stateStore.battery);
      setConnections(stateStore.connections);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const batColor = battery > 50 ? '#a4e5d9' : (battery > 20 ? '#f4a261' : '#e76f51');

  return (
    <div className="ui-container">
      <div className="top-bar">
        <div className="panel">
          <h1 className="title">FTUE Tuesday</h1>
          <p className="subtitle">Conference Networking Mini-Game</p>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#333', fontWeight: 'bold' }}>
              <BatteryCharging size={18} color={batColor} /> Social Battery
            </div>
            <div className="battery-bar">
              <div className="battery-fill" style={{ width: `${battery}%`, backgroundColor: batColor }} />
            </div>
          </div>
        </div>
        
        <div className="panel score">
          <Users color="#5c6ac4" />
          {connections} / {stateStore.totalNpcs} Connected
        </div>
      </div>
      
      <div className="panel instructions">
        <p><strong>WASD / Arrows</strong> to move.</p>
        <p>Approach NPCs slowly. Too close and you'll scare them!</p>
        <p>Hover in the <span style={{color: '#d4af37', fontWeight:'bold'}}>yellow ring</span> and press the requested key to connect.</p>
        <p>Recharge battery by standing near <span style={{color: '#8fb3a3', fontWeight:'bold'}}>couches</span>.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas shadows>
        <OrthographicCamera makeDefault position={[15, 20, 15]} zoom={35} near={-100} far={100} />
        <color attach="background" args={['#e0e7ff']} />
        
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 20, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        
        <CameraController />
        <EnvironmentProps />
        
        {quietZones.map((qz, i) => (
          <QuietZone key={`qz-${i}`} pos={qz.pos} size={qz.size} />
        ))}
        
        {npcsData.map(npc => (
          <NPC key={npc.id} initialPos={npc.pos} />
        ))}
        
        <Player />
      </Canvas>
      <UIOverlay />
    </div>
  );
}
