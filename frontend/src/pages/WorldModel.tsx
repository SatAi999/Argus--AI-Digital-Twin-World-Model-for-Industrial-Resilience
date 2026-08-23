import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Workflow, ArrowRight } from 'lucide-react';
import { FacilityState } from '../types';

interface WorldModelProps {
  facilityState: FacilityState | null;
  isM17Failed: boolean;
  isOptimized: boolean;
}

export default function WorldModel({ isM17Failed, isOptimized }: WorldModelProps) {
  
  // Generate synthetic trajectory data for Recharts based on active state
  const chartData = useMemo(() => {
    const data = [];
    const steps = 37; // 180 minutes / 5 minutes + 1
    
    for (let i = 0; i < steps; i++) {
      const min = i * 5;
      
      // 1. Status Quo trajectory (healthy baseline)
      const quoResilience = 78.0;
      const quoLoss = 0.0;
      
      // 2. Unmitigated Failure trajectory (M17 fails at T=0, cascade triggers)
      let failResilience = 78.0;
      let failLoss = 0.0;
      if (i > 0) {
        failResilience = Math.max(18.0, 78.0 - (i * 1.8));
        failLoss = round((i * i * 1400) / 100000.0, 2); // In Lakhs
      }
      if (i >= 29) {
        failLoss = 18.4; // cap at ₹18.4L
      }
      
      // 3. Contained Intervention trajectory (Applied strategy)
      let contResilience = 78.0;
      let contLoss = 0.0;
      
      if (i > 0) {
        if (i < 4) {
          contResilience = 78.0 - (i * 1.8);
          contLoss = round((i * i * 1400) / 100000.0, 2);
        } else {
          contResilience = Math.min(91.0, 71.0 + (i - 4) * 0.85);
          const backgroundLoss = round((4 * 4 * 1400) / 100000.0, 2);
          const interventionCost = 2.2; // ₹2.2L total cost of repairs + shift
          const residualLoss = Math.min(4.5, (i - 4) * 0.15);
          contLoss = round(backgroundLoss + interventionCost + residualLoss, 2);
        }
      }

      data.push({
        time: min,
        'Resilience (Status Quo)': quoResilience,
        'Loss (Status Quo)': quoLoss,
        'Resilience (Unmitigated)': failResilience,
        'Loss (Unmitigated)': failLoss,
        'Resilience (Contained)': contResilience,
        'Loss (Contained)': contLoss
      });
    }
    return data;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100">ARGUS WORLD MODEL</h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Explore branching futures and transition probability states.</p>
      </div>

      {/* Branching futures layout */}
      <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm flex flex-col gap-5">
        <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider mb-2 border-b border-industrial-800 pb-2 flex items-center gap-1.5">
          <Workflow className="w-4 h-4 text-alarm-purple" />
          DECISION BRANCH BRANCHING TRAJECTORIES
        </h3>

        <div className="flex items-center justify-between gap-4 text-center">
          
          {/* Node 1: Current State */}
          <div className="w-44 p-4 border border-industrial-700 bg-industrial-950 rounded-sm">
            <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">ROOT STATE S0</span>
            <span className="text-sm font-semibold text-slate-200 font-mono">NOMINAL STATUS</span>
            <div className="text-[10px] text-alarm-green font-semibold font-mono mt-1">100% OPERATIONAL</div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-650" />

          {/* Node 2: Disruption Event */}
          <div className="w-44 p-4 border border-alarm-red/50 bg-red-950/15 rounded-sm">
            <span className="text-[10px] text-alarm-red font-mono uppercase block mb-1">M17 DISRUPTION</span>
            <span className="text-sm font-semibold text-slate-200 font-mono">BEARING LOCKUP</span>
            <div className="text-[10px] text-alarm-red font-semibold font-mono mt-1">T+0 MINUTES</div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-650" />

          {/* Branch Fork Node */}
          <div className="flex flex-col gap-4 text-left">
            {/* Future Branch A: Unmitigated */}
            <div className={`w-64 p-3 border rounded-sm flex justify-between items-center ${
              isM17Failed && !isOptimized ? 'border-alarm-red bg-red-950/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]' : 'border-industrial-800 bg-industrial-950'
            }`}>
              <div className="font-mono">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">FUTURE A (UNMITIGATED)</span>
                <span className="text-xs font-semibold text-slate-300">Cascading System Collapse</span>
              </div>
              <span className="text-xs font-bold text-alarm-red font-mono">₹18.4L LOSS</span>
            </div>

            {/* Future Branch B: Contained */}
            <div className={`w-64 p-3 border rounded-sm flex justify-between items-center ${
              isOptimized ? 'border-alarm-green bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'border-industrial-800 bg-industrial-950'
            }`}>
              <div className="font-mono">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">FUTURE B (CONTAINED)</span>
                <span className="text-xs font-semibold text-slate-300">Optimized Load Mitigation</span>
              </div>
              <span className="text-xs font-bold text-alarm-green font-mono">₹6.7L LOSS</span>
            </div>
          </div>

        </div>
      </div>

      {/* Trajectory Forecast Chart */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Plot Workspace (Left 2 Cols) */}
        <div className="col-span-2 bg-industrial-900 border border-industrial-800 p-5 rounded-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2">
            ROLLOUT FORECAST FOR THE NEXT 3 HOURS
          </h3>
          
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161920" />
                <XAxis dataKey="time" stroke="#4c5566" tick={{ fill: '#738099', fontSize: 10 }} label={{ value: 'Time (Minutes)', position: 'insideBottom', offset: -10, fill: '#738099', fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#4c5566" tick={{ fill: '#738099', fontSize: 10 }} domain={[0, 100]} label={{ value: 'Resilience Score', angle: -90, position: 'insideLeft', fill: '#738099', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#4c5566" tick={{ fill: '#738099', fontSize: 10 }} domain={[0, 20]} label={{ value: 'Cum. Loss (₹ Lakhs)', angle: 90, position: 'insideRight', fill: '#738099', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0e1014', border: '1px solid #2c3240', borderRadius: '2px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: 11 }}
                  labelFormatter={(label) => `T+${label} min`}
                />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#a3b0cc' }} />
                
                {/* Resilience Lines */}
                <Line yAxisId="left" type="monotone" dataKey="Resilience (Status Quo)" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                <Line yAxisId="left" type="monotone" dataKey="Resilience (Unmitigated)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="Resilience (Contained)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                
                {/* Loss Lines */}
                <Line yAxisId="right" type="monotone" dataKey="Loss (Unmitigated)" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="Loss (Contained)" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Causal Explanations Sidebar (Right 1 Col) */}
        <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2">
            WORLD MODEL RULES
          </h3>
          
          <div className="flex flex-col gap-3.5 text-xs text-slate-400">
            <div>
              <strong className="text-slate-300 font-mono block mb-1">STATE COMPILATION</strong>
              <p className="leading-relaxed">
                The World Model models the facility as a state space vector S_t = (M_t, L_t, U_t, B_t). 
                State transitions S_t+1 = f(S_t, a_t) compute physical interactions in real-time.
              </p>
            </div>

            <div>
              <strong className="text-slate-300 font-mono block mb-1">SECONDARY CASCADE PATHWAYS</strong>
              <p className="leading-relaxed">
                If the CNC unit M17 fails, Line 3 capacity drops to 0. Works on laser cutter M19 spike, 
                overloading its drive shafts, raising thermal load on Cooling Zone 3 past 100%, 
                and causing adjacent stamping nodes to warm and deteriorate.
              </p>
            </div>

            <div>
              <strong className="text-slate-300 font-mono block mb-1">INTERVENTION FEEDBACKS</strong>
              <p className="leading-relaxed">
                Throttling M19 load by 20% drops zone 3 load to 78%, resolving ambient thermal stress. 
                Shifting Batch #482 to Line 2 moves production load to Line 2 (utilization goes to 85%), 
                bypassing the damaged CNC unit and eliminating inventory penalties.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

function round(val: number, decimals = 1): number {
  if (val === undefined || isNaN(val)) return 0;
  const mult = Math.pow(10, decimals);
  return Math.round(val * mult) / mult;
}
