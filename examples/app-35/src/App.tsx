import { useEffect, useRef } from "react";
import Matter from "matter-js";

export default function App() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // module aliases
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies;

    // create engine
    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    // create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "#1e1e2f",
      }
    });

    Render.run(render);

    // create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // add boundaries
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth, 50, { isStatic: true });
    const wallLeft = Bodies.rectangle(-25, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true });
    const wallRight = Bodies.rectangle(window.innerWidth + 25, window.innerHeight / 2, 50, window.innerHeight, { isStatic: true });
    
    Composite.add(world, [ground, wallLeft, wallRight]);

    // add whimsical bouncy elements representing the text
    const phrases = [
      "4J Studios", "Community", "Innovation", "Players", "Trusted Partner",
      "Minecraft", "Reforjing", "Fun", "Bouncy"
    ];

    const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#1a535c", "#ff9f1c"];

    const bodies: Matter.Body[] = [];
    
    for (let i = 0; i < 20; i++) {
      const isCircle = Math.random() > 0.5;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * (window.innerHeight / 2);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      let body: Matter.Body;
      if (isCircle) {
        body = Bodies.circle(x, y, 30 + Math.random() * 20, {
          restitution: 0.9,
          render: { fillStyle: color }
        });
      } else {
        body = Bodies.rectangle(x, y, 60 + Math.random() * 40, 40 + Math.random() * 20, {
          restitution: 0.8,
          chamfer: { radius: 10 },
          render: { fillStyle: color }
        });
      }
      bodies.push(body);
    }
    
    Composite.add(world, bodies);

    // add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // fit render to window
    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 25 });
      Matter.Body.setPosition(wallRight, { x: window.innerWidth + 25, y: window.innerHeight / 2 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null as any;
      render.context = null as any;
      render.textures = {};
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <div 
        style={{ 
          position: "absolute", 
          top: "40px", 
          left: "0", 
          width: "100%", 
          textAlign: "center", 
          color: "white", 
          fontFamily: "sans-serif",
          pointerEvents: "none",
          zIndex: 10
        }}
      >
        <h1 style={{ fontSize: "2.5rem", margin: "0 0 10px 0", fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Powered by Players: Reforjing 4J Studios</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "800px", margin: "0 auto", lineHeight: "1.5", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
          From its roots as a trusted development partner to becoming a studio defined by innovation and community-first thinking, 4J Studios has been shaped—at every stage—by players.
        </p>
        <p style={{ marginTop: "20px", opacity: 0.7 }}>Toss the blocks around with your mouse!</p>
      </div>
      <div ref={sceneRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

