import React, { useState, useEffect } from 'react';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';

type Metric = 'Budget' | 'Scope' | 'Morale' | 'Timeline';

interface SprintRecord {
  sprintNum: number;
  budget: number;
  scope: number;
  morale: number;
  timeline: number;
  warning: Metric | null;
  actionTaken: string | null;
}

const WARNING_LABELS: Record<Metric, string> = {
  Budget: 'BUDGET OVERRUN',
  Scope: 'SCOPE CREEP',
  Morale: 'MORALE DROP',
  Timeline: 'TIMELINE DRIFT'
};

const App: React.FC = () => {
  const [sprintCounter, setSprintCounter] = useState(1);
  const [pushOnCount, setPushOnCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'collapsed' | 'killed' | 'won'>('playing');
  const [score, setScore] = useState(0);
  const [collapseAnim, setCollapseAnim] = useState(false);

  const [records, setRecords] = useState<SprintRecord[]>([
    {
      sprintNum: 1,
      budget: 100,
      scope: 100,
      morale: 100,
      timeline: 100,
      warning: 'Budget',
      actionTaken: null
    }
  ]);

  const currentRecord = records[records.length - 1];

  const getCellClass = (val: number) => {
    if (gameState === 'collapsed') return 'cell-dead';
    if (val > 75) return 'cell-green';
    if (val > 40) return 'cell-amber';
    return 'cell-red glitch';
  };

  const handleAction = (action: 'Cut Scope' | 'Pivot' | 'Push On' | 'Kill Switch') => {
    if (gameState !== 'playing') return;

    if (action === 'Kill Switch') {
      triggerKillSwitch();
      return;
    }

    let nextBudget = currentRecord.budget;
    let nextScope = currentRecord.scope;
    let nextMorale = currentRecord.morale;
    let nextTimeline = currentRecord.timeline;
    let newPushCount = pushOnCount;

    const warning = currentRecord.warning;

    if (action === 'Cut Scope') {
      nextScope -= 30;
      nextMorale -= 10;
      if (warning === 'Budget') nextBudget += 20;
      if (warning === 'Timeline') nextTimeline += 20;
      if (warning === 'Morale') nextMorale += 20;
    } else if (action === 'Pivot') {
      nextTimeline -= 30;
      nextBudget -= 15;
      if (warning === 'Scope') nextScope += 20;
      if (warning === 'Morale') nextMorale += 20;
      if (warning === 'Budget') nextBudget += 20;
    } else if (action === 'Push On') {
      newPushCount += 1;
      if (warning === 'Budget') nextBudget -= 40;
      if (warning === 'Scope') nextScope -= 40;
      if (warning === 'Morale') nextMorale -= 40;
      if (warning === 'Timeline') nextTimeline -= 40;
      
      nextMorale -= 15;
      nextTimeline -= 15;
    }

    nextBudget -= Math.floor(Math.random() * 8) + 2;
    nextScope -= Math.floor(Math.random() * 8) + 2;
    nextMorale -= Math.floor(Math.random() * 8) + 2;
    nextTimeline -= Math.floor(Math.random() * 8) + 2;

    nextBudget = Math.max(0, Math.min(100, nextBudget));
    nextScope = Math.max(0, Math.min(100, nextScope));
    nextMorale = Math.max(0, Math.min(100, nextMorale));
    nextTimeline = Math.max(0, Math.min(100, nextTimeline));

    const updatedCurrent = { ...currentRecord, actionTaken: action };
    const newRecords = [...records.slice(0, -1), updatedCurrent];

    setPushOnCount(newPushCount);

    const avgHealth = (nextBudget + nextScope + nextMorale + nextTimeline) / 4;

    if (newPushCount >= 3 || avgHealth <= 20 || nextBudget === 0 || nextTimeline === 0) {
      setCollapseAnim(true);
      setTimeout(() => {
        setGameState('collapsed');
        newRecords.push({
          sprintNum: sprintCounter + 1,
          budget: 0,
          scope: 0,
          morale: 0,
          timeline: 0,
          warning: null,
          actionTaken: 'SYSTEM FAILURE'
        });
        setRecords(newRecords);
      }, 1000);
      
      // Update UI momentarily before collapse modal
      setRecords(newRecords);
      return;
    }

    if (sprintCounter >= 10) {
      setGameState('won');
      setScore(1000 + avgHealth * 20);
      return;
    }

    const availableWarnings = Object.keys(WARNING_LABELS) as Metric[];
    const nextWarning = availableWarnings[Math.floor(Math.random() * availableWarnings.length)];
    
    newRecords.push({
      sprintNum: sprintCounter + 1,
      budget: nextBudget,
      scope: nextScope,
      morale: nextMorale,
      timeline: nextTimeline,
      warning: nextWarning,
      actionTaken: null
    });

    setRecords(newRecords);
    setSprintCounter(prev => prev + 1);
  };

  const triggerKillSwitch = () => {
    setGameState('killed');
    const avgHealth = (currentRecord.budget + currentRecord.scope + currentRecord.morale + currentRecord.timeline) / 4;
    
    let calculatedScore = 0;
    if (avgHealth > 75) {
      calculatedScore = 200; // Premature
    } else if (avgHealth > 40) {
      calculatedScore = 800; // Good timing
    } else {
      calculatedScore = 2000; // Perfect, clutched it
    }
    
    calculatedScore -= pushOnCount * 300;
    calculatedScore += sprintCounter * 150;
    
    setScore(Math.max(0, Math.floor(calculatedScore)));
  };

  const currentHealth = (currentRecord.budget + currentRecord.scope + currentRecord.morale + currentRecord.timeline) / 4;
  const meterColor = currentHealth > 75 ? '#0f0' : currentHealth > 40 ? '#fa0' : '#f00';
  
  const bgDangerOpacity = pushOnCount * 0.15 + (currentHealth < 30 ? 0.2 : 0);

  return (
    <div className={`app-container crt ${collapseAnim ? 'severe-glitch' : ''}`} style={{ backgroundColor: `rgba(255, 0, 0, ${bgDangerOpacity})` }}>
      <div className="stamp">CONFIDENTIAL</div>
      
      <div className="header-panel">
        <div className="project-title">Project: TITAN (DOOMED)</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          <span style={{ color: '#fa0', marginRight: '2rem' }}>SUNK COST: ${(sprintCounter * 125) + (pushOnCount * 400)}k</span>
          <span style={{ color: '#0f0' }}>SCORE: {score}</span>
        </div>
      </div>

      <div className="meter-wrapper">
        <div className="meter-container">
          <div 
            className={`meter-fill ${collapseAnim ? 'meter-collapse' : ''}`} 
            style={{ width: `${gameState === 'collapsed' ? 0 : currentHealth}%`, backgroundColor: meterColor, color: meterColor }}
          ></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.9rem', color: '#888' }}>
          <span>CRITICAL FAILURE</span>
          <span>PROJECT HEALTH ESTIMATE</span>
          <span>NOMINAL</span>
        </div>
      </div>

      <table className="battered-spreadsheet">
        <thead>
          <tr>
            <th style={{ width: '8%' }}>Sprint</th>
            <th style={{ width: '12%' }}>Budget</th>
            <th style={{ width: '12%' }}>Scope</th>
            <th style={{ width: '12%' }}>Morale</th>
            <th style={{ width: '12%' }}>Timeline</th>
            <th style={{ width: '20%' }}>Warning Signal</th>
            <th style={{ width: '24%' }}>Action Taken</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {records.map((rec) => (
              <motion.tr 
                key={rec.sprintNum}
                initial={{ opacity: 0, backgroundColor: 'rgba(255,255,255,0.1)' }}
                animate={{ opacity: 1, backgroundColor: 'rgba(0,0,0,0)' }}
                className={gameState === 'collapsed' || collapseAnim ? 'glitch' : ''}
              >
                <td style={{ fontWeight: 'bold', color: '#fff' }}>{rec.sprintNum}</td>
                <td className={getCellClass(rec.budget)}>{Math.round(rec.budget)}%</td>
                <td className={getCellClass(rec.scope)}>{Math.round(rec.scope)}%</td>
                <td className={getCellClass(rec.morale)}>{Math.round(rec.morale)}%</td>
                <td className={getCellClass(rec.timeline)}>{Math.round(rec.timeline)}%</td>
                <td className={rec.warning ? 'cell-red glitch' : ''} style={{ fontWeight: 'bold' }}>
                  {rec.warning ? `⚠️ ${WARNING_LABELS[rec.warning]}` : '---'}
                </td>
                <td>
                  {rec.actionTaken ? (
                    <span style={{ color: rec.actionTaken === 'SYSTEM FAILURE' ? '#f00' : '#888', fontWeight: 'bold' }}>
                      {rec.actionTaken}
                    </span>
                  ) : (
                    gameState === 'playing' && !collapseAnim && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="action-btn" onClick={() => handleAction('Cut Scope')}>Cut Scope</button>
                        <button className="action-btn" onClick={() => handleAction('Pivot')}>Pivot</button>
                        <button className="action-btn" onClick={() => handleAction('Push On')}>Push On</button>
                        <button className="action-btn kill-switch" onClick={() => handleAction('Kill Switch')}>KILL SWITCH</button>
                      </div>
                    )
                  )}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>

      {gameState === 'collapsed' && (
        <div className="game-over-modal">
          <h1>PROJECT COLLAPSED</h1>
          <p>You fell victim to the <strong>Sunk Cost Fallacy</strong>.</p>
          <p>By pushing on when the warnings were clear, you destroyed the project and drained the studio's resources.</p>
          <h2 style={{ color: '#f00' }}>FINAL SCORE: 0</h2>
          <button className="action-btn" style={{ fontSize: '1.2rem', padding: '10px 20px' }} onClick={() => window.location.reload()}>RESTART SIMULATION</button>
        </div>
      )}

      {gameState === 'killed' && (
        <div className="game-over-modal" style={{ borderColor: '#0f0', boxShadow: '0 0 50px rgba(0,255,0,0.5)' }}>
          <h1 style={{ color: '#0f0', textShadow: '0 0 15px #0f0' }}>PROJECT TERMINATED</h1>
          <p>You successfully triggered the Kill Switch.</p>
          <p>By stopping before catastrophic failure, you conserved remaining resources and avoided the Sunk Cost Fallacy.</p>
          <h2 style={{ color: '#0f0' }}>FINAL SCORE: {score}</h2>
          <button className="action-btn" style={{ fontSize: '1.2rem', padding: '10px 20px', borderColor: '#0f0' }} onClick={() => window.location.reload()}>RESTART SIMULATION</button>
        </div>
      )}
      
      {gameState === 'won' && (
        <div className="game-over-modal" style={{ borderColor: '#fa0', boxShadow: '0 0 50px rgba(255,170,0,0.5)' }}>
          <h1 style={{ color: '#fa0', textShadow: '0 0 15px #fa0' }}>MIRACLE DELIVERED</h1>
          <p>Against all odds, the project limped to the finish line.</p>
          <p>It was a grueling march, but you survived.</p>
          <h2 style={{ color: '#fa0' }}>FINAL SCORE: {score}</h2>
          <button className="action-btn" style={{ fontSize: '1.2rem', padding: '10px 20px', borderColor: '#fa0' }} onClick={() => window.location.reload()}>RESTART SIMULATION</button>
        </div>
      )}
    </div>
  );
};

export default App;
