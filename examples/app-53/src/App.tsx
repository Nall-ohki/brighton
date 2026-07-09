import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Coffee, Moon, Heart, Briefcase, User, MessageCircle, Share2, Wind, AlertTriangle, Pause, Play } from 'lucide-react';
import './App.css';

// Vignette definitions
const VIGNETTES = {
  rest: {
    title: 'Taking a Rest',
    text: 'You close your eyes and listen to the steady rhythm of your breathing. The weight of the world lifts, if only for a moment.',
    color: '#8b9dc3',
    icon: Moon,
    effects: { sleep: 30, energy: 20, passion: 0, burnout: -15, tasks: 0 }
  },
  talk: {
    title: 'A Honest Chat',
    text: 'You open up to a friend. The words tumble out messy and raw, but feeling heard is a balm to your weary soul.',
    color: '#e4b7b7',
    icon: MessageCircle,
    effects: { sleep: 0, energy: 10, passion: 30, burnout: -20, tasks: 0 }
  },
  delegate: {
    title: 'Letting Go',
    text: 'You pass some of your burdens to others. It is hard to trust, but watching them succeed brings a quiet relief.',
    color: '#c2b280',
    icon: Share2,
    effects: { sleep: 5, energy: 10, passion: 5, burnout: -10, tasks: -5 }
  },
  walk: {
    title: 'A Quiet Walk',
    text: 'The crisp air fills your lungs. You notice the rustling leaves and the vast sky, remembering there is a world outside your desk.',
    color: '#a3c1ad',
    icon: Wind,
    effects: { sleep: 10, energy: 20, passion: 20, burnout: -15, tasks: 0 }
  }
};

