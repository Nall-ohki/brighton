import React, { useState, useMemo } from 'react';

// === Types and Constants ===

const getOutgoing = (tile: string, incoming: string): string | null => {
  switch(tile) {
    case 'I_v': return (incoming === 'Top') ? 'Bottom' : (incoming === 'Bottom') ? 'Top' : null;
    case 'I_h': return (incoming === 'Left') ? 'Right' : (incoming === 'Right') ? 'Left' : null;
    case 'L_tr': return (incoming === 'Top') ? 'Right' : (incoming === 'Right') ? 'Top' : null;
    case 'L_br': return (incoming === 'Bottom') ? 'Right' : (incoming === 'Right') ? 'Bottom' : null;
    case 'L_bl': return (incoming === 'Bottom') ? 'Left' : (incoming === 'Left') ? 'Bottom' : null;
    case 'L_tl': return (incoming === 'Top') ? 'Left' : (incoming === 'Left') ? 'Top' : null;
    case 'Cross': 
      if (incoming === 'Top') return 'Bottom';
      if (incoming === 'Bottom') return 'Top';
      if (incoming === 'Left') return 'Right';
      if (incoming === 'Right') return 'Left';
      return null;
    default: return null;
  }
};

const SQUALS = [
  { id: 0, x: 3, y: 0, travelDir: 'Down', name: 'iOS App' },
  { id: 1, x: 6, y: 0, travelDir: 'Down', name: 'Android' },
  { id: 2, x: 9, y: 0, travelDir: 'Down', name: 'Web App' },
  { id: 3, x: 0, y: 3, travelDir: 'Right', name: 'Partners' },
  { id: 4, x: 0, y: 9, travelDir: 'Right', name: 'IoT' },
  { id: 5, x: 12, y: 3, travelDir: 'Left', name: 'B2B API' },
  { id: 6, x: 12, y: 9, travelDir: 'Left', name: 'Internal' },
  { id: 7, x: 3, y: 12, travelDir: 'Up', name: 'TV App' },
  { id: 8, x: 6, y: 12, travelDir: 'Up', name: 'Watch' },
  { id: 9, x: 9, y: 12, travelDir: 'Up', name: 'Kiosk' },
];

