import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

interface Point {
  x: number;
  y: number;
}

interface Level {
  id: number;
  faction: string;
  lore: string[];
  svg: React.ReactNode;
  errorBox: { x: number; y: number; width: number; height: number };
}

const levels: Level[] = [
  {
    id: 1,
    faction: 'The Crimson Guard',
    lore: [
      'Heavy steel armor is mandatory.',
      'Insignia is always a red lion.',
      'Polearms must have a wooden shaft, never metal.'
    ],
    svg: (
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        <rect width="500" height="500" fill="#e0e0e0" />
        <rect x="200" y="150" width="100" height="150" fill="#888" rx="10"/>
        <circle cx="250" cy="100" r="40" fill="#999" />
        <circle cx="250" cy="200" r="20" fill="#d32f2f" />
        <rect x="210" y="300" width="30" height="100" fill="#777" />
        <rect x="260" y="300" width="30" height="100" fill="#777" />
        <rect x="150" y="50" width="15" height="400" fill="#b0bec5" />
        <polygon points="150,50 165,50 157.5,10" fill="#546e7a" />
      </svg>
    ),
    errorBox: { x: 130, y: 30, width: 50, height: 440 }
  },
  {
    id: 2,
    faction: 'Zenith Faction',
    lore: [
      'Spaceships use exclusively hexagonal thrusters.',
      'The Zenith logo is a pure white star.',
      'Powered entirely by dark matter (no solar panels allowed).'
    ],
    svg: (
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        <rect width="500" height="500" fill="#1a1a2e" />
        <polygon points="250,50 350,350 150,350" fill="#0f3460" />
        <polygon points="250,200 260,230 290,230 265,250 275,280 250,260 225,280 235,250 210,230 240,230" fill="#fff" />
        <polygon points="230,350 270,350 290,370 270,390 230,390 210,370" fill="#e94560" />
        <rect x="50" y="250" width="100" height="40" fill="#4caf50" stroke="#fff" strokeWidth="2" />
        <rect x="350" y="250" width="100" height="40" fill="#4caf50" stroke="#fff" strokeWidth="2" />
      </svg>
    ),
    errorBox: { x: 30, y: 230, width: 440, height: 80 }
  },
  {
    id: 3,
    faction: 'ByteMe Corp',
    lore: [
      'Neon color palette is strictly Cyan and Magenta.',
      'Cybernetic limbs must show exposed wiring.',
      'The corporate logo is a white skull.'
    ],
    svg: (
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        <rect width="500" height="500" fill="#111" />
        <rect x="180" y="200" width="140" height="250" fill="#e91e63" />
        <rect x="120" y="220" width="60" height="150" fill="#333" />
        <path d="M 130 230 Q 150 280 130 350" stroke="#00bcd4" strokeWidth="3" fill="none"/>
        <circle cx="250" cy="300" r="25" fill="#fff" />
        <rect x="235" y="320" width="30" height="15" fill="#fff" />
        <circle cx="250" cy="130" r="50" fill="#ffb74d" />
        <rect x="200" y="110" width="100" height="30" fill="#ffeb3b" rx="10" />
      </svg>
    ),
    errorBox: { x: 190, y: 100, width: 120, height: 50 }
  },
  {
    id: 4,
    faction: 'Aethelgard Steampunk',
    lore: [
      'Electricity is strictly forbidden.',
      'All lights must be gas-powered, emitting an orange glow.',
      'Gears must be constructed of bronze or copper.'
    ],
    svg: (
      <svg viewBox="0 0 500 500" width="100%" height="100%">
        <rect width="500" height="500" fill="#3e2723" />
        <circle cx="100" cy="400" r="80" fill="#bf360c" stroke="#3e2723" strokeWidth="10" strokeDasharray="20 10"/>
        <rect x="400" y="100" width="30" height="400" fill="#e64a19" />
        <rect x="245" y="0" width="10" height="100" fill="#000" />
        <circle cx="250" cy="120" r="30" fill="#03a9f4" />
        <polygon points="220,120 280,120 250,80" fill="#757575" />
      </svg>
    ),
    errorBox: { x: 210, y: 70, width: 80, height: 90 }
  }
];

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [status, setStatus] = useState<'none' | 'success' | 'error'>('none');
  const [statusMsg, setStatusMsg] = useState('');

  const activeLevel = levels[currentLevelIndex];
  const visibleLore = levels.slice(0, currentLevelIndex + 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'red';

    const drawPath = (path: Point[]) => {
      if (path.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    };

    paths.forEach(drawPath);
    if (currentPath.length > 0) {
      drawPath(currentPath);
    }
  }, [paths, currentPath]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setCurrentPath([getCanvasCoords(e)]);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    setCurrentPath(prev => [...prev, getCanvasCoords(e)]);
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath([]);
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const submitFeedback = () => {
    if (paths.length === 0) {
      showStatus('error', 'You must circle the error before submitting.');
      return;
    }

    const { errorBox } = activeLevel;
    let hitError = false;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (const path of paths) {
      for (const p of path) {
        if (
          p.x >= errorBox.x - 20 &&
          p.x <= errorBox.x + errorBox.width + 20 &&
          p.y >= errorBox.y - 20 &&
          p.y <= errorBox.y + errorBox.height + 20
        ) {
          hitError = true;
        }
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }

    const pathWidth = maxX - minX;
    const pathHeight = maxY - minY;

    if (hitError && pathWidth < 300 && pathHeight < 300) {
      showStatus('success', 'Good eye, Director. Lore consistency maintained.');
      setTimeout(() => {
        if (currentLevelIndex < levels.length - 1) {
          setCurrentLevelIndex(c => c + 1);
          clearCanvas();
        } else {
          setGameState('end');
        }
      }, 2000);
    } else {
      showStatus('error', 'Incorrect feedback. The artist is confused.');
      setTimeout(() => {
        clearCanvas();
      }, 2000);
    }
  };

  const showStatus = (type: 'success' | 'error', msg: string) => {
    setStatus(type);
    setStatusMsg(msg);
  };

  return (
    <div className="desk">
      {gameState === 'start' && (
        <div className="overlay">
          <h1>Art Director</h1>
          <p>
            Welcome to the Studio. Your job is to maintain visual cohesion across the project's long development cycle. 
            Review the incoming art pieces against the Studio Lore Bible. 
            Use your red marker to circle elements that break the established mythology, then submit feedback.
          </p>
          <button onClick={() => setGameState('playing')}>Start Shift</button>
        </div>
      )}

      {gameState === 'end' && (
        <div className="overlay">
          <h1>Shift Complete</h1>
          <p>You've successfully maintained the lore integrity across all factions. The development team thanks you!</p>
          <button onClick={() => {
            setCurrentLevelIndex(0);
            clearCanvas();
            setGameState('start');
          }}>Play Again</button>
        </div>
      )}

      <div className="lore-bible">
        <h2>Studio Lore Bible</h2>
        <p><em>Target Identity Guidelines v1.{currentLevelIndex}</em></p>
        <AnimatePresence>
          {visibleLore.map((level) => (
            <motion.div 
              key={level.id}
              className="lore-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3>{level.faction}</h3>
              <ul>
                {level.lore.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="art-desk">
        <AnimatePresence mode="wait">
          {status !== 'none' && (
            <motion.div 
              className={`status-message status-${status}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {statusMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="canvas-container"
          key={activeLevel.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="svg-layer">
            {activeLevel.svg}
          </div>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="drawing-layer"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </motion.div>

        <div className="controls">
          <button className="btn-clear" onClick={clearCanvas}>Clear Ink</button>
          <button className="btn-submit" onClick={submitFeedback}>Submit Feedback</button>
        </div>
      </div>
    </div>
  );
}
