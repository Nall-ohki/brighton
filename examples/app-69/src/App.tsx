import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Briefcase, MessageCircle, Wrench, Globe, UserPlus, Building, GraduationCap, MousePointerClick } from 'lucide-react';
import './App.css';

type BatonType = 'Portfolio' | 'Soft Skills' | 'Tool Knowledge' | 'Industry Awareness';

interface Runner {
  id: string;
  trackIndex: number;
  x: number;
  y: number;
  baton: BatonType;
  state: 'running' | 'falling' | 'arrived';
  opacity: number;
  rotation: number;
}

const BATONS: Record<BatonType, { icon: React.ReactNode; color: string; label: string }> = {
  'Portfolio': { icon: <Briefcase size={16} color="#3498db" />, color: '#3498db', label: 'Portfolio' },
  'Soft Skills': { icon: <MessageCircle size={16} color="#2ecc71" />, color: '#2ecc71', label: 'Soft Skills' },
  'Tool Knowledge': { icon: <Wrench size={16} color="#f39c12" />, color: '#f39c12', label: 'Tool Knowledge' },
  'Industry Awareness': { icon: <Globe size={16} color="#e74c3c" />, color: '#e74c3c', label: 'Industry Awareness' }
};

const TRACKS = 4;
const TRACK_HEIGHT = 110;
const GAME_WIDTH = 1000;
const GAME_HEIGHT = TRACKS * TRACK_HEIGHT;
const START_X = 50;
const GAP_START = 300;
const GAP_END = 700;
const FINISH_X = GAME_WIDTH - 50;
const TILES_PER_TRACK = 5;
const TILE_WIDTH = (GAP_END - GAP_START) / TILES_PER_TRACK; // 80
const RUNNER_SPEED = 2.5;
const MAX_TILE_HEALTH = 6000; // 6 seconds before it crumbles

interface GameState {
  bridges: number[][]; 
  runners: Runner[];
  hires: number;
  spawnTimer: number;
  spawnInterval: number;
  lastTime: number;
}

