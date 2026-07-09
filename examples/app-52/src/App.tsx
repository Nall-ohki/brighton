import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// --- DICTIONARIES ---
const MECH_WORDS = ['mech', 'machin', 'gear', 'cog', 'robot', 'factor', 'engin', 'sharp', 'geomet', 'metal', 'logic', 'puzzl', 'grid', 'rigid', 'fast', 'futur', 'tech', 'build', 'construct', 'system', 'automat', 'cyber', 'gun', 'car', 'ship', 'space', 'craft', 'physic'];

const EMO_WORDS = ['feel', 'love', 'sad', 'happy', 'fluid', 'dream', 'soul', 'heart', 'memor', 'fear', 'joy', 'natur', 'flow', 'soft', 'cri', 'tear', 'smile', 'warm', 'cold', 'dark', 'light', 'friend', 'alon', 'journey', 'art', 'relax', 'chill', 'music', 'sound', 'poem', 'stori'];

const GENRE_WORDS = ['rpg', 'platform', 'shoot', 'fps', 'mmo', 'adventur', 'action', 'arcad', 'pixel', 'retro', 'fantas', 'quest', 'rogue', 'card', 'board', 'sim', 'strateg', 'tacti', 'fight', 'beat', 'race', 'sport', 'surviv', 'horror', 'indie', 'casual', 'moba', 'gacha'];

function analyzeWords(w1: string, w2: string, w3: string) {
    let m = 0;
    let e = 0;
    let g = 0;
    
    const words = [w1.toLowerCase(), w2.toLowerCase(), w3.toLowerCase()];
    let totalMatched = 0;
    
    words.forEach(w => {
        if (!w.trim()) return;
        let matched = false;
        MECH_WORDS.forEach(k => { if (w.includes(k)) { m += 1; matched = true; }});
        EMO_WORDS.forEach(k => { if (w.includes(k)) { e += 1; matched = true; }});
        GENRE_WORDS.forEach(k => { if (w.includes(k)) { g += 1; matched = true; }});
        
        // If it doesn't fit standard categories well, slightly boost emotional for base organic noise.
        if (!matched) {
            e += 0.3;
        } else {
            totalMatched++;
        }
    });

    return {
        mech: Math.min(m / 2, 1.0), 
        emo: Math.min(e / 2, 1.0),
        genre: Math.min(g / 2, 1.0),
        hash: (w1.length * 13 + w2.length * 17 + w3.length * 23) % 100 / 100
    };
}

