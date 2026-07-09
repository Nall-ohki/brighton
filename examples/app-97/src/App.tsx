import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, Phone, ShieldCheck, DoorOpen, Trophy, ArrowRight } from 'lucide-react';
import './App.css';

const LEVELS = {
  indie: [
    "WWWWWWWWWWWW",
    "WP00B00W000W",
    "WWWWW1WW0W0W",
    "W0A0000W0W0W",
    "W3WWWWWW0W0W",
    "W000C400000W",
    "WWWWWWWWWW2W",
    "W000000000EW",
    "WWWWWWWWWWWW"
  ],
  aa: [
    "WWWWWWWWWWWWWW",
    "WP00002000B00W",
    "WWWW0WWWWWWW1W",
    "W0C00W0000000W",
    "W0WWWW0WWWWW0W",
    "W000400W00A00W",
    "WWWW00WW0WWWWW",
    "W00000030000EW",
    "WWWWWWWWWWWWWW"
  ],
  aaa: [
    "WWWWWWWWWWWWWWWW",
    "WP000A0W00000C0W",
    "WWWWW0WW0WWWW02W",
    "W0B030000W00000W",
    "W000WWWW0W0WWWWW",
    "W01000000000000W",
    "W0WWWWWWWWWWWWWW",
    "W0000000000004EW",
    "WWWWWWWWWWWWWWWW"
  ]
};

const BARRIER_INFO = {
  '1': { name: 'Stigma', dissolvedBy: 'B' },
  '2': { name: 'Manager Unaware', dissolvedBy: 'C' },
  '3': { name: 'No EAP', dissolvedBy: 'A' },
  '4': { name: 'No Time', dissolvedBy: 'C' },
};

const BEACON_INFO = {
  'B': { name: 'Safe In Our World', icon: HeartHandshake, color: '#F4A261' },
  'A': { name: 'Anonymous Helpline', icon: Phone, color: '#E9C46A' },
  'C': { name: 'Wellbeing Champion', icon: ShieldCheck, color: '#2A9D8F' },
};

