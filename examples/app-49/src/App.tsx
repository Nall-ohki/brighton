import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

type Staff = {
  id: string;
  x: number; // percentage
  y: number; // percentage
};

export default function App() {
  const [budget, setBudget] = useState(150);
  const [capacity, setCapacity] = useState(30);
  const [debt, setDebt] = useState(10);
  const [staff, setStaff] = useState<Staff[]>([]);
  
  const budgetRef = useRef(budget);
  const capacityRef = useRef(capacity);
  const debtRef = useRef(debt);
  const staffRef = useRef(staff);

  useEffect(() => { budgetRef.current = budget; }, [budget]);
  useEffect(() => { capacityRef.current = capacity; }, [capacity]);
  useEffect(() => { debtRef.current = debt; }, [debt]);
  useEffect(() => { staffRef.current = staff; }, [staff]);

  useEffect(() => {
    const initial = Array.from({ length: 8 }).map(() => ({
      id: Math.random().toString(),
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
    }));
    setStaff(initial);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      const currentStaff = staffRef.current;
      
      setBudget(b => b + currentStaff.length * 3);

      if (debtRef.current > capacityRef.current) {
        if (currentStaff.length > 0) {
          const victim = currentStaff[Math.floor(Math.random() * currentStaff.length)];
          setStaff(prev => prev.filter(s => s.id !== victim.id));
          setDebt(d => Math.max(0, d - (Math.random() * 4 + 2)));
        }
      }
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const hireCost = 30;
  
  const handleHire = () => {
    if (budget >= hireCost) {
      setBudget(b => b - hireCost);
      setDebt(d => d + Math.random() * 3 + 2);
      setStaff(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          x: Math.random() * 90 + 5,
          y: Math.random() * 90 + 5,
        }
      ]);
    }
  };

  const cards = [
    { id: 'c1', name: "Agile Coach", desc: "-15 Leadership Debt", cost: 80, effect: () => setDebt(d => Math.max(0, d - 15)) },
    { id: 'c2', name: "Middle Management", desc: "+25 Leadership Cap", cost: 200, effect: () => setCapacity(c => c + 25) },
    { id: 'c3', name: "Offsite Retreat", desc: "-40 Leadership Debt", cost: 350, effect: () => setDebt(d => Math.max(0, d - 40)) },
  ];

  const handleCard = (card: any) => {
    if (budget >= card.cost) {
      setBudget(b => b - card.cost);
      card.effect();
    }
  };

  const debtRatio = debt / capacity;
  const isWarning = debtRatio > 0.75 && debtRatio <= 1;
  const isDanger = debtRatio > 1;

  const barStatusClass = isDanger ? 'danger' : isWarning ? 'warning' : 'normal';
  const displayDebtPercent = Math.min(100, (debt / capacity) * 100).toFixed(1);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Studio OS v9.2</h1>
        <div className="stats-container">
          <div className="stat">
            <span className="stat-label">HEADCOUNT</span>
            <span className="stat-value">{staff.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">FUNDS</span>
            <span className="stat-value" style={{ color: '#10b981' }}>${Math.floor(budget)}k</span>
          </div>
        </div>
      </header>

      <main className="main-view">
        <div className="view-title">WORKSPACE_VIEWER</div>
        {isDanger && <div className="danger-overlay" />}
        <div className="floor">
          <AnimatePresence>
            {staff.map((s) => (
              <motion.div
                key={s.id}
                className={`staff-dot ${isDanger ? 'danger' : ''}`}
                style={{ 
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  position: 'absolute'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: [0, Math.random() * 20 - 10, 0],
                  y: [0, Math.random() * 20 - 10, 0]
                }}
                transition={{ 
                  duration: Math.random() * 2 + 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                exit={{ 
                  y: 500, 
                  x: Math.random() * 200 - 100,
                  opacity: 0, 
                  rotate: Math.random() * 360,
                  transition: { duration: 1.5, ease: "easeIn" }
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      <aside className="side-panel">
        <div className="panel-section">
          <div className="view-title" style={{ padding: 0, border: 'none' }}>SYSTEM_LOAD</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Leadership Capacity Buffer: <span style={{ color: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8' }}>{isDanger ? 'CRITICAL' : isWarning ? 'WARNING' : 'NOMINAL'}</span>
          </div>
          <div className={`health-bar-container ${barStatusClass}`}>
            <div 
              className="health-bar-fill" 
              style={{ width: `${Math.min(100, (debt / capacity) * 100)}%` }}
            />
          </div>
          <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '4px' }}>
            LOAD: {displayDebtPercent}%
          </div>
        </div>

        <div className="panel-section">
          <div className="view-title" style={{ padding: 0, border: 'none' }}>TALENT_ACQUISITION</div>
          <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 8px 0' }}>
            Expand studio capacity. Caution: Increases hidden systemic load.
          </p>
          <button onClick={handleHire} disabled={budget < hireCost}>
            <span>Hire Staff</span>
            <span>${hireCost}k</span>
          </button>
        </div>

        <div className="panel-section" style={{ flex: 1 }}>
          <div className="view-title" style={{ padding: 0, border: 'none' }}>ORG_INVESTMENTS</div>
          <p style={{ fontSize: '12px', opacity: 0.7, margin: '0 0 8px 0' }}>
            Spend funds to reinforce infrastructure and reduce systemic load.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            {cards.map(card => (
              <div className="card" key={card.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="card-title">{card.name}</span>
                  <span style={{ color: '#10b981', fontSize: '14px' }}>${card.cost}k</span>
                </div>
                <span className="card-desc">{card.desc}</span>
                <button 
                  onClick={() => handleCard(card)} 
                  disabled={budget < card.cost}
                  style={{ marginTop: '8px', padding: '6px' }}
                >
                  Authorize
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
