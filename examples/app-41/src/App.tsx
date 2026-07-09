import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Users, GraduationCap, Briefcase, Zap, Info, PlayCircle } from 'lucide-react';
import './App.css';

// --- Constants & Config ---
const GRID_W = 14;
const GRID_H = 10;
const CELL_SIZE = 55; // px
const TICK_RATE = 50; // ms

// Path is defined in grid coordinates
const PATH_POINTS = [
  { x: 0, y: 5 },
  { x: 3, y: 5 },
  { x: 3, y: 2 },
  { x: 9, y: 2 },
  { x: 9, y: 8 },
  { x: 13, y: 8 }
];

const MENTORS = {
  bootcamp: { 
    id: 'bootcamp',
    name: 'Bootcamp', 
    cost: 100, 
    range: 2.2, 
    cooldown: 8, 
    transfer: 10, 
    color: '#0ea5e9', 
    icon: Zap,
    desc: 'Fast skill transfer, small range'
  },
  apprentice: { 
    id: 'apprentice',
    name: 'Apprenticeship', 
    cost: 220, 
    range: 3.5, 
    cooldown: 18, 
    transfer: 35, 
    color: '#f59e0b', 
    icon: Briefcase,
    desc: 'Balanced range and speed'
  },
  university: { 
    id: 'university',
    name: 'University', 
    cost: 400, 
    range: 5.5, 
    cooldown: 35, 
    transfer: 100, 
    color: '#ef4444', 
    icon: GraduationCap,
    desc: 'Huge range and high impact, slow'
  }
};

// --- Helpers ---
function calculatePathSegments(points: {x:number, y:number}[]) {
  let segments = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i+1].x - points[i].x;
    const dy = points[i+1].y - points[i].y;
    const length = Math.sqrt(dx*dx + dy*dy);
    segments.push({
      start: points[i],
      end: points[i+1],
      length,
      accLength: totalLength,
      dir: { x: dx/length, y: dy/length }
    });
    totalLength += length;
  }
  return { segments, totalLength };
}

const PATH_DATA = calculatePathSegments(PATH_POINTS);

function getPositionAtProgress(progress: number) {
  if (progress <= 0) return PATH_DATA.segments[0].start;
  if (progress >= PATH_DATA.totalLength) return PATH_DATA.segments[PATH_DATA.segments.length - 1].end;
  
  for (const seg of PATH_DATA.segments) {
    if (progress >= seg.accLength && progress <= seg.accLength + seg.length) {
      const t = (progress - seg.accLength) / seg.length;
      return {
        x: seg.start.x + (seg.end.x - seg.start.x) * t,
        y: seg.start.y + (seg.end.y - seg.start.y) * t
      };
    }
  }
  return PATH_DATA.segments[PATH_DATA.segments.length - 1].end;
}

const getPathCells = () => {
  const cells = new Set<string>();
  for (const seg of PATH_DATA.segments) {
    const minX = Math.min(seg.start.x, seg.end.x);
    const maxX = Math.max(seg.start.x, seg.end.x);
    const minY = Math.min(seg.start.y, seg.end.y);
    const maxY = Math.max(seg.start.y, seg.end.y);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.add(`${x},${y}`);
      }
    }
  }
  return cells;
};

const PATH_CELLS = getPathCells();

