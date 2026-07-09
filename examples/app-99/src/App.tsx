import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, ChevronRight, Star, AlertCircle, History, Award } from 'lucide-react';

// --- Types ---
type EmotionTag = 'Weary Veteran' | 'Cocky Rogue' | 'Terrified Civilian' | 'Analytical Cyborg' | 'Unhinged Pyromancer';

interface Script {
  id: number;
  text: string;
  tag: EmotionTag;
  context: string;
}

interface Score {
  clarity: number;
  emotion: number;
  characterFit: number;
  overall: number;
}

interface Take {
  attemptId: number;
  playerInput: string;
  score: Score;
  performedLine: string;
}

const SCRIPTS: Script[] = [
  {
    id: 1,
    text: "Commander, the enemy is at the gates!",
    tag: "Weary Veteran",
    context: "You've been fighting for three days straight. You're exhausted but still dutiful."
  },
  {
    id: 2,
    text: "Well, aren't you a sight for sore eyes.",
    tag: "Cocky Rogue",
    context: "You just casually dropped into a tense situation and want to disarm the tension with charm."
  },
  {
    id: 3,
    text: "Please, don't leave me here! I can't find my family!",
    tag: "Terrified Civilian",
    context: "The city is crumbling around you. Complete panic."
  }
];

const MAX_TAKES = 3;

// --- Helper functions ---

// Generate a procedurally varied version of the line based on input length and random factors
const generatePerformance = (baseLine: string, input: string, tag: EmotionTag): string => {
  const words = baseLine.split(' ');
  const variationType = (input.length + Math.floor(Math.random() * 10)) % 4;
  
  if (tag === 'Terrified Civilian' || variationType === 0) {
    // Add stutters
    return words.map(w => Math.random() > 0.7 ? `${w[0]}-${w}` : w).join(' ');
  } else if (tag === 'Unhinged Pyromancer' || variationType === 1) {
    // Add ALL CAPS
    return words.map(w => Math.random() > 0.5 ? w.toUpperCase() : w).join(' ');
  } else if (tag === 'Weary Veteran' || variationType === 2) {
    // Add pauses
    return words.map(w => Math.random() > 0.6 ? `${w}...` : w).join(' ');
  } else {
    // Add emphasis
    return words.map(w => Math.random() > 0.7 ? `*${w}*` : w).join(' ');
  }
};

const calculateScore = (input: string): Score => {
  // Mock scoring logic, slightly influenced by input length to reward effort
  const baseRandom = () => Math.floor(Math.random() * 40) + 40; // 40-80 base
  const effortBonus = Math.min(20, Math.floor(input.length / 5));
  
  const clarity = Math.min(100, baseRandom() + effortBonus + (Math.random() > 0.5 ? 10 : 0));
  const emotion = Math.min(100, baseRandom() + effortBonus + (Math.random() > 0.5 ? 15 : 0));
  const characterFit = Math.min(100, baseRandom() + effortBonus);
  
  return {
    clarity,
    emotion,
    characterFit,
    overall: Math.floor((clarity + emotion + characterFit) / 3)
  };
};

