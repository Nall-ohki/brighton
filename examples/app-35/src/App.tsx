import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';
import './App.css'; // Reusing existing app.css or inline styles

const GRID_SIZE = 16;
const MAX_INSTANCES = GRID_SIZE * GRID_SIZE * GRID_SIZE;

// Element Types
const EMPTY = 0;
const DIRT = 1;
const SAND = 2;
const MAGMA = 3;
const WATER = 4;
const STEAM = 5;
const OBSIDIAN = 6;
const FLORA = 7;

const COLORS = {
  [DIRT]: new THREE.Color('#5c4033'),
  [SAND]: new THREE.Color('#e5c48b'),
  [MAGMA]: new THREE.Color('#ff5733'),
  [WATER]: new THREE.Color('#5cb8ff'),
  [STEAM]: new THREE.Color('#cccccc'),
  [OBSIDIAN]: new THREE.Color('#2b2b2c'),
  [FLORA]: new THREE.Color('#4caf50'),
};

function getIdx(x: number, y: number, z: number) {
  return x + y * GRID_SIZE + z * GRID_SIZE * GRID_SIZE;
}

function getXYZ(idx: number) {
  const x = idx % GRID_SIZE;
  const y = Math.floor(idx / GRID_SIZE) % GRID_SIZE;
  const z = Math.floor(idx / (GRID_SIZE * GRID_SIZE));
  return { x, y, z };
}

