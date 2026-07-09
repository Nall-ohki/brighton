import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type Archetype = 'Hero' | 'Shadow' | 'Trickster' | 'Anima' | 'Sage';
type Arc = 'Call' | 'Descent' | 'Return';

interface Token {
  id: string;
  type: Archetype;
  arc: Arc | 'Tray';
}

const ALL_ARCS: Arc[] = ['Call', 'Descent', 'Return'];
const ARCHETYPES: Archetype[] = ['Hero', 'Shadow', 'Trickster', 'Anima', 'Sage'];

const FLAVOR_TEXT: Record<Archetype, Record<Arc | 'Tray', string>> = {
  Hero: {
    Tray: 'Awaiting destiny...',
    Call: 'Steps into the unknown.',
    Descent: 'Faces trials in the dark.',
    Return: 'Brings back the boon.'
  },
  Shadow: {
    Tray: 'Lurking in the unconscious...',
    Call: 'A dark mirror to the summons.',
    Descent: 'The ultimate adversary in the abyss.',
    Return: 'Integrated, its power harnessed.'
  },
  Trickster: {
    Tray: 'Ready to disrupt...',
    Call: 'Mocks the seriousness of the quest.',
    Descent: 'Bends the rules of the underworld.',
    Return: 'Ensures the return is never simple.'
  },
  Anima: {
    Tray: 'The soul\'s whisper...',
    Call: 'The inner voice guiding forth.',
    Descent: 'A beacon of connection in isolation.',
    Return: 'The wholeness achieved at the end.'
  },
  Sage: {
    Tray: 'Holding ancient wisdom...',
    Call: 'Provides the map before the journey.',
    Descent: 'A guiding light when all is lost.',
    Return: 'Witnesses the cycle complete.'
  }
};

const SYMBOLS: Record<Archetype, string> = {
  Hero: '⚔️',
  Shadow: '🌑',
  Trickster: '🃏',
  Anima: '🦋',
  Sage: '👁️'
};

const ARC_DESC: Record<Arc, string> = {
  Call: 'The departure from the normal world.',
  Descent: 'The initiation and trials in the unknown.',
  Return: 'The journey back with new wisdom.'
};

