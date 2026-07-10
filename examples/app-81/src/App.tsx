import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const ERAS = [
  { 
    name: 'Burnout Era',
    year: '2000s',
    bgTop: '#f97316', bgBottom: '#7c2d12', road: '#292524', roadLine: '#fff',
    carColor: '#facc15', carShape: 'boxy', 
    badgeText: 'Burnout 3',
    speed: 800
  },
  { 
    name: 'NFS Era',
    year: '2010s',
    bgTop: '#020617', bgBottom: '#1e3a8a', road: '#0f172a', roadLine: '#fbbf24',
    carColor: '#e11d48', carShape: 'sleek', 
    badgeText: 'Hot Pursuit',
    speed: 1000
  },
  { 
    name: 'Open World Era',
    year: 'Mid 2010s',
    bgTop: '#38bdf8', bgBottom: '#86efac', road: '#57534e', roadLine: '#fff',
    carColor: '#a3e635', carShape: 'exotic', 
    badgeText: 'Most Wanted',
    speed: 1200
  },
  { 
    name: 'Battlefield Era',
    year: '2020s',
    bgTop: '#3f3f46', bgBottom: '#1c1917', road: '#1c1917', roadLine: '#57534e',
    carColor: '#4d7c0f', carShape: 'jeep', 
    badgeText: 'Battlefield 6',
    speed: 1400
  },
  { 
    name: 'Future of Criterion',
    year: '2026',
    bgTop: '#0f172a', bgBottom: '#4c1d95', road: '#000', roadLine: '#22d3ee',
    carColor: '#22d3ee', carShape: 'hover', 
    badgeText: 'Next Gen',
    speed: 2000
  }
];

