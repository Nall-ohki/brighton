import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Leaf, Bird, Turtle, Bug, Rabbit, Footprints } from 'lucide-react';

const MAP_SIZE = 40;
const TILE_SIZE = 60; // px

const ANIMAL_TYPES = {
    turtle: { icon: Turtle, color: '#2a9d8f', impact: 15, footprintReduction: 8, name: 'Sea Turtle' },
    bird: { icon: Bird, color: '#e76f51', impact: 10, footprintReduction: 5, name: 'Island Bird' },
    rabbit: { icon: Rabbit, color: '#f4a261', impact: 20, footprintReduction: 10, name: 'Wild Rabbit' },
    bug: { icon: Bug, color: '#e9c46a', impact: 5, footprintReduction: 2, name: 'Native Bug' },
};

function generateMap() {
    const tiles = [];
    const center = MAP_SIZE / 2;
    for (let y = 0; y < MAP_SIZE; y++) {
        const row = [];
        for (let x = 0; x < MAP_SIZE; x++) {
            const dist = Math.sqrt((x - center)**2 + (y - center)**2) + (Math.sin(x*0.5)*2 + Math.cos(y*0.5)*2);
            let type = 'water';
            if (dist < MAP_SIZE/2 - 4) {
                type = 'sand';
                if (dist < MAP_SIZE/2 - 7) {
                    type = 'grass';
                    if (dist < MAP_SIZE/2 - 12 && Math.random() < 0.7) {
                        type = 'forest';
                    }
                }
            }
            row.push(type);
        }
        tiles.push(row);
    }
    return tiles;
}