// --- Game Logic Engine ---
export default function App() {
  const [renderTick, setRenderTick] = useState(0);
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  
  const gameState = useRef({
    money: 250,
    lives: 10,
    capacity: 0,
    wave: 1,
    waveActive: false,
    enemies: [] as any[],
    towers: [] as any[],
    lasers: [] as any[],
    spawnsLeft: 0,
    spawnTimer: 0,
    gameOver: false,
    gameWon: false,
    speed: 1,
    tickCount: 0
  });

  const state = gameState.current;
  let enemyIdCounter = useRef(0);

  const spawnEnemy = (wave: number) => {
    return {
      id: enemyIdCounter.current++,
      progress: 0,
      hp: 40 + wave * 25,
      maxHp: 40 + wave * 25,
      speed: 0.04 + (wave * 0.006)
    };
  };

  useEffect(() => {
    const loop = setInterval(() => {
      const gs = gameState.current;
      
      if (gs.gameOver || gs.gameWon) return;

      // Handle time speed up
      const cycles = gs.speed;
      let changed = false;

      for (let c = 0; c < cycles; c++) {
        gs.tickCount++;

        // Wave management
        if (gs.waveActive) {
          if (gs.spawnTimer <= 0 && gs.spawnsLeft > 0) {
            gs.enemies.push(spawnEnemy(gs.wave));
            gs.spawnsLeft--;
            gs.spawnTimer = 15; // Delay between spawns
          } else {
            gs.spawnTimer--;
          }
          
          if (gs.spawnsLeft === 0 && gs.enemies.length === 0) {
            gs.waveActive = false;
            if (gs.wave >= 15) {
              gs.gameWon = true;
            } else {
              gs.wave++;
            }
          }
        }

        // Enemy movement
        for (let i = gs.enemies.length - 1; i >= 0; i--) {
          const e = gs.enemies[i];
          e.progress += e.speed;
          if (e.progress >= PATH_DATA.totalLength) {
            gs.enemies.splice(i, 1);
            gs.lives--;
            if (gs.lives <= 0) {
              gs.gameOver = true;
            }
          }
        }

        // Towers attack
        gs.towers.forEach(t => {
          if (t.cooldownTimer > 0) t.cooldownTimer--;
          
          if (t.cooldownTimer <= 0) {
            let target = null;
            let maxProg = -1;
            const mentorType = MENTORS[t.type as keyof typeof MENTORS];
            
            for (const e of gs.enemies) {
              const ePos = getPositionAtProgress(e.progress);
              const dist = Math.hypot(ePos.x - t.x, ePos.y - t.y);
              if (dist <= mentorType.range && e.progress > maxProg && e.hp > 0) {
                target = e;
                maxProg = e.progress;
              }
            }
            
            if (target) {
              t.cooldownTimer = mentorType.cooldown;
              target.hp -= mentorType.transfer;
              const ePos = getPositionAtProgress(target.progress);
              
              gs.lasers.push({
                id: Math.random(),
                x1: t.x + 0.5, y1: t.y + 0.5,
                x2: ePos.x + 0.5, y2: ePos.y + 0.5,
                color: mentorType.color,
                life: 4
              });

              if (target.hp <= 0) {
                gs.money += 15 + Math.floor(gs.wave * 2); // Gold reward
                gs.capacity++;
              }
            }
          }
        });

        // Filter out dead enemies
        gs.enemies = gs.enemies.filter(e => e.hp > 0);

        // Update lasers
        gs.lasers.forEach(l => l.life--);
        gs.lasers = gs.lasers.filter(l => l.life > 0);

        changed = true;
      }

      if (changed) {
        setRenderTick(t => t + 1);
      }

    }, TICK_RATE);

    return () => clearInterval(loop);
  }, []);

  const startWave = () => {
    if (state.waveActive || state.gameOver || state.gameWon) return;
    state.waveActive = true;
    state.spawnsLeft = 5 + state.wave * 3;
    state.spawnTimer = 0;
    setRenderTick(t => t + 1);
  };

  const resetGame = () => {
    gameState.current = {
      money: 250,
      lives: 10,
      capacity: 0,
      wave: 1,
      waveActive: false,
      enemies: [],
      towers: [],
      lasers: [],
      spawnsLeft: 0,
      spawnTimer: 0,
      gameOver: false,
      gameWon: false,
      speed: 1,
      tickCount: 0
    };
    enemyIdCounter.current = 0;
    setSelectedMentor(null);
    setRenderTick(t => t + 1);
  };

  const handleCellClick = (x: number, y: number) => {
    if (!selectedMentor) return;
    if (PATH_CELLS.has(`${x},${y}`)) return; // On path
    if (state.towers.some(t => t.x === x && t.y === y)) return; // Occupied
    
    const mentor = MENTORS[selectedMentor as keyof typeof MENTORS];
    if (state.money >= mentor.cost) {
      state.money -= mentor.cost;
      state.towers.push({
        x, y, type: selectedMentor, cooldownTimer: 0
      });
      setSelectedMentor(null);
      setRenderTick(t => t + 1);
    }
  };

  // UI rendering helpers
  const pathLines = useMemo(() => {
    return PATH_DATA.segments.map((seg, i) => (
      <line
        key={`path-${i}`}
        x1={(seg.start.x + 0.5) * CELL_SIZE}
        y1={(seg.start.y + 0.5) * CELL_SIZE}
        x2={(seg.end.x + 0.5) * CELL_SIZE}
        y2={(seg.end.y + 0.5) * CELL_SIZE}
        stroke="#cbd5e1"
        strokeWidth={CELL_SIZE * 0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ));
  }, []);
  
  const pathDashedLines = useMemo(() => {
    return PATH_DATA.segments.map((seg, i) => (
      <line
        key={`pathd-${i}`}
        x1={(seg.start.x + 0.5) * CELL_SIZE}
        y1={(seg.start.y + 0.5) * CELL_SIZE}
        x2={(seg.end.x + 0.5) * CELL_SIZE}
        y2={(seg.end.y + 0.5) * CELL_SIZE}
        stroke="#94a3b8"
        strokeWidth="4"
        strokeDasharray="10 10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Talent Pipeline</h1>
            <p className="text-sm text-slate-500">Studio Strategies & Solutions</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Studio Capacity</span>
            <span className="text-2xl font-black text-indigo-600">{state.capacity} <span className="text-sm font-medium text-slate-500">Devs</span></span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Budget</span>
            <span className="text-2xl font-black text-emerald-600">${state.money}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Pipeline Health</span>
            <span className="text-2xl font-black text-rose-500">{state.lives} <span className="text-sm font-medium text-slate-500">/ 10</span></span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Game Canvas Container */}
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 relative">
          
          <div 
            className="relative bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200"
            style={{ width: GRID_W * CELL_SIZE, height: GRID_H * CELL_SIZE }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width={CELL_SIZE} height={CELL_SIZE} patternUnits="userSpaceOnUse">
                  <path d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`} fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Path */}
              {pathLines}
              {pathDashedLines}

              {/* Range Indicator for Placement */}
              {selectedMentor && (
                <circle 
                  cx="-1000" cy="-1000" r="0" 
                  id="range-indicator"
                  fill={MENTORS[selectedMentor as keyof typeof MENTORS].color} 
                  fillOpacity="0.1" 
                  stroke={MENTORS[selectedMentor as keyof typeof MENTORS].color} 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                />
              )}

              {/* Lasers */}
              {state.lasers.map(l => (
                <line 
                  key={l.id}
                  x1={l.x1 * CELL_SIZE} y1={l.y1 * CELL_SIZE}
                  x2={l.x2 * CELL_SIZE} y2={l.y2 * CELL_SIZE}
                  stroke={l.color}
                  strokeWidth={4 * (l.life / 4)}
                  strokeLinecap="round"
                  opacity={l.life / 4}
                />
              ))}

              {/* Enemies */}
              <AnimatePresence>
                {state.enemies.map(e => {
                  const pos = getPositionAtProgress(e.progress);
                  return (
                    <motion.g 
                      key={e.id}
                      initial={false}
                      animate={{ x: (pos.x + 0.5) * CELL_SIZE, y: (pos.y + 0.5) * CELL_SIZE }}
                      transition={{ duration: TICK_RATE/1000, ease: "linear" }}
                    >
                      <circle r="12" fill="#fff" stroke="#64748b" strokeWidth="3" />
                      <circle r="4" fill="#64748b" />
                      {/* HP Bar */}
                      <rect x="-15" y="-22" width="30" height="4" rx="2" fill="#e2e8f0" />
                      <rect x="-15" y="-22" width={Math.max(0, 30 * (e.hp / e.maxHp))} height="4" rx="2" fill="#10b981" />
                    </motion.g>
                  );
                })}
              </AnimatePresence>
            </svg>

            {/* Towers */}
            {state.towers.map((t, i) => {
              const mentor = MENTORS[t.type as keyof typeof MENTORS];
              const Icon = mentor.icon;
              return (
                <div 
                  key={i}
                  className="absolute flex items-center justify-center rounded-lg shadow-sm"
                  style={{
                    left: t.x * CELL_SIZE + 4,
                    top: t.y * CELL_SIZE + 4,
                    width: CELL_SIZE - 8,
                    height: CELL_SIZE - 8,
                    backgroundColor: mentor.color,
                    color: 'white'
                  }}
                >
                  <Icon size={20} />
                </div>
              );
            })}

            {/* Interactive Grid for placement */}
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)`, gridTemplateRows: `repeat(${GRID_H}, 1fr)`}}>
              {Array.from({ length: GRID_H }).map((_, y) => 
                Array.from({ length: GRID_W }).map((_, x) => {
                  const isPath = PATH_CELLS.has(`${x},${y}`);
                  const isOccupied = state.towers.some(t => t.x === x && t.y === y);
                  return (
                    <div 
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      onMouseEnter={(e) => {
                        if (selectedMentor && !isPath && !isOccupied) {
                          const svg = document.querySelector('svg');
                          const indicator = document.getElementById('range-indicator');
                          if (indicator) {
                            indicator.setAttribute('cx', String((x + 0.5) * CELL_SIZE));
                            indicator.setAttribute('cy', String((y + 0.5) * CELL_SIZE));
                            indicator.setAttribute('r', String(MENTORS[selectedMentor as keyof typeof MENTORS].range * CELL_SIZE));
                          }
                          e.currentTarget.classList.add('bg-black/5');
                        }
                      }}
                      onMouseLeave={(e) => {
                        const indicator = document.getElementById('range-indicator');
                        if (indicator) {
                          indicator.setAttribute('cx', "-1000");
                        }
                        e.currentTarget.classList.remove('bg-black/5');
                      }}
                      className={`cursor-pointer ${selectedMentor && !isPath && !isOccupied ? 'hover:bg-slate-200/50' : ''}`}
                    />
                  );
                })
              )}
            </div>

            {/* Game Over / Won Overlays */}
            {(state.gameOver || state.gameWon) && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
                  <h2 className={`text-3xl font-black mb-2 ${state.gameWon ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {state.gameWon ? 'Studio Secured!' : 'Pipeline Failed'}
                  </h2>
                  <p className="text-slate-600 mb-6">
                    {state.gameWon 
                      ? `You successfully mentored ${state.capacity} junior devs!` 
                      : `Too many uninstructed devs fell off the track. You mentored ${state.capacity} devs.`}
                  </p>
                  <button 
                    onClick={resetGame}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw size={20} />
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-10">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Wave {state.wave} / 15</h2>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                {state.spawnsLeft > 0 ? `${state.spawnsLeft} Incoming` : 'Clear'}
              </span>
            </div>
            <button 
              onClick={startWave}
              disabled={state.waveActive || state.gameOver || state.gameWon}
              className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                state.waveActive 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              }`}
            >
              <PlayCircle size={20} />
              {state.waveActive ? 'Wave in Progress' : 'Start Next Wave'}
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Available Mentors</h3>
            
            <div className="space-y-4">
              {Object.values(MENTORS).map((mentor) => {
                const isSelected = selectedMentor === mentor.id;
                const canAfford = state.money >= mentor.cost;
                const Icon = mentor.icon;
                
                return (
                  <div 
                    key={mentor.id}
                    onClick={() => canAfford && setSelectedMentor(isSelected ? null : mentor.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 shadow-md transform scale-[1.02]' 
                        : canAfford 
                          ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50' 
                          : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: mentor.color }}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{mentor.name}</h4>
                          <span className={`text-sm font-bold ${canAfford ? 'text-emerald-600' : 'text-rose-500'}`}>
                            ${mentor.cost}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-3">{mentor.desc}</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Range</div>
                        <div className="text-sm font-bold text-slate-700">{mentor.range}</div>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Transfer</div>
                        <div className="text-sm font-bold text-slate-700">{mentor.transfer}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 text-xs text-slate-500 flex gap-2">
            <Info size={16} className="shrink-0 text-slate-400" />
            <p>Select a mentor, then click on the grid to place them. Don't let uninstructed devs pass!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
