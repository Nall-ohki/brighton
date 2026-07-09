import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Shield, AlertTriangle, Heart, CheckCircle2, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Types
type EventType = 'policy' | 'headwind';

interface TimelineEvent {
  id: string;
  type: EventType;
  year: number;
  title: string;
  description: string;
  impact?: number;
  penalty?: number;
  protectivePolicy?: {
    title: string;
    impact: number;
  };
}

const TIMELINE_DATA: TimelineEvent[] = [
  { type: 'policy', year: 1, id: 'p1', title: 'Pronoun Fields Added', description: 'Employees can now add pronouns to HR tools, email signatures, and internal profiles.', impact: 10 },
  { type: 'headwind', year: 1, id: 'h1', title: 'State Legislation Proposed', description: 'Local anti-LGBTQ+ bill proposed in the studio\'s state, causing anxiety among staff.', penalty: 15, protectivePolicy: { title: 'Offer Relocation & Legal Support', impact: 5 } },
  { type: 'policy', year: 2, id: 'p2', title: 'Pride ERG Formed', description: 'Employees start an official LGBTQ+ resource group with an executive sponsor.', impact: 15 },
  { type: 'headwind', year: 2, id: 'h2', title: 'Targeted Social Media Backlash', description: 'Studio faces online harassment from hate groups over a Pride month post.', penalty: 10, protectivePolicy: { title: 'Stand Firm & Enhance Moderation', impact: 5 } },
  { type: 'policy', year: 3, id: 'p3', title: 'Trans Health Cover Extended', description: 'Comprehensive gender-affirming care added to the studio\'s health benefits.', impact: 20 },
  { type: 'headwind', year: 3, id: 'h3', title: 'Healthcare Provider Changes', description: 'A new insurance provider threatens to roll back inclusive care for trans employees.', penalty: 20, protectivePolicy: { title: 'Mandate Inclusive Contracts', impact: 10 } },
  { type: 'policy', year: 4, id: 'p4', title: 'Gender-Neutral Restrooms', description: 'All studio floors are retrofitted with accessible, gender-neutral facilities.', impact: 15 },
  { type: 'headwind', year: 4, id: 'h4', title: 'Internal Pushback', description: 'Anonymous complaints about the new inclusion initiatives surface in an internal survey.', penalty: 10, protectivePolicy: { title: 'Host Open Dialogues & Education', impact: 5 } },
  { type: 'policy', year: 5, id: 'p5', title: 'LGBTQ+ Leadership Mentorship', description: 'Program launched to directly support and sponsor queer employees into leadership roles.', impact: 20 },
  { type: 'policy', year: 5, id: 'p6', title: 'Equal Family Leave', description: 'Same-sex parents receive fully equal parental leave and adoption support.', impact: 15 },
];

const STARTING_SCORE = 50;

