import React, { useState } from 'react';
import { Play, Activity } from 'lucide-react';
import { CascadeSimulationResult, MachineState } from '../types';

interface CascadeLabProps {
  machines: Record<string, MachineState>;
  onSimulate: (machineId: string, severity: number, duration: number) => Promise<CascadeSimulationResult | null>;
}

export default function CascadeLab({ machines, onSimulate }: CascadeLabProps) {
  const [selectedMachine, setSelectedMachine] = useState('M17');
  const [severity, setSeverity] = useState(1.0);
  const [duration, setDuration] = useState(144);
  const [horizon] = useState(180);
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<CascadeSimulationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await onSimulate(selectedMachine, severity, duration);
      if (res) {
        setSimResult(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100">CASCADE LAB</h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Stress-test and trace downstream cascading failure propagation pathways.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Left Col: Simulation parameters form */}
        <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm h-fit flex flex-col gap-4">
          <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2">
            SIMULATION PARAMETERS
          </h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Machine selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Target Failure Asset</label>
              <select
                value={selectedMachine}
                onChange={e => setSelectedMachine(e.target.value)}
                className="bg-industrial-950 border border-industrial-800 p-2.5 rounded-sm text-xs font-mono text-slate-100 focus:outline-none focus:border-alarm-purple"
              >
                {Object.keys(machines).map(m_id => (
                  <option key={m_id} value={m_id}>{m_id} ({machines[m_id].type})</option>
                ))}
              </select>
            </div>

            {/* Severity slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Failure Severity</label>
                <span className="text-[10px] font-mono text-alarm-purple font-semibold">{round(severity * 100, 0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={severity}
                onChange={e => setSeverity(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-purple"
              />
              <span className="text-[9px] text-slate-500">Degree of capacity degradation (1.0 is full shutdown).</span>
            </div>

            {/* Failure duration */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Failure Duration</label>
                <span className="text-[10px] font-mono text-alarm-purple font-semibold">{duration} min</span>
              </div>
              <input
                type="range"
                min="30"
                max="240"
                step="15"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-purple"
              />
              <span className="text-[9px] text-slate-500">Estimated repair/downtime threshold.</span>
            </div>

            {/* Simulation Horizon */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Simulation Horizon</label>
              <select
                className="bg-industrial-950 border border-industrial-800 p-2.5 rounded-sm text-xs font-mono text-slate-100 focus:outline-none focus:border-alarm-purple"
                defaultValue={horizon}
              >
                <option value={60}>60 Minutes</option>
                <option value={120}>120 Minutes</option>
                <option value={180}>180 Minutes (Default)</option>
                <option value={240}>240 Minutes</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-alarm-purple hover:bg-violet-650 active:bg-alarm-purple text-slate-100 rounded-sm text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(139,92,246,0.2)] hover:shadow-[0_0_16px_rgba(139,92,246,0.3)] disabled:opacity-50 transition-all mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-900 border-t-slate-400 rounded-full animate-spin" />
                  <span>SIMULATING...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>SIMULATE CASCADE</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Simulation results charts and timelines */}
        <div className="col-span-2 flex flex-col gap-6">
          
          {/* Results Summary metrics cards */}
          {simResult && (
            <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2">
                SIMULATION OUTPUT FORECAST
              </h3>
              
              <div className="grid grid-cols-4 gap-4 text-center font-mono">
                <div className="bg-industrial-950 p-3 border border-industrial-800 rounded-sm">
                  <span className="text-[9px] text-slate-500 block">CASCADE RISK</span>
                  <span className="text-lg font-bold text-alarm-red">{simResult.cascadeRisk}%</span>
                </div>
                <div className="bg-industrial-950 p-3 border border-industrial-800 rounded-sm">
                  <span className="text-[9px] text-slate-500 block">AFFECTED NODES</span>
                  <span className="text-lg font-bold text-slate-100">{simResult.affectedAssets}</span>
                </div>
                <div className="bg-industrial-950 p-3 border border-industrial-800 rounded-sm">
                  <span className="text-[9px] text-slate-500 block">PRODUCTION CAP</span>
                  <span className="text-lg font-bold text-alarm-red">-{simResult.productionLossPercent}%</span>
                </div>
                <div className="bg-industrial-950 p-3 border border-industrial-800 rounded-sm">
                  <span className="text-[9px] text-slate-500 block">EST. LOSS</span>
                  <span className="text-lg font-bold text-alarm-red">₹{round(simResult.estimatedFinancialLoss / 100000, 1)}L</span>
                </div>
              </div>

              {/* Cascade Timeline progression */}
              <div className="flex flex-col gap-3 mt-2">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                  FAILURE PROPAGATION TIMELINE
                </span>
                
                <div className="relative border-l border-industrial-800 pl-4 ml-2 flex flex-col gap-4 py-2">
                  {simResult.timeline.map((event, idx) => {
                    let indicatorBg = 'bg-alarm-amber';
                    let textClass = 'text-slate-300';
                    
                    if (event.status === 'Failed' || event.status === 'Critical') {
                      indicatorBg = 'bg-alarm-red';
                      textClass = 'text-slate-200 font-semibold';
                    }
                    
                    return (
                      <div key={idx} className="relative flex gap-4 text-xs group">
                        {/* Bullet point indicator */}
                        <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${indicatorBg} border border-slate-950 shadow-[0_0_8px_rgba(239,68,68,0.3)]`} />
                        
                        {/* Time stamp */}
                        <div className="w-16 shrink-0 font-mono text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                          T+{round(event.time, 0)} min
                        </div>
                        
                        {/* Asset name */}
                        <div className="w-28 shrink-0 font-semibold text-slate-400 font-mono">
                          {event.asset}
                        </div>
                        
                        {/* Event text details */}
                        <div className={`flex-1 ${textClass}`}>
                          {event.event}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Prompt banner for un-simulated state */}
          {!simResult && (
            <div className="bg-industrial-900 border border-industrial-800 p-8 rounded-sm text-center flex flex-col items-center justify-center gap-3 min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-industrial-950 border border-industrial-800 flex items-center justify-center text-slate-500 mb-2">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold font-mono text-slate-300 tracking-wider">AWAITING SIMULATION TRIGGER</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Select a target machine and click "Simulate Cascade" to observe failure propagation, bottleneck stresses, and economic loss trajectories.
              </p>
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
