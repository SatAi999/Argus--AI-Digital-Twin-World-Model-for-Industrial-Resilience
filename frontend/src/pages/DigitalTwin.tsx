import { useState, useEffect } from 'react';
import { Radio, Info, BarChart2, Zap } from 'lucide-react';
import GraphView from '../components/DigitalTwin/GraphView';
import { fetchSHAP, triggerFailure } from '../services/api';
import { GraphData, FacilityState, MachineAnalysisResult } from '../types';

interface DigitalTwinProps {
  graphData: GraphData | null;
  facilityState: FacilityState | null;
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;
  onRefresh: () => void;
  timeMachineTime: number;
  setTimeMachineTime: (time: number) => void;
  hasTrajectory: boolean;
}

export default function DigitalTwin({
  graphData,
  facilityState,
  selectedNodeId,
  setSelectedNodeId,
  onRefresh,
  timeMachineTime,
  setTimeMachineTime,
  hasTrajectory
}: DigitalTwinProps) {
  const [analysis, setAnalysis] = useState<MachineAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Load ML prediction & SHAP explanation when a machine node is clicked
  useEffect(() => {
    if (selectedNodeId && facilityState && facilityState.machines[selectedNodeId]) {
      setLoadingAnalysis(true);
      fetchSHAP(selectedNodeId)
        .then(data => {
          setAnalysis(data);
        })
        .catch(err => {
          console.error(err);
          setAnalysis(null);
        })
        .finally(() => {
          setLoadingAnalysis(false);
        });
    } else {
      setAnalysis(null);
    }
  }, [selectedNodeId, facilityState]);

  const handleInjectFailure = async () => {
    if (!selectedNodeId) return;
    try {
      await triggerFailure(selectedNodeId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedNodeData: any = selectedNodeId && facilityState ? (
    facilityState.machines[selectedNodeId] ||
    facilityState.lines[selectedNodeId] ||
    facilityState.utilities.cooling_zones[selectedNodeId] ||
    (selectedNodeId === 'Power Grid' ? facilityState.utilities.power_grid : null) ||
    (selectedNodeId === 'Compressed Air' ? facilityState.utilities.compressed_air : null) ||
    facilityState.batches[selectedNodeId] ||
    (selectedNodeId === 'Inventory' ? facilityState.inventory : null)
  ) : null;

  return (
    <div className="flex flex-col gap-6 h-full min-h-[500px] animate-fadeIn">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100 uppercase">FACILITY DIGITAL TWIN</h2>
        <p className="text-xs text-slate-500 font-mono mt-0.5">Explore real-time state vectors and trace causal dependencies.</p>
      </div>

      <div className="grid grid-cols-4 gap-6 items-stretch">
        
        {/* Left 3 Cols: Interactive React Flow Network Graph (3 Cols) */}
        <div className="col-span-3 bg-industrial-900 border border-industrial-800/80 p-2 rounded-lg relative flex flex-col min-h-[480px] shadow-lg overflow-hidden">
          <div className="radar-scan-line" />
          <div className="absolute top-4 left-4 z-10 bg-industrial-950/80 border border-industrial-800/60 p-2.5 rounded-md flex items-center gap-2 text-xs font-mono select-none backdrop-blur-sm shadow-md">
            <Radio className="w-4 h-4 text-alarm-green animate-pulse" />
            <span className="font-bold text-slate-200">ARGUS PLANT ALPHA NETWORK MAP</span>
          </div>

          {graphData && (
            <GraphView
              graphData={graphData}
              facilityState={facilityState}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          )}
        </div>

        {/* Right 1 Col: Detailed Telemetry and SHAP explanations (1 Col) */}
        <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg flex flex-col gap-4 overflow-y-auto max-h-[500px] shadow-md">
          <h3 className="text-xs font-bold font-mono text-slate-350 tracking-wider border-b border-industrial-800 pb-2">
            INSPECTOR UTILITY
          </h3>

          {/* Node Selected Details */}
          {selectedNodeId && selectedNodeData && (
            <div className="flex flex-col gap-4">
              
              {/* Node Title Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 font-mono">{selectedNodeId}</h4>
                  <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                    {selectedNodeData.type || 'System Link'}
                  </span>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedNodeData.status === 'Healthy' || selectedNodeData.status === 'Normal' || selectedNodeData.status === 'Operational'
                    ? 'bg-alarm-green shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                    : selectedNodeData.status === 'Warning' || selectedNodeData.status === 'Stressed' || selectedNodeData.status === 'Degraded'
                    ? 'bg-alarm-amber shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse'
                    : 'bg-alarm-red shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse'
                }`} />
              </div>

              {/* Node Properties details list */}
              <div className="bg-industrial-950/60 p-3.5 border border-industrial-850 rounded-md flex flex-col gap-2.5 font-mono text-[10px] text-slate-400">
                {/* Standard Machine Properties */}
                {'temperature' in selectedNodeData && (
                  <>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>OPERATING HEAT</span>
                      <span className="text-slate-200 font-semibold">{round(selectedNodeData.temperature, 1)}°C</span>
                    </div>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>VIBRATION FREQ</span>
                      <span className="text-slate-200 font-semibold">{round(selectedNodeData.vibration, 2)} mm/s</span>
                    </div>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>POWER DRAW</span>
                      <span className="text-slate-200 font-semibold">{selectedNodeData.powerConsumption} kW</span>
                    </div>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>ACTIVE LOAD</span>
                      <span className="text-slate-200 font-semibold">{selectedNodeData.utilization}%</span>
                    </div>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>MAINTENANCE AGE</span>
                      <span className="text-slate-200 font-semibold">{round(selectedNodeData.maintenanceAge, 0)} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HEALTH SCORE</span>
                      <span className={`font-bold ${selectedNodeData.healthScore > 75 ? 'text-alarm-green' : selectedNodeData.healthScore > 40 ? 'text-alarm-amber' : 'text-alarm-red'}`}>
                        {round(selectedNodeData.healthScore, 0)}%
                      </span>
                    </div>
                  </>
                )}

                {/* Line properties */}
                {'capacity' in selectedNodeData && !('temperature' in selectedNodeData) && (
                  <>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>LINE CAPACITY</span>
                      <span className="text-slate-200 font-semibold">{selectedNodeData.capacity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CURRENT RUNNING LOAD</span>
                      <span className="text-slate-200 font-semibold">{selectedNodeData.currentLoad}%</span>
                    </div>
                  </>
                )}

                {/* Cooling zone properties */}
                {'load' in selectedNodeData && 'capacity' in selectedNodeData && (
                  <>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>THERMAL LOAD</span>
                      <span className="text-slate-200 font-semibold">{selectedNodeData.load} kW</span>
                    </div>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>COOLING CAPACITY</span>
                      <span className="text-slate-200 font-semibold">{selectedNodeData.capacity} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>COOLING UTILIZATION</span>
                      <span className="text-slate-200 font-semibold">{selectedNodeData.utilization}%</span>
                    </div>
                  </>
                )}

                {/* Batch properties */}
                {'progress' in selectedNodeData && (
                  <>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>BATCH PROGRESS</span>
                      <span className="text-slate-200 font-semibold">{round(selectedNodeData.progress, 0)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>PRODUCTION DELAY</span>
                      <span className="text-slate-200 font-semibold">{round(selectedNodeData.delay_minutes, 0)} mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CONTRACT PRIORITY</span>
                      <span className="text-slate-200 font-semibold">Priority {selectedNodeData.priority}</span>
                    </div>
                  </>
                )}

                {/* Inventory properties */}
                {'product_level' in selectedNodeData && (
                  <>
                    <div className="flex justify-between border-b border-industrial-900 pb-1.5">
                      <span>WAREHOUSE STOCK LEVEL</span>
                      <span className="text-slate-200 font-semibold">{round(selectedNodeData.product_level, 1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SAFETY BUFFER LEVEL</span>
                      <span className="text-slate-250 text-slate-400 font-semibold">{selectedNodeData.safety_buffer}%</span>
                    </div>
                  </>
                )}
              </div>

              {/* ML Explanation and SHAP values chart */}
              {'temperature' in selectedNodeData && (
                <div className="border border-industrial-800/80 bg-industrial-950/60 p-4 rounded-md flex flex-col gap-3">
                  <div className="text-[9px] font-bold font-mono text-alarm-purple uppercase tracking-widest flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5" />
                    ML SHAP RISK EXPLANATION
                  </div>
                  
                  {loadingAnalysis ? (
                    <div className="py-6 text-center text-[10px] text-slate-500 font-mono">CALCULATING SHAP TREE EXPLANATIONS...</div>
                  ) : analysis ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-baseline font-mono">
                        <span className="text-[9px] text-slate-550 uppercase">FAILURE LIKELIHOOD</span>
                        <span className={`text-sm font-bold ${analysis.failureProbability > 75 ? 'text-alarm-red' : analysis.failureProbability > 30 ? 'text-alarm-amber' : 'text-alarm-green'}`}>
                          {analysis.failureProbability}%
                        </span>
                      </div>

                      {/* SHAP attributions list */}
                      <div className="flex flex-col gap-2.5 font-mono text-[9px] text-slate-450 border-t border-industrial-850 pt-2.5">
                        <span className="text-[8px] text-slate-500 block mb-1">FEATURE ATTRIBUTION WEIGHTS</span>
                        {analysis.explanations.slice(0, 4).map((exp, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[9px]">
                              <span className="truncate max-w-[110px] text-slate-400">{exp.feature}</span>
                              <span className={exp.impact > 0 ? 'text-alarm-red' : 'text-alarm-green'}>
                                {exp.impact > 0 ? '+' : ''}{round(exp.impact, 2)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${exp.impact > 0 ? 'bg-alarm-red shadow-[0_0_6px_rgba(244,63,94,0.3)]' : 'bg-alarm-green'}`}
                                style={{ width: `${Math.min(100, exp.magnitude * 250)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[9px] text-slate-500 font-mono">No ML risk analysis returned.</div>
                  )}
                </div>
              )}

              {/* Inject Failure Manual Trigger */}
              {selectedNodeId && selectedNodeData.status !== 'Failed' && (
                <button
                  onClick={handleInjectFailure}
                  className="w-full py-2 bg-alarm-red/10 border border-alarm-red/45 hover:bg-alarm-red hover:text-slate-950 active:scale-95 text-alarm-red rounded-md text-[10px] font-bold font-mono tracking-widest flex items-center justify-center gap-1.5 transition-all mt-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  INJECT COMPONENT FAILURE
                </button>
              )}

            </div>
          )}

          {/* Prompt banner for un-selected node */}
          {!selectedNodeId && (
            <div className="bg-industrial-950/60 p-6 border border-industrial-800/80 rounded-md text-center flex flex-col items-center justify-center gap-2.5">
              <Info className="w-5 h-5 text-slate-500" />
              <h4 className="text-[10px] font-bold font-mono text-slate-400 uppercase">NO NODE INSPECTED</h4>
              <p className="text-[9px] text-slate-500 leading-relaxed font-mono">
                Click any asset node in the digital twin graph map to inspect active telemetry signals, run ML forecasts, and view SHAP attributions.
              </p>
            </div>
          )}

        </div>
        
      </div>

      {/* Digital Twin Time Machine Slider Footer Panel */}
      <div className="bg-gradient-to-b from-industrial-900 to-industrial-950 border border-industrial-800/80 p-5 rounded-lg flex flex-col gap-3 font-mono shadow-md">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-350 tracking-wider">⏱️ DIGITAL TWIN TIME MACHINE</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">
            {hasTrajectory ? (
              <>ACTIVE SCENARIO TIMELINE: <strong className="text-alarm-purple">T+{timeMachineTime} MIN</strong></>
            ) : (
              <>SYSTEM TIME: <strong className="text-alarm-green">LIVE (T+0 MIN)</strong></>
            )}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="180"
            step="5"
            value={timeMachineTime}
            onChange={e => setTimeMachineTime(parseInt(e.target.value))}
            disabled={!hasTrajectory}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-purple disabled:opacity-30 disabled:cursor-not-allowed"
          />
          <span className="text-xs font-bold text-slate-200 w-16 text-right">T+{timeMachineTime}m</span>
        </div>
        {!hasTrajectory && (
          <span className="text-[9px] text-slate-550 text-slate-500">Time machine scrubber unlocks automatically once a cascade simulation rollout is triggered.</span>
        )}
      </div>
      
    </div>
  );
}

function round(val: number, decimals = 1): number {
  if (val === undefined || isNaN(val)) return 0;
  const mult = Math.pow(10, decimals);
  return Math.round(val * mult) / mult;
}
