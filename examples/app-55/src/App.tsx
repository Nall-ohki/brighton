import React, { useState } from 'react';
import { motion as m } from 'framer-motion';

const ControlSlider = ({ label, value, setValue, leftLabel, rightLabel }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-xs text-gray-400 font-mono">{value}%</span>
    </div>
    <input 
      type="range" 
      min="0" max="100" 
      value={value} 
      onChange={(e) => setValue(Number(e.target.value))}
      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
    />
    <div className="flex justify-between text-xs text-gray-400 font-medium">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
  </div>
);

const Meter = ({ label, value }) => {
  const percentage = (value + 100) / 2;
  
  return (
    <div className="flex flex-col gap-1 my-2">
      <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <span>{label.split('↔')[0].trim()}</span>
        <span>{label.split('↔')[1].trim()}</span>
      </div>
      <div className="relative w-full h-1.5 bg-gray-100 rounded-full mt-1">
        <div className="absolute top-1/2 left-1/2 w-px h-3 -mt-1.5 bg-gray-300 z-0" />
        <m.div 
          className="absolute top-1/2 w-3 h-3 -mt-1.5 -ml-1.5 bg-gray-900 rounded-full shadow-sm z-10"
          initial={false}
          animate={{ left: `${percentage}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default function App() {
  const [typography, setTypography] = useState(50);
  const [spacing, setSpacing] = useState(50);
  const [motion, setMotion] = useState(50);
  const [colorTemp, setColorTemp] = useState(50);

  const tNorm = (typography - 50) / 50;
  const sNorm = (spacing - 50) / 50;
  const mNorm = (motion - 50) / 50;
  const cNorm = (colorTemp - 50) / 50;

  const serious = (-tNorm - sNorm - mNorm - cNorm) * 25;
  const quiet = (-tNorm + sNorm - mNorm - cNorm) * 25;
  const soft = (tNorm + sNorm - mNorm + cNorm) * 25;

  const isPlayful = serious < 0;
  const isQuiet = quiet > 0;
  const isSoft = soft > 0;

  let archetype = "Neutral";
  if (isPlayful && !isQuiet && !isSoft) archetype = "Rebel";
  else if (isPlayful && !isQuiet && isSoft) archetype = "Jester";
  else if (isPlayful && isQuiet && !isSoft) archetype = "Magician";
  else if (isPlayful && isQuiet && isSoft) archetype = "Innocent";
  else if (!isPlayful && !isQuiet && !isSoft) archetype = "Hero";
  else if (!isPlayful && !isQuiet && isSoft) archetype = "Everyman";
  else if (!isPlayful && isQuiet && !isSoft) archetype = "Ruler";
  else if (!isPlayful && isQuiet && isSoft) archetype = "Sage";

  const getFontFamily = (t) => {
    if (t < 25) return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    if (t < 50) return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    if (t < 75) return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    return '"Arial Rounded MT Bold", "Nunito", "Quicksand", "Comic Sans MS", sans-serif';
  };

  let hue = 220 + (colorTemp / 100) * 170;
  if (hue > 360) hue -= 360;

  const primaryColor = `hsl(${hue}, 80%, 55%)`;
  const bgColor = `hsl(${hue}, 20%, 96%)`;
  const textColor = `hsl(${hue}, 30%, 15%)`;

  let textTransform = 'capitalize';
  if (serious > 33) textTransform = 'uppercase';
  else if (serious < -33) textTransform = 'lowercase';

  let fontWeight = 500;
  if (quiet < -33) fontWeight = 800;
  else if (quiet > 33) fontWeight = 300;

  const buttonBgOpacity = (100 - quiet) / 200;
  const isBgDark = buttonBgOpacity > 0.5;
  const defaultButtonColor = isBgDark ? '#ffffff' : primaryColor;
  const defaultButtonBg = `hsla(${hue}, 80%, 55%, ${buttonBgOpacity})`;
  const hoverButtonBg = isBgDark ? `hsla(${hue}, 80%, 55%, 0)` : `hsla(${hue}, 80%, 55%, 1)`;
  const hoverButtonColor = isBgDark ? primaryColor : '#ffffff';

  const transitionDurationMs = 1000 - (motion / 100) * 850;
  const baseTransition = `all ${transitionDurationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-white text-gray-900 font-sans">
      {/* Controls Panel */}
      <div className="w-full md:w-1/3 min-w-[320px] max-w-md border-r border-gray-200 p-8 flex flex-col gap-8 overflow-y-auto z-10 bg-white shadow-xl md:shadow-none">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Interface as Identity</h1>
          <p className="text-sm text-gray-500">Tune the sliders to shape the brand personality and uncover its archetype.</p>
        </div>

        <div className="flex flex-col gap-6">
          <ControlSlider label="Typography" value={typography} setValue={setTypography} leftLabel="Monospace" rightLabel="Display" />
          <ControlSlider label="Spacing Density" value={spacing} setValue={setSpacing} leftLabel="Tight" rightLabel="Loose" />
          <ControlSlider label="Motion Speed" value={motion} setValue={setMotion} leftLabel="Slow" rightLabel="Fast" />
          <ControlSlider label="Color Temperature" value={colorTemp} setValue={setColorTemp} leftLabel="Cool" rightLabel="Warm" />
        </div>

        <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Personality Meters</h2>
          
          <Meter label="Playful ↔ Serious" value={serious} />
          <Meter label="Loud ↔ Quiet" value={quiet} />
          <Meter label="Sharp ↔ Soft" value={soft} />

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between shadow-inner">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Archetype</span>
            <m.span 
              key={archetype}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-black text-gray-900 tracking-tight"
            >
              {archetype}
            </m.span>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center transition-colors"
        style={{ backgroundColor: bgColor, transitionDuration: `${transitionDurationMs}ms` }}
      >
        <m.div 
          className="relative flex flex-col items-center justify-center border-2 shadow-2xl backdrop-blur-sm bg-white/30"
          animate={{
            y: [0, -10 * (motion / 100), 0]
          }}
          transition={{
            duration: 4 - (motion / 100) * 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            borderColor: `hsla(${hue}, 50%, 80%, 0.5)`,
            padding: `${40 + (spacing / 100) * 80}px`,
            borderRadius: `${Math.max(0, (soft + 100) / 200) * 120}px`,
            transition: baseTransition,
          }}
        >
          <div className="flex flex-col items-center" style={{ fontFamily: getFontFamily(typography), gap: `${20 + (spacing / 100) * 40}px`, transition: baseTransition }}>
            <h2 
              className="text-center transition-all"
              style={{ 
                letterSpacing: `${-2 + (spacing / 100) * 8}px`, 
                fontSize: `${2.5 + (100 - quiet) / 100}rem`, 
                fontWeight: fontWeight, 
                color: textColor, 
                textTransform: textTransform,
                transition: baseTransition
              }}
            >
              Project Aura
            </h2>
            
            <div className="flex flex-col w-full max-w-xs" style={{ gap: `${10 + (spacing / 100) * 20}px`, transition: baseTransition }}>
              {['New Game', 'Continue', 'Settings', 'Quit'].map((item) => (
                <m.button
                  key={item}
                  whileHover={{ 
                    scale: 1 + (motion / 100) * 0.15, 
                    backgroundColor: hoverButtonBg, 
                    color: hoverButtonColor,
                    borderColor: hoverButtonColor
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden group"
                  style={{
                    borderRadius: `${Math.max(0, (soft + 100) / 200) * 40}px`,
                    padding: `${12 + (spacing / 100) * 12}px ${24 + (spacing / 100) * 24}px`,
                    border: `2px solid ${primaryColor}`,
                    backgroundColor: defaultButtonBg,
                    color: defaultButtonColor,
                    fontWeight: fontWeight,
                    fontSize: '1.125rem',
                    textTransform: textTransform,
                    transition: baseTransition,
                    outline: 'none'
                  }}
                >
                  <span className="relative z-10">{item}</span>
                </m.button>
              ))}
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
}
