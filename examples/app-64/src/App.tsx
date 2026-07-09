import React, { useEffect, useRef, useState, useCallback } from 'react';

type EventType = 'PORTFOLIO' | 'TALK' | 'PROJECT' | 'FEEDBACK';

interface Slot {
    id: number;
    type: EventType;
    y: number;
    filled: boolean;
    processed: boolean;
}

interface GameState {
    scrollY: number;
    momentum: number;
    progress: number;
    slots: Slot[];
    gameOver: boolean;
    gameTime: number;
    lastFlash: 'success' | 'fail' | null;
    flashTime: number;
}

const eventLabels: Record<EventType, string> = {
    PORTFOLIO: 'Portfolio Review',
    TALK: 'Industry Talk',
    PROJECT: 'Trial Project',
    FEEDBACK: 'Feedback Session'
};

const PLAYHEAD_Y = 250;
const SCROLL_SPEED = 120;
const GAME_DURATION = 60;

export default function App() {
    const state = useRef<GameState>({
        scrollY: 0,
        momentum: 50,
        progress: 0,
        slots: [],
        gameOver: false,
        gameTime: 0,
        lastFlash: null,
        flashTime: -10,
    });

    const [, setRenderTick] = useState(0);
    const [dragInfo, setDragInfo] = useState<{ type: EventType; startX: number; startY: number; curX: number; curY: number } | null>(null);

    const initGame = useCallback(() => {
        const newSlots: Slot[] = [];
        for (let y = 800; y < SCROLL_SPEED * GAME_DURATION + 1000; y += 400) {
            const actualY = y + (Math.random() * 120 - 60);
            const types: EventType[] = ['PORTFOLIO', 'TALK', 'PROJECT', 'FEEDBACK'];
            const type = types[Math.floor(Math.random() * types.length)];
            newSlots.push({ id: y, type, y: actualY, filled: false, processed: false });
        }
        state.current = {
            scrollY: 0,
            momentum: 50,
            progress: 0,
            slots: newSlots,
            gameOver: false,
            gameTime: 0,
            lastFlash: null,
            flashTime: -10,
        };
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();
        let mounted = true;

        const update = (dt: number) => {
            const s = state.current;
            if (s.gameOver) return;

            s.gameTime += dt;
            s.scrollY += SCROLL_SPEED * dt;
            
            // Decays momentum
            s.momentum = Math.max(0, s.momentum - 8 * dt);

            // Progress increases based on momentum
            s.progress = Math.min(100, s.progress + (s.momentum / 100) * 2.2 * dt);

            s.slots.forEach(slot => {
                if (!slot.processed && s.scrollY > slot.y) {
                    slot.processed = true;
                    if (slot.filled) {
                        s.momentum = Math.min(100, s.momentum + 40);
                        s.lastFlash = 'success';
                        s.flashTime = s.gameTime;
                    } else {
                        s.momentum = Math.max(0, s.momentum - 25);
                        s.lastFlash = 'fail';
                        s.flashTime = s.gameTime;
                    }
                }
            });

            if (s.gameTime >= GAME_DURATION || s.progress >= 100) {
                s.gameOver = true;
            }
        };

        const loop = (time: number) => {
            if (!mounted) return;
            const dt = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;
            update(dt);
            setRenderTick(t => t + 1);
            animationFrameId = requestAnimationFrame(loop);
        };

        initGame();
        animationFrameId = requestAnimationFrame(loop);

        return () => {
            mounted = false;
            cancelAnimationFrame(animationFrameId);
        };
    }, [initGame]);

    const handlePointerDown = (e: React.PointerEvent, type: EventType) => {
        if (state.current.gameOver) return;
        
        // Capture pointer if possible, but simpler to just track global move
        if (e.target instanceof Element) {
            e.target.releasePointerCapture(e.pointerId);
        }
        
        setDragInfo({
            type,
            startX: e.clientX,
            startY: e.clientY,
            curX: e.clientX,
            curY: e.clientY,
        });
    };

    const handleDrop = useCallback((x: number, y: number, type: EventType) => {
        const s = state.current;
        const windowCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
        if (Math.abs(x - windowCenter) > 200) return;

        const hitRadius = 80;
        for (let slot of s.slots) {
            if (slot.filled || slot.processed) continue;
            const slotScreenY = PLAYHEAD_Y + slot.y - s.scrollY;
            if (Math.abs(y - slotScreenY) < hitRadius && slot.type === type) {
                slot.filled = true;
                break;
            }
        }
    }, []);

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            if (dragInfo) {
                setDragInfo(prev => prev ? { ...prev, curX: e.clientX, curY: e.clientY } : null);
            }
        };
        const onPointerUp = (e: PointerEvent) => {
            if (dragInfo) {
                handleDrop(e.clientX, e.clientY, dragInfo.type);
                setDragInfo(null);
            }
        };
        const onPointerCancel = () => {
            setDragInfo(null);
        };
        
        if (dragInfo) {
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('pointercancel', onPointerCancel);
        }
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerCancel);
        };
    }, [dragInfo, handleDrop]);

    const s = state.current;
    
    let hoverSlotId: number | null = null;
    if (dragInfo) {
        const windowCenter = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
        if (Math.abs(dragInfo.curX - windowCenter) <= 200) {
            for (let slot of s.slots) {
                if (!slot.filled && !slot.processed && slot.type === dragInfo.type) {
                    const slotScreenY = PLAYHEAD_Y + slot.y - s.scrollY;
                    if (Math.abs(dragInfo.curY - slotScreenY) < 80) {
                        hoverSlotId = slot.id;
                        break;
                    }
                }
            }
        }
    }

    const timeSinceFlash = s.gameTime - s.flashTime;
    const flashOpacity = Math.max(0, 1 - timeSinceFlash * 2);
    const flashColor = s.lastFlash === 'success' ? 'rgba(0, 255, 255, ' : 'rgba(255, 0, 0, ';

    const bgPosition = `center ${s.scrollY % 40}px`;
    const getWindowHeight = () => typeof window !== 'undefined' ? window.innerHeight : 800;

    return (
        <div 
            className="relative w-full h-screen overflow-hidden select-none font-sans"
            style={{ 
                backgroundColor: '#061930',
                backgroundImage: `
                    linear-gradient(rgba(77, 166, 255, 0.15) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(77, 166, 255, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundPosition: bgPosition,
                touchAction: 'none'
            }}
        >
            {/* Flash Overlay */}
            <div 
                className="absolute inset-0 pointer-events-none z-10 transition-colors" 
                style={{ backgroundColor: `${flashColor}${flashOpacity * 0.15})` }} 
            />

            {/* Timelines Container */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
                {/* Mentor Line */}
                <div className="absolute w-1 bg-blue-500/50" style={{ left: 'calc(50% + 150px)', top: 0, bottom: 0 }} />
                {/* Graduate Line */}
                <div 
                    className="absolute w-1 transition-colors duration-300" 
                    style={{ 
                        left: 'calc(50% - 150px)', 
                        top: 0, 
                        bottom: 0,
                        backgroundColor: s.momentum > 0 ? 'rgba(0,255,255,0.6)' : 'rgba(0,255,255,0.1)'
                    }} 
                />

                {/* Playhead */}
                <div className="absolute w-full border-t-2 border-dashed border-cyan-400 opacity-60" style={{ top: PLAYHEAD_Y }} />
                <div className="absolute text-cyan-300 font-mono text-xs opacity-80" style={{ top: PLAYHEAD_Y - 20, left: 'calc(50% + 170px)' }}>CURRENT TIME</div>

                {/* Graduate Icon */}
                <div className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300" style={{ left: 'calc(50% - 150px)', top: PLAYHEAD_Y }}>
                    <div className={`w-12 h-12 rounded-full border-2 bg-cyan-950 flex items-center justify-center transition-all duration-300
                        ${s.momentum > 0 ? 'border-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.5)]' : 'border-cyan-800 shadow-none grayscale opacity-50'}`}>
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-cyan-200" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 4L2 9l10 5 10-5-10-5z" />
                            <path d="M22 9v6" />
                            <path d="M6 11v5a6 3 0 0012 0v-5" />
                        </svg>
                    </div>
                    <div className={`mt-2 text-center font-mono text-xs ${s.momentum > 0 ? 'text-cyan-300' : 'text-cyan-800'}`}>GRADUATE</div>
                </div>

                {/* Mentor Icon */}
                <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: 'calc(50% + 150px)', top: PLAYHEAD_Y }}>
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400 bg-blue-950 flex items-center justify-center shadow-[0_0_20px_rgba(50,150,255,0.4)]">
                        <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div className="mt-2 text-center text-blue-300 font-mono text-xs">MENTOR</div>
                </div>

                {/* Slots */}
                {s.slots.map(slot => {
                    const screenY = PLAYHEAD_Y + slot.y - s.scrollY;
                    if (screenY < -100 || screenY > getWindowHeight() + 100) return null;

                    const isPast = slot.processed;
                    const isHovered = hoverSlotId === slot.id;
                    
                    let borderColor = 'border-cyan-800 border-dashed';
                    let bgColor = 'bg-transparent';
                    let textColor = 'text-cyan-700';
                    let shadow = 'shadow-none';

                    if (slot.filled) {
                        borderColor = 'border-cyan-400 border-solid';
                        bgColor = 'bg-cyan-900';
                        textColor = 'text-cyan-100 font-bold';
                        shadow = 'shadow-[0_0_20px_rgba(0,255,255,0.3)]';
                    } else if (isHovered) {
                        borderColor = 'border-cyan-300 border-dashed';
                        bgColor = 'bg-cyan-800/40';
                        textColor = 'text-cyan-200';
                        shadow = 'shadow-[0_0_20px_rgba(0,255,255,0.6)]';
                    } else if (isPast) {
                        borderColor = 'border-red-900/50 border-dashed';
                        textColor = 'text-red-900/50';
                    }

                    return (
                        <div 
                            key={slot.id}
                            className={`absolute left-1/2 transform -translate-x-1/2 border-2 flex items-center justify-center transition-all duration-200 ${borderColor} ${bgColor} ${shadow}`}
                            style={{ 
                                top: screenY - 20, 
                                width: 300, 
                                height: 40,
                                opacity: isPast && !slot.filled ? 0.3 : 1
                            }}
                        >
                            <span className={`font-mono text-sm tracking-wide ${textColor}`}>
                                {eventLabels[slot.type]}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* UI Top Left */}
            <div className="absolute top-6 left-6 max-w-xs md:max-w-sm border border-cyan-800 bg-[#061930]/90 p-4 md:p-5 backdrop-blur-md z-30 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-sm pointer-events-auto">
                <h1 className="text-lg md:text-xl text-cyan-100 font-mono font-bold mb-2 md:mb-3 tracking-wider">GRADUATE JOURNEYS</h1>
                <p className="text-cyan-400 font-mono text-[10px] md:text-xs leading-relaxed opacity-80 hidden md:block">
                    Connect the mentor and graduate timelines by dragging events into the matching slots before they pass the current time. Keep the momentum high!
                </p>
            </div>

            {/* UI Top Right - Progress */}
            <div className="absolute top-6 right-6 w-48 md:w-72 border border-cyan-800 bg-[#061930]/90 p-4 md:p-5 backdrop-blur-md z-30 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-sm pointer-events-auto">
                <div className="flex justify-between items-end mb-1 md:mb-2">
                    <div className="font-mono text-cyan-200 text-[10px] md:text-sm font-bold tracking-widest">CAREER PROGRESS</div>
                    <div className="font-mono text-cyan-400 text-[10px] md:text-xs">{Math.floor(s.progress)}%</div>
                </div>
                <div className="w-full h-2 md:h-3 bg-cyan-950 border border-cyan-800 relative overflow-hidden mb-3 md:mb-5">
                    <div className="absolute top-0 left-0 h-full bg-cyan-400 transition-all duration-300" style={{ width: `${s.progress}%` }} />
                </div>

                <div className="flex justify-between items-end mb-1 md:mb-2">
                    <div className="font-mono text-blue-200 text-[10px] md:text-sm font-bold tracking-widest">MOMENTUM</div>
                    {s.momentum === 0 ? (
                        <div className="font-mono text-red-400 text-[10px] md:text-xs animate-pulse font-bold">STALLED!</div>
                    ) : (
                        <div className="font-mono text-blue-400 text-[10px] md:text-xs">{Math.floor(s.momentum)}</div>
                    )}
                </div>
                <div className="w-full h-1 md:h-2 bg-blue-950 border border-blue-800 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-300" style={{ width: `${s.momentum}%` }} />
                </div>
            </div>

            {/* Time Remaining */}
            <div className="absolute bottom-28 md:bottom-32 left-6 border border-cyan-800 bg-[#061930]/80 px-4 py-2 font-mono text-cyan-400 text-sm z-30 pointer-events-auto shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                TIME: {Math.max(0, Math.ceil(GAME_DURATION - s.gameTime))}s
            </div>

            {/* Bank (Draggable Items) */}
            <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 flex flex-wrap md:flex-nowrap justify-center gap-2 md:gap-8 bg-[#061930]/95 border-t border-cyan-800 backdrop-blur-md z-40 pointer-events-auto">
                {Object.entries(eventLabels).map(([type, label]) => {
                    const isDraggingThis = dragInfo?.type === type;
                    return (
                        <button
                            key={type}
                            onPointerDown={(e) => handlePointerDown(e, type as EventType)}
                            className={`px-3 py-2 md:px-6 md:py-4 border-2 font-mono text-[10px] md:text-sm transition-all duration-200 touch-none select-none flex items-center justify-center min-w-[100px] md:min-w-[160px]
                                ${isDraggingThis ? 'opacity-50 border-cyan-700 bg-cyan-950 text-cyan-600' : 'border-cyan-500 bg-cyan-900/50 text-cyan-100 hover:bg-cyan-800 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] cursor-grab active:cursor-grabbing'}`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Drag Preview */}
            {dragInfo && (
                <div 
                    className="fixed pointer-events-none px-4 py-3 md:px-6 md:py-4 bg-cyan-800 border-2 border-cyan-300 text-cyan-100 font-mono text-xs md:text-sm font-bold shadow-[0_0_30px_rgba(0,255,255,0.6)] z-50 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: dragInfo.curX, top: dragInfo.curY }}
                >
                    {eventLabels[dragInfo.type]}
                </div>
            )}

            {/* Game Over Screen */}
            {s.gameOver && (
                <div className="absolute inset-0 bg-[#061930]/90 flex flex-col items-center justify-center z-50 backdrop-blur-md pointer-events-auto">
                    <h2 className="text-4xl md:text-6xl text-cyan-300 font-mono font-bold mb-6 tracking-widest text-center px-4 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
                        {s.progress >= 100 ? 'JOURNEY COMPLETE' : 'TIME UP'}
                    </h2>
                    <div className="text-xl md:text-2xl text-cyan-100 font-mono mb-12 flex flex-col items-center gap-4">
                        <div>Final Career Progress: <span className="text-cyan-400 font-bold">{Math.floor(s.progress)}%</span></div>
                        {s.progress >= 100 && <div className="text-sm text-cyan-500 animate-pulse text-center">Outstanding progression!</div>}
                        {s.progress < 100 && <div className="text-sm text-cyan-600 text-center">Keep those connections tight next time.</div>}
                    </div>
                    <button 
                        onClick={initGame}
                        className="px-8 py-4 bg-cyan-900/50 border-2 border-cyan-400 text-cyan-100 font-mono font-bold hover:bg-cyan-800 hover:shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-300 tracking-wider"
                    >
                        START NEW JOURNEY
                    </button>
                </div>
            )}
        </div>
    );
}
