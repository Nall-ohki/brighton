import React, { useState, useMemo, useEffect } from 'react';
import { Shield, Swords, Wand2, Hammer, X, Check, Skull, Trophy } from 'lucide-react';
import './App.css';

type Stat = 'vision' | 'ideation' | 'execution' | 'pipeline';

interface ClassData {
    id: string;
    name: string;
    role: string;
    description: string;
    stats: Record<Stat, number>;
    icon: React.ReactNode;
}

const CLASSES: ClassData[] = [
    {
        id: 'art-director',
        name: 'Art Director',
        role: 'Tank (Vision)',
        description: 'Shields the team from terrible feedback and maintains the visual target.',
        stats: { vision: 9, ideation: 5, execution: 3, pipeline: 2 },
        icon: <Shield className="w-8 h-8 text-amber-700" />
    },
    {
        id: 'concept-artist',
        name: 'Concept Artist',
        role: 'DPS (Ideation)',
        description: 'Deals massive bursts of ideas and sets the creative foundation.',
        stats: { vision: 5, ideation: 9, execution: 4, pipeline: 2 },
        icon: <Swords className="w-8 h-8 text-red-700" />
    },
    {
        id: 'production-artist',
        name: 'Production Artist',
        role: 'Healer (Execution)',
        description: 'Fixes broken assets and tirelessly generates content to keep the game alive.',
        stats: { vision: 2, ideation: 3, execution: 9, pipeline: 5 },
        icon: <Wand2 className="w-8 h-8 text-emerald-700" />
    },
    {
        id: 'technical-artist',
        name: 'Technical Artist',
        role: 'Rogue (Pipeline)',
        description: 'Sneaks behind the pipeline to optimize shaders and automate the pain away.',
        stats: { vision: 2, ideation: 4, execution: 5, pipeline: 9 },
        icon: <Hammer className="w-8 h-8 text-blue-700" />
    }
];

interface Encounter {
    id: string;
    title: string;
    description: string;
    requirements: Partial<Record<Stat, number>>;
    successText: string;
    failureText: string;
}

const ENCOUNTERS: Encounter[] = [
    {
        id: 'style-pivot',
        title: 'The Week 8 Pivot',
        description: 'The CEO played a new indie game over the weekend. Now everything needs to be cel-shaded.',
        requirements: { vision: 12, ideation: 12 },
        successText: 'The team seamlessly transitions the visual direction without missing a beat.',
        failureText: 'The art style is a chaotic mess of PBR and flat colors. The project is delayed.'
    },
    {
        id: 'engine-update',
        title: 'Forced Engine Update',
        description: 'A forced engine update turned all the characters neon pink and broke the rig scripts.',
        requirements: { pipeline: 14, execution: 10 },
        successText: 'The shaders are fixed and the pipeline is automated to prevent future breaks!',
        failureText: 'The team manually re-assigns materials for weeks. Morale drops to zero.'
    },
    {
        id: 'crunch-time',
        title: 'Vertical Slice Deadline',
        description: 'Marketing needs a polished vertical slice of the game by Friday for an expo.',
        requirements: { execution: 16, vision: 8 },
        successText: 'The demo looks incredible. The internet goes wild over the trailers.',
        failureText: 'The demo crashes on stage. A character is T-posing in the background.'
    },
    {
        id: 'creative-block',
        title: 'Content Black Hole',
        description: 'Design needs 50 unique alien species, but everyone is completely out of ideas.',
        requirements: { ideation: 15, pipeline: 8 },
        successText: 'A flood of brilliant, procedurally assisted designs saves the day!',
        failureText: 'You end up with 50 variations of "a dog but green".'
    },
    {
        id: 'outsource-disaster',
        title: 'Outsource Disaster',
        description: 'The external studio delivered 10,000 assets with flipped normals and wrong naming conventions.',
        requirements: { pipeline: 12, execution: 14 },
        successText: 'Scripts fix the normals and everyone grinds out the integration perfectly.',
        failureText: 'The game ships with inside-out trees and upside-down rocks.'
    }
];

const STAT_COLORS = {
    vision: 'bg-purple-600',
    ideation: 'bg-red-600',
    execution: 'bg-emerald-600',
    pipeline: 'bg-blue-600'
};