export default function App() {
  const [energy, setEnergy] = useState(100);
  const [sleep, setSleep] = useState(100);
  const [passion, setPassion] = useState(100);
  const [burnout, setBurnout] = useState(0);
  const [tasks, setTasks] = useState(0);
  const [gameState, setGameState] = useState<'working' | 'paused' | 'vignette' | 'gameover'>('working');
  const [activeVignette, setActiveVignette] = useState<keyof typeof VIGNETTES | null>(null);

  const loopRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());

  // Game loop
  useEffect(() => {
    if (gameState !== 'working') return;

    const loop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setEnergy(e => Math.max(0, e - 2 * dt));
      setSleep(s => Math.max(0, s - 1.5 * dt));
      setPassion(p => Math.max(0, p - 1 * dt));
      
      setTasks(t => Math.min(20, t + 0.5 * dt));

      setBurnout(b => {
        // Burnout increases if resources are low or tasks are high
        let bRate = 0;
        if (energy < 30) bRate += 2;
        if (sleep < 30) bRate += 2;
        if (passion < 30) bRate += 2;
        if (tasks > 10) bRate += (tasks - 10) * 0.5;
        
        // Natural recovery if things are okay
        if (energy > 50 && sleep > 50 && passion > 50 && tasks < 5) bRate -= 1;

        const newB = Math.max(0, Math.min(100, b + bRate * dt));
        if (newB >= 100) {
          setGameState('gameover');
        }
        return newB;
      });

      loopRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    loopRef.current = requestAnimationFrame(loop);

    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [gameState, energy, sleep, passion, tasks]);

  const togglePause = () => {
    if (gameState === 'working') setGameState('paused');
    else if (gameState === 'paused') setGameState('working');
  };

  const triggerVignette = (key: keyof typeof VIGNETTES) => {
    setActiveVignette(key);
    setGameState('vignette');
  };

  const closeVignette = () => {
    if (activeVignette) {
      const effects = VIGNETTES[activeVignette].effects;
      setEnergy(e => Math.min(100, e + effects.energy));
      setSleep(s => Math.min(100, s + effects.sleep));
      setPassion(p => Math.min(100, p + effects.passion));
      setBurnout(b => Math.max(0, b + effects.burnout));
      setTasks(t => Math.max(0, t + effects.tasks));
    }
    setActiveVignette(null);
    setGameState('working');
  };

  const restart = () => {
    setEnergy(100);
    setSleep(100);
    setPassion(100);
    setBurnout(0);
    setTasks(0);
    setGameState('working');
  };

  // Warning signals
  const isShaking = burnout > 60;
  const greyness = Math.max(0, Math.min(1, (burnout - 70) / 30));

  return (
    <div 
      className="app-container" 
      style={{ 
        filter: `grayscale(${greyness * 100}%) sepia(${greyness * 20}%)`,
        transition: 'filter 2s ease-in-out'
      }}
    >
      {/* Background blobs for watercolor feel */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {gameState === 'gameover' ? (
        <div className="game-over-screen">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="game-over-content"
          >
            <h1>Burnout</h1>
            <p>The screen goes dark. You can't type another line. Your body has forced you to stop.</p>
            <p className="subtext">Recovery is a long road. Next time, listen to the quiet warnings.</p>
            <button onClick={restart} className="action-button primary">Try Again</button>
          </motion.div>
        </div>
      ) : (
        <div className="game-ui">
          <header className="top-bar">
            <div className="meters">
              <Meter icon={Coffee} label="Energy" value={energy} color="#d4a373" />
              <Meter icon={Moon} label="Sleep" value={sleep} color="#8b9dc3" />
              <Meter icon={Heart} label="Passion" value={passion} color="#e4b7b7" />
            </div>
            
            <div className="burnout-meter-container">
              <div className="burnout-label">
                <AlertTriangle size={16} color={burnout > 80 ? '#d62828' : '#333'} />
                <span>Burnout Risk</span>
              </div>
              <div className="burnout-bar-bg">
                <motion.div 
                  className="burnout-bar-fill"
                  style={{ 
                    width: `${burnout}%`,
                    backgroundColor: burnout > 80 ? '#d62828' : burnout > 50 ? '#f77f00' : '#333'
                  }}
                  animate={burnout > 80 ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              </div>
            </div>
          </header>

          <main className="main-desk">
            <motion.div 
              className={`desk-scene ${isShaking ? 'shaking' : ''}`}
            >
              <div className="character">
                <User size={80} strokeWidth={1} color="#555" />
                {burnout > 50 && (
                  <motion.div 
                    className="sweat-drop"
                    animate={{ y: [0, 10, 20], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </div>
              
              <div className="desk">
                <div className="laptop">
                  <div className="screen" style={{ opacity: gameState === 'working' ? 1 : 0.2 }} />
                  <div className="keyboard" />
                </div>
                
                <div className="tasks-pile">
                  {Array.from({ length: Math.floor(tasks) }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      className="task-paper"
                      initial={{ y: -50, opacity: 0, rotate: Math.random() * 20 - 10 }}
                      animate={{ y: 0, opacity: 1, rotate: Math.random() * 20 - 10 }}
                      style={{ 
                        left: `${Math.random() * 60}%`, 
                        bottom: `${i * 2}px`,
                        zIndex: i
                      }}
                    />
                  ))}
                  {tasks === 0 && <span className="no-tasks">Clear desk</span>}
                </div>
              </div>
            </motion.div>
          </main>

          <footer className="action-bar">
            <div className="controls">
              <button onClick={togglePause} className="icon-btn" disabled={gameState === 'vignette'}>
                {gameState === 'paused' ? <Play size={24} /> : <Pause size={24} />}
              </button>
              <span className="status-text">
                {gameState === 'working' ? 'Working...' : gameState === 'paused' ? 'Paused' : 'Reflecting'}
              </span>
            </div>

            <div className="self-care-actions" style={{ opacity: gameState === 'paused' ? 1 : 0.5, pointerEvents: gameState === 'paused' ? 'auto' : 'none' }}>
              <button className="action-btn rest" onClick={() => triggerVignette('rest')}>
                <Moon size={18} /> Rest
              </button>
              <button className="action-btn talk" onClick={() => triggerVignette('talk')}>
                <MessageCircle size={18} /> Talk
              </button>
              <button className="action-btn delegate" onClick={() => triggerVignette('delegate')}>
                <Share2 size={18} /> Delegate
              </button>
              <button className="action-btn walk" onClick={() => triggerVignette('walk')}>
                <Wind size={18} /> Walk
              </button>
            </div>
          </footer>

          {/* Vignette Overlay */}
          <AnimatePresence>
            {gameState === 'vignette' && activeVignette && (
              <motion.div 
                className="vignette-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ backgroundColor: `${VIGNETTES[activeVignette].color}E6` }} // 90% opacity
              >
                <motion.div 
                  className="vignette-content"
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {React.createElement(VIGNETTES[activeVignette].icon, { size: 64, strokeWidth: 1, className: 'vignette-icon' })}
                  <h2>{VIGNETTES[activeVignette].title}</h2>
                  <p>{VIGNETTES[activeVignette].text}</p>
                  <button onClick={closeVignette} className="action-button">Return to work</button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Meter({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="meter">
      <div className="meter-label">
        <Icon size={14} color={color} />
        <span>{label}</span>
      </div>
      <div className="meter-bar-bg">
        <div 
          className="meter-bar-fill" 
          style={{ width: `${value}%`, backgroundColor: color }} 
        />
      </div>
    </div>
  );
}
