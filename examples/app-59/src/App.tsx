import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, Users, Sparkles, Globe, 
  Smile, ShieldCheck, Speech, Award, 
  Zap, Heart, Sunrise, Palette, Lightbulb
} from 'lucide-react';
import './App.css';

const ROUNDS = [
  {
    level: 1,
    timeLimit: 60,
    words: [
      { answer: "ALLYSHIP", vignette: { title: "Mentorship Moment", desc: "Guiding new talent.", icon: HeartHandshake } },
      { answer: "PAY GAP", vignette: { title: "Salary Transparency", desc: "Equal pay for equal work.", icon: Award } },
      { answer: "SAFE SPACE", vignette: { title: "Secure Environment", desc: "Where everyone belongs.", icon: ShieldCheck } },
      { answer: "DIVERSITY", vignette: { title: "Global Team", desc: "Voices from around the world.", icon: Globe } }
    ]
  },
  {
    level: 2,
    timeLimit: 90,
    words: [
      { answer: "REPRESENTATION", vignette: { title: "Character Creation", desc: "Seeing yourself in the game.", icon: Users } },
      { answer: "INCLUSIVITY", vignette: { title: "Welcoming Culture", desc: "Bringing everyone to the table.", icon: Sunrise } },
      { answer: "ACCESSIBILITY", vignette: { title: "Adaptive Controls", desc: "Playable by everyone.", icon: Zap } },
      { answer: "EMPOWERMENT", vignette: { title: "Leadership Role", desc: "Taking the reins.", icon: Lightbulb } }
    ]
  },
  {
    level: 3,
    timeLimit: 120,
    words: [
      { answer: "INCLUSIVE DESIGN", vignette: { title: "Thoughtful UI", desc: "Designing for all minds and bodies.", icon: Palette } },
      { answer: "EQUAL OPPORTUNITY", vignette: { title: "Fair Hiring", desc: "Opening doors widely.", icon: Speech } },
      { answer: "INTERSECTIONALITY", vignette: { title: "Complex Identities", desc: "Honoring all facets of self.", icon: Sparkles } },
      { answer: "SYSTEMIC CHANGE", vignette: { title: "Studio Overhaul", desc: "Building better foundations.", icon: Smile } }
    ]
  }
];

