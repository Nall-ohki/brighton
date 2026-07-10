import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, PenTool, CheckCircle, BarChart3, PieChart } from 'lucide-react';

const COLORS = {
  blue: '#012169',
  red: '#C8102E',
  lightBlue: '#3b82f6',
  white: '#ffffff',
  gray: '#f3f4f6',
  darkGray: '#374151',
};

// --- DATA ---
const genderData = [
  { id: 'gender-men', label: 'Men', value: 67, color: '#012169' },
  { id: 'gender-women', label: 'Women', value: 29, color: '#C8102E' },
  { id: 'gender-nb', label: 'Non-binary', value: 4, color: '#6b7280' },
];

const ethnicityData = [
  { id: 'eth-white', label: 'White', value: 83, color: '#012169' },
  { id: 'eth-bame', label: 'Minority Ethnic', value: 17, color: '#C8102E' },
];

const layoffData = [
  { id: 'lay-men', label: 'Men', value: 12, color: '#012169' },
  { id: 'lay-women', label: 'Women', value: 18, color: '#C8102E' },
  { id: 'lay-nb', label: 'Non-binary', value: 24, color: '#6b7280' },
  { id: 'lay-white', label: 'White', value: 11, color: '#012169' },
  { id: 'lay-bame', label: 'Minority Ethnic', value: 19, color: '#C8102E' },
];

const salaryData = [
  { id: 'sal-junior', label: 'Junior', value: 25, color: '#6b7280' },
  { id: 'sal-mid', label: 'Mid', value: 40, color: '#3b82f6' },
  { id: 'sal-senior', label: 'Senior', value: 60, color: '#012169' },
  { id: 'sal-lead', label: 'Lead', value: 75, color: '#C8102E' },
  { id: 'sal-dir', label: 'Director+', value: 95, color: '#111827' },
];

