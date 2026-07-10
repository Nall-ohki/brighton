import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clapperboard, Video, AlertOctagon, CheckCircle2, RotateCcw, Play, X, Camera, ShieldAlert } from 'lucide-react';


type BeatId = 'b1' | 'b2' | 'b3';
type AngleId = 'a1' | 'a2' | 'a3';

interface CameraAngle {
  id: AngleId;
  name: string;
  thumbnailDesc: string;
  isSafe: boolean;
  reason: string;
}

interface ActionBeat {
  id: BeatId;
  name: string;
  description: string;
  angles: CameraAngle[];
}

const BEATS: Record<BeatId, ActionBeat> = {
  b1: {
    id: 'b1',
    name: 'A: Hook Punch',
    description: 'Character A throws a massive right hook at B.',
    angles: [
      { id: 'a1', name: 'Wide Profile', thumbnailDesc: 'Clear side view', isSafe: false, reason: 'Exposes the 1-foot gap between fist and face.' },
      { id: 'a2', name: 'Over Shoulder', thumbnailDesc: 'Behind A', isSafe: true, reason: 'Shoulder perfectly obscures the fake impact point.' },
      { id: 'a3', name: 'Low Angle', thumbnailDesc: 'Looking up', isSafe: false, reason: 'Safety crash mat is visible in frame.' },
    ]
  },
  b2: {
    id: 'b2',
    name: 'B: Duck & Sweep',
    description: 'Character B ducks under and leg sweeps.',
    angles: [
      { id: 'a1', name: 'High Angle', thumbnailDesc: 'Looking down', isSafe: false, reason: 'Shows B completely missing the leg.' },
      { id: 'a2', name: 'Ground Level MCU', thumbnailDesc: 'Close on legs', isSafe: true, reason: 'Hides the contact point and sells speed.' },
      { id: 'a3', name: 'Dutch Angle', thumbnailDesc: 'Tilted shot', isSafe: false, reason: 'Exposes knee pads on Character A.' },
    ]
  },
  b3: {
    id: 'b3',
    name: 'C: Block & Grab',
    description: 'Character C catches the sweep and grabs.',
    angles: [
      { id: 'a1', name: 'Wide Shot', thumbnailDesc: 'Full body', isSafe: false, reason: 'Lack of real force is obvious.' },
      { id: 'a2', name: 'Whip Pan', thumbnailDesc: 'Fast motion blur', isSafe: true, reason: 'Motion blur hides the gentle catch.' },
      { id: 'a3', name: 'POV (B)', thumbnailDesc: 'From B eyes', isSafe: false, reason: 'Awkward depth makes the grab look silly.' },
    ]
  }
};

interface TimelineSlot {
  beatId: BeatId | null;
  angleId: AngleId | null;
}

