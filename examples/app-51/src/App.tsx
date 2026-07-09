import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type LaneId = 0 | 1 | 2 | 3;
type PostType = 'social' | 'devlog' | 'trailer';

interface Note {
  id: string;
  lane: LaneId;
  spawnTime: number;
  targetTime: number;
  type: PostType;
  status: 'active' | 'hit' | 'missed' | 'fatigued';
}

interface ChannelState {
  fatigue: number; // 0 to 100
  algorithm: number; // 0 to 100
}

// --- Constants ---
const BPM = 120;
const BEAT_MS = 60000 / BPM; // 500ms
const FALL_TIME_MS = 2000; // Time it takes to fall from spawn to hit
const HIT_WINDOW_MS = 150;

const LANES = [
  { id: 0 as LaneId, name: 'Twitter', key: 'd', color: '#1DA1F2' },
  { id: 1 as LaneId, name: 'Reddit', key: 'f', color: '#FF4500' },
  { id: 2 as LaneId, name: 'Steam', key: 'j', color: '#66c0f4' },
  { id: 3 as LaneId, name: 'YouTube', key: 'k', color: '#FF0000' },
];

const INITIAL_CHANNEL_STATE = { fatigue: 0, algorithm: 100 };

// --- Main Component ---
export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [feedback, setFeedback] = useState<{text: string, color: string, id: number} | null>(null);

  // Use refs for values that change rapidly in the game loop
  const gameState = useRef({
    isPlaying: false,
    startTime: 0,
    currentTime: 0,
    notes: [] as Note[],
    score: 0,
    combo: 0,
    channels: [
      { ...INITIAL_CHANNEL_STATE },
      { ...INITIAL_CHANNEL_STATE },
      { ...INITIAL_CHANNEL_STATE },
      { ...INITIAL_CHANNEL_STATE },
    ],
    lastBeatTime: 0,
    beatCount: 0,
    gameOver: false,
  });

  // State exposed to React for rendering UI
  const [renderState, setRenderState] = useState({
    notes: [] as Note[],
    channels: [
      { ...INITIAL_CHANNEL_STATE },
      { ...INITIAL_CHANNEL_STATE },
      { ...INITIAL_CHANNEL_STATE },
      { ...INITIAL_CHANNEL_STATE },
    ],
    currentTime: 0,
  });

  const requestRef = useRef<number>();

  const showFeedback = (text: string, color: string) => {
    setFeedback({ text, color, id: Date.now() });
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setMultiplier(1);
    
    const now = performance.now();
    
    // Pre-generate notes for a minute
    const notes: Note[] = [];
    let time = now + FALL_TIME_MS + 1000; // Start first note 1 sec after falling starts
    for (let i = 0; i < 100; i++) {
      // random lane
      const lane = Math.floor(Math.random() * 4) as LaneId;
      // random gap: 1, 2, or 4 beats
      const beatsGap = [1, 2, 4][Math.floor(Math.random() * 3)];
      time += BEAT_MS * beatsGap;
      
      const typeRand = Math.random();
      const type: PostType = typeRand > 0.9 ? 'trailer' : typeRand > 0.7 ? 'devlog' : 'social';
      
      notes.push({
        id: `note-${i}`,
        lane,
        spawnTime: time - FALL_TIME_MS,
        targetTime: time,
        type,
        status: 'active'
      });
    }

    gameState.current = {
      isPlaying: true,
      startTime: now,
      currentTime: now,
      notes,
      score: 0,
      combo: 0,
      channels: [
        { ...INITIAL_CHANNEL_STATE },
        { ...INITIAL_CHANNEL_STATE },
        { ...INITIAL_CHANNEL_STATE },
        { ...INITIAL_CHANNEL_STATE },
      ],
      lastBeatTime: now,
      beatCount: 0,
      gameOver: false,
    };
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    gameState.current.isPlaying = false;
    gameState.current.gameOver = true;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const hitLane = useCallback((laneId: LaneId) => {
    if (!gameState.current.isPlaying) return;
    
    const now = performance.now();
    const state = gameState.current;
    
    // Find earliest active note in this lane
    const activeNotes = state.notes.filter(n => n.lane === laneId && n.status === 'active');
    activeNotes.sort((a, b) => a.targetTime - b.targetTime);
    const targetNote = activeNotes[0];

    let hitSuccess = false;

    if (targetNote) {
      const diff = Math.abs(targetNote.targetTime - now);
      if (diff <= HIT_WINDOW_MS) {
        // Hit!
        hitSuccess = true;
        
        // Check fatigue
        const channel = state.channels[laneId];
        if (channel.fatigue > 80) {
          // Audience fatigue!
          targetNote.status = 'fatigued';
          state.combo = 0;
          showFeedback('AUDIENCE FATIGUE!', '#ff0000');
        } else {
          targetNote.status = 'hit';
          state.combo += 1;
          const scoreAdd = diff <= HIT_WINDOW_MS / 3 ? 300 : 100;
          state.score += scoreAdd * Math.min(4, Math.floor(state.combo / 10) + 1);
          showFeedback(diff <= HIT_WINDOW_MS / 3 ? 'PERFECT' : 'GOOD', '#00ff00');
          
          // Apply effects to channel
          channel.fatigue = Math.min(100, channel.fatigue + 35);
          channel.algorithm = 100; // Reset algorithm penalty
        }
      }
    }

    if (!hitSuccess) {
      // Spamming empty lane -> penalty? Or maybe just ignore.
      // Let's add slight fatigue for spamming
      state.channels[laneId].fatigue = Math.min(100, state.channels[laneId].fatigue + 5);
    }

    setScore(state.score);
    setCombo(state.combo);
    setMultiplier(Math.min(4, Math.floor(state.combo / 10) + 1));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const lane = LANES.find(l => l.key === key);
    if (lane) {
      hitLane(lane.id);
    }
  }, [hitLane]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameLoop = (time: number) => {
    if (!gameState.current.isPlaying) return;
    const state = gameState.current;
    const dt = time - state.currentTime;
    state.currentTime = time;

    // Decay fatigue and algorithm
    if (time - state.lastBeatTime > 100) {
      state.channels.forEach(ch => {
        ch.fatigue = Math.max(0, ch.fatigue - 1.5);
        ch.algorithm = Math.max(0, ch.algorithm - 0.8);
        
        if (ch.algorithm === 0) {
          // Algorithm penalty!
          state.combo = 0;
          state.score = Math.max(0, state.score - 10);
        }
      });
      state.lastBeatTime = time;
    }

    // Check missed notes
    state.notes.forEach(note => {
      if (note.status === 'active' && time > note.targetTime + HIT_WINDOW_MS) {
        note.status = 'missed';
        state.combo = 0;
        showFeedback('MISSED', '#aaaaaa');
        setCombo(0);
        setMultiplier(1);
      }
    });

    // Check game over condition (e.g., all notes done or just time based)
    const allDone = state.notes.every(n => n.status !== 'active' && n.spawnTime < time);
    if (allDone && state.notes.length > 0) {
      endGame();
      return;
    }

    // Update UI state
    setRenderState({
      notes: [...state.notes.filter(n => n.spawnTime <= time && n.targetTime + 1000 >= time)],
      channels: [...state.channels],
      currentTime: time,
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#111115] text-[#eee] flex flex-col items-center justify-center font-mono overflow-hidden relative"
         style={{
           backgroundImage: `radial-gradient(circle at center, #2a2a35 0%, #111115 100%)`
         }}>
         
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }}></div>

      {/* Header */}
      <div className="absolute top-4 w-full px-8 flex justify-between items-start z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-[#ffb0b0]" style={{ textShadow: '2px 2px 0px #ff3b3b' }}>
            MARKETING MIXTAPE
          </h1>
          <p className="text-sm opacity-70 mt-1">Lo-fi Indie Dev Simulator</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{score.toLocaleString()}</div>
          <div className="text-xl text-[#66c0f4]">x{multiplier} <span className="opacity-50">({combo} Combo)</span></div>
        </div>
      </div>

      {!isPlaying && !gameOver && (
        <div className="z-20 flex flex-col items-center bg-[#1a1a24] p-8 rounded-lg border-2 border-[#333] shadow-2xl">
          <div className="w-64 h-32 bg-[#222] rounded mb-8 relative flex items-center justify-center border-4 border-[#111]">
            {/* Cassette tape visual */}
            <div className="absolute top-4 left-6 w-12 h-12 rounded-full border-4 border-[#333] flex items-center justify-center">
              <div className="w-4 h-4 bg-[#333] rounded-full"></div>
            </div>
            <div className="absolute top-4 right-6 w-12 h-12 rounded-full border-4 border-[#333] flex items-center justify-center">
              <div className="w-4 h-4 bg-[#333] rounded-full"></div>
            </div>
            <div className="absolute bottom-2 w-32 h-8 bg-[#111] rounded-sm"></div>
            <span className="text-[#ffb0b0] font-bold tracking-widest bg-[#111] px-2 py-1">MIX 01</span>
          </div>
          <h2 className="text-2xl mb-4">Press Keys to Post</h2>
          <div className="flex gap-4 mb-8">
            {LANES.map(l => (
              <div key={l.id} className="flex flex-col items-center">
                <div className="w-12 h-12 border-2 rounded flex items-center justify-center font-bold text-xl mb-2 shadow-lg"
                     style={{ borderColor: l.color, color: l.color }}>
                  {l.key.toUpperCase()}
                </div>
                <span className="text-xs">{l.name}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-center max-w-md opacity-80 mb-6">
            Hit the keys when notes reach the timeline. <br/>
            Watch out for <strong>Audience Fatigue</strong> (posting too much) <br/>
            and <strong>Algorithm Penalty</strong> (ignoring a channel).
          </p>
          <button 
            onClick={startGame}
            className="px-8 py-3 bg-[#e94560] text-white font-bold rounded shadow-[4px_4px_0px_#902030] hover:translate-y-1 hover:shadow-[0px_0px_0px_#902030] transition-all"
          >
            PLAY MIXTAPE
          </button>
        </div>
      )}

      {gameOver && (
        <div className="z-20 flex flex-col items-center bg-[#1a1a24] p-8 rounded-lg border-2 border-[#333] shadow-2xl">
          <h2 className="text-4xl font-bold mb-4 text-[#ffb0b0]">MIX FINISHED</h2>
          <div className="text-2xl mb-8">Final Score: {score.toLocaleString()}</div>
          <button 
            onClick={startGame}
            className="px-8 py-3 bg-[#e94560] text-white font-bold rounded shadow-[4px_4px_0px_#902030] hover:translate-y-1 hover:shadow-[0px_0px_0px_#902030] transition-all"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Game Area */}
      {isPlaying && (
        <div className="relative w-full max-w-4xl h-[600px] flex justify-center mt-12 bg-[#1a1a24] border-4 border-[#2a2a35] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {/* Cassette Tape background elements */}
          <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-20">
            <div className="w-[800px] h-[400px] border-[16px] border-[#333] rounded-[40px] flex justify-between px-20 items-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-40 h-40 border-[8px] border-[#444] rounded-full flex justify-center items-center">
                <div className="w-8 h-8 bg-[#444] rounded-full"></div>
              </motion.div>
              <div className="w-64 h-32 border-4 border-[#444] rounded-lg"></div>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-40 h-40 border-[8px] border-[#444] rounded-full flex justify-center items-center">
                <div className="w-8 h-8 bg-[#444] rounded-full"></div>
              </motion.div>
            </div>
          </div>

          <div className="flex w-full h-full px-12 relative z-10 justify-around">
            {LANES.map(lane => (
              <div key={lane.id} className="relative w-24 h-full border-x border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                
                {/* Channel Header Info */}
                <div className="absolute top-0 w-full h-24 bg-[#111] border-b-2 flex flex-col items-center justify-center" style={{ borderBottomColor: lane.color }}>
                  <span className="font-bold mb-1" style={{ color: lane.color }}>{lane.name}</span>
                  
                  {/* Meters */}
                  <div className="w-16 h-2 bg-[#333] rounded overflow-hidden mb-1 relative">
                    <div className="h-full bg-red-500 transition-all duration-100" style={{ width: `${renderState.channels[lane.id].fatigue}%` }}></div>
                  </div>
                  <div className="text-[10px] text-red-400 mb-1 leading-none">FATIGUE</div>
                  
                  <div className="w-16 h-2 bg-[#333] rounded overflow-hidden relative">
                    <div className="h-full bg-blue-400 transition-all duration-100" style={{ width: `${renderState.channels[lane.id].algorithm}%` }}></div>
                  </div>
                  <div className="text-[10px] text-blue-300 mt-[2px] leading-none">ALGORITHM</div>
                </div>

                {/* Timeline Bar (Target) */}
                <div className="absolute bottom-24 w-full h-4 flex items-center justify-center">
                  <div className="w-full h-1 bg-[rgba(255,255,255,0.3)] shadow-[0_0_10px_white]"></div>
                  <div className="absolute w-16 h-8 border-2 rounded flex items-center justify-center text-xl font-bold bg-[#111]"
                       style={{ borderColor: lane.color, color: lane.color, boxShadow: `0 0 15px ${lane.color}40` }}>
                    {lane.key.toUpperCase()}
                  </div>
                </div>

                {/* Notes */}
                {renderState.notes.filter(n => n.lane === lane.id).map(note => {
                  const progress = (renderState.currentTime - note.spawnTime) / FALL_TIME_MS;
                  // target is at bottom 24 (which is 96px from bottom). Total height 600px.
                  // spawn at -50px, target at 600 - 96 = 504px.
                  const startY = -50;
                  const targetY = 600 - 96 - 16; // centering
                  const y = startY + progress * (targetY - startY);

                  let opacity = 1;
                  let scale = 1;
                  if (note.status === 'hit') {
                    opacity = 0;
                    scale = 2;
                  } else if (note.status === 'missed') {
                    opacity = 0.2;
                  } else if (note.status === 'fatigued') {
                    opacity = 0;
                  }

                  // Different visual per post type
                  const isDevlog = note.type === 'devlog';
                  const isTrailer = note.type === 'trailer';

                  return (
                    <div 
                      key={note.id}
                      className="absolute left-1/2 w-16 h-12 -ml-8 flex flex-col items-center justify-center rounded shadow-lg transition-all duration-100"
                      style={{ 
                        transform: `translateY(${y}px) scale(${scale})`, 
                        opacity,
                        backgroundColor: note.status === 'active' ? lane.color : '#333',
                        border: isTrailer ? '2px solid white' : 'none',
                        borderRadius: isDevlog ? '50%' : '8px'
                      }}
                    >
                      <span className="text-white text-xs font-bold bg-black/50 px-1 rounded">{note.type}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Feedback popup */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -50, scale: 1.2 }}
                exit={{ opacity: 0, y: -100 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold tracking-widest z-50 pointer-events-none text-center"
                style={{ color: feedback.color, textShadow: '2px 2px 0px #000' }}
              >
                {feedback.text}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* Warning Overlays based on state */}
      {isPlaying && renderState.channels.some(c => c.fatigue > 80) && (
        <div className="fixed inset-0 pointer-events-none border-[16px] border-red-500/30 animate-pulse z-40"></div>
      )}
      {isPlaying && renderState.channels.some(c => c.algorithm < 20) && (
        <div className="fixed inset-0 pointer-events-none border-[16px] border-blue-500/30 animate-pulse z-40"></div>
      )}

    </div>
  );
}
