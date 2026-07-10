import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const SCENES = [
  {
    id: 1,
    direction: "[ Furious, rapid-fire, simmering with rage ]",
    line: "I told you never to call this number!",
    targetPace: 85,
    targetTone: 90,
    targetSubtext: 20
  },
  {
    id: 2,
    direction: "[ Slow, dripping with sarcasm, secretly hurt ]",
    line: "Oh, congratulations. You've really outdone yourself this time.",
    targetPace: 20,
    targetTone: 40,
    targetSubtext: 90
  },
  {
    id: 3,
    direction: "[ Hesitant, soft, genuinely pleading ]",
    line: "If you just give me one more chance, I can fix everything.",
    targetPace: 30,
    targetTone: 20,
    targetSubtext: 10
  },
  {
    id: 4,
    direction: "[ Upbeat, manic, completely delusional ]",
    line: "This is fine! Everything is perfectly, entirely fine!",
    targetPace: 95,
    targetTone: 80,
    targetSubtext: 85
  }
];

export default function App() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [takeNum, setTakeNum] = useState(1);
  const [phase, setPhase] = useState<'setup' | 'action' | 'results'>('setup');
  
  const [pace, setPace] = useState(50);
  const [tone, setTone] = useState(50);
  const [subtext, setSubtext] = useState(50);
  
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const [waveform, setWaveform] = useState<number[]>(Array(24).fill(5));
  
  const [faceConfig, setFaceConfig] = useState({
    eyeScale: 1,
    mouthHeight: 10,
    mouthWidth: 40,
    mouthRadius: 10,
    shake: 0
  });

  const scene = SCENES[sceneIndex];
  const animRef = useRef<number>();
  
  const calculateScore = () => {
    const paceDiff = Math.abs(pace - scene.targetPace);
    const toneDiff = Math.abs(tone - scene.targetTone);
    const subtextDiff = Math.abs(subtext - scene.targetSubtext);
    
    const totalDiff = paceDiff + toneDiff + subtextDiff;
    const maxDiff = 300;
    
    const rawScore = 100 - (totalDiff / maxDiff) * 100;
    // apply a bit more punishing curve so it's challenging
    const curvedScore = Math.max(0, Math.pow(rawScore / 100, 1.5) * 100);
    const finalScore = Math.round(curvedScore);
    
    return { finalScore, paceDiff, toneDiff, subtextDiff };
  };

  const handleAction = () => {
    setPhase('action');
    
    // Set static face config for the take
    setFaceConfig({
      eyeScale: subtext > 70 ? 0.3 : (tone > 70 ? 1.5 : 1),
      mouthHeight: tone > 60 ? 35 : (tone < 30 ? 4 : 12),
      mouthWidth: 30 + (tone - 50) * 0.4,
      mouthRadius: tone > 60 ? 40 : 10,
      shake: pace > 60 ? (pace - 60) * 0.15 : 0
    });
    
    let frame = 0;
    const duration = 140; // ~2.3 seconds
    
    const animate = () => {
      frame++;
      
      setWaveform(prev => prev.map((_, i) => {
        const baseHeight = 15 + (tone / 100) * 75;
        const speed = (pace / 100) * 0.6 + 0.1;
        const noise = Math.random() * baseHeight;
        const subtextJitter = (subtext / 100) * (Math.random() * 20); // Adds erraticness if subtext is high
        
        return 5 + Math.abs(noise * Math.sin(frame * speed + i) + subtextJitter);
      }));
      
      if (frame < duration) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        const { finalScore, paceDiff, toneDiff, subtextDiff } = calculateScore();
        setScore(finalScore);
        
        let feedbackMsg = "";
        if (finalScore >= 95) feedbackMsg = "Perfect! Print it!";
        else if (finalScore > 80) feedbackMsg = "Great take. Good emotional balance.";
        else if (finalScore > 50) feedbackMsg = "Decent, but we need more alignment with the stage directions.";
        else feedbackMsg = "Cut! That wasn't quite what we're looking for.";
        
        const hints = [];
        if (paceDiff > 20) hints.push(pace > scene.targetPace ? "too fast" : "too slow");
        if (toneDiff > 20) hints.push(tone > scene.targetTone ? "too loud/aggressive" : "too soft");
        if (subtextDiff > 20) hints.push(subtext > scene.targetSubtext ? "too hidden/complex" : "too literal/straightforward");

        if (hints.length > 0) {
          feedbackMsg += `\n\nNotes from the Director:\nThe performance was ${hints.join(', ')}.`;
        } else if (finalScore < 95) {
          feedbackMsg += `\n\nNotes from the Director:\nAlmost there, just needs minor adjustments.`;
        }

        setFeedback(feedbackMsg);
        setPhase('results');
        setWaveform(Array(24).fill(5));
      }
    };
    
    animRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const nextTake = () => {
    setTakeNum(t => t + 1);
    setPhase('setup');
  };
  
  const nextScene = () => {
    setSceneIndex(i => (i + 1) % SCENES.length);
    setTakeNum(1);
    setPace(50);
    setTone(50);
    setSubtext(50);
    setPhase('setup');
  };

  const getWaveformColor = (h: number) => {
    if (h > 70) return '#ef4444'; // Red
    if (h > 45) return '#facc15'; // Yellow
    return '#4ade80'; // Green
  };

  return (
    <div className="game-wrapper">
      <div className="clapperboard">
        <div className="sticks-container">
          <div className={`stick top ${phase === 'setup' ? 'open' : 'action'}`}></div>
          <div className="stick bottom"></div>
        </div>
        
        <div className="board">
          <div className="header">
            <div className="header-item">
              <span className="header-label">PROD</span>
              <span>PIXELS TO PERFORMANCE</span>
            </div>
            <div className="header-item">
              <span className="header-label">SCENE</span>
              <span>{scene.id}</span>
            </div>
            <div className="header-item">
              <span className="header-label">TAKE</span>
              <span>{takeNum}</span>
            </div>
          </div>
          
          {phase === 'setup' && (
            <>
              <div className="script-area">
                <div className="direction">{scene.direction}</div>
                <div className="line">"{scene.line}"</div>
              </div>
              
              <div className="controls">
                <div className="slider-row">
                  <div className="slider-label-group">
                    <span className="slider-label">Pace</span>
                    <span className="slider-subtext">Slow ↔ Fast</span>
                  </div>
                  <input type="range" min="0" max="100" value={pace} onChange={e => setPace(Number(e.target.value))} className="slider-input" />
                  <span className="slider-value">{pace}</span>
                </div>
                <div className="slider-row">
                  <div className="slider-label-group">
                    <span className="slider-label">Tone</span>
                    <span className="slider-subtext">Soft ↔ Aggressive</span>
                  </div>
                  <input type="range" min="0" max="100" value={tone} onChange={e => setTone(Number(e.target.value))} className="slider-input" />
                  <span className="slider-value">{tone}</span>
                </div>
                <div className="slider-row">
                  <div className="slider-label-group">
                    <span className="slider-label">Subtext</span>
                    <span className="slider-subtext">Literal ↔ Hidden</span>
                  </div>
                  <input type="range" min="0" max="100" value={subtext} onChange={e => setSubtext(Number(e.target.value))} className="slider-input" />
                  <span className="slider-value">{subtext}</span>
                </div>
                
                <button className="action-btn" onClick={handleAction}>Action!</button>
              </div>
            </>
          )}
          
          {(phase === 'action' || phase === 'results') && (
            <div className="performance-area">
              <div 
                className="character" 
                style={{ 
                  transform: phase === 'action' 
                    ? `translate(${(Math.random() - 0.5) * faceConfig.shake}px, ${(Math.random() - 0.5) * faceConfig.shake}px) rotate(${(Math.random() - 0.5) * faceConfig.shake}deg)` 
                    : 'none'
                }}
              >
                <div className="eyes">
                  <div className="eye" style={{ transform: `scaleY(${faceConfig.eyeScale})` }}></div>
                  <div className="eye" style={{ transform: `scaleY(${faceConfig.eyeScale})` }}></div>
                </div>
                <div className="mouth" style={{ 
                  height: phase === 'action' ? `${Math.max(4, Math.random() * faceConfig.mouthHeight + 2)}px` : '6px',
                  width: `${faceConfig.mouthWidth}px`,
                  borderRadius: `${faceConfig.mouthRadius}px`
                }}></div>
              </div>
              
              <div className="waveform">
                {waveform.map((h, i) => (
                  <div 
                    key={i} 
                    className="bar" 
                    style={{ 
                      height: `${Math.min(90, Math.max(4, h))}px`, 
                      background: getWaveformColor(h),
                      boxShadow: `0 0 10px ${getWaveformColor(h)}80`
                    }}
                  ></div>
                ))}
              </div>
              
              {phase === 'results' && (
                <div className="results-overlay">
                  <div className="score-label">Match Score</div>
                  <div className="score-display">{score}%</div>
                  <div className="feedback-text">{feedback}</div>
                  <div className="btn-group">
                    <button className="secondary-btn" onClick={nextTake}>Another Take</button>
                    <button className="secondary-btn primary" onClick={nextScene}>Next Scene</button>
                  </div>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