export default function App() {
  const [currentScriptIdx, setCurrentScriptIdx] = useState(0);
  const [takes, setTakes] = useState<Take[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  
  const [gameState, setGameState] = useState<'reading' | 'performing' | 'reviewing' | 'finished'>('reading');
  const [currentPerformanceText, setCurrentPerformanceText] = useState('');
  
  const currentScript = SCRIPTS[currentScriptIdx];
  const takesLeft = MAX_TAKES - takes.length;
  
  const handlePerform = () => {
    if (!playerInput.trim()) return;
    
    setGameState('performing');
    
    const performedLine = generatePerformance(currentScript.text, playerInput, currentScript.tag);
    setCurrentPerformanceText('');
    
    // Animate text appearance
    const words = performedLine.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      setCurrentPerformanceText(prev => prev + (i === 0 ? '' : ' ') + words[i]);
      i++;
      if (i === words.length) {
        clearInterval(interval);
        setTimeout(() => {
          finishPerformance(performedLine);
        }, 1000);
      }
    }, 150); // Speed of words
  };
  
  const finishPerformance = (performedLine: string) => {
    const newScore = calculateScore(playerInput);
    const newTake: Take = {
      attemptId: takes.length + 1,
      playerInput,
      score: newScore,
      performedLine
    };
    
    setTakes(prev => [...prev, newTake]);
    setGameState('reviewing');
  };
  
  const handleNextAction = () => {
    if (takes.length >= MAX_TAKES) {
      if (currentScriptIdx < SCRIPTS.length - 1) {
        // Move to next script
        setCurrentScriptIdx(prev => prev + 1);
        setTakes([]);
        setPlayerInput('');
        setGameState('reading');
      } else {
        // Finished game
        setGameState('finished');
      }
    } else {
      // Try another take
      setPlayerInput('');
      setGameState('reading');
    }
  };

  const skipToNextScript = () => {
    if (currentScriptIdx < SCRIPTS.length - 1) {
      setCurrentScriptIdx(prev => prev + 1);
      setTakes([]);
      setPlayerInput('');
      setGameState('reading');
    } else {
      setGameState('finished');
    }
  };
  
  const bestTake = takes.length > 0 ? [...takes].sort((a, b) => b.score.overall - a.score.overall)[0] : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background retro elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900"></div>
      </div>
      
      {/* On Air Sign */}
      <div className="absolute top-8 right-8 z-10 flex items-center gap-4">
        <div className={`px-4 py-2 rounded-md border-2 font-bold tracking-widest uppercase transition-colors duration-300 ${
          gameState === 'performing' 
            ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]' 
            : 'border-slate-700 text-slate-700'
        }`}>
          On Air
        </div>
      </div>

      <div className="max-w-4xl w-full z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Booth & Character */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-800 border-4 border-slate-700 rounded-xl p-4 shadow-2xl relative flex flex-col h-64 justify-end items-center overflow-hidden">
            {/* Soundproofing foam background */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle, #475569 2px, transparent 2px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* Animated Character Avatar */}
            <motion.div 
              animate={
                gameState === 'performing' 
                  ? { y: [0, -10, 0], scale: [1, 1.05, 1] } 
                  : { y: 0, scale: 1 }
              }
              transition={{ repeat: gameState === 'performing' ? Infinity : 0, duration: 0.5 }}
              className="w-32 h-32 bg-indigo-500 rounded-full border-4 border-slate-600 shadow-xl mb-4 relative flex items-center justify-center overflow-hidden"
            >
              <div className="absolute w-24 h-24 bg-indigo-400 rounded-full opacity-50 blur-md"></div>
              {/* Simple generic face */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex gap-4">
                  <div className="w-3 h-4 bg-slate-900 rounded-full"></div>
                  <div className="w-3 h-4 bg-slate-900 rounded-full"></div>
                </div>
                <motion.div 
                  animate={gameState === 'performing' ? { height: ['4px', '20px', '4px'] } : { height: '4px' }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="w-8 bg-slate-900 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
            
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest z-10">
              Booth 04
            </div>
          </div>
          
          {/* NPC Casting Director */}
          <div className="bg-slate-800 border-4 border-amber-900/50 rounded-xl p-4 shadow-xl">
            <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2 border-b border-slate-700 pb-2">
              <History size={18} /> Director's Notes
            </h3>
            <div className="text-sm text-slate-300 min-h-[100px] italic">
              {gameState === 'reading' && "Let's hear it. Give me something authentic. Remember the emotion tag."}
              {gameState === 'performing' && "..."}
              {gameState === 'reviewing' && (
                bestTake?.attemptId === takes[takes.length-1].attemptId 
                  ? "That was your best one yet. Solid energy." 
                  : "Not quite. Check the feedback and try again. Don't force it."
              )}
              {gameState === 'finished' && "Great session. We'll let your agent know."}
            </div>
          </div>
        </div>
        
        {/* Right Column: Script, Input, Scoring */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {gameState !== 'finished' ? (
            <>
              {/* Script Header */}
              <div className="bg-slate-800 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-1 block">Script {currentScriptIdx + 1} / {SCRIPTS.length}</span>
                    <span className="inline-flex items-center gap-1 bg-indigo-900/50 text-indigo-300 text-xs px-2 py-1 rounded-md border border-indigo-700/50">
                      <AlertCircle size={14} /> {currentScript.tag}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block mb-1">Takes Remaining</span>
                    <div className="flex gap-1 justify-end">
                      {Array.from({ length: MAX_TAKES }).map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < takesLeft ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 mb-2 italic">Context: {currentScript.context}</p>
                <div className="text-2xl font-bold text-white mb-2 font-serif border-y border-slate-700 py-4 bg-slate-900/30 px-4 rounded-md">
                  "{currentScript.text}"
                </div>
              </div>

              {/* Interaction Area */}
              <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 relative min-h-[300px] flex flex-col">
                
                <AnimatePresence mode="wait">
                  {gameState === 'reading' && (
                    <motion.div 
                      key="reading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex-1 flex flex-col"
                    >
                      <label className="text-sm text-slate-400 mb-2 block">
                        Your delivery notes / interpretation:
                      </label>
                      <textarea 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none flex-1 mb-4"
                        placeholder="e.g. Start slow, breathy, then build up to a desperate shout on the last word..."
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                      />
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={handlePerform}
                          disabled={!playerInput.trim()}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                        >
                          <Mic size={20} /> Perform Take {takes.length + 1}
                        </button>
                        
                        <button 
                          onClick={skipToNextScript}
                          className="text-slate-400 hover:text-white text-sm"
                        >
                          Skip Script
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {gameState === 'performing' && (
                    <motion.div 
                      key="performing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center text-center p-8"
                    >
                      <Mic className="text-emerald-500 mb-6 animate-pulse" size={48} />
                      <p className="text-2xl text-emerald-400 font-serif italic">
                        "{currentPerformanceText}"
                      </p>
                    </motion.div>
                  )}

                  {gameState === 'reviewing' && (
                    <motion.div 
                      key="reviewing"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col"
                    >
                      <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Take {takes.length} Review</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Current Take Score */}
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <h4 className="text-sm text-slate-400 mb-3 uppercase tracking-wider">Scorecard</h4>
                          
                          <div className="space-y-3">
                            <ScoreBar label="Clarity" value={takes[takes.length-1].score.clarity} />
                            <ScoreBar label="Emotion" value={takes[takes.length-1].score.emotion} />
                            <ScoreBar label="Char. Fit" value={takes[takes.length-1].score.characterFit} />
                            
                            <div className="pt-2 mt-2 border-t border-slate-700 flex justify-between items-center">
                              <span className="font-bold">Overall Rating:</span>
                              <span className={`text-xl font-bold ${takes[takes.length-1].score.overall > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {takes[takes.length-1].score.overall}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Best Take Recap */}
                        <div className="bg-slate-900 p-4 rounded-lg border border-indigo-900/50">
                          <h4 className="text-sm text-indigo-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <Award size={16} /> Best Take 
                            {bestTake?.attemptId === takes[takes.length-1].attemptId && 
                              <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full ml-auto">New Best!</span>
                            }
                          </h4>
                          
                          {bestTake && (
                            <div className="text-center py-4">
                              <div className="text-4xl font-bold text-white mb-2">{bestTake.score.overall}</div>
                              <div className="text-xs text-slate-400 uppercase tracking-widest">Score (Take {bestTake.attemptId})</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex justify-end border-t border-slate-700">
                        <button 
                          onClick={handleNextAction}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                        >
                          {takes.length >= MAX_TAKES ? 'Submit Final Take & Continue' : 'Record Another Take'} <ChevronRight size={20} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-xl p-8 shadow-2xl border-2 border-emerald-500 text-center h-full flex flex-col items-center justify-center"
            >
              <Award className="text-emerald-500 mb-6" size={64} />
              <h2 className="text-3xl font-bold text-white mb-4">Audition Complete</h2>
              <p className="text-slate-300 mb-8 max-w-md">
                You've completed all the script reads. Your agent will compile your best takes and send them off to the casting directors. Keep an ear out for a callback!
              </p>
              <button 
                onClick={() => {
                  setCurrentScriptIdx(0);
                  setTakes([]);
                  setGameState('reading');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold transition-colors"
              >
                Start New Audition Session
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

// Simple internal component for progress bars
function ScoreBar({ label, value }: { label: string, value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value}/100</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`h-2 rounded-full ${
            value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500'
          }`}
        ></motion.div>
      </div>
    </div>
  );
}