const App: React.FC = () => {
  const stateRef = useRef<GameState>({
    bridges: Array.from({ length: TRACKS }, () => Array(TILES_PER_TRACK).fill(0)),
    runners: [],
    hires: 0,
    spawnTimer: 0,
    spawnInterval: 2500,
    lastTime: 0
  });

  const [, setRenderCounter] = useState(0);
  const requestRef = useRef<number>();

  const buildTile = (trackIndex: number, tileIndex: number) => {
    stateRef.current.bridges[trackIndex][tileIndex] = MAX_TILE_HEALTH;
  };

  const loop = useCallback((time: number) => {
    const state = stateRef.current;
    if (!state.lastTime) state.lastTime = time;
    const dt = time - state.lastTime;
    state.lastTime = time;

    // Update bridges
    for (let t = 0; t < TRACKS; t++) {
      for (let c = 0; c < TILES_PER_TRACK; c++) {
        if (state.bridges[t][c] > 0) {
          state.bridges[t][c] -= dt;
          if (state.bridges[t][c] < 0) state.bridges[t][c] = 0;
        }
      }
    }

    // Spawn runners
    state.spawnTimer += dt;
    if (state.spawnTimer > state.spawnInterval) {
      state.spawnTimer = 0;
      state.spawnInterval = Math.max(1000, state.spawnInterval - 50); // Gets faster
      
      const trackIndex = Math.floor(Math.random() * TRACKS);
      const batons: BatonType[] = ['Portfolio', 'Soft Skills', 'Tool Knowledge', 'Industry Awareness'];
      const baton = batons[Math.floor(Math.random() * batons.length)];
      
      state.runners.push({
        id: Math.random().toString(),
        trackIndex,
        x: START_X,
        y: 0,
        baton,
        state: 'running',
        opacity: 1,
        rotation: 0
      });
    }

    // Update runners
    for (let i = state.runners.length - 1; i >= 0; i--) {
      const r = state.runners[i];
      if (r.state === 'running') {
        r.x += RUNNER_SPEED;
        
        // Gap check logic using center of runner body
        const runnerCenter = r.x + 15;
        if (runnerCenter >= GAP_START && runnerCenter <= GAP_END) {
          const tileIndex = Math.floor((runnerCenter - GAP_START) / TILE_WIDTH);
          if (tileIndex >= 0 && tileIndex < TILES_PER_TRACK) {
            if (state.bridges[r.trackIndex][tileIndex] <= 0) {
              r.state = 'falling';
            }
          }
        }
        
        // Finish line logic
        if (r.x >= FINISH_X) {
          r.state = 'arrived';
          state.hires++;
        }
      } else if (r.state === 'falling') {
        r.y += 8;
        r.rotation += 10;
        r.opacity -= 0.03;
        if (r.opacity <= 0) {
          state.runners.splice(i, 1);
        }
      } else if (r.state === 'arrived') {
        r.opacity -= 0.05;
        r.x += RUNNER_SPEED;
        if (r.opacity <= 0) {
          state.runners.splice(i, 1);
        }
      }
    }

    setRenderCounter(prev => prev + 1);
    requestRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [loop]);

  const state = stateRef.current;

  return (
    <div className="whiteboard-container">
      <div className="header">
        <h1>Talent Pipeline Gap-Mapper</h1>
        <p>Build bridges before the educators drop their skills!</p>
      </div>

      <div className="stats">
        <div className="stat-box">
          <MousePointerClick size={28} color="#3498db" />
          <span>Click gaps to build bridges</span>
        </div>
        <div className="stat-box hires">
          <UserPlus size={28} color="#2ecc71" />
          <span>Junior Hires: {state.hires}</span>
        </div>
      </div>

      <div 
        className="whiteboard dot-pattern" 
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        <div className="education-zone">
          <div className="zone-title" style={{ color: '#3498db' }}>EDUCATION</div>
          <GraduationCap size={64} color="#3498db" style={{ opacity: 0.2, position: 'absolute', bottom: 20, left: 20 }} />
        </div>
        
        <div 
          className="gap-area" 
          style={{ left: GAP_START, width: GAP_END - GAP_START }}
        >
          <div style={{ position: 'absolute', top: -30, width: '100%', textAlign: 'center', color: '#e74c3c', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.5 }}>
            THE TALENT GAP
          </div>
        </div>
        
        <div className="industry-zone">
          <div className="zone-title" style={{ color: '#2ecc71' }}>INDUSTRY</div>
          <Building size={64} color="#2ecc71" style={{ opacity: 0.2, position: 'absolute', bottom: 20, right: 20 }} />
        </div>

        {/* Tracks */}
        {Array.from({ length: TRACKS }).map((_, trackIdx) => (
          <div 
            key={`track-${trackIdx}`} 
            style={{ 
              position: 'absolute', 
              top: trackIdx * TRACK_HEIGHT, 
              width: GAME_WIDTH, 
              height: TRACK_HEIGHT 
            }}
          >
            <div className="track-line" style={{ top: TRACK_HEIGHT / 2 }} />
            
            {/* Bridge Tiles */}
            {Array.from({ length: TILES_PER_TRACK }).map((_, tileIdx) => {
              const health = state.bridges[trackIdx][tileIdx];
              const isBuilt = health > 0;
              const opacity = isBuilt ? Math.max(0.3, health / MAX_TILE_HEALTH) : 1;
              
              return (
                <div
                  key={`tile-${trackIdx}-${tileIdx}`}
                  className="bridge-tile"
                  onClick={() => buildTile(trackIdx, tileIdx)}
                  style={{
                    left: GAP_START + tileIdx * TILE_WIDTH,
                    top: TRACK_HEIGHT / 2 - 30,
                    width: TILE_WIDTH,
                  }}
                >
                  {isBuilt ? (
                    <div 
                      className="bridge-tile-inner" 
                      style={{ opacity }}
                    />
                  ) : (
                    <div className="bridge-tile-empty" />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Runners */}
        {state.runners.map(runner => (
          <div
            key={runner.id}
            className={`runner ${runner.state === 'running' ? 'running-anim' : ''}`}
            style={{
              left: runner.x,
              top: runner.trackIndex * TRACK_HEIGHT + TRACK_HEIGHT / 2 - 25 + runner.y,
              opacity: runner.opacity,
              transform: `rotate(${runner.rotation}deg)`
            }}
          >
            <div className="runner-body">
              <GraduationCap size={20} color="#2c3e50" />
              <div 
                className="baton-badge" 
                style={{ borderColor: BATONS[runner.baton].color }}
                title={BATONS[runner.baton].label}
              >
                {BATONS[runner.baton].icon}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default App;
