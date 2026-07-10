import React, { useState, useMemo } from 'react';

// Data Models
const ACTORS = [
  { id: 'a1', name: 'John', location: 'LA', union: 'SAG-AFTRA', hours: 2, availLA: [9, 16], availStr: '09:00 - 16:00 PST', rate: 500, currency: '$' },
  { id: 'a2', name: 'Sarah', location: 'UK', union: 'Equity', hours: 3, availLA: [1, 8], availStr: '09:00 - 16:00 GMT', rate: 300, currency: '£' },
  { id: 'a3', name: 'Mike', location: 'LA', union: 'SAG-AFTRA', hours: 4, availLA: [10, 17], availStr: '10:00 - 17:00 PST', rate: 600, currency: '$' },
  { id: 'a4', name: 'Emma', location: 'UK', union: 'Equity', hours: 2, availLA: [5, 11], availStr: '13:00 - 19:00 GMT', rate: 400, currency: '£' },
  { id: 'a5', name: 'David', location: 'UK', union: 'Equity', hours: 3, availLA: [2, 9], availStr: '10:00 - 17:00 GMT', rate: 350, currency: '£' },
  { id: 'a6', name: 'Lisa', location: 'LA', union: 'SAG-AFTRA', hours: 2, availLA: [13, 20], availStr: '13:00 - 20:00 PST', rate: 550, currency: '$' },
];

const TRACKS = [
  { id: 't1', name: 'US LINK', allowedUnion: 'SAG-AFTRA' },
  { id: 't2', name: 'UK LINK', allowedUnion: 'Equity' }
];

const MAX_BUDGET = 8000;

// Icons
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Components
const AnalogClock = ({ hour, label }: { hour: number, label: string }) => {
  const angle = (hour % 12) * 30; 
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full border-2 border-slate-700 relative bg-slate-900 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
        <div 
          className="absolute w-0.5 h-6 bg-cyan-400 bottom-1/2 left-1/2 origin-bottom transform transition-transform duration-300"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1 left-1/2 w-0.5 h-1.5 bg-slate-500 transform -translate-x-1/2" />
        <div className="absolute bottom-1 left-1/2 w-0.5 h-1.5 bg-slate-500 transform -translate-x-1/2" />
        <div className="absolute left-1 top-1/2 w-1.5 h-0.5 bg-slate-500 transform -translate-y-1/2" />
        <div className="absolute right-1 top-1/2 w-1.5 h-0.5 bg-slate-500 transform -translate-y-1/2" />
      </div>
      <div className="text-[10px] text-slate-500 mt-2 font-bold tracking-widest">{label}</div>
      <div className="text-xs font-mono text-slate-300 font-bold">{Math.floor(hour).toString().padStart(2, '0')}:00</div>
    </div>
  )
}

