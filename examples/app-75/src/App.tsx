import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Sky, Stars, TubeGeometry } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Target, Gauge, Zap, Activity, ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,700;0,900;1,900&display=swap');
  
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'Montserrat', sans-serif;
    background-color: #000;
  }
  
  .carbon-fiber {
    background-color: #111;
    background-image: 
      repeating-linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a),
      repeating-linear-gradient(45deg, #1a1a1a 25%, #111 25%, #111 75%, #1a1a1a 75%, #1a1a1a);
    background-position: 0 0, 4px 4px;
    background-size: 8px 8px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
  }
  
  .neon-text {
    text-shadow: 0 0 10px currentColor;
  }
`;

const useGameState = () => {
  const curve = useMemo(() => {
    const c = new THREE.EllipseCurve(0, 0, 120, 60, 0, 2 * Math.PI, false, 0);
    const pts = c.getPoints(100).map(p => new THREE.Vector3(p.x, 0, p.y));
    return new THREE.CatmullRomCurve3(pts, true);
  }, []);

  const stateRef = useRef({
    gameTime: 0,
    trackCurve: curve,
    player: { theta: 0, lastTheta: 0, speed: 0.12, lane: 0, targetLane: 0, changingLane: false },
    aiCars: [
      { id: 1, theta: 0.8, lastTheta: 0.8, speed: 0.11, lane: -1, color: '#0055ff' },
      { id: 2, theta: 2.2, lastTheta: 2.2, speed: 0.115, lane: 1, color: '#ffaa00' },
      { id: 3, theta: 3.5, lastTheta: 3.5, speed: 0.105, lane: 0, color: '#00ff55' },
      { id: 4, theta: 4.8, lastTheta: 4.8, speed: 0.125, lane: -1, color: '#ff00ff' },
      { id: 5, theta: 5.9, lastTheta: 5.9, speed: 0.11, lane: 1, color: '#00ffff' },
    ],
    objective: null,
    lastObjectiveTime: 0,
    tokens: 3,
    xp: 0,
    history: []
  });

  return stateRef;
};

const F1Car = ({ isPlayer, stateRef, carIndex }) => {
  const ref = useRef();
  
  useFrame(() => {
    const state = stateRef.current;
    if (!state) return;
    
    const carData = isPlayer ? state.player : state.aiCars[carIndex];
    if (!carData) return;

    const t = ((carData.theta / (Math.PI * 2)) % 1 + 1) % 1;
    const pos = state.trackCurve.getPointAt(t);
    const tangent = state.trackCurve.getTangentAt(t);
    const perp = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    
    pos.add(perp.multiplyScalar(carData.lane * 3));
    
    ref.current.position.copy(pos);
    const targetLook = pos.clone().add(tangent);
    ref.current.lookAt(targetLook);
  });

  const color = isPlayer ? '#ff1111' : stateRef.current?.aiCars[carIndex]?.color || '#ffffff';

  return (
    <group ref={ref}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.3, 3]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, -0.2]}>
        <boxGeometry args={[0.7, 0.4, 1]} />
        <meshStandardMaterial color="#000" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.1, 1.4]}>
        <boxGeometry args={[2, 0.1, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.6, -1.3]}>
        <boxGeometry args={[1.8, 0.1, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-0.8, 0.8].map(x => 
        [-1, 1].map(z => (
          <mesh key={`${x}-${z}`} position={[x, 0.3, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
};

const Track = ({ stateRef }) => {
  const curve = stateRef.current.trackCurve;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 200, 5, 8, true]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <tubeGeometry args={[curve, 200, 5.2, 8, true]} />
        <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

const CameraManager = ({ stateRef, isRewinding }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    const state = stateRef.current;
    if (!state) return;
    
    const t = ((state.player.theta / (Math.PI * 2)) % 1 + 1) % 1;
    const pos = state.trackCurve.getPointAt(t);
    const tangent = state.trackCurve.getTangentAt(t);
    const perp = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    pos.add(perp.multiplyScalar(state.player.lane * 3));
    
    const camPos = pos.clone().add(tangent.clone().multiplyScalar(-12)).add(new THREE.Vector3(0, 5, 0));
    
    if (isRewinding) {
      camPos.add(new THREE.Vector3((Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5, 0));
    }
    
    camera.position.lerp(camPos, 0.2);
    camera.lookAt(pos.clone().add(tangent.clone().multiplyScalar(10)));
    
    const targetFov = 70 + (state.player.speed - 0.12) * 300;
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();
  });
  return null;
};

const GameManager = ({ stateRef, setUiState, isRewinding, setIsRewinding, triggerRadioRef }) => {
  const keys = useRef({ up: false, down: false, left: false, right: false });
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') keys.current.up = true;
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') keys.current.down = true;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.current.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') keys.current.up = false;
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') keys.current.down = false;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.current.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  useFrame((_, delta) => {
    const state = stateRef.current;
    if (!state) return;
    
    const d = Math.min(delta, 0.1);

    if (isRewinding) {
      for (let i = 0; i < 4; i++) {
        if (state.history.length > 0) {
          const past = state.history.pop();
          state.gameTime = past.gameTime;
          state.player = { ...past.player };
          state.aiCars = past.aiCars.map(c => ({...c}));
          state.objective = past.objective ? { ...past.objective } : null;
          state.lastObjectiveTime = past.lastObjectiveTime;
        } else {
          setIsRewinding(false);
          break;
        }
      }
      return; 
    }

    state.gameTime += d;

    if (keys.current.up) {
      state.player.speed = Math.min(0.25, state.player.speed + d * 0.05);
    } else if (keys.current.down) {
      state.player.speed = Math.max(0.05, state.player.speed - d * 0.1);
    } else {
      state.player.speed += (0.12 - state.player.speed) * d * 2; 
    }

    if (keys.current.left && !state.player.changingLane) {
      state.player.targetLane = Math.max(-1, state.player.targetLane - 1);
      state.player.changingLane = true;
    } else if (keys.current.right && !state.player.changingLane) {
      state.player.targetLane = Math.min(1, state.player.targetLane + 1);
      state.player.changingLane = true;
    } else if (!keys.current.left && !keys.current.right) {
      state.player.changingLane = false;
    }

    state.player.lane += (state.player.targetLane - state.player.lane) * d * 5;
    
    state.player.lastTheta = state.player.theta;
    state.aiCars.forEach(ai => ai.lastTheta = ai.theta);

    state.player.theta += state.player.speed * d;
    state.aiCars.forEach(ai => {
      ai.theta += ai.speed * d;
    });

    if (!state.objective && state.gameTime - state.lastObjectiveTime > 6) {
      const types = ['overtake', 'hold', 'save_tyres'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let text, target = 0;
      if (type === 'overtake') {
        target = 2;
        text = `Overtake ${target} cars`;
      } else if (type === 'hold') {
        text = 'Hold position';
      } else {
        text = 'Save tyres (Speed < 150)';
      }

      state.objective = {
        id: Date.now(),
        type,
        text,
        target,
        progress: 0,
        timeLimit: 15,
        startTime: state.gameTime,
        startPosition: state.aiCars.filter(ai => ai.theta > state.player.theta).length + 1
      };
      
      if(triggerRadioRef.current) triggerRadioRef.current('new');
    }

    if (state.objective) {
      const obj = state.objective;
      const timeLeft = obj.timeLimit - (state.gameTime - obj.startTime);
      
      if (obj.type === 'overtake') {
        state.aiCars.forEach(ai => {
          if (state.player.lastTheta <= ai.lastTheta && state.player.theta > ai.theta) {
            obj.progress++;
          }
        });
        if (obj.progress >= obj.target) {
          completeObjective(state);
        } else if (timeLeft <= 0) {
          failObjective(state);
        }
      } 
      else if (obj.type === 'hold') {
        const currentPos = state.aiCars.filter(ai => ai.theta > state.player.theta).length + 1;
        if (currentPos > obj.startPosition) {
          failObjective(state);
        } else if (timeLeft <= 0) {
          completeObjective(state);
        }
      }
      else if (obj.type === 'save_tyres') {
        if (state.player.speed > 0.15) { 
          failObjective(state);
        } else if (timeLeft <= 0) {
          completeObjective(state);
        }
      }
    }

    state.history.push({
      gameTime: state.gameTime,
      player: { ...state.player },
      aiCars: state.aiCars.map(c => ({...c})),
      objective: state.objective ? { ...state.objective } : null,
      lastObjectiveTime: state.lastObjectiveTime
    });
    if (state.history.length > 300) state.history.shift(); // ~5 seconds

    if (Math.floor(state.gameTime * 10) !== Math.floor((state.gameTime - d) * 10)) {
      setUiState({
        speed: Math.floor(state.player.speed * 1000),
        position: state.aiCars.filter(ai => ai.theta > state.player.theta).length + 1,
        objective: state.objective ? { ...state.objective, timeLeft: Math.max(0, state.objective.timeLimit - (state.gameTime - state.objective.startTime)) } : null,
        tokens: state.tokens,
        xp: state.xp,
        isRewinding
      });
    }
  });

  const completeObjective = (state) => {
    state.xp += 100;
    if (state.xp % 300 === 0) state.tokens++;
    state.lastObjectiveTime = state.gameTime;
    state.objective = null;
    if(triggerRadioRef.current) triggerRadioRef.current('success');
  };

  const failObjective = (state) => {
    state.lastObjectiveTime = state.gameTime;
    state.objective = null;
    if(triggerRadioRef.current) triggerRadioRef.current('fail');
  };

  return null;
};

const HUD = ({ uiState, handleRewind, radioMsg }) => {
  if (!uiState) return null;

  return (
    <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between overflow-hidden">
      <AnimatePresence>
        {uiState.isRewinding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-600 mix-blend-overlay z-0"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,255,0.4) 4px, rgba(0,0,255,0.4) 8px)' }}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start z-10 relative">
        <div className="carbon-fiber px-6 py-4 rounded-xl shadow-2xl flex gap-8">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Driver XP</span>
            <span className="text-white text-3xl font-black neon-text">{uiState.xp}</span>
          </div>
          <div className="w-px bg-gray-600"></div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Time Tokens</span>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Zap key={i} size={24} className={i < uiState.tokens ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" : "text-gray-800"} />
              ))}
            </div>
          </div>
        </div>

        <div className="carbon-fiber px-8 py-4 rounded-xl shadow-2xl text-right">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Position</div>
          <div className="text-white text-4xl font-black italic">
            {uiState.position} <span className="text-xl text-gray-500">/ 6</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center pointer-events-none z-10 relative">
        <AnimatePresence>
          {uiState.objective && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              className="carbon-fiber p-8 rounded-2xl border-l-4 border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.2)] text-center min-w-[350px]"
            >
              <div className="flex justify-center mb-3">
                <Target className="text-red-500 animate-pulse" size={40} />
              </div>
              <h2 className="text-red-500 text-xs font-black uppercase tracking-widest mb-2">New Objective</h2>
              <p className="text-white text-2xl font-black mb-6 italic">{uiState.objective.text}</p>
              
              <div className="bg-gray-900 rounded-full h-4 w-full overflow-hidden mb-3 border border-gray-700">
                <motion.div 
                  className="bg-gradient-to-r from-red-600 to-red-400 h-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(uiState.objective.timeLeft / 15) * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-red-400 font-bold font-mono text-xl">{uiState.objective.timeLeft.toFixed(1)}s</p>
              
              {uiState.objective.type === 'overtake' && (
                <div className="mt-4 text-white font-bold text-lg">
                  Progress: {uiState.objective.progress} / {uiState.objective.target}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-end z-10 relative">
        <div className="carbon-fiber p-6 rounded-t-full rounded-b-2xl border-t-4 border-t-red-500 shadow-2xl flex flex-col items-center justify-center w-40 h-40">
          <Gauge size={40} className="text-red-500 mb-2" />
          <div className="text-white text-5xl font-black italic tracking-tighter">{uiState.speed}</div>
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">km/h</div>
        </div>

        <div className="flex flex-col items-end gap-6">
          <AnimatePresence>
            {radioMsg && (
              <motion.div 
                initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
                className="bg-gray-900/90 backdrop-blur-md border-l-4 border-blue-500 p-4 rounded-lg shadow-2xl flex items-center gap-4 max-w-md"
              >
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <Activity className="text-blue-400 animate-pulse" size={24} />
                </div>
                <div>
                  <div className="text-blue-400 text-xs font-bold uppercase mb-1 tracking-wider">Race Engineer</div>
                  <span className="text-white font-medium italic">"{radioMsg}"</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            className={`pointer-events-auto flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl transition-all
              ${uiState.tokens > 0 && !uiState.isRewinding ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-105' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
            `}
            onClick={handleRewind}
            disabled={uiState.tokens <= 0 || uiState.isRewinding}
          >
            <RotateCcw className={uiState.isRewinding ? 'animate-spin' : ''} size={24} />
            {uiState.isRewinding ? 'Rewinding...' : 'Rewind (-1 Token)'}
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-bold flex gap-8 bg-black/60 px-8 py-3 rounded-full backdrop-blur-md border border-gray-800">
        <span className="flex items-center gap-2"><ArrowUp size={16} className="text-white"/> Throttle</span>
        <span className="flex items-center gap-2"><ArrowDown size={16} className="text-white"/> Brake</span>
        <span className="flex items-center gap-2"><ArrowLeft size={16} className="text-white"/> <ArrowRight size={16} className="text-white"/> Steer</span>
      </div>
    </div>
  );
};

export default function App() {
  const [started, setStarted] = useState(false);
  const stateRef = useGameState();
  const [uiState, setUiState] = useState(null);
  const [isRewinding, setIsRewinding] = useState(false);
  const [radioMsg, setRadioMsg] = useState(null);
  
  const triggerRadioRef = useRef();

  useEffect(() => {
    triggerRadioRef.current = (type) => {
      const lines = {
        success: ["Great job, mate! Keep pushing.", "That's it, perfectly executed.", "Copy that, objective complete.", "Stunning driving, mate."],
        fail: ["We lost that one, stay focused.", "Missed the target, let's try to recover.", "Mate, you need to follow instructions."],
        new: ["New objective from the pit wall.", "Listen up, new strategy.", "We need you to focus on this."]
      };
      const msg = lines[type][Math.floor(Math.random() * lines[type].length)];
      setRadioMsg(msg);
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(msg);
        u.rate = 1.1;
        u.pitch = 0.95;
        window.speechSynthesis.speak(u);
      }
      setTimeout(() => setRadioMsg(null), 4000);
    };
  }, []);

  const handleRewind = () => {
    if (stateRef.current.tokens > 0 && !isRewinding) {
      stateRef.current.tokens--;
      setIsRewinding(true);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setRadioMsg("Rewinding time...");
      setTimeout(() => setRadioMsg(null), 2000);
    }
  };

  if (!started) {
    return (
      <div className="w-full h-full flex items-center justify-center flex-col gap-10 carbon-fiber">
        <style>{GLOBAL_CSS}</style>
        <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 text-center leading-tight drop-shadow-2xl">
          DYNAMIC<br/>OBJECTIVES
        </h1>
        <button 
          className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white font-black text-2xl rounded-full shadow-[0_0_40px_rgba(255,0,0,0.6)] transition-all hover:scale-110 uppercase tracking-widest border-2 border-red-400"
          onClick={() => {
            if (window.speechSynthesis) {
              window.speechSynthesis.speak(new SpeechSynthesisUtterance("Engine started."));
            }
            setStarted(true);
          }}
        >
          Start Engine
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />
        <Environment preset="night" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Track stateRef={stateRef} />
        <F1Car isPlayer stateRef={stateRef} carIndex={0} />
        {stateRef.current.aiCars.map((_, i) => (
          <F1Car key={i} isPlayer={false} stateRef={stateRef} carIndex={i} />
        ))}
        
        <CameraManager stateRef={stateRef} isRewinding={isRewinding} />
        <GameManager 
          stateRef={stateRef} 
          setUiState={setUiState} 
          isRewinding={isRewinding} 
          setIsRewinding={setIsRewinding}
          triggerRadioRef={triggerRadioRef}
        />
      </Canvas>
      <HUD uiState={uiState} handleRewind={handleRewind} radioMsg={radioMsg} />
    </>
  );
}
