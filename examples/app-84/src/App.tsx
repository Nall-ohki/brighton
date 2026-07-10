import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Settings, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle, 
  Play,
  FileText,
  DollarSign,
  X
} from 'lucide-react';
import './App.css';

type Clause = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

type Project = {
  id: string;
  client: string;
  name: string;
  baseDays: number;
  daysCompleted: number;
  contractRate: number;
  status: 'offer' | 'inbox' | 'in_progress' | 'completed';
  clauses: Clause[];
};

type LedgerEntry = {
  id: string;
  week: number;
  desc: string;
  income: number;
  tax: number;
};

const CLIENTS = ["MegaCorp Games", "Indie Studio X", "Polytronics", "Pixel Wizards", "NextGen VR", "Mobile Cash Cow"];
const PROJECTS = ["UI Design", "3D Modeling", "Level Blockout", "Concept Art", "Gameplay Scripting", "Audio SFX"];

export default function App() {
  const [dayRate, setDayRate] = useState<number>(300);
  const [bank, setBank] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [burnout, setBurnout] = useState<number>(0);
  const [week, setWeek] = useState<number>(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [activeOffer, setActiveOffer] = useState<Project | null>(null);
  const [showBurnoutModal, setShowBurnoutModal] = useState<boolean>(false);

  // Generate initial offers
  useEffect(() => {
    if (projects.length === 0) {
      setProjects([generateOffer(), generateOffer()]);
    }
  }, []);

  const generateOffer = (): Project => {
    return {
      id: Math.random().toString(36).substring(2, 9),
      client: CLIENTS[Math.floor(Math.random() * CLIENTS.length)],
      name: PROJECTS[Math.floor(Math.random() * PROJECTS.length)],
      baseDays: Math.floor(Math.random() * 10) + 5,
      daysCompleted: 0,
      contractRate: dayRate, // Will be locked when accepted
      status: 'offer',
      clauses: [
        { id: 'kill', name: 'Kill Fee (50%)', description: 'Protects against cancellation. Lowers contract value by 10%.', active: false },
        { id: 'ip', name: 'Retain IP Rights', description: 'Keep ownership of your work. Lowers contract value by 20%.', active: false },
        { id: 'revs', name: 'Limit Revisions', description: 'Cap at 2 revisions. Prevents +5 extra burnout per week.', active: false },
      ]
    };
  };

  const getContractValue = (p: Project) => {
    let multiplier = 1;
    if (p.clauses.find(c => c.id === 'kill')?.active) multiplier -= 0.1;
    if (p.clauses.find(c => c.id === 'ip')?.active) multiplier -= 0.2;
    return Math.max(0, p.baseDays * p.contractRate * multiplier);
  };

  const handleNegotiate = (offer: Project) => {
    setActiveOffer({ ...offer, contractRate: dayRate });
  };

  const toggleClause = (clauseId: string) => {
    if (!activeOffer) return;
    const newClauses = activeOffer.clauses.map(c => 
      c.id === clauseId ? { ...c, active: !c.active } : c
    );
    setActiveOffer({ ...activeOffer, clauses: newClauses });
  };

  const acceptOffer = () => {
    if (!activeOffer) return;
    setProjects(prev => prev.map(p => p.id === activeOffer.id ? { ...activeOffer, status: 'inbox' } : p));
    setActiveOffer(null);
  };

  const rejectOffer = () => {
    if (!activeOffer) return;
    setProjects(prev => prev.filter(p => p.id !== activeOffer.id));
    setActiveOffer(null);
  };

  const moveProject = (id: string, newStatus: Project['status']) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const advanceWeek = () => {
    let currentBurnout = burnout;
    if (currentBurnout >= 100) {
      // Already burnt out from last time, should have been handled, but just in case
      currentBurnout = 0;
    }

    const inProgress = projects.filter(p => p.status === 'in_progress');
    
    // Burnout calc
    if (inProgress.length === 2) currentBurnout += 10;
    else if (inProgress.length === 3) currentBurnout += 25;
    else if (inProgress.length >= 4) currentBurnout += 50;
    else if (inProgress.length === 0) currentBurnout = Math.max(0, currentBurnout - 15); // rest
    
    inProgress.forEach(p => {
      const limitRevs = p.clauses.find(c => c.id === 'revs')?.active;
      if (!limitRevs) currentBurnout += 5;
    });

    if (currentBurnout >= 100) {
      setBurnout(100);
      setShowBurnoutModal(true);
      // Miss a week
      setWeek(w => w + 1);
      return;
    }

    setBurnout(currentBurnout);

    // Work on projects
    let availableDays = 5;
    let newProjects = [...projects];
    let newBank = bank;
    let newTax = tax;
    let newLedger = [...ledger];

    if (inProgress.length > 0) {
      const daysPerProject = availableDays / inProgress.length;
      inProgress.forEach(p => {
        const pIndex = newProjects.findIndex(np => np.id === p.id);
        const workDone = Math.min(daysPerProject, p.baseDays - p.daysCompleted);
        newProjects[pIndex].daysCompleted += workDone;

        if (newProjects[pIndex].daysCompleted >= p.baseDays) {
          // Completed!
          newProjects[pIndex].status = 'completed';
          const value = getContractValue(newProjects[pIndex]);
          const taxL = value * 0.25;
          newBank += value;
          newTax += taxL;
          newLedger.unshift({
            id: Math.random().toString(36),
            week: week,
            desc: `Invoice paid: ${p.client} - ${p.name}`,
            income: value,
            tax: taxL
          });
        }
      });
    }

    // Add new offers randomly (max 3 offers sitting)
    const currentOffers = newProjects.filter(p => p.status === 'offer');
    if (currentOffers.length < 3 && Math.random() > 0.3) {
      newProjects.push(generateOffer());
    }

    setProjects(newProjects);
    setBank(newBank);
    setTax(newTax);
    setLedger(newLedger);
    setWeek(w => w + 1);
  };

  const handleBurnoutRecovery = () => {
    setBurnout(0);
    setShowBurnoutModal(false);
  };

  const offers = projects.filter(p => p.status === 'offer');
  const inbox = projects.filter(p => p.status === 'inbox');
  const inProgress = projects.filter(p => p.status === 'in_progress');
  const completed = projects.filter(p => p.status === 'completed');

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="brand">
          <Briefcase size={24} />
          <span>SoloStudio</span>
        </div>
        
        <div className="slider-container">
          <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>
            Day Rate: £{dayRate}
          </label>
          <input 
            type="range" 
            min="150" max="1000" step="50"
            value={dayRate}
            onChange={(e) => setDayRate(Number(e.target.value))}
          />
        </div>

        <div className="section-card" style={{ flex: 1, marginTop: 24, marginBottom: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Ledger</h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {ledger.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No transactions yet.</p>
            ) : (
              ledger.map(l => (
                <div key={l.id} className="ledger-item">
                  <div>
                    <div className="ledger-desc">{l.desc}</div>
                    <div className="ledger-date">Week {l.week}</div>
                  </div>
                  <div className="ledger-amounts">
                    <div className="ledger-income">+£{l.income.toFixed(0)}</div>
                    <div className="ledger-tax">Tax: £{l.tax.toFixed(0)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div className="week-display">Week {week}</div>
          <button className="btn-primary" onClick={advanceWeek}>
            <Play size={18} />
            Advance Week
          </button>
        </div>

        <div className="dashboard-content">
          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-header">
                <DollarSign size={16} />
                Bank Balance
              </div>
              <div className="metric-value money-positive">£{bank.toFixed(0)}</div>
              <div className="metric-sub">Available cash</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <AlertTriangle size={16} />
                HMRC Tax Liability
              </div>
              <div className="metric-value money-tax">£{tax.toFixed(0)}</div>
              <div className="metric-sub">Self-assessment estimate</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <TrendingUp size={16} />
                Active Projects
              </div>
              <div className="metric-value">{inProgress.length}</div>
              <div className="metric-sub">Currently working on</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <Settings size={16} />
                Burnout Level
              </div>
              <div className="metric-value">{Math.floor(burnout)}%</div>
              <div className="progress-bar-bg">
                <div 
                  className={`progress-bar-fill ${burnout > 70 ? 'burnout-fill high' : burnout > 40 ? 'burnout-fill' : ''}`}
                  style={{ width: `${Math.min(100, burnout)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="main-grid">
            {/* Offers Column */}
            <div className="section-card">
              <div className="section-header">
                Contract Offers
                <span style={{ background: '#E5E7EB', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{offers.length}</span>
              </div>
              <div className="section-body">
                {offers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No new offers this week.</p>
                ) : (
                  offers.map(o => (
                    <div key={o.id} className="list-item" onClick={() => handleNegotiate(o)}>
                      <div className="offer-title">{o.name}</div>
                      <div className="offer-client">{o.client} • {o.baseDays} days</div>
                      <div className="offer-price">Est. £{(o.baseDays * dayRate).toFixed(0)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Kanban Board */}
            <div className="section-card">
              <div className="section-header">Project Queue</div>
              <div className="section-body" style={{ padding: 16 }}>
                <div className="kanban-board">
                  {/* Inbox */}
                  <div className="kanban-column">
                    <div className="kanban-col-header">Inbox ({inbox.length})</div>
                    <div className="kanban-col-body">
                      {inbox.map(p => (
                        <div key={p.id} className="kanban-card">
                          <div className="kanban-card-title">{p.name}</div>
                          <div className="kanban-card-client">{p.client}</div>
                          <div className="kanban-tags">
                            {p.clauses.filter(c=>c.active).map(c => (
                              <span key={c.id} className="kanban-tag">{c.name}</span>
                            ))}
                          </div>
                          <div className="kanban-actions">
                            <button className="btn-primary" onClick={() => moveProject(p.id, 'in_progress')}>Start</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In Progress */}
                  <div className="kanban-column">
                    <div className="kanban-col-header" style={{ color: 'var(--primary-color)' }}>In Progress ({inProgress.length})</div>
                    <div className="kanban-col-body">
                      {inProgress.map(p => (
                        <div key={p.id} className="kanban-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                          <div className="kanban-card-title">{p.name}</div>
                          <div className="kanban-card-client">{p.client}</div>
                          <div className="kanban-progress">
                            <span>Progress</span>
                            <span>{Math.floor((p.daysCompleted / p.baseDays) * 100)}%</span>
                          </div>
                          <div className="progress-bar-bg" style={{ marginTop: 0, marginBottom: 12 }}>
                            <div className="progress-bar-fill" style={{ width: `${(p.daysCompleted / p.baseDays) * 100}%` }}></div>
                          </div>
                          <div className="kanban-actions">
                            <button className="btn-secondary" onClick={() => moveProject(p.id, 'inbox')}>Pause</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="kanban-column">
                    <div className="kanban-col-header" style={{ color: 'var(--text-muted)' }}>Completed ({completed.length})</div>
                    <div className="kanban-col-body">
                      {completed.map(p => (
                        <div key={p.id} className="kanban-card" style={{ opacity: 0.7 }}>
                          <div className="kanban-card-title">{p.name}</div>
                          <div className="kanban-card-client">{p.client}</div>
                          <div className="kanban-progress">
                            <span>Paid</span>
                            <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>£{getContractValue(p).toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation Modal */}
      {activeOffer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>Negotiate Contract</span>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setActiveOffer(null)} />
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, marginBottom: 4 }}>{activeOffer.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{activeOffer.client} • {activeOffer.baseDays} days estimated</p>
                <div style={{ marginTop: 12, fontSize: 24, fontWeight: 700, color: 'var(--primary-color)' }}>
                  £{getContractValue(activeOffer).toFixed(0)}
                </div>
              </div>
              
              <h4 style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contract Clauses</h4>
              
              {activeOffer.clauses.map(clause => (
                <div 
                  key={clause.id} 
                  className={`clause-item ${clause.active ? 'active' : ''}`}
                  onClick={() => toggleClause(clause.id)}
                >
                  <div style={{ color: clause.active ? 'var(--accent-color)' : 'var(--border-color)', marginTop: 2 }}>
                    <CheckCircle size={20} />
                  </div>
                  <div className="clause-info">
                    <h4>{clause.name}</h4>
                    <p>{clause.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={rejectOffer}>Reject</button>
              <button className="btn-primary" onClick={acceptOffer}>Sign Contract</button>
            </div>
          </div>
        </div>
      )}

      {/* Burnout Modal */}
      {showBurnoutModal && (
        <div className="modal-overlay">
          <div className="modal-content game-over-modal">
            <AlertTriangle size={48} color="var(--danger-color)" style={{ margin: '0 auto 16px' }} />
            <h2>You burned out!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Taking on too much work has caused severe burnout. You were forced to take a week off to recover. No work was completed this week.
            </p>
            <button className="btn-primary" style={{ margin: '0 auto' }} onClick={handleBurnoutRecovery}>
              Return to Work
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
