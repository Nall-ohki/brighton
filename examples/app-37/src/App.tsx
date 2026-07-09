import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Cpu, Brain, Zap, AlertTriangle, Activity } from 'lucide-react';
import clsx from 'clsx';
import './App.css';

const MAZE_SIZE = 17; // Must be odd
const MAX_STEPS = 60;
const MAX_PLAY_CARDS = 3;

type CardType = 'Explore' | 'Exploit' | 'Reward+' | 'Penalty' | 'Meta-Learn';

interface Card {
  id: string;
  type: CardType;
  description: string;
}

const CARD_DEFS: Record<CardType, Omit<Card, 'id'>> = {
  'Explore': { type: 'Explore', description: 'Increase Epsilon. Agent makes more random moves to discover.' },
  'Exploit': { type: 'Exploit', description: 'Decrease Epsilon. Agent follows current optimal path greedily.' },
  'Reward+': { type: 'Reward+', description: 'Multiplies score gained for moving towards the goal.' },
  'Penalty': { type: 'Penalty', description: 'Agent remembers and avoids dead-ends heavily.' },
  'Meta-Learn': { type: 'Meta-Learn', description: 'Calculates and visualizes the exact shortest path.' },
};

function generateMaze(size: number) {
  const grid = Array.from({ length: size }, () => Array(size).fill(1));
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
  
  function dfs(x: number, y: number) {
    grid[y][x] = 0;
    visited[y][x] = true;
    const shuffled = [...dirs].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of shuffled) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && !visited[ny][nx]) {
        grid[y + dy / 2][x + dx / 2] = 0;
        dfs(nx, ny);
      }
    }
  }
  dfs(1, 1);
  return grid;
}

function getDistanceGradient(grid: number[][], goalX: number, goalY: number) {
  const dist = Array.from({ length: MAZE_SIZE }, () => Array(MAZE_SIZE).fill(Infinity));
  const queue: [number, number][] = [[goalX, goalY]];
  dist[goalY][goalX] = 0;
  
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let head = 0;
  
  while (head < queue.length) {
    const [x, y] = queue[head++];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && grid[ny][nx] === 0) {
        if (dist[ny][nx] > dist[y][x] + 1) {
          dist[ny][nx] = dist[y][x] + 1;
          queue.push([nx, ny]);
        }
      }
    }
  }
  return dist;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const drawCards = (count: number): Card[] => {
  const types: CardType[] = ['Explore', 'Exploit', 'Reward+', 'Penalty', 'Meta-Learn'];
  return Array.from({ length: count }, () => {
    const t = types[Math.floor(Math.random() * types.length)];
    return { id: generateId(), ...CARD_DEFS[t] };
  });
};

