import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

type BranchType = 'Seed' | 'Film' | 'TV' | 'Game';

interface StoryNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: BranchType;
  expanded: boolean;
}

interface StoryLink {
  id: string;
  source: string;
  target: string;
  type: BranchType;
  path: string;
}

const INIT_NODE: StoryNode = {
  id: 'seed-1',
  label: 'Core Concept',
  x: 0,
  y: 0,
  type: 'Seed',
  expanded: false,
};

export default function App() {
  const [nodes, setNodes] = useState<StoryNode[]>([INIT_NODE]);
  const [links, setLinks] = useState<StoryLink[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [menuTarget, setMenuTarget] = useState<string | null>(null);

  useEffect(() => {
    setTransform({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      scale: 1,
    });
  }, []);

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('button')) return;
    isDragging.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    lastPan.current = { x: e.clientX, y: e.clientY };
    setMenuTarget(null);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const svg = svgRef.current;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.0015;
      const delta = -e.deltaY * zoomSensitivity;
      setTransform((prev) => {
        let newScale = prev.scale * (1 + delta);
        newScale = Math.max(0.1, Math.min(newScale, 5));
        
        const rect = svg?.getBoundingClientRect();
        if (!rect) return prev;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
        const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
        
        return { x: newX, y: newY, scale: newScale };
      });
      setMenuTarget(null);
    };

    if (svg) {
      svg.addEventListener('wheel', handleWheel, { passive: false });
      return () => svg.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node || node.expanded) return;
    setMenuTarget(menuTarget === id ? null : id);
  };

  const generatePath = (sx: number, sy: number, tx: number, ty: number, type: BranchType) => {
    const dx = tx - sx;
    const dy = ty - sy;
    if (type === 'Film') {
      const mx = sx + dx / 2 + (Math.random() - 0.5) * 10;
      return `M ${sx} ${sy} Q ${mx} ${sy + dy / 2} ${tx} ${ty}`;
    } else if (type === 'TV') {
      const mx1 = sx + dx * 0.3 + (Math.random() - 0.5) * 40;
      const my1 = sy + dy * 0.3 + (Math.random() - 0.5) * 10;
      const mx2 = sx + dx * 0.7 + (Math.random() - 0.5) * 40;
      const my2 = sy + dy * 0.7 + (Math.random() - 0.5) * 10;
      return `M ${sx} ${sy} C ${mx1} ${my1}, ${mx2} ${my2}, ${tx} ${ty}`;
    } else {
      const c1x = sx + dx * 0.2 + (Math.random() - 0.5) * 80;
      const c1y = sy + dy * 0.4 + (Math.random() - 0.5) * 40;
      const c2x = sx + dx * 0.8 + (Math.random() - 0.5) * 80;
      const c2y = sy + dy * 0.6 + (Math.random() - 0.5) * 40;
      return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;
    }
  };

  const expandNode = (type: 'Film' | 'TV' | 'Game') => {
    if (!menuTarget) return;
    const sourceNode = nodes.find((n) => n.id === menuTarget);
    if (!sourceNode) return;

    const newNodes: StoryNode[] = [];
    const newLinks: StoryLink[] = [];

    if (type === 'Film') {
      const nx = sourceNode.x + (Math.random() - 0.5) * 40;
      const ny = sourceNode.y - 180;
      const id = Math.random().toString(36).substr(2, 9);
      newNodes.push({ id, label: 'Feature Film', x: nx, y: ny, type, expanded: false });
      newLinks.push({
        id: `l-${id}`,
        source: sourceNode.id,
        target: id,
        type,
        path: generatePath(sourceNode.x, sourceNode.y, nx, ny, type),
      });
    } else if (type === 'TV') {
      const nx = sourceNode.x + (Math.random() - 0.5) * 120;
      const ny = sourceNode.y - 140;
      const id = Math.random().toString(36).substr(2, 9);
      newNodes.push({ id, label: 'Episodic Series', x: nx, y: ny, type, expanded: false });
      newLinks.push({
        id: `l-${id}`,
        source: sourceNode.id,
        target: id,
        type,
        path: generatePath(sourceNode.x, sourceNode.y, nx, ny, type),
      });
    } else if (type === 'Game') {
      for (let i = 0; i < 3; i++) {
        const nx = sourceNode.x + (i - 1) * 120 + (Math.random() - 0.5) * 40;
        const ny = sourceNode.y + 150 + Math.random() * 50;
        const id = Math.random().toString(36).substr(2, 9);
        newNodes.push({ id, label: 'Player Choice', x: nx, y: ny, type, expanded: false });
        newLinks.push({
          id: `l-${id}`,
          source: sourceNode.id,
          target: id,
          type,
          path: generatePath(sourceNode.x, sourceNode.y, nx, ny, type),
        });
      }
    }

    setNodes((prev) =>
      prev.map((n) => (n.id === sourceNode.id ? { ...n, expanded: true } : n)).concat(newNodes)
    );
    setLinks((prev) => prev.concat(newLinks));
    setMenuTarget(null);
  };

  const renderNodeShape = (type: BranchType) => {
    switch (type) {
      case 'Seed':
        return <circle r={18} fill="#2a251f" filter="url(#ink-distortion)" />;
      case 'Film':
        return <rect x={-14} y={-20} width={28} height={40} fill="#2a251f" filter="url(#ink-distortion)" />;
      case 'TV':
        return <rect x={-20} y={-14} width={40} height={28} rx={6} fill="#2a251f" filter="url(#ink-distortion)" />;
      case 'Game':
        return (
          <polygon
            points="0,-18 18,0 0,18 -18,0"
            fill="#111"
            stroke="#00e5ff"
            strokeWidth={3}
            filter="url(#glow)"
          />
        );
    }
  };

  const activeNode = menuTarget ? nodes.find((n) => n.id === menuTarget) : null;
  const menuLeft = activeNode ? activeNode.x * transform.scale + transform.x : 0;
  const menuTop = activeNode ? activeNode.y * transform.scale + transform.y : 0;

  return (
    <div className="app-container">
      <svg
        ref={svgRef}
        className="canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <filter id="ink-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {links.map((link) => {
            const isGame = link.type === 'Game';
            return (
              <motion.path
                key={link.id}
                d={link.path}
                className={isGame ? 'glow-path' : `ink-path ${link.type.toLowerCase()}-path`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            );
          })}

          {nodes.map((node) => (
            <motion.g
              key={node.id}
              className="node-group"
              transform={`translate(${node.x}, ${node.y})`}
              onClick={(e: any) => handleNodeClick(e, node.id)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: 'spring', bounce: 0.5 }}
            >
              {renderNodeShape(node.type)}
              <text
                y={node.type === 'Film' ? 35 : 30}
                className={`node-text ${node.type === 'Game' ? 'glow-text' : ''}`}
                textAnchor="middle"
              >
                {node.label}
              </text>
            </motion.g>
          ))}
        </g>
      </svg>

      {activeNode && (
        <AnimatePresence>
          <motion.div
            className="menu-overlay"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ left: menuLeft, top: menuTop }}
          >
            <button className="menu-btn" onClick={() => expandNode('Film')}>
              Film
            </button>
            <button className="menu-btn" onClick={() => expandNode('TV')}>
              TV
            </button>
            <button className="menu-btn game" onClick={() => expandNode('Game')}>
              Game
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="hud">
        <h1>The Living Story-Tree</h1>
        <p>Click nodes to evolve the narrative.</p>
        <div className="legend">
          <div><span className="legend-icon film"></span> Linear Film (up)</div>
          <div><span className="legend-icon tv"></span> Episodic TV (up)</div>
          <div><span className="legend-icon game"></span> Interactive Game (down)</div>
        </div>
      </div>
    </div>
  );
}
