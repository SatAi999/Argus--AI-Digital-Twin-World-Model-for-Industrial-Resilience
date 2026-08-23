import React from 'react';
import { ShieldCheck, ShieldAlert, Zap, Layers, AlertCircle, Play, ArrowRight, Check } from 'lucide-react';
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
  facilityState,
  onSimulateM17,
  onOptimize,
  onApplyRecommended,
  isM17Failed,
  isOptimized,
  metrics
}: CommandCenterProps) {
  
  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Title Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100">ARGUS COMMAND CENTER</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time facility digital twin and world model decision panel.</p>
        </div>
        
        {/* Quick Demo Controls */}
        <div className="flex items-center gap-3">
          {!isM17Failed ? (
            <button
              onClick={onSimulateM17}
              className="px-4 py-2 bg-alarm-red hover:bg-red-600 active:bg-alarm-red text-slate-100 rounded-sm text-xs font-bold font-mono tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              SIMULATE M17 FAILURE
            </button>
          ) : (
            <span className="px-4 py-2 border border-alarm-red bg-red-950/20 text-alarm-red text-xs font-bold font-mono rounded-sm animate-pulse tracking-wider">
              ● CRITICAL CASCADE WARNING ACTIVE
            </span>
          )}
          
          {isM17Failed && !isOptimized && (
            <button
              onClick={onOptimize}
              className="px-4 py-2 bg-alarm-purple hover:bg-violet-600 active:bg-alarm-purple text-slate-100 rounded-sm text-xs font-bold font-mono tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              RUN INTERVENTION OPTIMIZER
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics Cards Row */}
      <div className="grid grid-cols-5 gap-4">
        
        {/* Facility Health Card */}
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 font-mono block mb-1">FACILITY HEALTH</span>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight">{metrics.facilityHealth}%</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-mono font-bold ${
              metrics.facilityHealth > 75 ? 'bg-alarm-green/10 text-alarm-green' : 'bg-alarm-red/10 text-alarm-red'
            }`}>
              {metrics.facilityHealth > 75 ? 'NOMINAL' : 'DEGRADED'}
            </span>
          </div>
        </div>

        {/* Cascade Risk Card */}
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 font-mono block mb-1">CASCADE RISK</span>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight">{metrics.cascadeRisk}%</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-mono font-bold ${
              metrics.cascadeRisk > 40 ? 'bg-alarm-red/10 text-alarm-red animate-pulse' : 'bg-alarm-green/10 text-alarm-green'
            }`}>
              {metrics.cascadeRisk > 40 ? 'CRITICAL' : 'SECURE'}
            </span>
          </div>
        </div>

        {/* Production At Risk Card */}
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 font-mono block mb-1">PRODUCTION LOSS AT RISK</span>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight">₹{round(metrics.productionAtRisk / 100000, 1)}L</span>
            <span className="text-[10px] font-mono text-slate-500">SIMULATED</span>
          </div>
        </div>

        {/* Critical Assets Card */}
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 font-mono block mb-1">CRITICAL ASSETS</span>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight">{metrics.criticalAssets}</span>
            <span className="text-[10px] font-mono text-slate-400">WARNING/CRIT</span>
          </div>
        </div>

        {/* Resilience Score Card */}
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 font-mono block mb-1">RESILIENCE SCORE</span>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight">{metrics.resilienceScore}/100</span>
            <span className="text-[10px] font-mono text-slate-400">STRUCTURAL</span>
          </div>
        </div>
        
      </div>

      {/* Main Dashboard Workspace split */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active status, Recommended Actions, Before/After Comparisons */}
        <div className="col-span-2 flex flex-col gap-6">
          
          {/* Active Cascade Alert and Action Panel */}
          {isM17Failed && (
            <div className="border border-alarm-purple bg-violet-950/10 p-5 rounded-sm flex flex-col gap-4 shadow-[0_0_15px_rgba(139,92,246,0.05)]">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-alarm-purple/10 rounded-sm text-alarm-purple shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-100 tracking-wider">⭐ ARGUS RECOMMENDATION AVAILABLE</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    A severe disruption at machine <strong className="text-slate-200">M17 (Line 3 CNC)</strong> threatens downstream assembly lines. ARGUS has simulated possible future trajectories and optimized the optimal containment path.
                  </p>
                </div>
              </div>

              {/* Recommended Steps Panel */}
              <div className="bg-industrial-900/60 border border-industrial-850 p-4 rounded-sm flex flex-col gap-3">
                <div className="text-[10px] font-bold font-mono text-alarm-purple uppercase tracking-widest border-b border-industrial-800 pb-2">
                  RECOMMENDED INTERVENTION STRATEGY
                </div>
                
                <ol className="flex flex-col gap-2.5 text-xs">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-industrial-800 flex items-center justify-center font-mono font-bold text-[10px] text-slate-300">1</span>
                    <div>
                      <span className="font-semibold text-slate-200 block">Reduce load on M19 by 20%</span>
                      <span className="text-[10px] text-slate-500">Prevents secondary wear-induced thermal failure on adjacent laser cutter unit.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-industrial-800 flex items-center justify-center font-mono font-bold text-[10px] text-slate-300">2</span>
                    <div>
                      <span className="font-semibold text-slate-200 block">Shift Batch #482 from Line 3 to Line 2</span>
                      <span className="text-[10px] text-slate-500">Reroutes production flow of high-value parts, avoiding penalty windows.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-industrial-800 flex items-center justify-center font-mono font-bold text-[10px] text-slate-300">3</span>
                    <div>
                      <span className="font-semibold text-slate-200 block">Prioritize M17 Emergency Overhaul</span>
                      <span className="text-[10px] text-slate-500">Deploy maintenance crew immediately to address root bearing failures.</span>
                    </div>
                  </li>
                </ol>

                <div className="grid grid-cols-3 gap-2 border-t border-industrial-800 pt-3 mt-1 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Cascade Risk After</span>
                    <span className="text-sm font-bold text-alarm-green">84% → 18%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Production Preserved</span>
                    <span className="text-sm font-bold text-slate-200">91%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Estimated Loss Saved</span>
                    <span className="text-sm font-bold text-alarm-green">₹11.7 Lakh</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                {!isOptimized ? (
                  <button
                    onClick={onApplyRecommended}
                    className="px-4 py-2.5 bg-alarm-green hover:bg-emerald-600 active:bg-alarm-green text-slate-900 rounded-sm text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[3px]" />
                    APPLY CONTAINMENT STRATEGY
                  </button>
                ) : (
                  <span className="text-xs font-mono font-semibold text-alarm-green flex items-center gap-1.5 py-2 px-3 border border-alarm-green/30 bg-emerald-950/20 rounded-sm">
                    ● STRATEGY APPLIED — CASCADE CONTAINED
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Core Differentiator: Before vs After Containment flowchart */}
          <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider mb-4 border-b border-industrial-800 pb-2">
              CASCADE DECISION CONTROL PROCESS
            </h3>
            
            <div className="grid grid-cols-2 gap-6 relative">
              
              {/* Left Column: Without ARGUS (Unmitigated) */}
              <div className="flex flex-col gap-2 text-xs border-r border-industrial-800 pr-6">
                <div className="text-[9px] font-bold font-mono text-alarm-red uppercase tracking-widest block mb-2">
                  WITHOUT ARGUS (UNMITIGATED CATASTROPHIC FAILURE)
                </div>
                
                <div className="bg-slate-950/60 p-2.5 border border-industrial-800 rounded-sm">
                  <span className="font-semibold text-slate-200">M17 CNC failure</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Machine loses bearing lubrication, overheating under heavy load.</p>
                </div>
                <div className="flex justify-center text-slate-600"><ArrowRight className="w-3.5 h-3.5 rotate-90" /></div>
                
                <div className="bg-slate-950/60 p-2.5 border border-industrial-800 rounded-sm">
                  <span className="font-semibold text-slate-200">Line 3 Degradation</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Precision Line 3 throughput drops to 0%, starving adjacent assemblies.</p>
                </div>
                <div className="flex justify-center text-slate-600"><ArrowRight className="w-3.5 h-3.5 rotate-90" /></div>

                <div className="bg-slate-950/60 p-2.5 border border-industrial-800 rounded-sm">
                  <span className="font-semibold text-slate-200">M19 Thermal Overload</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Adjacent Laser Cutter pulls excessive power and ambient heat rises.</p>
                </div>
                <div className="flex justify-center text-slate-600"><ArrowRight className="w-3.5 h-3.5 rotate-90" /></div>

                <div className="bg-slate-950/60 p-2.5 border border-alarm-red/20 bg-red-950/5 rounded-sm">
                  <span className="font-semibold text-alarm-red">Batch Delay & STOCKOUT</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Priority Batch #482 delayed, inventory drops below buffer. Order lost.</p>
                </div>
              </div>

              {/* Right Column: With ARGUS (Contained) */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="text-[9px] font-bold font-mono text-alarm-green uppercase tracking-widest block mb-2">
                  WITH ARGUS (CONTAINED OPTIMIZED RESILIENCE)
                </div>
                
                <div className="bg-slate-950/60 p-2.5 border border-industrial-800 rounded-sm">
                  <span className="font-semibold text-slate-200">Abnormal telemetry detected</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">M17 bearing heat trend prompts failure likelihood of 92%.</p>
                </div>
                <div className="flex justify-center text-slate-600"><ArrowRight className="w-3.5 h-3.5 rotate-90" /></div>

                <div className="bg-slate-950/60 p-2.5 border border-industrial-800 rounded-sm">
                  <span className="font-semibold text-slate-200">M19 Load Reduced by 20%</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Slowing M19 preserves its bearings and limits thermal emission in Zone 3.</p>
                </div>
                <div className="flex justify-center text-slate-600"><ArrowRight className="w-3.5 h-3.5 rotate-90" /></div>

                <div className="bg-slate-950/60 p-2.5 border border-industrial-800 rounded-sm">
                  <span className="font-semibold text-slate-200">Batch #482 shifted to Line 2</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Precision assembly resumes on Line 2 with 15 mins setup delay.</p>
                </div>
                <div className="flex justify-center text-slate-600"><ArrowRight className="w-3.5 h-3.5 rotate-90" /></div>

                <div className="bg-slate-950/60 p-2.5 border border-alarm-green/30 bg-emerald-950/5 rounded-sm">
                  <span className="font-semibold text-alarm-green">Root cause repaired & contained</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Crew repairs M17. Batch completed on time. ₹11.7 lakh penalty avoided.</p>
                </div>
              </div>

            </div>
          </div>
          
        </div>

        {/* Right 1 Col: Active alerts, Safety and Responsibility, Facility Info */}
        <div className="flex flex-col gap-6">
          
          {/* Active Alerts Panel */}
          <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm flex-1">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider mb-4 border-b border-industrial-800 pb-2">
              REAL-TIME SECURITY ALERTS
            </h3>
            
            <div className="flex flex-col gap-3">
              {isM17Failed ? (
                <div className="p-3 border border-alarm-red/30 bg-red-950/10 rounded-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-alarm-red shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="text-alarm-red block font-mono">CRITICAL FAILURE: M17</strong>
                    Machine capacity degraded to 0%. Line 3 bottleneck created. Production stopped.
                  </div>
                </div>
              ) : (
                <div className="p-3 border border-alarm-amber/30 bg-amber-950/10 rounded-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-alarm-amber shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="text-alarm-amber block font-mono">PREDICTIVE MAINTENANCE: M17</strong>
                    Failure probability at 92%. Vibration spikes (7.8mm/s) and bearing heat trend is high.
                  </div>
                </div>
              )}

              {isM17Failed && !isOptimized && (
                <div className="p-3 border border-alarm-red/30 bg-red-950/10 rounded-sm flex items-start gap-2.5 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-alarm-red shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong className="text-alarm-red block font-mono">SECONDARY STRESS: M19</strong>
                    Vibration spike warning on Laser Cutter. Temperature approaching 85°C.
                  </div>
                </div>
              )}
              
              <div className="p-3 border border-industrial-800 bg-slate-950/20 rounded-sm flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-alarm-green shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-slate-400">
                  <strong className="text-slate-300 block font-mono">COOLING LOOP: OK</strong>
                  Zones 1 and 2 operate within nominal limits. Zone 3 operates warm (75% load).
                </div>
              </div>

              <div className="p-3 border border-industrial-800 bg-slate-950/20 rounded-sm flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-alarm-green shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed text-slate-400">
                  <strong className="text-slate-300 block font-mono">UTILITY FEED: STABLE</strong>
                  Power grid load: 587kW (73.4% capacity). Compressed air pressure: 7.2 bar.
                </div>
              </div>
            </div>
          </div>

          {/* Safety constraints panel - human-in-the-loop */}
          <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider mb-3 flex items-center gap-1.5 border-b border-industrial-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-alarm-purple" />
              HUMAN-IN-THE-LOOP CONTROL
            </h3>
            
            <div className="text-[11px] leading-relaxed text-slate-400 flex flex-col gap-3">
              <p>
                ARGUS is configured as a <strong className="text-slate-200">Resilience Decision Support Engine</strong>. 
                Operational safety overrides prohibit the direct automation of physical actuators.
              </p>
              
              <blockquote className="border-l-2 border-industrial-700 pl-3 py-1 font-mono italic text-[10px] text-slate-500 bg-slate-950/30 rounded-r-sm">
                Human operator verification and explicit approval are strictly required prior to routing updates, PLC alterations, or scheduling injections.
              </blockquote>

              <div className="flex gap-2 text-[10px] font-mono font-bold mt-1.5">
                <span className="px-2 py-1 bg-industrial-850 border border-industrial-750 text-slate-400 rounded-sm">PLC AUTOMATION: OFF</span>
                <span className="px-2 py-1 bg-alarm-purple/10 border border-alarm-purple/35 text-alarm-purple rounded-sm">DECISION RATIO: 1:1</span>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>

      {/* Syslog Event Stream Terminal Panel */}
      <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm flex flex-col gap-3 font-mono">
        <h3 className="text-xs font-bold text-slate-300 tracking-wider border-b border-industrial-800 pb-2 flex justify-between items-center select-none">
          <span>🖥️ ARGUS SYSTEM SYSLOG FEED (ACTIVE STREAM)</span>
          <span className="text-[9px] text-slate-500">SYSTEM TIME: LIVE</span>
        </h3>
        
        <div className="bg-industrial-950 border border-industrial-850 p-4 rounded-sm flex flex-col gap-1.5 text-[10px] text-slate-400 overflow-y-auto max-h-[140px] leading-relaxed select-text select-none">
          <div><span className="text-slate-500 font-bold">[09:41:02]</span> <span className="text-alarm-amber">WARN</span>: Telemetry bearing anomaly detected on CNC Unit <strong className="text-slate-300">M17</strong>.</div>
          <div><span className="text-slate-500 font-bold">[09:41:05]</span> <span className="text-alarm-red font-bold">CRIT</span>: ML Failure Predictor recalculated probability for M17 to <strong className="text-alarm-red">92.4%</strong> (Vibration: 7.8mm/s, Temp: 87.2°C).</div>
          <div><span className="text-slate-500 font-bold">[09:41:08]</span> <span className="text-alarm-purple font-bold">INFO</span>: Topological Graph AI triggered. Warmed betweenness and PageRank centralities.</div>
          <div><span className="text-slate-500 font-bold">[09:41:11]</span> <span className="text-alarm-purple font-bold">INFO</span>: Downstream dependency path identified: <strong className="text-slate-300">M17 &rarr; Line 3 &rarr; M19 &rarr; Cooling Zone 3 &rarr; Batch #482</strong>.</div>
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