export default function App() {
  const [level, setLevel] = useState('indie');
  const [grid, setGrid] = useState([]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [collected, setCollected] = useState(new Set());
  const [won, setWon] = useState(false);

  const initLevel = useCallback((levelName) => {
    const layout = LEVELS[levelName];
    let startX = 1, startY = 1;
    const parsedGrid = layout.map((row, y) => {
      return row.split('').map((cell, x) => {
        if (cell === 'P') {
          startX = x;
          startY = y;
          return '0';
        }
        return cell;
      });
    });
    setGrid(parsedGrid);
    setPlayer({ x: startX, y: startY });
    setCollected(new Set());
    setWon(false);
    setLevel(levelName);
  }, []);

  useEffect(() => {
    initLevel('indie');
  }, [initLevel]);

  const handleKeyDown = useCallback((e) => {
    if (won) return;
    
    const { x, y } = player;
    let dx = 0, dy = 0;
    
    if (e.key === 'ArrowUp' || e.key === 'w') dy = -1;
    else if (e.key === 'ArrowDown' || e.key === 's') dy = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'a') dx = -1;
    else if (e.key === 'ArrowRight' || e.key === 'd') dx = 1;
    else return;

    e.preventDefault();

    const nx = x + dx;
    const ny = y + dy;
    
    if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) return;
    
    const cell = grid[ny][nx];
    
    if (cell === 'W') return; // Wall
    
    if (['1', '2', '3', '4'].includes(cell)) {
      const requiredBeacon = BARRIER_INFO[cell].dissolvedBy;
      if (!collected.has(requiredBeacon)) return; // Blocked
    }

    if (cell === 'E') {
      setWon(true);
    }
    
    setPlayer({ x: nx, y: ny });
    
    if (['A', 'B', 'C'].includes(cell)) {
      if (!collected.has(cell)) {
        setCollected(prev => new Set(prev).add(cell));
        // Remove beacon from grid so it stops rendering
        const newGrid = [...grid];
        newGrid[ny] = [...newGrid[ny]];
        newGrid[ny][nx] = '0';
        setGrid(newGrid);
      }
    }
  }, [player, grid, collected, won]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderCell = (cell, x, y) => {
    const isPlayer = player.x === x && player.y === y;
    
    if (cell === 'W') {
      return <div key={`${x}-${y}`} className="cell wall glass" />;
    }
    
    if (['1', '2', '3', '4'].includes(cell)) {
      const info = BARRIER_INFO[cell];
      const isDissolved = collected.has(info.dissolvedBy);
      return (
        <AnimatePresence key={`${x}-${y}`}>
          {!isDissolved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0, rotate: 90 }}
              transition={{ duration: 0.5 }}
              className="cell barrier glass-red flex-center"
              title={`Barrier: ${info.name}`}
            >
              <span className="barrier-text">{info.name}</span>
            </motion.div>
          )}
        </AnimatePresence>
      );
    }

    if (['A', 'B', 'C'].includes(cell)) {
      const info = BEACON_INFO[cell];
      const Icon = info.icon;
      return (
        <motion.div
          key={`${x}-${y}`}
          initial={{ y: 0 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="cell beacon flex-center"
          title={info.name}
        >
          <Icon color={info.color} size={28} style={{ filter: `drop-shadow(0 0 8px ${info.color})` }} />
        </motion.div>
      );
    }

    if (cell === 'E') {
      return (
        <div key={`${x}-${y}`} className="cell exit flex-center">
          <DoorOpen color="#10B981" size={32} className="glow-green" />
        </div>
      );
    }

    return <div key={`${x}-${y}`} className="cell empty" />;
  };

  return (
    <div className="app-container">
      <div className="ambient-bg" />
      
      <header className="header glass-panel">
        <div className="title-area">
          <h1>Workplace Wellbeing Maze</h1>
          <p>Navigate barriers to mental health support</p>
        </div>
        <div className="level-selector">
          {['indie', 'aa', 'aaa'].map(lvl => (
            <button
              key={lvl}
              className={`btn ${level === lvl ? 'active' : ''}`}
              onClick={() => initLevel(lvl)}
            >
              {lvl.toUpperCase()} Studio
            </button>
          ))}
        </div>
      </header>

      <main className="game-area">
        <aside className="sidebar glass-panel">
          <h2>Support Network</h2>
          <div className="support-list">
            {Object.entries(BEACON_INFO).map(([key, info]) => {
              const isActive = collected.has(key);
              const Icon = info.icon;
              return (
                <div key={key} className={`support-item ${isActive ? 'active' : 'inactive'}`}>
                  <div className="icon-wrapper" style={{ backgroundColor: isActive ? `${info.color}33` : 'transparent' }}>
                    <Icon color={isActive ? info.color : '#666'} />
                  </div>
                  <span>{info.name}</span>
                </div>
              );
            })}
          </div>
          
          <div className="instructions">
            <h3>How to Play</h3>
            <p>Use WASD or Arrow Keys to move.</p>
            <p>Find beacons to dissolve barriers.</p>
            <p>Reach the exit to succeed!</p>
          </div>
        </aside>

        <div className="maze-container glass-panel">
          {won && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="victory-overlay glass-green"
            >
              <Trophy size={64} color="#F4A261" className="mb-4" />
              <h2>Support Network Established!</h2>
              <p>You've successfully navigated the barriers to mental health support.</p>
              <button className="btn primary mt-4" onClick={() => initLevel(level)}>
                Play Again
              </button>
            </motion.div>
          )}
          
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 40px)`,
              gridTemplateRows: `repeat(${grid.length || 0}, 40px)`
            }}
          >
            {grid.map((row, y) => (
              row.map((cell, x) => (
                <div key={`${x}-${y}`} className="cell-wrapper">
                  {renderCell(cell, x, y)}
                </div>
              ))
            ))}
            
            {/* Player Character */}
            <motion.div
              className="player"
              initial={false}
              animate={{ 
                x: player.x * 40, 
                y: player.y * 40 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="player-inner glow-player" />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