// --- SHADER ---
const fragmentShader = `
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_mech;
uniform float u_emo;
uniform float u_genre;
uniform float u_hash;

// Hash functions for noise
vec2 hash2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float noise( vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float fbm( vec2 p ) {
    float f = 0.0;
    float w = 0.5;
    for(int i=0; i<5; i++) {
        f += w * noise(p);
        p *= 2.0;
        w *= 0.5;
    }
    return f;
}

// Generates sharp geometric patterns (Mech)
float hex(vec2 p) {
    p.x *= 0.57735*2.0;
    p.y += mod(floor(p.x), 2.0)*0.5;
    p = abs((mod(p, 1.0) - 0.5));
    return abs(max(p.x*1.5 + p.y, p.y*2.0) - 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    // Genre: Pixelation
    float pixelAmount = mix(1.0, 40.0, clamp(u_genre * 1.5, 0.0, 1.0));
    if (u_genre > 0.05) {
        // quantize coordinates
        p = floor(p * u_resolution.y / pixelAmount) / (u_resolution.y / pixelAmount);
    }

    float t = u_time * 0.3;
    
    // Emotional: Fluid organic shapes using domain warping
    // Base force is always present so there's a default shifting background
    float emoForce = mix(0.2, 2.5, u_emo); 
    vec2 q = vec2(fbm(p + vec2(t)), fbm(p + vec2(-t, t * 0.8)));
    vec2 r = vec2(fbm(p + q * emoForce + vec2(t * 1.2, -t)), fbm(p + q * emoForce - vec2(-t * 0.5, t)));
    
    vec2 deformedP = p + r * emoForce;
    
    // Base color modulated by hash
    vec3 c1 = vec3(0.8 + 0.2*sin(u_hash*10.0), 0.5 + 0.3*cos(u_hash*5.0), 0.6 + 0.3*sin(u_hash*2.0));
    vec3 c2 = vec3(0.2 + 0.3*cos(u_hash*12.0), 0.6 + 0.2*sin(u_hash*4.0), 0.8 + 0.1*cos(u_hash*7.0));
    vec3 c3 = vec3(0.9, 0.85, 0.7);
    
    // Soft watercolor mix
    float mixFactor = smoothstep(-1.5, 1.5, deformedP.x + deformedP.y);
    vec3 col = mix(c1, c2, mixFactor);
    col = mix(col, c3, fbm(deformedP * 2.0) * 0.6);
    
    // Mechanical: Sharp geometric patterns
    if (u_mech > 0.01) {
        float mechForce = clamp(u_mech * 1.5, 0.0, 1.0);
        float h = hex(p * mix(1.0, 6.0, mechForce) + r*0.5);
        float edge = smoothstep(0.3, 0.35, h);
        
        // Add rigid grid lines
        vec2 grid = abs(fract(p * mix(2.0, 10.0, mechForce)) - 0.5);
        float line = smoothstep(0.45, 0.48, max(grid.x, grid.y));
        
        col = mix(col, vec3(0.9), edge * mechForce * 0.6);
        col = mix(col, vec3(0.1, 0.1, 0.2), line * mechForce * 0.4);
        
        // Quantize colors for a harder look
        if (u_mech > 0.3) {
            col = mix(col, floor(col * 5.0) / 5.0, mechForce * 0.4);
        }
    }
    
    // Watercolor paper texture
    float paper = noise(p * 200.0) * 0.05;
    col -= paper;
    
    // Vignette
    float len = length(uv - 0.5);
    col *= 1.0 - smoothstep(0.4, 1.4, len) * 0.6;

    gl_FragColor = vec4(col, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    // Discard camera transforms, render as a fullscreen quad
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const Visualizer = ({ words }: { words: string[] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { size } = useThree();
    
    const targetValues = useRef({ mech: 0, emo: 0.2, genre: 0, hash: 0.5 });
    
    useEffect(() => {
        // Don't analyze until they start typing somewhat
        if (words.some(w => w.length > 1)) {
            const stats = analyzeWords(words[0], words[1], words[2]);
            targetValues.current = stats;
        } else {
            // Default ambient state
            targetValues.current = { mech: 0.0, emo: 0.2, genre: 0.0, hash: 0.5 };
        }
    }, [words]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
            materialRef.current.uniforms.u_resolution.value.set(size.width, size.height);
            
            // Smooth morphing
            materialRef.current.uniforms.u_mech.value += (targetValues.current.mech - materialRef.current.uniforms.u_mech.value) * 0.03;
            materialRef.current.uniforms.u_emo.value += (targetValues.current.emo - materialRef.current.uniforms.u_emo.value) * 0.03;
            materialRef.current.uniforms.u_genre.value += (targetValues.current.genre - materialRef.current.uniforms.u_genre.value) * 0.03;
            materialRef.current.uniforms.u_hash.value += (targetValues.current.hash - materialRef.current.uniforms.u_hash.value) * 0.03;
        }
    });

    const uniforms = useMemo(
        () => ({
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(size.width, size.height) },
            u_mech: { value: 0 },
            u_emo: { value: 0.2 },
            u_genre: { value: 0 },
            u_hash: { value: 0.5 }
        }),
        [size]
    );

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
};

export default function App() {
    const [word1, setWord1] = useState('');
    const [word2, setWord2] = useState('');
    const [word3, setWord3] = useState('');

    return (
        <div className="w-full h-screen relative overflow-hidden bg-[#1a1a1a] font-sans">
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <Visualizer words={[word1, word2, word3]} />
                </Canvas>
            </div>
            
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="pointer-events-auto bg-black/20 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl flex flex-col items-center gap-8 max-w-lg w-full mx-4"
                >
                    <div className="text-center space-y-3">
                        <h1 className="text-4xl font-bold text-white tracking-tight">The Soul of Your Game</h1>
                        <p className="text-white/70 text-sm font-medium">Describe your game design in three words to reveal its visual core.</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 w-full">
                        <input
                            type="text"
                            placeholder="e.g. Robot"
                            value={word1}
                            onChange={(e) => setWord1(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-white/10 focus:ring-4 focus:ring-white/5 transition-all text-center text-xl uppercase tracking-[0.2em] font-semibold"
                        />
                        <input
                            type="text"
                            placeholder="e.g. Melancholy"
                            value={word2}
                            onChange={(e) => setWord2(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-white/10 focus:ring-4 focus:ring-white/5 transition-all text-center text-xl uppercase tracking-[0.2em] font-semibold"
                        />
                        <input
                            type="text"
                            placeholder="e.g. Platformer"
                            value={word3}
                            onChange={(e) => setWord3(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-white/10 focus:ring-4 focus:ring-white/5 transition-all text-center text-xl uppercase tracking-[0.2em] font-semibold"
                        />
                    </div>
                    
                    <div className="text-white/40 text-xs mt-2 text-center uppercase tracking-widest font-bold">
                        Keep tweaking until the visual 'clicks'
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
