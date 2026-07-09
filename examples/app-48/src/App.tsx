import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const IDEA_TEXTS = [
  "RPG but you play as a sword",
  "MMO in a single room",
  "Match-3 with permadeath",
  "Platformer without jumping",
  "Dating sim for appliances",
  "RTS where you are the minion",
  "FPS but guns shoot healing",
  "Battle Royale for grandmas",
  "Stealth game in a disco",
  "Typing game to defuse bombs",
  "Farming sim in space",
  "Card game but cards lie",
  "VR game for blind people",
  "Racing game in a traffic jam",
  "Puzzle game using smells",
  "Rhythm game for accounting",
  "Horror game in a bouncy castle",
  "Idle game that requires exercise",
  "Fishing game but you're the fish",
  "Cooking game with only salt"
];

const COLORS = ['highlighter-pink', 'highlighter-yellow', 'highlighter-cyan', 'highlighter-green'];

interface Idea {
  id: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  progress: number;
}

function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [jar, setJar] = useState<Idea[]>([]);
  const [hyperfocus, setHyperfocus] = useState<Idea | null>(null);
  const [momentum, setMomentum] = useState(50);
  const [score, setScore] = useState(0);
  const [warning, setWarning] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  // Use refs for state accessed in loop to avoid stale closures
  const stateRef = useRef({ ideas, jar, hyperfocus, momentum, score, gameOver });

  useEffect(() => {
    stateRef.current = { ideas, jar, hyperfocus, momentum, score, gameOver };
  }, [ideas, jar, hyperfocus, momentum, score, gameOver]);

  const showWarning = (msg: string) => {
    setWarning(msg);
    setTimeout(() => setWarning(''), 2000);
  };

  const gameLoop = (time: number) => {
    if (stateRef.current.gameOver) return;

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }
    const deltaTime = (time - lastTimeRef.current) / 1000; // in seconds
    lastTimeRef.current = time;

    let { ideas: currentIdeas, hyperfocus: currentFocus, momentum: currentMomentum, score: currentScore } = stateRef.current;
    
    let needsUpdate = false;
    let newIdeas = [...currentIdeas];
    let newFocus = currentFocus ? { ...currentFocus } : null;
    let newMomentum = currentMomentum;
    let newScore = currentScore;

    // Move ideas
    if (newIdeas.length > 0) {
      newIdeas = newIdeas.map(idea => ({
        ...idea,
        x: idea.x + idea.vx * deltaTime * 60,
        y: idea.y + idea.vy * deltaTime * 60
      })).filter(idea => idea.x > -200 && idea.x < window.innerWidth + 200 && idea.y > -200 && idea.y < window.innerHeight + 200);
      needsUpdate = true;
    }

    // Spawn new ideas
    spawnTimerRef.current += deltaTime;
    if (spawnTimerRef.current > 2.5) {
      spawnTimerRef.current = 0;
      const text = IDEA_TEXTS[Math.floor(Math.random() * IDEA_TEXTS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      // Spawn from edges
      const edge = Math.floor(Math.random() * 4);
      let x = 0, y = 0, vx = 0, vy = 0;
      const speed = 1 + Math.random() * 1.5;
      if (edge === 0) { x = -100; y = Math.random() * window.innerHeight; vx = speed; vy = (Math.random() - 0.5) * speed; } // left
      if (edge === 1) { x = window.innerWidth + 100; y = Math.random() * window.innerHeight; vx = -speed; vy = (Math.random() - 0.5) * speed; } // right
      if (edge === 2) { x = Math.random() * window.innerWidth; y = -100; vx = (Math.random() - 0.5) * speed; vy = speed; } // top
      if (edge === 3) { x = Math.random() * window.innerWidth; y = window.innerHeight + 100; vx = (Math.random() - 0.5) * speed; vy = -speed; } // bottom

      newIdeas.push({
        id: Math.random().toString(36).substr(2, 9),
        text, x, y, vx, vy, color, progress: 0
      });
      needsUpdate = true;
    }

    // Progress hyperfocus
    if (newFocus) {
      newFocus.progress += deltaTime * 15; // Complete in ~6.6 seconds
      newMomentum += deltaTime * 5; // Regain momentum while focusing
      if (newMomentum > 100) newMomentum = 100;

      if (newFocus.progress >= 100) {
        newScore += 1;
        newFocus = null;
      }
      needsUpdate = true;
    } else {
      // Drain momentum slowly if doing nothing
      if (newMomentum > 50) {
        newMomentum -= deltaTime * 2;
      }
      needsUpdate = true;
    }

    if (newMomentum <= 0) {
      setGameOver(true);
      return;
    }

    if (needsUpdate) {
      setIdeas(newIdeas);
      if (newFocus !== currentFocus) setHyperfocus(newFocus);
      if (Math.abs(newMomentum - currentMomentum) > 0.1) setMomentum(newMomentum);
      if (newScore !== currentScore) setScore(newScore);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const handleClickFlyingIdea = (idea: Idea) => {
    if (gameOver) return;
    
    // Remove from flying
    setIdeas(prev => prev.filter(i => i.id !== idea.id));
    
    // Add to jar
    setJar(prev => [...prev, idea]);

    // Multitasking penalty
    if (stateRef.current.hyperfocus) {
      setMomentum(prev => {
        const newM = prev - 25;
        if (newM <= 0) {
          setGameOver(true);
          return 0;
        }
        return newM;
      });
      showWarning("Multitasking Penalty! -25 Momentum");
    }
  };

  const handleStartIdea = (idea: Idea) => {
    if (gameOver) return;

    if (hyperfocus) {
      showWarning("Finish your current idea first!");
      return;
    }

    // Move from jar to focus
    setJar(prev => prev.filter(i => i.id !== idea.id));
    setHyperfocus({ ...idea, progress: 0 });
  };

  const restart = () => {
    setIdeas([]);
    setJar([]);
    setHyperfocus(null);
    setMomentum(50);
    setScore(0);
    setGameOver(false);
    lastTimeRef.current = 0;
    spawnTimerRef.current = 0;
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="notebook-paper">
      <div className="top-bar">
        <div className="momentum-container">
          <h2>Momentum</h2>
          <div className="momentum-bar-bg hand-drawn-2">
            <div className="momentum-fill" style={{ width: `${momentum}%` }}></div>
          </div>
        </div>
        <div className="score-display">
          Games Shipped: {score}
        </div>
      </div>

      {warning && <div className="warning-text">{warning}</div>}

      <div className="hyperfocus-zone hand-drawn">
        <h2>Hyperfocus Zone</h2>
        {hyperfocus ? (
          <>
            <div className={`active-idea hand-drawn-2 ${hyperfocus.color}`}>
              {hyperfocus.text}
            </div>
            <div className="progress-container hand-drawn-2">
              <div className="progress-fill" style={{ width: `${hyperfocus.progress}%` }}></div>
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>Working...</p>
          </>
        ) : (
          <p style={{ color: '#888' }}>Drag an idea from the jar here to start working on it!</p>
        )}
      </div>

      <div className="idea-jar-container">
        <div className="idea-jar">
          {jar.map(idea => (
            <div 
              key={idea.id} 
              className={`jar-idea hand-drawn ${idea.color}`}
              onClick={() => handleStartIdea(idea)}
            >
              {idea.text}
            </div>
          ))}
        </div>
      </div>

      {ideas.map(idea => (
        <div
          key={idea.id}
          className={`thought-bubble hand-drawn ${idea.color}`}
          style={{ left: idea.x, top: idea.y }}
          onClick={() => handleClickFlyingIdea(idea)}
        >
          {idea.text}
        </div>
      ))}

      {gameOver && (
        <div className="game-over">
          <h1>Burnt Out!</h1>
          <p style={{ fontSize: '24px', marginBottom: '30px' }}>You lost all your momentum.</p>
          <p style={{ fontSize: '20px', marginBottom: '20px' }}>Games Shipped: {score}</p>
          <button onClick={restart}>Try Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
