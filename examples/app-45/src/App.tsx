import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Image, AlignLeft, Tags, ImagePlay, Swords, CheckCircle2 } from 'lucide-react';
import './App.css';

// Fixes Data
const FIXES = [
  {
    id: 'capsule',
    title: 'Sharpen Logo & Art',
    desc: 'Update to an eye-catching, high-contrast capsule image.',
    icon: <Image size={20} />,
    color: '#E63946',
  },
  {
    id: 'desc',
    title: 'Action-Verb Desc',
    desc: 'Rewrite description to start with an exciting action verb.',
    icon: <AlignLeft size={20} />,
    color: '#F4A261',
  },
  {
    id: 'screenshots',
    title: 'Exciting Screenshots',
    desc: 'Swap boring menu screens for action-packed gameplay shots.',
    icon: <ImagePlay size={20} />,
    color: '#2A9D8F',
  },
  {
    id: 'tags',
    title: 'Align Tags',
    desc: 'Update tags from generic to specific micro-genres.',
    icon: <Tags size={20} />,
    color: '#E9C46A',
  },
  {
    id: 'gif',
    title: 'Add Gameplay GIF',
    desc: 'Embed a juicy combat GIF into the description body.',
    icon: <Swords size={20} />,
    color: '#9B5DE5',
  }
];

const TARGET_WISHLISTS = 100000;
const WISHLISTS_PER_FIX = TARGET_WISHLISTS / FIXES.length;

