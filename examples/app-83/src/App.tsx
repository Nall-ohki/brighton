import React, { useState, useMemo } from 'react';
import { Clock, Zap, User, ShieldAlert, Film, Activity, AlertOctagon, CheckCircle } from 'lucide-react';
import './App.css';

type Actor = {
  id: string;
  name: string;
  physique: string;
  vocalType: string;
  stuntRating: string;
  maxStamina: number;
};

type Shot = {
  id: string;
  title: string;
  description: string;
  duration: number; // hours
  staminaCost: number;
  assignedActorId: string | null;
};

const INITIAL_ACTORS: Actor[] = [
  { id: 'a1', name: 'Mocap Mike', physique: 'Athletic', vocalType: 'Gruff', stuntRating: 'Expert', maxStamina: 6 },
  { id: 'a2', name: 'Flex Fiona', physique: 'Agile', vocalType: 'Clear', stuntRating: 'High', maxStamina: 5 },
  { id: 'a3', name: 'Drama Dan', physique: 'Average', vocalType: 'Booming', stuntRating: 'Low', maxStamina: 4 },
  { id: 'a4', name: 'Stunt Sam', physique: 'Muscular', vocalType: 'Muted', stuntRating: 'Insane', maxStamina: 8 },
  { id: 'a5', name: 'Zoe Zenith', physique: 'Slim', vocalType: 'Raspy', stuntRating: 'Medium', maxStamina: 5 },
];

const INITIAL_SHOTS: Shot[] = [
  { id: 's1', title: 'Hero Enters', description: 'Hero walks into frame menacingly. Moody lighting.', duration: 1, staminaCost: 1, assignedActorId: null },
  { id: 's2', title: 'Villain Monologue', description: 'Villain threatens the camera. Heavy vocal work.', duration: 2, staminaCost: 2, assignedActorId: null },
  { id: 's3', title: 'Epic Brawl', description: 'Hand to hand combat with multiple enemies.', duration: 3, staminaCost: 5, assignedActorId: null },
  { id: 's4', title: 'Sidekick Reacts', description: 'Surprised reaction shot to explosion.', duration: 1, staminaCost: 1, assignedActorId: null },
  { id: 's5', title: 'High Fall', description: 'Wire-work fall off a 2-story building.', duration: 2, staminaCost: 4, assignedActorId: null },
  { id: 's6', title: 'Stealth Takedown', description: 'Crouched movement into a quick grapple.', duration: 1, staminaCost: 2, assignedActorId: null },
  { id: 's7', title: 'Rooftop Chase', description: 'Parkour running over uneven surfaces.', duration: 2, staminaCost: 4, assignedActorId: null },
];