function VoxelEngine({ selectedElement, tickRate }: { selectedElement: number, tickRate: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Simulation State
  const gridRef = useRef<Uint8Array>(new Uint8Array(MAX_INSTANCES));
  const tickCounter = useRef(0);
  
  // Matrix for updating instances
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  
  // Initialize with some dirt floor
  useEffect(() => {
    const grid = gridRef.current;
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        grid[getIdx(x, 0, z)] = DIRT;
      }
    }
  }, []);

  useFrame((state, delta) => {
    tickCounter.current += delta;
    
    // Process tick
    if (tickCounter.current > (1 / tickRate)) {
      tickCounter.current = 0;
      
      const grid = gridRef.current;
      const nextGrid = new Uint8Array(grid);
      
      // Update rules from bottom up
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          for (let z = 0; z < GRID_SIZE; z++) {
            const idx = getIdx(x, y, z);
            const el = grid[idx];
            if (el === EMPTY) continue;
            
            const below = y > 0 ? getIdx(x, y - 1, z) : -1;
            const above = y < GRID_SIZE - 1 ? getIdx(x, y + 1, z) : -1;
            
            // Random horizontal direction
            const dx = Math.random() < 0.5 ? (Math.random() < 0.5 ? 1 : -1) : 0;
            const dz = dx === 0 ? (Math.random() < 0.5 ? 1 : -1) : 0;
            const hNeighborX = x + dx;
            const hNeighborZ = z + dz;
            const hasHNeighbor = hNeighborX >= 0 && hNeighborX < GRID_SIZE && hNeighborZ >= 0 && hNeighborZ < GRID_SIZE;
            const hIdx = hasHNeighbor ? getIdx(hNeighborX, y, hNeighborZ) : -1;
            const hBelowIdx = (hasHNeighbor && y > 0) ? getIdx(hNeighborX, y - 1, hNeighborZ) : -1;
            
            // Interaction Helpers
            const getAdjacent = (px: number, py: number, pz: number) => {
              const adj = [];
              if (px > 0) adj.push(getIdx(px - 1, py, pz));
              if (px < GRID_SIZE - 1) adj.push(getIdx(px + 1, py, pz));
              if (pz > 0) adj.push(getIdx(px, py, pz - 1));
              if (pz < GRID_SIZE - 1) adj.push(getIdx(px, py, pz + 1));
              if (py > 0) adj.push(getIdx(px, py - 1, pz));
              if (py < GRID_SIZE - 1) adj.push(getIdx(px, py + 1, pz));
              return adj;
            };

            if (el === SAND) {
              if (below !== -1 && nextGrid[below] === EMPTY) {
                nextGrid[below] = SAND;
                nextGrid[idx] = EMPTY;
              } else if (below !== -1 && nextGrid[below] === WATER) {
                nextGrid[below] = SAND;
                nextGrid[idx] = WATER;
              } else if (hBelowIdx !== -1 && nextGrid[hBelowIdx] === EMPTY) {
                nextGrid[hBelowIdx] = SAND;
                nextGrid[idx] = EMPTY;
              }
            } 
            else if (el === WATER) {
              // Check magma collision
              let hitMagma = false;
              for (const adjIdx of getAdjacent(x, y, z)) {
                if (grid[adjIdx] === MAGMA) {
                  nextGrid[idx] = STEAM;
                  nextGrid[adjIdx] = OBSIDIAN;
                  hitMagma = true;
                }
              }
              
              if (!hitMagma) {
                if (below !== -1 && nextGrid[below] === EMPTY) {
                  nextGrid[below] = WATER;
                  nextGrid[idx] = EMPTY;
                } else if (hIdx !== -1 && nextGrid[hIdx] === EMPTY) {
                  nextGrid[hIdx] = WATER;
                  nextGrid[idx] = EMPTY;
                }
              }
            }
            else if (el === MAGMA) {
              // Check water collision
              let hitWater = false;
              for (const adjIdx of getAdjacent(x, y, z)) {
                if (grid[adjIdx] === WATER) {
                  nextGrid[idx] = OBSIDIAN;
                  nextGrid[adjIdx] = STEAM;
                  hitWater = true;
                }
              }
              
              if (!hitWater) {
                if (below !== -1 && nextGrid[below] === EMPTY) {
                  nextGrid[below] = MAGMA;
                  nextGrid[idx] = EMPTY;
                } else if (hIdx !== -1 && nextGrid[hIdx] === EMPTY && Math.random() < 0.3) {
                  nextGrid[hIdx] = MAGMA;
                  nextGrid[idx] = EMPTY;
                }
              }
            }
            else if (el === STEAM) {
              if (above !== -1 && nextGrid[above] === EMPTY) {
                nextGrid[above] = STEAM;
                nextGrid[idx] = EMPTY;
              } else if (hIdx !== -1 && nextGrid[hIdx] === EMPTY) {
                nextGrid[hIdx] = STEAM;
                nextGrid[idx] = EMPTY;
              }
              // Dissipate
              if (Math.random() < 0.05 || y === GRID_SIZE - 1) {
                nextGrid[idx] = EMPTY;
              }
            }
            else if (el === FLORA) {
              // Flora spreads to dirt if hydrated
              if (Math.random() < 0.05) {
                const adj = getAdjacent(x, y, z);
                // Check if any adjacent is dirt
                for (const aIdx of adj) {
                  if (grid[aIdx] === DIRT) {
                    // Check if this dirt is near water
                    const dirtAdj = getAdjacent(getXYZ(aIdx).x, getXYZ(aIdx).y, getXYZ(aIdx).z);
                    const isHydrated = dirtAdj.some(dIdx => grid[dIdx] === WATER);
                    if (isHydrated && nextGrid[aIdx] === DIRT) {
                      nextGrid[aIdx] = FLORA;
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      gridRef.current = nextGrid;
    }
    
    // Update InstancedMesh
    if (meshRef.current) {
      const grid = gridRef.current;
      let count = 0;
      for (let i = 0; i < MAX_INSTANCES; i++) {
        if (grid[i] !== EMPTY) {
          const { x, y, z } = getXYZ(i);
          tempMatrix.setPosition(x, y, z);
          meshRef.current.setMatrixAt(count, tempMatrix);
          meshRef.current.setColorAt(count, COLORS[grid[i] as keyof typeof COLORS]);
          count++;
        }
      }
      meshRef.current.count = count;
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    // Calculate placement coordinate
    if (e.intersections.length > 0) {
      const hit = e.intersections[0];
      const point = hit.point.clone();
      const normal = hit.face?.normal.clone() || new THREE.Vector3(0, 1, 0);
      
      // If placing, move 0.5 units along the normal. If erasing, move -0.5 units.
      if (selectedElement !== EMPTY) {
        point.add(normal.multiplyScalar(0.5));
      } else {
        point.add(normal.multiplyScalar(-0.5));
      }
      
      const px = Math.floor(point.x + 0.5);
      const py = Math.floor(point.y + 0.5);
      const pz = Math.floor(point.z + 0.5);
      
      if (px >= 0 && px < GRID_SIZE && py >= 0 && py < GRID_SIZE && pz >= 0 && pz < GRID_SIZE) {
        gridRef.current[getIdx(px, py, pz)] = selectedElement;
      }
    }
  };

  return (
    <group>
      {/* Invisible floor plane to allow building from ground up */}
      <mesh position={[GRID_SIZE/2 - 0.5, -0.5, GRID_SIZE/2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={handlePointerDown}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      {/* Box helper to visualize boundaries */}
      <mesh position={[GRID_SIZE/2 - 0.5, GRID_SIZE/2 - 0.5, GRID_SIZE/2 - 0.5]}>
        <boxGeometry args={[GRID_SIZE, GRID_SIZE, GRID_SIZE]} />
        <meshBasicMaterial transparent opacity={0.05} color="#aaaaaa" depthWrite={false} />
        <Edges color="#444444" />
      </mesh>
      
      <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_INSTANCES]} onPointerDown={handlePointerDown}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial />
      </instancedMesh>
    </group>
  );
}

export default function App() {
  const [selectedElement, setSelectedElement] = useState(SAND);
  const [tickRate, setTickRate] = useState(15); // Hz

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '20px', background: '#222', borderBottom: '1px solid #444', zIndex: 10 }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Reforj: 4J Studios Elements Engine</h1>
        <p style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '14px' }}>Place elements in the 3D grid. Water + Magma = Obsidian & Steam. Flora grows on hydrated dirt.</p>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button style={{ background: selectedElement === DIRT ? '#5c4033' : '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedElement(DIRT)}>Dirt</button>
          <button style={{ background: selectedElement === SAND ? '#e5c48b' : '#000', color: selectedElement === SAND ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedElement(SAND)}>Sand</button>
          <button style={{ background: selectedElement === WATER ? '#5cb8ff' : '#333', color: selectedElement === WATER ? '#000' : '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedElement(WATER)}>Water</button>
          <button style={{ background: selectedElement === MAGMA ? '#ff5733' : '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedElement(MAGMA)}>Magma</button>
          <button style={{ background: selectedElement === FLORA ? '#4caf50' : '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedElement(FLORA)}>Flora</button>
          <button style={{ background: selectedElement === EMPTY ? '#666' : '#333', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setSelectedElement(EMPTY)}>Eraser</button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '14px' }}>Tick Rate: {tickRate}Hz</label>
            <input type="range" min="1" max="60" value={tickRate} onChange={e => setTickRate(Number(e.target.value))} />
            <button style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }} onClick={() => {
              // Easiest way to clear is to force a re-render/reload, but we can't easily clear the ref without passing a prop or ref.
              window.location.reload();
            }}>Clear Grid</button>
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [GRID_SIZE * 1.5, GRID_SIZE, GRID_SIZE * 1.5], fov: 45 }}>
          <color attach="background" args={['#1a1a1a']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1} />
          <VoxelEngine selectedElement={selectedElement} tickRate={tickRate} />
          <OrbitControls target={[GRID_SIZE/2, GRID_SIZE/2, GRID_SIZE/2]} />
        </Canvas>
      </div>
    </div>
  );
}
