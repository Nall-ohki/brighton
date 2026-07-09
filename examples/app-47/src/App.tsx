import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ColumnId = 'uncategorized' | 'education' | 'industry' | 'government';
type StickyType = 'barrier' | 'solution';

interface Sticky {
  id: string;
  text: string;
  type: StickyType;
  columnId: ColumnId;
  rotation: number;
  color: string;
}

const COLORS = {
  barrier: ['#ff8fab', '#ff65a3', '#ff7eb9', '#ff9eaa'], // pinkish/reds
  solution: ['#feff9c', '#fff740', '#9cffb0', '#7afcff'] // yellows, greens, blues
};

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomRotation = () => Math.floor(Math.random() * 8) - 4; // -4 to 4 degrees

const generateResponse = (barrier: string) => {
  const lower = barrier.toLowerCase();
  if (lower.includes('cost') || lower.includes('money') || lower.includes('expensive')) {
    return "Subsidize training programs and offer income-share agreements to reduce upfront burdens.";
  }
  if (lower.includes('contact') || lower.includes('network') || lower.includes('connection')) {
    return "Establish formalized mentorship networks bridging students with industry veterans.";
  }
  if (lower.includes('time') || lower.includes('schedule')) {
    return "Implement flexible, asynchronous micro-credentialing to accommodate busy lives.";
  }
  if (lower.includes('skill') || lower.includes('experience')) {
    return "Create project-based apprenticeships that provide hands-on experience before graduation.";
  }
  return "Promote cross-sector partnerships to align curriculum with real-world needs and lower barriers to entry.";
};

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'education', title: 'Education' },
  { id: 'industry', title: 'Industry' },
  { id: 'government', title: 'Government' }
];

