import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  MonitorSmartphone, 
  BookOpen, 
  PhoneCall, 
  AlertTriangle, 
  Handshake, 
  Wrench,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';
import './App.css';

type IssueType = 'DOCS' | 'MILESTONE' | 'SCOPE' | 'TECH_DEBT' | 'API';
type ActionType = 'SHARE_WIKI' | 'ESCALATE' | 'SCHEDULE_CALL' | 'COMPROMISE' | 'DEBUG';

interface Issue {
  id: string;
  type: IssueType;
  title: string;
  description: string;
  source: 'INTERNAL' | 'EXTERNAL';
}

interface Action {
  type: ActionType;
  title: string;
  icon: React.FC<any>;
}

const ALL_ISSUES: Issue[] = [
  { id: '1', type: 'DOCS', title: 'Insufficient Documentation', description: 'External team cannot integrate the new API because the internal docs are outdated.', source: 'EXTERNAL' },
  { id: '2', type: 'MILESTONE', title: 'Missed Milestone', description: 'The character models were not delivered on Friday as agreed by the external studio.', source: 'INTERNAL' },
  { id: '3', type: 'SCOPE', title: 'Unclear Scope', description: 'External team built a multiplayer lobby that wasn\'t fully detailed in the original design doc.', source: 'EXTERNAL' },
  { id: '4', type: 'TECH_DEBT', title: 'Legacy Tech Debt', description: 'Our custom physics engine is slowing down the external team\'s progress.', source: 'EXTERNAL' },
  { id: '5', type: 'API', title: 'API Breaking Change', description: 'Internal core server team updated the authentication flow without warning.', source: 'INTERNAL' },
  { id: '6', type: 'DOCS', title: 'Missing Brand Guidelines', description: 'External UI designers used the wrong color palette due to lack of an updated style guide.', source: 'EXTERNAL' },
  { id: '7', type: 'MILESTONE', title: 'Delayed QA Sign-off', description: 'Internal QA team took 2 weeks to test the external build, pushing back the next phase.', source: 'INTERNAL' },
  { id: '8', type: 'SCOPE', title: 'Feature Creep', description: 'Internal product owner requested "just one more small feature" from the external devs.', source: 'INTERNAL' },
];

const ACTIONS: Action[] = [
  { type: 'SHARE_WIKI', title: 'Share Confluence/Wiki', icon: BookOpen },
  { type: 'ESCALATE', title: 'Escalate to Studio Lead', icon: AlertTriangle },
  { type: 'SCHEDULE_CALL', title: 'Schedule Sync Call', icon: PhoneCall },
  { type: 'COMPROMISE', title: 'Negotiate Timeline', icon: Handshake },
  { type: 'DEBUG', title: 'Co-Debugging Session', icon: Wrench },
];

const MATCHES: Record<IssueType, ActionType> = {
  'DOCS': 'SHARE_WIKI',
  'MILESTONE': 'ESCALATE',
  'SCOPE': 'SCHEDULE_CALL',
  'TECH_DEBT': 'COMPROMISE',
  'API': 'DEBUG',
};

const MAX_MISTAKES = 4;

interface LogEntry {
  id: number;
  issueTitle: string;
  actionTaken: string;
  success: boolean;
  time: string;
  source: 'INTERNAL' | 'EXTERNAL';
}