export default function App() {
  const [grid, setGrid] = useState<number[][]>([]);
  const [distGradient, setDistGradient] = useState<number[][]>([]);
  const [agentPos, setAgentPos] = useState({ x: 1, y: 1 });
  const [goalPos, setGoalPos] = useState({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
  
  const [epoch, setEpoch] = useState(1);
  const [score, setScore] = useState(0);
  const [epsilon, setEpsilon] = useState(0.8);
  const [rewardMult, setRewardMult] = useState(1);
  const [metaLearned, setMetaLearned] = useState(false);
  const [penalizedSpaces, setPenalizedSpaces] = useState<Set<string>>(new Set());
  
  const [hand, setHand] = useState<Card[]>([]);
  const [played, setPlayed] = useState<Card[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  
  const agentRef = useRef(agentPos);
  const isRunningRef = useRef(isRunning);
  
  // Update refs for use in intervals
  useEffect(() => { agentRef.current = agentPos; }, [agentPos]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  const initGame = useCallback(() => {
    const newGrid = generateMaze(MAZE_SIZE);
    setGrid(newGrid);
    setGoalPos({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
    setDistGradient(getDistanceGradient(newGrid, MAZE_SIZE - 2, MAZE_SIZE - 2));
    setAgentPos({ x: 1, y: 1 });
    setHand(drawCards(5));
    setPlayed([]);
    setScore(0);
    setEpoch(1);
    setEpsilon(0.8);
    setPenalizedSpaces(new Set());
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const executeRound = () => {
    if (played.length === 0) return;
    
    let newEpsilon = epsilon;
    let newMult = 1;
    let hasMeta = false;
    let hasPenalty = false;
    
    played.forEach(c => {
      if (c.type === 'Explore') newEpsilon = Math.min(1.0, newEpsilon + 0.2);
      if (c.type === 'Exploit') newEpsilon = Math.max(0.0, newEpsilon - 0.3);
      if (c.type === 'Reward+') newMult += 1;
      if (c.type === 'Meta-Learn') hasMeta = true;
      if (c.type === 'Penalty') hasPenalty = true;
    });
    
    setEpsilon(newEpsilon);
    setRewardMult(newMult);
    setMetaLearned(hasMeta);
    
    // Reset agent for new epoch run
    setAgentPos({ x: 1, y: 1 });
    setSteps(0);
    setIsRunning(true);
    setPlayed([]); // clear played area
    
    const runInterval = setInterval(() => {
      if (!isRunningRef.current) {
        clearInterval(runInterval);
        return;
      }
      
      setSteps(s => {
        const nextStep = s + 1;
        
        // Compute move
        setAgentPos(curr => {
          const { x, y } = curr;
          if (x === goalPos.x && y === goalPos.y) {
            clearInterval(runInterval);
            setIsRunning(false);
            setHand(drawCards(5));
            setEpoch(e => e + 1);
            setScore(sc => sc + 1000 * newMult);
            return curr;
          }
          
          if (nextStep > MAX_STEPS) {
            clearInterval(runInterval);
            setIsRunning(false);
            setHand(drawCards(5));
            setEpoch(e => e + 1);
            return curr;
          }
          
          const neighbors = [
            { nx: x, ny: y - 1 }, { nx: x, ny: y + 1 },
            { nx: x - 1, ny: y }, { nx: x + 1, ny: y }
          ].filter(n => grid[n.ny][n.nx] === 0);
          
          let chosen = neighbors[0];
          
          // Meta-Learn strictly follows gradient
          if (hasMeta) {
            chosen = neighbors.reduce((best, n) => 
              distGradient[n.ny][n.nx] < distGradient[best.ny][best.nx] ? n : best
            , neighbors[0]);
          } else {
            // Epsilon-greedy
            if (Math.random() < newEpsilon) {
              chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
            } else {
              // Exploit
              chosen = neighbors.reduce((best, n) => {
                let distN = distGradient[n.ny][n.nx];
                let distB = distGradient[best.ny][best.nx];
                // Penalty avoidance
                if (hasPenalty) {
                  if (penalizedSpaces.has(`${n.nx},${n.ny}`)) distN += 100;
                  if (penalizedSpaces.has(`${best.nx},${best.ny}`)) distB += 100;
                }
                return distN < distB ? n : best;
              }, neighbors[0]);
            }
          }
          
          // Apply penalty marking if moving away from goal (dead end heuristic)
          if (hasPenalty && distGradient[chosen.ny][chosen.nx] >= distGradient[y][x]) {
            setPenalizedSpaces(prev => new Set(prev).add(`${x},${y}`));
          }
          
          // Score update
          if (distGradient[chosen.ny][chosen.nx] < distGradient[y][x]) {
            setScore(sc => sc + 10 * newMult);
          } else {
            setScore(sc => sc - 5);
          }

          return { x: chosen.nx, y: chosen.ny };
        });
        
        return nextStep;
      });
      
    }, 150);
  };

  const playCard = (card: Card) => {
    if (played.length >= MAX_PLAY_CARDS) return;
    setHand(h => h.filter(c => c.id !== card.id));
    setPlayed(p => [...p, card]);
  };
  
  const unplayCard = (card: Card) => {
    setPlayed(p => p.filter(c => c.id !== card.id));
    setHand(h => [...h, card]);
  };

  const getIcon = (type: CardType) => {
    switch(type) {
      case 'Explore': return <Zap className="w-5 h-5" />;
      case 'Exploit': return <Brain className="w-5 h-5" />;
      case 'Reward+': return <Activity className="w-5 h-5" />;
      case 'Penalty': return <AlertTriangle className="w-5 h-5" />;
      case 'Meta-Learn': return <Cpu className="w-5 h-5" />;
    }
  };

  const getCardColor = (type: CardType) => {
    switch(type) {
      case 'Explore': return 'border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
      case 'Exploit': return 'border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
      case 'Reward+': return 'border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
      case 'Penalty': return 'border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      case 'Meta-Learn': return 'border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-cyan-50 font-mono flex flex-col md:flex-row overflow-hidden selection:bg-cyan-500/30">
      
      {/* LEFT PANEL */}
      <div className="w-full md:w-[400px] border-r border-cyan-900/50 bg-[#0f0f13] flex flex-col z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="p-6 border-b border-cyan-900/50 bg-gradient-to-b from-cyan-950/20 to-transparent">
          <h1 className="text-2xl font-bold tracking-widest text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] flex items-center gap-2">
            <Brain className="w-6 h-6" /> AGENT-57
          </h1>
          <p className="text-xs text-cyan-600 mb-6 uppercase tracking-wider">Neural Training Interface v0.9</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 border border-cyan-900/30 rounded p-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
              <div className="text-[10px] text-cyan-500 mb-1">EPOCH</div>
              <div className="text-2xl font-bold text-cyan-100">{epoch}</div>
            </div>
            <div className="bg-black/40 border border-cyan-900/30 rounded p-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-pink-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
              <div className="text-[10px] text-pink-500 mb-1">SCORE</div>
              <div className="text-2xl font-bold text-pink-100">{score}</div>
            </div>
            <div className="bg-black/40 border border-cyan-900/30 rounded p-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
              <div className="text-[10px] text-purple-500 mb-1">EPSILON (ε)</div>
              <div className="text-2xl font-bold text-purple-100">{epsilon.toFixed(2)}</div>
            </div>
            <div className="bg-black/40 border border-cyan-900/30 rounded p-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-green-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
              <div className="text-[10px] text-green-500 mb-1">REWARD MULT</div>
              <div className="text-2xl font-bold text-green-100">{rewardMult}x</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          
          {/* PLAYED CARDS */}
          <div>
            <div className="text-xs text-cyan-500 mb-3 flex justify-between items-center">
              <span>ACTIVE SEQUENCE ({played.length}/{MAX_PLAY_CARDS})</span>
            </div>
            <div className="flex gap-2 min-h-[120px] bg-black/20 p-2 rounded-lg border border-dashed border-cyan-900/30">
              <AnimatePresence>
                {played.map((card, idx) => (
                  <motion.div
                    layoutId={card.id}
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => !isRunning && unplayCard(card)}
                    className={clsx(
                      "flex-1 rounded border bg-black/80 p-2 cursor-pointer transition-transform hover:scale-105 flex flex-col items-center justify-center gap-2",
                      getCardColor(card.type),
                      isRunning && "opacity-50 pointer-events-none"
                    )}
                  >
                    {getIcon(card.type)}
                    <span className="text-[10px] font-bold tracking-wider">{card.type}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={executeRound}
            disabled={played.length === 0 || isRunning}
            className="w-full py-4 rounded bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 font-bold tracking-widest hover:bg-cyan-900/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
            <Play className="w-5 h-5" /> 
            {isRunning ? 'EXECUTING...' : 'EXECUTE EPOCH'}
          </button>

          {/* HAND */}
          <div className="flex-1">
            <div className="text-xs text-cyan-500 mb-3">HAND</div>
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {hand.map(card => (
                  <motion.div
                    layoutId={card.id}
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => !isRunning && playCard(card)}
                    className={clsx(
                      "rounded border bg-black/60 p-4 cursor-pointer transition-transform hover:scale-[1.02] relative overflow-hidden group",
                      getCardColor(card.type),
                      isRunning && "opacity-50 pointer-events-none"
                    )}
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 mb-2">
                      {getIcon(card.type)}
                      <span className="font-bold tracking-wider text-sm">{card.type}</span>
                    </div>
                    <p className="text-xs opacity-70 leading-relaxed font-sans">{card.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>

      {/* RIGHT PANEL - MAZE */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        {/* Cyberpunk background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] pointer-events-none" />
        
        <div className="relative">
          {grid.length > 0 && (
            <div 
              className="grid gap-[2px] p-4 bg-cyan-950/20 rounded-xl border border-cyan-900/30 shadow-[0_0_50px_rgba(0,255,255,0.05)]"
              style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, minmax(0, 1fr))` }}
            >
              {grid.map((row, y) => row.map((cell, x) => {
                const isWall = cell === 1;
                const isAgent = agentPos.x === x && agentPos.y === y;
                const isGoal = goalPos.x === x && goalPos.y === y;
                const isPenalized = penalizedSpaces.has(`${x},${y}`);
                const isMetaPath = metaLearned && !isWall && distGradient[y]?.[x] !== Infinity;
                
                return (
                  <div 
                    key={`${x}-${y}`}
                    className={clsx(
                      "w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-[2px] transition-colors duration-300 relative",
                      isWall ? "bg-cyan-950/40 border border-cyan-900/50" : "bg-black/50 border border-white/5",
                      isPenalized && !isWall && "bg-red-900/20 border-red-500/30",
                      isMetaPath && "after:absolute after:inset-0 after:bg-pink-500/10 after:border after:border-pink-500/20"
                    )}
                  >
                    {isGoal && (
                      <div className="absolute inset-[2px] bg-green-400 rounded shadow-[0_0_15px_rgba(74,222,128,1)] animate-pulse" />
                    )}
                    {isAgent && (
                      <motion.div 
                        layoutId="agent"
                        className="absolute inset-[2px] bg-pink-500 rounded shadow-[0_0_20px_rgba(236,72,153,1)] z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )}
                  </div>
                );
              }))}
            </div>
          )}
          
          {/* Status Overlay */}
          {isRunning && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-cyan-500/50 text-cyan-400 px-4 py-1 rounded text-sm font-bold tracking-widest flex items-center gap-2 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              SIMULATING ({steps}/{MAX_STEPS})
            </div>
          )}
        </div>
        
        <div className="absolute bottom-6 right-6 flex gap-4">
          <button
            onClick={initGame}
            disabled={isRunning}
            className="p-3 rounded-full bg-cyan-950/50 border border-cyan-900/50 text-cyan-500 hover:text-cyan-300 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50"
            title="Reset Simulation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
