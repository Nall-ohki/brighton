import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import './App.css';

type GameState = 'balanced' | 'process' | 'creative';

// Helpers to generate indie sticker art SVGs as Data URLs
const createSvgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;

const processBoulderSvg = (lines: string[]) => createSvgUrl(`
  <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <filter id="shadow">
      <feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#000" flood-opacity="0.4"/>
    </filter>
    <path d="M 20 20 L 70 10 L 100 40 L 90 90 L 30 100 L 10 70 Z" fill="#6c757d" stroke="white" stroke-width="6" filter="url(#shadow)"/>
    <text x="55" y="${lines.length === 1 ? 60 : 45}" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Courier New, monospace" font-weight="bold" font-size="14">
      ${lines.map((l, i) => `<tspan x="55" dy="${i === 0 ? 0 : 20}">${l}</tspan>`).join('')}
    </text>
  </svg>
`);

const creativeSparkSvg = (lines: string[]) => createSvgUrl(`
  <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <filter id="shadow">
      <feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <path d="M 60 15 C 30 15, 20 40, 30 65 C 35 75, 45 85, 50 100 L 70 100 C 75 85, 85 75, 90 65 C 100 40, 90 15, 60 15 Z" fill="#ffd166" stroke="white" stroke-width="6" filter="url(#shadow)"/>
    <rect x="45" y="100" width="30" height="10" fill="#adb5bd" stroke="white" stroke-width="4" />
    <text x="60" y="${lines.length === 1 ? 60 : 50}" dominant-baseline="middle" text-anchor="middle" fill="#d90429" font-family="Comic Sans MS, cursive" font-weight="bold" font-size="14">
      ${lines.map((l, i) => `<tspan x="60" dy="${i === 0 ? 0 : 20}">${l}</tspan>`).join('')}
    </text>
  </svg>
`);

const beamSvg = (w: number, h: number) => createSvgUrl(`
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <filter id="shadow">
      <feDropShadow dx="0" dy="5" stdDeviation="0" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="15" fill="#d4a373" stroke="white" stroke-width="6" filter="url(#shadow)"/>
    <line x1="20" y1="${h/2}" x2="${w-20}" y2="${h/2}" stroke="#faedcd" stroke-width="4" stroke-dasharray="15,10"/>
  </svg>
`);

const fulcrumSvg = () => createSvgUrl(`
  <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <filter id="shadow">
      <feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <polygon points="60,20 100,100 20,100" fill="#a3b18a" stroke="white" stroke-width="6" filter="url(#shadow)"/>
    <circle cx="60" cy="80" r="8" fill="white" />
  </svg>
`);

const shelfSvg = (w: number, h: number, title: string) => createSvgUrl(`
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="20" width="${w}" height="${h-20}" rx="10" fill="#495057" stroke="white" stroke-width="4"/>
    <text x="${w/2}" y="15" dominant-baseline="auto" text-anchor="middle" fill="#212529" font-family="Courier New, monospace" font-weight="bold" font-size="16">${title}</text>
  </svg>
`);

