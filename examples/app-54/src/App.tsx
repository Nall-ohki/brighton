import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Code2, Rocket, Briefcase, Gamepad2, ArrowRightLeft, Sparkles, Scale } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TileCategory = 'Milestones' | 'IP Rights' | 'Feedback Loops' | 'Co-Credit';

type TileData = {
  id: string;
  category: TileCategory;
  label: string;
  zone: 'pool' | 'contract';
  balance: number; // 0 (Client) to 100 (Dev), 50 is center
};

const INITIAL_TILES: TileData[] = [
  { id: 't1', category: 'Milestones', label: 'Milestones', zone: 'pool', balance: 50 },
  { id: 't2', category: 'IP Rights', label: 'IP Rights', zone: 'pool', balance: 50 },
  { id: 't3', category: 'Feedback Loops', label: 'Feedback Loops', zone: 'pool', balance: 50 },
  { id: 't4', category: 'Co-Credit', label: 'Co-Credit', zone: 'pool', balance: 50 },
];

const CATEGORIES: TileCategory[] = ['Milestones', 'IP Rights', 'Feedback Loops', 'Co-Credit'];

export default function App() {
  const [tiles, setTiles] = useState<TileData[]>(INITIAL_TILES);
  const contractZoneRef = useRef<HTMLDivElement>(null);
  
  const contractTiles = tiles.filter(t => t.zone === 'contract');
  const poolTiles = tiles.filter(t => t.zone === 'pool');

  let totalHealth = 0;
  let maxDeviation = 0;

  contractTiles.forEach(t => {
     const dev = Math.abs(t.balance - 50);
     if (dev > maxDeviation) maxDeviation = dev;
     const score = 25 * (1 - dev / 50);
     totalHealth += score;
  });

  // Small rounding corrections
  if (totalHealth > 99.9) totalHealth = 100;

  const isCoCreationMode = totalHealth === 100 && contractTiles.length === 4;
  const wobbleIntensity = maxDeviation > 5 ? (maxDeviation / 50) * 8 : 0;

  const handleDrop = (id: string, point: { x: number, y: number }) => {
     const rect = contractZoneRef.current?.getBoundingClientRect();
     if (rect && point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) {
        let normalized = (point.x - rect.left) / rect.width;
        let balance = normalized * 100;
        if (Math.abs(balance - 50) < 8) balance = 50; // generous snap
        balance = Math.max(0, Math.min(100, balance));

        setTiles(prev => prev.map(t => t.id === id ? { ...t, zone: 'contract', balance } : t));
     }
  };

  const updateBalance = (id: string, balance: number) => {
     setTiles(prev => prev.map(t => t.id === id ? { ...t, balance } : t));
  };

  const reset = () => {
    setTiles(INITIAL_TILES);
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-1000 flex flex-col font-sans overflow-hidden",
      isCoCreationMode 
        ? "bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 text-emerald-50"
        : "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-50"
    )}>
      
      {/* Header */}
      <header className="py-5 px-8 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md z-20">
         <div className="flex items-center gap-3 w-1/4">
            <div className={cn("p-2 rounded-lg", isCoCreationMode ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400")}>
               <Scale className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black tracking-tight">
               XDEV <span className="font-light opacity-80">Negotiator</span>
            </h1>
         </div>
         
         <div className="flex-1 max-w-xl flex flex-col items-center px-8">
            <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
               <span>Imbalanced</span>
               <span className={isCoCreationMode ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' : ''}>Co-Creation Ready</span>
            </div>
            <motion.div
              animate={
                wobbleIntensity > 0 && !isCoCreationMode
                  ? { x: [-wobbleIntensity, wobbleIntensity, -wobbleIntensity] }
                  : { x: 0 }
              }
              transition={{ repeat: Infinity, duration: 0.15 }}
              className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 shadow-inner"
            >
               <motion.div
                  className={cn("h-full", isCoCreationMode ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500')}
                  animate={{ width: `${totalHealth}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
               />
            </motion.div>
         </div>

         <div className="w-1/4 flex justify-end items-center text-sm font-medium">
            <div className={cn("px-4 py-1.5 rounded-full border", 
               isCoCreationMode 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            )}>
               {isCoCreationMode ? 'SYNERGY ACHIEVED' : 'NEGOTIATING'}
            </div>
         </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex relative overflow-hidden">
        
        {/* Client Panel */}
        <motion.div
          className="w-1/4 border-r border-white/5 bg-blue-950/20 backdrop-blur-sm p-8 flex flex-col items-center justify-center relative z-10"
          animate={isCoCreationMode ? { x: '-100%', opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
           <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="text-5xl mb-6 bg-blue-900/50 p-6 rounded-2xl border border-blue-500/30 shadow-xl relative z-10">
                 <Building2 className="w-16 h-16 text-blue-400" />
              </div>
           </div>
           <h2 className="text-2xl font-bold text-blue-300 mb-3 tracking-wide">Client Studio</h2>
           <div className="flex gap-2 mb-6">
              <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">Control</span>
              <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">IP Security</span>
           </div>
           <p className="text-center text-blue-200/60 text-sm leading-relaxed max-w-xs">
              Focuses on protecting assets, managing budgets, and ensuring the partner delivers on rigid timelines.
           </p>
        </motion.div>

        {/* Center Zone */}
        <div className="flex-1 flex flex-col relative z-0 items-center">
           <AnimatePresence>
              {isCoCreationMode ? (
                 <motion.div
                   key="celebration"
                   initial={{ opacity: 0, scale: 0.8, y: 50 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
                   className="absolute inset-0 flex flex-col items-center justify-center p-12 z-20"
                 >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-50 pointer-events-none" />
                    
                    <div className="flex items-center gap-10 mb-12 relative z-10">
                       <motion.div 
                          animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }} 
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          className="bg-blue-900/50 p-6 rounded-2xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                       >
                          <Building2 className="w-20 h-20 text-blue-400" />
                       </motion.div>
                       
                       <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                       >
                          <Sparkles className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                       </motion.div>

                       <motion.div 
                          animate={{ y: [0, -15, 0], rotate: [5, -5, 5] }} 
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
                          className="bg-purple-900/50 p-6 rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                       >
                          <Code2 className="w-20 h-20 text-purple-400" />
                       </motion.div>
                    </div>

                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200 mb-6 drop-shadow-lg text-center leading-tight">
                       True Co-Creation <br/> Unlocked!
                    </h2>
                    
                    <p className="text-emerald-100/80 text-xl text-center max-w-2xl leading-relaxed mb-12">
                       By balancing risk and reward, both teams are now empowered to build the best game possible together.
                    </p>

                    <button 
                       onClick={reset}
                       className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all transform hover:scale-105 active:scale-95"
                    >
                       Negotiate Another Contract
                    </button>
                 </motion.div>
              ) : (
                 <motion.div
                   key="negotiation"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   transition={{ duration: 0.5 }}
                   className="w-full max-w-3xl flex flex-col h-full py-8 px-8"
                 >
                    {/* Contract Tracks */}
                    <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 shadow-2xl p-8 flex flex-col relative z-10" ref={contractZoneRef}>
                       <div className="text-center mb-8">
                          <h3 className="text-slate-300 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                             <Briefcase className="w-4 h-4" /> Shared Contract Zone
                          </h3>
                          <p className="text-slate-500 text-xs mt-2">Drag terms into the contract and find the perfect balance.</p>
                       </div>

                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">
                          <span className="text-blue-400/50 flex items-center gap-1"><ArrowRightLeft className="w-3 h-3" /> Client Favored</span>
                          <span className="text-emerald-400/50">Balanced</span>
                          <span className="text-purple-400/50 flex items-center gap-1">Dev Favored <ArrowRightLeft className="w-3 h-3" /></span>
                       </div>

                       <div className="flex flex-col gap-5 flex-1 justify-center">
                          {CATEGORIES.map((cat) => {
                             const tile = contractTiles.find(t => t.category === cat);
                             return (
                                <CategoryTrack 
                                   key={cat} 
                                   category={cat} 
                                   tile={tile} 
                                   updateBalance={updateBalance} 
                                />
                             );
                          })}
                       </div>
                    </div>

                    {/* Tile Pool */}
                    <div className="h-40 shrink-0 mt-6 bg-white/5 rounded-2xl border border-white/5 p-6 relative flex flex-col">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">Available Clauses</h4>
                       <div className="flex-1 flex justify-center items-center gap-4">
                          {poolTiles.map(tile => (
                             <PoolTile key={tile.id} tile={tile} onDrop={handleDrop} />
                          ))}
                          {poolTiles.length === 0 && (
                             <div className="text-slate-600 text-sm italic">All clauses placed. Balance them to unlock co-creation!</div>
                          )}
                       </div>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Dev Panel */}
        <motion.div
          className="w-1/4 border-l border-white/5 bg-purple-950/20 backdrop-blur-sm p-8 flex flex-col items-center justify-center relative z-10"
          animate={isCoCreationMode ? { x: '100%', opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
           <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
              <div className="text-5xl mb-6 bg-purple-900/50 p-6 rounded-2xl border border-purple-500/30 shadow-xl relative z-10">
                 <Code2 className="w-16 h-16 text-purple-400" />
              </div>
           </div>
           <h2 className="text-2xl font-bold text-purple-300 mb-3 tracking-wide">Dev Partner</h2>
           <div className="flex gap-2 mb-6">
              <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">Creativity</span>
              <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">Recognition</span>
           </div>
           <p className="text-center text-purple-200/60 text-sm leading-relaxed max-w-xs">
              Seeks creative input, fair credit for their work, and flexible milestones that accommodate game dev realities.
           </p>
        </motion.div>
      </main>
    </div>
  );
}

// Subcomponents

function CategoryTrack({ category, tile, updateBalance }: { category: string, tile?: TileData, updateBalance: (id: string, b: number) => void }) {
   const trackRef = useRef<HTMLDivElement>(null);
   const [isDragging, setIsDragging] = useState(false);

   const handlePointerDown = (e: React.PointerEvent) => {
      if (!tile) return;
      setIsDragging(true);
      updatePosition(e.clientX);
      e.currentTarget.setPointerCapture(e.pointerId);
   };

   const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
   };

   const handlePointerUp = (e: React.PointerEvent) => {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
   };

   const updatePosition = (clientX: number) => {
      if (!trackRef.current || !tile) return;
      const rect = trackRef.current.getBoundingClientRect();
      let normalized = (clientX - rect.left) / rect.width;
      let balance = normalized * 100;
      if (Math.abs(balance - 50) < 6) balance = 50; // Snap to center
      balance = Math.max(0, Math.min(100, balance));
      updateBalance(tile.id, balance);
   };

   const isBalanced = tile && tile.balance === 50;

   return (
      <div
         className="relative w-full h-16 bg-black/40 rounded-xl border border-white/5 flex items-center cursor-pointer overflow-hidden group hover:border-white/10 transition-colors"
         ref={trackRef}
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerCancel={handlePointerUp}
      >
         {/* Background Gradients */}
         <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />
         <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />

         {/* Center Mark */}
         <div className={cn(
            "absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 transition-all duration-300 pointer-events-none z-0",
            isBalanced ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)]' : 'bg-white/10 group-hover:bg-white/20'
         )} />

         {/* Category Label in Background */}
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 text-3xl font-black whitespace-nowrap pointer-events-none select-none z-0">
            {category}
         </div>

         {/* The Tile (Slider Knob) */}
         {tile ? (
            <motion.div
               layoutId={`tile-${tile.id}`}
               className={cn(
                  "absolute h-12 w-48 rounded-lg flex items-center justify-center font-bold text-sm shadow-xl pointer-events-none transition-colors duration-300 border z-10",
                  isBalanced
                     ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                     : 'bg-slate-800 text-slate-200 border-slate-600 shadow-[0_5px_15px_rgba(0,0,0,0.5)]'
               )}
               style={{ left: `calc(${tile.balance}% - 6rem)` }}
               animate={{ left: `calc(${tile.balance}% - 6rem)` }}
               transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
               {tile.label}
            </motion.div>
         ) : (
            <div className="w-full text-center text-slate-500 text-sm font-medium italic pointer-events-none z-10">
               Drop <span className="text-slate-400 font-bold">{category}</span> tile here
            </div>
         )}
      </div>
   );
}

function PoolTile({ tile, onDrop }: { tile: TileData, onDrop: (id: string, point: {x: number, y: number}) => void }) {
   return (
      <motion.div
         layoutId={`tile-${tile.id}`}
         drag
         dragSnapToOrigin
         onDragEnd={(e, info) => {
            onDrop(tile.id, info.point);
         }}
         whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
         className="bg-slate-800 border border-slate-600 rounded-lg cursor-grab shadow-[0_5px_15px_rgba(0,0,0,0.5)] font-bold text-slate-200 w-48 h-12 flex justify-center items-center text-sm relative z-10 hover:border-slate-400 transition-colors"
      >
         {tile.label}
      </motion.div>
   );
}
