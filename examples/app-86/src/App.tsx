import React, { useState, useEffect } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  closestCenter
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  UserCheck,
  AlertOctagon,
  Shield,
  ArrowRight,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';

type Category = 'AI_ENHANCES' | 'HUMAN_DECIDES' | 'ETHICALLY_RISKY';

interface Scenario {
  id: string;
  text: string;
  correctCategory: Category;
  consequence: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    text: "AI generates initial color palettes and typography pairings based on brand keywords.",
    correctCategory: 'AI_ENHANCES',
    consequence: "You missed a chance to speed up early exploration. The team burns hours on blank-canvas syndrome."
  },
  {
    id: 's2',
    text: "AI optimizes the checkout flow by burying the 'cancel subscription' button for less engaged users.",
    correctCategory: 'ETHICALLY_RISKY',
    consequence: "Dark pattern deployed. Users feel trapped, leading to a massive PR backlash and loss of trust."
  },
  {
    id: 's3',
    text: "AI reviews automated translation drafts of the UI and approves them for global release.",
    correctCategory: 'HUMAN_DECIDES',
    consequence: "Cultural nuances and offensive mis-translations slip into production, alienating international users."
  },
  {
    id: 's4',
    text: "AI automatically flags contrast issues in your design files and suggests WCAG-compliant fixes.",
    correctCategory: 'AI_ENHANCES',
    consequence: "You rejected a helpful guardrail. The team ships avoidable accessibility bugs."
  },
  {
    id: 's5',
    text: "AI analyzes user webcam data to detect emotional state and dynamically change the UI mood.",
    correctCategory: 'ETHICALLY_RISKY',
    consequence: "Massive privacy violation. Users are deeply creeped out by the surveillance and abandon the app."
  },
  {
    id: 's6',
    text: "AI synthesizes support tickets and decides which features the engineering team builds next.",
    correctCategory: 'HUMAN_DECIDES',
    consequence: "AI lacks strategic context. It prioritizes noisy minor bugs over crucial core improvements."
  }
];

const CATEGORIES: { id: Category; title: string; icon: React.ReactNode; color: string; borderColor: string; bgColor: string }[] = [
  {
    id: 'AI_ENHANCES',
    title: 'AI Enhances',
    icon: <Brain className="w-6 h-6" />,
    color: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50'
  },
  {
    id: 'HUMAN_DECIDES',
    title: 'Human Must Decide',
    icon: <UserCheck className="w-6 h-6" />,
    color: 'text-amber-700',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'ETHICALLY_RISKY',
    title: 'Ethically Risky',
    icon: <AlertOctagon className="w-6 h-6" />,
    color: 'text-rose-700',
    borderColor: 'border-rose-200',
    bgColor: 'bg-rose-50'
  }
];

