import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

const BLOCK_TYPES = [
  { id: 'dc_black', label: 'DC Bat-Block', color: '#1a1a1a', license: 'DC', icon: '🦇' },
  { id: 'dc_gray', label: 'DC Gargoyle', color: '#4a4a4a', license: 'DC', icon: '🦇' },
  { id: 'dc_yellow', label: 'DC Utility', color: '#eab308', license: 'DC', icon: '🦇' },
  { id: 'lego_red', label: 'LEGO Red', color: '#ef4444', license: 'LEGO', icon: '🧱' },
  { id: 'lego_blue', label: 'LEGO Blue', color: '#3b82f6', license: 'LEGO', icon: '🧱' },
  { id: 'lego_green', label: 'LEGO Green', color: '#22c55e', license: 'LEGO', icon: '🧱' }
];

const Stud = ({ position, color }) => (
  <mesh position={position} castShadow raycast={() => null}>
    <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
    <meshStandardMaterial color={color} roughness={0.1} metalness={0.1} clearcoat={1} />
  </mesh>
);

const Block = ({ id, x, y, z, type, onRemove, onAddBlock }) => {
  return (
    <group position={[x, y, z]}>
      <mesh 
        castShadow 
        receiveShadow 
        onClick={onAddBlock} 
        onContextMenu={(e) => onRemove(e, id)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={type.color} roughness={0.1} metalness={0.1} clearcoat={1} />
      </mesh>
      <Stud position={[-0.25, 0.5, -0.25]} color={type.color} />
      <Stud position={[0.25, 0.5, -0.25]} color={type.color} />
      <Stud position={[-0.25, 0.5, 0.25]} color={type.color} />
      <Stud position={[0.25, 0.5, 0.25]} color={type.color} />
      
      {/* License Tag */}
      <mesh position={[0, 0, 0.501]} raycast={() => null}>
         <planeGeometry args={[0.3, 0.15]} />
         <meshBasicMaterial color={type.license === 'DC' ? '#000' : '#fff'} />
      </mesh>
      {/* Visual text approximation using color block for performance, but icon color indicates type */}
      <mesh position={[0, 0, 0.502]} raycast={() => null}>
         <planeGeometry args={[0.26, 0.11]} />
         <meshBasicMaterial color={type.license === 'DC' ? '#eab308' : '#ef4444'} />
      </mesh>
    </group>
  );
};

const CinematicCamera = ({ active }) => {
  useFrame(({ camera, clock }) => {
    if (active) {
      const t = clock.getElapsedTime();
      camera.position.x = Math.sin(t * 0.5) * 15;
      camera.position.z = Math.cos(t * 0.5) * 15;
      camera.position.y = 8 + Math.sin(t) * 2;
      camera.lookAt(0, 2, 0);
    }
  });
  return null;
};

export default function App() {
  const [blocks, setBlocks] = useState([]);
  const [selectedType, setSelectedType] = useState(BLOCK_TYPES[0]);
  const [cinematic, setCinematic] = useState(false);

  const goal = 20;
  
  const dcCount = blocks.filter(b => b.type.license === 'DC').length;
  const legoCount = blocks.filter(b => b.type.license === 'LEGO').length;
  const total = dcCount + legoCount;
  
  let approval = 100;
  if (total > 0) {
    const diff = Math.abs(dcCount - legoCount);
    approval = Math.max(0, 100 - (diff / total) * 100);
  }

  useEffect(() => {
    if (total >= goal && approval >= 50) {
      setCinematic(true);
    } else {
      setCinematic(false);
    }
  }, [total, approval]);

  const handleAddBlock = (e) => {
    e.stopPropagation();
    if (cinematic) return;

    const { point, face } = e;
    if (!face) return;
    const n = face.normal;
    
    // Calculate new position
    const pos = point.clone().add(n.clone().multiplyScalar(0.5));
    const bx = Math.round(pos.x);
    const by = Math.round(pos.y);
    const bz = Math.round(pos.z);
    
    // Bounds check
    if (bx < -5 || bx > 5 || bz < -5 || bz > 5 || by < 0 || by > 20) return;
    
    // Occupied check
    if (blocks.some(b => b.x === bx && b.y === by && b.z === bz)) return;
    
    setBlocks(prev => [...prev, { id: Date.now() + Math.random(), x: bx, y: by, z: bz, type: selectedType }]);
  };

  const handleRemoveBlock = (e, id) => {
    e.stopPropagation();
    if (cinematic) return;
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  // Prevent context menu on canvas
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 overflow-hidden font-sans select-none">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-widest uppercase text-center">
          Legacy of the Dark Knight
        </h1>
        <p className="text-white font-bold tracking-widest opacity-80 mt-1">GOTHAM ROOFTOP BUILDER</p>
        
        <div className="mt-6 w-full max-w-lg bg-gray-900 bg-opacity-80 backdrop-blur-md border-4 border-yellow-500 rounded-xl p-4 shadow-2xl pointer-events-auto">
          <div className="flex justify-between text-white font-bold mb-2 text-lg">
            <span className="uppercase tracking-wider">Licensor Approval</span>
            <span className={approval < 50 ? 'text-red-500' : 'text-green-400'}>{Math.round(approval)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-6 rounded-full overflow-hidden flex border-2 border-gray-600 relative">
            <div 
              className={`h-full transition-all duration-500 ease-out ${approval < 50 ? 'bg-red-500' : approval < 80 ? 'bg-yellow-400' : 'bg-green-500'}`} 
              style={{ width: `${approval}%` }} 
            />
            {/* Center marker for balance */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white opacity-50 transform -translate-x-1/2" />
          </div>
          
          <div className="flex justify-between text-sm text-gray-300 mt-3 font-bold uppercase">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-800 border border-gray-500 inline-block rounded-full"></span> DC: {dcCount}</span>
            <span className="flex items-center gap-1 text-center text-yellow-400">
              {total < goal ? `Goal: ${total} / ${goal}` : 'Goal Reached!'}
            </span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 inline-block rounded-full"></span> LEGO: {legoCount}</span>
          </div>
        </div>

        {approval < 30 && total >= 4 && !cinematic && (
          <div className="mt-4 text-red-500 font-black text-xl bg-black bg-opacity-90 px-6 py-2 rounded-lg border-2 border-red-500 animate-pulse uppercase tracking-wider shadow-xl shadow-red-900/50">
            Warning: License Imbalance! Approval Dropping!
          </div>
        )}
      </div>

      {/* Block Selector */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 backdrop-blur-md p-3 rounded-2xl flex gap-3 border-2 border-gray-700 z-10 transition-all duration-500 ${cinematic ? 'translate-y-32 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        {BLOCK_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type)}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-4 transition-all hover:scale-105 flex items-center justify-center text-2xl shadow-lg relative ${
              selectedType.id === type.id ? 'border-yellow-400 scale-110' : 'border-gray-600'
            }`}
            style={{ backgroundColor: type.color }}
            title={type.label}
          >
            <span className="drop-shadow-md">{type.icon}</span>
            <div className={`absolute -bottom-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md ${
              type.license === 'DC' ? 'bg-black text-yellow-400' : 'bg-red-600 text-white'
            }`}>
              {type.license}
            </div>
          </button>
        ))}
      </div>

      {/* Cinematic Overlay */}
      {cinematic && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center pointer-events-none z-20 backdrop-blur-sm transition-all duration-1000">
          <div className="transform scale-150 text-center animate-bounce">
            <h2 className="text-5xl md:text-7xl font-black text-yellow-400 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] uppercase tracking-widest leading-none">
              Master<br />Builder
            </h2>
          </div>
          <p className="text-2xl md:text-3xl text-white mt-8 font-black uppercase tracking-widest bg-black bg-opacity-80 px-8 py-4 rounded-xl border-2 border-yellow-500 shadow-2xl animate-pulse">
            Licensor Fully Approved!
          </p>
          <button 
            onClick={() => setCinematic(false)} 
            className="mt-12 pointer-events-auto bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider border border-gray-600 transition-colors shadow-lg"
          >
            Keep Building
          </button>
        </div>
      )}

      <div className={`absolute bottom-4 right-4 text-white text-xs opacity-50 z-10 font-bold uppercase transition-opacity duration-500 ${cinematic ? 'opacity-0' : 'opacity-50'}`}>
        Left Click: Place | Right Click: Remove
      </div>

      {/* 3D Scene */}
      <Canvas shadows camera={{ position: [8, 6, 8], fov: 45 }}>
        <Sky sunPosition={[10, 20, 10]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.4} />
        <directionalLight 
          castShadow 
          position={[10, 15, -5]} 
          intensity={1.5} 
          shadow-mapSize={[2048, 2048]} 
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        
        {/* Baseplate */}
        <group>
          <mesh position={[0, -1, 0]} receiveShadow onClick={handleAddBlock}>
            <boxGeometry args={[11, 1, 11]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          <gridHelper args={[11, 11, '#333', '#222']} position={[0, -0.49, 0]} />
        </group>

        {blocks.map(block => (
          <Block 
            key={block.id}
            {...block}
            onRemove={handleRemoveBlock}
            onAddBlock={handleAddBlock}
          />
        ))}

        <ContactShadows position={[0, -0.49, 0]} opacity={0.5} scale={20} blur={2} far={10} />
        
        {!cinematic && <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={30} />}
        <CinematicCamera active={cinematic} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
