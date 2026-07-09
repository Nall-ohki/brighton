import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import './App.css';

export default function App() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  const [currentElement, setCurrentElement] = useState<'Earth' | 'Water' | 'Fire' | 'Air'>('Earth');
  const [activeRules, setActiveRules] = useState<string[]>(['Basic Elements']);
  const [titleUpdateCount, setTitleUpdateCount] = useState(0);

  useEffect(() => {
    if (!sceneRef.current) return;

    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          MouseConstraint = Matter.MouseConstraint,
          Mouse = Matter.Mouse,
          Composite = Matter.Composite,
          Bodies = Matter.Bodies,
          Events = Matter.Events,
          Body = Matter.Body;

    const engine = Engine.create();
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: 'transparent',
      }
    });
    renderRef.current = render;

    const ground = Bodies.rectangle(400, 590, 810, 60, { isStatic: true, render: { fillStyle: '#8fa382' }, label: 'Ground' });
    const leftWall = Bodies.rectangle(10, 300, 60, 600, { isStatic: true, render: { fillStyle: '#8fa382' }, label: 'Wall' });
    const rightWall = Bodies.rectangle(790, 300, 60, 600, { isStatic: true, render: { fillStyle: '#8fa382' }, label: 'Wall' });
    
    Composite.add(engine.world, [ground, leftWall, rightWall]);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    Events.on(mouseConstraint, 'mousedown', (event) => {
      if (mouseConstraint.body) return; // Dragging
      
      const pos = event.mouse.position;
      // Snap to grid for placement
      const gridSize = 40;
      const snapX = Math.round(pos.x / gridSize) * gridSize;
      const snapY = Math.round(pos.y / gridSize) * gridSize;
      
      const elementState = (window as any).currentElementSelection;
      
      let body;
      switch(elementState) {
        case 'Water':
          body = Bodies.circle(snapX, snapY, 18, { 
            restitution: 0.1, 
            friction: 0.05,
            density: 1,
            render: { fillStyle: '#a1c4fd' },
            label: 'Water'
          });
          break;
        case 'Fire':
          body = Bodies.rectangle(snapX, snapY, 36, 36, { 
            restitution: 0.2,
            friction: 0.8,
            density: 0.1,
            render: { fillStyle: '#ffb7b2' },
            label: 'Fire'
          });
          break;
        case 'Air':
          body = Bodies.rectangle(snapX, snapY, 36, 36, { 
            restitution: 0.8,
            friction: 0.1,
            density: 0.05,
            render: { fillStyle: '#e0c3fc', opacity: 0.8 },
            label: 'Air'
          });
          break;
        case 'Earth':
        default:
          body = Bodies.rectangle(snapX, snapY, 36, 36, { 
            restitution: 0.1,
            friction: 0.9,
            density: 2,
            render: { fillStyle: '#dcedc1' },
            label: 'Earth'
          });
          break;
      }
      
      if(body) {
        Composite.add(engine.world, body);
      }
    });

    // Interaction loop
    Events.on(engine, 'beforeUpdate', () => {
        const bodies = Composite.allBodies(engine.world);
        const rules = (window as any).currentRules || [];
        
        bodies.forEach(body => {
            // Air blows things up
            if (body.label === 'Air') {
                Body.applyForce(body, body.position, {x: (Math.random() - 0.5) * 0.005, y: -0.003});
                
                // Blow nearby objects
                bodies.forEach(other => {
                    if (other !== body && !other.isStatic) {
                        const dist = Matter.Vector.magnitude(Matter.Vector.sub(body.position, other.position));
                        if (dist < 80) {
                            Body.applyForce(other, other.position, {x: (other.position.x - body.position.x) * 0.0001, y: -0.001});
                        }
                    }
                });
            }
            
            // Earth crumbles under pressure (high velocity impact)
            if (body.label === 'Earth' && body.speed > 10) {
                 Matter.Composite.remove(engine.world, body);
            }
            
            // Water flows (fake by pushing sideways slightly if velocity is low but it's not on ground?)
            // Actually low friction makes it flow downhill naturally
        });
    });

    Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      const rules = (window as any).currentRules || [];
      
      for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;
        const labels = [bodyA.label, bodyB.label];
        
        // Fire spreads to Earth
        if (labels.includes('Fire') && labels.includes('Earth')) {
            const earth = bodyA.label === 'Earth' ? bodyA : bodyB;
            if (Math.random() > 0.5) {
                earth.label = 'Fire';
                earth.render.fillStyle = '#ffb7b2';
            }
        }
        
        // Fire + Water = Steam (Air)
        if (labels.includes('Water') && labels.includes('Fire')) {
            const fire = bodyA.label === 'Fire' ? bodyA : bodyB;
            const water = bodyA.label === 'Water' ? bodyA : bodyB;
            Matter.Composite.remove(engine.world, [fire, water]);
            const steam = Bodies.rectangle(fire.position.x, fire.position.y - 20, 36, 36, {
                restitution: 0.8, friction: 0.1, density: 0.05, render: { fillStyle: '#e0c3fc', opacity: 0.8 }, label: 'Air'
            });
            Matter.Composite.add(engine.world, steam);
        }
        
        // Title Update: Ice (Water + Cold/Air)
        if (rules.includes('Ice Physics') && labels.includes('Water') && labels.includes('Air')) {
             const water = bodyA.label === 'Water' ? bodyA : bodyB;
             water.label = 'Ice';
             water.render.fillStyle = '#caf0f8';
             Matter.Body.setDensity(water, 1.5);
             Matter.Body.setFriction(water, 0.01);
        }
        
        // Title Update: Obsidian (Water + Lava)
        if (rules.includes('Obsidian Mode') && labels.includes('Water') && labels.includes('Fire')) {
            // Overrides steam occasionally
            if(Math.random() > 0.5) {
                const water = bodyA.label === 'Water' ? bodyA : bodyB;
                water.label = 'Obsidian';
                water.render.fillStyle = '#2d3436';
                Matter.Body.setDensity(water, 5);
                Matter.Body.setStatic(water, true);
            }
        }
      }
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (engineRef.current) Engine.clear(engineRef.current);
      render.canvas.remove();
    };
  }, []);

  useEffect(() => {
    (window as any).currentElementSelection = currentElement;
  }, [currentElement]);
  
  useEffect(() => {
    (window as any).currentRules = activeRules;
  }, [activeRules]);

  const handleTitleUpdate = () => {
      const possibleRules = ['Ice Physics', 'Obsidian Mode', 'Anti-Gravity Winds', 'Volcanic Earth'];
      const availableRules = possibleRules.filter(r => !activeRules.includes(r));
      
      if(availableRules.length > 0) {
          const newRule = availableRules[Math.floor(Math.random() * availableRules.length)];
          setActiveRules([...activeRules, newRule]);
          setTitleUpdateCount(c => c + 1);
          
          if(newRule === 'Anti-Gravity Winds' && engineRef.current) {
              engineRef.current.world.gravity.y = -0.1;
          }
      }
  };

  const clearWorld = () => {
      if(engineRef.current) {
          const bodies = Matter.Composite.allBodies(engineRef.current.world);
          const dynamicBodies = bodies.filter(b => !b.isStatic && b.label !== 'Mouse Constraint');
          Matter.Composite.remove(engineRef.current.world, dynamicBodies);
      }
  };

  return (
    <div className="sandbox-container">
      <div className="header">
        <h1>Reforj: Elements Engine <span className="version">v{titleUpdateCount}.0</span></h1>
        <p className="subtitle">Place blocks to see physical interactions. Fire spreads, water flows, earth crumbles.</p>
      </div>
      
      <div className="toolbar">
        <div className="element-selector">
          {(['Earth', 'Water', 'Fire', 'Air'] as const).map(el => (
            <button 
              key={el}
              className={`btn element-btn ${currentElement === el ? 'active' : ''} el-${el.toLowerCase()}`}
              onClick={() => setCurrentElement(el)}
            >
              {el}
            </button>
          ))}
        </div>
        
        <div className="controls">
           <button className="btn btn-danger" onClick={clearWorld}>Clear</button>
           <button className="btn btn-update" onClick={handleTitleUpdate}>🚀 Title Update!</button>
        </div>
      </div>

      <div className="rules-panel">
         <strong>Active Engine Rules:</strong> {activeRules.join(' | ')}
      </div>

      <div className="canvas-wrapper">
        <div className="grid-bg"></div>
        <div ref={sceneRef} className="scene-container" />
      </div>
    </div>
  );
}
