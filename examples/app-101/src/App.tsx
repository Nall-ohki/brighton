import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Scroll, Skull, Sparkles, Play, Square, Info } from 'lucide-react';
import './App.css';

type TokenType = 'Camp' | 'Note' | 'Ambush' | 'Shrine';

interface Token {
  id: string;
  type: TokenType;
  x: number;
  y: number;
}

interface SimEvent {
  id: string;
  text: string;
  x: number;
  y: number;
  timestamp: number;
  type: 'neutral' | 'combat' | 'lore';
  path?: { x1: number; y1: number; x2: number; y2: number };
}

const TOKEN_TYPES: { type: TokenType; icon: any; color: string; desc: string }[] = [
  { type: 'Camp', icon: Flag, color: '#3b82f6', desc: 'NPC Camp' }, // Blue
  { type: 'Note', icon: Scroll, color: '#eab308', desc: 'Hidden Note' }, // Yellow
  { type: 'Ambush', icon: Skull, color: '#ef4444', desc: 'Ambush' }, // Red
  { type: 'Shrine', icon: Sparkles, color: '#a855f7', desc: 'Lore Shrine' }, // Purple
];

const GRID_SIZE = 20;

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedType, setSelectedType] = useState<TokenType>('Camp');
  const [mode, setMode] = useState<'edit' | 'simulate'>('edit');
  const [events, setEvents] = useState<SimEvent[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Metrics
  const metrics = useMemo(() => {
    if (tokens.length < 2) return { systemic: 50, narrative: 10, density: 0 };

    let totalDist = 0;
    let pairs = 0;
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const dx = tokens[i].x - tokens[j].x;
        const dy = tokens[i].y - tokens[j].y;
        totalDist += Math.sqrt(dx * dx + dy * dy);
        pairs++;
      }
    }
    const avgDist = totalDist / pairs; // Usually between 0 and 100 on a 100x100 map
    
    // Density is inverse to average distance.
    const mapDiagonal = 141.4; // sqrt(100^2 + 100^2)
    const normalizedDist = Math.min(avgDist / (mapDiagonal * 0.5), 1); // 0 to 1

    // Clustered (low dist) -> High narrative, Low systemic
    // Sparse (high dist) -> Low narrative, High systemic
    // Balance is somewhere in the middle.
    
    const tokenCountFactor = Math.min(tokens.length / 10, 1); // peaks at 10 tokens

    let narrative = (1 - normalizedDist) * 100 * tokenCountFactor;
    let systemic = normalizedDist * 100 * tokenCountFactor;

    // Sweet spot bonus
    if (normalizedDist > 0.3 && normalizedDist < 0.7) {
      narrative += 20;
      systemic += 20;
    }

    return {
      systemic: Math.min(Math.max(systemic, 0), 100),
      narrative: Math.min(Math.max(narrative, 0), 100),
      density: 1 - normalizedDist
    };
  }, [tokens]);

  const handleMapClick = (e: React.MouseEvent) => {
    if (mode !== 'edit' || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTokens((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), type: selectedType, x, y },
    ]);
  };

  const handleRemoveToken = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (mode !== 'edit') return;
    setTokens((prev) => prev.filter((t) => t.id !== id));
  };

  // Simulation Logic
  useEffect(() => {
    if (mode !== 'simulate') {
      setEvents([]);
      return;
    }

    if (tokens.length < 2) return;

    const interval = setInterval(() => {
      // Pick two random tokens
      const t1 = tokens[Math.floor(Math.random() * tokens.length)];
      let t2 = tokens[Math.floor(Math.random() * tokens.length)];
      
      // Try to find a different token
      let attempts = 0;
      while (t1.id === t2.id && attempts < 5) {
        t2 = tokens[Math.floor(Math.random() * tokens.length)];
        attempts++;
      }

      if (t1.id === t2.id) return;

      const newEvent: SimEvent = {
        id: Math.random().toString(36).substr(2, 9),
        text: generateEventText(t1.type, t2.type),
        x: (t1.x + t2.x) / 2,
        y: (t1.y + t2.y) / 2,
        timestamp: Date.now(),
        type: determineEventType(t1.type, t2.type),
        path: { x1: t1.x, y1: t1.y, x2: t2.x, y2: t2.y }
      };

      setEvents((prev) => [...prev.slice(-4), newEvent]); // Keep last 5 events
    }, 2500);

    return () => clearInterval(interval);
  }, [mode, tokens]);

  const generateEventText = (t1: TokenType, t2: TokenType) => {
    const combos = [
      { types: ['Camp', 'Ambush'], text: 'NPC patrol intercepted by bandits!' },
      { types: ['Camp', 'Note'], text: 'NPCs discover an ancient map.' },
      { types: ['Camp', 'Shrine'], text: 'Pilgrims arrive at the shrine.' },
      { types: ['Ambush', 'Note'], text: 'Scavengers fight over lost intel.' },
      { types: ['Ambush', 'Shrine'], text: 'Cultists defend their sacred ground.' },
      { types: ['Note', 'Shrine'], text: 'A hidden mechanism activates...' },
    ];

    const match = combos.find(
      (c) => c.types.includes(t1) && c.types.includes(t2)
    );

    if (match) return match.text;
    return `Travelers move between ${t1} and ${t2}.`;
  };

  const determineEventType = (t1: TokenType, t2: TokenType) => {
    if (t1 === 'Ambush' || t2 === 'Ambush') return 'combat';
    if (t1 === 'Shrine' || t2 === 'Shrine') return 'lore';
    return 'neutral';
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-cyan-50 font-mono overflow-hidden flex flex-col md:flex-row relative holographic-bg">
      {/* Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20"></div>

      {/* Sidebar */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-cyan-500/30 bg-slate-900/80 backdrop-blur-md p-6 flex flex-col gap-6 z-10 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
        <div className="flex items-center gap-3 mb-2 border-b border-cyan-500/30 pb-4">
          <div className="p-2 bg-cyan-950 rounded-lg border border-cyan-400">
            <Info size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-cyan-300">NEXUS DESIGNER</h1>
            <div className="text-xs text-cyan-600 uppercase tracking-widest">Encounter Matrix V1.4</div>
          </div>
        </div>

        {/* Meters */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-cyan-500 uppercase tracking-wider mb-2">Metrics Analysis</h2>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-200">Systemic Feel</span>
              <span className="text-cyan-400">{Math.round(metrics.systemic)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-cyan-900">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.systemic}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] text-cyan-600 leading-tight">Emergent interactions between distant nodes.</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-200">Narrative Richness</span>
              <span className="text-cyan-400">{Math.round(metrics.narrative)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-cyan-900">
              <motion.div 
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.narrative}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] text-cyan-600 leading-tight">Density of authored, local storytelling.</p>
          </div>
          
          <div className="mt-2 text-xs p-2 bg-cyan-950/50 rounded border border-cyan-800/50">
            Status: {tokens.length < 2 ? 'Awaiting Data' : (metrics.systemic > 60 && metrics.narrative > 60) ? 'Optimal Balance' : (metrics.density > 0.7 ? 'Too Clustered' : 'Too Sparse')}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setMode('edit')}
            className={`flex-1 py-2 px-4 rounded flex items-center justify-center gap-2 text-sm transition-all duration-300 ${
              mode === 'edit'
                ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.6)] border border-cyan-400'
                : 'bg-slate-800 text-cyan-600 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Square size={16} />
            AUTHOR
          </button>
          <button
            onClick={() => setMode('simulate')}
            disabled={tokens.length < 2}
            className={`flex-1 py-2 px-4 rounded flex items-center justify-center gap-2 text-sm transition-all duration-300 ${
              mode === 'simulate'
                ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.6)] border border-emerald-400'
                : 'bg-slate-800 text-emerald-600 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Play size={16} />
            SIMULATE
          </button>
        </div>

        {/* Token Selector */}
        <AnimatePresence>
          {mode === 'edit' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 mt-4"
            >
              <h2 className="text-sm font-semibold text-cyan-500 uppercase tracking-wider">Select Payload</h2>
              <div className="grid grid-cols-2 gap-2">
                {TOKEN_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.type}
                      onClick={() => setSelectedType(t.type)}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 flex flex-col gap-2 ${
                        selectedType === t.type
                          ? 'bg-slate-800 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                          : 'bg-slate-900 border-slate-700 hover:border-cyan-700'
                      }`}
                    >
                      <Icon size={20} color={t.color} />
                      <span className="text-xs font-medium text-slate-300">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-cyan-600/80 mt-2 italic">Click on map grid to deploy token.</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {mode === 'simulate' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto pr-2 mt-4 space-y-2 custom-scrollbar"
          >
            <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-3">Event Log</h2>
            {events.length === 0 && (
              <div className="text-xs text-slate-500 italic">Initializing simulation vectors...</div>
            )}
            <AnimatePresence>
              {[...events].reverse().map((ev) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded text-xs border-l-2 ${
                    ev.type === 'combat' ? 'bg-red-950/30 border-red-500 text-red-200' :
                    ev.type === 'lore' ? 'bg-purple-950/30 border-purple-500 text-purple-200' :
                    'bg-cyan-950/30 border-cyan-500 text-cyan-200'
                  }`}
                >
                  <div className="opacity-50 text-[10px] mb-1">T-{(Date.now() - ev.timestamp)}ms</div>
                  {ev.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative p-4 md:p-8 flex items-center justify-center">
        <div 
          ref={mapRef}
          onClick={handleMapClick}
          className={`w-full max-w-3xl aspect-square relative holographic-grid border-2 border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-colors duration-500 ${
            mode === 'edit' ? 'cursor-crosshair' : 'cursor-default border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
          }`}
        >
          {/* Topographic contours (svg decorative) */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
             <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M 10 90 Q 30 20 60 40 T 100 10 M 0 60 Q 40 80 80 50 T 100 80" stroke="#06b6d4" strokeWidth="0.5" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M 20 100 Q 50 40 70 60 T 100 30" stroke="#06b6d4" strokeWidth="0.2" fill="none" vectorEffect="non-scaling-stroke" />
            {/* Base grid lines inside SVG for crispness */}
            {Array.from({length: 10}).map((_, i) => (
              <React.Fragment key={i}>
                <line x1={`${i*10}%`} y1="0" x2={`${i*10}%`} y2="100%" stroke="#0891b2" strokeWidth="0.5" opacity="0.3" />
                <line x1="0" y1={`${i*10}%`} x2="100%" y2={`${i*10}%`} stroke="#0891b2" strokeWidth="0.5" opacity="0.3" />
              </React.Fragment>
            ))}
          </svg>

          {/* Tokens */}
          <AnimatePresence>
            {tokens.map((token) => {
              const meta = TOKEN_TYPES.find(t => t.type === token.type)!;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={token.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                  style={{ left: `${token.x}%`, top: `${token.y}%` }}
                >
                  <div 
                    className={`relative p-2 rounded-full border bg-slate-900/80 backdrop-blur hover:bg-slate-800 transition-colors cursor-pointer`}
                    style={{ borderColor: meta.color, boxShadow: `0 0 10px ${meta.color}40` }}
                    onClick={(e) => handleRemoveToken(e, token.id)}
                  >
                    <Icon size={18} color={meta.color} />
                    
                    {/* Ripple effect */}
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: meta.color }}></div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-900/90 border border-slate-700 text-[10px] text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                    {meta.desc}
                    {mode === 'edit' && <span className="block text-red-400 mt-1">Click to remove</span>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Simulated Event Lines */}
          <AnimatePresence>
            {events.map((ev) => ev.path && (
              <motion.svg
                key={`line-${ev.id}`}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 1 } }}
              >
                <motion.line
                  x1={`${ev.path.x1}%`}
                  y1={`${ev.path.y1}%`}
                  x2={`${ev.path.x2}%`}
                  y2={`${ev.path.y2}%`}
                  stroke={ev.type === 'combat' ? '#ef4444' : ev.type === 'lore' ? '#a855f7' : '#10b981'}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <motion.circle
                  cx={`${ev.x}%`}
                  cy={`${ev.y}%`}
                  r="4"
                  fill={ev.type === 'combat' ? '#ef4444' : ev.type === 'lore' ? '#a855f7' : '#10b981'}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, times: [0, 0.2, 1] }}
                />
              </motion.svg>
            ))}
          </AnimatePresence>

          {/* Map Overlay Text */}
          <div className="absolute bottom-4 right-4 text-[10px] text-cyan-700 font-mono text-right pointer-events-none">
            LAT: 45.912 <br/>
            LNG: -12.441 <br/>
            SEC: ALPHA-9
          </div>
        </div>
      </div>
    </div>
  );
}