const TOOLS = [
  { id: 'empty', label: 'Erase', svg: <path d="M 6 18 L 18 6 M 6 6 L 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> },
  { id: 'I_v', label: 'Vert', svg: <path d="M 12 0 L 12 24" stroke="currentColor" strokeWidth="3" /> },
  { id: 'I_h', label: 'Horz', svg: <path d="M 0 12 L 24 12" stroke="currentColor" strokeWidth="3" /> },
  { id: 'L_tr', label: 'TR', svg: <path d="M 12 0 Q 12 12 24 12" stroke="currentColor" strokeWidth="3" fill="none"/> },
  { id: 'L_br', label: 'BR', svg: <path d="M 12 24 Q 12 12 24 12" stroke="currentColor" strokeWidth="3" fill="none"/> },
  { id: 'L_bl', label: 'BL', svg: <path d="M 12 24 Q 12 12 0 12" stroke="currentColor" strokeWidth="3" fill="none"/> },
  { id: 'L_tl', label: 'TL', svg: <path d="M 12 0 Q 12 12 0 12" stroke="currentColor" strokeWidth="3" fill="none"/> },
  { id: 'Cross', label: 'Cross', svg: <><path d="M 12 0 L 12 24" stroke="currentColor" strokeWidth="3"/><path d="M 0 12 L 24 12" stroke="currentColor" strokeWidth="3"/></> },
];

export default function App() {
  const [grid, setGrid] = useState<string[][]>(() => 
    Array(13).fill(null).map(() => Array(13).fill('empty'))
  );
  const [activeTool, setActiveTool] = useState<string>('I_v');

  // Evaluate paths
  const evaluation = useMemo(() => {
    const sqStates: Record<number, { connected: boolean, conflict: boolean, pathCells: string[] }> = {};
    SQUALS.forEach(sq => {
      sqStates[sq.id] = { connected: false, conflict: false, pathCells: [] };
    });
    
    const cUsage = Array(13).fill(null).map(() => 
      Array(13).fill(null).map(() => ({
        squads: new Set<number>(),
        crossV: new Set<number>(),
        crossH: new Set<number>(),
      }))
    );

    SQUALS.forEach(squad => {
      let currX = squad.x;
      let currY = squad.y;
      let travel = squad.travelDir;
      
      let incoming = '';
      if (travel === 'Down') { currY++; incoming = 'Top'; }
      else if (travel === 'Up') { currY--; incoming = 'Bottom'; }
      else if (travel === 'Right') { currX++; incoming = 'Left'; }
      else if (travel === 'Left') { currX--; incoming = 'Right'; }
      
      while(true) {
        if (currX < 0 || currX >= 13 || currY < 0 || currY >= 13) break;
        
        // Hit Hub?
        if (currX >= 5 && currX <= 7 && currY >= 5 && currY <= 7) {
          sqStates[squad.id].connected = true;
          break;
        }
        
        // Hit another squad?
        if (SQUALS.some(s => s.x === currX && s.y === currY)) {
          break;
        }
        
        const tile = grid[currY][currX];
        if (tile === 'empty') break;
        
        const outgoing = getOutgoing(tile, incoming);
        if (!outgoing) break;
        
        // Check infinite loop
        const cellKey = `${currX},${currY}`;
        if (sqStates[squad.id].pathCells.includes(cellKey)) break;
        sqStates[squad.id].pathCells.push(cellKey);
        
        if (tile === 'Cross') {
          if (incoming === 'Top' || incoming === 'Bottom') cUsage[currY][currX].crossV.add(squad.id);
          else cUsage[currY][currX].crossH.add(squad.id);
        } else {
          cUsage[currY][currX].squads.add(squad.id);
        }
        
        if (outgoing === 'Bottom') { currY++; incoming = 'Top'; }
        else if (outgoing === 'Top') { currY--; incoming = 'Bottom'; }
        else if (outgoing === 'Right') { currX++; incoming = 'Left'; }
        else if (outgoing === 'Left') { currX--; incoming = 'Right'; }
      }
    });

    // Evaluate conflicts
    for (let y = 0; y < 13; y++) {
      for (let x = 0; x < 13; x++) {
        const usage = cUsage[y][x];
        const tile = grid[y][x];
        
        if (tile === 'Cross') {
          if (usage.crossV.size > 0 && usage.crossH.size > 0) {
            usage.crossV.forEach(id => sqStates[id].conflict = true);
            usage.crossH.forEach(id => sqStates[id].conflict = true);
          }
          if (usage.crossV.size > 1) {
            usage.crossV.forEach(id => sqStates[id].conflict = true);
          }
          if (usage.crossH.size > 1) {
            usage.crossH.forEach(id => sqStates[id].conflict = true);
          }
        } else {
          if (usage.squads.size > 1) {
            usage.squads.forEach(id => sqStates[id].conflict = true);
          }
        }
      }
    }

    return { sqStates, cUsage };
  }, [grid]);

  const handleCellClick = (x: number, y: number) => {
    if (x >= 5 && x <= 7 && y >= 5 && y <= 7) return;
    if (SQUALS.some(s => s.x === x && s.y === y)) return;
    
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[y] = [...prev[y]];
      newGrid[y][x] = activeTool;
      return newGrid;
    });
  };

  const handleCellPointerEnter = (x: number, y: number, e: React.PointerEvent) => {
    if (e.buttons === 1) {
      handleCellClick(x, y);
    }
  };

  const progress = SQUALS.filter(sq => evaluation.sqStates[sq.id].connected && !evaluation.sqStates[sq.id].conflict).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-mono select-none">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">Self-Service Platform Builder</h1>
          <p className="text-sm text-slate-400">Transform the mobile team from a ticket factory to a scalable platform.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Onboarded Squads</div>
          <div className="text-3xl font-bold text-cyan-400">
            {progress} / 10
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-12 overflow-hidden">
        
        <div 
          className="relative grid bg-slate-800/20 border-2 border-slate-700/50 rounded-xl shadow-2xl shadow-cyan-900/10"
          style={{
            gridTemplateColumns: 'repeat(13, 3rem)',
            gridTemplateRows: 'repeat(13, 3rem)',
            gap: '1px'
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {Array(13).fill(null).map((_, y) => 
            Array(13).fill(null).map((_, x) => {
              
              if (x >= 5 && x <= 7 && y >= 5 && y <= 7) return null;
              
              const squad = SQUALS.find(s => s.x === x && s.y === y);
              if (squad) {
                const sqState = evaluation.sqStates[squad.id];
                const isConnected = sqState.connected;
                const isConflict = sqState.conflict;
                
                let statusClass = 'bg-slate-800 text-slate-400 border-slate-600';
                let icon = '🏗️';
                if (isConflict) {
                  statusClass = 'bg-red-900/80 text-red-100 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] z-10';
                  icon = '⚔️';
                } else if (isConnected) {
                  statusClass = 'bg-green-900/80 text-green-100 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] z-10';
                  icon = '✅';
                }

                return (
                  <div key={`squad-${x}-${y}`} className={`relative w-full h-full border rounded flex flex-col items-center justify-center text-[10px] transition-all duration-300 ${statusClass}`}>
                    <div className="text-sm mb-0.5">{icon}</div>
                    <div className="font-bold text-center leading-tight truncate px-0.5 w-full">{squad.name}</div>
                    
                    {(!isConnected || isConflict) && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-black px-1.5 py-0.5 rounded-full text-[8px] font-bold shadow-lg animate-bounce z-20">
                        🎟️5
                      </div>
                    )}
                  </div>
                );
              }

              const tile = grid[y][x];
              const usage = evaluation.cUsage[y][x];

              let color = 'default';
              let colorV = 'default';
              let colorH = 'default';

              if (tile === 'Cross') {
                const vSquads = Array.from(usage.crossV);
                const hSquads = Array.from(usage.crossH);
                
                if (vSquads.length > 0) {
                  if (vSquads.some(id => evaluation.sqStates[id].conflict)) colorV = 'red';
                  else if (vSquads.some(id => evaluation.sqStates[id].connected)) colorV = 'green';
                  else colorV = 'yellow';
                }
                if (hSquads.length > 0) {
                  if (hSquads.some(id => evaluation.sqStates[id].conflict)) colorH = 'red';
                  else if (hSquads.some(id => evaluation.sqStates[id].connected)) colorH = 'green';
                  else colorH = 'yellow';
                }
              } else {
                const squads = Array.from(usage.squads);
                if (squads.length > 0) {
                  if (squads.some(id => evaluation.sqStates[id].conflict)) color = 'red';
                  else if (squads.some(id => evaluation.sqStates[id].connected)) color = 'green';
                  else color = 'yellow';
                }
              }

              return (
                <div
                  key={`cell-${x}-${y}`}
                  className="w-full h-full bg-slate-900 hover:bg-slate-800/80 cursor-crosshair transition-colors relative"
                  onPointerDown={() => handleCellClick(x, y)}
                  onPointerEnter={(e) => handleCellPointerEnter(x, y, e)}
                  style={{ gridColumn: x + 1, gridRow: y + 1 }}
                >
                  {tile !== 'empty' && (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 overflow-visible">
                      <TileSVG type={tile} color={color} colorV={colorV} colorH={colorH} />
                    </svg>
                  )}
                </div>
              );
            })
          )}

          <div 
            className="relative border-2 border-cyan-500/50 bg-slate-900 rounded-xl flex flex-col items-center justify-center z-10 transition-shadow duration-1000"
            style={{ gridColumn: '6 / 9', gridRow: '6 / 9', boxShadow: progress === 10 ? '0 0 50px rgba(6,182,212,0.6)' : '0 0 20px rgba(6,182,212,0.1)' }}
          >
            <div className={`absolute inset-0 rounded-xl transition-opacity duration-1000 ${progress === 10 ? 'opacity-100 bg-cyan-900/40 animate-pulse' : 'opacity-0'}`}></div>
            <div className="text-cyan-400 text-3xl mb-1 z-10">🗄️</div>
            <div className="text-cyan-400 font-bold text-sm tracking-widest uppercase z-10 mt-1">Platform</div>
            <div className="text-cyan-500/70 text-[10px] uppercase z-10 mt-1">Self-Service Core</div>
            
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 rounded-xl m-1"></div>
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 rounded-xl m-2"></div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl w-56">
          <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">API Contracts</h2>
          <div className="grid grid-cols-2 gap-3">
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  activeTool === tool.id 
                    ? 'bg-cyan-900/40 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <div className="w-8 h-8 mb-2 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    {tool.svg}
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase">{tool.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
            <p className="mb-3"><strong>Goal:</strong> Connect all 10 squads to the Platform Core.</p>
            <p className="mb-3"><strong>Rules:</strong> Crossing lines causes channel wars (<span className="text-red-400 font-bold">RED</span>). You must reroute or use isolation.</p>
            <p className="text-cyan-500 font-bold text-[10px] uppercase mt-2">Hint: Drag to draw lines quickly</p>
          </div>
        </div>

      </main>

      {progress === 10 && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-2xl p-10 max-w-lg text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-in zoom-in duration-500">
            <div className="text-7xl mb-6">🚀</div>
            <h2 className="text-4xl font-bold text-cyan-400 mb-4">Platform Scaled!</h2>
            <p className="text-slate-300 text-lg mb-8">
              You've successfully routed all 10 squads to the self-service platform without any channel-war conflicts. The ticket factory is no more!
            </p>
            <button 
              onClick={() => setGrid(Array(13).fill(null).map(() => Array(13).fill('empty')))}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-10 rounded-full transition-colors w-full text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Reset Platform
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TileSVG({ type, color, colorV, colorH }: { type: string, color: string, colorV: string, colorH: string }) {
  const getColorClass = (c: string) => {
    if (c === 'red') return 'stroke-red-500 filter drop-shadow-[0_0_4px_rgba(239,68,68,1)]';
    if (c === 'green') return 'stroke-green-400 filter drop-shadow-[0_0_4px_rgba(74,222,128,1)]';
    if (c === 'yellow') return 'stroke-yellow-400 filter drop-shadow-[0_0_4px_rgba(250,204,21,1)]';
    return 'stroke-slate-600';
  };

  switch(type) {
    case 'I_v': return <path d="M 50 0 L 50 100" fill="none" strokeWidth="16" className={`${getColorClass(color)} transition-all duration-300`} />;
    case 'I_h': return <path d="M 0 50 L 100 50" fill="none" strokeWidth="16" className={`${getColorClass(color)} transition-all duration-300`} />;
    case 'L_tr': return <path d="M 50 0 Q 50 50 100 50" fill="none" strokeWidth="16" className={`${getColorClass(color)} transition-all duration-300`} />;
    case 'L_br': return <path d="M 50 100 Q 50 50 100 50" fill="none" strokeWidth="16" className={`${getColorClass(color)} transition-all duration-300`} />;
    case 'L_bl': return <path d="M 50 100 Q 50 50 0 50" fill="none" strokeWidth="16" className={`${getColorClass(color)} transition-all duration-300`} />;
    case 'L_tl': return <path d="M 50 0 Q 50 50 0 50" fill="none" strokeWidth="16" className={`${getColorClass(color)} transition-all duration-300`} />;
    case 'Cross': return (
      <>
        <path d="M 0 50 L 100 50" fill="none" strokeWidth="16" className={`${getColorClass(colorH)} transition-all duration-300`} />
        <path d="M 50 0 L 50 100" fill="none" strokeWidth="22" className="stroke-slate-900" />
        <path d="M 50 0 L 50 100" fill="none" strokeWidth="16" className={`${getColorClass(colorV)} transition-all duration-300`} />
      </>
    );
    default: return null;
  }
}
