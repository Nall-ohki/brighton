import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, AlertTriangle, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import './App.css';

type Category = 'silhouette' | 'color' | 'texture' | 'detail';

interface Decision {
  id: string;
  category: Category;
  label: string;
  value: string;
}

const DECISIONS: Decision[] = [
  // Silhouettes
  { id: 's_brawny', category: 'silhouette', label: 'Brawny', value: 'brawny' },
  { id: 's_agile', category: 'silhouette', label: 'Agile', value: 'agile' },
  { id: 's_balanced', category: 'silhouette', label: 'Balanced', value: 'balanced' },
  { id: 's_lanky', category: 'silhouette', label: 'Lanky', value: 'lanky' },
  
  // Colors
  { id: 'c_crimson', category: 'color', label: 'Crimson', value: '#e63946' },
  { id: 'c_cobalt', category: 'color', label: 'Cobalt', value: '#1d3557' },
  { id: 'c_emerald', category: 'color', label: 'Emerald', value: '#2a9d8f' },
  { id: 'c_gold', category: 'color', label: 'Gold', value: '#e9c46a' },
  
  // Textures
  { id: 't_gritty', category: 'texture', label: 'Gritty', value: 'texture-gritty' },
  { id: 't_scaly', category: 'texture', label: 'Scaly', value: 'texture-scaly' },
  { id: 't_metallic', category: 'texture', label: 'Metallic', value: 'texture-metallic' },
  { id: 't_fleshy', category: 'texture', label: 'Fleshy', value: 'texture-fleshy' },
  
  // Details
  { id: 'd_eye', category: 'detail', label: 'Glowing Eye', value: 'glowing_eye' },
  { id: 'd_bandana', category: 'detail', label: 'Bandana', value: 'bandana' },
  { id: 'd_arm', category: 'detail', label: 'Mech Arm', value: 'mech_arm' },
  { id: 'd_spikes', category: 'detail', label: 'Spikes', value: 'spikes' },
];

const BRIEFS = [
  { id: 1, title: "Sci-Fi Smuggler", ip: "Star Traders", desc: "A rogue pilot navigating the outer rim. Needs to look fast and stealthy." },
  { id: 2, title: "Mystic Guardian", ip: "Elden Woods", desc: "An ancient protector of the sacred grove. Needs to look natural and ancient." },
  { id: 3, title: "Cyber Enforcer", ip: "Neon City", desc: "A heavy-hitting police unit in a dystopian metropolis. Needs to look intimidating and armored." },
  { id: 4, title: "Eldritch Cultist", ip: "Abyssal Depths", desc: "A summoner of the deep ones. Needs to look unhinged and fleshy." }
];

