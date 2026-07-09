import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, PenTool, Bug, Coffee, Brain, XCircle, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

const COLOR_MAP: Record<string, { bg: string, active: string, shadow: string, text: string }> = {
  blue: { bg: 'bg-blue-400', active: 'bg-blue-500', shadow: 'bg-blue-600', text: 'text-blue-500' },
  pink: { bg: 'bg-pink-400', active: 'bg-pink-500', shadow: 'bg-pink-600', text: 'text-pink-500' },
  orange: { bg: 'bg-orange-400', active: 'bg-orange-500', shadow: 'bg-orange-600', text: 'text-orange-500' },
  amber: { bg: 'bg-amber-400', active: 'bg-amber-500', shadow: 'bg-amber-600', text: 'text-amber-500' },
  slate: { bg: 'bg-slate-400', active: 'bg-slate-500', shadow: 'bg-slate-600', text: 'text-slate-500' },
};

const ACTIONS = [
  { id: 'code', icon: Terminal, baseColor: 'blue', label: 'Code' },
  { id: 'design', icon: PenTool, baseColor: 'pink', label: 'Design' },
  { id: 'debug', icon: Bug, baseColor: 'orange', label: 'Debug' },
  { id: 'coffee', icon: Coffee, baseColor: 'amber', label: 'Coffee' }
];

const KNOWLEDGE_GAIN = 15;
const KNOWLEDGE_LOSS = 10;
const KNOWLEDGE_START = 25;

const getLevelContext = (lvl: number) => {
  if (lvl === 1) return { title: 'In-office Shadowing', desc: 'Clear instructions and close proximity. Follow the labels.', showLabels: true, useColors: true, speed: 1000, obfuscate: false };
  if (lvl === 2) return { title: 'Hybrid Setup', desc: 'Working from home a few days. Nuance is lost, labels vanish.', showLabels: false, useColors: true, speed: 800, obfuscate: false };
  if (lvl === 3) return { title: 'Fully Remote', desc: 'Zoom fatigue sets in. Things lose their color.', showLabels: false, useColors: false, speed: 800, obfuscate: false };
  if (lvl === 4) return { title: 'Async Communication', desc: 'Quick Slack updates. Actions happen much faster.', showLabels: false, useColors: false, speed: 450, obfuscate: false };
  return { title: 'Tacit Fading', desc: 'The unspoken rules are barely visible. Good luck.', showLabels: false, useColors: false, speed: 300, obfuscate: true };
};

const FloatingShape = ({ delay, duration, className }: { delay: number, duration: number, className: string }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [0, -20, 0] }}
    transition={{ repeat: Infinity, duration, delay, ease: 'easeInOut' }}
    className={`absolute rounded-3xl opacity-20 blur-2xl ${className}`}
  />
);

