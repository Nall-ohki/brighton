import React, { useState, useEffect, useCallback } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

const EXPERIENCES = [
  "Swapped a business card",
  "Found the quiet room",
  "Sat front row",
  "Got starstruck",
  "Snuck out of a session",
  "Drank too much free coffee",
  "Got a cool lanyard",
  "Collected 5 stickers",
  "Asked a panel question",
  "Went to the Expo floor",
  "Played an indie game demo",
  "Met a dev you love",
  "Got lost in the Hilton",
  "Got a free t-shirt",
  "Saw a dev kit shirt",
  "Networked at a pub",
  "Exchanged Discord handles",
  "Took a venue selfie",
  "Attended a keynote",
  "Got your badge scanned",
  "Used a buzzword",
  "Complained about Wi-Fi",
  "Stayed until the end",
  "Saw a seagull steal food"
];

const BINGO_LINES = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

const shuffleArray = (array: string[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const GAME_DURATION_SECONDS = 120; // 2 minutes

const App: React.FC = () => {
  const [board, setBoard] = useState<{ text: string; id: number }[]>([]);
  const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WON' | 'LOST'>('START');
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION_SECONDS);

  const initGame = useCallback(() => {
    const shuffled = shuffleArray(EXPERIENCES);
    const newBoard = [];
    let expIndex = 0;
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        newBoard.push({ text: "FREE SPACE\n(Got Badge)", id: i });
      } else {
        newBoard.push({ text: shuffled[expIndex], id: i });
        expIndex++;
      }
    }
    setBoard(newBoard);
    
    const initialMarked = new Array(25).fill(false);
    initialMarked[12] = true; // Free space marked
    setMarked(initialMarked);
    
    setTimeRemaining(GAME_DURATION_SECONDS);
    setGameState('PLAYING');
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeRemaining === 0) {
      setGameState('LOST');
    }
    return () => clearInterval(timer);
  }, [gameState, timeRemaining]);

  const checkWinCondition = (currentMarked: boolean[]) => {
    return BINGO_LINES.some(line => line.every(index => currentMarked[index]));
  };

  const handleSquareClick = (index: number) => {
    if (gameState !== 'PLAYING') return;
    if (index === 12) return; // Free space cannot be toggled

    const newMarked = [...marked];
    newMarked[index] = !newMarked[index];
    setMarked(newMarked);

    if (checkWinCondition(newMarked)) {
      setGameState('WON');
    }
  };

  // Convert timeRemaining to game time (09:00 to 17:00)
  // 120 seconds real time = 8 hours = 480 minutes
  // 1 second real time = 4 minutes game time
  const elapsedGameMinutes = (GAME_DURATION_SECONDS - timeRemaining) * 4;
  const gameHours = 9 + Math.floor(elapsedGameMinutes / 60);
  const gameMinutes = elapsedGameMinutes % 60;
  
  const timeString = `${gameHours.toString().padStart(2, '0')}:${gameMinutes.toString().padStart(2, '0')}`;

  const colors = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#5f27cd', '#c8d6e5'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex flex-col items-center justify-center font-sans p-4">
      
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 bg-white p-4 rounded-3xl shadow-lg border-4 border-indigo-500 relative overflow-hidden">
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 shadow-sm text-2xl">✨</div>
        <div className="z-10 flex-1">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 tracking-tight ml-6">
            Develop:Brighton <br/><span className="text-xl text-indigo-400">First-Timer Bingo</span>
          </h1>
        </div>
        
        <div className="z-10 flex flex-col items-end">
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Conference Time</div>
          <div className="text-4xl font-black text-gray-800 bg-gray-100 px-4 py-2 rounded-xl shadow-inner border-2 border-gray-300">
            {timeString}
          </div>
          {gameState === 'PLAYING' && timeRemaining <= 30 && (
            <motion.div 
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-red-500 font-bold text-sm mt-1"
            >
              Hurry up!
            </motion.div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="relative w-full max-w-3xl bg-white p-4 sm:p-6 rounded-3xl shadow-2xl border-4 border-purple-400">
        
        {/* Lanyard Hole Decor */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gray-200 border-4 border-gray-300 rounded-full flex justify-center shadow-inner">
          <div className="w-12 h-full bg-gradient-to-b from-gray-400 to-gray-200 mx-auto transform -translate-y-6 flex justify-center">
            <div className="w-8 h-20 bg-blue-500 shadow-md"></div>
          </div>
        </div>

        {gameState === 'START' && (
          <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-4xl font-black text-gray-800 mb-4">Welcome to Wednesday!</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md font-medium">
              Your first day at Develop:Brighton! Experience typical conference moments before 5:00 PM to get BINGO!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initGame}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)] border-4 border-white transition-all"
            >
              Start Wednesday
            </motion.button>
          </div>
        )}

        {(gameState === 'WON' || gameState === 'LOST') && (
          <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-center">
            <motion.h2 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-6xl font-black mb-4 ${gameState === 'WON' ? 'text-green-500' : 'text-red-500'}`}
            >
              {gameState === 'WON' ? 'BINGO!' : 'TIME\'S UP!'}
            </motion.h2>
            <p className="text-xl text-gray-700 mb-8 font-medium">
              {gameState === 'WON' 
                ? "You've officially mastered your first day at Develop:Brighton!" 
                : "The conference floor is closed! Better luck tomorrow!"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initGame}
              className="px-8 py-4 bg-indigo-500 text-white font-bold text-xl rounded-full shadow-lg border-4 border-indigo-300 hover:bg-indigo-600 transition-colors"
            >
              Play Again
            </motion.button>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 mt-6">
          {board.map((item, index) => {
            const isFreeSpace = index === 12;
            const isMarked = marked[index];
            const baseColor = colors[index % colors.length];
            
            return (
              <motion.div
                key={item.id}
                whileHover={gameState === 'PLAYING' && !isFreeSpace ? { scale: 1.05, rotate: isMarked ? 0 : (index % 2 === 0 ? 2 : -2) } : {}}
                whileTap={gameState === 'PLAYING' && !isFreeSpace ? { scale: 0.95 } : {}}
                onClick={() => handleSquareClick(index)}
                className={`
                  relative aspect-square flex items-center justify-center p-2 text-center rounded-xl sm:rounded-2xl cursor-pointer select-none
                  transition-all duration-300
                  ${isMarked ? 'bg-gray-100 shadow-inner' : 'bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)] border-2 border-gray-200 hover:border-gray-300'}
                  ${isFreeSpace ? 'border-yellow-400 bg-yellow-50' : ''}
                `}
                style={!isMarked ? { borderBottomColor: baseColor, borderBottomWidth: '4px' } : {}}
              >
                {/* Sticker Style Text */}
                <span className={`
                  text-xs sm:text-sm md:text-base font-bold leading-tight
                  ${isMarked ? 'text-gray-400 opacity-60' : 'text-gray-700'}
                  ${isFreeSpace ? 'text-yellow-600 font-black' : ''}
                `}>
                  {item.text}
                </span>

                {/* Stamped Effect when marked */}
                <AnimatePresence>
                  {isMarked && (
                    <motion.div
                      initial={{ scale: 2, opacity: 0, rotate: -30 }}
                      animate={{ scale: 1, opacity: 1, rotate: index % 2 === 0 ? -15 : 15 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                         {isFreeSpace ? (
                           <span className="text-4xl md:text-5xl drop-shadow-md">🎟️</span>
                         ) : (
                           <div className="border-4 border-red-500 rounded-full p-1 sm:p-2 bg-white/20 backdrop-blur-[2px] transform rotate-12 shadow-sm">
                             <span className="text-red-500 text-xl sm:text-2xl md:text-4xl font-black block leading-none opacity-90" style={{fontFamily: 'Impact, sans-serif', transform: 'rotate(-5deg)'}}>DONE</span>
                           </div>
                         )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Decorative footer */}
      <div className="mt-8 text-center text-sm font-bold text-indigo-400 max-w-xl opacity-80 flex flex-wrap justify-center gap-4">
         <span className="bg-white/50 px-3 py-1 rounded-full border border-indigo-200">#DevelopBrighton</span>
         <span className="bg-white/50 px-3 py-1 rounded-full border border-indigo-200">First-Timer Experience</span>
      </div>

    </div>
  );
};

export default App;
