import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';

const SKILLS = [
  { id: 'sim', name: 'Real-time Simulation', description: 'High-fidelity, responsive 3D environments.' },
  { id: 'nar', name: 'Narrative Design', description: 'Branching dialogue and emotional pacing.' },
  { id: 'gam', name: 'Gamification & Reward Systems', description: 'Intrinsic and extrinsic motivation loops.' },
  { id: 'pro', name: 'Procedural Generation', description: 'Algorithmic creation of vast datasets and layouts.' },
  { id: 'beh', name: 'Player Behavior Analysis', description: 'Telemetry and user action tracking.' },
];

const SKILLS_MAP = SKILLS.reduce((acc, skill) => {
  acc[skill.id] = skill;
  return acc;
}, {} as Record<string, typeof SKILLS[0]>);

const BRIEFS = [
  { id: 'nhs', name: 'NHS Surgical Training VR', requiredSkill: 'sim', matched: false, description: 'Needs a highly accurate virtual operating theater to train residents without risk.' },
  { id: 'mus', name: 'Natural History Museum', requiredSkill: 'nar', matched: false, description: 'Requires an engaging audio-visual journey through the Cretaceous period.' },
  { id: 'sch', name: 'High School Curriculum App', requiredSkill: 'gam', matched: false, description: 'Needs to keep students engaged with difficult STEM subjects over a whole semester.' },
  { id: 'urb', name: 'Urban Planning Visualization', requiredSkill: 'pro', matched: false, description: 'Requires generation of varied city layouts for traffic flow testing.' },
  { id: 'con', name: 'Consumer Behavior Research', requiredSkill: 'beh', matched: false, description: 'Needs to track how users navigate a virtual supermarket environment.' },
];

const MAX_GVA = 1300000000;

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => {
        setDisplayValue(v);
      }
    });
    return controls.stop;
  }, [value]);

  return (
    <span>
      {new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
      }).format(displayValue)}
    </span>
  );
}

