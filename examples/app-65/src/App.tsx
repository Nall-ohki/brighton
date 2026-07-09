import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimationControls } from 'framer-motion';
import { Lock, LockOpen, Dices } from 'lucide-react';
import './App.css';

const CONSTRAINTS = [
  "10-Minute Timer",
  "Single Color",
  "No Dialogue",
  "One Button Only",
  "Blindfolded",
  "Zero Gravity",
  "Tiny Screen",
  "Everything is Massive",
  "Permadeath",
  "Pacifist Run",
  "Invisible Enemies",
  "Text Only"
];

const TRANSFORMATIONS = [
  "Reverse It",
  "Scale It Up",
  "Make It Sad",
  "Speed It Up",
  "Turn Into a Musical",
  "Invert Colors",
  "Add a Companion",
  "Remove the Floor",
  "Make It Rhyme",
  "Add Googly Eyes",
  "Set In Space",
  "Make It Sticky"
];

// Combine arrays to create a long strip for spinning effect
const createSpinStrip = (items: string[]) => {
  // We duplicate the array a few times to ensure we have enough items to scroll through
  return [...items, ...items, ...items, ...items, ...items];
};

const Wheel = ({ 
  items, 
  title, 
  locked, 
  toggleLock, 
  selectedIndex, 
  spinning, 
  controls 
}: { 
  items: string[], 
  title: string, 
  locked: boolean, 
  toggleLock: () => void, 
  selectedIndex: number, 
  spinning: boolean,
  controls: AnimationControls
}) => {
  const itemHeight = 60; // Fixed height per item
  
  return (
    <div className="wheel-container flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4 text-[#8b6b4e] font-serif uppercase tracking-widest bg-[#f4ebd0] px-4 py-1 rounded-sm border border-[#d2b48c] shadow-sm">
        {title}
      </h2>
      
      <div className="drum-machine relative w-64 h-[180px] bg-[#2a2a2a] rounded-xl overflow-hidden border-4 border-[#8b6b4e] shadow-[inset_0_10px_20px_rgba(0,0,0,0.8),_0_5px_15px_rgba(0,0,0,0.5)]">
        {/* Glass glare effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20 h-1/2"></div>
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,1)] pointer-events-none z-20"></div>
        
        {/* Center highlight / selection window */}
        <div className="absolute top-1/2 left-0 right-0 h-[60px] -mt-[30px] border-y-2 border-red-500/50 bg-red-500/10 z-10 pointer-events-none shadow-[0_0_15px_rgba(255,0,0,0.2)]">
          <div className="absolute left-0 top-1/2 w-3 h-3 -mt-1.5 bg-red-600 rounded-r-full shadow-[0_0_5px_red]"></div>
          <div className="absolute right-0 top-1/2 w-3 h-3 -mt-1.5 bg-red-600 rounded-l-full shadow-[0_0_5px_red]"></div>
        </div>

        {/* The actual spinning strip */}
        <motion.div 
          className="absolute w-full top-1/2"
          animate={controls}
          initial={{ y: -selectedIndex * itemHeight - itemHeight/2 + 30 }}
        >
          {createSpinStrip(items).map((item, idx) => {
            // Apply a slight curvature effect using CSS transforms in the class
            return (
              <div 
                key={`${item}-${idx}`} 
                className="wheel-item h-[60px] flex items-center justify-center px-4"
              >
                <span className="text-[#f4ebd0] font-mono text-lg text-center font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {item}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
      
      <button 
        onClick={toggleLock}
        className={`mt-6 p-3 rounded-full transition-all duration-300 shadow-md border-2 ${
          locked 
            ? 'bg-red-700 text-white border-red-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5),_0_2px_4px_rgba(0,0,0,0.3)]' 
            : 'bg-[#d2b48c] text-[#4a3b2c] border-[#a0805c] hover:bg-[#e6d0a7] hover:scale-105 shadow-[0_4px_6px_rgba(0,0,0,0.2)]'
        }`}
        disabled={spinning}
      >
        {locked ? <Lock size={24} /> : <LockOpen size={24} />}
      </button>
    </div>
  );
};

export default function App() {
  const [constraintIdx, setConstraintIdx] = useState(0);
  const [transformIdx, setTransformIdx] = useState(0);
  
  const [lockConstraint, setLockConstraint] = useState(false);
  const [lockTransform, setLockTransform] = useState(false);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const constraintControls = useAnimation();
  const transformControls = useAnimation();
  
  const itemHeight = 60;
  const stripLength = CONSTRAINTS.length * 5; // since we duplicated 5 times
  const middleOffset = CONSTRAINTS.length * 2; // target the middle segment
  
  useEffect(() => {
    // Initial position
    constraintControls.set({ y: -(middleOffset + constraintIdx) * itemHeight - itemHeight/2 + 30 });
    transformControls.set({ y: -(middleOffset + transformIdx) * itemHeight - itemHeight/2 + 30 });
  }, []);

  const spin = async () => {
    if (isSpinning || (lockConstraint && lockTransform)) return;
    
    setIsSpinning(true);
    setShowResult(false);
    
    const spins = [];
    
    let newConstraintIdx = constraintIdx;
    if (!lockConstraint) {
      newConstraintIdx = Math.floor(Math.random() * CONSTRAINTS.length);
      setConstraintIdx(newConstraintIdx);
      
      const targetY = -(middleOffset + newConstraintIdx) * itemHeight - itemHeight/2 + 30;
      // Animate down, then back up to create spin effect
      spins.push(
        constraintControls.start({
          y: [
            -(middleOffset - CONSTRAINTS.length + constraintIdx) * itemHeight - itemHeight/2 + 30, // start higher up
            targetY
          ],
          transition: { duration: 2.5, ease: [0.15, 0.85, 0.35, 1], times: [0, 1] }
        })
      );
    }
    
    let newTransformIdx = transformIdx;
    if (!lockTransform) {
      newTransformIdx = Math.floor(Math.random() * TRANSFORMATIONS.length);
      setTransformIdx(newTransformIdx);
      
      const targetY = -(middleOffset + newTransformIdx) * itemHeight - itemHeight/2 + 30;
      spins.push(
        transformControls.start({
          y: [
            -(middleOffset - TRANSFORMATIONS.length * 1.5 + transformIdx) * itemHeight - itemHeight/2 + 30,
            targetY
          ],
          transition: { duration: 3.0, ease: [0.15, 0.85, 0.35, 1], times: [0, 1] } // Slightly longer for the second wheel
        })
      );
    }
    
    await Promise.all(spins);
    setIsSpinning(false);
    setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-[#1a2524] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background textures */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0a0f0e] pointer-events-none"></div>
      
      <div className="max-w-4xl w-full bg-[#f4ebd0] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-[#2c3e3c] relative z-10 flex flex-col items-center vintage-machine">
        
        {/* Machine Header */}
        <div className="w-full text-center mb-10 border-b-4 border-[#8b6b4e] pb-6 relative">
          <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#c2a077] border-4 border-[#2c3e3c] shadow-inner"></div>
          <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#c2a077] border-4 border-[#2c3e3c] shadow-inner"></div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-black text-[#2c3e3c] uppercase tracking-tighter title-shadow flex flex-col items-center justify-center">
            <span className="text-2xl md:text-3xl tracking-[0.3em] text-[#b33939] mb-2 font-bold">Scheduled</span>
            Serendipity
          </h1>
          <p className="mt-3 text-[#5a4b3c] font-mono font-bold tracking-widest text-sm uppercase">Creative Aha Moment Generator</p>
        </div>
        
        {/* Wheels Area */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 mb-12 justify-center w-full">
          <Wheel 
            items={CONSTRAINTS} 
            title="Constraint" 
            locked={lockConstraint} 
            toggleLock={() => setLockConstraint(!lockConstraint)} 
            selectedIndex={constraintIdx}
            spinning={isSpinning}
            controls={constraintControls}
          />
          
          <Wheel 
            items={TRANSFORMATIONS} 
            title="Transformation" 
            locked={lockTransform} 
            toggleLock={() => setLockTransform(!lockTransform)} 
            selectedIndex={transformIdx}
            spinning={isSpinning}
            controls={transformControls}
          />
        </div>
        
        {/* Main Control */}
        <div className="relative mb-12">
          <button
            onClick={spin}
            disabled={isSpinning || (lockConstraint && lockTransform)}
            className={`
              relative z-10 group px-12 py-5 rounded-full text-3xl font-black uppercase tracking-widest 
              border-4 border-[#8b6b4e] transition-all duration-150 overflow-hidden
              ${isSpinning || (lockConstraint && lockTransform)
                ? 'bg-[#a39a8c] text-[#7a7268] cursor-not-allowed scale-95 shadow-none transform translate-y-2'
                : 'bg-gradient-to-b from-[#e15241] to-[#b33939] text-[#f4ebd0] hover:from-[#f26554] hover:to-[#c64444] hover:scale-105 shadow-[0_10px_0_#7a2222,_0_15px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_0_#7a2222,_0_12px_15px_rgba(0,0,0,0.4)] hover:translate-y-1 active:shadow-[0_0px_0_#7a2222,_0_0px_0px_rgba(0,0,0,0.4)] active:translate-y-[10px]'
              }
            `}
          >
            <span className="relative z-10 flex items-center gap-3">
              <Dices size={32} className={`${isSpinning ? 'animate-spin' : ''}`} />
              PULL TO SPIN
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
        </div>
        
        {/* Result Area */}
        <div className="w-full mt-4 h-48 relative perspective-1000">
          <motion.div
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ 
              rotateX: showResult ? 0 : 90, 
              opacity: showResult ? 1 : 0 
            }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="w-full h-full bg-[#fdfaf1] border-2 border-[#d2b48c] rounded-xl p-6 shadow-xl flex flex-col items-center justify-center text-center transform-gpu relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZDJiNDhjIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZjRmYmQwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-50"></div>
            
            <p className="text-[#8b6b4e] font-serif italic mb-2 text-lg">Your Next Game Idea:</p>
            <h3 className="text-2xl md:text-4xl font-black text-[#2c3e3c] font-sans leading-tight">
              A game with <span className="text-[#b33939] underline decoration-4 underline-offset-4">{CONSTRAINTS[constraintIdx]}</span>, 
              <br/>but you <span className="text-[#e67e22] underline decoration-4 underline-offset-4">{TRANSFORMATIONS[transformIdx]}</span>.
            </h3>
            
            <div className="absolute bottom-2 right-4 text-xs font-mono text-[#a0805c]">ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
}
