import React, { useState, useEffect } from 'react';
import './App.css';

type ShapeType = 'circle' | 'rect' | 'triangle' | 'diamond';
type FlawType = 'none' | 'lighting' | 'palette' | 'texture' | 'aliased';

interface SceneObject {
  id: string;
  shape: ShapeType;
  cx: number;
  cy: number;
  size: number;
  color: string;
  flaw: FlawType;
  flawedColor?: string;
}

const PALETTE = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'];

function mutateColor(hex: string, level: number) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  
  const mutation = Math.max(20, 100 - (level - 1) * 10);
  
  const signs = [
    Math.random() > 0.5 ? 1 : -1,
    Math.random() > 0.5 ? 1 : -1,
    Math.random() > 0.5 ? 1 : -1,
  ];
  
  r = Math.min(255, Math.max(0, r + signs[0] * mutation));
  g = Math.min(255, Math.max(0, g + signs[1] * mutation));
  b = Math.min(255, Math.max(0, b + signs[2] * mutation));
  
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

function generateLevel(level: number): SceneObject[] {
  const numObjects = Math.min(45, 8 + level * 4);
  const numFlaws = Math.min(15, 1 + Math.floor(level / 1.5));
  
  const objects: SceneObject[] = [];
  
  for (let i = 0; i < numObjects; i++) {
    let cx = 0, cy = 0, size = 0, attempts = 0;
    while (attempts < 50) {
      size = 20 + Math.random() * 30;
      cx = size/2 + 20 + Math.random() * (360 - size);
      cy = size/2 + 20 + Math.random() * (360 - size);
      
      const overlap = objects.some(obj => {
        const dx = obj.cx - cx;
        const dy = obj.cy - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        return dist < (obj.size + size) * 0.35; 
      });
      
      if (!overlap) break;
      attempts++;
    }
    
    objects.push({
      id: `obj-${i}`,
      shape: ['circle', 'rect', 'triangle', 'diamond'][Math.floor(Math.random() * 4)] as ShapeType,
      cx, cy, size,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      flaw: 'none'
    });
  }
  
  const flawTypes: FlawType[] = ['lighting', 'palette', 'texture', 'aliased'];
  let flawsAssigned = 0;
  while (flawsAssigned < numFlaws) {
    const obj = objects[Math.floor(Math.random() * objects.length)];
    if (obj.flaw === 'none') {
      obj.flaw = flawTypes[Math.floor(Math.random() * flawTypes.length)];
      if (obj.flaw === 'palette') {
        obj.flawedColor = mutateColor(obj.color, level);
      }
      flawsAssigned++;
    }
  }
  
  // Sort objects so flawed ones are drawn last (on top) for better clickability
  objects.sort((a, b) => (a.flaw === 'none' ? -1 : 1));
  
  return objects;
}

function renderShape(obj: SceneObject, props: any) {
  const { shape, cx, cy, size } = obj;
  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={size/2} {...props} />;
  }
  if (shape === 'rect') {
    return <rect x={cx - size/2} y={cy - size/2} width={size} height={size} rx={4} {...props} />;
  }
  if (shape === 'triangle') {
    return <polygon points={`${cx},${cy - size/2} ${cx + size/2},${cy + size/2} ${cx - size/2},${cy + size/2}`} {...props} />;
  }
  if (shape === 'diamond') {
    return <polygon points={`${cx},${cy - size/2} ${cx + size/2},${cy} ${cx},${cy + size/2} ${cx - size/2},${cy}`} {...props} />;
  }
  return null;
}