export default function App() {
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});
  const [wishlists, setWishlists] = useState(1243);
  const [displayWishlists, setDisplayWishlists] = useState(1243);
  const pageRef = useRef<HTMLDivElement>(null);

  // Counter animation
  useEffect(() => {
    let start = displayWishlists;
    const end = wishlists;
    if (start === end) return;
    
    const duration = 1000;
    const startTime = performance.now();
    
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out quart
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOut);
      
      setDisplayWishlists(current);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [wishlists]);

  const handleDragEnd = (event: any, info: any, fixId: string) => {
    if (appliedFixes[fixId]) return;

    if (pageRef.current) {
      const rect = pageRef.current.getBoundingClientRect();
      const dropPoint = info.point;

      // Check if dropped within the store page area
      if (
        dropPoint.x >= rect.left &&
        dropPoint.x <= rect.right &&
        dropPoint.y >= rect.top &&
        dropPoint.y <= rect.bottom
      ) {
        applyFix(fixId);
      }
    }
  };

  const applyFix = (fixId: string) => {
    setAppliedFixes(prev => ({ ...prev, [fixId]: true }));
    setWishlists(prev => prev + WISHLISTS_PER_FIX);
  };

  const isComplete = Object.keys(appliedFixes).length === FIXES.length;

  return (
    <div className="min-h-screen bg-[#000] text-white overflow-hidden relative flex flex-col items-center p-4">
      <div className="scanlines" />
      <div className="crt-flicker absolute inset-0 z-0 opacity-10 pointer-events-none bg-blue-900" />
      
      {/* Header */}
      <div className="w-full max-w-6xl z-10 flex flex-col md:flex-row justify-between items-center mb-8 bg-[#111] pixel-border p-4">
        <div>
          <h1 className="text-xl md:text-2xl text-[var(--steam-light)] mb-2">STORE PAGE OPTIMIZER</h1>
          <p className="text-[10px] text-gray-400">Mission: Reach 100,000 Wishlists for Project Modulus</p>
        </div>
        
        <div className="flex flex-col items-end mt-4 md:mt-0">
          <div className="text-[10px] text-gray-400 mb-1">WISHLIST COUNT</div>
          <motion.div 
            className="wishlist-counter"
            animate={isComplete ? { scale: [1, 1.2, 1], color: ['#a4d007', '#fff', '#a4d007'] } : {}}
            transition={{ duration: 0.5, repeat: isComplete ? Infinity : 0 }}
          >
            {displayWishlists.toLocaleString()}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl z-10 flex flex-col lg:flex-row gap-8">
        
        {/* Toolkit Column (Right on desktop, Top on mobile) */}
        <div className="w-full lg:w-1/3 flex flex-col order-1 lg:order-2">
          <div className="bg-[#222] pixel-border p-4 mb-4">
            <h2 className="text-sm text-[var(--steam-light)] mb-4 uppercase">Toolkit</h2>
            <p className="text-[8px] text-gray-400 mb-6 leading-relaxed">
              Drag tools onto the store page to optimize it. Fix the blurry art, passive text, and generic tags to boost visibility!
            </p>
            
            <div className="flex flex-col gap-3 relative">
              {FIXES.map((fix) => (
                <div key={fix.id} className="relative h-[60px]">
                  {/* Placeholder underneath */}
                  <div className="absolute inset-0 border-2 border-dashed border-gray-600 flex items-center justify-center opacity-50 bg-[#111]">
                    <CheckCircle2 size={16} className="text-green-500 opacity-50" />
                  </div>
                  
                  {/* Draggable Item */}
                  <AnimatePresence>
                    {!appliedFixes[fix.id] && (
                      <motion.div
                        drag
                        dragSnapToOrigin
                        onDragEnd={(e, info) => handleDragEnd(e, info, fix.id)}
                        whileHover={{ scale: 1.05 }}
                        whileDrag={{ scale: 1.1, zIndex: 50, boxShadow: `0px 0px 15px ${fix.color}` }}
                        className="absolute inset-0 bg-[#333] border-2 flex items-center p-2 cursor-grab active:cursor-grabbing z-10"
                        style={{ borderColor: fix.color }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                      >
                        <div className="mr-3" style={{ color: fix.color }}>{fix.icon}</div>
                        <div>
                          <div className="text-[10px] font-bold mb-1">{fix.title}</div>
                          <div className="text-[7px] text-gray-300 leading-tight">{fix.desc}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
          
          {isComplete && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--steam-green)] text-black p-4 text-center text-xs pixel-border mt-4"
            >
              SUCCESS! YOU HIT 100K WISHLISTS!
            </motion.div>
          )}
        </div>

        {/* Store Page Column */}
        <div className="w-full lg:w-2/3 order-2 lg:order-1" ref={pageRef}>
          <div className="bg-[var(--steam-dark)] pixel-border p-6 h-full shadow-2xl relative">
            <h2 className="text-lg text-white mb-6">PROJECT MODULUS</h2>
            
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Capsule Art */}
              <div className="w-full md:w-2/3 bg-black aspect-video relative pixel-border-inset overflow-hidden flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80" 
                  alt="Game Art"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${appliedFixes.capsule ? 'sharp-fx' : 'blur-fx'}`}
                />
                {!appliedFixes.capsule && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <span className="text-[10px] text-red-500 font-bold bg-black p-2 border border-red-500">BLURRY_ART.JPG</span>
                  </div>
                )}
                {appliedFixes.capsule && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 left-2 bg-red-600 text-white text-[8px] p-1 px-2 border border-white font-bold"
                  >
                    HD REMASTER
                  </motion.div>
                )}
              </div>

              {/* Short Description */}
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="bg-[#111] p-3 text-[9px] text-[var(--steam-text)] leading-relaxed h-full pixel-border-inset relative overflow-hidden">
                  <div className={`transition-opacity duration-500 ${appliedFixes.desc ? 'opacity-0 absolute' : 'opacity-100'}`}>
                    This is a game where you walk around and maybe do things. It has graphics and sounds. You can play it with a keyboard. Enjoy playing.
                  </div>
                  <div className={`transition-opacity duration-500 ${appliedFixes.desc ? 'opacity-100' : 'opacity-0 absolute'}`}>
                    <span className="text-[var(--steam-light)] font-bold">BLAST</span> through endless enemy hordes in this fast-paced rogue-lite! <span className="text-yellow-400 font-bold">MASTER</span> powerful synergies, <span className="text-red-400 font-bold">CONQUER</span> the abyss, and become the ultimate spellcaster.
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-[#111] p-2 pixel-border-inset">
                  <div className="text-[8px] text-gray-500 mb-2">Popular user-defined tags for this product:</div>
                  <div className="flex flex-wrap">
                    {!appliedFixes.tags ? (
                      <>
                        <span className="tag opacity-50">Software</span>
                        <span className="tag opacity-50">Education</span>
                        <span className="tag opacity-50">Utilities</span>
                      </>
                    ) : (
                      <>
                        <span className="tag bg-[#E9C46A] text-black font-bold">Action Rogue-like</span>
                        <span className="tag bg-[#E9C46A] text-black font-bold">Bullet Hell</span>
                        <span className="tag bg-[#E9C46A] text-black font-bold">Pixel Graphics</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshots Row */}
            <div className="mb-6">
              <div className="text-[10px] text-gray-400 mb-2">SCREENSHOTS</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="min-w-[120px] aspect-video bg-[#111] pixel-border-inset relative overflow-hidden flex items-center justify-center">
                    {!appliedFixes.screenshots ? (
                      <div className="text-[6px] text-gray-600 text-center">MENU_SCREEN_{i}</div>
                    ) : (
                      <img 
                        src={`https://images.unsplash.com/photo-${1550745165 + i * 100}-9bc0b252726f?auto=format&fit=crop&w=300&q=80`} 
                        alt="Action"
                        className="w-full h-full object-cover hue-rotate-90 saturate-200"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* About This Game */}
            <div>
              <div className="text-[12px] text-white mb-2 pb-1 border-b border-gray-700 uppercase">About This Game</div>
              <div className="bg-[#111] min-h-[150px] p-4 pixel-border-inset text-[9px] leading-loose relative flex items-center justify-center">
                {!appliedFixes.gif ? (
                  <div className="text-gray-600 border border-dashed border-gray-600 p-8 w-full text-center">
                    [WALL OF BORING TEXT HERE]
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex flex-col items-center"
                  >
                    <div className="w-[80%] aspect-[21/9] bg-gradient-to-r from-purple-900 via-red-900 to-yellow-900 mb-4 border border-white flex items-center justify-center relative overflow-hidden">
                      {/* Fake GIF animation */}
                      <motion.div 
                        animate={{ x: [-100, 100, -100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 bg-white absolute"
                      />
                      <motion.div 
                        animate={{ scale: [1, 5, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-4 h-4 bg-yellow-400 absolute rounded-full"
                      />
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] mix-blend-overlay"></div>
                      <div className="z-10 text-[8px] font-bold bg-black bg-opacity-50 px-2 py-1 border border-white">JUICY_COMBAT.GIF</div>
                    </div>
                    <div className="text-center text-gray-300 w-[80%]">
                      Experience visceral combat that hooks you in seconds.
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Success Overlay Effect on Store Page */}
            <AnimatePresence>
              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  className="absolute inset-0 bg-green-500 pointer-events-none mix-blend-overlay"
                />
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
