import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, TrendingUp, Users, DollarSign, 
  ShoppingCart, Mail, Award, Package, 
  BarChart2, Zap, Shield, ChevronRight 
} from 'lucide-react';
import './App.css';

// --- Types & Interfaces ---

type PricingStrategy = 'discount' | 'standard' | 'premium';
type BundleStrategy = 'none' | 'basic' | 'dynamic';
type EmailStrategy = 'off' | 'on';
type LoyaltyStrategy = 'off' | 'on';

interface StoreState {
  pricing: PricingStrategy;
  bundles: BundleStrategy;
  email: EmailStrategy;
  loyalty: LoyaltyStrategy;
}

interface Metrics {
  traffic: number;
  conversionRate: number;
  aov: number;
  ltv: number;
  revenue: number;
  financialControlScore: number;
  churnRate: number;
}

// --- Constants & Game Logic ---

const BASE_TRAFFIC = 50000;
const BASE_AOV = 20;

const calculateMetrics = (state: StoreState): Metrics => {
  let conversionRate = 0.05; // 5% base
  let aov = BASE_AOV;
  let repeatRate = 0.1; // 10% base repeat
  let fcs = 30; // Base financial control score
  let churnRate = 0.6; // 60% base churn

  // Pricing
  if (state.pricing === 'discount') {
    conversionRate *= 1.5;
    aov *= 0.7;
    fcs += 5;
  } else if (state.pricing === 'standard') {
    fcs += 10;
  } else if (state.pricing === 'premium') {
    conversionRate *= 0.7;
    aov *= 1.5;
    fcs += 20;
    churnRate -= 0.05;
  }

  // Bundles
  if (state.bundles === 'basic') {
    aov *= 1.2;
    fcs += 10;
  } else if (state.bundles === 'dynamic') {
    aov *= 1.4;
    conversionRate *= 1.1;
    fcs += 25;
  }

  // Email Capture
  if (state.email === 'on') {
    conversionRate *= 1.25; // Cart recovery
    repeatRate += 0.15;
    fcs += 15;
    churnRate -= 0.15;
  }

  // Loyalty
  if (state.loyalty === 'on') {
    repeatRate += 0.25;
    fcs += 20;
    churnRate -= 0.2;
  }

  const ltv = aov * (1 / (1 - repeatRate)); // Simplified LTV
  const monthlyBuyers = BASE_TRAFFIC * conversionRate;
  const revenue = monthlyBuyers * aov;

  return {
    traffic: BASE_TRAFFIC,
    conversionRate: conversionRate * 100,
    aov,
    ltv,
    revenue,
    financialControlScore: Math.min(100, fcs),
    churnRate: churnRate * 100,
  };
};

// --- Particle System (Funnel Simulation) ---

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetStage: number; // 0: traffic, 1: store, 2: cart, 3: purchase, 4: repeat
  currentStage: number;
  color: string;
  size: number;
  active: boolean;
  life: number;

  constructor(x: number, y: number, targetStage: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = Math.random() * 2 + 1;
    this.targetStage = targetStage;
    this.currentStage = 0;
    this.color = '#8b5cf6'; // Violet 500
    this.size = Math.random() * 2 + 2;
    this.active = true;
    this.life = 0;
  }

  update(width: number, height: number, stages: {y: number, h: number}[]) {
    if (!this.active) return;
    this.life++;

    this.x += this.vx;
    this.y += this.vy;

    // Boundary constraints within the funnel shape
    const progress = this.y / height;
    const funnelWidth = width * (0.8 - progress * 0.6); // Funnel narrows
    const centerX = width / 2;
    
    if (this.x < centerX - funnelWidth / 2) {
      this.x = centerX - funnelWidth / 2;
      this.vx *= -0.5;
    } else if (this.x > centerX + funnelWidth / 2) {
      this.x = centerX + funnelWidth / 2;
      this.vx *= -0.5;
    }

    // Determine current stage
    for (let i = 0; i < stages.length; i++) {
      if (this.y > stages[i].y && this.y < stages[i].y + stages[i].h) {
        this.currentStage = i;
      }
    }

    // Check if particle should drop out based on targetStage
    if (this.currentStage > this.targetStage) {
      this.active = false;
    }

    // Color based on stage
    const colors = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];
    this.color = colors[Math.min(this.currentStage, colors.length - 1)];

    if (this.y > height) {
      if (this.targetStage === 4) {
        // Repeat buyers loop back to top
        this.y = 0;
        this.x = centerX + (Math.random() - 0.5) * funnelWidth;
        this.currentStage = 0;
      } else {
        this.active = false;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
  }
}

// --- Main Application ---