const SeniorAction = ({ action, isActive, useColors, showLabels, obfuscate }: any) => {
  const baseColors = COLOR_MAP[action.baseColor];
  const slateColors = COLOR_MAP['slate'];
  const textColor = useColors ? baseColors.text : slateColors.text;
  const Icon = action.icon;
  
  return (
    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl transition-all duration-300 ${isActive ? 'scale-110 bg-white shadow-2xl z-10' : 'scale-100 bg-white/50 shadow-sm opacity-60'} ${obfuscate && !isActive ? 'blur-sm' : ''} ${obfuscate && isActive ? 'blur-[1px] opacity-80' : ''}`}>
      <Icon size={ isActive ? 48 : 36 } className={`transition-all duration-300 ${textColor} ${isActive ? 'drop-shadow-md' : ''}`} />
      {showLabels && <span className={`mt-2 font-bold text-[10px] uppercase tracking-wider ${textColor}`}>{action.label}</span>}
    </div>
  );
};

const ActionButton = ({ action, onClick, disabled, useColors, showLabels }: any) => {
  const baseColors = COLOR_MAP[action.baseColor];
  const slateColors = COLOR_MAP['slate'];
  const colors = useColors ? baseColors : slateColors;
  const Icon = action.icon;

  return (
    <button 
      onClick={() => onClick(action.id)}
      disabled={disabled}
      className={`relative group w-24 h-24 ${disabled ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 active:scale-95'} transition-all outline-none`}
    >
      <div className={`absolute inset-0 rounded-2xl ${colors.shadow} translate-y-2 group-hover:translate-y-1 group-active:translate-y-0 transition-transform`} />
      <div className={`absolute inset-0 rounded-2xl border-2 border-white/30 flex flex-col items-center justify-center gap-2 ${colors.bg} text-white shadow-lg group-hover:translate-y-1 group-active:translate-y-2 transition-transform duration-100`}>
        <Icon size={32} strokeWidth={2.5} />
        {showLabels && <span className="font-bold text-[10px] tracking-wider uppercase text-white drop-shadow-sm">{action.label}</span>}
      </div>
    </button>
  );
};

export default function App() {
  const [level, setLevel] = useState(1);
  const [knowledge, setKnowledge] = useState(KNOWLEDGE_START);
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'intro' | 'showing' | 'playing' | 'success' | 'failure' | 'gameover' | 'win'>('intro');
  const [activeDemoAction, setActiveDemoAction] = useState<string | null>(null);

  const levelCtx = getLevelContext(level);

  const generateSequence = (len: number) => {
    const newSeq = Array.from({ length: len }, () => {
      const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      return randomAction.id;
    });
    setSequence(newSeq);
    setPlayerSequence([]);
  };

  useEffect(() => {
    let isActive = true;

    const playDemo = async () => {
      if (gameState === 'showing' && sequence.length > 0) {
        const speed = levelCtx.speed;
        await new Promise(r => setTimeout(r, 1000)); 
        
        for (let i = 0; i < sequence.length; i++) {
          if (!isActive) return;
          setActiveDemoAction(sequence[i]);
          await new Promise(r => setTimeout(r, speed * 0.7)); 
          if (!isActive) return;
          setActiveDemoAction(null);
          await new Promise(r => setTimeout(r, speed * 0.3)); 
        }

        if (!isActive) return;
        setGameState('playing');
      }
    };

    playDemo();
    return () => { isActive = false; };
  }, [gameState, sequence, levelCtx.speed]);

  useEffect(() => {
    if (level > 1) {
       const nextSeqLen = Math.min(3 + level - 1, 8);
       generateSequence(nextSeqLen);
       setGameState('showing');
    }
  }, [level]);

  const handleActionClick = (id: string) => {
    if (gameState !== 'playing') return;

    const newPlayerSeq = [...playerSequence, id];
    setPlayerSequence(newPlayerSeq);

    const currentIndex = newPlayerSeq.length - 1;

    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      setGameState('failure');
      const nextKnowledge = Math.max(0, knowledge - KNOWLEDGE_LOSS);
      setKnowledge(nextKnowledge);
      
      setTimeout(() => {
        if (nextKnowledge <= 0) {
          setGameState('gameover');
        } else {
          setPlayerSequence([]);
          setGameState('showing');
        }
      }, 1500);
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      setGameState('success');
      const nextKnowledge = Math.min(100, knowledge + KNOWLEDGE_GAIN);
      setKnowledge(nextKnowledge);
      
      setTimeout(() => {
        if (nextKnowledge >= 100) {
          setGameState('win');
        } else {
          setLevel(l => l + 1);
        }
      }, 1500);
    }
  };

  const restart = () => {
    setLevel(1);
    setKnowledge(KNOWLEDGE_START);
    setGameState('intro');
  };

  const startShadowing = () => {
    generateSequence(3);
    setGameState('showing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 font-sans flex flex-col overflow-hidden text-slate-800 relative selection:bg-amber-200">
      
      <FloatingShape delay={0} duration={8} className="w-96 h-96 bg-amber-400 top-10 -left-10 rotate-12" />
      <FloatingShape delay={1} duration={10} className="w-80 h-80 bg-orange-400 bottom-10 -right-10 -rotate-12" />
      <FloatingShape delay={2} duration={9} className="w-72 h-72 bg-blue-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />

      {gameState === 'intro' && (
        <div className="absolute inset-0 z-50 bg-amber-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-lg text-center border-4 border-amber-200">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Brain size={40} />
            </div>
            <h1 className="text-4xl font-black text-amber-900 mb-4 tracking-tight">Tacit Knowledge</h1>
            <p className="text-amber-800 mb-8 font-medium text-lg leading-relaxed">
              Watch the Senior Developer closely. Replicate their exact sequence of actions to build your tacit knowledge.
              <br/><br/>
              Beware—as you move to remote work, instructions become less explicit. Can you keep up?
            </p>
            <button 
              onClick={startShadowing}
              className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:translate-y-1 w-full"
            >
              Start Apprenticeship
            </button>
          </motion.div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-50 bg-red-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[2rem] shadow-2xl max-w-lg text-center border-4 border-red-200">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <XCircle size={40} />
            </div>
            <h1 className="text-4xl font-black text-red-600 mb-4 tracking-tight">Knowledge Lost</h1>
            <p className="text-slate-600 mb-8 font-medium text-lg">
              The unspoken rules were too hard to follow in this environment, and the tacit knowledge faded away entirely.
            </p>
            <button 
              onClick={restart}
              className="px-10 py-5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:translate-y-1 w-full"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      )}

      {gameState === 'win' && (
        <div className="absolute inset-0 z-50 bg-green-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[2rem] shadow-2xl max-w-lg text-center border-4 border-green-200">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-4xl font-black text-green-600 mb-4 tracking-tight">Mastery Achieved!</h1>
            <p className="text-slate-600 mb-8 font-medium text-lg">
              You've internalized the tacit knowledge of the studio, even through the hardest remote communication challenges. You are ready to mentor the next generation!
            </p>
            <button 
              onClick={restart}
              className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:translate-y-1 w-full"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      )}

      <header className="w-full max-w-4xl mx-auto pt-8 px-6 relative z-10">
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white">
          <div className="flex justify-between items-end mb-3">
            <span className="font-black text-amber-900 flex items-center gap-2 text-lg uppercase tracking-widest"><Brain className="w-6 h-6"/> Tacit Knowledge</span>
            <span className="text-lg font-black text-amber-800">{knowledge}%</span>
          </div>
          <div className="h-6 bg-amber-900/10 rounded-full overflow-hidden border-2 border-amber-900/20 shadow-inner relative">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${knowledge}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
        </div>
      </header>

      <div className="text-center mt-8 mb-4 z-10 relative px-4">
        <span className="inline-block px-4 py-1.5 bg-amber-200/80 text-amber-900 font-black rounded-full text-sm mb-4 tracking-widest uppercase shadow-sm border border-amber-300">
          Stage {level}
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-amber-950 mb-4 tracking-tight drop-shadow-sm">{levelCtx.title}</h2>
        <p className="text-amber-800/90 font-semibold text-lg max-w-lg mx-auto bg-amber-50/50 py-2 px-4 rounded-xl inline-block backdrop-blur-sm">{levelCtx.desc}</p>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 p-6 z-10">
        
        {/* Senior Desk */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/40 transform -skew-x-6 rounded-[2.5rem] shadow-xl border-t-4 border-l-4 border-white/80 transition-transform group-hover:scale-[1.02]" />
          <div className="relative p-8 md:p-10 flex flex-col items-center">
            <div className="mb-8 flex items-center gap-3 bg-amber-100/90 px-6 py-3 rounded-full shadow-md text-amber-950 font-black border-2 border-amber-200 text-sm uppercase tracking-widest">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Senior Dev
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {ACTIONS.map(action => (
                <SeniorAction 
                  key={`senior-${action.id}`}
                  action={action}
                  isActive={activeDemoAction === action.id}
                  useColors={levelCtx.useColors}
                  showLabels={levelCtx.showLabels}
                  obfuscate={levelCtx.obfuscate}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center Connection / Status */}
        <div className="flex flex-col items-center justify-center gap-4 min-w-[120px] h-32 md:h-auto">
           {gameState === 'showing' && (
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="bg-white/50 p-4 rounded-full shadow-sm backdrop-blur-sm">
               <RefreshCw className="w-10 h-10 text-amber-600/70" />
             </motion.div>
           )}
           {gameState === 'playing' && (
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg font-black tracking-widest uppercase animate-pulse">
               Your Turn
             </motion.div>
           )}
           {gameState === 'success' && (
             <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="bg-green-100 p-2 rounded-full shadow-lg">
               <CheckCircle2 className="w-16 h-16 text-green-500 drop-shadow-sm" />
             </motion.div>
           )}
           {gameState === 'failure' && (
             <motion.div initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} className="bg-red-100 p-2 rounded-full shadow-lg">
               <XCircle className="w-16 h-16 text-red-500 drop-shadow-sm" />
             </motion.div>
           )}
        </div>

        {/* Apprentice Desk */}
        <div className="relative group">
          <div className="absolute inset-0 bg-white/40 transform skew-x-6 rounded-[2.5rem] shadow-xl border-t-4 border-r-4 border-white/80 transition-transform group-hover:scale-[1.02]" />
          <div className="relative p-8 md:p-10 flex flex-col items-center">
            <div className="mb-8 flex items-center gap-3 bg-blue-100/90 px-6 py-3 rounded-full shadow-md text-blue-950 font-black border-2 border-blue-200 text-sm uppercase tracking-widest">
              <PenTool className="w-5 h-5 text-blue-500" />
              Apprentice
            </div>

            <div className="grid grid-cols-2 gap-6">
              {ACTIONS.map(action => (
                <ActionButton 
                  key={`player-${action.id}`}
                  action={action}
                  onClick={handleActionClick}
                  disabled={gameState !== 'playing'}
                  useColors={levelCtx.useColors}
                  showLabels={levelCtx.showLabels}
                />
              ))}
            </div>

            <div className="mt-8 flex gap-3 justify-center h-4">
              {sequence.length > 0 && sequence.map((_, i) => (
                <div 
                  key={`dot-${i}`} 
                  className={`w-3 h-3 rounded-full transition-colors duration-300 shadow-sm ${
                    i < playerSequence.length 
                      ? (gameState === 'failure' && i === playerSequence.length - 1 ? 'bg-red-500 shadow-red-500/50' : 'bg-green-500 shadow-green-500/50')
                      : 'bg-white/60 border border-amber-900/10'
                  }`}
                />
              ))}
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
