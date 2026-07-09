import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Code, Users, Map, Plus, CheckCircle, Award, Target, Briefcase } from 'lucide-react';
import './App.css';

const SKILLS: Record<string, any> = {
  code_review: { id: 'code_review', name: 'Code Review', type: 'engineering', icon: Code, impact: 'Fewer bugs in production, team levels up faster.' },
  architecture: { id: 'architecture', name: 'Architecture', type: 'engineering', icon: Target, impact: 'System handles 10x scale without breaking.' },
  mentorship: { id: 'mentorship', name: 'Mentorship', type: 'engineering', icon: Users, impact: 'Increased team retention and velocity.' },
  one_on_ones: { id: 'one_on_ones', name: '1:1s', type: 'management', icon: Users, impact: 'High team morale and early issue detection.' },
  roadmapping: { id: 'roadmapping', name: 'Roadmapping', type: 'management', icon: Map, impact: 'Clear expectations for stakeholders.' },
  hiring: { id: 'hiring', name: 'Hiring', type: 'management', icon: User, impact: 'Build a strong, diverse team.' },
  tech_direction: { id: 'tech_direction', name: 'Tech Direction', type: 'management', icon: Target, impact: 'Align engineering efforts with business needs.' },
  perf_reviews: { id: 'perf_reviews', name: 'Perf Reviews', type: 'management', icon: Award, impact: 'Fair compensation and career growth.' },
  conflict_res: { id: 'conflict_res', name: 'Conflict Res', type: 'management', icon: Users, impact: 'Healthy team dynamics.' },
  delegation: { id: 'delegation', name: 'Delegation', type: 'management', icon: Briefcase, impact: 'Multiply team output and grow leaders.' }
};

const TREE = {
  id: 'root',
  name: 'IC Engineer',
  type: 'root',
  children: [
    {
      ...SKILLS.code_review,
      children: [
        { ...SKILLS.architecture, children: [{ ...SKILLS.tech_direction, children: [] }] }
      ]
    },
    {
      ...SKILLS.mentorship,
      children: [
        { 
          ...SKILLS.one_on_ones, 
          children: [
            { ...SKILLS.perf_reviews, children: [] }, 
            { ...SKILLS.conflict_res, children: [] }
          ] 
        }
      ]
    },
    {
      ...SKILLS.roadmapping,
      children: [
        { ...SKILLS.hiring, children: [{ ...SKILLS.delegation, children: [] }] }
      ]
    }
  ]
};

const ARCHETYPES = [
  { id: 'tech_lead', name: 'Tech Lead', reqs: ['code_review', 'architecture', 'mentorship'], color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'eng_manager', name: 'Engineering Manager', reqs: ['one_on_ones', 'hiring', 'roadmapping', 'perf_reviews'], color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'staff_eng', name: 'Staff Engineer', reqs: ['architecture', 'tech_direction', 'mentorship'], color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'director', name: 'Director of Eng', reqs: ['hiring', 'roadmapping', 'tech_direction', 'perf_reviews', 'delegation'], color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'tlm', name: 'Tech Lead Manager', reqs: ['architecture', 'one_on_ones', 'code_review'], color: 'bg-amber-100 text-amber-800 border-amber-300' }
];