const CharacterCanvas = ({ activeIds }: { activeIds: string[] }) => {
  const activeDecisions = DECISIONS.filter(d => activeIds.includes(d.id));
  const silhouettes = activeDecisions.filter(d => d.category === 'silhouette');
  const colors = activeDecisions.filter(d => d.category === 'color');
  const textures = activeDecisions.filter(d => d.category === 'texture');
  const details = activeDecisions.filter(d => d.category === 'detail');
  
  let backgroundStyle: React.CSSProperties = {};
  if (colors.length === 0) {
    backgroundStyle = { backgroundColor: '#ddd' };
  } else if (colors.length === 1) {
    backgroundStyle = { backgroundColor: colors[0].value };
  } else {
    const colorStops = colors.map((c, i) => `${c.value} ${(i * 100) / colors.length}%, ${c.value} ${((i + 1) * 100) / colors.length}%`).join(', ');
    backgroundStyle = { background: `linear-gradient(135deg, ${colorStops})` };
  }

  const textureClasses = textures.map(t => t.value).join(' ');

  const getShapeStyle = (val: string): React.CSSProperties => {
    switch (val) {
      case 'brawny': return { borderRadius: '40px 40px 10px 10px', width: '180px', height: '180px', top: '100px' };
      case 'agile': return { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', width: '140px', height: '220px', top: '60px' };
      case 'balanced': return { borderRadius: '50%', width: '150px', height: '200px', top: '50px' };
      case 'lanky': return { borderRadius: '20px', width: '80px', height: '260px', top: '20px' };
      default: return {};
    }
  };

  return (
    <div className="relative w-[300px] h-[350px] sketch-border flex items-center justify-center overflow-hidden bg-white">
      {silhouettes.length === 0 && (
        <div className="text-gray-400 text-sm marker-font absolute z-10">Select a Silhouette</div>
      )}
      
      {silhouettes.map(s => (
        <motion.div
          key={s.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`absolute flex items-center justify-center mix-blend-multiply border-2 border-black ${textureClasses}`}
          style={{
            ...getShapeStyle(s.value),
            ...backgroundStyle,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }}
        />
      ))}

      {details.map(d => {
        if (d.value === 'glowing_eye') return <motion.div initial={{opacity:0}} animate={{opacity:1}} key={d.id} className="absolute w-4 h-4 bg-cyan-400 rounded-full top-[100px] z-20" style={{ boxShadow: '0 0 15px 5px cyan' }} />;
        if (d.value === 'bandana') return <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} key={d.id} className="absolute w-[120px] h-[30px] bg-red-500 top-[150px] z-20 rounded-md rotate-[-5deg] border-2 border-black" />;
        if (d.value === 'mech_arm') return <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} key={d.id} className="absolute w-[80px] h-[30px] bg-gray-500 top-[180px] right-[40px] z-10 rotate-[20deg] border-2 border-black" />;
        if (d.value === 'spikes') return (
           <motion.div initial={{opacity:0, scale:0}} animate={{opacity:1, scale:1}} key={d.id} className="absolute w-[160px] h-[20px] top-[40px] z-20 flex justify-around">
             <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[30px] border-b-black" />
             <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[30px] border-b-black" />
             <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[30px] border-b-black" />
           </motion.div>
        );
        return null;
      })}
    </div>
  );
};

