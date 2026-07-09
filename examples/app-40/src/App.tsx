import React, { useState, useEffect, useRef } from 'react';
import { Settings, Monitor, Cpu, Layers, Zap, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

const STAGES = [
  { name: 'Game Thread', icon: Cpu, desc: 'Logic & Physics' },
  { name: 'Render Thread', icon: Layers, desc: 'Draw Calls' },
  { name: 'RHI Thread', icon: Zap, desc: 'Command Trans.' },
  { name: 'DirectX / Vulkan', icon: Settings, desc: 'API Layer' },
  { name: 'GPU', icon: Activity, desc: 'Raster & Shading' },
  { name: 'Display', icon: Monitor, desc: 'Presentation' },
];

const LINK_DURATION = 3; // simulated ms for travel

export default function App() {
  const [stageTimes, setStageTimes] = useState<number[]>([10, 10, 10, 10, 10]);
  const stageTimesRef = useRef(stageTimes);
  
  const [vrrEnabled, setVrrEnabled] = useState(false);
  const vrrRef = useRef(vrrEnabled);
  
  const [frames, setFrames] = useState<any[]>([]);
  
  const [displayStatus, setDisplayStatus] = useState<{state: string, key: number}>({ state: 'idle', key: 0 });
  
  const handledFramesRef = useRef<Set<number>>(new Set());

  useEffect(() => { stageTimesRef.current = stageTimes; }, [stageTimes]);
  useEffect(() => { vrrRef.current = vrrEnabled; }, [vrrEnabled]);
  
  useEffect(() => {
    if (displayStatus.state !== 'idle') {
      const timer = setTimeout(() => {
        setDisplayStatus({ state: 'idle', key: 0 });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [displayStatus]);

  const handleFireFrame = () => {
    setFrames(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        currentSegment: 0,
        segmentTime: 0,
        totalTime: 0,
        completed: false,
        maxStageTime: 0
      }
    ]);
  };

  useEffect(() => {
    let lastTime = performance.now();
    let reqId: number;
    
    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      setFrames(prev => {
        let changed = false;
        const next = prev.map(f => {
          if (f.completed) return f;
          changed = true;
          
          let newSegment = f.currentSegment;
          let newTime = f.segmentTime + (delta / 40);
          let newTotal = f.totalTime + (delta / 40);
          let completed = false;
          let newMax = f.maxStageTime;
          
          while (true) {
            const isNode = newSegment % 2 === 0;
            const nodeIndex = isNode ? Math.floor(newSegment / 2) : -1;
            const duration = isNode ? (nodeIndex < 5 ? stageTimesRef.current[nodeIndex] : 1) : LINK_DURATION;
            
            if (newTime >= duration) {
              if (isNode && nodeIndex < 5) {
                newMax = Math.max(newMax, duration);
              }
              newTime -= duration;
              newSegment += 1;
              if (newSegment >= 10) {
                completed = true;
                break;
              }
            } else {
              break;
            }
          }
          
          return {
            ...f,
            currentSegment: newSegment,
            segmentTime: newTime,
            totalTime: newTotal,
            completed,
            maxStageTime: newMax
          };
        });
        
        return changed ? next : prev;
      });
      
      reqId = requestAnimationFrame(tick);
    };
    
    reqId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(reqId);
  }, []);

  useEffect(() => {
    frames.forEach(f => {
      if (f.completed && !handledFramesRef.current.has(f.id)) {
        handledFramesRef.current.add(f.id);
        
        const isMissed = f.maxStageTime > 16.67;
        
        if (isMissed) {
           if (vrrRef.current) {
              setDisplayStatus({ state: 'vrr', key: Date.now() });
           } else {
              setDisplayStatus({ state: 'tearing', key: Date.now() });
           }
        } else {
           setDisplayStatus({ state: 'perfect', key: Date.now() });
        }
        
        setTimeout(() => {
          setFrames(prev => prev.filter(frame => frame.id !== f.id));
          handledFramesRef.current.delete(f.id);
        }, 1000);
      }
    });
  }, [frames]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans overflow-hidden flex flex-col items-center">
      <style>{`
        @keyframes pan {
          0% { left: -30%; }
          100% { left: 130%; }
        }
      `}</style>
      
      <div className="w-full max-w-7xl flex flex-col flex-1">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              A Frame's Life
            </h1>
            <p className="text-slate-400 mt-1 font-mono text-sm">Pipeline Timing & Latency Visualizer</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleFireFrame}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all active:scale-95 flex items-center"
            >
              <Zap className="w-5 h-5 mr-2" fill="currentColor" />
              FIRE FRAME
            </button>
            
            <div className="flex items-center space-x-3 bg-slate-900/80 px-5 py-3 rounded-lg border border-slate-700 shadow-lg">
              <span className="font-semibold text-slate-300">VRR Target Sync</span>
              <button 
                onClick={() => setVrrEnabled(!vrrEnabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${vrrEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${vrrEnabled ? 'left-7' : 'left-1 shadow-md'}`} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-between">
          <div className="flex justify-center flex-1 items-center mb-12">
            <div className="relative w-full max-w-4xl aspect-[21/9] bg-black rounded-xl border-[6px] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
              
              <div className="absolute inset-0">
                <div className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-md animate-[pan_2.5s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              {displayStatus.state === 'tearing' && (
                <div className="absolute top-0 left-0 w-full h-[52%] overflow-hidden bg-black border-b border-white/20 z-10 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
                  <div className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-md animate-[pan_2.5s_linear_infinite]" style={{ animationDelay: '-0.2s' }} />
                  <div className="absolute top-0 left-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -translate-x-1/2" />
                </div>
              )}
              
              <div className="z-20 absolute top-6 right-6 flex flex-col items-end gap-3">
                <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-mono text-slate-300 border border-slate-700 shadow-lg">
                  Target VSync: <span className="text-white font-bold text-sm">16.67ms</span>
                </div>
                {displayStatus.state === 'tearing' && (
                  <div key={`t-${displayStatus.key}`} className="bg-red-950/90 backdrop-blur-md border border-red-500/50 px-5 py-3 rounded-lg text-red-400 font-bold uppercase animate-pulse flex items-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <AlertTriangle className="w-5 h-5 mr-2" /> VSync Missed (Tearing)
                  </div>
                )}
                {displayStatus.state === 'vrr' && (
                  <div key={`v-${displayStatus.key}`} className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 px-5 py-3 rounded-lg text-emerald-400 font-bold uppercase flex items-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle className="w-5 h-5 mr-2" /> VRR Synced (No Tear)
                  </div>
                )}
                {displayStatus.state === 'perfect' && (
                  <div key={`p-${displayStatus.key}`} className="bg-cyan-950/90 backdrop-blur-md border border-cyan-500/50 px-5 py-3 rounded-lg text-cyan-400 font-bold uppercase flex items-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <CheckCircle className="w-5 h-5 mr-2" /> Perfect Frame (60 FPS)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full relative h-40 flex items-center mt-auto mb-10">
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
               <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-[pan_3s_linear_infinite]" />
            </div>
            
            {STAGES.map((stage, i) => {
              const isProcessingNode = i < 5;
              const isOverBudget = isProcessingNode && stageTimes[i] > 16.67;
              const isDisplay = i === 5;
              
              return (
                <div 
                  key={i} 
                  className="absolute top-1/2 flex flex-col items-center"
                  style={{ left: `${i * 20}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {isProcessingNode ? (
                    <div className={`absolute -top-10 text-xs font-mono px-2 py-1 rounded bg-slate-900 border shadow-lg ${isOverBudget ? 'text-red-400 border-red-900/50' : 'text-cyan-400 border-cyan-900/50'}`}>
                      {stageTimes[i].toFixed(1)}ms
                    </div>
                  ) : null}
                  
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 z-10 bg-slate-950 relative transition-colors duration-300
                    ${isDisplay ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 
                      isOverBudget ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}>
                    <stage.icon className={`w-7 h-7 ${isDisplay ? 'text-purple-400' : isOverBudget ? 'text-red-400' : 'text-cyan-400'}`} />
                  </div>
                  
                  <div className="absolute top-20 text-center w-32">
                    <div className="text-sm font-bold text-slate-200">{stage.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{stage.desc}</div>
                  </div>
                </div>
              );
            })}
            
            {frames.map(f => {
              let left = 0;
              let isInsideNode = false;
              let nodeIndex = -1;
              
              if (f.currentSegment % 2 === 0) {
                 nodeIndex = Math.floor(f.currentSegment / 2);
                 left = nodeIndex * 20;
                 isInsideNode = true;
              } else {
                 const startNode = Math.floor(f.currentSegment / 2);
                 const progress = f.segmentTime / LINK_DURATION;
                 left = startNode * 20 + (progress * 20);
              }
              
              const isOverBudget = isInsideNode && nodeIndex < 5 && stageTimesRef.current[nodeIndex] > 16.67;
              const isArrived = f.currentSegment === 10;
              
              return (
                <div 
                  key={f.id}
                  className={`absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none transition-opacity duration-300 ${isArrived ? 'opacity-0' : 'opacity-100'}`}
                  style={{ left: `${left}%` }}
                >
                   <div className={`w-6 h-6 rounded-full -ml-3 flex items-center justify-center
                     ${isOverBudget ? 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,1)]' : 'bg-cyan-400 shadow-[0_0_25px_rgba(34,211,238,1)]'}
                   `}>
                     {isInsideNode && <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />}
                     <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                   </div>
                </div>
              );
            })}
          </div>

          <div className="w-full grid grid-cols-5 gap-6 mt-8">
            {STAGES.slice(0, 5).map((stage, i) => (
               <div key={i} className={`flex flex-col bg-slate-900/60 p-5 rounded-xl border transition-colors ${stageTimes[i] > 16.67 ? 'border-red-900/50' : 'border-slate-800 hover:border-slate-700'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-slate-300">{stage.name}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="33" 
                    step="0.1"
                    value={stageTimes[i]}
                    onChange={(e) => {
                       const newTimes = [...stageTimes];
                       newTimes[i] = parseFloat(e.target.value);
                       setStageTimes(newTimes);
                    }}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${stageTimes[i] > 16.67 ? 'bg-red-950 accent-red-500' : 'bg-slate-800 accent-cyan-500'}`}
                  />
                  <div className="flex justify-between mt-3 text-[10px] text-slate-500 font-mono">
                    <span>1ms</span>
                    <span className="text-slate-400">16.6ms</span>
                    <span>33ms</span>
                  </div>
                  
                  <div className="h-6 mt-3">
                    {stageTimes[i] > 16.67 && (
                      <div className="text-[11px] text-red-400 flex items-center justify-center bg-red-950/40 py-1 rounded border border-red-900/30 font-bold uppercase tracking-wide">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Bottleneck
                      </div>
                    )}
                  </div>
               </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
