import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

const FLOOR_Y = -3;
const PLAYER_X = -5;
const GRAVITY = -50;
const JUMP_VELOCITY = 20;

let GLOBAL_STATE = {
  speed: 12,
  score: 0,
  gameOver: false,
  jumpMultiplier: 1,
  weightMultiplier: 1,
  flashTimer: 0,
  isStarted: false,
};

const resetState = () => {
  GLOBAL_STATE.speed = 12;
  GLOBAL_STATE.score = 0;
  GLOBAL_STATE.gameOver = false;
  GLOBAL_STATE.jumpMultiplier = 1;
  GLOBAL_STATE.weightMultiplier = 1;
  GLOBAL_STATE.flashTimer = 0;
  GLOBAL_STATE.isStarted = false;
};

type Entity = {
  id: number;
  type: 'obstacle' | 'creativity' | 'cpi';
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
};

const ENTITIES: Entity[] = [];
const MAX_POOL = 30;

const materials = {
  obstacle: new THREE.MeshStandardMaterial({ color: '#ff0033', emissive: '#ff0033', emissiveIntensity: 0.8, wireframe: true }),
  obstacleSolid: new THREE.MeshStandardMaterial({ color: '#220000', emissive: '#110000', emissiveIntensity: 0.2 }),
  creativity: new THREE.MeshStandardMaterial({ color: '#00ffcc', emissive: '#00ffcc', emissiveIntensity: 1.5 }),
  cpi: new THREE.MeshStandardMaterial({ color: '#aaff00', emissive: '#88cc00', emissiveIntensity: 1.0 }),
};

function GameObjects() {
  const meshesRef = useRef<(THREE.Mesh | null)[]>([]);
  const innersRef = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => {
    ENTITIES.length = 0;
    for (let i = 0; i < MAX_POOL; i++) {
      ENTITIES.push({ id: i, type: 'obstacle', x: -100, y: -100, width: 1, height: 1, active: false });
    }
  }, []);

  const spawnTimer = useRef(0);

  useFrame((state, delta) => {
    if (!GLOBAL_STATE.isStarted || GLOBAL_STATE.gameOver) return;

    GLOBAL_STATE.score += delta;
    GLOBAL_STATE.speed += delta * 0.2;

    spawnTimer.current -= delta;
    if (spawnTimer.current <= 0) {
      spawnTimer.current = 0.8 + Math.random() * 1.5 * (12 / GLOBAL_STATE.speed);
      
      const ent = ENTITIES.find(e => !e.active);
      if (ent) {
        ent.active = true;
        ent.x = 25;
        
        const rand = Math.random();
        if (rand < 0.55) {
          ent.type = 'obstacle';
          ent.width = 1.5 + Math.random() * 3;
          ent.height = 2 + Math.random() * 6;
          ent.y = FLOOR_Y + ent.height / 2;
        } else if (rand < 0.8) {
          ent.type = 'creativity';
          ent.width = 1;
          ent.height = 1;
          ent.y = FLOOR_Y + 2 + Math.random() * 4;
        } else {
          ent.type = 'cpi';
          ent.width = 1.2;
          ent.height = 1.2;
          ent.y = FLOOR_Y + 1.5 + Math.random() * 2;
        }
      }
    }

    for (let i = 0; i < MAX_POOL; i++) {
      const ent = ENTITIES[i];
      const mesh = meshesRef.current[i];
      const inner = innersRef.current[i];

      if (ent.active && mesh) {
        ent.x -= GLOBAL_STATE.speed * delta;
        mesh.position.set(ent.x, ent.y, 0);
        mesh.visible = true;

        if (ent.type === 'obstacle') {
          mesh.scale.set(ent.width, ent.height, 2);
          mesh.material = materials.obstacle;
          if (inner) {
            inner.visible = true;
            inner.position.set(ent.x, ent.y, 0);
            inner.scale.set(ent.width * 0.95, ent.height * 0.95, 1.95);
          }
        } else {
          if (inner) inner.visible = false;
          mesh.scale.set(ent.width, ent.height, 1);
          if (ent.type === 'creativity') {
            mesh.material = materials.creativity;
            mesh.rotation.y += delta * 3;
            mesh.rotation.x += delta * 2;
          } else {
            mesh.material = materials.cpi;
            mesh.rotation.z += delta * 2;
          }
        }

        if (ent.x < -15) ent.active = false;
      } else {
        if (mesh) mesh.visible = false;
        if (inner) inner.visible = false;
      }
    }
  });

  return (
    <group>
      {Array.from({ length: MAX_POOL }).map((_, i) => (
        <group key={i}>
          <mesh ref={el => { meshesRef.current[i] = el; }} visible={false}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial />
          </mesh>
          <mesh ref={el => { innersRef.current[i] = el; }} visible={false}>
            <boxGeometry args={[1, 1, 1]} />
            <primitive object={materials.obstacleSolid} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Player() {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const vel = useRef(0);
  const isJumping = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!GLOBAL_STATE.isStarted && !GLOBAL_STATE.gameOver) {
          GLOBAL_STATE.isStarted = true;
        }
        jump();
      }
    };
    const handleClick = () => {
      if (!GLOBAL_STATE.isStarted && !GLOBAL_STATE.gameOver) {
        GLOBAL_STATE.isStarted = true;
      }
      jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('touchstart', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, []);

  const jump = () => {
    if (GLOBAL_STATE.gameOver) return;
    if (!isJumping.current) {
      vel.current = JUMP_VELOCITY * GLOBAL_STATE.jumpMultiplier * (1 / GLOBAL_STATE.weightMultiplier);
      isJumping.current = true;
    }
  };

  useFrame((state, delta) => {
    if (!GLOBAL_STATE.isStarted && !GLOBAL_STATE.gameOver) {
       if (ref.current) {
         ref.current.position.y = FLOOR_Y + 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
       }
       return;
    }

    if (GLOBAL_STATE.gameOver || !ref.current) return;

    vel.current += GRAVITY * GLOBAL_STATE.weightMultiplier * delta;
    ref.current.position.y += vel.current * delta;

    if (ref.current.position.y <= FLOOR_Y + 0.5) {
      ref.current.position.y = FLOOR_Y + 0.5;
      vel.current = 0;
      isJumping.current = false;
    }

    if (GLOBAL_STATE.flashTimer > 0) {
      GLOBAL_STATE.flashTimer -= delta;
      if (matRef.current) {
        matRef.current.emissive.setHex(Math.random() > 0.5 ? 0xff00ff : 0xffff00);
        matRef.current.emissiveIntensity = 2;
      }
    } else {
      if (matRef.current) {
        matRef.current.emissive.setHex(0x00ffff);
        matRef.current.emissiveIntensity = 1;
      }
    }

    const px = ref.current.position.x;
    const py = ref.current.position.y;
    const pWidth = 1;
    const pHeight = 1;

    for (const ent of ENTITIES) {
      if (!ent.active) continue;
      
      const dx = px - ent.x;
      const dy = py - ent.y;
      
      if (Math.abs(dx) < (pWidth/2 + ent.width/2) && Math.abs(dy) < (pHeight/2 + ent.height/2)) {
        if (ent.type === 'obstacle') {
          GLOBAL_STATE.gameOver = true;
        } else if (ent.type === 'creativity') {
          ent.active = false;
          GLOBAL_STATE.jumpMultiplier = 1.6;
          GLOBAL_STATE.flashTimer = 3;
          setTimeout(() => { GLOBAL_STATE.jumpMultiplier = 1; }, 3000);
        } else if (ent.type === 'cpi') {
          ent.active = false;
          GLOBAL_STATE.weightMultiplier = 1.8;
          setTimeout(() => { GLOBAL_STATE.weightMultiplier = 1; }, 3000);
        }
      }
    }
  });

  return (
    <mesh ref={ref} position={[PLAYER_X, FLOOR_Y + 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial ref={matRef} color="#ffffff" emissive="#00ffff" emissiveIntensity={1} />
    </mesh>
  );
}

function Floor() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state, delta) => {
    if (!GLOBAL_STATE.isStarted || GLOBAL_STATE.gameOver || !gridRef.current) return;
    gridRef.current.position.x -= GLOBAL_STATE.speed * delta;
    if (gridRef.current.position.x <= -2) {
      gridRef.current.position.x += 2;
    }
  });

  return (
    <group position={[0, FLOOR_Y, 0]}>
      <gridHelper ref={gridRef} args={[100, 50, 0xff00ff, 0x220055]} position={[0, 0, 0]} />
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 50]} />
        <meshBasicMaterial color="#050011" />
      </mesh>
    </group>
  );
}