const GAME_TIME = 120;

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [briefIndex, setBriefIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  
  const currentBrief = BRIEFS[briefIndex % BRIEFS.length];

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('result');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const toggleDecision = (id: string) => {
    setActiveIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const startGame = () => {
    setActiveIds([]);
    setTimeLeft(GAME_TIME);
    setGameState('playing');
  };

  const finishGame = () => {
    setGameState('result');
  };

  const nextBrief = () => {
    setBriefIndex(prev => prev + 1);
    setGameState('start');
  };
  
  const activeDecisions = DECISIONS.filter(d => activeIds.includes(d.id));
  const uniqueCategories = new Set(activeDecisions.map(d => d.category)).size;
  const totalDecisions = activeDecisions.length;
  const isOverComplex = totalDecisions > 4;
  
  let score = 0;
  if (gameState === 'result') {
    const baseScore = (uniqueCategories / 4) * 100;
    const penalty = isOverComplex ? (totalDecisions - 4) * 20 : 0;
    score = Math.max(0, baseScore - penalty);
  }

  const categories: Category[] = ['silhouette', 'color', 'texture', 'detail'];

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <AnimatePresence mode="wait">
        
        {gameState === 'start' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8 sketch-border bg-white text-center"
          >
            <h1 className="marker-font text-5xl mb-6 text-red-600 transform -rotate-2">80:20 Concept Art Challenge</h1>
            <p className="text-xl mb-6">
              The Pareto Principle states that 80% of the impact comes from 20% of your decisions.
            </p>
            <ul className="text-left space-y-3 mb-8 w-full max-w-md mx-auto text-lg">
              <li>⏱️ You have <strong>2 minutes</strong>.</li>
              <li>🎨 Choose <strong>ONE</strong> Silhouette, Color, Texture, and Detail.</li>
              <li>⚠️ Going over <strong>4 total decisions</strong> penalizes your score!</li>
            </ul>

            <div className="bg-yellow-50 p-4 border-2 border-dashed border-yellow-400 w-full mb-8 transform rotate-1">
              <h3 className="marker-font text-xl mb-1 text-gray-700">New Assignment</h3>
              <p className="font-bold text-2xl">{currentBrief.title}</p>
              <p className="text-sm italic text-gray-500 mb-2">Universe: {currentBrief.ip}</p>
              <p>{currentBrief.desc}</p>
            </div>

            <button onClick={startGame} className="sketch-button px-8 py-4 text-3xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 w-full max-w-md">
              <Play size={32} /> Start Challenge
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mx-auto p-4"
          >
            <div className="flex flex-col items-center gap-4 w-full md:w-1/2">
              <div className="w-full flex justify-between items-center bg-white sketch-border p-4">
                <div className={`text-3xl marker-font flex items-center gap-2 ${timeLeft <= 30 ? 'timer-urgent' : ''}`}>
                  <Clock size={32}/> 
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold mb-1">Complexity Meter ({totalDecisions}/4)</div>
                  <div className="flex gap-1 h-5 w-48 bg-gray-100 p-1 rounded-sm border border-gray-300">
                    {[1,2,3,4,5,6,7,8].map(i => (
                       <div key={i} className={`flex-1 rounded-sm ${i <= totalDecisions ? (i > 4 ? 'bg-red-500' : 'bg-green-500') : 'bg-transparent'}`} />
                    ))}
                  </div>
                  {isOverComplex && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-xs text-red-600 mt-1 flex items-center justify-end gap-1 font-bold"><AlertTriangle size={14}/> Penalty Active!</motion.div>}
                </div>
              </div>

              <CharacterCanvas activeIds={activeIds} />

              <button onClick={finishGame} className="w-[300px] sketch-button py-3 text-2xl mt-4 bg-green-100 hover:bg-green-200">
                Submit Concept
              </button>
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="sketch-border p-4 bg-white shadow-sm">
                <h2 className="marker-font text-2xl mb-1">Brief: {currentBrief.title}</h2>
                <p className="text-sm italic text-gray-500 mb-2">Universe: {currentBrief.ip}</p>
                <p className="text-lg">{currentBrief.desc}</p>
              </div>

              <div className="sketch-border p-6 bg-white flex-1 overflow-y-auto max-h-[60vh]">
                {categories.map(cat => (
                  <div key={cat} className="mb-6 last:mb-0">
                    <h3 className="marker-font text-xl capitalize mb-3 border-b-2 border-dashed border-gray-300 pb-1 text-gray-700">{cat}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {DECISIONS.filter(d => d.category === cat).map(d => {
                        const isActive = activeIds.includes(d.id);
                        return (
                          <button 
                            key={d.id} 
                            onClick={() => toggleDecision(d.id)}
                            className={`sketch-button p-3 text-md text-left flex justify-between items-center transition-colors ${isActive ? 'active bg-gray-900 text-white' : 'bg-gray-50'}`}
                          >
                            {d.label}
                            {isActive && <CheckCircle size={18} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-8 sketch-border bg-white text-center"
          >
            <h2 className="marker-font text-5xl mb-6">Concept Evaluation</h2>
            
            <div className="mb-8 transform scale-110">
              <CharacterCanvas activeIds={activeIds} />
            </div>

            <div className="w-full text-left mb-8 space-y-3 bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
              <div className="flex justify-between border-b border-gray-200 pb-3 text-lg">
                <span>Categories Hit:</span>
                <span className="marker-font text-2xl">{uniqueCategories} / 4</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3 text-lg">
                <span>Total Decisions:</span>
                <span className={`marker-font text-2xl ${totalDecisions > 4 ? 'text-red-500' : 'text-green-600'}`}>
                  {totalDecisions}
                </span>
              </div>
              <div className="flex justify-between pb-2 text-2xl font-bold mt-4 pt-2">
                <span>Impact / Effort Score:</span>
                <span className={`marker-font text-4xl ${score >= 100 ? 'text-green-600' : score < 50 ? 'text-red-600' : 'text-yellow-600'}`}>{score}%</span>
              </div>
            </div>

            <div className="text-2xl mb-10 font-bold px-4 py-3 bg-yellow-100 transform -rotate-1 border border-yellow-300 rounded-md shadow-sm">
              {score >= 100 ? "Masterful! You maximized impact with minimal effort. 🌟" :
               score >= 70 ? "Good work! But there's room to be more efficient. 👍" :
               score >= 40 ? "A bit messy. Remember the 80:20 rule! 🤔" :
               "Over-worked and muddled! Strip it back down to the essentials. 🛑"}
            </div>

            <button onClick={nextBrief} className="sketch-button px-10 py-4 text-3xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 w-full">
              Unlock Next Brief <ChevronRight size={32} />
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