const Scene = ({ objects, type, onShapeClick, foundFlaws, penaltyShape }: any) => {
  return (
    <div className="scene-container">
      <div className="scene-title">{type === 'ref' ? 'REFERENCE (APPROVED)' : 'TEST (QA)'}</div>
      <svg className="scene-svg" viewBox="0 0 400 400">
        <defs>
          <filter id="drop-shadow">
            <feDropShadow dx="3" dy="5" stdDeviation="2" floodOpacity="0.4" />
          </filter>
          <filter id="aliased-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {PALETTE.map(c => (
            <pattern id={`bad-pattern-${c.replace('#', '')}`} width="6" height="6" patternUnits="userSpaceOnUse" key={c}>
              <rect width="6" height="6" fill={c} />
              <line x1="0" y1="0" x2="6" y2="6" stroke="rgba(0,0,0,0.6)" strokeWidth="2" />
            </pattern>
          ))}
        </defs>
        
        {objects.map((obj: SceneObject) => {
          let fill = obj.color;
          let filter = 'url(#drop-shadow)';

          if (type === 'test') {
            if (obj.flaw === 'palette') fill = obj.flawedColor!;
            if (obj.flaw === 'texture') fill = `url(#bad-pattern-${obj.color.replace('#', '')})`;
            if (obj.flaw === 'lighting') filter = 'none';
            if (obj.flaw === 'aliased') filter = 'url(#aliased-filter)';
          }

          const isFound = foundFlaws.includes(obj.id);
          const isPenalized = penaltyShape === obj.id;

          return (
            <g key={obj.id} onClick={() => onShapeClick(obj)} className="shape-group">
              {renderShape(obj, { fill, filter })}
              
              {isFound && (
                <>
                  <circle cx={obj.cx} cy={obj.cy} r={obj.size/2 + 10} fill="none" stroke="#2a9d8f" strokeWidth="3" strokeDasharray="4 4" />
                  <rect x={obj.cx - 30} y={obj.cy - obj.size/2 - 26} width="60" height="14" fill="#2a9d8f" rx="2" />
                  <text x={obj.cx} y={obj.cy - obj.size/2 - 16} fontSize="9" fill="#fff" textAnchor="middle" fontWeight="bold">
                    {obj.flaw.toUpperCase()}
                  </text>
                </>
              )}
              {isPenalized && (
                <circle cx={obj.cx} cy={obj.cy} r={obj.size/2 + 8} fill="none" stroke="#e76f51" strokeWidth="4" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default function App() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [foundFlaws, setFoundFlaws] = useState<string[]>([]);
  const [penaltyShape, setPenaltyShape] = useState<string | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying && !levelComplete) {
      setObjects(generateLevel(level));
      setFoundFlaws([]);
    }
  }, [level, isPlaying, levelComplete]);

  const numFlaws = objects.filter(o => o.flaw !== 'none').length;

  useEffect(() => {
    if (isPlaying && foundFlaws.length > 0 && foundFlaws.length === numFlaws) {
      setTimeout(() => setLevelComplete(true), 800);
    }
  }, [foundFlaws, numFlaws, isPlaying]);

  const handleShapeClick = (obj: SceneObject) => {
    if (!isPlaying || levelComplete) return;
    if (foundFlaws.includes(obj.id)) return;
    
    if (obj.flaw !== 'none') {
      setFoundFlaws(prev => [...prev, obj.id]);
      setScore(s => s + 100 * level);
    } else {
      setScore(s => Math.max(0, s - 50));
      setPenaltyShape(obj.id);
      setTimeout(() => setPenaltyShape(null), 400);
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setLevel(1);
    setScore(0);
    setLevelComplete(false);
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    setLevelComplete(false);
  };

  return (
    <div className="app-wrapper">
      <div className="clipboard">
        <div className="clip" />
        <div className="paper-content">
          <header className="header">
            <h1>Visual Quality Benchmark</h1>
            <p className="quote">"Quality is the best business plan." – John Lasseter</p>
          </header>

          <div className="stats">
            <div className="stat-box">LEVEL: {isPlaying ? level : '-'}</div>
            <div className="stat-box">FINESSE SCORE: {score}</div>
            <div className="stat-box">FLAWS FOUND: {isPlaying ? `${foundFlaws.length} / ${numFlaws}` : '-'}</div>
          </div>

          <div className="game-area">
            {!isPlaying && (
              <div className="overlay">
                <h2>Ready for Review?</h2>
                <p className="overlay-desc">
                  Identify visual defects (aliasing, flat lighting, off-palette, bad textures) by clicking the flawed objects.
                </p>
                <button className="action-button" onClick={startGame}>Start Audit</button>
              </div>
            )}
            
            {isPlaying && levelComplete && (
              <div className="overlay">
                <h2>Level {level} Approved!</h2>
                <p className="overlay-desc">All QA issues resolved. Ready for next sprint.</p>
                <button className="action-button" onClick={nextLevel}>Next Level</button>
              </div>
            )}

            <Scene 
              objects={objects} 
              type="ref" 
              onShapeClick={handleShapeClick} 
              foundFlaws={foundFlaws} 
              penaltyShape={penaltyShape} 
            />
            <Scene 
              objects={objects} 
              type="test" 
              onShapeClick={handleShapeClick} 
              foundFlaws={foundFlaws} 
              penaltyShape={penaltyShape} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