export default function App() {
  const scoreRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const tick = () => {
      if (scoreRef.current) {
        scoreRef.current.innerText = `Attention: ${Math.floor(GLOBAL_STATE.score)} Weeks`;
      }
      if (statusRef.current) {
        if (GLOBAL_STATE.flashTimer > 0) {
          statusRef.current.innerText = 'CREATIVE SPARK! JUMP BOOST!';
          statusRef.current.style.color = '#ff00ff';
        } else if (GLOBAL_STATE.weightMultiplier > 1) {
          statusRef.current.innerText = 'HIGH CPI! HEAVY BURDEN!';
          statusRef.current.style.color = '#aaff00';
        } else {
          statusRef.current.innerText = '';
        }
      }

      if (GLOBAL_STATE.gameOver && !gameOver) {
        setFinalScore(Math.floor(GLOBAL_STATE.score));
        setGameOver(true);
      }
      if (GLOBAL_STATE.isStarted && !started) {
        setStarted(true);
      }
      
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameOver, started]);

  const handleRestart = () => {
    resetState();
    ENTITIES.forEach(e => e.active = false);
    setGameOver(false);
    setStarted(true);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#050011' }}>
      <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 5]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Player />
        <GameObjects />
        <Floor />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
          <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
          <Noise opacity={0.1} />
        </EffectComposer>
      </Canvas>

      <div className="overlay">
        <div className="hud-top">
          <div className="score" ref={scoreRef}>Attention: 0 Weeks</div>
          <div className="status" ref={statusRef}></div>
        </div>

        {!started && !gameOver && (
          <div className="center-message">
            <div className="title">MARKET SATURATION</div>
            <div className="subtitle">Survival in 2026</div>
            <div className="instructions">
              Click or Space to Jump.<br/><br/>
              Dodge giant AI games.<br/>
              Cyan Diamonds = Creativity (Jump Boost)<br/>
              Green Boxes = CPI (Heavy Burden)
            </div>
            <button className="btn" onClick={() => { GLOBAL_STATE.isStarted = true; }}>START RUNNING</button>
          </div>
        )}

        {gameOver && (
          <div className="center-message">
            <div className="title">MARKET DOMINATED</div>
            <div className="subtitle">Your indie game survived {finalScore} weeks before the AI saturated the market.</div>
            <button className="btn" onClick={handleRestart}>TRY AGAIN</button>
          </div>
        )}
      </div>
    </div>
  );
}
