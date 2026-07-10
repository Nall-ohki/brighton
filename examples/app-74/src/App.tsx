import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldCheck, User, CheckCircle, XCircle } from 'lucide-react';

type Question = {
  id: string;
  text: string;
  isLawful: boolean;
  violationType?: string;
};

const allQuestions: Question[] = [
  { id: 'q1', text: 'Can you provide an example of when you had to adapt to a major change at work?', isLawful: true },
  { id: 'q2', text: 'How many days were you absent due to illness in your last job?', isLawful: false, violationType: 'Health/Disability Discrimination' },
  { id: 'q3', text: 'Are you planning on starting a family in the next couple of years?', isLawful: false, violationType: 'Pregnancy & Maternity Discrimination' },
  { id: 'q4', text: 'What are your long-term career goals within the operations field?', isLawful: true },
  { id: 'q5', text: 'What year did you graduate from university?', isLawful: false, violationType: 'Age Discrimination' },
  { id: 'q6', text: 'How do you prioritize tasks when you have multiple tight deadlines?', isLawful: true },
  { id: 'q7', text: 'Do you have any underlying health conditions we need to accommodate?', isLawful: false, violationType: 'Health/Disability Discrimination (Pre-Offer)' },
  { id: 'q8', text: 'Describe a project where you demonstrated leadership and initiative.', isLawful: true },
  { id: 'q9', text: 'Are you married or currently in a civil partnership?', isLawful: false, violationType: 'Marriage & Civil Partnership Discrimination' },
  { id: 'q10', text: 'What technical skills or software do you bring to this role?', isLawful: true },
  { id: 'q11', text: 'Where were you or your parents born?', isLawful: false, violationType: 'Race & Nationality Discrimination' },
  { id: 'q12', text: 'How would you handle a severe disagreement with a senior team member?', isLawful: true },
  { id: 'q13', text: 'Do you attend a place of worship regularly that might affect your schedule?', isLawful: false, violationType: 'Religion or Belief Discrimination' },
  { id: 'q14', text: 'What do you consider your greatest professional achievement so far?', isLawful: true },
  { id: 'q15', text: 'Can you work the required core hours of 9 AM to 5 PM, Monday to Friday?', isLawful: true },
  { id: 'q16', text: 'Do you have children or caregiving responsibilities that might interfere with work?', isLawful: false, violationType: 'Sex/Associative Discrimination' },
];

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [timeLeft, setTimeLeft] = useState(120);
  const [complianceScore, setComplianceScore] = useState(100);
  const [slots, setSlots] = useState<Array<{question: Question | null, notes: string}>>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string>('');

  const start = () => {
    setGameState('playing');
    setTimeLeft(120);
    setComplianceScore(100);
    setSlots(Array.from({ length: 5 }, () => ({ question: null, notes: '' })));
    setEndReason('');
    setCurrentQuestions([...allQuestions].sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('end');
      setEndReason('Time expired before the interview was fully documented.');
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing' && complianceScore <= 0) {
      setGameState('end');
      setEndReason('Compliance score fell to 0. Session terminated by Legal and HR.');
    }
  }, [complianceScore, gameState]);

  const handleAddQuestion = (q: Question) => {
    if (!q.isLawful) {
      setFlash(q.violationType || 'Unlawful Question');
      setComplianceScore(prev => prev - 25); // -25 so 4 mistakes = fail
      setTimeout(() => setFlash(null), 2500);
      setCurrentQuestions(prev => prev.filter(item => item.id !== q.id));
      return;
    }

    const index = slots.findIndex(s => s.question === null);
    if (index !== -1) {
      const newSlots = [...slots];
      newSlots[index] = { ...newSlots[index], question: q };
      setSlots(newSlots);
    }
  };

  const handleUpdateNotes = (index: number, text: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], notes: text };
    setSlots(newSlots);
  };

  const handleRemoveQuestion = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = { question: null, notes: '' };
    setSlots(newSlots);
  };

  const canSubmit = slots.length === 5 && slots.every(s => s.question !== null && s.notes.trim().length > 5);

  const handleSubmit = () => {
    if (canSubmit) {
      setGameState('end');
      setEndReason('Interview completed and accurately documented in compliance with the UK Employment Rights Act.');
    }
  };

  if (gameState === 'start') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-100 p-8 font-sans">
        <div className="max-w-2xl bg-slate-800 p-10 rounded-lg shadow-2xl border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-bold text-white tracking-tight">HRWorks <span className="font-light text-slate-400">Enterprise</span></h1>
          </div>
          <h2 className="text-xl mb-6 text-blue-300 font-medium">UK Employment Rights Act - Interview Compliance Module</h2>
          <div className="bg-slate-900 p-6 rounded mb-8 border border-slate-700">
            <p className="text-slate-300 mb-4 leading-relaxed">
              Welcome, Hiring Manager. Under the new regulations, all interviews must be strictly documented and strictly avoid discriminatory topics.
            </p>
            <ul className="list-disc pl-5 text-slate-400 space-y-2">
              <li>Select exactly <strong>5 compliant questions</strong> for the interview agenda.</li>
              <li>Document the candidate's response for each selected question.</li>
              <li>Avoid questions regarding age, health, marital status, or family plans.</li>
              <li>Selecting an unlawful question will flag a legal risk and dock 25 compliance points.</li>
              <li>Submit the dossier before the 2-minute timer expires.</li>
            </ul>
          </div>
          <button onClick={start} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded transition-colors shadow-lg shadow-blue-900/50 uppercase tracking-wider">
            Initialize Interview Session
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'end') {
    const isSuccess = complianceScore > 0 && timeLeft >= 0 && slots.every(s => s.question && s.notes.length > 5);
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 p-8 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl border border-slate-200 text-center">
          {isSuccess ? (
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          ) : (
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          )}
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Session Terminated</h2>
          <p className="text-slate-600 mb-8">{endReason}</p>
          <div className="bg-slate-50 p-5 rounded-lg mb-8 text-left border border-slate-200 shadow-inner">
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">Final Audit Report</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Compliance Score:</span>
                <span className={`font-bold ${complianceScore < 100 ? 'text-red-500' : 'text-green-600'}`}>{complianceScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Time Remaining:</span>
                <span className="font-bold text-slate-700">
                  {Math.floor(Math.max(0, timeLeft) / 60)}:{(Math.max(0, timeLeft) % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Questions Logged:</span>
                <span className="font-bold text-slate-700">{slots.filter(s => s.question).length} / 5</span>
              </div>
            </div>
          </div>
          <button onClick={start} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded transition-colors uppercase tracking-wider">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 shadow-md z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="text-blue-400 w-6 h-6" />
          <h1 className="text-lg font-bold tracking-wide">HRWorks <span className="font-light text-slate-400">| Compliance Module</span></h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Compliance Score</span>
            <div className={`font-mono text-xl font-bold px-3 py-1 rounded border ${complianceScore < 60 ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
              {complianceScore}
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800 px-4 py-1.5 rounded-md border border-slate-700 shadow-inner">
            <Clock className={`w-4 h-4 ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`} />
            <span className={`font-mono font-medium text-lg ${timeLeft < 30 ? 'text-red-400' : 'text-slate-200'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Candidate */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col items-center shadow-sm z-0 shrink-0">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-inner">
             <User className="w-12 h-12 text-slate-400" />
           </div>
           <h2 className="text-lg font-bold text-slate-800">Alex Mercer</h2>
           <p className="text-sm text-blue-600 font-semibold mb-6">Senior Operations Mgr</p>
           
           <div className="w-full space-y-5 bg-slate-50 p-4 rounded border border-slate-100">
             <div>
               <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Experience</p>
               <p className="text-sm text-slate-800 font-medium">8 Years</p>
             </div>
             <div>
               <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Status</p>
               <p className="text-xs text-amber-700 font-bold bg-amber-100 inline-block px-2 py-1 rounded border border-amber-200">INTERVIEW PENDING</p>
             </div>
             <div>
               <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Req ID</p>
               <p className="text-sm text-slate-800 font-mono">OP-2026-X9</p>
             </div>
           </div>
        </aside>

        {/* Center Panel: Interview Slots */}
        <section className="flex-1 bg-slate-100/50 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Interview Agenda</h2>
                <p className="text-sm text-slate-500 font-medium">Fill all 5 slots and document candidate responses to proceed.</p>
              </div>
              <button 
                disabled={!canSubmit}
                onClick={handleSubmit}
                className={`py-2.5 px-6 rounded font-bold transition-all shadow-sm uppercase tracking-wide text-sm
                  ${canSubmit 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
              >
                Document & Submit
              </button>
            </div>

            <div className="space-y-4">
              {slots.map((slot, idx) => (
                <div key={idx} className={`border rounded-lg p-5 bg-white transition-all ${slot.question ? 'border-slate-300 shadow-sm' : 'border-dashed border-slate-300'}`}>
                  {slot.question ? (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mr-4 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="font-semibold text-slate-800 flex-1 leading-snug text-lg">{slot.question.text}</h4>
                        <button onClick={() => handleRemoveQuestion(idx)} className="text-slate-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider ml-4 transition-colors">
                          Remove
                        </button>
                      </div>
                      <div className="ml-11">
                        <textarea 
                          className="w-full border border-slate-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none bg-slate-50"
                          placeholder="Document candidate's response (required)..."
                          value={slot.notes}
                          onChange={(e) => handleUpdateNotes(idx, e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-slate-400 italic text-sm h-14 px-2">
                       <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-400 font-bold text-sm mr-4 border border-slate-200">
                          {idx + 1}
                       </span>
                       Empty Slot - Select a lawful question from the bank
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel: Question Bank */}
        <aside className="w-80 bg-white border-l border-slate-200 shadow-sm flex flex-col z-0 shrink-0">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800 text-lg">Question Bank</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Select pre-approved questions. Beware of legal traps.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {currentQuestions.map((q) => {
              const isAdded = slots.some(s => s.question?.id === q.id);
              if (isAdded) return null;

              // Do not show any visually explicit hint of whether it is lawful or unlawful to the player
              return (
                <div key={q.id} className="p-4 border border-slate-200 rounded bg-white hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                     onClick={() => handleAddQuestion(q)}>
                  <p className="text-sm text-slate-700 font-medium group-hover:text-blue-800 transition-colors leading-relaxed">{q.text}</p>
                  <div className="mt-3 text-right">
                    <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                      + Add to Agenda
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </main>
      
      {/* Red Flash Overlay for Legal Risk */}
      {flash && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-red-600/30 animate-pulse backdrop-blur-sm">
          <div className="bg-white border-l-8 border-red-600 shadow-2xl p-8 max-w-lg w-full animate-bounce">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="w-12 h-12 mr-4" />
              <h2 className="text-2xl font-black uppercase tracking-wider">Legal Risk Detected</h2>
            </div>
            <p className="text-slate-800 font-medium text-lg mb-4">
              <strong>Violation Type:</strong> {flash}
            </p>
            <div className="bg-red-50 p-4 rounded border border-red-200">
              <p className="text-sm text-red-800 font-bold uppercase tracking-wider">
                System Warning: Unlawful Question Prevented.
                <br/><span className="text-red-600 mt-1 block">Compliance Score Penalty: -25 points</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
