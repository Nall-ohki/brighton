import React, { useState, useEffect, DragEvent } from 'react';
import './App.css';

type Adjustment = {
  id: string;
  label: string;
  isCorrect: boolean;
};

type Feedback = {
  publisher: string;
  text: string;
  satisfiedBy: string;
};

type Slide = {
  title: string;
  description: string;
  feedbacks: Feedback[];
  adjustments: Adjustment[];
};

const INITIAL_TIME = 90;

const SLIDES: Slide[] = [
  {
    title: "Slide 1: Concept & Narrative",
    description: "Cabernet is a narrative RPG set in a 19th-century Eastern European setting where you play as a fledgling vampire struggling with morality...",
    feedbacks: [
      { publisher: "The Visionary", text: "Love the tone, but it's a bit too wordy. Can we tighten the pitch?", satisfiedBy: "Shorter Description" },
      { publisher: "The Skeptic", text: "Vampires are cool, but what's the actual hook? Why this game?", satisfiedBy: "Clearer USP" },
    ],
    adjustments: [
      { id: "Shorter Description", label: "Shorter Description", isCorrect: true },
      { id: "Clearer USP", label: "Clearer USP", isCorrect: true },
      { id: "Add MTX", label: "Add Microtransactions", isCorrect: false },
      { id: "More Combat", label: "Add Action Combat", isCorrect: false },
    ]
  },
  {
    title: "Slide 2: Market & Audience",
    description: "We are targeting fans of deep story games. The audience is out there and they are thirsty for more vampire content...",
    feedbacks: [
      { publisher: "The Numbers Boss", text: "Needs more market data. What games has this audience bought before?", satisfiedBy: "Add Comp Titles" },
      { publisher: "The Skeptic", text: "Who exactly is this for? We need specifics on the player base.", satisfiedBy: "Define Demographic" },
    ],
    adjustments: [
      { id: "Esports", label: "Esports Integration", isCorrect: false },
      { id: "Add Comp Titles", label: "Add Comp Titles", isCorrect: true },
      { id: "Mobile Port", label: "Promote Mobile Port", isCorrect: false },
      { id: "Define Demographic", label: "Define Demographic", isCorrect: true },
    ]
  },
  {
    title: "Slide 3: Production & Budget",
    description: "We are asking for $X to complete the game over the next 18 months. The team is ready and passionate...",
    feedbacks: [
      { publisher: "The Visionary", text: "The art sounds great, but where's the proof you can execute?", satisfiedBy: "Add Demo Link" },
      { publisher: "The Numbers Boss", text: "This budget seems vague. How is this money being allocated over time?", satisfiedBy: "Milestone Breakdown" },
    ],
    adjustments: [
      { id: "Cut QA", label: "Cut QA Budget", isCorrect: false },
      { id: "Add Demo Link", label: "Add Demo Link", isCorrect: true },
      { id: "Extend Timeline", label: "Extend Timeline 2 Yrs", isCorrect: false },
      { id: "Milestone Breakdown", label: "Milestone Breakdown", isCorrect: true },
    ]
  }
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WIN' | 'LOSE'>('START');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [appliedAdjustments, setAppliedAdjustments] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [feedbackAnimations, setFeedbackAnimations] = useState<Record<string, boolean>>({});
  const [mistakeWarning, setMistakeWarning] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING') {
      setGameState('LOSE');
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const startGame = () => {
    setGameState('PLAYING');
    setCurrentSlideIndex(0);
    setTimeLeft(INITIAL_TIME);
    setAppliedAdjustments([]);
    setMistakeWarning(null);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
    // e.dataTransfer.setData('text/plain', id); // fallback
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItem) return;

    const currentSlide = SLIDES[currentSlideIndex];
    const adjustment = currentSlide.adjustments.find(a => a.id === draggedItem);

    if (adjustment) {
      if (adjustment.isCorrect) {
        if (!appliedAdjustments.includes(adjustment.id)) {
          const newApplied = [...appliedAdjustments, adjustment.id];
          setAppliedAdjustments(newApplied);
          
          // Animate the feedback card resolving
          setFeedbackAnimations(prev => ({ ...prev, [adjustment.id]: true }));

          // Check if all needed adjustments are applied
          const neededCount = currentSlide.adjustments.filter(a => a.isCorrect).length;
          if (newApplied.length === neededCount) {
            setTimeout(() => {
              if (currentSlideIndex < SLIDES.length - 1) {
                setCurrentSlideIndex(currentSlideIndex + 1);
                setAppliedAdjustments([]);
                setFeedbackAnimations({});
              } else {
                setGameState('WIN');
              }
            }, 1000);
          }
        }
      } else {
        // Wrong adjustment! Time penalty or visual warning.
        setTimeLeft(prev => Math.max(0, prev - 5));
        setMistakeWarning("Publishers disliked that! -5s");
        setTimeout(() => setMistakeWarning(null), 2000);
      }
    }
    setDraggedItem(null);
  };

  const currentSlide = SLIDES[currentSlideIndex];

  return (
    <div className="app-container">
      {gameState === 'START' && (
        <div className="screen start-screen">
          <h1 className="game-title">The Pitch: Cabernet</h1>
          <p className="game-subtitle">A Narrative RPG Publisher Simulation</p>
          <div className="intro-text">
            <p>You have 90 seconds to pitch your dark, vampiric narrative RPG.</p>
            <p>Listen to the publisher panel's feedback on each slide.</p>
            <p>Drag the correct adjustment tiles onto your pitch to appease them.</p>
            <p>Don't waste time on the wrong adjustments!</p>
          </div>
          <button className="primary-btn" onClick={startGame}>Enter the Boardroom</button>
        </div>
      )}

      {gameState === 'PLAYING' && currentSlide && (
        <div className="screen playing-screen">
          <div className="top-bar">
            <div className="timer-box">
              <span className="timer-icon">⏳</span>
              <span className={`timer-text ${timeLeft <= 20 ? 'urgent' : ''}`}>{timeLeft}s</span>
            </div>
            <div className="progress-indicator">Slide {currentSlideIndex + 1} / {SLIDES.length}</div>
          </div>

          <div className="boardroom-layout">
            <div className="publisher-panel">
              {currentSlide.feedbacks.map((fb, idx) => {
                const isSatisfied = appliedAdjustments.includes(fb.satisfiedBy);
                return (
                  <div key={idx} className={`publisher-card ${isSatisfied ? 'satisfied' : ''}`}>
                    <div className="publisher-avatar"></div>
                    <div className="publisher-name">{fb.publisher}</div>
                    <div className="publisher-speech">
                      {isSatisfied ? "Ah, much better." : `"${fb.text}"`}
                    </div>
                  </div>
                );
              })}
            </div>

            <div 
              className={`slide-presentation ${draggedItem ? 'droppable' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <h2 className="slide-title">{currentSlide.title}</h2>
              <p className="slide-content">{currentSlide.description}</p>
              
              <div className="applied-adjustments-container">
                {appliedAdjustments.map(id => (
                  <span key={id} className="applied-badge">✓ {id}</span>
                ))}
              </div>

              {draggedItem && <div className="drop-hint">Drop Adjustment Here</div>}
              {mistakeWarning && <div className="mistake-warning">{mistakeWarning}</div>}
            </div>
          </div>

          <div className="adjustments-panel">
            <h3 className="panel-title">Available Adjustments (Drag & Drop)</h3>
            <div className="tiles-container">
              {currentSlide.adjustments.map(adj => {
                const isApplied = appliedAdjustments.includes(adj.id);
                return (
                  <div 
                    key={adj.id} 
                    className={`adjustment-tile ${isApplied ? 'applied' : ''}`}
                    draggable={!isApplied}
                    onDragStart={(e) => handleDragStart(e, adj.id)}
                    onDragEnd={() => setDraggedItem(null)}
                  >
                    {adj.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {gameState === 'WIN' && (
        <div className="screen win-screen">
          <h1 className="win-title">FUNDED!</h1>
          <p className="win-text">The publishers loved the pitch. Your narrative RPG is greenlit!</p>
          <div className="stats">Time Remaining: {timeLeft}s</div>
          <button className="primary-btn" onClick={startGame}>Pitch Again</button>
        </div>
      )}

      {gameState === 'LOSE' && (
        <div className="screen lose-screen">
          <h1 className="lose-title">MEETING OVER</h1>
          <p className="lose-text">You ran out of time and the publishers lost interest.</p>
          <button className="primary-btn" onClick={startGame}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default App;
