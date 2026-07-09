import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SOLUTION = [
  [1, 1, 0, 1, 1],
  [1, 0, 0, 0, 1],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
];

const ROW_HINTS = [
  [2, 2],
  [1, 1],
  [],
  [1, 1],
  [3]
];

const COL_HINTS = [
  [2, 1],
  [1, 1],
  [1],
  [1, 1],
  [2, 1]
];

const EMOTIONS = ["Satisfaction", "Relief", "Epiphany", "Frustration", "Serenity"];

export default function App() {
  const [grid, setGrid] = useState<number[][]>(Array(5).fill(null).map(() => Array(5).fill(0)));
  const [isSolved, setIsSolved] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [soundWaves] = useState(() => Array(20).fill(0));

  useEffect(() => {
    let solved = true;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isFilled = grid[r][c] === 1;
        const shouldBeFilled = SOLUTION[r][c] === 1;
        if (isFilled !== shouldBeFilled) {
          solved = false;
        }
      }
    }
    
    if (solved && !isSolved) {
      setIsSolved(true);
      setEmotion(EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]);
    }
  }, [grid, isSolved]);

  const toggleCell = (r: number, c: number, e: React.MouseEvent) => {
    if (isSolved) return;
    
    e.preventDefault();
    const newGrid = [...grid];
    newGrid[r] = [...newGrid[r]];
    
    if (e.type === 'contextmenu') {
      newGrid[r][c] = newGrid[r][c] === 2 ? 0 : 2;
    } else {
      newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
    }
    
    setGrid(newGrid);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-sans text-gray-800 relative overflow-hidden selection:bg-gray-200">
      
      <div className="absolute inset-0 flex items-end justify-center opacity-10 pointer-events-none pb-20 gap-2">
        {soundWaves.map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gray-600 rounded-full"
            animate={{
              height: [10, Math.random() * 100 + 50, 10],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="z-10 text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-2xl tracking-widest font-light text-gray-900 uppercase"
        >
          Emotion Grid
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-sm text-gray-400 mt-2 tracking-wide"
        >
          Left click to fill. Right click to mark. Feel the response.
        </motion.p>
      </div>

      <div className="z-10 relative" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence>
          {!isSolved && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center absolute"
            >
              <div className="flex">
                <div className="w-16" />
                <div className="flex gap-1 mb-2">
                  {COL_HINTS.map((hints, c) => (
                    <div key={`col-${c}`} className="w-12 flex flex-col justify-end items-center text-xs text-gray-500 font-medium">
                      {hints.map((h, i) => (
                        <span key={i}>{h}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col gap-1 items-end justify-around w-16 text-xs text-gray-500 font-medium pr-2">
                  {ROW_HINTS.map((hints, r) => (
                    <div key={`row-${r}`} className="h-12 flex items-center justify-end space-x-1">
                      {hints.map((h, i) => (
                        <span key={i}>{h}</span>
                      ))}
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col gap-1 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  {grid.map((row, r) => (
                    <div key={`r-${r}`} className="flex gap-1">
                      {row.map((val, c) => (
                        <motion.div
                          key={`c-${c}`}
                          onContextMenu={(e: any) => toggleCell(r, c, e)}
                          onClick={(e: any) => toggleCell(r, c, e)}
                          whileHover="hover"
                          className={`w-12 h-12 cursor-pointer rounded-sm border transition-colors duration-300 flex items-center justify-center relative ${
                            val === 1 ? 'bg-gray-800 border-gray-800' : 
                            'bg-[#fdfdfd] border-gray-200'
                          }`}
                        >
                          <motion.div 
                            className="absolute inset-0 border-2 border-gray-300 rounded-sm pointer-events-none z-10"
                            variants={{
                              hover: {
                                opacity: [0, 0.4, 0],
                                scale: [1, 1.2, 1],
                                transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                              }
                            }}
                          />
                          
                          {val === 2 && (
                            <motion.svg initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </motion.svg>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSolved && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute flex items-center justify-center"
            >
              <div className="bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-xl border border-gray-100 text-center w-96 pointer-events-auto">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ delay: 1.5, type: "spring" }}
                  className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6"
                >
                  <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </motion.div>

                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Emotional Impact</h2>
                <h3 className="text-3xl font-light text-gray-900 mb-6">{emotion}</h3>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />
                
                <p className="text-sm text-gray-500 font-light leading-relaxed mb-8">
                  The logic is sound, but how did it make you feel? The tension of deduction, the momentary uncertainty, the final click of realization. 
                  The true score is not the grid, but the resonance it left behind.
                </p>

                <button 
                  onClick={() => {
                    setGrid(Array(5).fill(null).map(() => Array(5).fill(0)));
                    setIsSolved(false);
                    setEmotion(null);
                  }}
                  className="px-6 py-2 border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm tracking-wide cursor-pointer"
                >
                  Reflect & Replay
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
