

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { resources, promptIdeas } from './data';

export type AppType = 'Game' | 'Simulation' | 'Tool' | 'Other';
type Target = 'Gemini Canvas' | 'AI Studio';
type Modifier = '2D' | '3D' | 'Audio' | 'Physics' | 'Perception' | 'Data Viz';

type SelectedModifiers = Record<Modifier, string | null>;
type AddOns = {
  reduceTokens: boolean;
  debugPanel: boolean;
  encourageInheritance: boolean;
  centralizeGlobals: boolean;
};


const initialModifiers: SelectedModifiers = {
  '2D': null,
  '3D': null,
  'Audio': null,
  'Physics': null,
  'Perception': null,
  'Data Viz': null,
};

const recommendedModifiers: Record<AppType, Modifier[]> = {
  Game: ['2D', 'Audio', 'Physics'],
  Simulation: ['2D', 'Physics'],
  Tool: [],
  Other: [],
};

const PromptBuilderPage = () => {
  const [appType, setAppType] = useState<AppType>('Tool');
  const [target, setTarget] = useState<Target>('Gemini Canvas');
  const [idea, setIdea] = useState(() => {
    const pending = window.sessionStorage.getItem('pendingIdea');
    if (pending) {
      window.sessionStorage.removeItem('pendingIdea');
      return pending;
    }
    return 'A simple breakout-style game where the paddle is controlled by your hand.';
  });
  const [modifiers, setModifiers] = useState<SelectedModifiers>(initialModifiers);
  const [isOtherModifierActive, setIsOtherModifierActive] = useState(false);
  const [otherModifierText, setOtherModifierText] = useState('');
  const [addOns, setAddOns] = useState<AddOns>({
    reduceTokens: true,
    debugPanel: false,
    encourageInheritance: false,
    centralizeGlobals: true,
  });
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt');

  useEffect(() => {
    const handleLoadIdea = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setIdea(customEvent.detail);
      }
    };
    window.addEventListener('loadIdea', handleLoadIdea);
    return () => window.removeEventListener('loadIdea', handleLoadIdea);
  }, []);



  const modifierOptions = useMemo(() => {
    const options: Record<string, { tool: string; canvasRecommended: boolean; aiStudioRecommended: boolean; }[]> = {};
    for (const resource of resources) {
        if (!options[resource.category]) {
            options[resource.category] = [];
        }
        options[resource.category].push({
            tool: resource.tool,
            canvasRecommended: resource.canvasRecommended,
            aiStudioRecommended: resource.aiStudioRecommended
        });
    }
    return options as Record<Modifier, { tool: string; canvasRecommended: boolean; aiStudioRecommended: boolean; }[]>;
  }, []);

  const getRecommendedLibrary = useCallback((modifier: Modifier, currentTarget: Target): string | null => {
      const options = modifierOptions[modifier];
      if (!options || options.length === 0) return null;

      const targetProp = currentTarget === 'Gemini Canvas' ? 'canvasRecommended' : 'aiStudioRecommended';
      const recommended = options.find(opt => opt[targetProp]);

      return recommended ? recommended.tool : options[0].tool;
  }, [modifierOptions]);


  useEffect(() => {
    let recommended = recommendedModifiers[appType];

    if (appType === 'Game' && target === 'Gemini Canvas') {
      recommended = recommended.filter(mod => mod !== 'Audio' && mod !== 'Physics');
    }
    
    const newModifiers: SelectedModifiers = { ...initialModifiers };
    recommended.forEach(mod => {
        newModifiers[mod] = getRecommendedLibrary(mod, target);
    });



    setModifiers(newModifiers);
  }, [appType, target, getRecommendedLibrary]);
  
  useEffect(() => {
    const isAiStudio = target === 'AI Studio';
    const isGameOrSim = appType === 'Game' || appType === 'Simulation';

    setAddOns(prev => ({
      centralizeGlobals: prev.centralizeGlobals,
      reduceTokens: target === 'Gemini Canvas',
      debugPanel: isAiStudio && isGameOrSim,
      encourageInheritance: isAiStudio,
    }));
  }, [appType, target]);

  const handleModifierToggle = (modifier: Modifier) => {
    setModifiers(prev => {
        const newModifiers = { ...prev };
        const isCurrentlyActive = !!newModifiers[modifier];

        if (isCurrentlyActive) {
            // Deactivate the modifier
            newModifiers[modifier] = null;
        } else {
            // Activate the modifier
            newModifiers[modifier] = getRecommendedLibrary(modifier, target);
            // Enforce mutual exclusivity for 2D and 3D
            if (modifier === '2D' && newModifiers['3D']) {
                newModifiers['3D'] = null;
            }
            if (modifier === '3D' && newModifiers['2D']) {
                newModifiers['2D'] = null;
            }
        }
        return newModifiers;
    });
  };

  const handleModifierSelectionChange = (modifier: Modifier, library: string) => {
    setModifiers(prev => ({...prev, [modifier]: library}));
  };

  const handleAddOnToggle = (addOn: keyof AddOns) => {
    setAddOns(prev => ({ ...prev, [addOn]: !prev[addOn] }));
  };

  const synthesizedPrompt = useMemo(() => {
    let prompt = `Create a a "${appType}" web application.

Core idea:
${idea}

Technical implementation details:
`;
    const techDetails: string[] = [];
    
    // Predefined modifiers
    const activeModifiers = Object.entries(modifiers)
        .filter(([, library]) => library !== null);

    if (activeModifiers.length > 0) {
        activeModifiers.forEach(([mod, lib]) => {
            techDetails.push(`- Use ${lib} for ${mod} functionality.`);
        });
    }

    // Custom modifier
    if (isOtherModifierActive && otherModifierText.trim()) {
      techDetails.push(`- Additionally, incorporate the following custom libraries/instructions:\n  ${otherModifierText.trim().replace(/\n/g, '\n  ')}`);
    }
    
    if (techDetails.length > 0) {
        prompt += techDetails.join('\n');
    } else {
        prompt += '- Use standard HTML, CSS, and JavaScript with no external libraries.';
    }


    const addOnPrompts: string[] = [];
    if (addOns.reduceTokens) {
        addOnPrompts.push("Prefer short, abbreviated identifiers in code to reduce token count. Use simple classes like `class V2 { x: number; y: number; }` to reduce token count.");
    }
    if (addOns.debugPanel) {
        addOnPrompts.push("Create an editable debug panel next to the playfield. All global variables which affect the game or simulation are live-editable from this panel.");
    }
    if (addOns.encourageInheritance) {
      addOnPrompts.push("When creating multiple variations of a type (such as a game entity), default to using Object inheritance to implement.");
      if (target === 'Gemini Canvas') {
        // Nothing
      } else {  // AI Studio
        addOnPrompts.push("For inheritance trees, place each class declaration in its own file.");
      }
    }
    if (addOns.centralizeGlobals) {
      if (target === 'Gemini Canvas') {
        addOnPrompts.push("Place all global variables into a root-level object called `G`.");
      } else { // AI Studio
        addOnPrompts.push("Place all global variables into a file called `globals.tsx`.");
      }
    }

    if (addOnPrompts.length > 0) {
        prompt += '\n\nAdditional features and guidelines:\n';
        prompt += addOnPrompts.map(p => `- ${p}`).join('\n');
    }

    if (target === 'Gemini Canvas') {
        prompt += `\n- The app should be visually interesting and interactive.`;
    } else { // AI Studio
         prompt += `\n- When generating the code, create separate files for HTML, CSS, and TypeScript. The code should be well-structured and easy to read.`;
    }

    return prompt;
  }, [appType, target, idea, modifiers, addOns, isOtherModifierActive, otherModifierText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(synthesizedPrompt).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Prompt'), 2000);
    });
  };

  const getTargetLink = () => {
      const encodedPrompt = encodeURIComponent(synthesizedPrompt);
      if (target === 'Gemini Canvas') {
          return `https://g.co/gemini/canvas`;
      }
      return `https://aistudio.google.com/apps`;
  };

  const libraryToModifierMap = useMemo(() => {
    const map = new Map<string, Modifier>();
    for (const resource of resources) {
        map.set(resource.tool, resource.category as Modifier);
    }
    map.set('HTML Canvas', '2D');
    map.set('WebGL', '3D');
    return map;
  }, []);

  const handleFeelingLucky = useCallback(() => {
    // Filter by the selected app type
    let availableIdeas = promptIdeas.filter(idea => idea.category === appType);

    // Filter by target environment compatibility
    if (target === 'Gemini Canvas') {
      availableIdeas = availableIdeas.filter(idea => idea.canvasLibraries.length > 0);
    } else { // AI Studio
      availableIdeas = availableIdeas.filter(idea => idea.aiStudioLibraries.length > 0);
    }
    
    // Fallback if no ideas match the target environment
    if (availableIdeas.length === 0) {
      availableIdeas = promptIdeas.filter(idea => idea.category === appType);
      if (availableIdeas.length === 0) return; // No ideas for this category at all
    }

    const randomIndex = Math.floor(Math.random() * availableIdeas.length);
    const luckyIdea = availableIdeas[randomIndex];

    setIdea(luckyIdea.prompt);

    const libsForTarget = target === 'Gemini Canvas' ? luckyIdea.canvasLibraries : luckyIdea.aiStudioLibraries;

    const newModifiers: SelectedModifiers = { ...initialModifiers };
    const otherModifierLibs: string[] = [];
    const modifierToLibsMap = new Map<Modifier, string[]>();

    libsForTarget.forEach(lib => {
        const modifier = libraryToModifierMap.get(lib);
        if (modifier) {
            if (!modifierToLibsMap.has(modifier)) {
                modifierToLibsMap.set(modifier, []);
            }
            modifierToLibsMap.get(modifier)!.push(lib);
        } else {
            otherModifierLibs.push(lib);
        }
    });

    modifierToLibsMap.forEach((libs, mod) => {
        let bestLib = libs[0];
        const targetProp = target === 'Gemini Canvas' ? 'canvasRecommended' : 'aiStudioRecommended';
        
        const recommendedLib = libs.find(lib => {
            const resource = resources.find(r => r.tool === lib);
            return resource ? resource[targetProp] : false;
        });

        if (recommendedLib) {
            bestLib = recommendedLib;
        }
        
        newModifiers[mod] = bestLib;
    });

    if (newModifiers['2D'] && newModifiers['3D']) {
        newModifiers['2D'] = null;
    }

    setModifiers(newModifiers);

    if (otherModifierLibs.length > 0) {
        setIsOtherModifierActive(true);
        setOtherModifierText(`Use ${otherModifierLibs.join(', ')} for additional functionality.`);
    } else {
        setIsOtherModifierActive(false);
        setOtherModifierText('');
    }
  }, [appType, target, libraryToModifierMap]);


  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');

  return (
    <>
<div className="prompt-builder-layout">
        <div className="prompt-panel">
          <h2>Your App Idea</h2>

          <div className="form-group">
            <div className="form-group-header">
                <label htmlFor="app-idea">Describe your core idea</label>
                <button className="btn lucky-btn" onClick={handleFeelingLucky}>
                    I'm feeling lucky ✨
                </button>
            </div>
            <textarea
              id="app-idea"
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="e.g., A visualization of real-time weather data as abstract art."
            ></textarea>
          </div>
          <div className="form-group">
            <label>What kind of app do you want to create?</label>
            <div className="radio-group-container">
                {(['Tool', 'Simulation', 'Game', 'Other'] as AppType[]).map(type => (
                    <div key={type} className="radio-option">
                        <input
                            type="radio"
                            id={`app-type-${type}`}
                            name="app-type"
                            value={type}
                            checked={appType === type}
                            onChange={e => setAppType(e.target.value as AppType)}
                        />
                        <label
                            htmlFor={`app-type-${type}`}
                            data-category={slugify(type)}
                        >
                            {type}
                        </label>
                    </div>
                ))}
            </div>
          </div>
          <div className="form-group">
            <label>Technical Modifiers (Recommended based on App Type)</label>
            <div className="modifiers-group">
                {(Object.keys(initialModifiers) as Modifier[]).map(mod => {
                    const selectedLibrary = modifiers[mod];
                    const isActive = selectedLibrary !== null;
                    const options = modifierOptions[mod];

                    return (
                        <div key={mod} className="modifier-control">
                            <button
                                className={`category-filter ${isActive ? 'active' : ''}`}
                                onClick={() => handleModifierToggle(mod)}
                                aria-pressed={isActive}
                                data-category={slugify(mod)}
                            >
                                {mod}
                            </button>
                            {isActive && options && options.length > 0 && (
                                <div className="modifier-select-wrapper">
                                    <select
                                        value={selectedLibrary || ''}
                                        onChange={(e) => handleModifierSelectionChange(mod, e.target.value)}
                                        aria-label={`Select library for ${mod}`}
                                    >
                                        {options.map(opt => (
                                            <option key={opt.tool} value={opt.tool}>
                                                {opt.tool}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div className="modifier-control">
                    <button
                        className={`category-filter ${isOtherModifierActive ? 'active' : ''}`}
                        onClick={() => setIsOtherModifierActive(prev => !prev)}
                        aria-pressed={isOtherModifierActive}
                    >
                        Other
                    </button>
                    {isOtherModifierActive && (
                        <div className="modifier-select-wrapper">
                            <textarea
                                value={otherModifierText}
                                onChange={(e) => setOtherModifierText(e.target.value)}
                                placeholder="e.g., Use my-custom-library.js for special effects."
                                aria-label="Specify custom libraries"
                                className="modifier-textarea"
                            ></textarea>
                        </div>
                    )}
                </div>
            </div>
          </div>
          <div className="form-group">
            <label>Add-Ons</label>
            <div className="addons-group">
              <div className="checkbox-option">
                <input
                  type="checkbox"
                  id="addon-reduce-tokens"
                  checked={addOns.reduceTokens}
                  onChange={() => handleAddOnToggle('reduceTokens')}
                />
                <label htmlFor="addon-reduce-tokens">Reduce Token Usage</label>
              </div>
              <div className="checkbox-option">
                <input
                  type="checkbox"
                  id="addon-debug-panel"
                  checked={addOns.debugPanel}
                  onChange={() => handleAddOnToggle('debugPanel')}
                />
                <label htmlFor="addon-debug-panel">Add Realtime Debug Panel</label>
              </div>
              <div className="checkbox-option">
                <input
                  type="checkbox"
                  id="addon-encourage-inheritance"
                  checked={addOns.encourageInheritance}
                  onChange={() => handleAddOnToggle('encourageInheritance')}
                />
                <label htmlFor="addon-encourage-inheritance">Encourage Inheritance</label>
              </div>
              <div className="checkbox-option">
                <input
                  type="checkbox"
                  id="addon-centralize-globals"
                  checked={addOns.centralizeGlobals}
                  onChange={() => handleAddOnToggle('centralizeGlobals')}
                />
                <label htmlFor="addon-centralize-globals">Centralize global variables</label>
              </div>
            </div>
          </div>
        </div>
        <div className="prompt-panel">
          <h2>Synthesized Prompt</h2>
          <div className="radio-group-container" style={{ marginBottom: '1rem' }}>
              {(['Gemini Canvas', 'AI Studio'] as Target[]).map(t => (
                   <div key={t} className="radio-option">
                      <input
                          type="radio"
                          id={`target-${t.replace(/\s+/g, '-')}`}
                          name="target-env"
                          value={t}
                          checked={target === t}
                          onChange={e => setTarget(e.target.value as Target)}
                      />
                      <label htmlFor={`target-${t.replace(/\s+/g, '-')}`}>{t}</label>
                  </div>
              ))}
          </div>
          <pre className="synthesized-prompt">
            <code>{synthesizedPrompt}</code>
          </pre>
          <div style={{ flexGrow: 0.25 }}></div>
          <div className="prompt-actions">
            <button className="btn" onClick={handleCopy}>{copyButtonText}</button>
            <a
              href={getTargetLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn ${target === 'Gemini Canvas' ? 'gemini-canvas-button' : ''}`}>
                Open {target}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromptBuilderPage;