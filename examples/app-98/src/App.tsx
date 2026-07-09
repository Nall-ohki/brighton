import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, RotateCcw, MonitorPlay, Zap, ArrowRight, Star } from 'lucide-react';
import './App.css';

type Decade = '2000s' | '2010s' | '2020s';

type Tech = {
  id: string;
  name: string;
  decade: Decade;
  description: string;
  icon: React.ReactNode;
};

const TECHNOLOGIES: Tech[] = [
  {
    id: 'shaders',
    name: 'Programmable Shaders',
    decade: '2000s',
    description: 'Gave developers unprecedented control over rendering, paving the way for advanced lighting, shadows, and post-processing effects.',
    icon: <MonitorPlay className="w-8 h-8" />
  },
  {
    id: 'physics',
    name: 'Hardware Physics',
    decade: '2000s',
    description: 'Dedicated physics engines (like Havok) allowed for destructible environments, realistic ragdolls, and complex simulations.',
    icon: <Zap className="w-8 h-8" />
  },
  {
    id: 'pbr',
    name: 'Physically Based Rendering',
    decade: '2010s',
    description: 'Standardized how light interacts with materials, creating consistent and highly realistic textures across different environments.',
    icon: <Sparkles className="w-8 h-8" />
  },
  {
    id: 'raytracing',
    name: 'Real-time Ray Tracing',
    decade: '2010s',
    description: 'Brought cinematic, physically accurate lighting, reflections, and global illumination to consumer hardware.',
    icon: <Zap className="w-8 h-8" />
  },
  {
    id: 'neural',
    name: 'Neural Rendering (DLSS)',
    decade: '2020s',
    description: 'AI-driven upscaling and frame generation decoupled visual fidelity from native rendering resolution.',
    icon: <MonitorPlay className="w-8 h-8" />
  },
  {
    id: 'haptics',
    name: 'Advanced Haptics',
    decade: '2020s',
    description: 'High-fidelity localized vibrations and adaptive triggers vastly increased tactile immersion for players.',
    icon: <Sparkles className="w-8 h-8" />
  }
];

const EMERGING_TECH = [
  { id: 'e1', name: 'AI-driven Dynamic NPCs', isReal: true },
  { id: 'e2', name: 'Path Tracing on Mobile', isReal: true },
  { id: 'e3', name: 'Smell-o-Vision 2.0', isReal: false },
  { id: 'e4', name: 'Real-time Generative 3D Assets', isReal: true },
  { id: 'e5', name: 'CRT Monitor Revival', isReal: false },
  { id: 'e6', name: 'Full Cloud-native Simulations', isReal: true },
];

