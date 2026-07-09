import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Server, Shield, MessageSquare, Terminal, Users, Clock, AlertOctagon, Activity } from 'lucide-react';

const TOTAL_HOURS = 36;
const TARGET_PLAYERS = 1000000;
const REAL_SECONDS_PER_GAME_HOUR = 4; // 36 hours * 4s = 144 seconds total game time

type EventType = 'POWER_CUT' | 'SERVER_OUTAGE' | 'EVACUATION';

interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  chaosRate: number; // per second
  playerGrowthMultiplier: number;
  icon: React.FC<any>;
}

const EVENT_DEFS: Record<EventType, Omit<GameEvent, 'id'>> = {
  POWER_CUT: {
    type: 'POWER_CUT',
    name: 'Power Cut (Blackout)',
    chaosRate: 1.5,
    playerGrowthMultiplier: 0.4,
    icon: Zap,
  },
  SERVER_OUTAGE: {
    type: 'SERVER_OUTAGE',
    name: 'Server Overload',
    chaosRate: 2.0,
    playerGrowthMultiplier: 0,
    icon: Server,
  },
  EVACUATION: {
    type: 'EVACUATION',
    name: 'Air Raid Alert',
    chaosRate: 3.5,
    playerGrowthMultiplier: 0.1,
    icon: AlertTriangle,
  }
};

