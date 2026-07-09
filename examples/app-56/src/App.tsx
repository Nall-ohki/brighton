import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, PerspectiveCamera, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

const ADS = [
  { id: 'ad1', name: 'GLITCH ENERGY', color: 'lime', gradient: 'from-lime-400 to-green-600', val: 15 },
  { id: 'ad2', name: 'DOGECOIN', color: 'yellow', gradient: 'from-yellow-300 to-orange-500', val: 20 },
  { id: 'ad3', name: 'MEGA BURGER', color: 'red', gradient: 'from-red-500 to-rose-700', val: 10 },
  { id: 'ad4', name: 'SNEAKX', color: 'cyan', gradient: 'from-cyan-400 to-blue-600', val: 25 },
  { id: 'ad5', name: 'BUY NOW!', color: 'purple', gradient: 'from-purple-500 to-pink-600', val: 50 },
];

const ZONES = [
  { id: 'billboard-left', label: 'Left Billboard', type: 'safe', pos: [-10.5, 2, 0] as const },
  { id: 'billboard-right', label: 'Right Billboard', type: 'safe', pos: [10.5, 2, 0] as const },
  { id: 'jumbotron', label: 'Jumbotron', type: 'safe', pos: [0, 8, -10] as const },
  { id: 'jerseys', label: 'Player Jerseys', type: 'neutral', pos: [0, 2, 0] as const },
];

function ArenaLights() {
  const lightRef = useRef<any>();
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(clock.elapsedTime) * 10;
      lightRef.current.position.z = Math.cos(clock.elapsedTime * 0.8) * 10;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <spotLight ref={lightRef} position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={10} color="#ffffff" castShadow />
      <spotLight position={[-15, 15, -15]} angle={0.6} penumbra={1} intensity={5} color="#4ade80" />
      <spotLight position={[15, 15, -15]} angle={0.6} penumbra={1} intensity={5} color="#3b82f6" />
    </>
  );
}

function DropZone3D({ position, id, label, placedAd, isDragging }: any) {
  return (
    <Html position={position} center zIndexRange={[10, 0]}>
      <div 
        className={`w-40 h-24 border-4 border-dashed flex items-center justify-center rounded-xl transition-all shadow-lg ${placedAd ? 'border-transparent' : 'border-white/50 bg-black/40 backdrop-blur-md'} ${isDragging && !placedAd ? 'scale-110 border-blue-400 bg-blue-500/20' : ''}`}
        data-zone={id}
      >
        {placedAd ? (
            <div className={`w-full h-full rounded-lg flex items-center justify-center shadow-2xl shadow-${placedAd.color}-500/50 bg-gradient-to-br ${placedAd.gradient}`}>
                <span className="text-white font-black text-xl italic tracking-wider drop-shadow-md text-center leading-tight p-2">{placedAd.name}</span>
            </div>
        ) : (
            <span className="text-white font-bold uppercase tracking-wider text-sm text-center px-2">{label}</span>
        )}
      </div>
    </Html>
  );
}

function Arena({ placements, isDragging }: any) {
  const groupRef = useRef<any>();

  useFrame(({ clock }) => {
     if (groupRef.current) {
       groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.1) * 0.1;
     }
  });

  return (
    <group ref={groupRef}>
      {/* Field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#1a472a" roughness={0.8} />
      </mesh>
      
      {/* Field Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[26, 36]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[4, 4.2, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[26, 0.2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      
      {/* Stands */}
      <mesh position={[-16, 4, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[40, 8, 4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[16, 4, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[40, 8, 4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 4, -22]} castShadow receiveShadow>
        <boxGeometry args={[36, 8, 4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Jumbotron Model */}
      <group position={[0, 10, -10]}>
        <mesh castShadow>
          <boxGeometry args={[10, 6, 2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, -5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 10]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      {/* Players */}
      <group position={[0, 0, 0]}>
        <mesh position={[-3, 1, 4]} castShadow>
          <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[3, 1, -4]} castShadow>
          <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[1, 1, 2]} castShadow>
          <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-1, 1, -2]} castShadow>
          <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* Render 3D Drop Zones */}
      {ZONES.map(z => (
        <DropZone3D 
          key={z.id}
          id={z.id}
          label={z.label}
          position={z.pos}
          placedAd={placements[z.id]}
          isDragging={isDragging}
        />
      ))}
    </group>
  );
}