export default function App() {
  const [timeline, setTimeline] = useState<TimelineSlot[]>([
    { beatId: null, angleId: null },
    { beatId: null, angleId: null },
    { beatId: null, angleId: null },
  ]);
  
  const [status, setStatus] = useState<'idle' | 'playing' | 'halted' | 'success'>('idle');
  const [haltReason, setHaltReason] = useState<string>('');

  const availableBeats: BeatId[] = (['b1', 'b2', 'b3'] as BeatId[]).filter(
    b => !timeline.find(t => t.beatId === b)
  );

  const handleAddBeat = (bId: BeatId) => {
    if (status !== 'idle' && status !== 'halted') return;
    const nextIdx = timeline.findIndex(t => t.beatId === null);
    if (nextIdx !== -1) {
      const newT = [...timeline];
      newT[nextIdx] = { beatId: bId, angleId: null };
      setTimeline(newT);
      setStatus('idle');
    }
  };

  const handleRemoveBeat = (idx: number) => {
    if (status !== 'idle' && status !== 'halted') return;
    const newT = [...timeline];
    newT[idx] = { beatId: null, angleId: null };
    setTimeline(newT);
    setStatus('idle');
  };

  const handleSelectAngle = (slotIdx: number, aId: AngleId) => {
    if (status !== 'idle' && status !== 'halted') return;
    const newT = [...timeline];
    newT[slotIdx].angleId = aId;
    setTimeline(newT);
    setStatus('idle');
  };

  const handlePlay = () => {
    // Validation
    if (timeline.some(t => t.beatId === null || t.angleId === null)) {
      setHaltReason("Sequence incomplete. Fill all slots and select camera angles.");
      setStatus('halted');
      return;
    }

    setStatus('playing');

    setTimeout(() => {
      // Check order
      if (timeline[0].beatId !== 'b1' || timeline[1].beatId !== 'b2' || timeline[2].beatId !== 'b3') {
        setHaltReason("Incorrect Sequence Order! A must punch, then B ducks, then C catches.");
        setStatus('halted');
        return;
      }

      // Check safety
      let unsafeReason = '';
      let beatName = '';
      for (let i = 0; i < 3; i++) {
        const t = timeline[i];
        const beat = BEATS[t.beatId!];
        const angle = beat.angles.find(a => a.id === t.angleId);
        if (!angle?.isSafe) {
          unsafeReason = angle?.reason || 'Unsafe angle.';
          beatName = beat.name;
          break;
        }
      }

      if (unsafeReason) {
        setHaltReason(`SAFETY HALT on [${beatName}]: ${unsafeReason}`);
        setStatus('halted');
      } else {
        setStatus('success');
      }
    }, 1500);
  };

  const reset = () => {
    setTimeline([
      { beatId: null, angleId: null },
      { beatId: null, angleId: null },
      { beatId: null, angleId: null },
    ]);
    setStatus('idle');
    setHaltReason('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-mono overflow-hidden relative selection:bg-yellow-500/30">
      
      {/* Background Lighting Elements */}
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-yellow-900/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Safety Flashing Lights */}
      <AnimatePresence>
        {status === 'halted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute inset-0 bg-red-600/20 pointer-events-none z-50"
          />
        )}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-green-500/20 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto p-6 md:p-8 relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b-2 border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3 text-yellow-500 mb-2">
              <Clapperboard size={28} />
              <h1 className="text-2xl font-bold tracking-widest uppercase">Action Design Unit</h1>
            </div>
            <p className="text-slate-400 text-sm">SCENE 42 - STUNT CHOREOGRAPHY PUZZLE</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">DIRECTOR's NOTES</div>
            <div className="text-sm border border-slate-700 bg-slate-900/50 p-2 rounded max-w-sm">
              "Sequence: A hooks, B ducks/sweeps, C blocks/grabs. 
              Keep it safe. Hide the gaps!"
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          
          {/* Sidebar - Available Beats */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                AVAILABLE BEATS
              </h2>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {availableBeats.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-slate-500 text-sm italic"
                    >
                      All beats placed on timeline.
                    </motion.div>
                  )}
                  {availableBeats.map(bId => (
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={bId}
                      onClick={() => handleAddBeat(bId)}
                      className="w-full text-left p-4 rounded bg-slate-800/50 border border-slate-700 hover:border-yellow-500/50 hover:bg-slate-800 transition-all group"
                    >
                      <div className="font-bold text-slate-200 group-hover:text-yellow-400 transition-colors">
                        {BEATS[bId].name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{BEATS[bId].description}</div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Play Button Area */}
            <div className="pt-8 border-t border-slate-800">
              <button
                onClick={handlePlay}
                disabled={status === 'playing'}
                className={`w-full py-4 rounded-lg font-bold tracking-widest flex items-center justify-center gap-2 transition-all ${
                  status === 'playing' 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]'
                }`}
              >
                {status === 'playing' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <RotateCcw size={20} />
                  </motion.div>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />
                    ROLL ACTION
                  </>
                )}
              </button>
              
              <button
                onClick={reset}
                className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={14} /> RESET SCENE
              </button>
            </div>
          </div>

          {/* Main Area - Timeline */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
                <Video className="text-blue-400" size={20} />
                TIMELINE
              </h2>
            </div>

            <div className="space-y-4">
              {timeline.map((slot, idx) => {
                const beat = slot.beatId ? BEATS[slot.beatId] : null;

                return (
                  <motion.div 
                    layout
                    key={idx}
                    className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                      beat ? 'border-slate-700 bg-slate-900/80 shadow-lg' : 'border-dashed border-slate-800 bg-slate-900/30'
                    }`}
                  >
                    {!beat ? (
                      <div className="h-24 flex items-center justify-center text-slate-600 italic gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        Empty Slot
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row">
                        {/* Beat Info */}
                        <div className="md:w-1/3 p-4 bg-slate-800/40 border-b md:border-b-0 md:border-r border-slate-800 relative group">
                          <button 
                            onClick={() => handleRemoveBeat(idx)}
                            className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-slate-700/50"
                          >
                            <X size={16} />
                          </button>
                          <div className="text-xs text-yellow-500/70 font-bold mb-1 flex items-center gap-2">
                            BEAT {idx + 1}
                          </div>
                          <div className="font-bold text-lg text-slate-100">{beat.name}</div>
                          <div className="text-xs text-slate-400 mt-2">{beat.description}</div>
                        </div>

                        {/* Camera Angles Selection */}
                        <div className="md:w-2/3 p-4">
                          <div className="text-xs text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                            <Camera size={14} /> Select Camera Angle
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {beat.angles.map(angle => {
                              const isSelected = slot.angleId === angle.id;
                              return (
                                <button
                                  key={angle.id}
                                  onClick={() => handleSelectAngle(idx, angle.id)}
                                  className={`relative text-left p-3 rounded border transition-all ${
                                    isSelected 
                                      ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-0.5">
                                      <CheckCircle2 size={14} />
                                    </div>
                                  )}
                                  <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>
                                    {angle.name}
                                  </div>
                                  <div className="text-xs text-slate-500 leading-tight">
                                    {angle.thumbnailDesc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Status Overlay */}
      <AnimatePresence>
        {status === 'halted' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
          >
            <div className="bg-red-950/90 border-l-4 border-red-500 text-red-200 p-6 rounded-lg shadow-2xl backdrop-blur-sm flex items-start gap-4">
              <ShieldAlert className="text-red-500 shrink-0 mt-1" size={32} />
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-wider">CUT! Safety Halt!</h3>
                <p className="text-sm opacity-90">{haltReason}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 px-4 py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-800 rounded text-sm transition-colors"
                >
                  REVIEW SETUP
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-green-500/30 p-8 rounded-2xl max-w-lg w-full text-center shadow-[0_0_50px_rgba(34,197,94,0.2)]">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 size={40} />
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Cut! Print It!</h2>
              <p className="text-green-400/80 mb-8">Sequence is in correct order. All camera angles are safe. The illusion is perfect.</p>
              
              <button 
                onClick={reset}
                className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors w-full uppercase tracking-wider text-sm"
              >
                Next Setup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