export default function App() {
    const [party, setParty] = useState<(ClassData | null)[]>([null, null, null, null]);
    const [selectingSlot, setSelectingSlot] = useState<number | null>(null);
    const [encounter, setEncounter] = useState<Encounter | null>(null);
    const [result, setResult] = useState<'success' | 'failure' | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    const teamStats = useMemo(() => {
        const stats = { vision: 0, ideation: 0, execution: 0, pipeline: 0 };
        party.forEach(member => {
            if (member) {
                stats.vision += member.stats.vision;
                stats.ideation += member.stats.ideation;
                stats.execution += member.stats.execution;
                stats.pipeline += member.stats.pipeline;
            }
        });
        return stats;
    }, [party]);

    const isPartyFull = party.every(member => member !== null);

    const handleSelectClass = (cls: ClassData) => {
        if (selectingSlot !== null) {
            const newParty = [...party];
            newParty[selectingSlot] = cls;
            setParty(newParty);
            setSelectingSlot(null);
        }
    };

    const handleRemoveMember = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newParty = [...party];
        newParty[index] = null;
        setParty(newParty);
    };

    const handleFaceEncounter = () => {
        const randomEncounter = ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)];
        setEncounter(randomEncounter);
        setResult(null);
        setIsResolving(true);

        setTimeout(() => {
            let isSuccess = true;
            for (const [stat, req] of Object.entries(randomEncounter.requirements)) {
                if (teamStats[stat as Stat] < (req as number)) {
                    isSuccess = false;
                }
            }
            setResult(isSuccess ? 'success' : 'failure');
            setIsResolving(false);
        }, 2000);
    };

    const resetEncounter = () => {
        setEncounter(null);
        setResult(null);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
            <header className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-wider text-amber-900 drop-shadow-md">pARTy Composition</h1>
                <p className="text-xl md:text-2xl italic text-amber-800">Assemble your Art Team. Survive Game Dev.</p>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Party Selection */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h2 className="text-3xl font-bold text-amber-900 border-b-2 border-amber-900/30 pb-2">Your Party</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {party.map((member, index) => (
                            <div 
                                key={index}
                                onClick={() => setSelectingSlot(index)}
                                className={`parchment p-4 rounded-md cursor-pointer transition-transform hover:scale-[1.02] min-h-[160px] flex flex-col justify-center ${!member ? 'items-center border-dashed border-4 border-amber-900/20 opacity-70 hover:opacity-100' : ''}`}
                            >
                                {member ? (
                                    <div className="relative h-full flex flex-col">
                                        <button 
                                            onClick={(e) => handleRemoveMember(index, e)}
                                            className="absolute -top-2 -right-2 bg-red-800 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-20 shadow-md border-2 border-[#2b1f14]"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-amber-900/10 rounded border border-amber-900/20">{member.icon}</div>
                                            <div>
                                                <h3 className="text-xl font-bold">{member.name}</h3>
                                                <span className="text-sm italic font-semibold text-amber-800">{member.role}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-auto">
                                            {(Object.keys(member.stats) as Stat[]).map(stat => (
                                                <div key={stat} className="flex items-center text-sm">
                                                    <span className="w-16 capitalize font-bold text-amber-950">{stat}</span>
                                                    <div className="stat-bar-container flex-1">
                                                        <div className={`stat-bar-fill ${stat}`} style={{ width: `${(member.stats[stat] / 10) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-amber-900/50 flex flex-col items-center">
                                        <span className="text-4xl mb-2">+</span>
                                        <span className="font-bold text-lg">Empty Slot</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={handleFaceEncounter}
                            disabled={!isPartyFull || !!encounter}
                            className="btn-rpg px-12 py-4 text-2xl rounded-sm shadow-xl"
                        >
                            {isPartyFull ? 'Face The Industry' : 'Gather Your Party'}
                        </button>
                    </div>
                </div>

                {/* Team Stats Summary */}
                <div className="parchment p-6 rounded-md h-fit sticky top-8">
                    <h2 className="text-3xl font-bold text-amber-900 border-b-2 border-amber-900/30 pb-2 mb-6 text-center">Party Stats</h2>
                    
                    <div className="flex flex-col gap-6">
                        {(Object.keys(teamStats) as Stat[]).map(stat => (
                            <div key={stat}>
                                <div className="flex justify-between mb-1">
                                    <span className="capitalize font-bold text-lg text-amber-950">{stat}</span>
                                    <span className="font-bold text-lg">{teamStats[stat]}</span>
                                </div>
                                <div className="stat-bar-container h-4">
                                    <div className={`stat-bar-fill ${stat}`} style={{ width: `${Math.min(100, (teamStats[stat] / 36) * 100)}%` }}></div>
                                </div>
                                <p className="text-xs mt-1 text-amber-800 italic">
                                    {stat === 'vision' && 'Ability to maintain cohesive direction.'}
                                    {stat === 'ideation' && 'Capacity to generate new concepts.'}
                                    {stat === 'execution' && 'Speed and quality of asset creation.'}
                                    {stat === 'pipeline' && 'Tool creation and workflow optimization.'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Class Selection Modal */}
            {selectingSlot !== null && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="parchment w-full max-w-4xl p-6 md:p-8 rounded-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold">Select Class for Slot {selectingSlot + 1}</h2>
                            <button onClick={() => setSelectingSlot(null)} className="p-2 hover:bg-amber-900/10 rounded-full transition-colors"><X /></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {CLASSES.map(cls => (
                                <div 
                                    key={cls.id}
                                    onClick={() => handleSelectClass(cls)}
                                    className="border-2 border-amber-900/20 p-4 rounded bg-amber-50/50 hover:bg-amber-100/80 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col h-full"
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 bg-amber-900/10 rounded-full">{cls.icon}</div>
                                        <div>
                                            <h3 className="text-2xl font-bold">{cls.name}</h3>
                                            <span className="font-semibold text-amber-700">{cls.role}</span>
                                        </div>
                                    </div>
                                    <p className="mb-4 text-amber-900 italic flex-grow">{cls.description}</p>
                                    
                                    <div className="space-y-1 bg-amber-900/5 p-3 rounded border border-amber-900/10">
                                        {(Object.keys(cls.stats) as Stat[]).map(stat => (
                                            <div key={stat} className="flex justify-between text-sm">
                                                <span className="capitalize font-bold">{stat}</span>
                                                <span className="font-mono font-bold text-amber-950">{cls.stats[stat]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Encounter Modal */}
            {encounter && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className={`parchment w-full max-w-2xl p-8 rounded-lg text-center transform transition-all duration-700 ${isResolving ? 'scale-95 opacity-90' : 'scale-100 opacity-100 shadow-[0_0_50px_rgba(255,215,0,0.3)]'}`}>
                        <h3 className="text-amber-600 font-bold uppercase tracking-widest mb-2">Game Dev Encounter</h3>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-950">{encounter.title}</h2>
                        
                        <p className="text-xl md:text-2xl italic mb-8 border-y-2 border-amber-900/20 py-6">{encounter.description}</p>
                        
                        <div className="bg-amber-900/5 p-4 rounded-lg mb-8 inline-block mx-auto min-w-[250px]">
                            <h4 className="font-bold text-lg mb-3 border-b border-amber-900/20 pb-2">Required Stat Check</h4>
                            <div className="space-y-2 text-left">
                                {Object.entries(encounter.requirements).map(([stat, req]) => {
                                    const current = teamStats[stat as Stat];
                                    const passed = current >= (req as number);
                                    return (
                                        <div key={stat} className="flex items-center justify-between gap-4">
                                            <span className="capitalize font-bold w-24">{stat}</span>
                                            <div className="flex-1 stat-bar-container h-3 bg-amber-900/20">
                                                <div className={`stat-bar-fill ${stat}`} style={{ width: `${Math.min(100, (current / (req as number)) * 100)}%` }}></div>
                                            </div>
                                            <span className="font-mono w-16 text-right">
                                                <span className={isResolving ? '' : (passed ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold')}>
                                                    {current}
                                                </span>
                                                <span className="text-amber-900/50"> / {req}</span>
                                            </span>
                                            {!isResolving && (
                                                passed ? <Check size={18} className="text-emerald-600" /> : <X size={18} className="text-red-600" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="min-h-[120px] flex flex-col justify-center items-center">
                            {isResolving ? (
                                <div className="animate-pulse flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-amber-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-xl font-bold text-amber-900 uppercase tracking-widest">Rolling Stats...</p>
                                </div>
                            ) : (
                                <div className="animate-[fade-in_0.5s_ease-out]">
                                    {result === 'success' ? (
                                        <div className="text-emerald-800">
                                            <Trophy className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
                                            <h3 className="text-3xl font-bold mb-2">Success!</h3>
                                            <p className="text-lg">{encounter.successText}</p>
                                        </div>
                                    ) : (
                                        <div className="text-red-900">
                                            <Skull className="w-16 h-16 mx-auto mb-4 text-red-700" />
                                            <h3 className="text-3xl font-bold mb-2">Disaster!</h3>
                                            <p className="text-lg">{encounter.failureText}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {!isResolving && (
                            <button 
                                onClick={resetEncounter}
                                className="mt-8 btn-rpg px-8 py-3 rounded-sm"
                            >
                                Continue Development
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