const DroppableZone = ({ category }: { category: typeof CATEGORIES[0] }) => {
  const { isOver, setNodeRef } = useDroppable({ id: category.id });

  return (
    <div
      ref={setNodeRef}
      className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 ease-out
        ${isOver ? `scale-105 ${category.bgColor} ${category.borderColor} shadow-lg` : 'border-stone-200 bg-stone-50/50'}
      `}
    >
      <div className={`mb-3 p-3 rounded-full bg-white shadow-sm ${category.color} ${isOver ? 'animate-bounce' : ''}`}>
        {category.icon}
      </div>
      <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-800 text-center">{category.title}</h3>
    </div>
  );
};

const DraggableCard = ({ scenario, isOverlay }: { scenario: Scenario, isOverlay?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: scenario.id });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (isDragging && !isOverlay) {
    return (
      <div className="w-full max-w-lg mx-auto opacity-0" />
    );
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : listeners)}
      {...(isOverlay ? {} : attributes)}
      className={`w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-stone-100 cursor-grab active:cursor-grabbing 
        ${isOverlay ? 'scale-105 shadow-2xl rotate-2' : 'hover:shadow-2xl transition-shadow duration-300'}`}
    >
      <p className="font-serif text-2xl sm:text-3xl text-stone-800 text-center leading-snug">
        "{scenario.text}"
      </p>
      <div className="mt-8 flex justify-center">
        <div className="px-4 py-1.5 rounded-full bg-stone-100 text-stone-500 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
          Drag to categorize
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', message?: string } | null>(null);

  const currentScenario = SCENARIOS[currentIndex];
  const isGameOver = currentIndex >= SCENARIOS.length;

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { over } = event;
    
    if (!over) return;
    
    const droppedCategory = over.id as Category;
    
    if (droppedCategory === currentScenario.correctCategory) {
      setFeedback({ type: 'correct' });
      setScore(s => s + 1);
    } else {
      setFeedback({ type: 'wrong', message: currentScenario.consequence });
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setCurrentIndex(i => i + 1);
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
  };

  const getArchetype = () => {
    const percentage = score / SCENARIOS.length;
    if (percentage === 1) return { title: 'Ethical Visionary', desc: 'You perfectly balance human oversight, AI efficiency, and user protection.' };
    if (percentage >= 0.6) return { title: 'Cautious Optimist', desc: 'You make generally safe choices, but could refine where to draw the line.' };
    return { title: 'Silicon Valley Move-Faster', desc: 'You might be prioritizing speed over safety. Time to review some design ethics!' };
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-stone-800 font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="px-6 py-6 sm:px-12 flex justify-between items-center border-b border-stone-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-800 text-[#F4F0EA] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-xl font-semibold tracking-tight">Design for Change</h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">Trust Tokens</span>
          <div className="flex items-center gap-1.5 text-xl font-serif">
            {score} <span className="text-stone-400">/ {SCENARIOS.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center">
        {!isGameOver ? (
          <>
            <div className="w-full flex-1 flex flex-col relative min-h-[500px]">
              
              <AnimatePresence mode="wait">
                {feedback ? (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  >
                    <div className={`max-w-2xl w-full p-8 sm:p-12 rounded-3xl shadow-2xl flex flex-col items-center text-center backdrop-blur-md border ${
                      feedback.type === 'correct' 
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
                        : 'bg-stone-900/95 border-stone-700 text-stone-100'
                    }`}>
                      {feedback.type === 'correct' ? (
                        <>
                          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', bounce: 0.5 }}
                            >
                              <Shield className="w-8 h-8 text-emerald-600" />
                            </motion.div>
                          </div>
                          <h2 className="font-serif text-3xl mb-4">+1 Trust Token Earned</h2>
                          <p className="text-emerald-700/80 mb-8 max-w-md">Spot on. You made the right call for your users and your team.</p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-6 text-rose-400">
                            <motion.div
                              animate={{ rotate: [-10, 10, -10, 10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              <AlertTriangle className="w-8 h-8" />
                            </motion.div>
                          </div>
                          <h2 className="font-serif text-3xl mb-4 text-white">Trust Lost</h2>
                          <p className="text-stone-300 mb-8 max-w-lg text-lg leading-relaxed">{feedback.message}</p>
                        </>
                      )}
                      
                      <button
                        onClick={handleNext}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 ${
                          feedback.type === 'correct'
                            ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                            : 'bg-white text-stone-900 shadow-white/10'
                        } shadow-lg`}
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="game"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex-1 flex flex-col h-full"
                  >
                    {/* Progress */}
                    <div className="mb-12 text-center">
                      <p className="text-sm font-semibold tracking-widest text-stone-400 uppercase mb-4">
                        Scenario {currentIndex + 1} of {SCENARIOS.length}
                      </p>
                      <div className="flex justify-center gap-2">
                        {SCENARIOS.map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 w-8 rounded-full transition-colors ${
                              i < currentIndex ? 'bg-stone-800' : i === currentIndex ? 'bg-stone-400' : 'bg-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <DndContext 
                      onDragStart={handleDragStart} 
                      onDragEnd={handleDragEnd}
                      collisionDetection={closestCenter}
                    >
                      <div className="flex-1 flex flex-col justify-between w-full relative z-0">
                        {/* Draggable Card Area */}
                        <div className="flex-1 flex items-center justify-center min-h-[300px] mb-12">
                          <DraggableCard scenario={currentScenario} />
                        </div>

                        {/* Drop Zones */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-auto">
                          {CATEGORIES.map(cat => (
                            <DroppableZone key={cat.id} category={cat} />
                          ))}
                        </div>
                      </div>

                      <DragOverlay dropAnimation={null}>
                        {activeId ? (
                          <DraggableCard 
                            scenario={SCENARIOS.find(s => s.id === activeId)!} 
                            isOverlay 
                          />
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full bg-white rounded-3xl p-12 text-center shadow-xl border border-stone-100"
          >
            <div className="w-20 h-20 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-8">
              <Brain className="w-10 h-10 text-stone-800" />
            </div>
            <h2 className="text-sm font-semibold tracking-widest text-stone-500 uppercase mb-4">Final Assessment</h2>
            <h1 className="font-serif text-4xl sm:text-5xl text-stone-800 mb-6">{getArchetype().title}</h1>
            <p className="text-lg text-stone-600 mb-10 max-w-md mx-auto leading-relaxed">
              {getArchetype().desc}
            </p>
            
            <div className="flex justify-center mb-12">
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 inline-block">
                <p className="text-sm text-stone-500 uppercase tracking-wider mb-2">Final Score</p>
                <p className="text-4xl font-serif text-stone-800">{score} <span className="text-xl text-stone-400">/ {SCENARIOS.length}</span></p>
              </div>
            </div>

            <button
              onClick={restart}
              className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors shadow-lg"
            >
              <RefreshCcw className="w-4 h-4" /> Play Again
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