const App: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const [gameState, setGameState] = useState<GameState>('balanced');

  useEffect(() => {
    if (!sceneRef.current) return;

    const engine = Matter.Engine.create();
    engineRef.current = engine;
    
    // Give gravity a bit more pull so items feel chunky
    engine.gravity.y = 1.5;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: w,
        height: h,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });
    renderRef.current = render;

    const { World, Bodies, Constraint, Mouse, MouseConstraint, Composite } = Matter;

    // Walls and Ground
    const ground = Bodies.rectangle(w / 2, h + 50, w + 100, 100, { isStatic: true, render: { visible: false } });
    const wallLeft = Bodies.rectangle(-50, h / 2, 100, h, { isStatic: true, render: { visible: false } });
    const wallRight = Bodies.rectangle(w + 50, h / 2, 100, h, { isStatic: true, render: { visible: false } });

    // Beam and Fulcrum
    const beamW = Math.min(w * 0.7, 700);
    const beamH = 40;
    const centerY = h - 180;

    const fulcrum = Bodies.polygon(w / 2, centerY + 50, 3, 60, { 
      isStatic: true,
      render: {
        sprite: { texture: fulcrumSvg(), xScale: 1, yScale: 1, xOffset: 0.5, yOffset: 0.5 }
      }
    });
    Matter.Body.setAngle(fulcrum, -Math.PI / 2); // point up

    const beam = Bodies.rectangle(w / 2, centerY, beamW, beamH, {
      friction: 0.8,
      restitution: 0.2,
      density: 0.05,
      render: {
        sprite: { texture: beamSvg(beamW, beamH), xScale: 1, yScale: 1 }
      }
    });

    const pivot = Constraint.create({
      bodyA: beam,
      pointA: { x: 0, y: -beamH / 2 }, // suspend slightly above center of mass for pendulum stability
      pointB: { x: w / 2, y: centerY - beamH / 2 },
      stiffness: 1,
      length: 0,
      render: { visible: false }
    });

    // Shelves
    const shelfW = 200;
    const shelfH = 50;
    const shelfLeft = Bodies.rectangle(w * 0.15, centerY - 150, shelfW, shelfH, { 
      isStatic: true, 
      render: { sprite: { texture: shelfSvg(shelfW, shelfH, "PROCESS BIN"), xScale: 1, yScale: 1 } }
    });
    const shelfRight = Bodies.rectangle(w * 0.85, centerY - 150, shelfW, shelfH, { 
      isStatic: true, 
      render: { sprite: { texture: shelfSvg(shelfW, shelfH, "CREATIVE BIN"), xScale: 1, yScale: 1 } }
    });

    World.add(engine.world, [ground, wallLeft, wallRight, fulcrum, beam, pivot, shelfLeft, shelfRight]);

    // Add Items
    const processItems = [
      ["Sprint", "Planning"], ["Jira", "Board"], ["QA", "Gate"], ["Daily", "Standup"], ["Code", "Review"]
    ];
    const creativeItems = [
      ["Wild", "Idea"], ["Game", "Jam"], ["Cool", "Anim"], ["Secret", "Lore"], ["Easter", "Egg"]
    ];

    const items: Matter.Body[] = [];

    processItems.forEach((lines, i) => {
      const boulder = Bodies.circle(w * 0.15 + (Math.random() * 40 - 20), centerY - 250 - i * 80, 45, {
        restitution: 0.2,
        friction: 0.8,
        density: 0.01,
        render: {
          sprite: { texture: processBoulderSvg(lines) }
        }
      });
      items.push(boulder);
    });

    creativeItems.forEach((lines, i) => {
      const spark = Bodies.circle(w * 0.85 + (Math.random() * 40 - 20), centerY - 250 - i * 80, 45, {
        restitution: 0.4,
        friction: 0.6,
        density: 0.01,
        render: {
          sprite: { texture: creativeSparkSvg(lines) }
        }
      });
      items.push(spark);
    });

    World.add(engine.world, items);

    // Mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Remove dragging items feeling heavy
    Matter.Events.on(mouseConstraint, 'startdrag', (e) => {
      e.body.isSensor = false;
    });

    Matter.Runner.run(engine);
    Matter.Render.run(render);

    // Game loop to check balance
    let animId: number;
    let lastState: GameState = 'balanced';
    
    const checkBalance = () => {
      const angle = beam.angle;
      let newState: GameState = 'balanced';
      
      // Consider it tipped if angle is beyond ~15 degrees (0.26 rad)
      if (angle < -0.25) {
        newState = 'process';
      } else if (angle > 0.25) {
        newState = 'creative';
      }

      if (newState !== lastState) {
        setGameState(newState);
        lastState = newState;
      }

      animId = requestAnimationFrame(checkBalance);
    };
    checkBalance();

    return () => {
      cancelAnimationFrame(animId);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas) {
        render.canvas.remove();
      }
    };
  }, []);

  return (
    <div className={`app-container ${gameState}`}>
      <div className="title-container">
        <h1>Balance the Project!</h1>
        <div className="subtitle">Drag items onto the beam. Don't tip it too far!</div>
      </div>

      {gameState === 'process' && (
        <div className="ui-message process">PROCESS DOMINATES... SO GRAY.</div>
      )}

      {gameState === 'creative' && (
        <>
          <div className="ui-message">CREATIVE CHAOS! EVERYTHING IS ON FIRE!</div>
          <div className="fire-layer">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                className="fire-particle" 
                style={{
                  left: `${Math.random() * 100}vw`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.8 + Math.random() * 1.5}s`
                }}
              >
                🔥
              </div>
            ))}
          </div>
        </>
      )}

      <div ref={sceneRef} className="scene" />
    </div>
  );
};

export default App;
