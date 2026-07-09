import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Coins, Heart, Check, X, Shield, PlusCircle, Gavel, AlertCircle } from 'lucide-react';

// Helpers
const generateId = () => Math.random().toString(36).substr(2, 9);
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const AVATARS = ['🦊', '🐻', '🐰', '🐼', '🐨', '🐸', '🦉', '🐢', '🐙', '🐧', '🦄', '🐝', '🦁', '🐵', '🐱', '🐶', '🐯', '🐮', '🐷', '🦝'];
const FIRST_NAMES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Morgan', 'Jamie', 'Charlie', 'Drew', 'Harper', 'Rowan', 'Reese'];
const ROLES = ['Developer', 'Artist', 'Designer', 'QA Tester', 'Producer', 'Writer', 'Audio Engineer', 'Community Manager'];

const POLICIES = [
  { id: '1', title: '4-Day Work Week', description: 'Reduce working hours with no pay cut.', baseApprovalChance: 0.8 },
  { id: '2', title: 'Flat Salary Structure', description: 'Everyone gets paid exactly the same amount.', baseApprovalChance: 0.4 },
  { id: '3', title: 'Mandatory Crunch', description: 'Work weekends to hit the milestone.', baseApprovalChance: 0.1 },
  { id: '4', title: 'Profit Sharing', description: 'Distribute 30% of profits evenly to all staff.', baseApprovalChance: 0.9 },
  { id: '5', title: 'Remote Work Forever', description: 'Close the physical office permanently.', baseApprovalChance: 0.6 },
  { id: '6', title: 'Unlimited PTO', description: 'Take time off whenever you need it.', baseApprovalChance: 0.7 },
  { id: '7', title: 'Performance Bonuses', description: 'Extra pay based on individual performance.', baseApprovalChance: 0.5 },
  { id: '8', title: 'Open Finances', description: 'Share all studio financial data with everyone.', baseApprovalChance: 0.65 },
];

interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  avatar: string;
  founder?: boolean;
}