const TreeNode = ({ node, acquired, onAcquire, parentAcquired }: any) => {
  const isAcquired = acquired.includes(node.id) || node.id === 'root';
  const isAvailable = parentAcquired && !isAcquired;
  const isRoot = node.id === 'root';
  
  const Icon = node.icon || User;

  return (
    <li>
      <div className="inline-block relative group z-10">
        <motion.div 
          whileHover={isAvailable ? { scale: 1.05 } : {}}
          whileTap={isAvailable ? { scale: 0.95 } : {}}
          onClick={() => isAvailable && onAcquire(node.id)}
          className={`
            relative p-4 rounded-xl border-2 w-44 text-center transition-all duration-300 shadow-sm flex flex-col items-center justify-center min-h-[100px]
            ${isRoot ? 'bg-slate-800 text-white border-slate-900' : ''}
            ${!isRoot && isAcquired ? (node.type === 'management' ? 'bg-purple-600 border-purple-700 text-white' : 'bg-blue-600 border-blue-700 text-white') : ''}
            ${!isRoot && !isAcquired && isAvailable ? 'bg-white text-slate-800 border-indigo-300 hover:border-indigo-500 hover:shadow-md cursor-pointer' : ''}
            ${!isRoot && !isAcquired && !isAvailable ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60' : ''}
          `}
        >
           <div className="flex flex-col items-center gap-1.5">
             {isRoot ? <User className="w-6 h-6 mb-1" /> : <Icon className="w-5 h-5 mb-1 opacity-90" />}
             <div className="font-bold text-sm leading-tight">{node.name}</div>
             {!isRoot && <div className="text-[10px] uppercase font-bold tracking-widest opacity-70">{node.type}</div>}
           </div>
           
           {isAcquired && !isRoot && (
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
               <CheckCircle size={18} />
             </motion.div>
           )}
           {isAvailable && (
             <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-0.5 animate-bounce shadow-md">
               <Plus size={18} />
             </div>
           )}
        </motion.div>
        
        {!isRoot && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
            <div className="font-semibold text-indigo-300 mb-1">Impact</div>
            <div className="leading-relaxed">{node.impact}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
          </div>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child: any) => (
            <TreeNode 
              key={child.id}
              node={child} 
              acquired={acquired} 
              onAcquire={onAcquire} 
              parentAcquired={isAcquired} 
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const ArchetypeCard = ({ archetype, acquired }: any) => {
  const isUnlocked = archetype.reqs.every((req: string) => acquired.includes(req));
  const progress = archetype.reqs.filter((req: string) => acquired.includes(req)).length;
  const total = archetype.reqs.length;
  const percentage = Math.round((progress / total) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-2 transition-all duration-500 ${isUnlocked ? archetype.color + ' shadow-lg scale-105 z-10' : 'bg-white border-slate-200 text-slate-400'}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className={`font-bold ${isUnlocked ? '' : 'text-slate-600'}`}>{archetype.name}</h3>
        {isUnlocked && <Award className="w-5 h-5" />}
      </div>
      
      {!isUnlocked ? (
        <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
          <div className="bg-indigo-400 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
        </div>
      ) : (
        <div className="text-xs font-bold uppercase tracking-wider mb-3 opacity-90">Unlocked!</div>
      )}
      
      <div className="flex flex-wrap gap-1.5 mt-2">
        {archetype.reqs.map((req: string) => {
          const hasReq = acquired.includes(req);
          return (
            <span key={req} className={`text-[10px] px-2 py-1 rounded-full ${hasReq ? 'bg-black/10 font-bold' : 'bg-slate-100 text-slate-400 border border-slate-200 font-medium'}`}>
              {SKILLS[req].name}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [acquired, setAcquired] = useState<string[]>([]);

  const handleAcquire = (id: string) => {
    if (!acquired.includes(id)) {
      setAcquired([...acquired, id]);
    }
  };

  const reset = () => setAcquired([]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden flex flex-col">
      <header className="bg-white border-b border-slate-200 p-6 shadow-sm z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Career Path: IC to Management</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Build your skill tree and discover your leadership archetype.</p>
          </div>
          <button onClick={reset} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-sm">
            Reset Progress
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-auto flex items-start justify-center bg-slate-50 relative">
           <div className="org-tree inline-block p-12 bg-white rounded-3xl shadow-xl border border-slate-200 min-w-min mt-4 mb-12">
             <ul className="m-0 p-0">
               <TreeNode node={TREE} acquired={acquired} onAcquire={handleAcquire} parentAcquired={true} />
             </ul>
           </div>
        </div>
        
        <div className="w-96 bg-white border-l border-slate-200 p-6 overflow-y-auto z-10 shadow-[-10px_0_20px_rgba(0,0,0,0.03)] flex-shrink-0">
          <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" /> Archetypes
          </h2>
          <div className="flex flex-col gap-4">
            {ARCHETYPES.map(arch => (
              <ArchetypeCard key={arch.id} archetype={arch} acquired={acquired} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