type GameState = 'INTRO' | 'PLAYING' | 'TOOLTIP' | 'EMERGING_INTRO' | 'EMERGING' | 'OUTRO';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [currentTechIndex, setCurrentTechIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [placedTech, setPlacedTech] = useState<Record<Decade, Tech[]>>({ '2000s': [], '2010s': [], '2020s': [] });
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  // Emerging state
  const [selectedEmerging, setSelectedEmerging] = useState<string[]>([]);
  const [emergingScore, setEmergingScore] = useState(0);

  const dropZoneRefs = {
    '2000s': useRef<HTMLDivElement>(null),
    '2010s': useRef<HTMLDivElement>(null),
    '2020s': useRef<HTMLDivElement>(null),
  };

  const currentTech = TECHNOLOGIES[currentTechIndex];

  const handleStart = () => {
    setGameState('PLAYING');
    // Shuffle technologies if desired, but we keep fixed for now
  };

  const handleDragEnd = (event: any, info: any) => {
    if (!currentTech) return;

    let droppedDecade: Decade | null = null;
    
    // Check intersection with drop zones
    (Object.keys(dropZoneRefs) as Decade[]).forEach(decade => {
      const ref = dropZoneRefs[decade].current;
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (
          info.point.x >= rect.left &&
          info.point.x <= rect.right &&
          info.point.y >= rect.top &&
          info.point.y <= rect.bottom
        ) {
          droppedDecade = decade;
        }
      }
    });

    if (droppedDecade) {
      if (droppedDecade === currentTech.decade) {
        // Correct
        setFeedback('correct');
        setScore(s => s + 100);
        setPlacedTech(prev => ({
          ...prev,
          [droppedDecade as Decade]: [...prev[droppedDecade as Decade], currentTech]
        }));
        setTimeout(() => {
          setFeedback(null);
          setGameState('TOOLTIP');
        }, 1000);
      } else {
        // Incorrect
        setFeedback('incorrect');
        setScore(s => Math.max(0, s - 50));
        setTimeout(() => setFeedback(null), 1000);
      }
    }
  };

  const nextTech = () => {
    if (currentTechIndex < TECHNOLOGIES.length - 1) {
      setCurrentTechIndex(i => i + 1);
      setGameState('PLAYING');
    } else {
      setGameState('EMERGING_INTRO');
    }
  };

  const toggleEmerging = (id: string) => {
    if (selectedEmerging.includes(id)) {
      setSelectedEmerging(prev => prev.filter(x => x !== id));
    } else {
      if (selectedEmerging.length < 3) {
        setSelectedEmerging(prev => [...prev, id]);
      }
    }
  };

  const submitEmerging = () => {
    let points = 0;
    selectedEmerging.forEach(id => {
      const tech = EMERGING_TECH.find(t => t.id === id);
      if (tech?.isReal) points += 200;
      else points -= 100;
    });
    setEmergingScore(points);
    setScore(s => s + points);
    setGameState('OUTRO');
  };

  const restart = () => {
    setGameState('INTRO');
    setCurrentTechIndex(0);
    setScore(0);
    setPlacedTech({ '2000s': [], '2010s': [], '2020s': [] });
    setFeedback(null);
    setSelectedEmerging([]);
    setEmergingScore(0);
  };

  return (
    <div className="min-h-screen bg-[#1a110a] flex items-center justify-center p-8 font-sans selection:bg-amber-500/30">
      {/* Outer wrapper for perspective */}
      <div className="tv-container-outer w-full max-w-5xl">
        {/* The Physical TV */}
        <div className="tv-body">
          {/* Left Speaker */}
          <div className="tv-speaker hidden md:block"></div>

          {/* Screen Area */}
          <div className="flex-1 tv-screen crt-flicker flex flex-col relative text-white">
            <div className="scanlines"></div>
            <div className="vignette"></div>

            {/* Top Bar / Header */}
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 bg-gradient-to-b from-black/80 to-transparent">
              <h1 className="text-xl font-black tracking-widest text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                TECH-EVO SHOW
              </h1>
              <div className="text-xl font-mono text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]">
                SCORE: {score.toString().padStart(4, '0')}
              </div>
            </header>

            {/* Game Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-8 pt-16 z-20 relative h-[600px] overflow-hidden">
              <AnimatePresence mode="wait">
                {gameState === 'INTRO' && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="mx-auto w-32 h-32 mb-8 relative flex items-center justify-center"
                    >
                      <div className="absolute inset-0 border-8 border-amber-500 border-dashed rounded-full opacity-50"></div>
                      <div className="absolute inset-2 border-4 border-cyan-400 border-dotted rounded-full"></div>
                      <Star className="w-12 h-12 text-pink-500" />
                    </motion.div>
                    <h2 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 drop-shadow-lg uppercase tracking-tighter">
                      Stay Ahead of the Curve
                    </h2>
                    <p className="text-xl text-amber-100 mb-8 max-w-lg mx-auto">
                      Test your knowledge of game technology evolution over the last 20 years. Drag the trends to their correct decade!
                    </p>
                    <button
                      onClick={handleStart}
                      className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xl rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-transform hover:scale-105 active:scale-95"
                    >
                      START THE SHOW
                    </button>
                  </motion.div>
                )}

                {(gameState === 'PLAYING' || gameState === 'TOOLTIP') && (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col"
                  >
                    {/* The Timelines */}
                    <div className="flex-1 grid grid-cols-3 gap-4 mb-8 relative">
                      {(Object.keys(dropZoneRefs) as Decade[]).map((decade) => (
                        <div
                          key={decade}
                          ref={dropZoneRefs[decade]}
                          className="border-2 border-dashed border-white/20 rounded-xl bg-white/5 relative flex flex-col items-center p-4"
                        >
                          <div className="text-2xl font-black text-amber-400 mb-4 tracking-widest">{decade}</div>
                          <div className="flex-1 w-full flex flex-col gap-2">
                            {placedTech[decade].map(t => (
                              <div key={t.id} className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 p-2 rounded border border-indigo-400/50 text-sm font-semibold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                {t.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* The Card to Drag */}
                    <div className="h-48 flex items-center justify-center relative">
                      {gameState === 'PLAYING' && currentTech && (
                        <motion.div
                          key={currentTech.id}
                          drag
                          dragSnapToOrigin={feedback !== 'correct'}
                          onDragEnd={handleDragEnd}
                          initial={{ scale: 0, y: 50 }}
                          animate={{ 
                            scale: 1, y: 0,
                            x: feedback === 'incorrect' ? [-10, 10, -10, 10, 0] : 0
                          }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20,
                            x: { duration: 0.4 }
                          }}
                          className={`
                            cursor-grab active:cursor-grabbing w-64 p-6 rounded-2xl shadow-2xl relative z-40
                            bg-gradient-to-br from-slate-800 to-slate-900 border-2
                            ${feedback === 'correct' ? 'border-green-500' : feedback === 'incorrect' ? 'border-red-500' : 'border-amber-500/50'}
                          `}
                        >
                          <div className="flex justify-center mb-4 text-amber-400">
                            {currentTech.icon}
                          </div>
                          <h3 className="text-xl font-bold text-center mb-2">{currentTech.name}</h3>
                          <p className="text-xs text-center text-slate-400">Drag to correct decade</p>
                          
                          {feedback === 'incorrect' && (
                            <div className="absolute inset-0 bg-red-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                              <XCircle className="w-12 h-12 text-red-500" />
                            </div>
                          )}
                        </motion.div>
                      )}

                      {gameState === 'TOOLTIP' && currentTech && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="absolute inset-0 bg-gradient-to-b from-indigo-900/90 to-black/90 backdrop-blur-md rounded-2xl border border-indigo-500 p-8 flex flex-col items-center justify-center z-50 text-center"
                        >
                          <Sparkles className="w-12 h-12 text-amber-400 mb-4" />
                          <h3 className="text-2xl font-bold mb-2 text-white">Correct!</h3>
                          <p className="text-indigo-200 mb-6 max-w-md">
                            {currentTech.description}
                          </p>
                          <button
                            onClick={nextTech}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full font-bold transition-colors"
                          >
                            Next Trend <ArrowRight className="w-5 h-5" />
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {gameState === 'EMERGING_INTRO' && (
                  <motion.div
                    key="emerging-intro"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-2xl"
                  >
                    <Zap className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                    <h2 className="text-4xl font-black mb-4 text-amber-400">The Future is Here</h2>
                    <p className="text-xl text-slate-300 mb-8">
                      You've mastered the past. Now, let's look to 2026+. Select the <strong>top 3</strong> technologies you predict will truly matter and redefine gaming in the coming years.
                    </p>
                    <button
                      onClick={() => setGameState('EMERGING')}
                      className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                    >
                      ENTER BONUS ROUND
                    </button>
                  </motion.div>
                )}

                {gameState === 'EMERGING' && (
                  <motion.div
                    key="emerging"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full flex flex-col items-center"
                  >
                    <h2 className="text-2xl font-bold text-amber-400 mb-2">Select 3 Predictions</h2>
                    <p className="text-slate-400 mb-8">Choose wisely to earn bonus points.</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                      {EMERGING_TECH.map(tech => {
                        const isSelected = selectedEmerging.includes(tech.id);
                        return (
                          <motion.button
                            key={tech.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleEmerging(tech.id)}
                            className={`
                              p-4 rounded-xl border-2 text-left transition-all
                              ${isSelected 
                                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                              }
                              ${selectedEmerging.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{tech.name}</span>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <button
                      disabled={selectedEmerging.length !== 3}
                      onClick={submitEmerging}
                      className="px-8 py-4 bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 hover:bg-amber-400 text-black font-black text-xl rounded-full transition-colors"
                    >
                      SUBMIT PREDICTIONS
                    </button>
                  </motion.div>
                )}

                {gameState === 'OUTRO' && (
                  <motion.div
                    key="outro"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <h2 className="text-5xl font-black mb-2 text-amber-400">SHOW OVER!</h2>
                    <div className="text-6xl font-mono text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)] mb-8">
                      {score} PTS
                    </div>
                    
                    <div className="bg-white/10 border border-white/20 p-6 rounded-2xl mb-8 max-w-md mx-auto">
                      <h3 className="text-xl font-bold mb-4 text-cyan-400">Bonus Round Results</h3>
                      <div className="text-sm text-slate-300 mb-2">
                        You earned {emergingScore > 0 ? '+' : ''}{emergingScore} points from predictions!
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {selectedEmerging.map(id => {
                          const tech = EMERGING_TECH.find(t => t.id === id);
                          return (
                            <span key={id} className={`px-2 py-1 rounded text-xs font-bold ${tech?.isReal ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                              {tech?.name} {tech?.isReal ? '✓' : '✗'}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={restart}
                      className="flex items-center gap-2 mx-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" /> Play Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>

          {/* Right Controls */}
          <div className="w-24 bg-[#2a1a0f] rounded-xl flex flex-col items-center py-8 gap-8 border-l-2 border-black/50 shadow-inner">
            <div className="tv-dial"></div>
            <div className="tv-dial" style={{ transform: 'rotate(45deg)' }}></div>
            
            <div className="flex-1"></div>
            
            <div className="flex flex-col gap-4">
              <div className="w-8 h-4 bg-red-600 rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
              <div className="w-8 h-4 bg-blue-600 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