export default function App() {
    const [mapData, setMapData] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [playerPos, setPlayerPos] = useState({ x: MAP_SIZE/2, y: MAP_SIZE/2 });
    const [score, setScore] = useState(0);
    const [footprint, setFootprint] = useState(100);
    const [flash, setFlash] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Load friendly font
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700;800&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        const m = generateMap();
        setMapData(m);
        
        let startX = Math.floor(MAP_SIZE/2), startY = Math.floor(MAP_SIZE/2);
        while(m[startY][startX] === 'water') {
            startX++;
        }
        setPlayerPos({ x: startX, y: startY });

        const anims = [];
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                if (m[y][x] !== 'water' && Math.random() < 0.05) {
                    let type;
                    if (m[y][x] === 'sand') type = 'turtle';
                    else if (m[y][x] === 'forest') type = 'rabbit';
                    else type = Math.random() < 0.5 ? 'bird' : 'bug';
                    
                    anims.push({ id: Math.random().toString(36).substr(2, 9), x, y, type, photographed: false });
                }
            }
        }
        setAnimals(anims);
    }, []);

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    }

    const takePhoto = useCallback(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 150);

        let points = 0;
        let reduced = 0;
        let species = [];
        
        const newAnimals = animals.map(a => {
            if (!a.photographed && Math.abs(a.x - playerPos.x) <= 2 && Math.abs(a.y - playerPos.y) <= 2) {
                const def = ANIMAL_TYPES[a.type];
                points += def.impact;
                reduced += def.footprintReduction;
                species.push(def.name);
                return { ...a, photographed: true };
            }
            return a;
        });

        if (species.length > 0) {
            setAnimals(newAnimals);
            setScore(s => s + points);
            setFootprint(f => Math.max(0, f - reduced));
            
            const uniqueSpecies = [...new Set(species)];
            showNotification(`Photographed: ${uniqueSpecies.join(', ')}!`);
        } else {
            showNotification(`Nothing nearby to photograph.`);
        }
    }, [animals, playerPos]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            setPlayerPos(prev => {
                let {x, y} = prev;
                if (e.key === 'ArrowUp') y -= 1;
                if (e.key === 'ArrowDown') y += 1;
                if (e.key === 'ArrowLeft') x -= 1;
                if (e.key === 'ArrowRight') x += 1;
                
                if (y >= 0 && y < MAP_SIZE && x >= 0 && x < MAP_SIZE) {
                    if (mapData[y]?.[x] !== 'water') {
                        return {x, y};
                    }
                }
                return prev;
            });

            if (e.key === ' ') {
                takePhoto();
            }
        };
        window.addEventListener('keydown', handleKeyDown, { passive: false });
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mapData, takePhoto]);

    const canvasRef = useRef(null);
    useEffect(() => {
        if (!mapData.length || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const ts = TILE_SIZE;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Water base
        ctx.fillStyle = '#a2d2ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        mapData.forEach((row, y) => {
            row.forEach((type, x) => {
                if (type === 'water') return;

                const colors = {
                    sand: ['#fde2e4', '#fad2e1', '#ffe5d9'],
                    grass: ['#c1fba4', '#b5e48c', '#99d98c'],
                    forest: ['#7ebc89', '#52b788', '#40916c']
                };

                const palette = colors[type];
                
                for (let i = 0; i < 4; i++) {
                    ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                    ctx.globalAlpha = 0.6;
                    ctx.beginPath();
                    const cx = x * ts + ts/2 + (Math.random()*ts/2 - ts/4);
                    const cy = y * ts + ts/2 + (Math.random()*ts/2 - ts/4);
                    const r = ts/2 + Math.random()*15;
                    ctx.arc(cx, cy, r, 0, Math.PI*2);
                    ctx.fill();
                }
            });
        });
    }, [mapData]);

    return (
        <div style={{
            width: '100vw', height: '100vh', 
            overflow: 'hidden', 
            backgroundColor: '#a2d2ff',
            fontFamily: '"Quicksand", system-ui, sans-serif',
            color: '#2b2d42',
            position: 'relative'
        }}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <filter id="watercolor-filter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>

            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: 'none', zIndex: 50,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.08%22/%3E%3C/svg%3E")',
                mixBlendMode: 'multiply'
            }}></div>

            {/* Map Container */}
            <div style={{
                position: 'absolute',
                left: 0, top: 0,
                transform: `translate3d(calc(50vw - ${(playerPos.x + 0.5) * TILE_SIZE}px), calc(50vh - ${(playerPos.y + 0.5) * TILE_SIZE}px), 0)`,
                transition: 'transform 0.25s ease-out',
                width: MAP_SIZE * TILE_SIZE,
                height: MAP_SIZE * TILE_SIZE,
                filter: `saturate(${100 + (100 - footprint)}%) brightness(${1 + (100 - footprint)*0.002})`
            }}>
                <canvas 
                    ref={canvasRef} 
                    width={MAP_SIZE * TILE_SIZE} 
                    height={MAP_SIZE * TILE_SIZE}
                    style={{
                        filter: 'url(#watercolor-filter)',
                        position: 'absolute',
                        top: 0, left: 0
                    }}
                />

                {animals.map(a => {
                    const Def = ANIMAL_TYPES[a.type].icon;
                    return (
                        <div key={a.id} style={{
                            position: 'absolute',
                            left: a.x * TILE_SIZE,
                            top: a.y * TILE_SIZE,
                            width: TILE_SIZE, height: TILE_SIZE,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: a.photographed ? 0.4 : 1,
                            transition: 'opacity 0.5s ease',
                            filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.2))'
                        }}>
                            <Def size={32} color={ANIMAL_TYPES[a.type].color} strokeWidth={2.5} />
                            {a.photographed && (
                                <div style={{ position: 'absolute', top: 5, right: 5 }}>
                                    <Leaf size={18} color="#2a9d8f" fill="#2a9d8f" />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Player Fixed in Center */}
            <div style={{
                position: 'fixed',
                left: '50vw', top: '50vh',
                transform: 'translate(-50%, -50%)',
                width: TILE_SIZE, height: TILE_SIZE,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <div style={{
                    width: 36, height: 36,
                    backgroundColor: '#e63946',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                    border: '3px solid #fff'
                }}>
                    <Camera size={20} color="#fff" />
                </div>
            </div>

            {/* Flash Effect */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#fff',
                opacity: flash ? 0.8 : 0,
                pointerEvents: 'none',
                transition: 'opacity 0.1s ease-out',
                zIndex: 100
            }} />

            {/* UI Overlay */}
            <div style={{ position: 'fixed', top: 20, left: 20, right: 20, zIndex: 60, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
                
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    display: 'flex', flexDirection: 'column', gap: 8,
                    border: '1px solid rgba(255,255,255,0.4)',
                    pointerEvents: 'auto'
                }}>
                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1d3557', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Leaf size={24} color="#457b9d" />
                        Alba's Lens
                    </h1>
                    <div style={{ fontSize: '14px', color: '#457b9d', fontWeight: 700 }}>
                        Impact Score: <span style={{ fontSize: '24px', color: '#e63946', fontWeight: 800 }}>{score}</span>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    border: '1px solid rgba(255,255,255,0.4)',
                    pointerEvents: 'auto',
                    minWidth: '200px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1d3557', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Footprints size={18} color="#1d3557" />
                            Island Footprint
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: footprint < 30 ? '#2a9d8f' : footprint < 70 ? '#f4a261' : '#e76f51' }}>
                            {footprint}%
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '12px', backgroundColor: '#e5e5e5', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${footprint}%`,
                            height: '100%',
                            backgroundColor: footprint < 30 ? '#2a9d8f' : footprint < 70 ? '#f4a261' : '#e76f51',
                            transition: 'width 0.5s ease-out, background-color 0.5s ease'
                        }} />
                    </div>
                </div>
            </div>

            {/* Notification */}
            <div style={{
                position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
                backgroundColor: '#2a9d8f',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '30px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                opacity: notification ? 1 : 0,
                transition: 'opacity 0.3s ease',
                zIndex: 60,
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
            }}>
                {notification}
            </div>

            {/* Instructions */}
            <div style={{
                position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(4px)',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#457b9d',
                zIndex: 60,
                pointerEvents: 'none',
                display: 'flex',
                gap: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <kbd style={kbdStyle}>←</kbd><kbd style={kbdStyle}>↑</kbd><kbd style={kbdStyle}>↓</kbd><kbd style={kbdStyle}>→</kbd> Move
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <kbd style={kbdStyle}>Space</kbd> Photograph
                </span>
            </div>
        </div>
    );
}

const kbdStyle = {
    backgroundColor: '#fff',
    border: '1px solid #c9d6df',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '12px',
    boxShadow: '0 2px 0 #c9d6df',
    color: '#1d3557',
    fontFamily: 'monospace',
    fontWeight: 'bold'
};