function App() {
  const [queue, setQueue] = useState<Issue[]>([]);
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState<'success' | 'error' | null>(null);

  const initGame = useCallback(() => {
    const shuffled = [...ALL_ISSUES].sort(() => Math.random() - 0.5);
    setQueue(shuffled.slice(1));
    setCurrentIssue(shuffled[0]);
    setScore(0);
    setMistakes(0);
    setLogs([]);
    setGameOver(false);
    setFlash(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (mistakes >= MAX_MISTAKES) {
      setGameOver(true);
    }
  }, [mistakes]);

  const handleAction = (action: Action) => {
    if (!currentIssue || gameOver) return;

    const isCorrect = MATCHES[currentIssue.type] === action.type;
    
    setFlash(isCorrect ? 'success' : 'error');
    setTimeout(() => setFlash(null), 500);

    const newLog: LogEntry = {
      id: Date.now(),
      issueTitle: currentIssue.title,
      actionTaken: action.title,
      success: isCorrect,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: currentIssue.source
    };

    setLogs(prev => [newLog, ...prev]);

    if (isCorrect) {
      setScore(s => s + 100);
    } else {
      setMistakes(m => m + 1);
    }

    if (queue.length > 0) {
      const nextIssue = queue[0];
      setCurrentIssue(nextIssue);
      setQueue(queue.slice(1));
    } else {
      const shuffled = [...ALL_ISSUES].sort(() => Math.random() - 0.5);
      setCurrentIssue(shuffled[0]);
      setQueue(shuffled.slice(1));
    }
  };

  const staticOpacity = Math.min((mistakes / MAX_MISTAKES) * 0.8, 0.8);
  const staticClass = mistakes > 0 ? 'static-active' : '';

  return (
    <div className="app-container">
      <div 
        className={`static-overlay ${staticClass}`} 
        style={{ '--static-opacity': staticOpacity } as React.CSSProperties}
      />
      
      {flash === 'success' && <div className="feedback-flash flash-success" />}
      {flash === 'error' && <div className="feedback-flash flash-error" />}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-title">Communication Breakdown</div>
          <div className="game-over-stats">
            <p>Issues Resolved: {score / 100}</p>
            <p>Total Score: {score}</p>
          </div>
          <button className="btn-primary" onClick={initGame}>
            <RefreshCcw size={20} /> Restart Partnership
          </button>
        </div>
      )}

      <header>
        <div className="header-title">
          <Activity size={24} color="var(--primary)" />
          PartnerSync B2B
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Resolved Issues</span>
            <span className="stat-value">{score / 100}</span>
          </div>
          <div className="stat-item" style={{ color: mistakes > 0 ? 'var(--danger)' : 'inherit' }}>
            <span className="stat-label">Communication Errors</span>
            <span className="stat-value" style={{ background: mistakes > 0 ? '#fee2e2' : '#f1f5f9' }}>
              {mistakes} / {MAX_MISTAKES}
            </span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Internal Studio Panel */}
        <section className="studio-panel">
          <div className="studio-header">
            <Building2 size={20} />
            Internal Dev Studio
          </div>
          <div className="studio-body">
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Resolution Log
            </div>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                Awaiting first action...
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="log-entry">
                  <div className="log-header">
                    <span>{log.issueTitle}</span>
                    <span className="log-status">
                      {log.success ? (
                        <><CheckCircle2 size={16} className="status-success" /> Resolved</>
                      ) : (
                        <><XCircle size={16} className="status-error" /> Failed</>
                      )}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>Action: {log.actionTaken}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{log.time}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Central Communication Queue */}
        <section className="communication-channel">
          <div className="channel-header">
            Secure Message Queue
          </div>
          <div className="message-queue">
            {currentIssue && (
              <div key={currentIssue.id} className="active-issue-card">
                <div className="issue-type-badge">
                  {currentIssue.type.replace('_', ' ')}
                </div>
                <h3 className="issue-title">{currentIssue.title}</h3>
                <p className="issue-desc">{currentIssue.description}</p>
                <div style={{ 
                  marginTop: '1.5rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--text-secondary)', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <AlertTriangle size={14} />
                  Origin: {currentIssue.source === 'INTERNAL' ? 'Internal Team' : 'External Partner'}
                </div>
              </div>
            )}
          </div>
          <div className="actions-panel">
            {ACTIONS.map(action => (
              <button 
                key={action.type} 
                className="action-btn"
                onClick={() => handleAction(action)}
                disabled={gameOver}
              >
                <action.icon size={18} />
                {action.title}
              </button>
            ))}
          </div>
        </section>

        {/* External Studio Panel */}
        <section className="studio-panel">
          <div className="studio-header">
            <MonitorSmartphone size={20} />
            External Dev Partner
          </div>
          <div className="studio-body">
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Upcoming Blockers
            </div>
            {queue.slice(0, 4).map((issue, i) => (
              <div key={`${issue.id}-${i}`} className="upcoming-issue">
                <div className="issue-title">{issue.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Origin: {issue.source}
                </div>
              </div>
            ))}
            {queue.length > 4 && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                + {queue.length - 4} more pending...
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
