import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Backpack, Play, CheckCircle, Circle, Eye, Type, Target, Volume2, Shield } from 'lucide-react';

const App = () => {
  const [fixes, setFixes] = useState({
    textSize: false,
    srLabel: false,
    contrast: false,
    tapTargets: false,
  });

  const score = Object.values(fixes).filter(Boolean).length;
  const maxScore = Object.keys(fixes).length;
  
  const allFixed = score === maxScore;

  const handleFix = (key: keyof typeof fixes) => {
    setFixes((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-[1100px] w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Mock Mobile Game UI */}
        <div className="w-full lg:w-[45%] bg-[#e2e8f0] p-8 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Game Preview</div>
          </div>
          
          <div className="w-[320px] h-[640px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[12px] border-slate-800 relative flex flex-col mt-8 lg:mt-0">
            {/* Game Screen Content */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-sky-50 to-white">
              {/* Header */}
              <div className="p-5 flex justify-between items-center relative z-10">
                <div className="flex gap-3 relative">
                  {/* Inventory Button */}
                  <div className="relative group">
                    <button className={`flex items-center justify-center bg-white rounded-full shadow border transition-all duration-300 ${fixes.tapTargets ? 'w-12 h-12 border-indigo-200 hover:bg-indigo-50' : 'w-6 h-6 border-slate-200'} ${fixes.contrast ? 'text-indigo-600' : 'text-slate-300'}`}>
                      <Backpack size={fixes.tapTargets ? 22 : 12} color="currentColor" />
                    </button>
                    <AnimatePresence>
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono px-2.5 py-1 rounded-md pointer-events-none transition-opacity duration-300 ${fixes.srLabel ? 'bg-slate-800 text-white opacity-100' : 'bg-red-100 text-red-800 opacity-0 group-hover:opacity-100'}`}
                      >
                        {fixes.srLabel ? 'aria-label="Inventory"' : 'Missing aria-label'}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  {/* Settings Button */}
                  <div className="relative group">
                    <button className={`flex items-center justify-center bg-white rounded-full shadow border transition-all duration-300 ${fixes.tapTargets ? 'w-12 h-12 border-indigo-200 hover:bg-indigo-50' : 'w-6 h-6 border-slate-200'} ${fixes.contrast ? 'text-indigo-600' : 'text-slate-300'}`}>
                      <Settings size={fixes.tapTargets ? 22 : 12} color="currentColor" />
                    </button>
                    <AnimatePresence>
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono px-2.5 py-1 rounded-md pointer-events-none transition-opacity duration-300 ${fixes.srLabel ? 'bg-slate-800 text-white opacity-100' : 'bg-red-100 text-red-800 opacity-0 group-hover:opacity-100'}`}
                      >
                        {fixes.srLabel ? 'aria-label="Settings"' : 'Missing aria-label'}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                  <Shield size={16} className={fixes.contrast ? "text-amber-500" : "text-slate-300"} />
                  <span className={`font-bold transition-colors ${fixes.contrast ? "text-slate-800" : "text-slate-300"}`}>Lv. 42</span>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 px-6 pb-10 flex flex-col justify-center items-center text-center relative z-0">
                <div className="w-32 h-32 bg-indigo-100 rounded-full mb-8 flex items-center justify-center shadow-inner relative">
                  <motion.img 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=Adventure&backgroundColor=transparent" 
                    alt="Game Character Avatar" 
                    className="w-24 h-24 drop-shadow-md" 
                  />
                  {/* Decoration */}
                  <div className="absolute -bottom-2 -right-2 bg-amber-400 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white text-xs font-bold">✨</div>
                </div>
                
                <h1 className={`font-black transition-all duration-500 mb-3 ${fixes.textSize ? 'text-[28px] leading-tight' : 'text-sm'} ${fixes.contrast ? 'text-slate-900' : 'text-slate-300'}`}>
                  Epic Quest Awaits
                </h1>
                
                <p className={`transition-all duration-500 mb-10 ${fixes.textSize ? 'text-base' : 'text-[10px] leading-tight'} ${fixes.contrast ? 'text-slate-600' : 'text-slate-200'}`}>
                  Journey through the mystical forest to recover the ancient artifact of accessibility. Ensure your interface is usable by all adventurers!
                </p>
                
                <button className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-xl shadow-indigo-200 transition-all duration-300 flex items-center justify-center gap-2 w-full max-w-[240px] ${fixes.tapTargets ? 'px-6 py-4 text-lg' : 'px-4 py-2 text-xs mx-auto w-auto'}`}>
                  <Play size={fixes.tapTargets ? 20 : 12} fill="currentColor" />
                  Start Quest
                </button>
              </div>
            </div>
            
            {/* Screen Reader Overlay Indicator */}
            <AnimatePresence>
              {fixes.srLabel && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/95 text-white text-xs px-4 py-2 rounded-full font-mono flex items-center gap-2 backdrop-blur shadow-lg w-[85%] justify-center"
                >
                  <Volume2 size={16} className="text-emerald-400" /> Screen Reader Support Active
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Audit Dashboard */}
        <div className="w-full lg:w-[55%] p-8 sm:p-12 flex flex-col bg-white">
          <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2 tracking-tight">A11y Audit</h2>
              <p className="text-slate-500 text-lg">Fix the UI to help all players.</p>
            </div>
            <div className="text-right bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-100">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-4xl font-black text-indigo-600 leading-none">{score}</span>
                <span className="text-xl font-bold text-indigo-300 leading-none">/{maxScore}</span>
              </div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Score</div>
            </div>
          </div>
          
          {/* Character Status */}
          <div className={`mb-10 p-6 rounded-3xl border flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 transition-colors duration-500 ${allFixed ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className="w-24 h-24 relative flex-shrink-0">
              <motion.div
                animate={
                  allFixed 
                    ? { y: [0, -15, 0], scale: [1, 1.1, 1] } 
                    : { x: [-3, 3, -3, 3, 0], rotate: [-5, 5, -5, 5, 0] }
                }
                transition={{ 
                  duration: allFixed ? 1.5 : 0.5, 
                  repeat: Infinity, 
                  repeatDelay: allFixed ? 0.5 : 2 
                }}
                className={`w-full h-full rounded-full shadow-lg flex items-center justify-center text-5xl border-4 ${allFixed ? 'bg-white border-emerald-200' : 'bg-white border-amber-200'}`}
              >
                {allFixed ? '😎' : score === 0 ? '😫' : score < 3 ? '😰' : '😬'}
              </motion.div>
              {!allFixed && (
                <motion.div 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 text-2xl"
                >
                  💦
                </motion.div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center h-full sm:pt-2">
              <h3 className={`font-black text-xl mb-1 ${allFixed ? 'text-emerald-800' : 'text-amber-800'}`}>
                {allFixed ? "Ready to Play!" : "Player is Struggling"}
              </h3>
              <p className={`text-sm leading-relaxed ${allFixed ? 'text-emerald-700/80' : 'text-amber-700/80'}`}>
                {allFixed 
                  ? "Awesome job! The game is now accessible and enjoyable for everyone." 
                  : "The interface has barriers preventing the player from enjoying the game. Tap the checklist below to fix."}
              </p>
            </div>
          </div>
          
          {/* Checklist */}
          <div className="flex-1 flex flex-col gap-4">
            <ChecklistItem 
              icon={<Type size={22} strokeWidth={2.5} />}
              title="Increase Text Size" 
              description="Make text readable without zooming."
              isFixed={fixes.textSize} 
              onFix={() => handleFix('textSize')} 
            />
            <ChecklistItem 
              icon={<Eye size={22} strokeWidth={2.5} />}
              title="Raise Color Contrast" 
              description="Ensure text stands out from background."
              isFixed={fixes.contrast} 
              onFix={() => handleFix('contrast')} 
            />
            <ChecklistItem 
              icon={<Target size={22} strokeWidth={2.5} />}
              title="Enlarge Tap Targets" 
              description="Make buttons easy to tap (min 48x48dp)."
              isFixed={fixes.tapTargets} 
              onFix={() => handleFix('tapTargets')} 
            />
            <ChecklistItem 
              icon={<Volume2 size={22} strokeWidth={2.5} />}
              title="Add Screen Reader Labels" 
              description="Provide aria-labels for icon buttons."
              isFixed={fixes.srLabel} 
              onFix={() => handleFix('srLabel')} 
            />
          </div>
          
          {/* Progress Bar */}
          <div className="mt-10">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 px-1">
              <span>PROGRESS</span>
              <span>{Math.round((score / maxScore) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className={`h-full ${allFixed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${(score / maxScore) * 100}%` }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChecklistItem = ({ title, description, isFixed, onFix, icon }: { title: string, description: string, isFixed: boolean, onFix: () => void, icon: React.ReactNode }) => {
  return (
    <button 
      onClick={onFix}
      disabled={isFixed}
      className={`text-left flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 w-full relative overflow-hidden
        ${isFixed 
          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 shadow-sm cursor-default' 
          : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group'}`}
    >
      <div className={`flex-shrink-0 z-10 transition-colors duration-300 ${isFixed ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-400'}`}>
        {isFixed ? <CheckCircle size={32} /> : <Circle size={32} />}
      </div>
      
      <div className="flex-1 z-10">
        <h4 className={`font-bold text-lg transition-colors duration-300 ${isFixed ? 'text-emerald-900' : 'text-slate-800 group-hover:text-indigo-900'}`}>
          {title}
        </h4>
        <p className={`text-sm mt-1 transition-colors duration-300 ${isFixed ? 'text-emerald-700/70' : 'text-slate-500 group-hover:text-slate-600'}`}>
          {description}
        </p>
      </div>
      
      {!isFixed && (
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300 z-10">
          {icon}
        </div>
      )}
      
      {/* Background fill animation for fixed state */}
      <AnimatePresence>
        {isFixed && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 10, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute left-6 top-1/2 w-4 h-4 bg-emerald-50/50 rounded-full z-0 -translate-y-1/2 origin-center"
          />
        )}
      </AnimatePresence>
    </button>
  );
};

export default App;