const ERA_DURATION = 5000; // units of distance per era

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [eraIndex, setEraIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const gameState = useRef({
    carY: 300,
    carVY: 0,
    keys: { up: false, down: false },
    badges: [] as any[],
    particles: [] as any[],
    speedLines: [] as any[],
    distance: 0,
    score: 0,
    era: 0,
    lastTime: 0,
    isGameOver: false,
    particlesConfig: { nextSpawn: 0 }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') gameState.current.keys.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') gameState.current.keys.down = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') gameState.current.keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') gameState.current.keys.down = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let reqId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    gameState.current.lastTime = performance.now();

    const drawCar = (x: number, y: number, eraConfig: any) => {
      ctx.save();
      ctx.translate(x, y);

      // shadow
      if (eraConfig.carShape === 'hover') {
        ctx.shadowColor = eraConfig.carColor;
        ctx.shadowBlur = 30;
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 15;
      }

      ctx.fillStyle = eraConfig.carColor;

      if (eraConfig.carShape === 'boxy') {
        ctx.fillRect(-40, -15, 80, 30);
        ctx.fillStyle = '#111'; // wheels
        ctx.fillRect(-30, 10, 16, 8);
        ctx.fillRect(14, 10, 16, 8);
        ctx.fillStyle = '#93c5fd'; // window
        ctx.fillRect(-10, -10, 30, 12);
      } 
      else if (eraConfig.carShape === 'sleek') {
        ctx.beginPath();
        ctx.moveTo(-40, -5);
        ctx.lineTo(-20, -15);
        ctx.lineTo(10, -15);
        ctx.lineTo(45, 5);
        ctx.lineTo(40, 15);
        ctx.lineTo(-40, 15);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(-25, 10, 15, 8);
        ctx.fillRect(15, 10, 15, 8);
      }
      else if (eraConfig.carShape === 'exotic') {
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.quadraticCurveTo(-20, -25, 10, -15);
        ctx.lineTo(45, 5);
        ctx.lineTo(45, 15);
        ctx.lineTo(-40, 15);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(-25, 10, 16, 8);
        ctx.fillRect(18, 10, 16, 8);
      }
      else if (eraConfig.carShape === 'jeep') {
        ctx.fillRect(-35, -25, 70, 40);
        ctx.fillStyle = '#111';
        ctx.fillRect(-25, 10, 18, 12);
        ctx.fillRect(10, 10, 18, 12);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(-5, -20, 25, 15);
      }
      else if (eraConfig.carShape === 'hover') {
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo(-20, -12);
        ctx.lineTo(20, -12);
        ctx.lineTo(50, 5);
        ctx.lineTo(40, 15);
        ctx.lineTo(-30, 15);
        ctx.fill();
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fff';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(-20, 14, 50, 4);
      }
      ctx.restore();
    };

    const loop = (time: number) => {
      if (gameState.current.isGameOver) return;
      
      const dt = Math.min((time - gameState.current.lastTime) / 1000, 0.1);
      gameState.current.lastTime = time;

      const state = gameState.current;
      const currentEra = ERAS[state.era];
      const speed = currentEra.speed;

      // Update Car physics
      if (state.keys.up) state.carVY -= 2500 * dt;
      else if (state.keys.down) state.carVY += 2500 * dt;
      else state.carVY *= 0.85;

      state.carY += state.carVY * dt;
      const roadTop = canvas.height * 0.4;
      const roadBottom = canvas.height - 50;
      
      if (state.carY < roadTop) { state.carY = roadTop; state.carVY = 0; }
      if (state.carY > roadBottom) { state.carY = roadBottom; state.carVY = 0; }

      // Progress era
      state.distance += speed * dt;
      const newEraIdx = Math.min(Math.floor(state.distance / ERA_DURATION), ERAS.length - 1);
      if (newEraIdx !== state.era) {
        state.era = newEraIdx;
        setEraIndex(newEraIdx);
      }
      
      const totalDist = ERAS.length * ERA_DURATION;
      setProgress((state.distance / totalDist) * 100);

      if (state.distance >= totalDist) {
        state.isGameOver = true;
        setGameOver(true);
      }

      // Spawns
      if (Math.random() < 0.02) {
        state.badges.push({
          x: canvas.width + 50,
          y: roadTop + 20 + Math.random() * (roadBottom - roadTop - 40),
          text: currentEra.badgeText,
          collected: false,
          w: 40, h: 40
        });
      }

      if (Math.random() < 0.2) {
        state.speedLines.push({
          x: canvas.width + Math.random() * 200,
          y: Math.random() * canvas.height,
          length: 50 + Math.random() * 200,
          speedMult: 1 + Math.random() * 0.5,
          color: Math.random() > 0.5 ? 'rgba(255,255,255,0.3)' : currentEra.carColor
        });
      }

      // Update & Render
      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, currentEra.bgTop);
      grad.addColorStop(0.4, currentEra.bgBottom);
      grad.addColorStop(0.4, currentEra.road);
      grad.addColorStop(1, '#000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road Lines
      ctx.strokeStyle = currentEra.roadLine;
      ctx.lineWidth = 4;
      ctx.setLineDash([40, 40]);
      ctx.lineDashOffset = -state.distance % 80;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.7);
      ctx.lineTo(canvas.width, canvas.height * 0.7);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speed lines
      for (let i = state.speedLines.length - 1; i >= 0; i--) {
        const line = state.speedLines[i];
        line.x -= speed * line.speedMult * dt;
        ctx.fillStyle = line.color;
        ctx.fillRect(line.x, line.y, line.length, 2);
        if (line.x + line.length < 0) state.speedLines.splice(i, 1);
      }

      // Badges
      const carRect = { x: 100 - 40, y: state.carY - 15, w: 80, h: 30 };
      
      for (let i = state.badges.length - 1; i >= 0; i--) {
        const b = state.badges[i];
        b.x -= speed * dt;
        
        if (!b.collected) {
           const bRect = { x: b.x - b.w/2, y: b.y - b.h/2, w: b.w, h: b.h };
           // collision
           if (carRect.x < bRect.x + bRect.w &&
               carRect.x + carRect.w > bRect.x &&
               carRect.y < bRect.y + bRect.h &&
               carRect.h + carRect.y > bRect.y) {
               
               b.collected = true;
               state.score += 100;
               setScore(state.score);
               
               // spawn collection particles
               for(let p=0; p<15; p++){
                 state.particles.push({
                   x: b.x, y: b.y,
                   vx: (Math.random()-0.5)*500,
                   vy: (Math.random()-0.5)*500,
                   life: 1,
                   color: '#fbbf24'
                 });
               }
           }
        }

        if (!b.collected) {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(time / 400);
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#f59e0b';
          
          // Hexagon
          ctx.beginPath();
          for (let j=0; j<6; j++) {
            const angle = j * Math.PI / 3;
            const hx = Math.cos(angle) * 20;
            const hy = Math.sin(angle) * 20;
            if (j===0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
          
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('CRIT', 0, 0);
          ctx.restore();
        }

        if (b.x < -100) state.badges.splice(i, 1);
      }

      // Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 2;
        
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1;

        if (p.life <= 0) state.particles.splice(i, 1);
      }

      // Draw Car
      drawCar(100, state.carY, currentEra);

      reqId = requestAnimationFrame(loop);
    };

    reqId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', resize);
    };
  }, [started, gameOver]);

  return (
    <div className={`game-container speed-blur-${eraIndex}`}>
      <canvas ref={canvasRef} />
      
      {!started && !gameOver && (
        <div className="start-screen">
          <h1>Criterion Legacy</h1>
          <p>
            Embark on a 30-year evolution of arcade racing. <br/>
            Drive through the Burnout era, NFS era, Open World, Battlefield, and into the Future. <br/>
            Use <b>UP / DOWN</b> arrows to steer. Collect Milestone Badges to build your Legacy Score!
          </p>
          <button className="btn" onClick={() => setStarted(true)}>Start Engine</button>
        </div>
      )}

      {gameOver && (
        <div className="end-screen">
          <h1>Legacy Complete</h1>
          <h2 style={{color: '#fbbf24', fontSize: '36px', marginBottom: '30px'}}>Final Score: {score}</h2>
          <button className="btn" onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}

      {started && !gameOver && (
        <div className="overlay">
          <div className="top-bar">
            <div className="era-banner">
              <h1>{ERAS[eraIndex].name}</h1>
              <p>ERA: {ERAS[eraIndex].year}</p>
            </div>
            
            <div className="score-board">
              <h2>{score}</h2>
              <p>Legacy Score</p>
            </div>
          </div>
          
          <div className="timeline">
             <div className="timeline-progress" style={{width: `${Math.min(100, progress)}%`}}></div>
          </div>
          
          <div className="controls-hint">
             [W / S] or [UP / DOWN] to Steer
          </div>
        </div>
      )}
    </div>
  );
}
