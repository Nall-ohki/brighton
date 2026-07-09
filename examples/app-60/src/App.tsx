import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TokenType = 'FLEX_DEADLINE' | 'QUIET_ROOM' | 'WRITTEN_BRIEFS' | 'CHECK_IN' | 'CLEAR_AC' | 'NOISE_CANCELING';

interface SupportTokenDef {
  id: TokenType;
  label: string;
  cost: number;
  color: string;
}

const TOKEN_TYPES: SupportTokenDef[] = [
  { id: 'FLEX_DEADLINE', label: 'Flexible Deadline', cost: 15, color: '#e0f2fe' },
  { id: 'QUIET_ROOM', label: 'Quiet Room', cost: 10, color: '#f3e8ff' },
  { id: 'WRITTEN_BRIEFS', label: 'Written Briefs', cost: 20, color: '#e0ffe0' },
  { id: 'CHECK_IN', label: '1:1 Check-in', cost: 25, color: '#ffedd5' },
  { id: 'CLEAR_AC', label: 'Clear Criteria', cost: 15, color: '#fce7f3' },
  { id: 'NOISE_CANCELING', label: 'Headphones', cost: 5, color: '#eef2ff' },
];

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: 't1', name: 'Alex', role: '3D Artist', avatar: 'A' },
  { id: 't2', name: 'Sam', role: 'Level Designer', avatar: 'S' },
  { id: 't3', name: 'Jordan', role: 'Programmer', avatar: 'J' },
  { id: 't4', name: 'Casey', role: 'UI/UX Designer', avatar: 'C' },
  { id: 't5', name: 'Taylor', role: 'Writer', avatar: 'T' },
  { id: 't6', name: 'Morgan', role: 'QA Tester', avatar: 'M' },
];

interface ActiveRequest {
  id: string;
  member: TeamMember;
  neededSupport: TokenType;
  fulfilled: boolean;
}

const MAX_WELLBEING = 100;

export default function App() {
  const [week, setWeek] = useState(1);
  const [wellbeing, setWellbeing] = useState(MAX_WELLBEING);
  const [productivity, setProductivity] = useState(0);
  const [requests, setRequests] = useState<ActiveRequest[]>([]);
  const [gameOver, setGameOver] = useState(false);
  
  const memberRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const generateRequests = (weekNum: number) => {
    const numRequests = Math.min(3 + Math.floor(weekNum / 2), 6);
    const shuffledMembers = [...TEAM_MEMBERS].sort(() => 0.5 - Math.random()).slice(0, numRequests);
    
    const newRequests = shuffledMembers.map(member => {
      const randomToken = TOKEN_TYPES[Math.floor(Math.random() * TOKEN_TYPES.length)];
      return {
        id: `req-${weekNum}-${member.id}`,
        member,
        neededSupport: randomToken.id,
        fulfilled: false
      };
    });
    setRequests(newRequests);
  };

  useEffect(() => {
    generateRequests(week);
  }, [week]);

  const handleDragEnd = (e: any, info: any, token: SupportTokenDef) => {
    const { x, y } = info.point;
    let droppedOnReqId: string | null = null;

    for (const [reqId, el] of Object.entries(memberRefs.current)) {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          droppedOnReqId = reqId;
          break;
        }
      }
    }

    if (droppedOnReqId) {
      const requestIndex = requests.findIndex(r => r.id === droppedOnReqId);
      if (requestIndex > -1) {
        const request = requests[requestIndex];
        if (!request.fulfilled && request.neededSupport === token.id) {
          const newWellbeing = wellbeing - token.cost;
          
          if (newWellbeing <= 0) {
            setWellbeing(0);
            setGameOver(true);
          } else {
            setWellbeing(newWellbeing);
            setProductivity(p => p + 10);
            const newReqs = [...requests];
            newReqs[requestIndex].fulfilled = true;
            setRequests(newReqs);
          }
        }
      }
    }
  };

  const endWeek = () => {
    const unfulfilledCount = requests.filter(r => !r.fulfilled).length;
    setProductivity(p => Math.max(0, p - unfulfilledCount * 5));
    
    setWeek(w => w + 1);
    setWellbeing(MAX_WELLBEING);
  };

  const restartGame = () => {
    setWeek(1);
    setWellbeing(MAX_WELLBEING);
    setProductivity(0);
    setGameOver(false);
  };

  const allFulfilled = requests.length > 0 && requests.every(r => r.fulfilled);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8 flex flex-col items-center overflow-x-hidden">
      <header className="max-w-4xl w-full flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-light text-slate-700 tracking-tight mb-2">Beyond Awareness</h1>
          <p className="text-slate-500 text-sm">Manager Support Allocation Simulation</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-slate-700">Week {week}</div>
          <div className="text-sm text-slate-500">Productivity Score: {productivity}</div>
        </div>
      </header>

      {gameOver ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full"
          >
            <h2 className="text-3xl font-bold text-red-500 mb-4">Burnout!</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your wellbeing meter hit zero. Without emotional capacity to support the team, production has collapsed. Remember to pace yourself!
            </p>
            <button 
              onClick={restartGame}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors w-full"
            >
              Restart Simulation
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="max-w-5xl w-full flex flex-col gap-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-slate-600">Your Emotional Labour Budget</h3>
              <span className="text-sm font-semibold text-slate-500">{wellbeing} / {MAX_WELLBEING}</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-400 to-teal-400"
                animate={{ width: `${(wellbeing / MAX_WELLBEING) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Fulfilling support requests costs emotional labour. Pace yourself.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {requests.map(req => {
                const tokenDef = TOKEN_TYPES.find(t => t.id === req.neededSupport)!;
                return (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    ref={(el) => (memberRefs.current[req.id] = el)}
                    className={`relative p-6 rounded-2xl border transition-all ${
                      req.fulfilled 
                        ? 'bg-slate-50 border-slate-200 opacity-60 grayscale-[0.2]' 
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400 border border-slate-200">
                        {req.member.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700">{req.member.name}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">{req.member.role}</div>
                      </div>
                    </div>
                    
                    {!req.fulfilled ? (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
                        <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Needs accommodation</div>
                        <div className="font-medium text-slate-700">{tokenDef.label}</div>
                      </div>
                    ) : (
                      <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 text-teal-700 flex items-center justify-center font-medium gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Supported
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 relative z-10">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-slate-600">Support Tokens (Drag to match accommodation needs)</h3>
              <button
                onClick={endWeek}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  allFulfilled 
                    ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {allFulfilled ? 'Start Next Week' : 'End Week Early'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {TOKEN_TYPES.map(token => (
                <div key={token.id} className="relative">
                  <div className="absolute inset-0 border-2 border-dashed border-slate-200 rounded-xl opacity-50" />
                  
                  <motion.div
                    drag
                    dragSnapToOrigin
                    onDragEnd={(e, info) => handleDragEnd(e, info, token)}
                    whileHover={{ scale: 1.05 }}
                    whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
                    className="relative px-5 py-3 rounded-xl shadow-sm border cursor-grab flex flex-col items-center justify-center select-none"
                    style={{ backgroundColor: token.color, borderColor: 'rgba(0,0,0,0.05)' }}
                  >
                    <span className="font-medium text-slate-700 whitespace-nowrap">{token.label}</span>
                    <span className="text-xs text-slate-500 font-medium mt-1">Cost: {token.cost}</span>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
