import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Sample data
const SOURCES = ['Forum', 'Discord', 'Steam Review', 'Reddit', 'Twitter'];
const MOCK_MESSAGES = [
  { text: "The new loot drops are too rare, I played for 5 hours and got nothing!", isSignal: true },
  { text: "OMG the servers are down again refund me right now!!!", isSignal: false },
  { text: "I love the new character, but her dash ability seems bugged on stairs.", isSignal: true },
  { text: "This game is dead lol", isSignal: false },
  { text: "Could we get a toggle for the motion blur? It makes me dizzy.", isSignal: true },
  { text: "Nerf everything!", isSignal: false },
  { text: "The matchmaking takes 10 minutes in Diamond rank, please fix.", isSignal: true },
  { text: "I have 5000 hours and I hate this game", isSignal: false },
  { text: "UI is too cluttered in the crafting menu, maybe add a search bar?", isSignal: true },
  { text: "devs are lazy", isSignal: false },
  { text: "Weapon swap animation cancels if you jump, making it feel clunky.", isSignal: true },
  { text: "why did they ban my friend he did nothing wrong", isSignal: false },
  { text: "Performance drops significantly in the swamp area on PS5.", isSignal: true },
  { text: "First comment", isSignal: false },
];

type Message = {
  id: string;
  text: string;
  source: string;
  timestamp: string;
  yOffset: number;
  duration: number;
  isSignalTemplate: boolean; // hidden from user, used for sprint gen
};

type LogEntry = {
  id: string;
  text: string;
  type: 'signal' | 'noise';
  time: string;
};