const drillDownNodes: Record<string, any> = {
  'gender-women': {
    left: [{ id: 'w', label: 'Women', value: 100 }],
    middle: [
      { id: 'm1', label: 'Art', value: 30 },
      { id: 'm2', label: 'Design', value: 15 },
      { id: 'm3', label: 'Programming', value: 10 },
      { id: 'm4', label: 'Production', value: 25 },
      { id: 'm5', label: 'QA/Other', value: 20 },
    ],
    right: [
      { id: 'r1', label: 'Junior', value: 40 },
      { id: 'r2', label: 'Mid', value: 35 },
      { id: 'r3', label: 'Senior', value: 20 },
      { id: 'r4', label: 'Lead/Dir', value: 5 },
    ],
    links: [
      { source: 'w', target: 'm1', value: 30 },
      { source: 'w', target: 'm2', value: 15 },
      { source: 'w', target: 'm3', value: 10 },
      { source: 'w', target: 'm4', value: 25 },
      { source: 'w', target: 'm5', value: 20 },
      { source: 'm1', target: 'r1', value: 12 },
      { source: 'm1', target: 'r2', value: 10 },
      { source: 'm1', target: 'r3', value: 6 },
      { source: 'm1', target: 'r4', value: 2 },
      { source: 'm2', target: 'r1', value: 6 },
      { source: 'm2', target: 'r2', value: 6 },
      { source: 'm2', target: 'r3', value: 2 },
      { source: 'm2', target: 'r4', value: 1 },
      { source: 'm3', target: 'r1', value: 4 },
      { source: 'm3', target: 'r2', value: 4 },
      { source: 'm3', target: 'r3', value: 2 },
      { source: 'm4', target: 'r1', value: 10 },
      { source: 'm4', target: 'r2', value: 10 },
      { source: 'm4', target: 'r3', value: 4 },
      { source: 'm4', target: 'r4', value: 1 },
      { source: 'm5', target: 'r1', value: 8 },
      { source: 'm5', target: 'r2', value: 5 },
      { source: 'm5', target: 'r3', value: 6 },
      { source: 'm5', target: 'r4', value: 1 },
    ]
  },
  'eth-bame': {
    left: [{ id: 'b', label: 'Minority Ethnic', value: 100 }],
    middle: [
      { id: 'm1', label: 'Art', value: 25 },
      { id: 'm2', label: 'Design', value: 10 },
      { id: 'm3', label: 'Programming', value: 35 },
      { id: 'm4', label: 'Production', value: 10 },
      { id: 'm5', label: 'QA/Other', value: 20 },
    ],
    right: [
      { id: 'r1', label: 'Junior', value: 45 },
      { id: 'r2', label: 'Mid', value: 35 },
      { id: 'r3', label: 'Senior', value: 15 },
      { id: 'r4', label: 'Lead/Dir', value: 5 },
    ],
    links: [
      { source: 'b', target: 'm1', value: 25 },
      { source: 'b', target: 'm2', value: 10 },
      { source: 'b', target: 'm3', value: 35 },
      { source: 'b', target: 'm4', value: 10 },
      { source: 'b', target: 'm5', value: 20 },
      { source: 'm1', target: 'r1', value: 12 }, { source: 'm1', target: 'r2', value: 9 }, { source: 'm1', target: 'r3', value: 3 }, { source: 'm1', target: 'r4', value: 1 },
      { source: 'm2', target: 'r1', value: 5 }, { source: 'm2', target: 'r2', value: 3 }, { source: 'm2', target: 'r3', value: 2 },
      { source: 'm3', target: 'r1', value: 15 }, { source: 'm3', target: 'r2', value: 13 }, { source: 'm3', target: 'r3', value: 5 }, { source: 'm3', target: 'r4', value: 2 },
      { source: 'm4', target: 'r1', value: 5 }, { source: 'm4', target: 'r2', value: 3 }, { source: 'm4', target: 'r3', value: 2 },
      { source: 'm5', target: 'r1', value: 8 }, { source: 'm5', target: 'r2', value: 7 }, { source: 'm5', target: 'r3', value: 3 }, { source: 'm5', target: 'r4', value: 2 },
    ]
  },
  'default': {
    left: [{ id: 'all', label: 'Segment Population', value: 100 }],
    middle: [
      { id: 'm1', label: 'Art', value: 30 },
      { id: 'm2', label: 'Programming', value: 30 },
      { id: 'm3', label: 'Other', value: 40 },
    ],
    right: [
      { id: 'r1', label: 'Junior', value: 30 },
      { id: 'r2', label: 'Mid', value: 40 },
      { id: 'r3', label: 'Senior+', value: 30 },
    ],
    links: [
      { source: 'all', target: 'm1', value: 30 },
      { source: 'all', target: 'm2', value: 30 },
      { source: 'all', target: 'm3', value: 40 },
      { source: 'm1', target: 'r1', value: 10 }, { source: 'm1', target: 'r2', value: 10 }, { source: 'm1', target: 'r3', value: 10 },
      { source: 'm2', target: 'r1', value: 10 }, { source: 'm2', target: 'r2', value: 10 }, { source: 'm2', target: 'r3', value: 10 },
      { source: 'm3', target: 'r1', value: 10 }, { source: 'm3', target: 'r2', value: 20 }, { source: 'm3', target: 'r3', value: 10 },
    ]
  }
};

// --- HELPER FUNCTIONS ---
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number){
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");       
}

// --- COMPONENTS ---