export default function App() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WON' | 'LOST'>('START');
  
  const [hoursLeft, setHoursLeft] = useState(TOTAL_HOURS);
  const [players, setPlayers] = useState(0);
  const [chaos, setChaos] = useState(0);
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([]);
  
  const [workHaltedTimer, setWorkHaltedTimer] = useState(0);
  
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  const lastTickRef = useRef(Date.now());
  const reqRef = useRef<number>();

  const startGame = () => {
    setGameState('PLAYING');
    setHoursLeft(TOTAL_HOURS);
    setPlayers(0);
    setChaos(0);
    setActiveEvents([]);
    setCooldowns({});
    setWorkHaltedTimer(0);
    lastTickRef.current = Date.now();
  };

  const handleAction = (actionId: string) => {
    if (cooldowns[actionId] > 0) return;

    let newCooldown = 0;
    
    switch (actionId) {
      case 'COMMUNICATE':
        setPlayers(p => Math.min(TARGET_PLAYERS, p + 15000));
        setChaos(c => Math.max(0, c - 10));
        newCooldown = 10;
        break;
      case 'PUSH_PATCH':
        setActiveEvents(events => events.filter(e => e.type !== 'SERVER_OUTAGE'));
        setChaos(c => Math.max(0, c - 15));
        newCooldown = 8;
        break;
      case 'GENERATOR':
        setActiveEvents(events => events.filter(e => e.type !== 'POWER_CUT'));
        setChaos(c => Math.max(0, c - 5));
        newCooldown = 12;
        break;
      case 'SHELTER':
        setActiveEvents(events => events.filter(e => e.type !== 'EVACUATION'));
        setChaos(c => Math.max(0, c - 25));
        setWorkHaltedTimer(5); // Halt work for 5 real seconds
        newCooldown = 15;
        break;
      case 'CRUNCH':
        setPlayers(p => Math.min(TARGET_PLAYERS, p + 25000));
        setChaos(c => Math.min(100, c + 15));
        newCooldown = 5;
        break;
    }

    if (newCooldown > 0) {
      setCooldowns(prev => ({ ...prev, [actionId]: newCooldown }));
    }
  };

  const gameLoop = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    const now = Date.now();
    const dt = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;

    // Update time
    setHoursLeft(h => {
      const newH = h - (dt / REAL_SECONDS_PER_GAME_HOUR);
      if (newH <= 0) return 0;
      return newH;
    });

    // Update cooldowns
    setCooldowns(prev => {
      const next = { ...prev };
      let changed = false;
      for (const k in next) {
        if (next[k] > 0) {
          next[k] = Math.max(0, next[k] - dt);
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    // Update work halted
    setWorkHaltedTimer(prev => Math.max(0, prev - dt));

    setActiveEvents(events => {
      let currentEvents = [...events];
      
      // Random event spawning
      if (Math.random() < 0.03 * dt) {
        if (!currentEvents.some(e => e.type === 'EVACUATION')) {
          currentEvents.push({ ...EVENT_DEFS.EVACUATION, id: Math.random().toString() });
        }
      } else if (Math.random() < 0.05 * dt) {
        if (!currentEvents.some(e => e.type === 'POWER_CUT')) {
          currentEvents.push({ ...EVENT_DEFS.POWER_CUT, id: Math.random().toString() });
        }
      } else if (Math.random() < 0.06 * dt) {
        if (!currentEvents.some(e => e.type === 'SERVER_OUTAGE')) {
          currentEvents.push({ ...EVENT_DEFS.SERVER_OUTAGE, id: Math.random().toString() });
        }
      }
      return currentEvents;
    });

    // Calculate player growth
    setWorkHaltedTimer(halted => {
      setActiveEvents(events => {
        let playerMultiplier = 1;
        let chaosDelta = 0;

        if (halted > 0) {
          playerMultiplier = 0;
        } else {
          events.forEach(e => {
            playerMultiplier *= e.playerGrowthMultiplier;
            chaosDelta += e.chaosRate * dt;
          });
        }

        // Base player growth per second (aiming for 1M in 144 seconds roughly, but mostly via actions)
        // Let's say base growth is 3000 per second.
        const baseGrowth = 4000 * dt;
        const actualGrowth = baseGrowth * playerMultiplier;

        setPlayers(p => {
          const newP = p + actualGrowth;
          if (newP >= TARGET_PLAYERS) return TARGET_PLAYERS;
          return newP;
        });

        setChaos(c => {
          const newC = c + chaosDelta;
          // passive chaos decrease if no events
          if (events.length === 0 && halted === 0) {
            return Math.max(0, c - 0.5 * dt);
          }
          if (newC >= 100) return 100;
          return newC;
        });

        return events;
      });
      return halted;
    });

    reqRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      reqRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameState, gameLoop]);

  // Win/Loss conditions
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (chaos >= 100) {
      setGameState('LOST');
    } else if (players >= TARGET_PLAYERS) {
      setGameState('WON');
    } else if (hoursLeft <= 0) {
      setGameState('LOST');
    }
  }, [chaos, players, hoursLeft, gameState]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-mono overflow-hidden relative selection:bg-[#0057B7] selection:text-[#FFDD00]">
      {/* Gritty background overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
      
      {/* Viggnette */}
      <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase text-[#FFDD00] drop-shadow-[0_0_8px_rgba(255,221,0,0.5)]">
              SHIPPING S.T.A.L.K.E.R.
            </h1>
            <p className="text-xs text-[#0057B7] font-semibold tracking-widest mt-1">
              SURVIVAL PROTOCOL ACTIVE
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 uppercase tracking-widest">Time Left</span>
              <div className="flex items-center gap-2 text-xl font-bold font-mono">
                <Clock className="w-5 h-5 text-[#FFDD00]" />
                {Math.max(0, hoursLeft).toFixed(1)} <span className="text-sm">HRS</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 uppercase tracking-widest">Players</span>
              <div className="flex items-center gap-2 text-2xl font-bold font-mono text-white">
                <Users className="w-6 h-6 text-[#0057B7]" />
                {Math.floor(players).toLocaleString()}
              </div>
            </div>
          </div>
        </header>

        {gameState === 'START' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center"
          >
            <AlertOctagon className="w-24 h-24 text-[#FFDD00] mb-6 drop-shadow-[0_0_15px_rgba(255,221,0,0.5)]" />
            <h2 className="text-4xl font-bold mb-4 text-white">1 MILLION IN 36 HOURS</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Your indie studio is launching its most anticipated game. You are under extreme stress. 
              Power cuts, air raids, and server outages will happen. 
              Manage the chaos. Communicate. Push patches. Keep your team safe.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={startGame}
                className="px-8 py-4 bg-[#0057B7] hover:bg-[#004494] text-white font-bold tracking-widest transition-all rounded shadow-[0_0_20px_rgba(0,87,183,0.4)] hover:shadow-[0_0_30px_rgba(0,87,183,0.6)]"
              >
                INITIATE LAUNCH
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <div className="flex-1 grid grid-cols-12 gap-6">
            
            {/* Left Column: Stats & Status */}
            <div className="col-span-4 flex flex-col gap-6">
              
              {/* Chaos Meter */}
              <div className="bg-[#111] border border-[#222] p-6 rounded-lg shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#222]">
                  <motion.div 
                    className="h-full bg-red-500"
                    style={{ width: `${chaos}%` }}
                    animate={{ backgroundColor: chaos > 80 ? '#ef4444' : chaos > 50 ? '#eab308' : '#22c55e' }}
                  />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-bold tracking-widest text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" /> CHAOS LEVEL
                  </h3>
                  <span className={`font-bold ${chaos > 80 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {chaos.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress bar visual */}
                <div className="h-4 w-full bg-[#222] rounded-full overflow-hidden mt-2">
                  <motion.div 
                    className="h-full"
                    style={{ width: `${chaos}%` }}
                    animate={{ backgroundColor: chaos > 80 ? '#ef4444' : chaos > 50 ? '#eab308' : '#22c55e' }}
                  />
                </div>
                {chaos > 80 && (
                  <p className="text-red-500 text-xs mt-3 animate-pulse font-bold">
                    WARNING: CRITICAL CHAOS. LAUNCH FAILURE IMMINENT.
                  </p>
                )}
              </div>

              {/* Active Events */}
              <div className="flex-1 bg-[#111] border border-[#222] p-6 rounded-lg shadow-xl flex flex-col">
                <h3 className="text-gray-400 font-bold tracking-widest text-sm mb-4 border-b border-[#333] pb-2">
                  ACTIVE CRISES
                </h3>
                
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
                  <AnimatePresence>
                    {activeEvents.length === 0 && workHaltedTimer <= 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-green-500 text-sm border border-green-900/30 bg-green-900/10 p-3 rounded flex items-center gap-2"
                      >
                        <Activity className="w-4 h-4" /> Systems Nominal
                      </motion.div>
                    )}
                    
                    {workHaltedTimer > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="border border-[#0057B7]/50 bg-[#0057B7]/10 p-3 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-[#0057B7] animate-pulse" />
                          <div>
                            <div className="font-bold text-[#0057B7]">Team Sheltering</div>
                            <div className="text-xs text-gray-400">Work halted for {workHaltedTimer.toFixed(1)}s</div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeEvents.map(event => (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="border border-red-900/50 bg-red-900/10 p-3 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <event.icon className="w-5 h-5 text-red-500 animate-pulse" />
                          <div>
                            <div className="font-bold text-red-400">{event.name}</div>
                            <div className="text-xs text-red-300/70">
                              Chaos +{event.chaosRate}/s | Growth x{event.playerGrowthMultiplier}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="col-span-8 bg-[#111] border border-[#222] p-6 rounded-lg shadow-xl flex flex-col">
              <h3 className="text-gray-400 font-bold tracking-widest text-sm mb-6 border-b border-[#333] pb-2">
                COMMAND TERMINAL
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Triage Actions */}
                <ActionBtn 
                  id="PUSH_PATCH"
                  name="Push Hotfix"
                  desc="Fixes Server Overload. -15 Chaos."
                  icon={Terminal}
                  cooldown={cooldowns['PUSH_PATCH']}
                  maxCooldown={8}
                  onClick={() => handleAction('PUSH_PATCH')}
                  color="border-[#0057B7]"
                  textColor="text-[#0057B7]"
                />

                <ActionBtn 
                  id="GENERATOR"
                  name="Start Generators"
                  desc="Fixes Power Cut. -5 Chaos."
                  icon={Zap}
                  cooldown={cooldowns['GENERATOR']}
                  maxCooldown={12}
                  onClick={() => handleAction('GENERATOR')}
                  color="border-[#FFDD00]"
                  textColor="text-[#FFDD00]"
                />

                <ActionBtn 
                  id="SHELTER"
                  name="Shelter Team"
                  desc="Fixes Air Raid. -25 Chaos. Halts dev."
                  icon={Shield}
                  cooldown={cooldowns['SHELTER']}
                  maxCooldown={15}
                  onClick={() => handleAction('SHELTER')}
                  color="border-red-500"
                  textColor="text-red-500"
                />

                <ActionBtn 
                  id="COMMUNICATE"
                  name="Communicate"
                  desc="+15k Players. -10 Chaos."
                  icon={MessageSquare}
                  cooldown={cooldowns['COMMUNICATE']}
                  maxCooldown={10}
                  onClick={() => handleAction('COMMUNICATE')}
                  color="border-green-500"
                  textColor="text-green-500"
                />

                <ActionBtn 
                  id="CRUNCH"
                  name="Crunch/Push Hard"
                  desc="+25k Players. +15 Chaos."
                  icon={Activity}
                  cooldown={cooldowns['CRUNCH']}
                  maxCooldown={5}
                  onClick={() => handleAction('CRUNCH')}
                  color="border-purple-500"
                  textColor="text-purple-500"
                  className="col-span-2"
                />
              </div>

              {/* Progress visual */}
              <div className="mt-auto pt-8">
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                  <span>0</span>
                  <span>1,000,000 PLAYERS</span>
                </div>
                <div className="h-2 w-full bg-[#222] rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0057B7] to-[#FFDD00] transition-all duration-300"
                    style={{ width: `${(players / TARGET_PLAYERS) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
          </div>
        )}

        {(gameState === 'WON' || gameState === 'LOST') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center"
          >
            {gameState === 'WON' ? (
              <>
                <Users className="w-24 h-24 text-[#FFDD00] mb-6 drop-shadow-[0_0_15px_rgba(255,221,0,0.5)]" />
                <h2 className="text-5xl font-bold mb-4 text-white">1 MILLION PLAYERS</h2>
                <p className="text-xl text-[#0057B7] mb-8 font-mono">Mission Accomplished in {TOTAL_HOURS - hoursLeft} hours.</p>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Despite the power cuts, server outages, and air raids, your studio delivered. 
                  The world is playing your game.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-24 h-24 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                <h2 className="text-5xl font-bold mb-4 text-white">LAUNCH FAILED</h2>
                <p className="text-xl text-red-400 mb-8 font-mono">
                  {chaos >= 100 ? 'Chaos reached critical mass.' : 'Time ran out.'}
                </p>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  The servers melted, the community rioted, and development completely halted. 
                  You reached {Math.floor(players).toLocaleString()} players before total collapse.
                </p>
              </>
            )}
            
            <button 
              onClick={startGame}
              className="px-8 py-4 border border-[#333] hover:bg-[#222] text-white font-bold tracking-widest transition-all rounded"
            >
              TRY AGAIN
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ 
  id, name, desc, icon: Icon, cooldown, maxCooldown, onClick, color, textColor, className = '' 
}: { 
  id: string, name: string, desc: string, icon: any, cooldown?: number, maxCooldown: number, onClick: () => void, color: string, textColor: string, className?: string 
}) {
  const isOnCooldown = cooldown !== undefined && cooldown > 0;
  const progress = isOnCooldown ? (cooldown / maxCooldown) * 100 : 0;

  return (
    <button
      onClick={onClick}
      disabled={isOnCooldown}
      className={`relative p-4 rounded bg-[#1a1a1a] border-l-4 ${color} text-left overflow-hidden transition-all hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed group ${className}`}
    >
      {isOnCooldown && (
        <div 
          className="absolute inset-0 bg-black/40 z-0"
          style={{ width: `${progress}%` }}
        />
      )}
      <div className="relative z-10 flex items-start gap-4">
        <div className={`p-2 bg-[#2a2a2a] rounded ${textColor} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-white mb-1 flex items-center justify-between">
            {name}
            {isOnCooldown && <span className="text-xs text-gray-500 ml-2 font-mono">{cooldown.toFixed(1)}s</span>}
          </div>
          <div className="text-xs text-gray-400">{desc}</div>
        </div>
      </div>
    </button>
  );
}
