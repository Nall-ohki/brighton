import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Scale, Brain, AlertTriangle, FileText, CheckCircle, ChevronRight, XCircle, Info } from 'lucide-react';
import './App.css';

type RiskLevel = 'Low' | 'Medium' | 'High';

interface CardData {
  id: string;
  title: string;
  description: string;
  consensusLegal: number;
  consensusCreative: number;
  consensusEthical: number;
  consensusRisk: RiskLevel;
  explanation: string;
  charterClause: string;
}

const SCENARIOS: CardData[] = [
  {
    id: 'npc-voices',
    title: 'AI-Generated NPC Voices',
    description: 'Using generative AI models trained on a mix of licensed and publicly scraped voice data to generate dynamic, infinite dialogue for non-playable characters.',
    consensusLegal: 80,
    consensusCreative: 40,
    consensusEthical: 75,
    consensusRisk: 'High',
    explanation: 'High risk due to unresolved copyright issues with scraped data (Legal), potential displacement of voice actors without fair compensation (Ethical), though it allows for infinite dynamic dialogue (Creative).',
    charterClause: 'We commit to sourcing all training data for generative audio through explicit opt-in licensing and fair compensation models.'
  },
  {
    id: 'pcg-environment',
    title: 'Procedural Gen Replacing Junior Artists',
    description: 'Deploying in-house AI tools trained exclusively on your studio\'s past games to generate 80% of background environmental assets, eliminating the need for junior 3D artist roles.',
    consensusLegal: 10,
    consensusCreative: 60,
    consensusEthical: 70,
    consensusRisk: 'Medium',
    explanation: 'Legally safe since it uses internal data. However, eliminating junior roles destroys the industry talent pipeline (Ethical) and risks a homogenization of studio art style over time (Creative).',
    charterClause: 'We view AI as a tool to augment our artists, maintaining a commitment to hiring and mentoring junior talent to preserve our creative pipeline.'
  },
  {
    id: 'behavior-prediction',
    title: 'Player Behavior Prediction',
    description: 'Collecting real-time biometric and gameplay data to predict when a player is about to churn, dynamically adjusting difficulty and microtransaction offers to keep them engaged.',
    consensusLegal: 65,
    consensusCreative: 30,
    consensusEthical: 90,
    consensusRisk: 'High',
    explanation: 'Extremely high ethical risk (manipulative dark patterns, preying on vulnerable players). Legal risks are growing around GDPR and biometric data. Creative value is dubious as it undermines natural game design.',
    charterClause: 'We strictly prohibit the use of player data to manipulate game difficulty for the purpose of driving microtransactions or exploiting psychological vulnerabilities.'
  },
  {
    id: 'concept-ideation',
    title: 'AI for Concept Ideation',
    description: 'Artists using commercial AI image generators as a "mood board" tool in the pre-production phase to quickly iterate on high-level visual concepts before manual painting.',
    consensusLegal: 40,
    consensusCreative: 20,
    consensusEthical: 30,
    consensusRisk: 'Low',
    explanation: 'Generally accepted as low risk if the output is only used internally for ideation and not in the final product. Legal risk remains if inadvertently plagiarizing specific elements.',
    charterClause: 'We permit the use of AI tools for rapid prototyping and internal ideation, provided final assets are entirely human-authored and distinct from generated outputs.'
  },
  {
    id: 'automated-mod',
    title: 'Automated Voice Chat Moderation',
    description: 'Using AI to transcribe and analyze player voice chat in real-time, automatically issuing bans for hate speech and toxicity without human review.',
    consensusLegal: 50,
    consensusCreative: 10,
    consensusEthical: 60,
    consensusRisk: 'Medium',
    explanation: 'Reduces toxicity effectively, but false positives in automated bans can unfairly punish players (Ethical). Privacy concerns regarding real-time voice monitoring also introduce Legal friction.',
    charterClause: 'We leverage AI to identify toxic behavior but mandate a "human-in-the-loop" review process before issuing permanent account bans.'
  }
];