export default function App() {
  const [tokens, setTokens] = useState<Token[]>(
    ARCHETYPES.map((type) => ({ id: `token-${type}`, type, arc: 'Tray' }))
  );
  const [activeArcs, setActiveArcs] = useState<Arc[]>(ALL_ARCS);

  const moveToken = (id: string, targetArc: Arc | 'Tray') => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, arc: targetArc } : t))
    );
  };

  const toggleArc = (arc: Arc) => {
    setActiveArcs((prev) => {
      if (prev.includes(arc)) {
        // Remove arc
        const newArcs = prev.filter((a) => a !== arc);
        if (newArcs.length === 0) return prev; // Don't remove the last arc!
        
        // Re-distribute tokens
        setTokens((currentTokens) => {
          return currentTokens.map((t) => {
            if (t.arc === arc) {
              // Distribute to the first available remaining arc
              const dest = newArcs[0];
              return { ...t, arc: dest };
            }
            return t;
          });
        });
        
        return newArcs;
      } else {
        // Add arc in correct order
        const newArcs = [...prev, arc];
        newArcs.sort((a, b) => ALL_ARCS.indexOf(a) - ALL_ARCS.indexOf(b));
        return newArcs;
      }
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b19] text-white font-sans selection:bg-fuchsia-500/30">
      <BackgroundAnimation />
      
      <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
        <header className="mb-8 text-center pt-4">
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-indigo-300 to-cyan-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            DREAMWEAVER
          </h1>
          <p className="mt-3 text-indigo-200/60 font-light tracking-wide max-w-2xl mx-auto text-sm">
            Craft your narrative. Assign archetypes to the story arcs. 
            Remove arcs to witness the dream adapt and restructure itself.
          </p>
        </header>

        {/* Narrative Arcs Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 justify-center items-stretch mb-8 min-h-[40vh]">
          <AnimatePresence mode="popLayout">
            {ALL_ARCS.map((arc) => {
              const isActive = activeArcs.includes(arc);
              if (!isActive) return null;
              
              const arcTokens = tokens.filter((t) => t.arc === arc);

              return (
                <motion.div
                  layout
                  key={arc}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex-1 flex flex-col bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-visible group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-3xl" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-light text-white/90 tracking-widest flex items-center gap-2">
                        {arc.toUpperCase()}
                      </h2>
                      <p className="text-xs text-white/40 mt-1">{ARC_DESC[arc]}</p>
                    </div>
                    {activeArcs.length > 1 && (
                      <button 
                        onClick={() => toggleArc(arc)}
                        className="text-white/20 hover:text-red-400 transition-colors p-1"
                        title="Remove Arc"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-3 z-10 relative">
                    <AnimatePresence mode="popLayout">
                      {arcTokens.map((token) => (
                        <div key={token.id} className="relative group/token">
                          <TokenCard 
                            token={token} 
                            onClick={() => moveToken(token.id, 'Tray')} 
                          />
                          {/* Quick assign menu inside Arc */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/token:opacity-100 transition-opacity flex gap-1 bg-[#0a0a0a]/90 backdrop-blur-md rounded-full p-1.5 border border-white/10 pointer-events-none group-hover/token:pointer-events-auto z-50 shadow-xl">
                            {activeArcs.filter(a => a !== arc).map(a => (
                              <button
                                key={`assign-${a}`}
                                onClick={(e) => { e.stopPropagation(); moveToken(token.id, a); }}
                                className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all whitespace-nowrap"
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </AnimatePresence>
                    {arcTokens.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="flex-1 min-h-[100px] border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-white/10 italic text-sm font-light"
                      >
                        Awaiting manifestation...
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Tray & Controls */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-visible mt-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-sm text-white/50 tracking-[0.3em] uppercase font-light">The Unconscious</h3>
            
            <div className="flex gap-2">
              {ALL_ARCS.map(arc => {
                const isActive = activeArcs.includes(arc);
                return (
                  <button
                    key={`toggle-${arc}`}
                    onClick={() => toggleArc(arc)}
                    disabled={activeArcs.length === 1 && isActive}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all tracking-wider disabled:opacity-30 disabled:cursor-not-allowed ${
                      isActive 
                        ? 'bg-white/10 text-white/90 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                        : 'bg-transparent text-white/40 border border-white/5 hover:bg-white/5 hover:text-white/70'
                    }`}
                  >
                    {arc.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 min-h-[100px] items-center">
            <AnimatePresence mode="popLayout">
              {tokens.filter(t => t.arc === 'Tray').map((token) => (
                <div key={token.id} className="relative group/tray z-10">
                  <TokenCard 
                    token={token} 
                    onClick={() => {
                      if (activeArcs.length > 0) {
                        moveToken(token.id, activeArcs[0]);
                      }
                    }} 
                  />
                  {/* Quick assign menu */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/tray:opacity-100 transition-opacity flex gap-1 bg-[#0a0a0a]/90 backdrop-blur-md rounded-full p-1.5 border border-white/10 pointer-events-none group-hover/tray:pointer-events-auto z-50 shadow-xl">
                    {activeArcs.map(arc => (
                      <button
                        key={`assign-${arc}`}
                        onClick={(e) => { e.stopPropagation(); moveToken(token.id, arc); }}
                        className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all whitespace-nowrap"
                      >
                        {arc}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </AnimatePresence>
            {tokens.filter(t => t.arc === 'Tray').length === 0 && (
              <p className="text-white/20 italic text-sm w-full text-center font-light">All entities are woven into the dream.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function TokenCard({ token, onClick }: { token: Token, onClick: () => void }) {
  return (
    <motion.div
      layoutId={token.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.03, filter: 'brightness(1.15)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer relative overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-white/30 transition-colors group"
      style={{ minWidth: '220px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite]" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
          {SYMBOLS[token.type]}
        </div>
        <div>
          <h4 className="font-medium text-white/90 tracking-widest text-sm uppercase">{token.type}</h4>
          <p className="text-[11px] text-white/50 leading-relaxed mt-1 font-light pr-2">
            {FLAVOR_TEXT[token.type][token.arc]}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#4f46e5] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.15] animate-[blob_18s_infinite]" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#d946ef] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.15] animate-[blob_22s_infinite_reverse]" />
      <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] bg-[#06b6d4] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.12] animate-[blob_25s_infinite]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] opacity-50" />
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