const DropZone = ({ onDrop }: { onDrop: (e: React.DragEvent) => void }) => {
  const [isOver, setIsOver] = useState(false);
  return (
    <div 
      className={`h-4 my-1 transition-all flex items-center justify-center ${isOver ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`}
      onDragOver={e => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={e => { setIsOver(false); onDrop(e); }}
    >
      <div className={`w-full h-0.5 border-t-2 border-dashed ${isOver ? 'border-cyan-400' : 'border-cyan-800'}`}></div>
    </div>
  )
}

function formatTime(hours: number) {
  const h = Math.floor(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${displayH.toString().padStart(2, '0')}:00 ${ampm}`;
}

const ScheduledShotCard = ({ sd, actors, handleDragStart, handleDropOnShot }: any) => {
  return (
    <div 
      draggable
      onDragStart={e => handleDragStart(e, "shot", sd.id)}
      className={`relative border-l-4 ${sd.quality < 100 || !sd.assignedActorId ? 'border-l-red-500 bg-red-950/20 border-red-900/50' : 'border-l-cyan-400 bg-cyan-900/30 border-cyan-700/50'} border p-3 flex flex-col justify-between cursor-grab backdrop-blur-sm group`}
      style={{ height: `${Math.max(100, sd.duration * 100)}px` }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => handleDropOnShot(e, sd.id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-cyan-50 tracking-wide">{sd.title}</div>
          <div className="text-[10px] text-cyan-600 mt-1">{sd.description}</div>
        </div>
        <div className="text-[11px] font-bold bg-[#000a12] px-2 py-1 border border-cyan-800 text-cyan-400 whitespace-nowrap">
          {formatTime(8 + sd.startTime)} - {formatTime(8 + sd.startTime + sd.duration)}
        </div>
      </div>
      
      <div className="mt-4 border border-dashed border-cyan-800/50 p-2 bg-[#000a12]/50 flex items-center justify-between">
        {sd.assignedActorId ? (
          <div className="flex items-center">
            <User size={14} className="mr-2 text-cyan-500"/>
            <span className="text-cyan-300 text-xs font-bold">{actors.find((a: Actor) => a.id === sd.assignedActorId)?.name}</span>
          </div>
        ) : (
          <div className="text-red-500/80 text-[10px] tracking-widest">[ UNASSIGNED ROLE ]</div>
        )}
        
        {sd.assignedActorId && (
          <div className={`text-[10px] font-bold px-2 py-0.5 border ${sd.quality < 100 ? 'border-red-500 text-red-400 bg-red-950/50' : 'border-cyan-500 text-cyan-400 bg-cyan-950/50'}`}>
            QUAL: {sd.quality}%
          </div>
        )}
      </div>
      
      {sd.warning && (
        <div className="absolute -bottom-2 -right-2 text-[10px] text-red-400 flex items-center bg-red-950 px-2 py-1 border border-red-800 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <ShieldAlert size={12} className="mr-1" /> {sd.warning}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [actors] = useState<Actor[]>(INITIAL_ACTORS);
  const [shots, setShots] = useState<Shot[]>(INITIAL_SHOTS);
  const [schedule, setSchedule] = useState<string[]>([]); 

  const scheduleStats = useMemo(() => {
    const staminaUsed: Record<string, number> = {};
    actors.forEach(a => staminaUsed[a.id] = 0);
    
    let currentTime = 0;
    
    const shotDetails = schedule.map(shotId => {
      const shot = shots.find(s => s.id === shotId)!;
      let quality = 100;
      let warning = null;
      
      if (shot.assignedActorId) {
        const actor = actors.find(a => a.id === shot.assignedActorId)!;
        const currentStamina = actor.maxStamina - staminaUsed[actor.id];
        
        if (currentStamina < shot.staminaCost) {
          const deficit = shot.staminaCost - currentStamina;
          if (currentStamina <= 0) {
            quality = 20; 
          } else {
            quality = Math.floor(100 - (deficit / shot.staminaCost) * 60);
          }
          warning = "Actor Exhausted! Performance quality dropped.";
        }
        staminaUsed[actor.id] += shot.staminaCost;
      } else {
        quality = 0;
        warning = "Unassigned Role! Cannot shoot.";
      }
      
      const startTime = currentTime;
      currentTime += shot.duration;
      
      return { ...shot, quality, warning, startTime };
    });
    
    return { shotDetails, staminaUsed, totalTime: currentTime };
  }, [shots, schedule, actors]);

  const handleDragStart = (e: React.DragEvent, type: string, id: string) => {
    e.dataTransfer.setData("type", type);
    e.dataTransfer.setData("id", id);
  };

  const handleDropOnShot = (e: React.DragEvent, shotId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData("type");
    const id = e.dataTransfer.getData("id");
    
    if (type === "actor") {
      setShots(shots.map(s => s.id === shotId ? { ...s, assignedActorId: id } : s));
    }
  };

  const handleDropOnSchedule = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    const id = e.dataTransfer.getData("id");
    
    if (type === "shot") {
      if (!schedule.includes(id)) {
        setSchedule([...schedule, id]);
      }
    }
  };

  const handleDropOnRoster = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    const id = e.dataTransfer.getData("id");
    
    if (type === "shot") {
      if (schedule.includes(id)) {
        setSchedule(schedule.filter(sId => sId !== id));
      }
    }
  };

  const handleDropOnScheduleIndex = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData("type");
    const id = e.dataTransfer.getData("id");
    
    if (type === "shot") {
      const oldIndex = schedule.indexOf(id);
      const newSchedule = [...schedule];
      if (oldIndex > -1) {
        newSchedule.splice(oldIndex, 1);
        if (oldIndex < index) index--; 
      }
      newSchedule.splice(index, 0, id);
      setSchedule(newSchedule);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-mono relative bg-[#000a12] text-cyan-50">
      <div className="scanline"></div>
      
      {/* Header */}
      <header className="h-16 border-b-2 border-cyan-800 bg-[#001424] flex items-center px-6 justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <Film className="text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-widest text-cyan-300">
            MOCAP_DIRECTOR <span className="text-cyan-700 text-sm ml-2">v2.4.1</span>
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className={`flex items-center space-x-2 px-4 py-1 border border-cyan-800 bg-[#000a12] ${scheduleStats.totalTime > 10 ? 'text-red-500 border-red-800 shadow-[0_0_10px_rgba(255,0,0,0.2)]' : 'text-cyan-400'}`}>
            <Activity size={18} />
            <span className="font-bold">SCHEDULE_LOAD: {scheduleStats.totalTime}/10 HRS</span>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex p-4 space-x-4 z-10">
        
        {/* Column 1: Actors */}
        <section className="w-1/4 flex flex-col border border-cyan-800 bg-[#00101f]/80 shadow-[0_0_15px_rgba(0,200,255,0.05)]">
          <div className="bg-cyan-950/60 p-2 border-b border-cyan-800 font-bold text-cyan-400 text-center tracking-wider">
            ROSTER // ACTORS
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {actors.map(actor => {
              const staminaLeft = Math.max(0, actor.maxStamina - (scheduleStats.staminaUsed[actor.id] || 0));
              const isExhausted = staminaLeft === 0;
              return (
                <div 
                  key={actor.id}
                  draggable
                  onDragStart={e => handleDragStart(e, "actor", actor.id)}
                  className={`border ${isExhausted ? 'border-red-900 bg-red-950/20' : 'border-cyan-800 bg-[#001a2c]'} p-3 cursor-grab hover:border-cyan-400 transition-colors group`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`font-bold ${isExhausted ? 'text-red-400' : 'text-cyan-200'}`}>{actor.name}</div>
                    <div className="text-[10px] bg-cyan-950 px-1 border border-cyan-900 text-cyan-500">ID:{actor.id}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-cyan-600 mb-3">
                    <div>PHY: <span className="text-cyan-400">{actor.physique}</span></div>
                    <div>VOC: <span className="text-cyan-400">{actor.vocalType}</span></div>
                    <div>STU: <span className="text-cyan-400">{actor.stuntRating}</span></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-cyan-600 flex items-center"><Zap size={10} className="mr-1 text-yellow-500" /> STAMINA</span>
                      <span className={isExhausted ? 'text-red-500 font-bold' : 'text-cyan-400'}>{staminaLeft} / {actor.maxStamina}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#000a12] border border-cyan-900 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${isExhausted ? 'bg-red-600' : 'bg-cyan-500 shadow-[0_0_5px_#00e5ff]'}`}
                        style={{ width: `${(staminaLeft / actor.maxStamina) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        
        {/* Column 2: Shots Roster */}
        <section className="w-1/3 flex flex-col border border-cyan-800 bg-[#00101f]/80 shadow-[0_0_15px_rgba(0,200,255,0.05)]">
          <div className="bg-cyan-950/60 p-2 border-b border-cyan-800 font-bold text-cyan-400 text-center tracking-wider">
            UNSCHEDULED_SHOTS
          </div>
          <div 
            className="flex-1 overflow-y-auto p-3 space-y-3"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDropOnRoster}
          >
            {shots.filter(s => !schedule.includes(s.id)).map(shot => (
              <div 
                key={shot.id}
                draggable
                onDragStart={e => handleDragStart(e, "shot", shot.id)}
                className="border border-cyan-700 bg-[#001829] p-3 cursor-grab hover:border-cyan-400 transition-colors"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDropOnShot(e, shot.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-cyan-100">{shot.title}</div>
                  <div className="flex space-x-2 text-[11px]">
                    <span className="flex items-center text-cyan-500"><Clock size={12} className="mr-1"/> {shot.duration}H</span>
                    <span className="flex items-center text-yellow-600"><Zap size={12} className="mr-1"/> {shot.staminaCost}</span>
                  </div>
                </div>
                <div className="text-[11px] text-cyan-700 mb-3 leading-tight">{shot.description}</div>
                
                <div className="border border-dashed border-cyan-800 bg-[#00101f] p-2 flex items-center justify-center min-h-[44px] hover:border-cyan-500 transition-colors">
                  {shot.assignedActorId ? (
                    <div className="text-cyan-300 text-xs flex items-center font-bold">
                      <User size={14} className="mr-2 text-cyan-500" />
                      {actors.find(a => a.id === shot.assignedActorId)?.name}
                    </div>
                  ) : (
                    <div className="text-cyan-800 text-[10px] tracking-widest text-center flex items-center">
                      [ DRAG ACTOR TO ASSIGN ]
                    </div>
                  )}
                </div>
              </div>
            ))}
            {shots.filter(s => !schedule.includes(s.id)).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-cyan-800 opacity-50 space-y-2">
                <CheckCircle size={32} />
                <span className="text-xs tracking-widest">ALL SHOTS SCHEDULED</span>
              </div>
            )}
          </div>
        </section>
        
        {/* Column 3: Timeline */}
        <section className="flex-1 flex flex-col border-2 border-cyan-600 bg-[#00101f]/90 shadow-[0_0_30px_rgba(0,255,255,0.1)] relative">
          <div className="bg-cyan-900/40 p-2 border-b-2 border-cyan-600 font-bold text-cyan-300 flex justify-between items-center tracking-wider">
            <span>SEQUENCE_GRID</span>
            {scheduleStats.totalTime > 10 && (
              <span className="text-red-500 text-xs flex items-center bg-red-950/50 px-2 py-0.5 border border-red-800 animate-pulse">
                <AlertOctagon size={12} className="mr-1"/>
                OVERTIME WARNING
              </span>
            )}
          </div>
          
          <div 
            className="flex-1 overflow-y-auto blueprint-bg p-4 relative"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDropOnSchedule}
          >
            {schedule.length === 0 && (
              <div className="absolute inset-4 border-2 border-dashed border-cyan-800 flex items-center justify-center text-cyan-700">
                <div className="text-center space-y-2">
                  <Clock size={32} className="mx-auto opacity-50" />
                  <div className="text-sm tracking-widest">DRAG SHOTS HERE TO BUILD SEQUENCE</div>
                </div>
              </div>
            )}
            
            <div className="relative">
              {schedule.map((shotId, idx) => {
                const sd = scheduleStats.shotDetails[idx];
                return (
                  <React.Fragment key={shotId + '-' + idx}>
                    <DropZone onDrop={(e) => handleDropOnScheduleIndex(e, idx)} />
                    <ScheduledShotCard 
                      sd={sd} 
                      actors={actors} 
                      handleDragStart={handleDragStart} 
                      handleDropOnShot={handleDropOnShot} 
                    />
                  </React.Fragment>
                )
              })}
              {schedule.length > 0 && <DropZone onDrop={(e) => handleDropOnScheduleIndex(e, schedule.length)} />}
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
}
