import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { RefreshCw, Crosshair, Sparkles } from 'lucide-react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 30;
const JUMP_X = 720;
const JUMP_Y = 420;
const JUMP_R = 50;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MAX_FALL_SPEED = 12;

const INITIAL_PLAYER = { x: 50, y: 350, vx: 0, vy: 0, isGrounded: false };
const PLATFORMS = [
  { x: 0, y: 470, w: 800, h: 30, type: 'normal' },
  { x: 200, y: 380, w: 120, h: 20, type: 'normal' },
  { x: 400, y: 290, w: 120, h: 20, type: 'normal' },
  { x: 600, y: 200, w: 80, h: 20, type: 'normal' },
  { x: 730, y: 110, w: 70, h: 20, type: 'goal' }
];

export default function App() {
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [settings, setSettings] = useState({ speed: 3, sensitivity: 3 });
  
  const player = useRef({ ...INITIAL_PLAYER });
  const mouse = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const dwellTime = useRef(0);
  
  const playerDOMRef = useRef<HTMLDivElement>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const deadzoneDOMRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      if (gameState === 'playing') {
        updatePhysics(dt);
      }
      
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameState, settings]);

  const updatePhysics = (dt: number) => {
    const p = player.current;
    const m = mouse.current;
    
    // 1. Dwell Jump Logic
    const distToJump = Math.hypot(m.x - JUMP_X, m.y - JUMP_Y);
    let isJumping = false;
    
    if (distToJump < JUMP_R) {
      dwellTime.current += dt;
      if (dwellTime.current >= 800) {
        isJumping = true;
        dwellTime.current = 0; // reset after jump
      }
    } else {
      dwellTime.current = Math.max(0, dwellTime.current - dt * 2); // decay quickly
    }
    
    const dwellProgress = Math.min(1, dwellTime.current / 800);
    if (progressCircleRef.current) {
      const circumference = 2 * Math.PI * (JUMP_R - 6);
      const offset = circumference - (dwellProgress * circumference);
      progressCircleRef.current.style.strokeDashoffset = offset.toString();
    }

    // 2. Movement Logic
    const deadzone = 200 - (settings.sensitivity * 30);
    const maxSpeed = settings.speed * 1.5;
    const accel = 0.5;
    
    const dx = m.x - (p.x + PLAYER_SIZE / 2);
    
    // Update deadzone visualization
    if (deadzoneDOMRef.current) {
      const leftBound = p.x + PLAYER_SIZE / 2 - deadzone;
      deadzoneDOMRef.current.style.transform = `translateX(${Math.max(0, leftBound)}px)`;
      deadzoneDOMRef.current.style.width = `${deadzone * 2}px`;
    }
    
    if (Math.abs(dx) > deadzone) {
      const dir = Math.sign(dx);
      p.vx += dir * accel;
      if (Math.abs(p.vx) > maxSpeed) p.vx = dir * maxSpeed;
    } else {
      p.vx *= 0.8;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }
    
    p.vy += GRAVITY;
    if (p.vy > MAX_FALL_SPEED) p.vy = MAX_FALL_SPEED;
    
    // 3. Collision Logic
    let nextX = p.x + p.vx;
    let nextY = p.y + p.vy;
    let grounded = false;
    let hitGoal = false;

    // Boundary clamp X
    if (nextX < 0) { nextX = 0; p.vx = 0; }
    if (nextX > GAME_WIDTH - PLAYER_SIZE) { nextX = GAME_WIDTH - PLAYER_SIZE; p.vx = 0; }

    // X Collision
    for (const plat of PLATFORMS) {
      if (nextX < plat.x + plat.w && nextX + PLAYER_SIZE > plat.x &&
          p.y < plat.y + plat.h && p.y + PLAYER_SIZE > plat.y) {
        if (p.vx > 0) nextX = plat.x - PLAYER_SIZE;
        else if (p.vx < 0) nextX = plat.x + plat.w;
        p.vx = 0;
      }
    }
    p.x = nextX;

    // Y Collision
    for (const plat of PLATFORMS) {
      if (p.x < plat.x + plat.w && p.x + PLAYER_SIZE > plat.x &&
          nextY < plat.y + plat.h && nextY + PLAYER_SIZE > plat.y) {
        if (p.vy > 0) {
          nextY = plat.y - PLAYER_SIZE;
          grounded = true;
          if (plat.type === 'goal') hitGoal = true;
        } else if (p.vy < 0) {
          nextY = plat.y + plat.h;
        }
        p.vy = 0;
      }
    }
    p.y = nextY;
    p.isGrounded = grounded;

    if (isJumping && p.isGrounded) {
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
    }

    // Fall off screen -> reset to start
    if (p.y > GAME_HEIGHT + 100) {
      Object.assign(p, INITIAL_PLAYER);
    }

    // Apply Transforms
    if (playerDOMRef.current) {
      playerDOMRef.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
      // Add slight tilt based on velocity for fun
      const tilt = p.vx * 2;
      playerDOMRef.current.children[0].setAttribute('style', `transform: rotate(${tilt}deg)`);
    }

    if (hitGoal) {
      setGameState('won');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    // Scale mapping in case the container is scaled by CSS
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    mouse.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const circumference = 2 * Math.PI * (JUMP_R - 6);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans text-slate-800">
      {gameState === 'won' && <Confetti recycle={false} numberOfPieces={500} gravity={0.15} />}
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* Settings Panel */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-200 flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-500 rounded-2xl mb-4">
              <Crosshair size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Eye-Play<br/>Simulator</h1>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              A prototype accessibility controller. Look (move cursor) towards a platform to walk. Dwell on the jump button to leap.
            </p>
          </div>
          
          <div className="space-y-8 flex-1">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-bold text-sm text-slate-700">Movement Speed</label>
                <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-bold text-slate-600 shadow-inner">
                  {settings.speed}
                </span>
              </div>
              <input 
                type="range" min="1" max="5" 
                value={settings.speed} 
                onChange={(e) => setSettings({...settings, speed: +e.target.value})} 
                className="w-full accent-blue-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-bold text-sm text-slate-700">Sensitivity</label>
                <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-bold text-slate-600 shadow-inner">
                  {settings.sensitivity}
                </span>
              </div>
              <input 
                type="range" min="1" max="5" 
                value={settings.sensitivity} 
                onChange={(e) => setSettings({...settings, sensitivity: +e.target.value})} 
                className="w-full accent-blue-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
              />
              <p className="text-xs text-slate-400 font-medium">
                Higher sensitivity creates a smaller neutral zone, requiring less eye movement to start walking.
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 p-3 rounded-xl">
               <Sparkles size={16} />
               <span>Medical-meets-playful design</span>
             </div>
          </div>
        </div>
        
        {/* Game Container */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative flex items-center justify-center bg-grid-slate-100" style={{ minHeight: GAME_HEIGHT + 40 }}>
          
          <div 
            ref={gameAreaRef}
            className="relative bg-slate-50/50 shadow-inner rounded-2xl overflow-hidden cursor-crosshair select-none"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT, maxWidth: '100%' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouse.current = { x: player.current.x, y: player.current.y } }} // stop moving
          >
            {/* Deadzone Visualization */}
            <div 
              ref={deadzoneDOMRef}
              className="absolute top-0 h-full border-x-2 border-dashed border-blue-200 bg-blue-50/30 pointer-events-none transition-all duration-75"
              style={{ willChange: 'transform, width' }}
            />
            
            {/* Platforms */}
            {PLATFORMS.map((plat, i) => (
              <div key={i} className="absolute rounded-xl shadow-sm transition-colors duration-300" style={{
                left: plat.x, top: plat.y, width: plat.w, height: plat.h,
                backgroundColor: plat.type === 'goal' ? '#34D399' : '#94A3B8',
                borderBottom: `4px solid ${plat.type === 'goal' ? '#059669' : '#64748B'}`
              }}>
                {plat.type === 'goal' && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-black tracking-widest">
                    GOAL
                  </div>
                )}
              </div>
            ))}
            
            {/* Player */}
            <div 
              ref={playerDOMRef}
              className="absolute will-change-transform"
              style={{ width: PLAYER_SIZE, height: PLAYER_SIZE, zIndex: 10 }}
            >
              <div className="w-full h-full bg-pink-400 rounded-xl shadow-sm flex items-center justify-center border-b-4 border-pink-500 relative transition-transform duration-75">
                {/* Face */}
                <div className="absolute top-2 left-1.5 w-1.5 h-1.5 bg-white rounded-full" />
                <div className="absolute top-2 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />
                <div className="absolute top-4 left-2 right-2 h-1.5 bg-white/50 rounded-full" />
              </div>
            </div>
            
            {/* Jump Button (Dwell Area) */}
            <div 
              className="absolute flex items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 z-20 group"
              style={{ left: JUMP_X - JUMP_R, top: JUMP_Y - JUMP_R, width: JUMP_R * 2, height: JUMP_R * 2 }}
            >
              <svg width={JUMP_R * 2} height={JUMP_R * 2} className="-rotate-90 absolute inset-0 pointer-events-none">
                <circle cx={JUMP_R} cy={JUMP_R} r={JUMP_R - 6} fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle 
                  ref={progressCircleRef}
                  cx={JUMP_R} cy={JUMP_R} r={JUMP_R - 6} 
                  fill="none" stroke="#3B82F6" strokeWidth="8" 
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  strokeLinecap="round"
                  className="transition-[stroke-dashoffset] duration-75 ease-linear"
                />
              </svg>
              <div className="font-black text-slate-300 text-sm tracking-wider flex flex-col items-center">
                JUMP
              </div>
            </div>
            
            {/* Win Overlay */}
            {gameState === 'won' && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Sparkles size={40} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Calibration Complete!</h2>
                <p className="text-slate-500 mb-8 font-medium text-lg">You found the perfect accessibility settings.</p>
                <button 
                  onClick={() => {
                    Object.assign(player.current, INITIAL_PLAYER);
                    setGameState('playing');
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-xl transition-all hover:scale-105 hover:-translate-y-1 active:scale-95"
                >
                  <RefreshCw size={20} />
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
