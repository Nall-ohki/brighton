import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Layers, Cpu, Image as ImageIcon, Monitor, CheckCircle, AlertTriangle, Settings2, Eye, Boxes, Award, ServerCrash, Smartphone, HardDrive } from 'lucide-react';

type DeviceConfig = {
  id: string;
  name: string;
  gpuMultiplier: number;
  cpuMultiplier: number;
  memoryLimit: number; // MB
  target: number; // ms
};

const DEVICES: DeviceConfig[] = [
  { id: 'potato', name: 'Potato Phone 4 (2018)', gpuMultiplier: 3.0, cpuMultiplier: 2.5, memoryLimit: 128, target: 16.6 },
  { id: 'mid', name: 'Mid-Tier Slab (2021)', gpuMultiplier: 1.5, cpuMultiplier: 1.2, memoryLimit: 256, target: 16.6 },
  { id: 'pro', name: 'Super-chip Pro (2024)', gpuMultiplier: 0.5, cpuMultiplier: 0.6, memoryLimit: 1024, target: 16.6 },
];

export default function App() {
  const [deviceIndex, setDeviceIndex] = useState(0);
  const device = DEVICES[deviceIndex];
  
  const [settings, setSettings] = useState({
    lod: 2,
    shadows: 2,
    batching: false,
    textures: 2,
    postProcessing: true,
  });

  const [history, setHistory] = useState<number[]>(Array(50).fill(16.6));
  const [isStable, setIsStable] = useState(false);
  const [stableTime, setStableTime] = useState(0);
  const [highScores, setHighScores] = useState<Record<string, number>>({ potato: 0, mid: 0, pro: 0 });

  const costs = useMemo(() => {
    const lodGPU = [1, 3, 8][settings.lod] * device.gpuMultiplier;
    const shadowGPU = [0, 4, 10][settings.shadows] * device.gpuMultiplier;
    const texGPU = [0.5, 1.5, 4][settings.textures] * device.gpuMultiplier;
    const ppGPU = (settings.postProcessing ? 5 : 0) * device.gpuMultiplier;
    
    const drawCallsCPU = (settings.batching ? 2 : 12) * device.cpuMultiplier;
    const shadowCPU = [0, 2, 5][settings.shadows] * device.cpuMultiplier;

    return {
      Geometry: lodGPU,
      Shadows: shadowGPU + shadowCPU,
      Textures: texGPU,
      PostProcess: ppGPU,
      DrawCalls: drawCallsCPU,
    };
  }, [settings, device]);

  const memoryCosts = useMemo(() => {
    return {
      Geometry: [10, 25, 45][settings.lod],
      Shadows: [0, 15, 30][settings.shadows],
      Textures: [20, 60, 140][settings.textures],
      PostProcess: settings.postProcessing ? 20 : 0,
      Batching: settings.batching ? 35 : 0,
    };
  }, [settings]);

  const totalMemory = Object.values(memoryCosts).reduce((a, b) => a + b, 0);
  const memoryPenalty = Math.max(0, (totalMemory - device.memoryLimit) * 1.5);
  const baseCost = Object.values(costs).reduce((a, b) => a + b, 0);
  const totalCost = baseCost + memoryPenalty;

  const visualQualityScore = Math.round(
    (settings.lod / 2) * 30 +
    (settings.shadows / 2) * 25 +
    (settings.textures / 2) * 25 +
    (settings.postProcessing ? 20 : 0)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 1.5 * Math.max(1, device.gpuMultiplier);
      const currentFrameTime = Math.max(1, totalCost + jitter);
      
      setHistory(prev => {
        const next = [...prev.slice(1), currentFrameTime];
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [totalCost, device]);

  const avgTime = history.slice(-20).reduce((a, b) => a + b, 0) / 20;

  useEffect(() => {
    if (avgTime <= device.target && totalCost <= device.target) {
      setStableTime(prev => {
        const next = prev + 0.1;
        if (next >= 2) {
          setIsStable(true);
          setHighScores(scores => ({
            ...scores,
            [device.id]: Math.max(scores[device.id] || 0, visualQualityScore)
          }));
        }
        return next;
      });
    } else {
      setStableTime(0);
      setIsStable(false);
    }
  }, [avgTime, totalCost, device, visualQualityScore]);

  // Graph generation
  const graphWidth = 600;
  const graphHeight = 200;
  const maxGraphValue = 60;
  
  const points = history.map((val, i) => {
    const x = (i / (history.length - 1)) * graphWidth;
    const y = graphHeight - (Math.min(val, maxGraphValue) / maxGraphValue) * graphHeight;
    return `${x},${y}`;
  }).join(' ');

  const currentScore = highScores[device.id];

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc] font-mono p-4 md:p-8 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#252526] p-4 border border-[#333] rounded shadow-lg">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-[#007acc]" />
              Mobile Perf Profiler
            </h1>
            <p className="text-sm text-[#888] mt-1">Optimize render calls to hit {device.target}ms budget</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            {DEVICES.map((d, i) => (
              <button
                key={d.id}
                onClick={() => { setDeviceIndex(i); setStableTime(0); }}
                className={`px-3 py-1.5 rounded border text-sm flex items-center gap-2 transition-colors ${
                  deviceIndex === i 
                    ? 'bg-[#007acc] border-[#007acc] text-white' 
                    : 'bg-[#1e1e1e] border-[#333] text-[#888] hover:border-[#555]'
                }`}
              >
                <Smartphone size={14} />
                {d.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Profiler View */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Graph Panel */}
            <div className="bg-[#252526] p-4 border border-[#333] rounded shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Monitor size={18} className="text-[#ccc]" />
                  <span className="font-semibold text-white">Frame Time History</span>
                </div>
                <div className={`text-xl font-bold ${avgTime > device.target ? 'text-[#ff4444]' : 'text-[#4CAF50]'}`}>
                  {avgTime.toFixed(1)} ms
                </div>
              </div>
              
              <div className="relative w-full h-48 bg-[#1e1e1e] border border-[#333] rounded overflow-hidden">
                <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} preserveAspectRatio="none" className="w-full h-full">
                  {/* Grid Lines */}
                  {[16.6, 33.3, 50].map(target => {
                    const y = graphHeight - (target / maxGraphValue) * graphHeight;
                    return (
                      <g key={target}>
                        <line x1="0" y1={y} x2={graphWidth} y2={y} stroke="#333" strokeWidth="1" strokeDasharray="4" />
                        <text x="5" y={y - 5} fill="#666" fontSize="12" fontFamily="monospace">{target.toFixed(1)}ms {target === 16.6 && '(60fps)'}</text>
                      </g>
                    );
                  })}
                  
                  {/* Fill below line */}
                  <polygon points={`0,${graphHeight} ${points} ${graphWidth},${graphHeight}`} fill={avgTime <= device.target ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 68, 68, 0.1)'} />
                  
                  {/* Line */}
                  <polyline 
                    points={points} 
                    fill="none" 
                    stroke={avgTime <= device.target ? "#4CAF50" : "#ff4444"} 
                    strokeWidth="2" 
                  />
                </svg>

                {memoryPenalty > 0 && (
                  <div className="absolute top-2 right-2 bg-[#ff4444] text-white text-xs px-2 py-1 rounded flex items-center gap-1 animate-pulse shadow">
                    <ServerCrash size={12} />
                    OOM Penalty!
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isStable ? (
                    <div className="flex items-center gap-2 text-[#4CAF50]">
                      <CheckCircle size={16} />
                      <span className="text-sm">Certification Passed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#ff4444]">
                      <AlertTriangle size={16} />
                      <span className="text-sm">Targeting &lt;= 16.6ms</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-[#007acc]">
                    <Award size={16} />
                    <span>Quality Score: {visualQualityScore}/100</span>
                  </div>
                  {currentScore > 0 && (
                     <div className="text-[#888]">
                       High: {currentScore}
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-[#252526] p-4 border border-[#333] rounded shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* CPU/GPU Time Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Cpu size={16} /> Frame Time Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Geometry', cost: costs.Geometry, color: '#4EC9B0' },
                    { name: 'Shadows', cost: costs.Shadows, color: '#C586C0' },
                    { name: 'Textures', cost: costs.Textures, color: '#DCDCAA' },
                    { name: 'Post-Proc', cost: costs.PostProcess, color: '#CE9178' },
                    { name: 'Draw Calls', cost: costs.DrawCalls, color: '#569CD6' },
                    ...(memoryPenalty > 0 ? [{ name: 'Memory Penalty', cost: memoryPenalty, color: '#ff4444' }] : [])
                  ].map(cat => (
                    <div key={cat.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-[#888]">
                        <span>{cat.name}</span>
                        <span>{cat.cost.toFixed(1)} ms</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1e1e1e] rounded overflow-hidden">
                        <div 
                          className="h-full rounded transition-all duration-300" 
                          style={{ 
                            width: `${Math.min((cat.cost / maxGraphValue) * 100, 100)}%`, 
                            backgroundColor: cat.color 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <HardDrive size={16} /> VRAM Allocation ({totalMemory} / {device.memoryLimit} MB)
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Geometry buffers', cost: memoryCosts.Geometry, color: '#4EC9B0' },
                    { name: 'Shadow maps', cost: memoryCosts.Shadows, color: '#C586C0' },
                    { name: 'Texture atlases', cost: memoryCosts.Textures, color: '#DCDCAA' },
                    { name: 'Frame buffers', cost: memoryCosts.PostProcess, color: '#CE9178' },
                    { name: 'Batch buffers', cost: memoryCosts.Batching, color: '#569CD6' },
                  ].map(cat => (
                    <div key={cat.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-[#888]">
                        <span>{cat.name}</span>
                        <span>{cat.cost} MB</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1e1e1e] rounded overflow-hidden">
                        <div 
                          className="h-full rounded transition-all duration-300" 
                          style={{ 
                            width: `${Math.min((cat.cost / device.memoryLimit) * 100, 100)}%`, 
                            backgroundColor: totalMemory > device.memoryLimit ? '#ff4444' : cat.color 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="bg-[#252526] p-4 border border-[#333] rounded shadow-lg h-fit">
            <h2 className="text-sm font-semibold text-white mb-6 flex items-center gap-2 border-b border-[#333] pb-2">
              <Settings2 size={16} /> Inspector
            </h2>
            
            <div className="space-y-6">
              
              {/* LOD */}
              <div>
                <div className="flex justify-between text-sm mb-2 text-[#ccc]">
                  <span className="flex items-center gap-1"><Boxes size={14} className="text-[#4EC9B0]"/> LOD Bias</span>
                  <span className="text-white">{['Aggressive', 'Balanced', 'High Quality'][settings.lod]}</span>
                </div>
                <input 
                  type="range" min="0" max="2" 
                  value={settings.lod} 
                  onChange={e => setSettings(s => ({...s, lod: parseInt(e.target.value)}))} 
                  className="w-full h-1.5 bg-[#444] rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#4EC9B0' }}
                />
              </div>

              {/* Shadows */}
              <div>
                <div className="flex justify-between text-sm mb-2 text-[#ccc]">
                  <span className="flex items-center gap-1"><Layers size={14} className="text-[#C586C0]"/> Shadows</span>
                  <span className="text-white">{['Off', 'Hard (Low Res)', 'Soft (High Res)'][settings.shadows]}</span>
                </div>
                <input 
                  type="range" min="0" max="2" 
                  value={settings.shadows} 
                  onChange={e => setSettings(s => ({...s, shadows: parseInt(e.target.value)}))} 
                  className="w-full h-1.5 bg-[#444] rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#C586C0' }}
                />
              </div>

              {/* Textures */}
              <div>
                <div className="flex justify-between text-sm mb-2 text-[#ccc]">
                  <span className="flex items-center gap-1"><ImageIcon size={14} className="text-[#DCDCAA]"/> Textures</span>
                  <span className="text-white">{['Eighth Res', 'Quarter Res', 'Full Res'][settings.textures]}</span>
                </div>
                <input 
                  type="range" min="0" max="2" 
                  value={settings.textures} 
                  onChange={e => setSettings(s => ({...s, textures: parseInt(e.target.value)}))} 
                  className="w-full h-1.5 bg-[#444] rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: '#DCDCAA' }}
                />
              </div>

              <hr className="border-[#333]" />

              {/* Draw Call Batching */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#ccc] flex items-center gap-1">
                  <Cpu size={14} className="text-[#569CD6]"/> Static Batching
                </span>
                <button 
                  onClick={() => setSettings(s => ({...s, batching: !s.batching}))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings.batching ? 'bg-[#569CD6]' : 'bg-[#444]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.batching ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Post Processing */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#ccc] flex items-center gap-1">
                  <Eye size={14} className="text-[#CE9178]"/> Post Processing
                </span>
                <button 
                  onClick={() => setSettings(s => ({...s, postProcessing: !s.postProcessing}))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${settings.postProcessing ? 'bg-[#CE9178]' : 'bg-[#444]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.postProcessing ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

            </div>

            <div className="mt-8 p-3 bg-[#1e1e1e] border border-[#333] rounded text-xs text-[#888] space-y-2">
              <p><strong>Tip:</strong> Batching reduces CPU draw calls but increases memory footprint. If memory limit is exceeded, frame time will spike drastically.</p>
              <p><strong>Goal:</strong> Pass certification (maintain &lt;16.6ms) with the highest visual quality score possible.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