const shuffleString = (str: string) => {
  const words = str.split(' ');
  const shuffledWords = words.map(word => {
    let arr = word.split('');
    // Ensure it is actually scrambled if length > 3
    let shuffled = [...arr];
    let attempts = 0;
    while (shuffled.join('') === word && word.length > 1 && attempts < 10) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      attempts++;
    }
    return shuffled.join('');
  });
  return shuffledWords.join(' ');
};

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'round_won' | 'game_over' | 'game_won'>('start');
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [unlockedVignettes, setUnlockedVignettes] = useState<any[]>([]);
  const [errorShake, setErrorShake] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('game_over');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const startGame = () => {
    setCurrentRoundIdx(0);
    setCurrentWordIdx(0);
    setUnlockedVignettes([]);
    setGameState('playing');
    startRound(0, 0);
  };

  const startRound = (rIdx: number, wIdx: number) => {
    const round = ROUNDS[rIdx];
    if (wIdx === 0) {
      setTimeLeft(round.timeLimit);
    }
    setScrambledWord(shuffleString(round.words[wIdx].answer));
    setInputValue('');
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < ROUNDS.length) {
      setCurrentRoundIdx(prev => prev + 1);
      setCurrentWordIdx(0);
      setGameState('playing');
      startRound(currentRoundIdx + 1, 0);
    } else {
      setGameState('game_won');
    }
  };

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const round = ROUNDS[currentRoundIdx];
    const currentWordObj = round.words[currentWordIdx];
    
    if (inputValue.toUpperCase() === currentWordObj.answer) {
      setUnlockedVignettes(prev => [...prev, currentWordObj.vignette]);
      
      if (currentWordIdx + 1 < round.words.length) {
        setCurrentWordIdx(prev => prev + 1);
        startRound(currentRoundIdx, currentWordIdx + 1);
      } else {
        setGameState('round_won');
      }
    } else {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const currentRound = ROUNDS[currentRoundIdx];
  const progress = ((currentWordIdx) / currentRound.words.length) * 100;

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 overflow-hidden relative flex flex-col items-center justify-center p-4">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-bl from-teal-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-gradient-to-t from-pink-400 to-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-4xl bg-white/40 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/50 p-8 flex flex-col md:flex-row gap-8">
        
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          <header className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 mb-2">Raise the Game</h1>
            <p className="text-purple-800 font-medium">Unscramble the words. Unlock an inclusive future.</p>
          </header>

          <AnimatePresence mode="wait">
            {gameState === 'start' && (
              <motion.div 
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center flex-1 py-12"
              >
                <Heart className="w-24 h-24 text-pink-500 mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-purple-900 mb-4 text-center">Ready to build a better industry?</h2>
                <button 
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  Start Playing
                </button>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col flex-1"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="text-lg font-bold text-purple-900">
                    Round {currentRoundIdx + 1}
                  </div>
                  <div className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-purple-800'}`}>
                    0:{timeLeft.toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="w-full bg-white/50 rounded-full h-3 mb-8 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex flex-col items-center justify-center flex-1 mb-8">
                  <div className="text-sm font-semibold text-purple-700 mb-2 uppercase tracking-widest">Unscramble This:</div>
                  <motion.div 
                    key={scrambledWord}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-black text-center text-gray-800 tracking-widest mb-8 break-words w-full"
                  >
                    {scrambledWord.split(' ').map((w, i) => (
                      <span key={i} className="inline-block mx-2 bg-white/60 px-4 py-2 rounded-xl shadow-inner">
                        {w}
                      </span>
                    ))}
                  </motion.div>

                  <form onSubmit={checkAnswer} className="w-full max-w-md relative">
                    <motion.div animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full px-6 py-4 text-2xl font-bold text-center text-purple-900 bg-white/80 border-4 border-purple-300 rounded-2xl focus:outline-none focus:border-pink-400 shadow-lg placeholder-purple-300 transition-colors uppercase"
                        autoFocus
                      />
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            )}

            {gameState === 'round_won' && (
              <motion.div 
                key="round_won"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center flex-1 py-12 text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-purple-900 mb-4">Round {currentRoundIdx + 1} Cleared!</h2>
                <p className="text-lg text-purple-800 mb-8 max-w-md">You're making the industry a better place, one word at a time.</p>
                <button 
                  onClick={handleNextRound}
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  {currentRoundIdx + 1 < ROUNDS.length ? 'Next Round' : 'Complete Game'}
                </button>
              </motion.div>
            )}

            {gameState === 'game_over' && (
              <motion.div 
                key="game_over"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center flex-1 py-12 text-center"
              >
                <h2 className="text-4xl font-black text-red-600 mb-4">Time's Up!</h2>
                <p className="text-xl text-purple-900 mb-8">Change takes time, but keep trying.</p>
                <button 
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {gameState === 'game_won' && (
              <motion.div 
                key="game_won"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center flex-1 py-12 text-center"
              >
                <div className="w-32 h-32 bg-gradient-to-tr from-yellow-300 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(251,191,36,0.6)]">
                  <Globe className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 mb-4">Inclusion Champion!</h2>
                <p className="text-xl text-purple-900 mb-8 max-w-md">You've unlocked all the vignettes and helped build a more equitable future for gaming.</p>
                <button 
                  onClick={startGame}
                  className="px-8 py-4 bg-white text-purple-700 font-bold rounded-full text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all border-2 border-purple-200"
                >
                  Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Panel: Unlocked Vignettes */}
        <div className="w-full md:w-80 bg-white/50 rounded-2xl p-6 border border-white/60 flex flex-col">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            Studio Gallery
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            <AnimatePresence>
              {unlockedVignettes.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-purple-700/60 font-medium italic text-sm"
                >
                  Solve words to unlock moments of inclusion...
                </motion.div>
              )}
              {unlockedVignettes.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (i % 4) }}
                    className="bg-white/80 rounded-xl p-4 shadow-sm border border-purple-100 flex gap-4 items-center group hover:bg-gradient-to-r hover:from-white hover:to-pink-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-900 text-sm leading-tight">{v.title}</h4>
                      <p className="text-xs text-purple-700 mt-1 leading-snug">{v.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
