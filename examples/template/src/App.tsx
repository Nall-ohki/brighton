import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, CheckCircle2, Code } from "lucide-react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-slate-200">
      {/* Top Header Row */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Dev Server Active
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Port 3000
        </span>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl mx-auto my-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-white border border-slate-200/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-500"
        >
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 mb-6">
            <Code className="h-6 w-6 text-slate-700" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-sans font-medium tracking-tight text-slate-900 mb-3">
            Barebones React App
          </h1>
          
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8">
            This is a clean, single-screen template using React 19, Tailwind CSS v4, and modern TypeScript. It's ready for you to build your features.
          </p>

          {/* Minimal State Demo */}
          <div className="border-t border-slate-100 pt-6 mt-6">
            <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">
              State Engine Verification
            </span>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-medium text-slate-700">Reactive State</p>
                  <p className="text-[11px] font-mono text-slate-400">Count: {count}</p>
                </div>
              </div>
              
              <button
                onClick={() => setCount((prev) => prev + 1)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Increment Counter
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto flex justify-between items-center text-[11px] font-mono text-slate-400 pt-8 border-t border-slate-100/60">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-slate-400" />
          <span>Vite + React 19</span>
        </div>
        <span>Ready to Code</span>
      </footer>
    </div>
  );
}

