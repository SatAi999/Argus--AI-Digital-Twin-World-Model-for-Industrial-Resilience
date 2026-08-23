import { useState, useEffect } from 'react';
import { Check, DollarSign } from 'lucide-react';
import { fetchRisks } from '../services/api';

interface VulnerableAsset {
  id: string;
  name: string;
  line: string;
  status: string;
  failureProbability: number;
  systemicCriticality: number;
  cascadePotential: number;
  priorityScore: number;
}

interface ResilienceProps {
  currentResilience: number;
}

export default function Resilience({ currentResilience }: ResilienceProps) {
  const [risks, setRisks] = useState<VulnerableAsset[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Resilience Investment Planner Options
  const investmentOptions = [
    { id: 'cnc_backup', name: 'Duplicate CNC Precision Unit M17 (Backup)', cost: 50, riskReduction: 35, resilienceGain: 12, payback: '14 months' },
    { id: 'cooling_expansion', name: 'Cooling Zone 3 Expansion Loop', cost: 25, riskReduction: 20, resilienceGain: 8, payback: '8 months' },
    { id: 'line2_redundancy', name: 'Line 2 Parallel Redundancy Pipeline', cost: 40, riskReduction: 28, resilienceGain: 10, payback: '11 months' },
    { id: 'inv_expansion', name: 'Expanded Inventory Warehouse Buffer', cost: 15, riskReduction: 15, resilienceGain: 5, payback: '6 months' },
    { id: 'smart_sensors', name: 'Predictive IoT Smart Sensor Network', cost: 10, riskReduction: 12, resilienceGain: 4, payback: '4 months' }
  ];

  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const budgetLimit = 50; // ₹50 Lakhs limit

  useEffect(() => {
    async function loadRisks() {
      try {
        const data = await fetchRisks();
        setRisks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRisks();
  }, []);

  const totalCost = selectedInvestments.reduce((sum, invId) => {
    const opt = investmentOptions.find(o => o.id === invId);
    return sum + (opt ? opt.cost : 0);
  }, 0);

  const totalResilienceGain = selectedInvestments.reduce((sum, invId) => {
    const opt = investmentOptions.find(o => o.id === invId);
    return sum + (opt ? opt.resilienceGain : 0);
  }, 0);

  const totalRiskReduction = selectedInvestments.reduce((sum, invId) => {
    const opt = investmentOptions.find(o => o.id === invId);
    return sum + (opt ? opt.riskReduction : 0);
  }, 0);

  const handleSelectInvestment = (id: string, cost: number) => {
    setSelectedInvestments(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (totalCost + cost > budgetLimit) {
          alert("Budget limit exceeded! Total investment cannot exceed ₹50 Lakhs.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100">PLANT RESILIENCE & VULNERABILITY</h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Audit plant fragility indexes, sort asset failure exposures, and design resilience investment portfolios.</p>
      </div>

      {/* Resilience Dials Grid */}
      <div className="grid grid-cols-4 gap-4 text-center font-mono">
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 block mb-1">REDUNDANCY SCORE</span>
          <span className="text-xl font-bold text-slate-200">65 / 100</span>
          <span className="text-[9px] text-slate-500 block mt-1">Single Point of Failures: 3</span>
        </div>
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 block mb-1">DEPENDENCY MATRIX</span>
          <span className="text-xl font-bold text-slate-200">42 / 100</span>
          <span className="text-[9px] text-slate-500 block mt-1">Highly concentrated flow links</span>
        </div>
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 block mb-1">RECOVERY RESPONSE</span>
          <span className="text-xl font-bold text-alarm-green">85 / 100</span>
          <span className="text-[9px] text-slate-500 block mt-1">Average crew repair time: 110m</span>
        </div>
        <div className="bg-industrial-900 border border-industrial-800 p-4 rounded-sm">
          <span className="text-[10px] text-slate-400 block mb-1">STRUCTURAL EXP.</span>
          <span className="text-xl font-bold text-alarm-amber">58 / 100</span>
          <span className="text-[9px] text-slate-500 block mt-1">Weakest link dependency: M17</span>
        </div>
      </div>

      {/* Vulnerability Map Table */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Vulnerability Map (2 Cols) */}
        <div className="col-span-2 bg-industrial-900 border border-industrial-800 p-5 rounded-sm">
          <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider mb-4 border-b border-industrial-800 pb-2">
            VULNERABILITY MAP (WHERE IS THE FACTORY FRAGILE?)
          </h3>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">LOADING AUDIT DATA...</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-industrial-800 text-[10px] text-slate-400 font-bold uppercase">
                    <th className="py-2.5">ASSET ID</th>
                    <th className="py-2.5">LINE</th>
                    <th className="py-2.5 text-center">FAIL PROB</th>
                    <th className="py-2.5 text-center">SYS CRIT</th>
                    <th className="py-2.5 text-center">CASCADE POT</th>
                    <th className="py-2.5 text-right">PRIORITY SCORE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-industrial-850/50">
                  {risks.map((risk, idx) => {
                    const isM17 = risk.id === 'M17';
                    return (
                      <tr key={idx} className={`hover:bg-industrial-800/30 transition-colors ${
                        isM17 ? 'bg-red-950/10 text-slate-200' : 'text-slate-300'
                      }`}>
                        <td className="py-3 font-semibold flex items-center gap-1.5">
                          {isM17 && <span className="w-1.5 h-1.5 rounded-full bg-alarm-red animate-pulse" />}
                          {risk.name}
                        </td>
                        <td className="py-3 text-slate-400">{risk.line}</td>
                        <td className="py-3 text-center">{risk.failureProbability}%</td>
                        <td className="py-3 text-center">{risk.systemicCriticality}</td>
                        <td className="py-3 text-center">{risk.cascadePotential}</td>
                        <td className="py-3 text-right font-bold text-slate-100">{risk.priorityScore}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Resilience Investment Planner (1 Col) */}
        <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm h-fit flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-alarm-purple" />
              RESILIENCE INVESTMENT PLANNER
            </h3>
            <span className="text-[9px] text-slate-500 font-mono mt-1 block">ALLOCATE ₹50 LAKHS BUDGET TO OPTIMIZE REDUNDANCIES</span>
          </div>

          {/* Investment Selection Items */}
          <div className="flex flex-col gap-3">
            {investmentOptions.map((opt) => {
              const selected = selectedInvestments.includes(opt.id);
              return (
                <div
                  onClick={() => handleSelectInvestment(opt.id, opt.cost)}
                  key={opt.id}
                  className={`p-3 border rounded-sm cursor-pointer select-none transition-all flex justify-between items-start ${
                    selected
                      ? 'border-alarm-purple bg-violet-950/10'
                      : 'border-industrial-800 hover:border-industrial-700 bg-industrial-950/50'
                  }`}
                >
                  <div className="flex gap-2 items-start flex-1 min-w-0 pr-2">
                    <span className={`w-4 h-4 rounded-sm border shrink-0 mt-0.5 flex items-center justify-center ${
                      selected ? 'border-alarm-purple bg-alarm-purple text-slate-900' : 'border-industrial-700'
                    }`}>
                      {selected && <Check className="w-3 h-3 stroke-[3px]" />}
                    </span>
                    <div className="text-[10px] leading-relaxed">
                      <span className="font-semibold text-slate-200 block truncate">{opt.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">Resilience Gain: +{opt.resilienceGain} | Payback: {opt.payback}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-300 whitespace-nowrap shrink-0">₹{opt.cost}L</span>
                </div>
              );
            })}
          </div>

          {/* Calculation summary output */}
          <div className="bg-industrial-950 p-4 border border-industrial-850 rounded-sm flex flex-col gap-2 font-mono text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>BUDGET ALLOCATED</span>
              <span className="font-bold text-slate-200">₹{totalCost}L / ₹50L</span>
            </div>
            <div className="flex justify-between">
              <span>EST. RISK REDUCTION</span>
              <span className="font-bold text-alarm-green">-{totalRiskReduction}%</span>
            </div>
            <div className="flex justify-between">
              <span>SIMULATED RESILIENCE GAIN</span>
              <span className="font-bold text-alarm-purple">+{totalResilienceGain} pts</span>
            </div>
            <div className="flex justify-between border-t border-industrial-800 pt-2 mt-1">
              <span>SIMULATED RESILIENCE FORECAST</span>
              <span className="font-bold text-alarm-green">{currentResilience + totalResilienceGain} / 100</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