interface Policy {
  id: string;
  title: string;
  description: string;
  baseApprovalChance: number;
}

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: generateId(), name: 'Alex', role: 'Co-Founder', salary: 80000, avatar: '🦁', founder: true },
    { id: generateId(), name: 'Sam', role: 'Co-Founder', salary: 80000, avatar: '🦊', founder: true },
  ]);
  const [morale, setMorale] = useState<number>(100);
  const [policyQueue, setPolicyQueue] = useState<Policy[]>([...POLICIES].sort(() => 0.5 - Math.random()));
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteResults, setVoteResults] = useState<{ id: string, vote: boolean }[] | null>(null);
  const [voteSummary, setVoteSummary] = useState<{ passed: boolean, yes: number, no: number, moraleChange: number } | null>(null);
  const [log, setLog] = useState<{ id: string, message: string; type: 'hire' | 'vote' | 'alert' }[]>([]);

  const addLog = (message: string, type: 'hire' | 'vote' | 'alert') => {
    setLog(prev => [{ id: generateId(), message, type }, ...prev].slice(0, 10));
  };

  const handleHire = () => {
    if (employees.length >= 20) return;
    const isJunior = Math.random() > 0.5;
    const baseSalary = 50000;
    const role = randomChoice(ROLES);
    const newEmp: Employee = {
      id: generateId(),
      name: randomChoice(FIRST_NAMES),
      role: isJunior ? `Junior ${role}` : `Senior ${role}`,
      salary: isJunior ? baseSalary + randomInt(-5000, 10000) : baseSalary + randomInt(20000, 40000),
      avatar: randomChoice(AVATARS),
    };
    setEmployees(prev => [...prev, newEmp]);
    addLog(`Hired ${newEmp.name} as a ${newEmp.role} ($${newEmp.salary.toLocaleString()})`, 'hire');
  };

  const proposePolicy = () => {
    if (policyQueue.length === 0) {
      setPolicyQueue([...POLICIES].sort(() => 0.5 - Math.random()));
    }
    const policy = policyQueue[0];
    setPolicyQueue(prev => prev.slice(1));
    setCurrentPolicy(policy);
    setVoteResults(null);
    setVoteSummary(null);
  };

  const conductVote = () => {
    if (!currentPolicy) return;
    setIsVoting(true);
    
    setTimeout(() => {
      const results = employees.map(emp => {
        const variance = (Math.random() - 0.5) * 0.4;
        let chance = currentPolicy.baseApprovalChance + variance;
        chance += (morale - 50) / 500;
        return {
          id: emp.id,
          vote: Math.random() < chance
        };
      });
      
      const yesVotes = results.filter(r => r.vote).length;
      const noVotes = results.length - yesVotes;
      const passed = yesVotes > noVotes;
      
      let moraleChange = 0;
      if (yesVotes === results.length || noVotes === results.length) {
        moraleChange = 5;
      } else {
        const dissenters = passed ? noVotes : yesVotes;
        moraleChange = -(dissenters * randomInt(1, 3));
      }
      
      setMorale(prev => Math.max(0, Math.min(100, prev + moraleChange)));
      setVoteResults(results);
      setVoteSummary({ passed, yes: yesVotes, no: noVotes, moraleChange });
      setIsVoting(false);
      
      addLog(`Vote on "${currentPolicy.title}": ${passed ? 'Passed' : 'Failed'} (${yesVotes}Y / ${noVotes}N) - Morale ${moraleChange >= 0 ? '+' : ''}${moraleChange}`, 'vote');
      
    }, 1500);
  };

  const dismissPolicy = () => {
    setCurrentPolicy(null);
    setVoteResults(null);
    setVoteSummary(null);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#4a3f35] font-sans p-4 sm:p-6 selection:bg-[#e67e22] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-[#f4ebd8] p-6 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.1)] border-2 border-[#e8dcc4]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#e67e22]" />
              Co-Dev Studio Simulator
            </h1>
            <p className="text-[#7d6b56] mt-2 max-w-xl text-sm sm:text-base">
              Build a resilient studio through transparent pay and democratic power-sharing. 
              Every voice matters. Consensus builds morale; division tears it down.
            </p>
          </div>
          <div className="flex gap-4 sm:gap-6 mt-6 md:mt-0 text-base sm:text-lg font-semibold bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-sm border border-[#e8dcc4]">
            <div className="flex flex-col items-center">
              <span className="text-[#7d6b56] text-xs sm:text-sm uppercase tracking-wider">Team Size</span>
              <div className="flex items-center gap-2 text-xl">
                <Users className="w-5 h-5 text-blue-500" />
                {employees.length} / 20
              </div>
            </div>
            <div className="w-px bg-[#e8dcc4]"></div>
            <div className="flex flex-col items-center">
              <span className="text-[#7d6b56] text-xs sm:text-sm uppercase tracking-wider">Morale</span>
              <div className="flex items-center gap-2 text-xl">
                <Heart className={`w-5 h-5 ${morale > 50 ? 'text-green-500' : 'text-red-500'} ${morale < 30 ? 'animate-pulse' : ''} ${morale >= 100 ? 'fill-green-500' : ''}`} />
                {morale}%
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Board (Employees) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border-2 border-[#e8dcc4]">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-[#27ae60]" />
                Studio Roster
              </h2>
              <button 
                onClick={handleHire}
                disabled={employees.length >= 20 || isVoting}
                className="flex items-center gap-2 bg-[#e67e22] hover:bg-[#d67118] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <PlusCircle className="w-5 h-5" />
                Hire Employee
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {employees.map(emp => {
                  const voteResult = voteResults?.find(r => r.id === emp.id);
                  return (
                    <motion.div
                      key={emp.id}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="relative bg-white p-4 rounded-xl shadow-sm border-2 border-[#e8dcc4] flex flex-col items-center text-center group hover:shadow-md hover:-translate-y-1 transition-all"
                    >
                      <div className="text-4xl mb-3 relative">
                        {emp.avatar}
                        {emp.founder && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs w-5 h-5 rounded-full flex items-center justify-center border border-yellow-600 shadow-sm" title="Founder">👑</div>
                        )}
                        <AnimatePresence>
                          {voteResult && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md z-10 ${voteResult.vote ? 'bg-green-500' : 'bg-red-500'}`}
                            >
                              {voteResult.vote ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="font-bold text-lg leading-tight truncate w-full">{emp.name}</div>
                      <div className="text-xs text-[#7d6b56] mb-3 truncate w-full">{emp.role}</div>
                      <div className="mt-auto bg-[#f4ebd8] px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 border border-[#e8dcc4] w-full text-[#5c4f42]">
                        <Coins className="w-3.5 h-3.5 text-yellow-600" />
                        ${emp.salary.toLocaleString()}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar (Governance & Logs) */}
          <div className="space-y-6">
            
            {/* Governance Card */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-[#e8dcc4] p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#27ae60]"></div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Gavel className="w-6 h-6 text-[#27ae60]" />
                Governance
              </h2>
              
              {!currentPolicy ? (
                <div className="text-center py-8">
                  <p className="text-[#7d6b56] mb-6">No active policy proposals. The studio is running smoothly.</p>
                  <button 
                    onClick={proposePolicy}
                    disabled={employees.length < 2 || isVoting}
                    className="w-full py-3 bg-[#2c3e50] hover:bg-[#1a252f] text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    Propose New Policy
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-[#fdfbf7] border border-[#e8dcc4] p-4 rounded-xl">
                    <div className="text-xs uppercase tracking-widest text-[#e67e22] font-bold mb-1">On the Table</div>
                    <h3 className="text-xl font-bold mb-2 text-[#2c3e50]">{currentPolicy.title}</h3>
                    <p className="text-[#7d6b56] text-sm leading-relaxed">{currentPolicy.description}</p>
                  </div>
                  
                  {!voteSummary ? (
                    <div className="space-y-3">
                      <button 
                        onClick={conductVote}
                        disabled={isVoting}
                        className="w-full py-3 bg-[#e67e22] hover:bg-[#d67118] text-white rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {isVoting ? (
                          <>
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Voting in progress...
                          </>
                        ) : 'Call for a Vote'}
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className={`p-4 rounded-xl border-2 ${voteSummary.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className={`font-bold text-lg ${voteSummary.passed ? 'text-green-700' : 'text-red-700'}`}>
                            {voteSummary.passed ? 'Policy Adopted!' : 'Policy Rejected!'}
                          </span>
                          <span className="text-sm font-bold bg-white px-2 py-1 rounded shadow-sm border border-black/5">
                            {voteSummary.yes} Y / {voteSummary.no} N
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          {voteSummary.yes === employees.length || voteSummary.no === employees.length 
                            ? "Unanimous decision! The team is united."
                            : "There was disagreement. Not everyone is happy."}
                        </p>
                        <div className={`text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg w-max ${voteSummary.moraleChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <Heart className="w-4 h-4" />
                          Morale {voteSummary.moraleChange >= 0 ? '+' : ''}{voteSummary.moraleChange}
                        </div>
                      </div>
                      <button 
                        onClick={dismissPolicy}
                        className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                      >
                        Acknowledge
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Event Log */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-[#e8dcc4] p-6 h-64 flex flex-col">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#7d6b56]" />
                Studio Log
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence>
                  {log.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm p-3 rounded-lg bg-[#fdfbf7] border border-[#e8dcc4] text-[#4a3f35] flex gap-2"
                    >
                      <span>
                        {entry.type === 'hire' && '👋'}
                        {entry.type === 'vote' && '🗳️'}
                        {entry.type === 'alert' && '⚠️'}
                      </span>
                      <span>{entry.message}</span>
                    </motion.div>
                  ))}
                  {log.length === 0 && (
                    <div className="text-[#a89b8c] text-sm italic text-center mt-8">No events yet...</div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