export default function App() {
  const [storeState, setStoreState] = useState<StoreState>({
    pricing: 'standard',
    bundles: 'none',
    email: 'off',
    loyalty: 'off',
  });

  const metrics = calculateMetrics(storeState);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stages = [
      { y: 0, h: canvas.height * 0.2 }, // Traffic
      { y: canvas.height * 0.2, h: canvas.height * 0.2 }, // Storefront
      { y: canvas.height * 0.4, h: canvas.height * 0.2 }, // Cart
      { y: canvas.height * 0.6, h: canvas.height * 0.2 }, // Purchase
      { y: canvas.height * 0.8, h: canvas.height * 0.2 }, // Repeat
    ];

    let lastTime = 0;
    const spawnRate = 20; // particles per frame approx

    const animate = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      // Clear canvas with trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Tailwind slate-900 with opacity
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stage dividers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      stages.forEach((stage, i) => {
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(0, stage.y);
          ctx.lineTo(canvas.width, stage.y);
          ctx.stroke();
        }
      });

      // Spawn new particles
      const { conversionRate, churnRate } = metrics;
      const convNormalized = conversionRate / 100;
      const repeatNormalized = 1 - (churnRate / 100);

      for (let i = 0; i < spawnRate; i++) {
        const rand = Math.random();
        let targetStage = 0; // Traffic drop-off
        
        if (rand < convNormalized) {
          if (Math.random() < repeatNormalized) {
            targetStage = 4; // Repeat
          } else {
            targetStage = 3; // Purchase only
          }
        } else if (rand < convNormalized * 2) {
          targetStage = 2; // Cart drop-off
        } else if (rand < convNormalized * 4) {
          targetStage = 1; // Storefront drop-off
        }

        particlesRef.current.push(new Particle(
          canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.8,
          0,
          targetStage
        ));
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => p.active);
      particlesRef.current.forEach(p => {
        p.update(canvas.width, canvas.height, stages);
        p.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [metrics]);

  const StatCard = ({ title, value, icon: Icon, prefix = '', suffix = '', highlight = false }: any) => (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      highlight 
        ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
        : 'bg-slate-800/50 border-slate-700/50'
    }`}>
      <div className="flex items-center space-x-2 text-slate-400 mb-2">
        <Icon size={16} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold text-slate-100 flex items-baseline">
        {prefix && <span className="text-lg text-slate-400 mr-1">{prefix}</span>}
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
        {suffix && <span className="text-lg text-slate-400 ml-1">{suffix}</span>}
      </div>
    </div>
  );

  const ControlGroup = ({ title, icon: Icon, children, description }: any) => (
    <div className="mb-6 bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
      <div className="flex items-center space-x-2 mb-1">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      </div>
      <p className="text-sm text-slate-400 mb-4 ml-11">{description}</p>
      <div className="ml-11">{children}</div>
    </div>
  );

  const RadioButton = ({ label, value, current, onChange, stat }: any) => (
    <button
      onClick={() => onChange(value)}
      className={`w-full flex items-center justify-between p-3 rounded-xl mb-2 transition-all ${
        current === value 
          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 border shadow-[0_0_10px_rgba(99,102,241,0.1)]' 
          : 'bg-slate-900/50 border-slate-800 text-slate-400 border hover:border-slate-600'
      }`}
    >
      <span className="font-medium">{label}</span>
      {stat && (
        <span className={`text-xs px-2 py-1 rounded-md ${
          current === value ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-800 text-slate-500'
        }`}>
          {stat}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 h-screen flex flex-col">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 py-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="text-white" size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Direct-to-Consumer Engine
              </h1>
              <p className="text-sm text-slate-400">Store Builder Simulator based on 45k+ gaming stores</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Financial Control Score</div>
              <div className="flex items-center justify-end space-x-2">
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
                    style={{ width: `${metrics.financialControlScore}%` }}
                  />
                </div>
                <span className="text-2xl font-bold text-emerald-400">
                  {metrics.financialControlScore}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
          
          {/* Left: Configuration */}
          <div className="lg:col-span-3 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            <ControlGroup 
              title="Pricing Strategy" 
              icon={DollarSign}
              description="How do you price your games? Impacts conversion and margin."
            >
              <RadioButton 
                label="Discount Heavy" value="discount" 
                current={storeState.pricing} onChange={(v: any) => setStoreState({...storeState, pricing: v})}
                stat="+Conv, -AOV"
              />
              <RadioButton 
                label="Standard Market" value="standard" 
                current={storeState.pricing} onChange={(v: any) => setStoreState({...storeState, pricing: v})}
                stat="Balanced"
              />
              <RadioButton 
                label="Premium Edition" value="premium" 
                current={storeState.pricing} onChange={(v: any) => setStoreState({...storeState, pricing: v})}
                stat="-Conv, +AOV"
              />
            </ControlGroup>

            <ControlGroup 
              title="Bundle Offers" 
              icon={Package}
              description="Packaging content together increases average order value."
            >
              <RadioButton 
                label="No Bundles" value="none" 
                current={storeState.bundles} onChange={(v: any) => setStoreState({...storeState, bundles: v})}
              />
              <RadioButton 
                label="Basic DLC Packs" value="basic" 
                current={storeState.bundles} onChange={(v: any) => setStoreState({...storeState, bundles: v})}
                stat="+AOV"
              />
              <RadioButton 
                label="Dynamic 'Complete the Set'" value="dynamic" 
                current={storeState.bundles} onChange={(v: any) => setStoreState({...storeState, bundles: v})}
                stat="++AOV, +Conv"
              />
            </ControlGroup>

            <ControlGroup 
              title="Email Capture" 
              icon={Mail}
              description="Capture emails for abandoned cart recovery and newsletters."
            >
              <RadioButton 
                label="Disabled" value="off" 
                current={storeState.email} onChange={(v: any) => setStoreState({...storeState, email: v})}
              />
              <RadioButton 
                label="Aggressive Capture" value="on" 
                current={storeState.email} onChange={(v: any) => setStoreState({...storeState, email: v})}
                stat="+Cart Recovery"
              />
            </ControlGroup>

            <ControlGroup 
              title="Loyalty Rewards" 
              icon={Award}
              description="Points system for purchases and community engagement."
            >
              <RadioButton 
                label="None" value="off" 
                current={storeState.loyalty} onChange={(v: any) => setStoreState({...storeState, loyalty: v})}
              />
              <RadioButton 
                label="Tiered Rewards" value="on" 
                current={storeState.loyalty} onChange={(v: any) => setStoreState({...storeState, loyalty: v})}
                stat="++LTV, -Churn"
              />
            </ControlGroup>
          </div>

          {/* Center: Funnel Visualization */}
          <div className="lg:col-span-6 bg-slate-900/50 rounded-3xl border border-slate-800 relative flex flex-col overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>
            
            <div className="relative z-10 p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="mr-2 text-indigo-400" />
                Live Sales Funnel
              </h2>
              
              <div className="flex-1 relative">
                <canvas 
                  ref={canvasRef} 
                  className="absolute inset-0 w-full h-full rounded-2xl"
                />
                
                {/* Funnel Stage Labels */}
                <div className="absolute inset-y-0 left-4 py-4 flex flex-col justify-between text-sm font-medium text-slate-500 pointer-events-none">
                  <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#a78bfa] mr-2"></span>Traffic (Ads/Organic)</div>
                  <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#60a5fa] mr-2"></span>Storefront View</div>
                  <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#34d399] mr-2"></span>Add to Cart</div>
                  <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#fbbf24] mr-2"></span>Purchase Completed</div>
                  <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#f87171] mr-2"></span>Loyal / Repeat Buyer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Metrics Dashboard */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/80 p-6 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarSign size={100} />
              </div>
              <h3 className="text-slate-400 font-medium mb-1 relative z-10">Monthly Revenue</h3>
              <div className="text-5xl font-black text-white mb-2 relative z-10">
                ${(metrics.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-sm text-indigo-300 relative z-10 flex items-center">
                <TrendingUp size={14} className="mr-1" />
                Projected based on current config
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                title="Conversion" 
                value={metrics.conversionRate} 
                suffix="%" 
                icon={ShoppingCart} 
                highlight={metrics.conversionRate > 5}
              />
              <StatCard 
                title="Avg Order" 
                value={metrics.aov} 
                prefix="$" 
                icon={Package} 
                highlight={metrics.aov > BASE_AOV}
              />
              <StatCard 
                title="LTV" 
                value={metrics.ltv} 
                prefix="$" 
                icon={Users} 
                highlight={metrics.ltv > BASE_AOV * 1.5}
              />
              <StatCard 
                title="Churn Rate" 
                value={metrics.churnRate} 
                suffix="%" 
                icon={Shield} 
                highlight={metrics.churnRate < 60}
              />
            </div>

            <div className="flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 mt-2">
              <h3 className="font-bold mb-4 flex items-center text-slate-300">
                <BarChart2 className="mr-2" size={18} />
                Strategic Insights
              </h3>
              <ul className="space-y-4">
                {storeState.pricing === 'premium' && (
                  <li className="flex text-sm">
                    <ChevronRight className="text-indigo-400 mr-2 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-400">Premium pricing creates higher margins but demands strong community trust.</span>
                  </li>
                )}
                {storeState.bundles === 'dynamic' && (
                  <li className="flex text-sm">
                    <ChevronRight className="text-emerald-400 mr-2 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-400">Dynamic bundles are successfully driving up AOV without hurting conversion.</span>
                  </li>
                )}
                {storeState.email === 'on' && (
                  <li className="flex text-sm">
                    <ChevronRight className="text-blue-400 mr-2 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-400">Cart recovery emails are rescuing ~15% of lost checkouts.</span>
                  </li>
                )}
                {storeState.loyalty === 'on' && (
                  <li className="flex text-sm">
                    <ChevronRight className="text-purple-400 mr-2 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-400">Loyalty program is creating a predictable recurring revenue floor.</span>
                  </li>
                )}
                {storeState.pricing === 'discount' && storeState.bundles === 'none' && (
                  <li className="flex text-sm">
                    <ChevronRight className="text-amber-400 mr-2 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-400">Warning: Discounting without bundles leaves money on the table.</span>
                  </li>
                )}
                {storeState.loyalty === 'off' && storeState.email === 'off' && (
                  <li className="flex text-sm">
                    <ChevronRight className="text-red-400 mr-2 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-400">You are heavily reliant on paid acquisition. Build owned channels.</span>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
