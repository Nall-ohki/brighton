import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// --- Constants & Types ---
const MAX_TIME = 60; // seconds before idea fades
const TOTAL_CONNECTIONS = 10;
const CHARACTERS = [
  { id: 0, color: '#fca5a5' }, // Pastel red
  { id: 1, color: '#6ee7b7' }, // Pastel green
  { id: 2, color: '#93c5fd' }, // Pastel blue
  { id: 3, color: '#fcd34d' }, // Pastel yellow
  { id: 4, color: '#c4b5fd' }, // Pastel purple
];

const CONSTRAINT_TYPES = ['Budget Limit', 'Time Box', 'Unclear Brief'];

interface Connection {
  source: number;
  target: number;
  id: string;
}

interface Token {
  id: string;
  type: string;
  color: string;
}

const getTokenColor = (type: string) => {
  switch (type) {
    case 'Budget Limit': return '#ffb3ba'; // Pastel pink
    case 'Time Box': return '#baffc9'; // Pastel green
    case 'Unclear Brief': return '#bae1ff'; // Pastel blue
    default: return '#ffffba';
  }
};

const generateToken = (): Token => {
  const type = CONSTRAINT_TYPES[Math.floor(Math.random() * CONSTRAINT_TYPES.length)];
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    color: getTokenColor(type),
  };
};