export default function App() {
  const [briefs, setBriefs] = useState(BRIEFS);
  const [skills, setSkills] = useState(SKILLS);
  const [gva, setGva] = useState(0);
  const [draggedSkill, setDraggedSkill] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);

  const handleMatch = (briefId: string, skillId: string, x: number, y: number) => {
    setBriefs(b => b.map(br => br.id === briefId ? { ...br, matched: true } : br));
    setSkills(s => s.filter(sk => sk.id !== skillId));
    setGva(g => g + 260000000);
    
    const id = Date.now();
    setFloatingTexts(ft => [...ft, { id, x, y, text: '+ £260,000,000 GVA' }]);
    setTimeout(() => {
      setFloatingTexts(ft => ft.filter(f => f.id !== id));
    }, 2000);
  };

  return (
    <div style={{ 
      fontFamily: 'Georgia, serif', 
      backgroundColor: '#f8f9fa', 
      color: '#1a1a1a', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <header style={{ 
        borderBottom: '4px double #1a1a1a', 
        padding: '2rem 4rem', 
        textAlign: 'center',
        backgroundColor: '#fff'
      }}>
        <div style={{ 
          fontFamily: 'system-ui, sans-serif', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em', 
          fontSize: '0.8rem', 
          color: '#666',
          marginBottom: '1rem' 
        }}>
          Department of Economic Spillover &bull; Working Paper 2026
        </div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'normal', 
          margin: 0,
          color: '#0f172a'
        }}>
          More Than Games: Cross-Sector Value Creation
        </h1>
        <p style={{ 
          fontFamily: 'system-ui, sans-serif', 
          maxWidth: '700px', 
          margin: '1.5rem auto 0', 
          color: '#475569', 
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          A strategic assessment tool mapping game development specializations to high-impact non-entertainment sectors. Drag policy assets (skills) to corresponding strategic targets (briefs) to unlock Gross Value Added (GVA).
        </p>
      </header>

      <main style={{ 
        display: 'flex', 
        flex: 1, 
        padding: '3rem 4rem', 
        gap: '4rem', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%' 
      }}>
        
        {/* Left Column: Skills */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Policy Assets</h3>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', color: '#666' }}>{skills.length} available</span>
          </div>
          
          <AnimatePresence>
            {skills.map(skill => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={skill.id}
                draggable
                onDragStart={(e: any) => {
                  e.dataTransfer.setData('text/plain', skill.id);
                  setDraggedSkill(skill.id);
                }}
                onDragEnd={() => setDraggedSkill(null)}
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #cbd5e1',
                  borderLeft: '4px solid #3b82f6',
                  backgroundColor: '#fff',
                  cursor: 'grab',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  opacity: draggedSkill === skill.id ? 0.4 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <h4 style={{ margin: 0, fontFamily: 'system-ui, sans-serif', fontSize: '1.1rem', color: '#0f172a' }}>{skill.name}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>{skill.description}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', padding: '0.2rem 0.5rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', fontFamily: 'system-ui, sans-serif' }}>Tech Asset</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {skills.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: '3rem 2rem', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}
            >
              All assets successfully deployed.
            </motion.div>
          )}
        </div>

        {/* Right Column: Briefs */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strategic Targets</h3>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', color: '#666' }}>{briefs.filter(b => b.matched).length} / {briefs.length} fulfilled</span>
          </div>

          {briefs.map(brief => (
            <motion.div
              layout
              key={brief.id}
              animate={wrongMatch === brief.id ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              onDragOver={(e: any) => {
                e.preventDefault();
                if (!brief.matched) {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onDragLeave={(e: any) => {
                e.currentTarget.style.borderColor = brief.matched ? '#10b981' : '#cbd5e1';
                e.currentTarget.style.backgroundColor = brief.matched ? '#f0fdf4' : '#fff';
              }}
              onDrop={(e: any) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = brief.matched ? '#10b981' : '#cbd5e1';
                e.currentTarget.style.backgroundColor = brief.matched ? '#f0fdf4' : '#fff';
                
                if (brief.matched) return;
                
                const skillId = e.dataTransfer.getData('text/plain');
                if (skillId === brief.requiredSkill) {
                  handleMatch(brief.id, skillId, e.clientX, e.clientY);
                } else {
                  setWrongMatch(brief.id);
                  setTimeout(() => setWrongMatch(null), 500);
                }
              }}
              style={{
                padding: '1.5rem',
                border: brief.matched ? '1px solid #10b981' : '1px dashed #cbd5e1',
                backgroundColor: brief.matched ? '#f0fdf4' : '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: brief.matched ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {brief.matched && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#10b981', fontWeight: 'bold', fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  ✓ SECURED
                </div>
              )}
              <h4 style={{ margin: '0 0 0.5rem', fontFamily: 'system-ui, sans-serif', fontSize: '1.1rem', color: brief.matched ? '#065f46' : '#0f172a' }}>{brief.name}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>{brief.description}</p>
              
              {brief.matched ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #a7f3d0', fontSize: '0.85rem', fontFamily: 'system-ui, sans-serif', color: '#047857', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Applied Asset: <strong>{SKILLS_MAP[brief.requiredSkill].name}</strong></span>
                  <span style={{ fontWeight: 'bold', color: '#059669' }}>+ £260M</span>
                </motion.div>
              ) : (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.8rem', fontFamily: 'system-ui, sans-serif', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Awaiting Skill Allocation...
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </main>

      {/* Sticky Footer for Total GVA */}
      <footer style={{ 
        borderTop: '4px double #1a1a1a', 
        padding: '1.5rem 4rem', 
        backgroundColor: '#fff', 
        position: 'sticky', 
        bottom: 0, 
        zIndex: 10, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>
            Cumulative Economic Impact
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#0f172a' }}>
            Target: £1.3 Billion
          </div>
        </div>
        <div style={{ 
          fontSize: '3.5rem', 
          fontFamily: 'Georgia, serif', 
          color: gva === MAX_GVA ? '#10b981' : '#0f172a',
          transition: 'color 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {gva === MAX_GVA && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ fontSize: '2rem', color: '#10b981' }}
            >
              🎉
            </motion.span>
          )}
          <AnimatedNumber value={gva} />
        </div>
      </footer>
      
      {/* Floating Particles */}
      <AnimatePresence>
        {floatingTexts.map(ft => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 1, x: ft.x, y: ft.y, scale: 0.5 }}
            animate={{ opacity: 0, y: ft.y - 200, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              color: '#10b981',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              fontFamily: 'system-ui, sans-serif',
              textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 0 10px rgba(16, 185, 129, 0.5)',
              zIndex: 50
            }}
          >
            {ft.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
