import { ShieldCheck, ShieldAlert, Zap, AlertCircle, Play, ArrowRight, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FacilityState } from '../types';

interface CommandCenterProps {
  facilityState: FacilityState | null;
  onSimulateM17: () => void;
  onOptimize: () => void;
  onApplyRecommended: () => void;
  isM17Failed: boolean;
  isOptimized: boolean;
  metrics: {
    facilityHealth: number;
    cascadeRisk: number;
    productionAtRisk: number;
    criticalAssets: number;
    resilienceScore: number;
  };
}

export default function CommandCenter({
  onSimulateM17,
  onOptimize,
  onApplyRecommended,
  isM17Failed,
  isOptimized,
  metrics
}: CommandCenterProps) {
  
  // Sparkline history arrays for visual metrics
  const healthData = [
    { v: 92 }, { v: 90 }, { v: 88 }, { v: 86 }, { v: 84 }, { v: metrics.facilityHealth }
  ];
  
  const riskData = isM17Failed
    ? [{ v: 12 }, { v: 18 }, { v: 24 }, { v: 48 }, { v: 72 }, { v: metrics.cascadeRisk }]
    : [{ v: 8 }, { v: 10 }, { v: 12 }, { v: 15 }, { v: 16 }, { v: metrics.cascadeRisk }];

  const lossData = isM17Failed && !isOptimized
    ? [{ v: 0 }, { v: 2 }, { v: 5 }, { v: 11 }, { v: 15 }, { v: 18.4 }]
    : [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];

  const assetData = [
    { v: 1 }, { v: 1 }, { v: 1 }, { v: 2 }, { v: metrics.criticalAssets }
  ];

  const resilienceData = isOptimized
    ? [{ v: 78 }, { v: 72 }, { v: 45 }, { v: 55 }, { v: 70 }, { v: metrics.resilienceScore }]
    : [{ v: 82 }, { v: 80 }, { v: 78 }, { v: 75 }, { v: 76 }, { v: metrics.resilienceScore }];

  return (
    <div className="flex flex-col gap-6 select-none animate-fadeIn">
      
      {/* Page Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100 uppercase">ARGUS COCKPIT</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Real-time facility digital twin and world model decision panel.</p>
        </div>
        
        {/* Quick Demo Controls */}
        <div className="flex items-center gap-3">
          {!isM17Failed ? (
            <button
              onClick={onSimulateM17}
              className="px-4 py-2 bg-alarm-red hover:bg-rose-600 active:scale-95 text-slate-100 rounded-md text-xs font-bold font-mono tracking-widest flex items-center gap-2 shadow-[0_4px_14px_rgba(244,63,94,0.3)] transition-all duration-200 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              SIMULATE M17 FAILURE
            </button>
          ) : (
            <span className="px-4 py-2 border border-alarm-red/20 bg-rose-950/15 text-alarm-red text-xs font-bold font-mono rounded-md animate-pulse tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-alarm-red animate-ping" />
              CRITICAL CASCADE WARNING ACTIVE
            </span>
          )}
          
          {isM17Failed && !isOptimized && (
            <button
              onClick={onOptimize}
              className="px-4 py-2 bg-alarm-purple hover:bg-purple-600 active:scale-95 text-slate-100 rounded-md text-xs font-bold font-mono tracking-widest flex items-center gap-2 shadow-[0_4px_14px_rgba(168,85,247,0.3)] transition-all duration-200 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              RUN OPTIMIZER
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics Cards Row with Sparklines */}
      <div className="grid grid-cols-5 gap-4">
        
        {/* Facility Health Card */}
        <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg shadow-md hover:border-industrial-700/80 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/25 to-transparent" />
          <span className="text-[10px] text-slate-500 font-mono font-bold block mb-1">FACILITY HEALTH</span>
          <div className="flex justify-between items-baseline mt-1.5 z-10 relative">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{metrics.facilityHealth}%</span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
              metrics.facilityHealth > 75 ? 'bg-alarm-green/10 text-alarm-green' : 'bg-alarm-red/10 text-alarm-red'
            }`}>
              {metrics.facilityHealth > 75 ? 'NOMINAL' : 'DEGRADED'}
            </span>
          </div>
          {/* Sparkline */}
          <div className="h-10 w-full mt-3 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="healthS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metrics.facilityHealth > 75 ? '#10b981' : '#e11d48'} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={metrics.facilityHealth > 75 ? '#10b981' : '#e11d48'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={metrics.facilityHealth > 75 ? '#059669' : '#e11d48'} strokeWidth={1.5} fillOpacity={1} fill="url(#healthS)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cascade Risk Card */}
        <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg shadow-md hover:border-industrial-700/80 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/25 to-transparent" />
          <span className="text-[10px] text-slate-500 font-mono font-bold block mb-1">CASCADE RISK</span>
          <div className="flex justify-between items-baseline mt-1.5 z-10 relative">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{metrics.cascadeRisk}%</span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
              metrics.cascadeRisk > 40 ? 'bg-alarm-red/10 text-alarm-red animate-pulse' : 'bg-alarm-green/10 text-alarm-green'
            }`}>
              {metrics.cascadeRisk > 40 ? 'CRITICAL' : 'SECURE'}
            </span>
          </div>
          {/* Sparkline */}
          <div className="h-10 w-full mt-3 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metrics.cascadeRisk > 40 ? '#e11d48' : '#10b981'} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={metrics.cascadeRisk > 40 ? '#e11d48' : '#10b981'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={metrics.cascadeRisk > 40 ? '#e11d48' : '#059669'} strokeWidth={1.5} fillOpacity={1} fill="url(#riskS)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Production At Risk Card */}
        <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg shadow-md hover:border-industrial-700/80 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/25 to-transparent" />
          <span className="text-[10px] text-slate-500 font-mono font-bold block mb-1">PRODUCTION AT RISK</span>
          <div className="flex justify-between items-baseline mt-1.5 z-10 relative">
            <span className="text-2xl font-bold font-mono tracking-tight text-alarm-red">₹{round(metrics.productionAtRisk / 100000, 1)}L</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">SIMULATED</span>
          </div>
          {/* Sparkline */}
          <div className="h-10 w-full mt-3 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lossData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lossS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#e11d48" strokeWidth={1.5} fillOpacity={1} fill="url(#lossS)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Assets Card */}
        <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg shadow-md hover:border-industrial-700/80 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/25 to-transparent" />
          <span className="text-[10px] text-slate-500 font-mono font-bold block mb-1">CRITICAL ASSETS</span>
          <div className="flex justify-between items-baseline mt-1.5 z-10 relative">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{metrics.criticalAssets}</span>
            <span className="text-[9px] font-mono text-slate-500 font-semibold uppercase">WARNING/CRIT</span>
          </div>
          {/* Sparkline */}
          <div className="h-10 w-full mt-3 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={assetData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="assetS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#d97706" strokeWidth={1.5} fillOpacity={1} fill="url(#assetS)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resilience Score Card */}
        <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg shadow-md hover:border-industrial-700/80 transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/25 to-transparent" />
          <span className="text-[10px] text-slate-500 font-mono font-bold block mb-1">RESILIENCE SCORE</span>
          <div className="flex justify-between items-baseline mt-1.5 z-10 relative">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{metrics.resilienceScore}/100</span>
            <span className="text-[9px] font-mono text-slate-500 font-semibold uppercase">STRUCTURAL</span>
          </div>
          {/* Sparkline */}
          <div className="h-10 w-full mt-3 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resilienceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="resS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={1.5} fillOpacity={1} fill="url(#resS)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>

      {/* Main Dashboard Workspace split */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active status, Recommended Actions, Before/After Comparisons */}
        <div className="col-span-2 flex flex-col gap-6">
          
          {/* Active Cascade Alert and Action Panel */}
          {isM17Failed && (
            <div className="border border-alarm-purple/20 bg-purple-950/5 backdrop-blur-md p-6 rounded-lg flex flex-col gap-4 shadow-[0_4px_25px_rgba(168,85,247,0.03)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-alarm-purple/10 border border-alarm-purple/20 rounded-md text-alarm-purple shrink-0">
                  <ShieldAlert className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-100 tracking-wider">⭐ SYSTEMIC ANOMALY CONTAINMENT SUGGESTED</h3>
                  <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                    A severe disruption at machine <strong className="text-slate-200">M17 (Line 3 CNC Precision Unit)</strong> threatens downstream assembly lines. ARGUS has simulated counterfactual trajectories and optimized the containment path.
                  </p>
                </div>
              </div>

              {/* Recommended Steps Panel */}
              <div className="bg-industrial-900/60 border border-industrial-800/80 p-5 rounded-md flex flex-col gap-4">
                <div className="text-[9px] font-bold font-mono text-alarm-purple uppercase tracking-widest border-b border-industrial-800 pb-2">
                  RECOMMENDED INTERVENTION STRATEGY
                </div>
                
                <ol className="flex flex-col gap-3.5 text-xs font-mono">
                  <li className="flex items-start gap-3">
                    <span className="w-5.5 h-5.5 rounded-full bg-industrial-800 border border-industrial-700 flex items-center justify-center font-bold text-[10px] text-slate-355 shrink-0">1</span>
                    <div>
                      <span className="font-semibold text-slate-250 block text-[11px]">Reduce load on M19 by 20%</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Prevents secondary wear-induced thermal failure on adjacent laser cutter unit.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5.5 h-5.5 rounded-full bg-industrial-800 border border-industrial-700 flex items-center justify-center font-bold text-[10px] text-slate-355 shrink-0">2</span>
                    <div>
                      <span className="font-semibold text-slate-250 block text-[11px]">Shift Batch #482 from Line 3 to Line 2</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Reroutes production flow of high-value parts, avoiding penalty windows.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5.5 h-5.5 rounded-full bg-industrial-800 border border-industrial-700 flex items-center justify-center font-bold text-[10px] text-slate-355 shrink-0">3</span>
                    <div>
                      <span className="font-semibold text-slate-250 block text-[11px]">Prioritize M17 Emergency Overhaul</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Deploy maintenance crew immediately to address root bearing failures.</span>
                    </div>
                  </li>
                </ol>

                <div className="grid grid-cols-3 gap-2 border-t border-industrial-800 pt-4 mt-2 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Cascade Risk After</span>
                    <span className="text-sm font-bold text-alarm-green mt-0.5 block">84% &rarr; 18%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Production Preserved</span>
                    <span className="text-sm font-bold text-slate-250 mt-0.5 block">91%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Estimated Loss Saved</span>
                    <span className="text-sm font-bold text-alarm-green mt-0.5 block">₹11.7 Lakh</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-1">
                {!isOptimized ? (
                  <button
                    onClick={onApplyRecommended}
                    className="px-4 py-2.5 bg-alarm-green hover:bg-emerald-600 active:scale-95 text-slate-900 rounded-md text-xs font-bold font-mono tracking-widest flex items-center gap-1.5 shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition-all duration-200 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3px]" />
                    APPLY CONTAINMENT STRATEGY
                  </button>
                ) : (
                  <span className="text-xs font-mono font-bold text-alarm-green flex items-center gap-1.5 py-2.5 px-4 border border-alarm-green/30 bg-emerald-950/20 rounded-md">
                    ● STRATEGY APPLIED — CASCADE CONTAINED
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Core Differentiator: Before vs After Containment flowchart */}
          <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-6 rounded-lg shadow-md">
            <h3 className="text-xs font-bold font-mono text-slate-350 tracking-wider mb-5 border-b border-industrial-800 pb-2">
              CASCADE DECISION CONTROL PROCESS
            </h3>
            
            <div className="grid grid-cols-2 gap-6 relative">
              
              {/* Left Column: Without ARGUS (Unmitigated) */}
              <div className="flex flex-col gap-3 text-xs border-r border-industrial-800/50 pr-6">
                <div className="text-[9px] font-bold font-mono text-alarm-red uppercase tracking-widest block mb-1">
                  WITHOUT ARGUS (UNMITIGATED CATASTROPHIC FAILURE)
                </div>
                
                <div className="bg-slate-950/60 p-3.5 border border-industrial-800 rounded-md">
                  <span className="font-bold text-slate-200">M17 CNC failure</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Machine loses bearing lubrication, overheating under heavy load.</p>
                </div>
                
                {/* Animating Conveyor Belt - Stopped (Fault state) */}
                <div className="flex justify-center items-center py-1">
                  <svg className="w-24 h-5 text-alarm-red/35" viewBox="0 0 100 20" fill="none">
                    <line x1="5" y1="10" x2="95" y2="10" stroke="currentColor" strokeWidth="3" className="conveyor-belt-stopped" />
                    <circle cx="20" cy="10" r="3.5" fill="currentColor" />
                    <circle cx="50" cy="10" r="3.5" fill="currentColor" />
                    <circle cx="80" cy="10" r="3.5" fill="currentColor" />
                  </svg>
                </div>
                
                <div className="bg-slate-950/60 p-3.5 border border-industrial-800 rounded-md">
                  <span className="font-bold text-slate-200">Line 3 Degradation</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Precision Line 3 throughput drops to 0%, starving adjacent assemblies.</p>
                </div>

                <div className="flex justify-center items-center py-1">
                  <svg className="w-24 h-5 text-alarm-red/35" viewBox="0 0 100 20" fill="none">
                    <line x1="5" y1="10" x2="95" y2="10" stroke="currentColor" strokeWidth="3" className="conveyor-belt-stopped" />
                    <circle cx="20" cy="10" r="3.5" fill="currentColor" />
                    <circle cx="50" cy="10" r="3.5" fill="currentColor" />
                    <circle cx="80" cy="10" r="3.5" fill="currentColor" />
                  </svg>
                </div>
                
                <div className="bg-slate-950/60 p-3.5 border border-industrial-800 rounded-md">
                  <span className="font-bold text-slate-200">M19 Thermal Overload</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Adjacent Laser Cutter pulls excessive power and ambient heat rises.</p>
                </div>

                <div className="flex justify-center items-center py-1">
                  <svg className="w-24 h-5 text-alarm-red/35" viewBox="0 0 100 20" fill="none">
                    <line x1="5" y1="10" x2="95" y2="10" stroke="currentColor" strokeWidth="3" className="conveyor-belt-stopped" />
                    <circle cx="20" cy="10" r="3.5" fill="currentColor" />
                    <circle cx="50" cy="10" r="3.5" fill="currentColor" />
                    <circle cx="80" cy="10" r="3.5" fill="currentColor" />
                  </svg>
                </div>

                <div className="bg-slate-950/60 p-3.5 border border-alarm-red/10 bg-red-950/5 rounded-md">
                  <span className="font-bold text-alarm-red">Batch Delay & STOCKOUT</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Priority Batch #482 delayed, inventory drops below buffer. Order lost.</p>
                </div>
              </div>

              {/* Right Column: With ARGUS (Contained) */}
              <div className="flex flex-col gap-3 text-xs">
                <div className="text-[9px] font-bold font-mono text-alarm-green uppercase tracking-widest block mb-1">
                  WITH ARGUS (CONTAINED OPTIMIZED RESILIENCE)
                </div>
                
                <div className="bg-slate-950/60 p-3.5 border border-industrial-800 rounded-md">
                  <span className="font-bold text-slate-200">Abnormal telemetry detected</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">M17 bearing heat trend prompts failure likelihood of 92%.</p>
                </div>

                {/* Animating Conveyor Belt - Flowing Green (Operational state) */}
                <div className="flex justify-center items-center py-1">
                  <svg className="w-24 h-5 text-alarm-green/60" viewBox="0 0 100 20" fill="none">
                    <line x1="5" y1="10" x2="95" y2="10" stroke="currentColor" strokeWidth="3" className="conveyor-belt text-alarm-green/80" />
                    <circle cx="20" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                    <circle cx="50" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                    <circle cx="80" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                  </svg>
                </div>
                
                <div className="bg-slate-950/60 p-3.5 border border-industrial-800 rounded-md">
                  <span className="font-bold text-slate-200">M19 Load Reduced by 20%</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Slowing M19 preserves its bearings and limits thermal emission in Zone 3.</p>
                </div>

                <div className="flex justify-center items-center py-1">
                  <svg className="w-24 h-5 text-alarm-green/60" viewBox="0 0 100 20" fill="none">
                    <line x1="5" y1="10" x2="95" y2="10" stroke="currentColor" strokeWidth="3" className="conveyor-belt text-alarm-green/80" />
                    <circle cx="20" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                    <circle cx="50" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                    <circle cx="80" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                  </svg>
                </div>
                
                <div className="bg-slate-950/60 p-3.5 border border-industrial-800 rounded-md">
                  <span className="font-bold text-slate-200">Batch #482 shifted to Line 2</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Precision assembly resumes on Line 2 with 15 mins setup delay.</p>
                </div>

                <div className="flex justify-center items-center py-1">
                  <svg className="w-24 h-5 text-alarm-green/60" viewBox="0 0 100 20" fill="none">
                    <line x1="5" y1="10" x2="95" y2="10" stroke="currentColor" strokeWidth="3" className="conveyor-belt text-alarm-green/80" />
                    <circle cx="20" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                    <circle cx="50" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                    <circle cx="80" cy="10" r="3.5" fill="currentColor" className="animate-pulse" />
                  </svg>
                </div>
                
                <div className="bg-slate-950/60 p-3.5 border border-alarm-green/10 bg-emerald-950/5 rounded-md">
                  <span className="font-bold text-alarm-green">Root cause repaired & contained</span>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Crew repairs M17. Batch completed on time. ₹11.7 lakh penalty avoided.</p>
                </div>
              </div>

            </div>
          </div>
          
        </div>

        {/* Right 1 Col: Active alerts, Safety and Responsibility, Facility Info */}
        <div className="flex flex-col gap-6">
          
          {/* Active Alerts Panel */}
          <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg flex-1 shadow-md">
            <h3 className="text-xs font-bold font-mono text-slate-350 tracking-wider mb-4 border-b border-industrial-800 pb-2">
              REAL-TIME OPERATIONAL STATUS
            </h3>
            
            <div className="flex flex-col gap-3 font-mono">
              {isM17Failed ? (
                <div className="p-3 border border-alarm-red/20 bg-rose-950/5 rounded-md flex items-start gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-alarm-red shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-[10px] leading-relaxed text-slate-400">
                    <strong className="text-alarm-red block">CRITICAL FAILURE: M17</strong>
                    Machine capacity degraded to 0%. Line 3 bottleneck created. Production stopped.
                  </div>
                </div>
              ) : (
                <div className="p-3 border border-alarm-amber/20 bg-amber-950/5 rounded-md flex items-start gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 text-alarm-amber shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-[10px] leading-relaxed text-slate-400">
                    <strong className="text-alarm-amber block">PREDICTIVE ACTION: M17</strong>
                    Failure probability at 92%. Vibration spikes (7.8mm/s) and bearing heat trend is high.
                  </div>
                </div>
              )}

              {isM17Failed && !isOptimized && (
                <div className="p-3 border border-alarm-red/20 bg-rose-950/5 rounded-md flex items-start gap-2.5 animate-pulse">
                  <AlertCircle className="w-4.5 h-4.5 text-alarm-red shrink-0 mt-0.5" />
                  <div className="text-[10px] leading-relaxed text-slate-400">
                    <strong className="text-alarm-red block">SECONDARY OVERLOAD: M19</strong>
                    Laser Cutter operating past safety margin. Spindle bearing temperature approaching 85°C.
                  </div>
                </div>
              )}
              
              <div className="p-3 border border-industrial-800/80 bg-slate-950/40 rounded-md flex items-start gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-alarm-green shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed text-slate-400">
                  <strong className="text-slate-350 block">COOLING LOOP: OK</strong>
                  Zones 1 and 2 operate within nominal limits. Zone 3 operates warm (75% thermal load).
                </div>
              </div>

              {/* Power Oscilloscope Segment */}
              <div className="p-3 border border-industrial-800/80 bg-slate-950/40 rounded-md flex items-start gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-alarm-green shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed text-slate-400 w-full">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-slate-350">UTILITY FEED: STABLE</strong>
                    {/* Live Oscilloscope Waveform */}
                    <svg className="w-16 h-3 text-alarm-green" viewBox="0 0 100 20" fill="none">
                      <path d="M0,10 Q12.5,0 25,10 T50,10 T75,10 T100,10" stroke="currentColor" strokeWidth="2" className="oscilloscope-wave" />
                    </svg>
                  </div>
                  Power grid load: 587kW (73.4% capacity). Compressed air pressure: 7.2 bar.
                </div>
              </div>
            </div>
          </div>

          {/* Safety constraints panel - human-in-the-loop */}
          <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg shadow-md">
            <h3 className="text-xs font-bold font-mono text-slate-350 tracking-wider mb-3 flex items-center gap-1.5 border-b border-industrial-800 pb-2">
              <ShieldCheck className="w-4.5 h-4.5 text-alarm-purple" />
              HUMAN-IN-THE-LOOP CONTROL
            </h3>
            
            <div className="text-[11px] leading-relaxed text-slate-400 flex flex-col gap-3 font-mono">
              <p>
                ARGUS is configured as a <strong className="text-slate-200">Decision Support Engine</strong>. 
                Safety overrides prohibit the direct automation of physical actuators.
              </p>
              
              <blockquote className="border-l-2 border-industrial-800 pl-3 py-1 italic text-[10px] text-slate-500 bg-slate-950/20 rounded-r-sm">
                Human operator verification and explicit approval are strictly required prior to routing updates, PLC alterations, or scheduling injections.
              </blockquote>

              <div className="flex gap-2 text-[10px] font-bold mt-1.5">
                <span className="px-2 py-1 bg-industrial-950 border border-industrial-850 text-slate-400 rounded-sm">PLC LOGS: OFF</span>
                <span className="px-2 py-1 bg-alarm-purple/10 border border-alarm-purple/30 text-alarm-purple rounded-sm">DECISION RATIO: 1:1</span>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>

      {/* Syslog Event Stream Terminal Panel */}
      <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg shadow-md font-mono">
        <h3 className="text-xs font-bold text-slate-350 tracking-wider border-b border-industrial-800 pb-2.5 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="flex gap-1.5 shrink-0 mr-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-alarm-red/70 border border-alarm-red/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-alarm-amber/70 border border-alarm-amber/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-alarm-green/70 border border-alarm-green/10" />
            </span>
            <span>🖥️ ARGUS SYSTEM SYSLOG FEED (ACTIVE STREAM)</span>
          </div>
          <span className="text-[9px] text-slate-550 text-slate-500">SYSTEM TIME: LIVE</span>
        </h3>
        
        <div className="bg-industrial-950/80 border border-industrial-850 p-4 rounded-md flex flex-col gap-1.5 text-[10px] text-slate-400 overflow-y-auto max-h-[140px] leading-relaxed shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.5)]">
          <div><span className="text-slate-500 font-bold">[09:41:02]</span> <span className="text-alarm-amber">WARN</span>: Telemetry bearing anomaly detected on CNC Unit <strong className="text-slate-350">M17</strong>.</div>
          <div><span className="text-slate-500 font-bold">[09:41:05]</span> <span className="text-alarm-red font-bold">CRIT</span>: ML Failure Predictor recalculated probability for M17 to <strong className="text-alarm-red">92.4%</strong> (Vibration: 7.8mm/s, Temp: 87.2°C).</div>
          <div><span className="text-slate-500 font-bold">[09:41:08]</span> <span className="text-alarm-purple font-bold">INFO</span>: Topological Graph AI triggered. Warmed betweenness and PageRank centralities.</div>
          <div><span className="text-slate-500 font-bold">[09:41:11]</span> <span className="text-alarm-purple font-bold">INFO</span>: Downstream dependency path identified: <strong className="text-slate-350">M17 &rarr; Line 3 &rarr; M19 &rarr; Cooling Zone 3 &rarr; Batch #482</strong>.</div>
          <div><span className="text-slate-500 font-bold">[09:41:14]</span> <span className="text-alarm-purple font-bold">INFO</span>: World Model counterfactual engine spawned 24 branching future rollouts (180 min horizon).</div>
          {isM17Failed && (
            <>
              <div><span className="text-slate-500 font-bold">[09:41:18]</span> <span className="text-alarm-amber">WARN</span>: Cascade propagation threshold breached at T+4 min (Line 3 capacity degraded to 30%).</div>
              <div><span className="text-slate-500 font-bold">[09:41:22]</span> <span className="text-alarm-purple font-bold">INFO</span>: Gymnasium environment initialized. Stable-Baselines3 PPO agent evaluated optimal policy matrix.</div>
              {isOptimized ? (
                <div><span className="text-slate-500 font-bold">[09:41:26]</span> <span className="text-alarm-green font-bold">SUCCESS</span>: Approved intervention applied. M17 repaired. M19 load throttled. Batch shifted. Cascade risk minimized to 18%.</div>
              ) : (
                <div><span className="text-slate-500 font-bold">[09:41:26]</span> <span className="text-alarm-purple font-bold">INFO</span>: Optimal containment strategy generated: <strong className="text-alarm-green">Repair M17 + Shift Batch #482 to Line 2 + Reduce M19 load</strong>. Awaiting operator confirmation.</div>
              )}
            </>
          )}
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
