import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, BookOpen, Cpu, RefreshCcw, CheckCircle, Database } from 'lucide-react';

const SliderControl = ({ label, icon, value, onChange, description }: any) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2 text-zinc-300 font-bold text-sm tracking-wide uppercase">
          {icon}
          {label}
        </div>
        <div className="font-mono text-sm text-zinc-400">${value}K</div>
      </div>
      <p className="text-xs text-zinc-600 font-serif italic mb-1">{description}</p>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-zinc-300 outline-none"
        style={{
          WebkitAppearance: 'none',
          background: `linear-gradient(to right, #d4d4d8 ${value}%, #27272a ${value}%)`
        }}
      />
    </div>
  );
};

export default function App() {
  const [budget] = useState(100);
  const [allocations, setAllocations] = useState({
    ai: 0,
    earned: 0,
    influencer: 0
  });

  const [aiResponse, setAiResponse] = useState("System idle. Awaiting campaign signals to formulate a recommendation...");
  const [isTyping, setIsTyping] = useState(false);
  const [typedResponse, setTypedResponse] = useState("System idle. Awaiting campaign signals to formulate a recommendation...");
  const [isWin, setIsWin] = useState(false);
  const [turn, setTurn] = useState(0);

  const spent = allocations.ai + allocations.earned + allocations.influencer;
  const remaining = budget - spent;

  const handleSliderChange = (type: 'ai' | 'earned' | 'influencer', value: number) => {
    const diff = value - allocations[type];
    if (spent + diff <= budget) {
      setAllocations(prev => ({ ...prev, [type]: value }));
    } else {
      setAllocations(prev => ({ ...prev, [type]: allocations[type] + remaining }));
    }
  };

  const executeCampaign = () => {
    setTurn(t => t + 1);
    setIsTyping(true);
    setTypedResponse("");
    setIsWin(false);
    
    const { ai: A, earned: E, influencer: I } = allocations;
    
    let response = "";
    
    // Visibility / Indexing
    if (A < 25) {
        response += "My knowledge base lacks structured, verified data on this title. It is difficult to parse its core features or developer pedigree. ";
    } else if (A <= 45) {
        response += "The developer has provided excellent metadata. The game's mechanics, release details, and lore are cleanly indexed in my database. ";
    } else {
        response += "The title has an overwhelmingly optimized data footprint. It completely dominates search queries and knowledge graphs. ";
    }

    // Authority / Editorial Quality
    if (E < 25) {
        if (A >= 25) response += "However, I can find almost no authoritative reviews or journalistic coverage to verify its quality. ";
        else response += "There are also no authoritative reviews or journalistic coverage to verify its quality. ";
    } else if (E <= 45) {
        response += "It has garnered respectable, positive coverage from trusted mid-tier gaming outlets. ";
    } else {
        response += "It is universally acclaimed, boasting profound editorial analyses and 'Masterpiece' ratings from top-tier publications. ";
    }

    // Hype / Volume
    if (I < 15) {
        response += "Curiously, there is almost no organic community buzz or creator engagement. ";
    } else if (I <= 30) {
        response += "It holds a healthy, dedicated audience among influential content creators. ";
    } else {
        if (E < 45) {
            response += "There is a massive volume of influencer content, but without matching editorial prestige, my sentiment-analysis models flag this as a potentially inorganic marketing push. ";
        } else {
            response += "Additionally, it has completely saturated social media and streaming platforms, indicating massive cultural relevance. ";
        }
    }

    let win = false;
    let rec = "";
    
    if (A >= 25 && A <= 45 && E >= 45 && I >= 15 && I <= 30) {
        rec = "\n\n[ FINAL VERDICT: ENTHUSIASTICALLY RECOMMENDED ]\nThis is a paradigm-shifting release. It combines unassailable critical acclaim with authentic cultural relevance and perfectly structured information. An absolute must-play.";
        win = true;
    } else if (E >= 45 && I > 30) {
        rec = "\n\n[ FINAL VERDICT: HIGHLY RECOMMENDED ]\nA very strong title, though its massive influencer saturation makes its actual community reception slightly harder to parse organically.";
    } else if (A > 45 && E < 45) {
        rec = "\n\n[ FINAL VERDICT: CAUTIOUSLY RECOMMENDED ]\nThe game is highly visible and expertly marketed for search engines, but the critical consensus is not strong enough to unequivocally guarantee its quality.";
    } else if (E >= 25 && I <= 30 && A >= 15) {
        rec = "\n\n[ FINAL VERDICT: MODERATELY RECOMMENDED ]\nIt is a solid title with decent reviews, but lacks the undeniable impact of a major industry event.";
    } else {
        rec = "\n\n[ FINAL VERDICT: INSUFFICIENT DATA / NOT RECOMMENDED ]\nI cannot recommend a title with such unbalanced, unverified, or weak market signals. Proceed with caution.";
    }
    
    setAiResponse(response + rec);
  };

  useEffect(() => {
    if (!isTyping) return;
    
    let i = 0;
    const interval = setInterval(() => {
      setTypedResponse(aiResponse.substring(0, i));
      i++;
      if (i > aiResponse.length) {
        clearInterval(interval);
        setIsTyping(false);
        if (aiResponse.includes("ENTHUSIASTICALLY RECOMMENDED")) {
          setIsWin(true);
        }
      }
    }, 25);
    
    return () => clearInterval(interval);
  }, [isTyping, aiResponse]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans p-4 md:p-8 flex flex-col md:flex-row gap-8 selection:bg-zinc-700 selection:text-white">
      
      {/* Left Panel: PR Desk */}
      <div className="w-full md:w-5/12 flex flex-col gap-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-zinc-100 tracking-wide mb-2 uppercase">The Recommendation Era</h1>
          <p className="text-zinc-500 text-xs md:text-sm tracking-wider uppercase flex items-center gap-2">
            <Database size={14} /> Strategic Signal Allocation Desk
          </p>
        </div>

        <div className="bg-[#121214] border border-zinc-800/50 p-6 md:p-8 rounded-sm shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-600 to-transparent opacity-30"></div>
          
          <div className="flex justify-between items-end mb-8 border-b border-zinc-800/80 pb-6">
            <div>
              <h2 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-1">Total Campaign Budget</h2>
              <div className="text-3xl font-serif text-zinc-200">${budget}K</div>
            </div>
            <div className="text-right">
              <h2 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-1">Available Funds</h2>
              <div className={`text-2xl font-serif transition-colors duration-300 ${remaining === 0 ? 'text-zinc-600' : 'text-zinc-200'}`}>
                ${remaining}K
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <SliderControl 
              label="AI-Optimization Tactics" 
              icon={<Cpu size={16}/>}
              value={allocations.ai}
              onChange={(v: number) => handleSliderChange('ai', v)}
              description="Metadata structuring, knowledge graph injection, wiki seeding."
            />
            <SliderControl 
              label="Earned Media (PR)" 
              icon={<BookOpen size={16}/>}
              value={allocations.earned}
              onChange={(v: number) => handleSliderChange('earned', v)}
              description="Pitching top-tier journalists, exclusive previews, review campaigns."
            />
            <SliderControl 
              label="Influencer Spend" 
              icon={<TrendingUp size={16}/>}
              value={allocations.influencer}
              onChange={(v: number) => handleSliderChange('influencer', v)}
              description="Sponsored streams, TikTok campaigns, YouTube integrations."
            />
          </div>

          <div className="mt-12">
            <button 
              onClick={executeCampaign}
              disabled={isTyping}
              className="w-full bg-zinc-100 text-[#09090b] py-4 font-bold tracking-widest text-sm uppercase hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isTyping ? <RefreshCcw className="animate-spin text-zinc-500" size={18} /> : <Play className="group-hover:translate-x-1 transition-transform" size={18} />}
              {turn === 0 ? 'Deploy Initial Signals' : `Deploy Signals (Turn ${turn + 1})`}
            </button>
          </div>
        </div>

        <div className="text-zinc-600 text-[10px] uppercase tracking-widest text-center mt-auto pb-4">
          Objective: Achieve "Enthusiastic" recommendation status.
        </div>
      </div>

      {/* Right Panel: AI Console */}
      <div className="w-full md:w-7/12 flex flex-col">
        <div className="flex-1 bg-black border border-zinc-800/60 p-6 md:p-10 rounded-sm shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-20"></div>
          
          <div className="flex items-center gap-3 mb-8 border-b border-zinc-900 pb-4">
            <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-amber-500 animate-pulse' : 'bg-zinc-500'}`}></div>
            <h3 className="font-mono text-zinc-500 text-[10px] tracking-widest uppercase">
              LLM Search Engine v9.0 // Query: "Should I play this game?"
            </h3>
          </div>

          <div className="flex-1 font-mono text-[13px] md:text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap relative z-10">
            {typedResponse}
            {isTyping && <span className="inline-block w-2 h-[1em] bg-zinc-400 ml-1 animate-pulse align-middle"></span>}
          </div>

          {isWin && !isTyping && (
            <div className="mt-8 border border-zinc-700 bg-zinc-900/50 p-6 flex items-start gap-4 animate-in fade-in duration-1000 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
              <CheckCircle className="text-zinc-200 mt-0.5 flex-shrink-0 relative z-10" size={20} />
              <div className="relative z-10">
                <h4 className="text-zinc-100 font-serif text-lg mb-1 tracking-wide">CAMPAIGN SUCCESS</h4>
                <p className="text-zinc-400 text-sm font-sans">
                  You have successfully balanced the signals. The recommendation engine now generates an enthusiastic endorsement organically.
                </p>
              </div>
            </div>
          )}
          
          {/* Subtle CRT scanline overlay effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 z-0 mix-blend-overlay group-hover:opacity-30 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
}