const DonutChart = ({ data, onDrilldown }: { data: any[], onDrilldown: (id: string, label: string) => void }) => {
  const radius = 38;
  const cx = 50;
  const cy = 50;
  
  const [hovered, setHovered] = useState(data[0]);

  let currentAngle = 0;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
        {data.map((d, i) => {
          const sliceAngle = (d.value / total) * 360;
          const start = currentAngle;
          const end = currentAngle + sliceAngle;
          currentAngle += sliceAngle;
          
          const pathData = describeArc(cx, cy, radius, start, end - 1.5);
          
          return (
            <motion.path
              key={d.id}
              d={pathData}
              fill="none"
              stroke={d.color}
              strokeWidth={hovered.id === d.id ? "16" : "12"}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHovered(d)}
              onClick={() => onDrilldown(d.id, d.label)}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
        <span className="text-xl font-bold" style={{ color: hovered.color }}>{hovered.value}%</span>
        <span className="text-[10px] text-slate-500 font-medium tracking-wide max-w-[60px] text-center leading-tight">{hovered.label}</span>
      </div>
    </div>
  );
}

const Legend = ({ data }: { data: any[] }) => (
  <div className="mt-6 space-y-3 flex flex-col items-center">
    {data.map(d => (
      <div key={d.id} className="flex items-center text-sm w-36">
        <div className="w-3 h-3 rounded-full mr-3 shrink-0" style={{ backgroundColor: d.color }} />
        <span className="text-slate-600 flex-1">{d.label}</span>
        <span className="font-bold text-slate-800 ml-2">{d.value}%</span>
      </div>
    ))}
  </div>
);

const BarChart = ({ data, onDrilldown, layout = 'horizontal' }: { data: any[], onDrilldown: (id: string, label: string) => void, layout?: 'horizontal' | 'vertical' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  if (layout === 'horizontal') {
    return (
      <div className="flex flex-col space-y-5">
        {data.map((d, i) => (
          <div key={d.id} className="flex items-center group cursor-pointer" onClick={() => onDrilldown(d.id, d.label)}>
            <div className="w-32 text-sm font-medium text-slate-700">{d.label}</div>
            <div className="flex-1 h-7 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                className="h-full rounded-full flex items-center px-3 text-xs text-white font-bold"
                style={{ backgroundColor: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(d.value / maxValue) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, type: "spring", bounce: 0.2 }}
              >
                {d.value}%
              </motion.div>
            </div>
            <div className="w-8 ml-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-slate-600 transition-all transform group-hover:translate-x-1">
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex items-end space-x-4 h-64 w-full justify-between mt-8">
      {data.map((d, i) => (
         <div key={d.id} className="flex flex-col items-center flex-1 group cursor-pointer h-full justify-end" onClick={() => onDrilldown(d.id, d.label)}>
            <div className="text-sm font-bold text-slate-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:-translate-y-1 duration-300">
               £{d.value}k
            </div>
            <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end relative max-w-[80px]">
              <motion.div
                className="w-full rounded-t-xl"
                style={{ backgroundColor: d.color }}
                initial={{ height: 0 }}
                animate={{ height: `${(d.value / maxValue) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, type: "spring", bounce: 0.2 }}
              />
            </div>
            <div className="mt-4 text-sm font-medium text-slate-700 text-center">{d.label}</div>
         </div>
      ))}
    </div>
  )
}

const SankeyDiagram = ({ dataId }: { dataId: string }) => {
  const data = drillDownNodes[dataId] || drillDownNodes['default'];
  
  const width = 800;
  const height = 400;
  const padding = 20;
  
  const columns = [data.left, data.middle, data.right];
  const xPositions = [50, 400, 750]; // node centers
  
  const nodes: Record<string, any> = {};
  
  // Need to compute column sums for scaling
  const colSums = columns.map(col => col.reduce((s: number, n: any) => s + n.value, 0));
  const maxColSum = Math.max(...colSums);
  
  const availableHeight = height - (Math.max(...columns.map(c => c.length)) * padding);
  const scale = availableHeight / maxColSum;
  
  const colColors = ['#012169', '#3b82f6', '#C8102E'];

  columns.forEach((col, colIndex) => {
    let currentY = 10;
    col.forEach(node => {
      const nodeHeight = node.value * scale;
      nodes[node.id] = {
        ...node,
        x: xPositions[colIndex],
        y: currentY,
        h: nodeHeight,
        outY: currentY,
        inY: currentY,
        color: colColors[colIndex]
      };
      currentY += nodeHeight + padding;
    });
  });
  
  const links = data.links.map(link => {
    const source = nodes[link.source];
    const target = nodes[link.target];
    const linkHeight = link.value * scale;
    
    const sy = source.outY;
    const ty = target.inY;
    
    source.outY += linkHeight;
    target.inY += linkHeight;
    
    return {
      ...link,
      sx: source.x + 15,
      sy: sy,
      tx: target.x - 15,
      ty: ty,
      h: linkHeight,
    };
  });

  return (
    <svg viewBox={`0 0 800 ${height}`} className="w-full h-full min-w-[600px]">
      {/* Links */}
      {links.map((link, i) => {
        const path = `M ${link.sx} ${link.sy + link.h/2} C ${(link.sx + link.tx)/2} ${link.sy + link.h/2}, ${(link.sx + link.tx)/2} ${link.ty + link.h/2}, ${link.tx} ${link.ty + link.h/2}`;
        return (
          <g key={`link-${i}`}>
            <path
              d={path}
              stroke="#e2e8f0"
              strokeWidth={Math.max(link.h, 1)}
              fill="none"
              opacity={0.4}
            />
            <motion.path
              d={path}
              stroke={nodes[link.source].color}
              strokeWidth={Math.max(link.h, 1)}
              fill="none"
              opacity={0.4}
              strokeDasharray="20 40"
              animate={{ strokeDashoffset: [60, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </g>
        );
      })}
      
      {/* Nodes */}
      {Object.values(nodes).map((node, i) => (
        <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
           <rect
             x={-15}
             y={0}
             width={30}
             height={Math.max(node.h, 2)}
             rx={4}
             fill={node.color}
           />
           <text
             x={0}
             y={-6}
             textAnchor="middle"
             className="text-[11px] font-bold fill-slate-700 font-sans"
           >
             {node.label} ({node.value}%)
           </text>
        </g>
      ))}
    </svg>
  );
}

const PledgeSection = ({ onClose }: { onClose: () => void }) => {
  const [signed, setSigned] = useState(false);
  const [signature, setSignature] = useState('');

  const pledges = [
    "I pledge to advocate for transparent salary bands in my organization.",
    "I pledge to mentor junior talent from underrepresented backgrounds.",
    "I pledge to challenge biased hiring and promotion practices."
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition z-20">
          <X size={24} className="text-slate-500" />
        </button>
        
        {signed ? (
           <div className="py-12 text-center flex flex-col items-center">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", bounce: 0.5 }}
             >
               <CheckCircle size={80} className="text-[#C8102E] mb-6" />
             </motion.div>
             <h2 className="text-4xl font-serif font-bold text-[#012169] mb-4">Thank you, {signature || 'Advocate'}!</h2>
             <p className="text-slate-600 text-lg">Your pledge has been recorded. Real change starts with individual commitments.</p>
             <button onClick={onClose} className="mt-12 text-[#012169] font-bold hover:underline">Return to Report</button>
           </div>
        ) : (
           <>
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-bold text-[#012169] mb-3 flex items-center">
                <PenTool className="mr-4 text-[#C8102E]" /> The 2026 Pledge
              </h2>
              <p className="text-slate-500 text-lg">Review the findings and commit to making a difference.</p>
            </div>
            
            <div className="space-y-4 mb-10">
              {pledges.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  key={i} 
                  className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex items-start"
                >
                  <div className="bg-white border border-slate-200 w-6 h-6 rounded-md flex-shrink-0 mr-4 mt-0.5 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#C8102E] rounded-sm" />
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{p}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="border-t border-slate-100 pt-8">
               <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Digital Signature</label>
               <div className="flex flex-col sm:flex-row gap-4">
                 <input 
                   type="text" 
                   placeholder="Type your name to sign" 
                   className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#012169] focus:bg-white font-serif text-xl transition"
                   value={signature}
                   onChange={e => setSignature(e.target.value)}
                 />
                 <button 
                   disabled={!signature}
                   onClick={() => setSigned(true)}
                   className="bg-[#012169] disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-900 text-white px-8 py-4 rounded-xl font-bold transition whitespace-nowrap text-lg"
                 >
                   Sign Pledge
                 </button>
               </div>
            </div>
           </>
        )}
      </motion.div>
    </motion.div>
  );
}


// --- MAIN APP ---
export default function App() {
  const [activeDrilldown, setActiveDrilldown] = useState<{ id: string, label: string } | null>(null);
  const [showPledges, setShowPledges] = useState(false);

  const handleDrilldown = (id: string, label: string) => {
    setActiveDrilldown({ id, label });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-800 pb-20">
      {/* UK Think-Tank Header Trim */}
      <div className="w-full h-3 flex">
         <div className="w-1/3 bg-[#C8102E] h-full" />
         <div className="w-1/3 bg-white h-full" />
         <div className="w-1/3 bg-[#012169] h-full" />
      </div>

      <main className="max-w-5xl mx-auto py-16 px-6">
        <header className="mb-20 text-center relative">
          <div className="inline-block mb-4 text-[#C8102E] font-bold tracking-widest uppercase text-sm border-b-2 border-[#C8102E] pb-1">
            2026 Annual Report
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#012169] mb-6 tracking-tight">
            UK Games Industry Census
          </h1>
          <h2 className="text-2xl font-light text-slate-500 max-w-2xl mx-auto">
            What have we learned? A comprehensive analysis of demographic shifts, compensation, and retention.
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Demographics Card */}
          <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h3 className="text-xl font-bold text-[#012169] border-b-2 border-slate-50 pb-5 mb-8 flex items-center uppercase tracking-wide text-sm">
              <PieChart className="mr-3 text-[#C8102E]" size={20} /> Diversity Breakdown
            </h3>
            <p className="text-slate-500 mb-10 text-sm leading-relaxed">
              Overall representation across the UK workforce. 
              <span className="font-semibold text-slate-700"> Click any segment</span> to drill down into role distribution and seniority pathways via Sankey analysis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-10">
               <div className="flex-1 flex flex-col items-center">
                 <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Gender Identity</h4>
                 <div className="w-48 h-48">
                   <DonutChart data={genderData} onDrilldown={handleDrilldown} />
                 </div>
                 <Legend data={genderData} />
               </div>
               
               <div className="flex-1 flex flex-col items-center">
                 <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Ethnicity</h4>
                 <div className="w-48 h-48">
                   <DonutChart data={ethnicityData} onDrilldown={handleDrilldown} />
                 </div>
                 <Legend data={ethnicityData} />
               </div>
            </div>
          </div>
          
          {/* Layoffs Card */}
          <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-[#012169] border-b-2 border-slate-50 pb-5 mb-8 flex items-center uppercase tracking-wide text-sm">
              <BarChart3 className="mr-3 text-[#C8102E]" size={20} /> Layoff Impact Disparity
            </h3>
            <p className="text-slate-500 mb-10 text-sm leading-relaxed">
              Percentage of the workforce affected by redundancies in the past 12 months, segmented by demographic. Click bars for sub-data.
            </p>
            <div className="flex-1 flex flex-col justify-center">
              <BarChart data={layoffData} layout="horizontal" onDrilldown={handleDrilldown} />
            </div>
          </div>
        </div>
        
        {/* Salary Card */}
        <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-16">
          <h3 className="text-xl font-bold text-[#012169] border-b-2 border-slate-50 pb-5 mb-8 flex items-center uppercase tracking-wide text-sm">
            <BarChart3 className="mr-3 text-[#C8102E]" size={20} /> Median Compensation Trajectory
          </h3>
          <p className="text-slate-500 mb-10 text-sm max-w-3xl leading-relaxed">
            Standard salary progression from entry-level to leadership roles. Significant disparities remain when segmented by demographic (click to explore).
          </p>
          <div className="w-full max-w-4xl mx-auto">
            <BarChart data={salaryData} layout="vertical" onDrilldown={handleDrilldown} />
          </div>
        </div>
        
        {/* Action Section */}
        <div className="text-center py-20 bg-[#012169] text-white rounded-3xl relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8102E] rounded-full blur-[100px] opacity-30 -mr-20 -mt-20 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20 -ml-20 -mb-20 pointer-events-none" />
           
           <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 relative z-10 text-white">Knowledge requires action.</h2>
           <p className="text-blue-100 mb-10 max-w-2xl mx-auto relative z-10 text-lg leading-relaxed">
             We have seen the data. Now it's time to build a more equitable industry. Join the movement and pledge your support for structural change.
           </p>
           <button 
             onClick={() => setShowPledges(true)}
             className="relative z-10 bg-[#C8102E] hover:bg-red-700 text-white px-10 py-5 rounded-xl font-bold text-xl shadow-lg transform transition hover:scale-105 active:scale-95"
           >
             Take Action Now
           </button>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {activeDrilldown && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-10 max-w-5xl w-full h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#012169] font-serif mb-2">
                    Deep Dive: {activeDrilldown.label}
                  </h2>
                  <p className="text-slate-500">Sub-data flowing from Demographic → Role Specialization → Seniority</p>
                </div>
                <button onClick={() => setActiveDrilldown(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <X size={28} className="text-slate-500" />
                </button>
              </div>
              
              <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-8 flex items-center justify-center overflow-x-auto relative shadow-inner">
                 <SankeyDiagram dataId={activeDrilldown.id} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPledges && <PledgeSection onClose={() => setShowPledges(false)} />}
      </AnimatePresence>
    </div>
  );
}