export default function App() {
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [ideaHealth, setIdeaHealth] = useState(100);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [tokens, setTokens] = useState<Token[]>([generateToken(), generateToken(), generateToken()]);
  const [activeInteractions, setActiveInteractions] = useState<{from: number, to: number, id: string}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setIdeaHealth((prev) => {
        if (prev <= 1) {
          setGameState('lost');
          return 0;
        }
        return prev - (100 / MAX_TIME) * 0.1; // runs 10 times a second
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState]);

  // Win condition check
  useEffect(() => {
    if (connections.length >= TOTAL_CONNECTIONS && gameState === 'playing') {
      setGameState('won');
    }
  }, [connections, gameState]);

  const addRandomConnection = () => {
    setConnections(prev => {
      if (prev.length >= TOTAL_CONNECTIONS) return prev;
      let src, tgt;
      let attempts = 0;
      let found = false;
      while (attempts < 50) {
        src = Math.floor(Math.random() * 5);
        tgt = Math.floor(Math.random() * 5);
        if (src !== tgt) {
          const exists = prev.find(c => (c.source === src && c.target === tgt) || (c.source === tgt && c.target === src));
          if (!exists) {
            found = true;
            break;
          }
        }
        attempts++;
      }
      if (found && src !== undefined && tgt !== undefined) {
        // Animate interaction
        const interactionId = Math.random().toString();
        setActiveInteractions(curr => [...curr, {from: src, to: tgt, id: interactionId}]);
        setTimeout(() => {
          setActiveInteractions(curr => curr.filter(i => i.id !== interactionId));
          setConnections(c => [...c, { source: src, target: tgt, id: `${src}-${tgt}` }]);
        }, 1000);
        return prev; // We don't add it immediately, we add it after animation
      }
      return prev;
    });
  };

  const removeRandomConnection = () => {
    setConnections(prev => {
      if (prev.length === 0) return prev;
      const indexToRemove = Math.floor(Math.random() * prev.length);
      const newConns = [...prev];
      const removed = newConns.splice(indexToRemove, 1)[0];
      
      // Animate breaking
      const interactionId = Math.random().toString();
      setActiveInteractions(curr => [...curr, {from: removed.source, to: removed.target, id: interactionId}]);
      setTimeout(() => {
        setActiveInteractions(curr => curr.filter(i => i.id !== interactionId));
      }, 500);

      return newConns;
    });
  };

  const handleTokenDrop = (token: Token) => {
    // Remove token and generate a new one
    setTokens(prev => prev.filter(t => t.id !== token.id).concat(generateToken()));

    // Apply effects based on token
    if (token.type === 'Budget Limit') {
      addRandomConnection();
      addRandomConnection();
      if (Math.random() > 0.5) removeRandomConnection();
    } else if (token.type === 'Time Box') {
      addRandomConnection();
      // Decrease health slightly but add connection
      setIdeaHealth(h => Math.max(1, h - 5));
    } else if (token.type === 'Unclear Brief') {
      removeRandomConnection();
      removeRandomConnection();
      setTimeout(() => {
        addRandomConnection();
        addRandomConnection();
        addRandomConnection();
      }, 1500);
    }
  };

  const orbitRadius = 130;
  const centerPos = 200; // Half of 400px container

  return (
    <div className="app-container">
      {/* SVG Filters for Hand-drawn effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="handdrawn" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="handdrawn-light" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <header className="header">
        <h1>Building Game Teams</h1>
        <p>Drag constraint tokens to the team to build trust before the idea fades!</p>
        <div className="status-bar">
          <div className="cohesion">Team Cohesion: {Math.min(100, Math.floor((connections.length / TOTAL_CONNECTIONS) * 100))}%</div>
          <div className="idea-health">Idea Clarity: {Math.floor(ideaHealth)}%</div>
        </div>
      </header>

      <div className="simulation-area" ref={containerRef}>
        {/* Orbiting Container */}
        <motion.div 
          className="orbit-container"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {/* Central Game Idea Node */}
          <div 
            className="idea-node"
            style={{ 
              opacity: ideaHealth / 100,
              boxShadow: `0 0 ${ideaHealth / 2}px ${ideaHealth / 5}px rgba(253, 224, 71, 0.6)`
            }}
          >
            <span>Idea</span>
          </div>

          {/* Edges */}
          <svg className="connections-svg" viewBox="0 0 400 400">
            {connections.map((conn, i) => {
              const a1 = (conn.source * 2 * Math.PI) / 5;
              const a2 = (conn.target * 2 * Math.PI) / 5;
              const x1 = centerPos + orbitRadius * Math.sin(a1);
              const y1 = centerPos - orbitRadius * Math.cos(a1);
              const x2 = centerPos + orbitRadius * Math.sin(a2);
              const y2 = centerPos - orbitRadius * Math.cos(a2);
              
              // Curve control point
              const cx = (x1 + x2) / 2 + (Math.random() * 20 - 10);
              const cy = (y1 + y2) / 2 + (Math.random() * 20 - 10);

              return (
                <motion.path
                  key={conn.id}
                  d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                  stroke="#4a5568"
                  strokeWidth="3"
                  fill="none"
                  className="hand-drawn-path"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              );
            })}

            {/* Active interaction animations (arrows) */}
            <AnimatePresence>
              {activeInteractions.map((interaction) => {
                const a1 = (interaction.from * 2 * Math.PI) / 5;
                const a2 = (interaction.to * 2 * Math.PI) / 5;
                const x1 = centerPos + orbitRadius * Math.sin(a1);
                const y1 = centerPos - orbitRadius * Math.cos(a1);
                const x2 = centerPos + orbitRadius * Math.sin(a2);
                const y2 = centerPos - orbitRadius * Math.cos(a2);
                
                return (
                  <motion.circle
                    key={interaction.id}
                    r="6"
                    fill="#ef4444"
                    initial={{ cx: x1, cy: y1, opacity: 1 }}
                    animate={{ cx: x2, cy: y2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="hand-drawn-light"
                  />
                );
              })}
            </AnimatePresence>
          </svg>

          {/* Characters */}
          {CHARACTERS.map((char, index) => {
            const angle = (index * 2 * Math.PI) / 5;
            const x = centerPos + orbitRadius * Math.sin(angle);
            const y = centerPos - orbitRadius * Math.cos(angle);

            return (
              <motion.div
                key={char.id}
                className="character"
                style={{ 
                  left: x, 
                  top: y, 
                  backgroundColor: char.color 
                }}
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              >
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Constraints Tokens Area */}
      <div className="tokens-area">
        <AnimatePresence>
          {tokens.map((token) => (
            <motion.div
              key={token.id}
              className="token"
              style={{ backgroundColor: token.color }}
              drag
              dragSnapToOrigin
              onDragEnd={(e, info) => {
                // If dragged near the center of the screen
                const dropArea = containerRef.current?.getBoundingClientRect();
                if (dropArea) {
                  const centerX = dropArea.left + dropArea.width / 2;
                  const centerY = dropArea.top + dropArea.height / 2;
                  const dist = Math.hypot(info.point.x - centerX, info.point.y - centerY);
                  if (dist < 180) {
                    handleTokenDrop(token);
                  }
                }
              }}
              whileDrag={{ scale: 1.1, rotate: 5, zIndex: 10, cursor: 'grabbing' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              {token.type}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {gameState !== 'playing' && (
          <motion.div 
            className="game-over-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="modal hand-drawn-box">
              <h2>{gameState === 'won' ? 'Team Cohesion Achieved!' : 'The Idea Faded...'}</h2>
              <p>{gameState === 'won' ? 'The team united to tackle the constraints.' : 'Without enough trust, the constraints crushed the vision.'}</p>
              <button 
                className="hand-drawn-btn"
                onClick={() => {
                  setGameState('playing');
                  setIdeaHealth(100);
                  setConnections([]);
                  setTokens([generateToken(), generateToken(), generateToken()]);
                }}
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