function DraggableAd({ ad, setIsDragging, handleDragEnd }: any) {
  return (
    <motion.div
      drag
      dragSnapToOrigin
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        handleDragEnd(e, info, ad);
      }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileDrag={{ scale: 1.1, zIndex: 100 }}
      exit={{ opacity: 0, scale: 0, y: 50 }}
      className={`w-40 h-24 rounded-2xl cursor-grab active:cursor-grabbing shadow-2xl bg-gradient-to-br ${ad.gradient} flex items-center justify-center flex-col gap-1 border-2 border-white/20 relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
      <span className="text-white font-black italic text-lg text-center leading-tight drop-shadow-md z-10 px-2">{ad.name}</span>
      <span className="text-white/90 font-bold text-sm bg-black/40 px-3 py-1 rounded-full z-10 backdrop-blur-sm">+${(ad.val * 1000).toLocaleString()}</span>
    </motion.div>
  );
}

export default function App() {
  const [placements, setPlacements] = useState<Record<string, any>>({});
  const [availableAds, setAvailableAds] = useState(ADS);
  const [immersion, setImmersion] = useState(100);
  const [revenue, setRevenue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [reactions, setReactions] = useState<any[]>([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (immersion <= 0 && !gameOver) {
      setGameOver(true);
    }
  }, [immersion, gameOver]);

  const triggerReaction = (immersionDrop: number) => {
    const id = Date.now();
    let text = "NICE!";
    let color = "text-green-400";
    
    if (immersionDrop >= 40) {
      text = "BOOOO! 😡";
      color = "text-red-500";
    } else if (immersionDrop >= 15) {
      text = "SELLOUT! 😒";
      color = "text-yellow-400";
    } else if (immersionDrop > 0) {
      text = "Hmm... 🤨";
      color = "text-gray-300";
    }

    setReactions(prev => [...prev, { id, text, color }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2500);
  };

  const handleDragEnd = (event: any, info: any, ad: any) => {
    const zones = Array.from(document.querySelectorAll('[data-zone]'));
    const x = info.point.x;
    const y = info.point.y;
    
    let droppedZoneId = null;
    
    for (const zone of zones) {
      const rect = zone.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        droppedZoneId = zone.getAttribute('data-zone');
        break;
      }
    }
    
    if (droppedZoneId && !placements[droppedZoneId]) {
       const zone = ZONES.find(z => z.id === droppedZoneId) || { type: 'intrusive' };
       
       let immersionDrop = 0;
       let revenueGain = ad.val * 1000;
       
       if (zone.type === 'safe') immersionDrop = 5;
       else if (zone.type === 'neutral') immersionDrop = 15;
       else if (zone.type === 'intrusive') {
         immersionDrop = 40;
         revenueGain *= 2; // Intrusive gives double!
       }
       
       setPlacements(prev => ({ ...prev, [droppedZoneId!]: ad }));
       setAvailableAds(prev => prev.filter(a => a.id !== ad.id));
       
       setImmersion(prev => Math.max(0, prev - immersionDrop));
       setRevenue(prev => prev + revenueGain);

       triggerReaction(immersionDrop);
    }
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden font-sans relative select-none">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 18, 24]} fov={45} rotation={[-0.6, 0, 0]} />
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 20, 60]} />
          <ArenaLights />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Arena placements={placements} isDragging={isDragging} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-20 pointer-events-none">
        
        {/* Immersion Meter */}
        <div className="w-72 md:w-96 bg-black/80 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-end mb-3">
            <span className="text-white font-black uppercase tracking-widest text-lg md:text-xl flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
              Immersion
            </span>
            <span className={`font-black text-2xl md:text-3xl ${immersion > 50 ? 'text-green-400' : immersion > 20 ? 'text-yellow-400' : 'text-red-500'} drop-shadow-md`}>{immersion}%</span>
          </div>
          <div className="w-full h-5 md:h-6 bg-gray-900 rounded-full overflow-hidden border-2 border-black shadow-inner relative">
            <motion.div 
              className={`h-full relative overflow-hidden ${immersion > 50 ? 'bg-green-500' : immersion > 20 ? 'bg-yellow-500' : 'bg-red-600'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${immersion}%` }}
              transition={{ type: 'spring', bounce: 0.4 }}
            >
               <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]" />
            </motion.div>
          </div>
        </div>

        {/* Revenue Meter */}
        <div className="bg-black/80 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-end">
          <span className="text-green-400 font-black uppercase tracking-widest text-lg md:text-xl mb-1 flex items-center gap-2">
            Revenue
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </span>
          <motion.span 
            className="text-white font-black text-5xl md:text-6xl drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] tracking-tighter"
            key={revenue}
            initial={{ scale: 1.3, color: '#4ade80' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            ${revenue.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* HUD Blocking Drop Zone */}
      <div 
        className={`absolute inset-0 m-auto w-4/5 max-w-2xl h-1/2 pointer-events-auto border-8 border-dashed transition-all z-10 flex items-center justify-center rounded-[3rem] shadow-2xl
          ${isDragging && !placements['hud'] ? 'border-red-500/80 bg-red-500/20 backdrop-blur-sm' : 'border-transparent pointer-events-none'}
        `}
        data-zone="hud"
      >
         {placements['hud'] && (
           <div className={`w-full h-full shadow-[0_0_100px_rgba(255,0,0,0.5)] bg-gradient-to-br ${placements['hud'].gradient} flex items-center justify-center rounded-[2.5rem] animate-pulse border-4 border-white/20`}>
             <span className="text-7xl md:text-9xl font-black text-white italic drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] text-center px-4 tracking-tighter">{placements['hud'].name}</span>
           </div>
         )}
         {isDragging && !placements['hud'] && (
           <div className="flex flex-col items-center justify-center gap-4 bg-black/60 p-8 rounded-3xl backdrop-blur-md border border-red-500/50">
             <span className="text-red-500 font-black uppercase text-3xl md:text-5xl tracking-widest text-center animate-pulse drop-shadow-lg">
               BLOCK GAMEPLAY
             </span>
             <span className="text-white/80 font-bold uppercase text-xl md:text-2xl tracking-widest text-center bg-red-500/20 px-6 py-2 rounded-full">
               +++ REVENUE | --- IMMERSION
             </span>
           </div>
         )}
      </div>

      {/* Crowd Reactions */}
      <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {reactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 100, scale: 0.5, rotate: Math.random() * 20 - 10, x: (Math.random() - 0.5) * 400 }}
              animate={{ opacity: 1, y: -200, scale: 2, rotate: Math.random() * 20 - 10 }}
              exit={{ opacity: 0, scale: 3, filter: 'blur(10px)' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className={`absolute font-black text-6xl md:text-8xl uppercase italic tracking-tighter drop-shadow-[0_8px_8px_rgba(0,0,0,1)] ${r.color}`}
              style={{ WebkitTextStroke: '3px black' } as any}
            >
              {r.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ads Panel */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex justify-center items-end z-40 pointer-events-none">
        <div className="flex gap-4 p-6 bg-black/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {availableAds.map(ad => (
              <DraggableAd key={ad.id} ad={ad} setIsDragging={setIsDragging} handleDragEnd={handleDragEnd} />
            ))}
          </AnimatePresence>
          {availableAds.length === 0 && !gameOver && (
            <div className="flex items-center justify-center px-10 py-6">
               <span className="text-white font-black uppercase tracking-widest text-2xl text-center">Campaign Complete! <br/><span className="text-green-400">Total: ${revenue.toLocaleString()}</span></span>
            </div>
          )}
          {gameOver && (
            <div className="flex items-center justify-center px-10 py-6">
               <span className="text-red-500 font-black uppercase tracking-widest text-2xl text-center">Players Left!<br/><span className="text-white/50 text-lg">Immersion Dropped to 0%</span></span>
            </div>
          )}
        </div>
      </div>
      
      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center pointer-events-auto"
          >
            <span className="text-red-600 font-black text-8xl md:text-9xl uppercase tracking-tighter italic mb-4 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">GAME OVER</span>
            <span className="text-white text-2xl md:text-3xl font-bold uppercase tracking-widest max-w-2xl leading-relaxed">
              You ruined the game with too many intrusive ads! The players have abandoned the server.
            </span>
            <div className="mt-12 bg-white/5 p-8 rounded-3xl border border-white/10">
              <span className="block text-gray-400 uppercase font-bold tracking-widest mb-2">Final Revenue</span>
              <span className="text-green-400 font-black text-6xl md:text-7xl">${revenue.toLocaleString()}</span>
            </div>
            <button 
              className="mt-12 px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-2xl rounded-full hover:scale-105 transition-transform"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes stripes {
          from { background-position: 0 0; }
          to { background-position: 1rem 0; }
        }
      `}} />
    </div>
  );
}