export default function App() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{hour: number, trackId: string} | null>(null);

  const selectedActor = useMemo(() => ACTORS.find(a => a.id === selectedActorId), [selectedActorId]);

  // Validation Logic
  const validation = useMemo(() => {
    let alerts: string[] = [];
    let totalUSD = 0;
    
    sessions.forEach(s => {
      const a = ACTORS.find(ac => ac.id === s.actorId);
      if (!a) return;
      const track = TRACKS.find(t => t.id === s.trackId);
      
      if (track && a.union !== track.allowedUnion) {
        alerts.push(`Contract mismatch: ${a.name} (${a.union}) assigned to ${track.name}.`);
      }

      let cost = a.currency === '£' ? a.rate * 1.25 * a.hours : a.rate * a.hours;
      if (s.startHour < a.availLA[0] || (s.startHour + a.hours) > a.availLA[1]) {
        cost *= 1.5;
        alerts.push(`Availability: ${a.name} scheduled outside local hours (1.5x Penalty).`);
      }
      totalUSD += cost;
    });

    if (totalUSD > MAX_BUDGET) {
      alerts.push(`Budget Dispute: Total cost $${totalUSD.toFixed(0)} exceeds $${MAX_BUDGET} daily budget.`);
    }

    let sorted = [...sessions].sort((a, b) => a.startHour - b.startHour);
    for (let i = 0; i < sorted.length - 1; i++) {
       const s1 = sorted[i];
       const a1 = ACTORS.find(ac => ac.id === s1.actorId);
       const end1 = s1.startHour + (a1?.hours || 0);
       
       const s2 = sorted[i+1];
       const a2 = ACTORS.find(ac => ac.id === s2.actorId);
       const start2 = s2.startHour;

       if (!a1 || !a2) continue;

       if (end1 > start2) {
         alerts.push(`Director Double-booked: Overlap between ${a1.name} and ${a2.name}.`);
       } else if (a1.union !== a2.union) {
         const gap = start2 - end1;
         if (gap < 1) {
           alerts.push(`Mind the Gap: Missing 1-hour break between ${a1.union} and ${a2.union} sessions.`);
         }
       }
    }

    return { alerts, totalUSD };
  }, [sessions]);

  const isWin = sessions.length === ACTORS.length && validation.alerts.length === 0;
  const hoverLA = hoveredSlot !== null ? hoveredSlot.hour : 12;

  const handleSchedule = (hour: number, trackId: string) => {
    if (!selectedActor) return;
    if (hour + selectedActor.hours > 24) return; 
    setSessions([...sessions, { id: Math.random().toString(), actorId: selectedActor.id, startHour: hour, trackId }]);
    setSelectedActorId(null);
    setHoveredSlot(null);
  }

  const formatTime = (h: number) => `${(h % 24).toString().padStart(2, '0')}:00`;

  return (
    <div className="h-screen bg-slate-950 text-slate-200 font-sans p-6 flex flex-col overflow-hidden selection:bg-cyan-900">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            CROSS-BORDER CASTING
          </h1>
          <p className="text-slate-400 text-sm tracking-widest mt-1">GLOBAL SYNC CONSOLE // SCHEDULING</p>
        </div>
        
        <div className="flex gap-8">
          <AnalogClock hour={hoverLA} label="LOS ANGELES (PST)" />
          <AnalogClock hour={(hoverLA + 8) % 24} label="LONDON (GMT)" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* LEFT PANEL - ACTORS */}
        <div className="w-80 shrink-0 flex flex-col min-h-0">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-4 shrink-0">
            <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-bold tracking-widest">
              <span>CASTING PROGRESS</span>
              <span>{sessions.length} / {ACTORS.length} TALENT</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(sessions.length / ACTORS.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3 shrink-0">Talent Roster</h2>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-4">
            {ACTORS.map(actor => {
              const isScheduled = sessions.some(s => s.actorId === actor.id);
              return (
                <div 
                  key={actor.id}
                  onClick={() => !isScheduled && setSelectedActorId(isScheduled || selectedActorId === actor.id ? null : actor.id)}
                  className={`
                    p-4 rounded-xl border text-sm transition-all relative overflow-hidden flex flex-col gap-2
                    ${isScheduled ? 'opacity-40 border-slate-800 bg-slate-900/50 cursor-not-allowed grayscale' : 
                      selectedActorId === actor.id 
                        ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(34,211,238,0.1)] cursor-pointer scale-[1.02]' 
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 cursor-pointer hover:bg-slate-800'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg leading-tight">{actor.name}</div>
                      <div className={`text-[10px] font-black tracking-wider ${actor.union === 'SAG-AFTRA' ? 'text-blue-400' : 'text-pink-400'}`}>
                        {actor.union}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-slate-300 font-bold">{actor.currency}{actor.rate}/h</div>
                      <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{actor.hours}h Block</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono bg-black/40 p-2 rounded text-center border border-slate-800/50">
                    Avail: <span className="text-slate-300">{actor.availStr}</span>
                  </div>

                  {isScheduled && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none">
                      <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/50 text-xs font-black tracking-widest flex items-center gap-1 shadow-lg">
                        SCHEDULED
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANEL - TIMELINE & ALERTS */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          
          {/* TIMELINE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shrink-0 shadow-2xl">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Master Timeline</h2>
              
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Budget Usage</div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${validation.totalUSD > MAX_BUDGET ? 'bg-red-500' : 'bg-cyan-500'}`}
                      style={{ width: `${Math.min(100, (validation.totalUSD / MAX_BUDGET) * 100)}%` }}
                    />
                  </div>
                  <div className={`text-xs font-mono font-bold ${validation.totalUSD > MAX_BUDGET ? 'text-red-400' : 'text-cyan-400'}`}>
                    ${validation.totalUSD.toFixed(0)} / ${MAX_BUDGET}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex">
              {/* Left Labels */}
              <div className="w-20 shrink-0 flex flex-col border-r border-slate-800/50 pr-4">
                <div className="h-6" /> {/* LA Spacer */}
                {TRACKS.map(track => (
                  <div key={track.id} className="h-20 flex flex-col items-end justify-center text-[10px] text-slate-500 font-bold">
                    <span className={`tracking-widest ${track.allowedUnion === 'SAG-AFTRA' ? 'text-blue-500/80' : 'text-pink-500/80'}`}>
                      {track.name}
                    </span>
                    <span className="text-[8px] opacity-60 tracking-wider">{track.allowedUnion}</span>
                  </div>
                ))}
                <div className="h-6" /> {/* UK Spacer */}
              </div>

              {/* Grid Area */}
              <div className="flex-1 flex flex-col relative select-none">
                
                {/* LA Axis */}
                <div className="h-6 flex relative">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={`la-${i}`} className="absolute h-full flex items-center justify-center text-[10px] text-slate-500 font-mono border-l border-slate-800/30"
                         style={{ left: `${(i / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}>
                      {i.toString().padStart(2,'0')}
                    </div>
                  ))}
                </div>
                
                {/* Tracks */}
                <div 
                  className="relative bg-slate-950/50 border-y border-slate-800 flex flex-col shadow-inner"
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  {TRACKS.map((track, trackIdx) => (
                    <div key={track.id} className="h-20 border-b border-slate-800/50 last:border-b-0 relative flex group/track">
                      {/* Sub-grid lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="flex-1 border-r border-slate-800/30" />
                        ))}
                      </div>

                      {/* Interactive Cells */}
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div 
                          key={i}
                          className="flex-1 hover:bg-white/5 transition-colors cursor-pointer z-10"
                          onMouseEnter={() => setHoveredSlot({ hour: i, trackId: track.id })}
                          onClick={() => handleSchedule(i, track.id)}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Placed Sessions */}
                  {sessions.map(s => {
                    const actor = ACTORS.find(ac => ac.id === s.actorId)!;
                    const trackIdx = TRACKS.findIndex(t => t.id === s.trackId);
                    return (
                      <div 
                        key={s.id}
                        className={`absolute rounded-lg p-2 flex flex-col justify-center cursor-pointer overflow-hidden backdrop-blur-md border shadow-lg transition-transform hover:-translate-y-1 group z-20
                          ${actor.union === 'SAG-AFTRA' ? 'bg-blue-900/80 border-blue-400 text-blue-50' : 'bg-pink-900/80 border-pink-400 text-pink-50'}
                        `}
                        style={{ 
                          left: `${(s.startHour / 24) * 100}%`, 
                          width: `${(actor.hours / 24) * 100}%`,
                          top: `${trackIdx * 80 + 10}px`,
                          height: '60px'
                        }}
                        onClick={(e) => { e.stopPropagation(); setSessions(sessions.filter(x => x.id !== s.id)); }}
                      >
                        <div className="text-[11px] font-black truncate">{actor.name}</div>
                        <div className="text-[9px] opacity-80 truncate">{actor.union}</div>
                        
                        {/* Remove Button Overlay */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white bg-black/20 rounded p-0.5">
                          <XIcon />
                        </div>
                      </div>
                    )
                  })}

                  {/* Hover Preview */}
                  {selectedActor && hoveredSlot && (
                    <div 
                      className={`absolute rounded-lg border-2 border-dashed pointer-events-none flex items-center justify-center z-10 transition-all duration-75
                        ${hoveredSlot.hour + selectedActor.hours > 24 ? 'border-red-500 bg-red-900/30' : 'border-cyan-400 bg-cyan-900/30'}
                      `}
                      style={{ 
                        left: `${(hoveredSlot.hour / 24) * 100}%`, 
                        width: `${(Math.min(24 - hoveredSlot.hour, selectedActor.hours) / 24) * 100}%`,
                        top: `${TRACKS.findIndex(t => t.id === hoveredSlot.trackId) * 80 + 10}px`,
                        height: '60px'
                      }}
                    >
                      <span className={`text-[9px] font-black tracking-widest px-2 py-1 bg-black/60 rounded backdrop-blur-sm
                        ${hoveredSlot.hour + selectedActor.hours > 24 ? 'text-red-400' : 'text-cyan-400'}
                      `}>
                        {hoveredSlot.hour + selectedActor.hours > 24 ? 'OUT OF BOUNDS' : 'PLACE'}
                      </span>
                    </div>
                  )}
                </div>

                {/* UK Axis */}
                <div className="h-6 flex relative">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={`uk-${i}`} className="absolute h-full flex items-center justify-center text-[10px] text-slate-500 font-mono border-l border-slate-800/30 pt-1"
                         style={{ left: `${(i / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}>
                      {((i + 8) % 24).toString().padStart(2,'0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ALERTS CONSOLE */}
          <div className="bg-black/60 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col overflow-hidden relative shadow-inner">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-50" />
            <h2 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4 shrink-0">System Log // Alerts</h2>
            
            <div className="font-mono text-sm space-y-3 overflow-y-auto pr-2 flex-1">
              {validation.alerts.length === 0 ? (
                <div className="text-emerald-500 flex items-center gap-3 bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
                  <span className="tracking-wide">NO DISPUTES DETECTED. SCHEDULE COMPLIANT.</span>
                </div>
              ) : (
                validation.alerts.map((alert, i) => (
                  <div key={i} className="text-red-400 flex items-start gap-3 bg-red-950/20 p-4 rounded-lg border border-red-900/30 animate-in fade-in slide-in-from-bottom-2">
                    <span className="shrink-0 text-red-500 bg-red-950 px-2 py-0.5 rounded text-[10px] border border-red-900/50 mt-0.5 font-bold tracking-widest shadow-inner">
                      [{formatTime(hoverLA)} SYNC]
                    </span>
                    <span className="leading-relaxed text-[13px] tracking-wide">{alert}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* WIN MODAL */}
      {isWin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
          <div className="bg-slate-900 border-2 border-emerald-500/50 p-10 rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.15)] max-w-lg w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
            
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.4)] relative">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20" />
              <CheckIcon />
            </div>
            
            <h2 className="text-2xl font-black text-emerald-400 mb-3 tracking-widest uppercase">Schedule Finalized</h2>
            <p className="text-slate-300 mb-10 leading-relaxed text-sm">
              All talent successfully scheduled across zones.<br/>No union disputes detected. Budget maintained.<br/>The broadcast is ready for production.
            </p>
            
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-emerald-500 text-slate-950 font-black tracking-widest text-sm rounded-xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 w-full shadow-lg"
            >
              INITIALIZE NEW SCHEDULE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