export default function App() {
  const [stickies, setStickies] = useState<Sticky[]>([
    {
      id: 'initial-1',
      text: 'Tuition is too expensive',
      type: 'barrier',
      columnId: 'education',
      rotation: getRandomRotation(),
      color: COLORS.barrier[0],
    },
    {
      id: 'initial-2',
      text: 'Subsidize training programs and offer income-share agreements.',
      type: 'solution',
      columnId: 'government',
      rotation: getRandomRotation(),
      color: COLORS.solution[0],
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Ref for auto-scrolling the uncategorized staging area
  const stagingAreaRef = useRef<HTMLDivElement>(null);

  const handleAddBarrier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    const newBarrier: Sticky = {
      id: `barrier-${Date.now()}`,
      text: inputVal.trim(),
      type: 'barrier',
      columnId: 'uncategorized',
      rotation: getRandomRotation(),
      color: getRandomItem(COLORS.barrier),
    };
    
    setStickies(prev => [...prev, newBarrier]);
    setInputVal('');
    setIsTyping(true);
    
    setTimeout(() => {
      if (stagingAreaRef.current) {
        stagingAreaRef.current.scrollTo({ left: stagingAreaRef.current.scrollWidth, behavior: 'smooth' });
      }
    }, 100);
    
    // Simulate AI response
    setTimeout(() => {
      const newSolution: Sticky = {
        id: `solution-${Date.now()}`,
        text: generateResponse(newBarrier.text),
        type: 'solution',
        columnId: 'uncategorized',
        rotation: getRandomRotation(),
        color: getRandomItem(COLORS.solution),
      };
      setStickies(prev => [...prev, newSolution]);
      setIsTyping(false);
      
      setTimeout(() => {
        if (stagingAreaRef.current) {
          stagingAreaRef.current.scrollTo({ left: stagingAreaRef.current.scrollWidth, behavior: 'smooth' });
        }
      }, 100);
    }, 2000);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('stickyId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    const stickyId = e.dataTransfer.getData('stickyId');
    if (stickyId) {
      setStickies(prev => prev.map(s => s.id === stickyId ? { ...s, columnId } : s));
    }
  };

  const renderSticky = (sticky: Sticky) => (
    <motion.div
      layout
      layoutId={sticky.id}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      key={sticky.id}
      draggable
      onDragStart={(e) => handleDragStart(e as any, sticky.id)}
      style={{ 
        backgroundColor: sticky.color,
        rotate: sticky.rotation,
      }}
      className={cn(
        "w-48 sm:w-56 p-4 shadow-[2px_4px_8px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing",
        "flex flex-col relative transition-shadow hover:shadow-[4px_8px_16px_rgba(0,0,0,0.4)]",
        "sticky-font shrink-0"
      )}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/10">
        {sticky.type === 'barrier' ? (
          <User size={14} className="text-black/60" />
        ) : (
          <Bot size={14} className="text-black/60" />
        )}
        <span className="text-[10px] sm:text-xs font-bold text-black/60 uppercase tracking-wider">
          {sticky.type}
        </span>
      </div>
      <p className="text-black/80 font-medium text-sm sm:text-base leading-snug">
        {sticky.text}
      </p>
      {/* Tape effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/30 backdrop-blur-sm shadow-sm rotate-2 z-10" />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-stone-900 p-2 sm:p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl h-[90vh] chalkboard-bg flex flex-col rounded-2xl overflow-hidden shadow-2xl relative border-[16px] border-[#5c4033] z-10">
        
        {/* Header */}
        <div className="p-6 md:p-8 text-center shrink-0 border-b-2 border-white/10 relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <h1 className="text-4xl md:text-6xl font-bold chalk-text mb-2 tracking-wide">
              Opportunities For Talent
            </h1>
            <p className="chalk-text text-white/70 text-xl md:text-2xl flex items-center justify-center gap-2">
              <AlertCircle size={20} className="inline opacity-70" />
              Workshopping The Foundations Of A Better Future
            </p>
          </motion.div>
          {/* Decorative chalk smudges */}
          <div className="absolute top-4 left-10 w-32 h-8 bg-white/5 rounded-full blur-xl" />
          <div className="absolute bottom-4 right-20 w-48 h-12 bg-white/5 rounded-full blur-xl" />
        </div>

        {/* Board Columns Area */}
        <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-y-auto overflow-x-hidden md:overflow-visible relative z-10">
          {COLUMNS.map((col, index) => {
            const colStickies = stickies.filter(s => s.columnId === col.id);
            return (
              <div 
                key={col.id}
                className={cn(
                  "flex-1 flex flex-col min-h-[300px] md:min-h-0",
                  "border-white/20 relative",
                  index !== COLUMNS.length - 1 && "md:border-r-2 md:border-dashed"
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <h2 className="text-3xl font-bold mb-6 chalk-text tracking-wider opacity-90 pb-2 w-full text-center">
                  {col.title}
                </h2>
                <div className="flex-1 flex flex-row flex-wrap md:flex-col gap-6 w-full items-start md:items-center content-start p-2 pb-10">
                  <AnimatePresence>
                    {colStickies.map(sticky => renderSticky(sticky))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* Staging Area / Ledge */}
        <div 
          className="h-64 md:h-72 border-t-[12px] border-[#4a332a] bg-[#754c24] shadow-[inset_0_15px_30px_rgba(0,0,0,0.5)] flex flex-col relative shrink-0 z-20"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'uncategorized')}
        >
          {/* Ledge top highlight */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
          
          <div 
            className="flex-1 flex overflow-x-auto items-center gap-6 px-8 scroll-smooth"
            ref={stagingAreaRef}
          >
            <div className="text-white/40 chalk-text text-xl absolute top-4 left-6 pointer-events-none opacity-50 hidden md:block">
              Drag items to columns ↑
            </div>

            <AnimatePresence>
              {stickies.filter(s => s.columnId === 'uncategorized').map(sticky => renderSticky(sticky))}
            </AnimatePresence>

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-48 sm:w-56 shrink-0 p-4 shadow-xl bg-white/10 flex items-center justify-center border-2 border-dashed border-white/40 sticky-font"
                style={{ rotate: 1 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <motion.div 
                    animate={{ rotate: [0, -10, 10, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Bot size={32} className="text-white/80" />
                  </motion.div>
                  <span className="text-white/80 font-medium animate-pulse text-sm">Educator is typing...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Form Area */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-full max-w-3xl z-30">
            <motion.form 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onSubmit={handleAddBarrier} 
              className="flex items-center gap-2 bg-stone-900/80 p-2 md:p-3 rounded-full backdrop-blur-md border border-white/10 shadow-2xl relative"
            >
              <div className="bg-white/10 p-2 rounded-full hidden md:block">
                <User size={20} className="text-white/70" />
              </div>
              <input 
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type a barrier (e.g. 'high cost', 'no contacts')..."
                className="flex-1 bg-transparent text-white placeholder:text-white/50 px-4 py-2 outline-none sticky-font text-lg md:text-xl"
              />
              <button 
                type="submit" 
                disabled={!inputVal.trim() || isTyping}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/20"
              >
                <Send size={20} className={cn(inputVal.trim() && !isTyping && "translate-x-0.5 -translate-y-0.5 transition-transform")} />
              </button>
            </motion.form>
          </div>
        </div>
        
      </div>
    </div>
  );
}