type SprintItem = {
  id: string;
  title: string;
  votes: number;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sprintBacklog, setSprintBacklog] = useState<SprintItem[]>([]);
  
  const [signalCount, setSignalCount] = useState(0);
  const [noiseCount, setNoiseCount] = useState(0);
  
  const streamAreaRef = useRef<HTMLDivElement>(null);

  // Spawn new messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (!streamAreaRef.current) return;
      
      const height = streamAreaRef.current.clientHeight;
      const template = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
      
      const newMessage: Message = {
        id: generateId(),
        text: template.text,
        source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        yOffset: Math.random() * (height - 150), // Random vertical position
        duration: 15 + Math.random() * 10, // 15-25 seconds to cross screen
        isSignalTemplate: template.isSignal
      };

      setActiveMessages(prev => [...prev, newMessage]);
    }, 2500); // New message every 2.5s

    return () => clearInterval(interval);
  }, []);

  const handleTag = (msg: Message, type: 'signal' | 'noise') => {
    // Remove from active
    setActiveMessages(prev => prev.filter(m => m.id !== msg.id));
    
    // Add to log
    setLogs(prev => [{
      id: generateId(),
      text: msg.text.substring(0, 30) + '...',
      type,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 50));

    // Update stats
    if (type === 'signal') {
      setSignalCount(c => c + 1);
      
      // Add to sprint backlog if it was a real signal template
      if (msg.isSignalTemplate) {
        setSprintBacklog(prev => {
          // Simplistic summarization for demo
          let title = "Investigate: " + msg.text.split(' ').slice(0, 4).join(' ') + "...";
          if (msg.text.includes("loot")) title = "Balance Loot Drop Rates";
          if (msg.text.includes("dash")) title = "Fix Dash Ability on Stairs";
          if (msg.text.includes("motion blur")) title = "Add Motion Blur Toggle";
          if (msg.text.includes("matchmaking")) title = "Optimize Diamond Matchmaking";
          if (msg.text.includes("crafting")) title = "Add Crafting Menu Search";
          if (msg.text.includes("animation")) title = "Fix Weapon Swap Animation";
          if (msg.text.includes("swamp")) title = "PS5 Swamp Area Optimization";

          const existing = prev.find(p => p.title === title);
          if (existing) {
            return prev.map(p => p.title === title ? { ...p, votes: p.votes + 1 } : p).sort((a,b) => b.votes - a.votes);
          } else {
            return [...prev, { id: generateId(), title, votes: 1 }].sort((a,b) => b.votes - a.votes).slice(0, 6);
          }
        });
      }
    } else {
      setNoiseCount(c => c + 1);
    }
  };

  const handleAnimationComplete = (id: string) => {
    // Message fell off screen without interaction
    setActiveMessages(prev => prev.filter(m => m.id !== id));
  };

  const totalInteractions = signalCount + noiseCount;
  const signalPercentage = totalInteractions > 0 ? (signalCount / totalInteractions) * 100 : 0;
  
  // Voice of Player bar fills up to 100 based on signals (e.g. 20 signals = 100%)
  const voiceProgress = Math.min((signalCount / 20) * 100, 100);

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1 className="header-title">Live Player Intelligence</h1>
          <div className="header-subtitle">Continuous Listening Dashboard &bull; Jagex / Levellr Inspired</div>
        </div>
      </header>

      {/* LEFT COLUMN: The Stream */}
      <section className="stream-section">
        <div className="stream-header">
          <div className="stream-title">Incoming Signal Stream</div>
          <div className="live-indicator">
            <div className="dot"></div>
            LISTENING LIVE
          </div>
        </div>
        
        <div className="stream-area" ref={streamAreaRef}>
          <AnimatePresence>
            {activeMessages.map(msg => (
              <motion.div
                key={msg.id}
                className="comment-card"
                initial={{ x: -350, y: msg.yOffset, opacity: 0 }}
                animate={{ x: '120vw', opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  x: { duration: msg.duration, ease: "linear" },
                  opacity: { duration: 0.5 }
                }}
                onAnimationComplete={() => handleAnimationComplete(msg.id)}
                whileHover={{ animationPlayState: 'paused', scale: 1.05, zIndex: 10 }}
              >
                <div className="comment-meta">
                  <span>{msg.source}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="comment-text">
                  "{msg.text}"
                </div>
                <div className="comment-actions">
                  <button className="action-btn btn-signal" onClick={() => handleTag(msg, 'signal')}>
                    &uarr; SIGNAL
                  </button>
                  <button className="action-btn btn-noise" onClick={() => handleTag(msg, 'noise')}>
                    &darr; NOISE
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* RIGHT COLUMN: Intelligence & Sprints */}
      <section className="intelligence-section">
        
        <div className="panel">
          <div className="panel-title">
            <h3>Voice of the Player</h3>
            <span style={{fontFamily: 'Roboto Mono', fontSize:'0.8rem'}}>{Math.round(voiceProgress)}% Analyzed</span>
          </div>
          <div className="voice-bar-container">
            <div className="voice-bar-fill" style={{ width: `${voiceProgress}%` }}></div>
            <div className="voice-bar-text">SPRINT GENERATION PROGRESS</div>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-box">
              <div className="metric-value" style={{color: 'var(--accent-green)'}}>{signalCount}</div>
              <div className="metric-label">Valid Signals</div>
            </div>
            <div className="metric-box">
              <div className="metric-value" style={{color: 'var(--accent-red)'}}>{noiseCount}</div>
              <div className="metric-label">Noise Filtered</div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="panel-title">
            <h3>Generated Sprint Backlog</h3>
            <span style={{fontFamily: 'Roboto Mono', fontSize:'0.8rem', color:'var(--accent-blue)'}}>Auto-Prioritized</span>
          </div>
          
          {sprintBacklog.length === 0 ? (
            <div className="empty-state">
              Tag signals in the stream to generate actionable sprint tasks.
            </div>
          ) : (
            <ul className="sprint-list">
              <AnimatePresence>
                {sprintBacklog.map(item => (
                  <motion.li 
                    key={item.id} 
                    className="sprint-item"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    layout
                  >
                    <span>{item.title}</span>
                    <span className="sprint-item-tag">{item.votes} Mentions</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="panel" style={{ padding: 0 }}>
          <div className="panel-title" style={{ padding: '15px 20px 10px', marginBottom: 0 }}>
            <h3>Classification Log</h3>
          </div>
          <ul className="log-list">
            {logs.map(log => (
              <li key={log.id} className={`log-item ${log.type}`}>
                <span style={{opacity:0.5, marginRight:10}}>{log.time}</span>
                [{log.type.toUpperCase()}] {log.text}
              </li>
            ))}
          </ul>
        </div>

      </section>
    </div>
  );
}

export default App;