export default function App() {
  const [score, setScore] = useState(STARTING_SCORE);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const handleScoreChange = (amount: number) => {
    setScore(prev => Math.min(100, Math.max(0, prev + amount)));
  };

  const years = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen rainbow-bg relative selection:bg-pink-500/30">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto flex justify-between items-center glass rounded-2xl p-4 px-6 pointer-events-auto">
          <h1 className="font-bold text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
            One Year On
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white/80 hidden md:inline-block">Community Wellbeing</span>
            <div className="flex items-center gap-2 bg-black/40 rounded-full py-2 px-4 border border-white/10">
              <Heart className="w-5 h-5 text-pink-400" fill={score > 20 ? "currentColor" : "none"} />
              <div className="font-mono text-xl font-bold w-12 text-right">
                <motion.span
                  key={score}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "inline-block",
                    score < 30 ? "text-red-400" : score < 60 ? "text-yellow-400" : "text-green-400"
                  )}
                >
                  {score}
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-yellow-500 to-green-500 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Intro */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl glass-dark rounded-3xl p-8 md:p-12 border border-white/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10 pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gradient pb-2">
            The Journey to Inclusion
          </h2>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">
            You are guiding a fictional studio through a 5-year inclusion arc.
            Click on <span className="font-bold text-green-400">Policy Moments</span> to enact them and boost wellbeing. 
            Watch out for <span className="font-bold text-orange-400">Social Headwinds</span>—you must act quickly to protect your team.
          </p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex justify-center text-white/50"
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 pb-32 relative">
        {/* Timeline Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-white/20 transform md:-translate-x-1/2 rounded-full" />

        {years.map(year => (
          <div key={year} className="mb-32 relative z-10">
            {/* Year Marker */}
            <div className="sticky top-24 md:top-32 flex justify-start md:justify-center mb-16 z-20">
              <div className="glass px-6 py-2 rounded-full font-black text-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/30 text-white">
                Year {year}
              </div>
            </div>

            <div className="space-y-24">
              {TIMELINE_DATA.filter(event => event.year === year).map((event, index) => (
                <TimelineNode 
                  key={event.id} 
                  event={event} 
                  index={index} 
                  onScoreChange={handleScoreChange} 
                />
              ))}
            </div>
          </div>
        ))}

        {/* Ending */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-32"
        >
          <div className="glass-dark rounded-3xl p-12 inline-block">
            <h2 className="text-4xl font-bold mb-4">Five Years Later</h2>
            <p className="text-2xl text-white/80 mb-6">Final Community Wellbeing: <span className="font-bold text-white">{score}</span></p>
            {score >= 80 ? (
              <p className="text-green-400 text-lg">Incredible work. The studio is a beacon of inclusion.</p>
            ) : score >= 50 ? (
              <p className="text-yellow-400 text-lg">Solid progress, but the work is never truly done.</p>
            ) : (
              <p className="text-red-400 text-lg">The community is struggling. More dedicated action is needed.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TimelineNode({ event, index, onScoreChange }: { event: TimelineEvent, index: number, onScoreChange: (amount: number) => void }) {
  const isLeft = index % 2 === 0;

  return (
    <div className={cn(
      "flex flex-col md:flex-row items-center relative w-full",
      isLeft ? "md:flex-row-reverse" : ""
    )}>
      {/* Center Dot */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-white/10 border-4 border-[#1a1a1a] shadow-xl z-20 items-center justify-center">
        <div className={cn(
          "w-3 h-3 rounded-full",
          event.type === 'policy' ? "bg-green-400" : "bg-orange-400"
        )} />
      </div>

      <div className={cn(
        "w-full md:w-1/2 flex",
        isLeft ? "md:justify-start pl-12 md:pl-0 md:pr-16" : "md:justify-end pl-12 md:pl-16"
      )}>
        {event.type === 'policy' ? (
          <PolicyCard event={event} onScoreChange={onScoreChange} />
        ) : (
          <HeadwindCard event={event} onScoreChange={onScoreChange} />
        )}
      </div>
    </div>
  );
}

function PolicyCard({ event, onScoreChange }: { event: TimelineEvent, onScoreChange: (amount: number) => void }) {
  const [enacted, setEnacted] = useState(false);

  const handleClick = () => {
    if (enacted) return;
    setEnacted(true);
    onScoreChange(event.impact || 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="w-full"
    >
      <button
        onClick={handleClick}
        disabled={enacted}
        className={cn(
          "w-full text-left transition-all duration-500 rounded-2xl p-6 md:p-8 relative overflow-hidden group",
          enacted ? "glass bg-green-500/20 border-green-400/50" : "glass-dark hover:bg-white/10 cursor-pointer"
        )}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2 block">Internal Policy</span>
              <h3 className="text-xl md:text-2xl font-bold mb-2">{event.title}</h3>
            </div>
            {enacted ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-400 rounded-full p-2 text-black">
                <CheckCircle2 className="w-6 h-6" />
              </motion.div>
            ) : (
              <div className="bg-white/10 rounded-full p-2 group-hover:bg-white/20 transition-colors">
                <div className="w-6 h-6 border-2 border-white/50 rounded-full" />
              </div>
            )}
          </div>
          <p className="text-white/80 leading-relaxed mb-4">{event.description}</p>
          
          <AnimatePresence>
            {enacted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-white/10 flex items-center gap-2 text-green-300 font-medium"
              >
                <span>Impact:</span>
                <span className="flex items-center"><Heart className="w-4 h-4 mr-1" /> +{event.impact} Wellbeing</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
}

function HeadwindCard({ event, onScoreChange }: { event: TimelineEvent, onScoreChange: (amount: number) => void }) {
  const [status, setStatus] = useState<'idle' | 'active' | 'protected' | 'failed'>('idle');
  const [timeLeft, setTimeLeft] = useState(100); // percentage

  const duration = 8000; // 8 seconds to react

  useEffect(() => {
    if (status === 'active') {
      const startTime = Date.now();
      
      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setTimeLeft(remaining);

        if (remaining > 0 && status === 'active') {
          requestAnimationFrame(updateTimer);
        } else if (remaining === 0 && status === 'active') {
          setStatus('failed');
          onScoreChange(-(event.penalty || 0));
        }
      };

      const timerId = requestAnimationFrame(updateTimer);
      return () => cancelAnimationFrame(timerId);
    }
  }, [status, event.penalty, onScoreChange]);

  const handleProtect = () => {
    if (status !== 'active') return;
    setStatus('protected');
    onScoreChange(event.protectivePolicy?.impact || 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-200px" }}
      onViewportEnter={() => {
        if (status === 'idle') setStatus('active');
      }}
      className={cn(
        "w-full rounded-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-500",
        status === 'failed' ? "glass bg-red-500/20 border-red-500/50" :
        status === 'protected' ? "glass bg-blue-500/20 border-blue-400/50" :
        "glass-dark border-orange-500/30"
      )}
    >
      {/* Background Warning Glow */}
      {status === 'active' && (
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute inset-0 bg-orange-500 pointer-events-none"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider mb-2 block",
              status === 'failed' ? "text-red-400" :
              status === 'protected' ? "text-blue-400" : "text-orange-400"
            )}>
              External Headwind
            </span>
            <h3 className="text-xl md:text-2xl font-bold mb-2">{event.title}</h3>
          </div>
          <div className={cn(
            "p-2 rounded-full",
            status === 'failed' ? "bg-red-500/20 text-red-400" :
            status === 'protected' ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
          )}>
            {status === 'protected' ? <Shield className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
        </div>

        <p className="text-white/80 leading-relaxed mb-6">{event.description}</p>

        {status === 'active' && (
          <div className="space-y-4">
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-75 ease-linear"
                style={{ width: `${timeLeft}%` }}
              />
            </div>
            <button
              onClick={handleProtect}
              className="w-full py-3 px-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {event.protectivePolicy?.title}
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {status === 'failed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-4 border-t border-red-500/20 text-red-300 font-medium flex items-center gap-2"
            >
              Impact missed: <span className="flex items-center"><Heart className="w-4 h-4 mr-1" /> -{event.penalty} Wellbeing</span>
            </motion.div>
          )}
          {status === 'protected' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-4 border-t border-blue-500/20 text-blue-300 font-medium flex items-center gap-2"
            >
              Threat mitigated! <span className="flex items-center ml-2"><Heart className="w-4 h-4 mr-1" /> +{event.protectivePolicy?.impact} Wellbeing</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
