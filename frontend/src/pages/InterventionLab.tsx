import { useState, useEffect } from 'react';
import { Zap, Star, ThumbsUp } from 'lucide-react';
import { OptimizationResult } from '../types';

interface InterventionLabProps {
  onOptimize: (weights: any) => Promise<OptimizationResult | null>;
  onApplyStrategy: (actions: any[]) => void;
  isM17Failed: boolean;
  isOptimized: boolean;
}

export default function InterventionLab({
  onOptimize,
  onApplyStrategy,
  isM17Failed,
  isOptimized
}: InterventionLabProps) {
  const [weights, setWeights] = useState({
    risk_weight: 0.35,
    production_weight: 0.25,
    cost_weight: 0.15,
    recovery_weight: 0.15,
    energy_weight: 0.10
  });

  const [optResult, setOptResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    try {
      const res = await onOptimize(weights);
      if (res) {
        setOptResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run search once when page opens if M17 is failed
  useEffect(() => {
    if (isM17Failed) {
      runSearch();
    }
  }, [isM17Failed]);

  const handleSliderChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100">INTERVENTION OPTIMIZER</h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Optimize mitigation strategies using multi-objective search and safety boundary constraints.</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        
        {/* Left Col: Weight Sliders (1 Col) */}
        <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm h-fit flex flex-col gap-4">
          <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2 flex items-center gap-1.5">
            OPTIMIZATION WEIGHTS
          </h3>

          <div className="flex flex-col gap-4 text-[10px] font-mono">
            {/* Risk Weight */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>CASCADE RISK LIMIT</span>
                <span className="font-bold text-alarm-purple">{round(weights.risk_weight * 100, 0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={weights.risk_weight}
                onChange={e => handleSliderChange('risk_weight', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-purple"
              />
            </div>

            {/* Production Weight */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>PRODUCTION PRESERVATION</span>
                <span className="font-bold text-alarm-purple">{round(weights.production_weight * 100, 0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={weights.production_weight}
                onChange={e => handleSliderChange('production_weight', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-purple"
              />
            </div>

            {/* Cost Weight */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>COST MINIMIZATION</span>
                <span className="font-bold text-alarm-purple">{round(weights.cost_weight * 100, 0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={weights.cost_weight}
                onChange={e => handleSliderChange('cost_weight', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-purple"
              />
            </div>

            {/* Recovery Weight */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>RECOVERY SPEED</span>
                <span className="font-bold text-alarm-purple">{round(weights.recovery_weight * 100, 0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={weights.recovery_weight}
                onChange={e => handleSliderChange('recovery_weight', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-purple"
              />
            </div>

            {/* Energy Weight */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>ENERGY PENALTY LIMIT</span>
                <span className="font-bold text-alarm-purple">{round(weights.energy_weight * 100, 0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={weights.energy_weight}
                onChange={e => handleSliderChange('energy_weight', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-purple"
              />
            </div>

            <button
              onClick={runSearch}
              disabled={loading || !isM17Failed}
              className="w-full py-2.5 bg-alarm-purple hover:bg-violet-600 active:bg-alarm-purple text-slate-100 rounded-sm text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(139,92,246,0.2)] disabled:opacity-50 transition-all mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-900 border-t-slate-400 rounded-full animate-spin" />
                  <span>RUNNING SEARCH...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>RUN OPTIMIZER</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 3 Cols: Recommended action and strategies table (3 Cols) */}
        <div className="col-span-3 flex flex-col gap-6">
          
          {/* Main Recommended Action Highlight */}
          {optResult && (
            <div className="bg-industrial-900 border border-alarm-green/30 bg-emerald-950/5 p-5 rounded-sm flex flex-col gap-4 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-alarm-green/10 rounded-sm text-alarm-green">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 tracking-wider">⭐ ARGUS OPTIMAL STRATEGY RECOMMENDED</h3>
                    <p className="text-xs text-slate-400 font-mono">{optResult.recommendedStrategy}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 font-mono">OBJECTIVE FITNESS</span>
                  <span className="text-xl font-bold font-mono text-alarm-green">98.4 / 100</span>
                </div>
              </div>

              {/* Explanations - Why this wins */}
              <div className="bg-slate-950/60 p-4 border border-industrial-800 rounded-sm">
                <h4 className="text-[9px] font-bold font-mono text-alarm-green uppercase tracking-widest mb-2">WHY THIS WINS (EXPLAINABLE CAUSAL REASONING)</h4>
                <ul className="list-disc pl-4 flex flex-col gap-1.5 text-xs text-slate-300">
                  {optResult.reasoning.map((reason, index) => (
                    <li key={index} className="leading-relaxed">{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Apply Controls */}
              <div className="flex justify-between items-center border-t border-industrial-800 pt-4 mt-1">
                <div className="text-[10px] font-mono text-slate-400">
                  CONFIDENCE: <strong className="text-slate-200">{optResult.confidence}%</strong> (Based on 180m rollout simulations)
                </div>
                <div className="flex gap-3">
                  {!isOptimized ? (
                    <button
                      onClick={() => onApplyStrategy(optResult.recommendedActions)}
                      className="px-4 py-2 bg-alarm-green hover:bg-emerald-600 active:bg-alarm-green text-slate-900 rounded-sm text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      APPROVE INTERVENTIONS
                    </button>
                  ) : (
                    <span className="text-xs font-mono font-semibold text-alarm-green py-2 px-3 border border-alarm-green/30 bg-emerald-950/20 rounded-sm flex items-center gap-1.5">
                      ● STRATEGY APPLIED — OPERATIONAL STATE CONFINED
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prompt banner for un-optimized state */}
          {!optResult && (
            <div className="bg-industrial-900 border border-industrial-800 p-8 rounded-sm text-center flex flex-col items-center justify-center gap-3 min-h-[160px]">
              <h3 className="text-xs font-bold font-mono text-slate-400 tracking-wider">AWAITING FACILITY STRESS INPUT</h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                When a failed machine condition exists, click "Run Optimizer" to explore and evaluate 24 candidate intervention strategies over the state rollout.
              </p>
            </div>
          )}

          {/* All strategies results table */}
          {optResult && (
            <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm">
              <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider mb-4 border-b border-industrial-800 pb-2">
                ALL COMPETING MITIGATION PATHS
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-industrial-800 text-[10px] text-slate-400 font-bold uppercase">
                      <th className="py-2.5">STRATEGY</th>
                      <th className="py-2.5 text-center">COST</th>
                      <th className="py-2.5 text-center">RISK AFTER</th>
                      <th className="py-2.5 text-center">PROD CAP</th>
                      <th className="py-2.5 text-center">RECOVERY</th>
                      <th className="py-2.5 text-center">SAFETY</th>
                      <th className="py-2.5 text-right">FITNESS SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-industrial-850/50">
                    {optResult.allStrategies.map((strat, idx) => {
                      const isOptimal = strat.strategy === optResult.recommendedStrategy;
                      return (
                        <tr key={idx} className={`hover:bg-industrial-800/35 transition-colors ${
                          isOptimal ? 'bg-alarm-purple/5 text-slate-200 border-l-2 border-alarm-purple' : 'text-slate-300'
                        }`}>
                          <td className="py-3 font-semibold pr-3 max-w-[200px] truncate">
                            {isOptimal && <span className="text-alarm-green mr-1 font-bold">★</span>}
                            {strat.strategy}
                          </td>
                          <td className="py-3 text-center">₹{round(strat.estimatedInterventionCost / 1000, 0)}k</td>
                          <td className="py-3 text-center font-bold">{strat.cascadeRiskAfter}%</td>
                          <td className="py-3 text-center text-alarm-green">{strat.productionPreserved}%</td>
                          <td className="py-3 text-center">{strat.recoveryTime}m</td>
                          <td className="py-3 text-center">
                            <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${
                              strat.safetyStatus === 'Safe' ? 'bg-alarm-green/10 text-alarm-green' : 'bg-alarm-red/10 text-alarm-red'
                            }`}>
                              {strat.safetyStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-slate-100">{strat.objectiveScore}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
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