interface PlayerEvaluation {
  cardId: string;
  legal: number;
  creative: number;
  ethical: number;
  risk: RiskLevel;
}

export default function App() {
  const [phase, setPhase] = useState<'intro' | 'evaluating' | 'revealing' | 'charter'>('intro');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [evaluations, setEvaluations] = useState<PlayerEvaluation[]>([]);
  
  // Current evaluation state
  const [legal, setLegal] = useState(50);
  const [creative, setCreative] = useState(50);
  const [ethical, setEthical] = useState(50);
  const [risk, setRisk] = useState<RiskLevel | null>(null);

  const handleStart = () => {
    setPhase('evaluating');
  };

  const currentCard = SCENARIOS[currentCardIndex];

  const handleSubmitEvaluation = () => {
    if (!risk) return;
    setEvaluations([...evaluations, { cardId: currentCard.id, legal, creative, ethical, risk }]);
    setPhase('revealing');
  };

  const handleNextCard = () => {
    if (currentCardIndex < SCENARIOS.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setLegal(50);
      setCreative(50);
      setEthical(50);
      setRisk(null);
      setPhase('evaluating');
    } else {
      setPhase('charter');
    }
  };

  const renderIntro = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-stone-50 border border-stone-300 p-10 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-stone-800" />
      <div className="flex justify-center mb-6">
        <Scale className="w-16 h-16 text-stone-800" />
      </div>
      <h1 className="text-4xl font-serif text-center mb-4 text-stone-900 tracking-tight">AI ETHICS RISK ASSESSMENT</h1>
      <div className="w-24 h-[1px] bg-stone-400 mx-auto mb-8" />
      <p className="text-stone-700 text-lg leading-relaxed mb-6 font-serif">
        Welcome to the Interactive Ethics Review Board. As a studio executive, you must evaluate emerging AI technologies proposed for our upcoming titles.
      </p>
      <p className="text-stone-700 text-lg leading-relaxed mb-8 font-serif">
        For each scenario, weigh the Legal, Creative, and Ethical implications using the provided sliders. Finally, assign an overall Risk Level. Your decisions will shape our studio's final Ethics Charter.
      </p>
      <div className="flex justify-center">
        <button 
          onClick={handleStart}
          className="bg-stone-900 hover:bg-stone-800 text-stone-50 px-8 py-3 font-medium flex items-center transition-colors shadow-sm"
        >
          COMMENCE REVIEW <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  const renderSliders = (readOnly = false, evaluationData?: PlayerEvaluation, consensusData?: CardData) => {
    const lVal = readOnly && evaluationData ? evaluationData.legal : legal;
    const cVal = readOnly && evaluationData ? evaluationData.creative : creative;
    const eVal = readOnly && evaluationData ? evaluationData.ethical : ethical;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="flex items-center text-sm font-bold text-stone-700 uppercase tracking-wider">
              <FileText className="w-4 h-4 mr-2" /> Legal Friction
            </label>
            <span className="text-stone-500 text-xs font-mono">{lVal}%</span>
          </div>
          <div className="relative">
            <input 
              type="range" min="0" max="100" 
              value={lVal}
              onChange={(e) => !readOnly && setLegal(parseInt(e.target.value))}
              disabled={readOnly}
              className={`w-full h-2 bg-stone-200 appearance-none rounded-none outline-none ${readOnly ? 'opacity-50' : 'cursor-pointer'}`}
            />
            {readOnly && consensusData && (
              <div 
                className="absolute top-0 w-3 h-4 bg-red-600 -mt-1 -ml-1.5" 
                style={{ left: `${consensusData.consensusLegal}%` }}
                title={`Consensus: ${consensusData.consensusLegal}%`}
              />
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="flex items-center text-sm font-bold text-stone-700 uppercase tracking-wider">
              <Brain className="w-4 h-4 mr-2" /> Creative Impact
            </label>
            <span className="text-stone-500 text-xs font-mono">{cVal}%</span>
          </div>
          <div className="relative">
            <input 
              type="range" min="0" max="100" 
              value={cVal}
              onChange={(e) => !readOnly && setCreative(parseInt(e.target.value))}
              disabled={readOnly}
              className={`w-full h-2 bg-stone-200 appearance-none rounded-none outline-none ${readOnly ? 'opacity-50' : 'cursor-pointer'}`}
            />
            {readOnly && consensusData && (
              <div 
                className="absolute top-0 w-3 h-4 bg-red-600 -mt-1 -ml-1.5" 
                style={{ left: `${consensusData.consensusCreative}%` }}
                title={`Consensus: ${consensusData.consensusCreative}%`}
              />
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="flex items-center text-sm font-bold text-stone-700 uppercase tracking-wider">
              <Shield className="w-4 h-4 mr-2" /> Ethical Hazard
            </label>
            <span className="text-stone-500 text-xs font-mono">{eVal}%</span>
          </div>
          <div className="relative">
            <input 
              type="range" min="0" max="100" 
              value={eVal}
              onChange={(e) => !readOnly && setEthical(parseInt(e.target.value))}
              disabled={readOnly}
              className={`w-full h-2 bg-stone-200 appearance-none rounded-none outline-none ${readOnly ? 'opacity-50' : 'cursor-pointer'}`}
            />
            {readOnly && consensusData && (
              <div 
                className="absolute top-0 w-3 h-4 bg-red-600 -mt-1 -ml-1.5" 
                style={{ left: `${consensusData.consensusEthical}%` }}
                title={`Consensus: ${consensusData.consensusEthical}%`}
              />
            )}
          </div>
        </div>
        
        {readOnly && consensusData && (
          <div className="flex items-center text-xs text-stone-500 font-mono mt-2">
            <div className="w-2 h-2 bg-red-600 mr-2" /> Industry Consensus Mark
          </div>
        )}
      </div>
    );
  };

  const renderEvaluating = () => (
    <motion.div 
      key={`eval-${currentCard.id}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {/* Scenario Card */}
      <div className="bg-stone-50 border border-stone-300 shadow-lg p-8 relative flex flex-col">
        <div className="absolute top-4 right-4 text-stone-400 font-mono text-sm">CASE {currentCardIndex + 1}/{SCENARIOS.length}</div>
        <div className="mb-6">
          <span className="bg-stone-800 text-stone-50 text-xs font-bold px-2 py-1 uppercase tracking-wider">Scenario Profile</span>
        </div>
        <h2 className="text-2xl font-serif text-stone-900 mb-4">{currentCard.title}</h2>
        <p className="text-stone-700 leading-relaxed font-serif text-lg mb-8 flex-grow">
          {currentCard.description}
        </p>
        <div className="border-t border-stone-200 pt-4 mt-auto">
          <p className="text-xs text-stone-500 uppercase tracking-wide">CONFIDENTIAL - STUDIO EYES ONLY</p>
        </div>
      </div>

      {/* Evaluation Panel */}
      <div className="bg-white border border-stone-200 shadow-md p-8 flex flex-col">
        <h3 className="text-lg font-bold text-stone-800 uppercase tracking-wider mb-6 border-b border-stone-200 pb-2">Assessment Metrics</h3>
        
        {renderSliders()}

        <div className="mt-10">
          <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" /> Overall Risk Assignment
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {(['Low', 'Medium', 'High'] as RiskLevel[]).map(r => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`py-3 border-2 font-bold uppercase tracking-wider transition-all
                  ${risk === r 
                    ? r === 'Low' ? 'border-green-600 bg-green-50 text-green-700' 
                      : r === 'Medium' ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-red-600 bg-red-50 text-red-700'
                    : 'border-stone-200 text-stone-500 hover:border-stone-400'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmitEvaluation}
          disabled={!risk}
          className={`mt-auto pt-6 w-full py-4 text-center font-bold uppercase tracking-widest transition-colors
            ${risk ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
        >
          Submit Verdict
        </button>
      </div>
    </motion.div>
  );

  const renderRevealing = () => {
    const evaluation = evaluations[evaluations.length - 1];
    const isMatch = evaluation.risk === currentCard.consensusRisk;

    return (
      <motion.div 
        key={`rev-${currentCard.id}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-stone-50 border-2 border-stone-800 p-8 shadow-2xl relative"
      >
        <div className="absolute top-0 right-0 bg-stone-800 text-white px-4 py-1 text-sm font-mono font-bold">
          REVIEW OUTCOME
        </div>
        
        <div className="flex items-center mb-8 pb-4 border-b-2 border-stone-200">
          {isMatch ? (
            <CheckCircle className="w-12 h-12 text-stone-800 mr-4" />
          ) : (
            <Info className="w-12 h-12 text-stone-600 mr-4" />
          )}
          <div>
            <h2 className="text-3xl font-serif text-stone-900">Industry Consensus: {currentCard.consensusRisk} Risk</h2>
            <p className="text-stone-600 font-mono text-sm">Your Assessment: {evaluation.risk}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 border-b border-stone-200 pb-2">Analysis Breakdown</h3>
            <p className="text-stone-800 leading-relaxed font-serif text-lg bg-stone-100 p-4 border border-stone-200">
              {currentCard.explanation}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider mb-4 border-b border-stone-200 pb-2">Delta Visualization</h3>
            <div className="bg-white p-4 border border-stone-200">
               {renderSliders(true, evaluation, currentCard)}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t-2 border-stone-200">
          <button
            onClick={handleNextCard}
            className="bg-stone-900 hover:bg-stone-800 text-stone-50 px-8 py-3 font-medium flex items-center transition-colors"
          >
            {currentCardIndex < SCENARIOS.length - 1 ? 'NEXT SCENARIO' : 'FINALIZE CHARTER'} <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderCharter = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-[#fdfbf7] border border-stone-300 p-12 shadow-2xl relative doc-texture"
      >
        <div className="absolute top-8 left-0 w-full h-2 bg-double-line opacity-20" />
        <div className="text-center mb-12">
          <div className="inline-block border-2 border-stone-900 p-3 mb-6">
            <Scale className="w-12 h-12 text-stone-900" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 uppercase tracking-widest">Studio AI Ethics Charter</h1>
          <p className="text-stone-500 font-mono text-sm">RATIFIED BY THE EXECUTIVE ETHICS BOARD • {new Date().getFullYear()}</p>
        </div>

        <div className="space-y-8 mb-12">
          {SCENARIOS.map((scenario, idx) => {
            const playerEval = evaluations.find(e => e.cardId === scenario.id);
            return (
              <div key={scenario.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-stone-900 before:rotate-45">
                <h3 className="text-lg font-bold text-stone-800 uppercase tracking-wide mb-2">
                  Article {idx + 1}: {scenario.title}
                </h3>
                <p className="text-stone-700 font-serif leading-relaxed text-lg italic bg-stone-100 p-4 border-l-4 border-stone-400">
                  "{scenario.charterClause}"
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs font-mono text-stone-500">
                  <span>Assessed Risk: <strong className="text-stone-700">{playerEval?.risk}</strong></span>
                  <span>|</span>
                  <span>L:{playerEval?.legal}% C:{playerEval?.creative}% E:{playerEval?.ethical}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t-2 border-stone-900 pt-8 flex justify-between items-end">
          <div className="font-serif">
            <div className="w-48 h-[1px] bg-stone-400 mb-2" />
            <p className="text-stone-600 text-sm italic">Authorized Signature</p>
          </div>
          <div className="text-right">
            <button 
              onClick={() => window.location.reload()}
              className="text-sm font-bold text-stone-500 hover:text-stone-900 uppercase tracking-widest border border-stone-300 hover:border-stone-900 px-4 py-2 transition-all"
            >
              Reconvene Board
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-200 py-12 px-4 selection:bg-stone-900 selection:text-white">
      <AnimatePresence mode="wait">
        {phase === 'intro' && renderIntro()}
        {phase === 'evaluating' && renderEvaluating()}
        {phase === 'revealing' && renderRevealing()}
        {phase === 'charter' && renderCharter()}
      </AnimatePresence>
    </div>
  );
}
