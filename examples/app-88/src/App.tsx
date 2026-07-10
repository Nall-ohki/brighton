import React, { useState, useEffect } from 'react';
import { Briefcase, Code, Paintbrush, Music, Skull, Heart } from 'lucide-react';

type Role = 'Design' | 'Code' | 'Art' | 'Sound';

interface Contributor {
  id: string;
  name: string;
  role: Role;
  workDone: number;
  morale: number;
  icon: React.ReactNode;
  color: string;
}

const INITIAL_CONTRIBUTORS: Contributor[] = [
  { id: '1', name: 'ALEX', role: 'Design', workDone: 0, morale: 100, icon: <Briefcase size={20} />, color: '#ff00ff' },
  { id: '2', name: 'SAM', role: 'Code', workDone: 0, morale: 100, icon: <Code size={20} />, color: '#00ffff' },
  { id: '3', name: 'TAY', role: 'Art', workDone: 0, morale: 100, icon: <Paintbrush size={20} />, color: '#ffff00' },
  { id: '4', name: 'JOR', role: 'Sound', workDone: 0, morale: 100, icon: <Music size={20} />, color: '#00ff00' },
];

const App = () => {
  const [phase, setPhase] = useState<'working' | 'allocation' | 'gameover'>('working');
  const [contributors, setContributors] = useState<Contributor[]>(INITIAL_CONTRIBUTORS);
  const [milestone, setMilestone] = useState(1);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  
  const totalWorkReq = 400 * milestone;
  
  const currentTotalWork = contributors.reduce((sum, c) => sum + c.workDone, 0);
  const progressPercent = Math.min(100, (currentTotalWork / totalWorkReq) * 100);

  useEffect(() => {
    let timer: number;
    if (phase === 'working') {
      timer = window.setInterval(() => {
        setContributors(prev => {
          return prev.map(c => {
            const speed = (c.morale / 100) * (Math.random() * 5 + 1);
            return { ...c, workDone: c.workDone + speed };
          });
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'working' && progressPercent >= 100) {
      setPhase('allocation');
      
      const initAllocs: Record<string, number> = {};
      contributors.forEach(c => initAllocs[c.id] = 25);
      setAllocations(initAllocs);
    }
  }, [currentTotalWork, phase, progressPercent, contributors]);

  const handleAllocationChange = (id: string, value: number) => {
    setAllocations(prev => ({ ...prev, [id]: value }));
  };

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  const submitAllocation = () => {
    if (totalAllocation !== 100) return;
    
    let anyGameOver = false;
    const newContributors = contributors.map(c => {
      const actualWorkShare = currentTotalWork > 0 ? (c.workDone / currentTotalWork) * 100 : 25;
      const allocatedShare = allocations[c.id] || 0;
      
      const diff = allocatedShare - actualWorkShare;
      
      let moraleDelta = diff * 1.5;
      
      const newMorale = Math.max(0, Math.min(100, c.morale + moraleDelta));
      if (newMorale <= 0) anyGameOver = true;

      return {
        ...c,
        morale: newMorale,
        workDone: 0
      };
    });

    if (anyGameOver) {
      setContributors(newContributors);
      setPhase('gameover');
    } else {
      setContributors(newContributors);
      setMilestone(m => m + 1);
      setPhase('working');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col font-punk text-black selection:bg-pink-500 selection:text-white">
      <header className="mb-8 rotate-1">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-glitch bg-black text-white inline-block px-4 py-2 border-4 border-black shadow-[8px_8px_0px_#e6005c]">
          BIG DUMB GAMES
        </h1>
        <br />
        <p className="text-xl md:text-2xl mt-4 font-bold bg-yellow-300 inline-block px-2 border-2 border-black -rotate-2">
          COLLECTIVE CREDIT SIMULATOR v{milestone}.0
        </p>
      </header>

      {phase === 'working' && (
        <div className="flex-1 max-w-4xl w-full mx-auto">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-8 transform -rotate-1">
            <h2 className="text-2xl md:text-3xl font-black mb-4 uppercase flex justify-between items-center border-b-4 border-black pb-2">
              <span>Sprint #{milestone} in progress...</span>
              <span className="text-pink-600">{Math.floor(progressPercent)}%</span>
            </h2>
            <div className="h-8 bg-gray-200 border-2 border-black w-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-black transition-all duration-100 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 font-bold text-gray-600 text-sm">* Pounding keyboards * * Angry sighs *</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contributors.map(c => (
              <div key={c.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_#000] p-4 relative group hover:rotate-1 transition-transform">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold" style={{ backgroundColor: c.color }}>
                  {c.icon}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider mb-2">{c.name} <span className="text-sm font-normal bg-black text-white px-1 ml-2">{c.role}</span></h3>
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>WORK GRIND</span>
                    <span>{Math.floor(c.workDone)} pts</span>
                  </div>
                  <div className="h-4 bg-gray-200 border-2 border-black">
                    <div className="h-full border-r-2 border-black transition-all duration-100 ease-linear" style={{ width: `${Math.min(100, (c.workDone / (totalWorkReq/2)) * 100)}%`, backgroundColor: c.color }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>MORALE</span>
                    <span>{Math.floor(c.morale)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={16} fill={c.morale > 50 ? '#000' : 'none'} className={c.morale < 30 ? 'animate-pulse text-red-600' : ''} />
                    <div className="h-3 flex-1 bg-gray-200 border-2 border-black">
                      <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${c.morale}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'allocation' && (
        <div className="flex-1 max-w-4xl w-full mx-auto">
          <div className="bg-yellow-300 border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-8 transform rotate-1">
            <h2 className="text-4xl font-glitch uppercase mb-2">Milestone Reached!</h2>
            <p className="text-xl font-bold mb-4">Time to split the pie. Allocate credit fairly or watch the collective burn.</p>
            
            <div className={`text-2xl md:text-3xl font-black border-4 p-4 text-center transition-colors ${totalAllocation === 100 ? 'bg-green-400 border-black text-black' : 'bg-red-400 border-black animate-pulse text-white'}`}>
              TOTAL ALLOCATED: {totalAllocation}%
              {totalAllocation !== 100 && <div className="text-sm mt-1 text-black font-bold">MUST EQUAL EXACTLY 100%</div>}
            </div>
          </div>

          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-4 md:p-6 mb-8">
            {contributors.map(c => {
              const actualWorkShare = currentTotalWork > 0 ? ((c.workDone / currentTotalWork) * 100).toFixed(1) : '25.0';
              return (
                <div key={c.id} className="mb-6 pb-6 border-b-2 border-dashed border-gray-400 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex flex-col md:flex-row justify-between md:items-end mb-4">
                    <h3 className="text-2xl font-black uppercase flex items-center gap-2 mb-2 md:mb-0">
                      <span className="w-4 h-4 inline-block border-2 border-black" style={{ backgroundColor: c.color }}></span>
                      {c.name} 
                    </h3>
                    <div className="text-left md:text-right">
                      <div className="text-sm font-bold text-gray-600">Work Share: {actualWorkShare}%</div>
                      <div className="text-sm font-bold text-gray-600">Current Morale: {Math.floor(c.morale)}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={allocations[c.id] || 0} 
                      onChange={(e) => handleAllocationChange(c.id, parseInt(e.target.value))}
                      className="punk-slider flex-1"
                    />
                    <div className="w-16 text-right text-2xl font-black bg-black text-white p-1">
                      {allocations[c.id] || 0}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <button 
            onClick={submitAllocation}
            disabled={totalAllocation !== 100}
            className="w-full py-6 bg-pink-600 text-white border-4 border-black shadow-[8px_8px_0px_#000] text-2xl md:text-3xl font-black uppercase hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_#000] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-2 disabled:translate-x-2 transition-all"
          >
            CONFIRM PAYOUT
          </button>
        </div>
      )}

      {phase === 'gameover' && (
        <div className="flex-1 max-w-2xl w-full mx-auto flex items-center justify-center mt-12">
          <div className="bg-black text-white p-8 border-4 border-red-600 shadow-[12px_12px_0px_#ff0000] transform -rotate-2 text-center w-full">
            <Skull size={64} className="mx-auto mb-6 text-red-500" />
            <h2 className="text-4xl md:text-5xl font-glitch mb-4 text-red-500">COLLECTIVE DISSOLVED</h2>
            <p className="text-xl mb-6 font-bold">Someone's morale dropped to zero due to unfair credit splits. The indie dream is dead.</p>
            <div className="text-left mb-8 space-y-2 border-l-4 border-red-500 pl-4">
              {contributors.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-gray-900 p-2 border border-gray-800">
                  <span className="font-bold flex items-center gap-2">
                    <span className="w-3 h-3 inline-block" style={{ backgroundColor: c.color }}></span>
                    {c.name}
                  </span>
                  <span className={c.morale <= 0 ? 'text-red-500 font-black' : 'text-gray-300'}>{Math.floor(c.morale)}% Morale</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                setContributors(INITIAL_CONTRIBUTORS);
                setMilestone(1);
                setPhase('working');
              }}
              className="w-full bg-red-600 text-white font-black text-2xl py-4 border-2 border-white hover:bg-white hover:text-red-600 transition-colors"
            >
              START NEW STUDIO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
