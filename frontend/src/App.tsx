import { useState, useEffect } from 'react';
import {
  fetchFacility, fetchGraph, fetchMetrics,
  simulateFailure, optimizeInterventions, applyStrategy,
  resetFacility, askArgus
} from './services/api';
import { FacilityState, GraphData, TimelineEvent, OptimizationResult } from './types';
import Layout from './components/Layout';
import CommandCenter from './pages/CommandCenter';
import DigitalTwin from './pages/DigitalTwin';
import LiveTelemetry from './pages/LiveTelemetry';
import CascadeLab from './pages/CascadeLab';
import WorldModel from './pages/WorldModel';
import InterventionLab from './pages/InterventionLab';
import Resilience from './pages/Resilience';
import IncidentReplay from './pages/IncidentReplay';
import ModelIntelligence from './pages/ModelIntelligence';

// Icons for the floating chat drawer
import { MessageSquare, Send, X, Terminal } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('command-center');
  
  // Plant live state variables
  const [facilityState, setFacilityState] = useState<FacilityState | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isM17Failed, setIsM17Failed] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  
  // Dashboard KPI metrics
  const [kpiMetrics, setKpiMetrics] = useState({
    facilityHealth: 91.0,
    cascadeRisk: 18.0,
    productionAtRisk: 0.0,
    criticalAssets: 1,
    resilienceScore: 78.0
  });

  // Simulated cascade timeline & state trajectory
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [trajectoryStates, setTrajectoryStates] = useState<FacilityState[] | null>(null);
  const [timeMachineTime, setTimeMachineTime] = useState(0);

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState<Array<{ sender: 'user' | 'argus'; text: string }>>([
    { sender: 'argus', text: 'ARGUS Command Line active. Ask me about failure impacts, fragilities, or cost-optimal interventions.' }
  ]);

  // Load initial factory data on mount
  const loadData = async () => {
    try {
      const state = await fetchFacility();
      setFacilityState(state);
      
      const graph = await fetchGraph();
      setGraphData(graph);
      
      const metrics = await fetchMetrics();
      setKpiMetrics(metrics);
      
      // Sync failed flag from M17 status
      if (state.machines["M17"]) {
        setIsM17Failed(state.machines["M17"].status === 'Failed');
      }
      
      // If optimized state, sync
      if (state.financials.intervention_cost > 0) {
        setIsOptimized(true);
      }
    } catch (err) {
      console.error("Error loading factory data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Time Machine Scrubber sync
  useEffect(() => {
    if (trajectoryStates && trajectoryStates.length > 0) {
      const stepIdx = Math.min(trajectoryStates.length - 1, Math.floor(timeMachineTime / 5));
      const targetState = trajectoryStates[stepIdx];
      if (targetState) {
        setFacilityState(targetState);
        // Sync failed flag
        if (targetState.machines["M17"]) {
          setIsM17Failed(targetState.machines["M17"].status === 'Failed');
        }
      }
    }
  }, [timeMachineTime, trajectoryStates]);

  // Action: Trigger M17 CNC Failure
  const handleSimulateM17 = async () => {
    try {
      const res = await simulateFailure("M17");
      if (res) {
        setTimeline(res.timeline);
        if (res.trajectory) {
          setTrajectoryStates(res.trajectory);
        }
        setTimeMachineTime(0);
        
        // Trigger actual state modification in backend
        await fetch('http://localhost:8000/api/trigger-failure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ machine_id: 'M17' })
        });
        
        setIsM17Failed(true);
        setIsOptimized(false);
        await loadData();
        
        // Navigate to Cascade Lab to observe propagation timeline
        setActivePage('cascade-lab');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Run optimizer
  const handleOptimize = async (weights = null): Promise<OptimizationResult | null> => {
    try {
      const payload = weights || {
        risk_weight: 0.35,
        production_weight: 0.25,
        cost_weight: 0.15,
        recovery_weight: 0.15,
        energy_weight: 0.10
      };
      const res = await optimizeInterventions(payload);
      return res;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Action: Apply recommended strategy
  const handleApplyRecommended = async () => {
    try {
      const opt = await handleOptimize();
      if (opt) {
        await applyStrategy(opt.recommendedActions);
        setIsOptimized(true);
        setTrajectoryStates(null);
        setTimeMachineTime(0);
        await loadData();
        
        // Navigate to World Model to verify containment
        setActivePage('world-model');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Apply custom strategy from Intervention Lab
  const handleApplyCustomStrategy = async (actions: any[]) => {
    try {
      await applyStrategy(actions);
      setIsOptimized(true);
      setTrajectoryStates(null);
      setTimeMachineTime(0);
      await loadData();
      setActivePage('world-model');
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Reset entire facility state
  const handleReset = async () => {
    try {
      await resetFacility();
      setIsM17Failed(false);
      setIsOptimized(false);
      setSelectedNodeId(null);
      setTimeline([]);
      setTrajectoryStates(null);
      setTimeMachineTime(0);
      setChatLogs([
        { sender: 'argus', text: 'ARGUS Command Line active. Ask me about failure impacts, fragilities, or cost-optimal interventions.' }
      ]);
      await loadData();
      setActivePage('command-center');
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Cascade Lab trigger
  const handleCascadeSimulate = async (machineId: string, severity: number, duration: number) => {
    try {
      const res = await simulateFailure(machineId, severity, duration);
      if (res && res.trajectory) {
        setTrajectoryStates(res.trajectory);
        setTimeMachineTime(0);
      }
      return res;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Action: Proactive Telemetry Alert Redirect
  const handleTelemetryDegradationWarning = async () => {
    await handleSimulateM17();
    setActivePage('command-center');
    alert("🚨 Predictive threshold exceeded! ARGUS has automatically redirected you to the cockpit and initiated counterfactual cascade rollouts.");
  };

  // Action: Send Query to Natural Language Processor
  const handleSendChat = async (e: any) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userQuery = chatInput;
    setChatLogs(prev => [...prev, { sender: 'user', text: userQuery }]);
    setChatInput('');
    
    try {
      const res = await askArgus(userQuery);
      setChatLogs(prev => [...prev, { sender: 'argus', text: res.answer }]);
      
      // If NLP matches a simulation, update timeline & charts dynamically!
      if (res.intent === 'SIMULATE_FAILURE' && res.data) {
        setTimeline(res.data.timeline);
        if (res.data.trajectory) {
          setTrajectoryStates(res.data.trajectory);
          setTimeMachineTime(0);
        }
        setIsM17Failed(res.entities?.machine === 'M17');
        await loadData();
      }
    } catch (err) {
      console.error(err);
      setChatLogs(prev => [...prev, { sender: 'argus', text: 'NLP request timed out. Verify backend is running.' }]);
    }
  };

  // Render navigation pages
  const renderPage = () => {
    switch (activePage) {
      case 'command-center':
        return (
          <CommandCenter
            facilityState={facilityState}
            onSimulateM17={handleSimulateM17}
            onOptimize={() => setActivePage('interventions')}
            onApplyRecommended={handleApplyRecommended}
            isM17Failed={isM17Failed}
            isOptimized={isOptimized}
            metrics={kpiMetrics}
          />
        );
      case 'digital-twin':
        return (
          <DigitalTwin
            graphData={graphData}
            facilityState={facilityState}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            onRefresh={loadData}
            timeMachineTime={timeMachineTime}
            setTimeMachineTime={setTimeMachineTime}
            hasTrajectory={trajectoryStates !== null}
          />
        );
      case 'live-telemetry':
        return (
          <LiveTelemetry
            onTriggerWarning={handleTelemetryDegradationWarning}
          />
        );
      case 'cascade-lab':
        return (
          <CascadeLab
            machines={facilityState ? facilityState.machines : {}}
            onSimulate={handleCascadeSimulate}
          />
        );
      case 'world-model':
        return (
          <WorldModel
            facilityState={facilityState}
            isM17Failed={isM17Failed}
            isOptimized={isOptimized}
          />
        );
      case 'interventions':
        return (
          <InterventionLab
            onOptimize={handleOptimize}
            onApplyStrategy={handleApplyCustomStrategy}
            isM17Failed={isM17Failed}
            isOptimized={isOptimized}
          />
        );
      case 'resilience':
        return (
          <Resilience
            currentResilience={facilityState ? facilityState.resilience_score : 78.0}
          />
        );
      case 'replay':
        return (
          <IncidentReplay
            timeline={timeline.length > 0 ? timeline : [
              { time: 0, asset: 'M17', event: 'Failure injected', status: 'Failed' },
              { time: 4, asset: 'Line 3', event: 'Line capacity degraded to 30%', status: 'Warning' },
              { time: 11, asset: 'M19', event: 'Laser Cutter load spike 92% -> 112%', status: 'Warning' },
              { time: 17, asset: 'Cooling Zone 3', event: 'Cooling demand rises to 86%', status: 'Warning' },
              { time: 26, asset: 'Power Grid', event: 'Grid peak demand threshold crossed (84%)', status: 'Warning' },
              { time: 34, asset: 'Batch #482', event: 'Production delayed: Line 3 capacity down', status: 'Warning' },
              { time: 51, asset: 'Inventory', event: 'Inventory depletion warning below 30%', status: 'Warning' },
              { time: 144, asset: 'Order Fulfillment', event: 'Order delivery window missed. late penalty active.', status: 'Critical' }
            ]}
          />
        );
      case 'model-intelligence':
        return <ModelIntelligence />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      onReset={handleReset}
      resilienceScore={facilityState ? facilityState.resilience_score : 78.0}
    >
      {renderPage()}

      {/* Floating Collapsible Chatbot Drawer */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="p-4 bg-alarm-purple hover:bg-violet-600 active:bg-alarm-purple text-slate-100 rounded-full shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:scale-105 transition-all flex items-center justify-center border border-violet-500/30"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <div className="w-96 bg-industrial-900 border border-industrial-800 rounded-md shadow-[0_10px_35px_rgba(7,8,10,0.6)] flex flex-col h-[450px]">
            {/* Header */}
            <div className="bg-industrial-850 p-4 border-b border-industrial-800 flex justify-between items-center bg-slate-900/90 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-alarm-purple" />
                <span className="text-xs font-bold tracking-wider">ASK ARGUS COCKPIT</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Chat Messages Logs */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-mono text-[11px] leading-relaxed">
              {chatLogs.map((log, idx) => (
                <div key={idx} className={`flex flex-col max-w-[85%] ${
                  log.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}>
                  <span className="text-[8px] text-slate-500 uppercase mb-0.5">{log.sender}</span>
                  <div className={`p-2.5 rounded-sm ${
                    log.sender === 'user'
                      ? 'bg-industrial-800 text-slate-200 border border-industrial-700'
                      : 'bg-slate-950/80 text-alarm-purple border border-industrial-850'
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestions Buttons Panel */}
            <div className="px-4 py-2 border-t border-industrial-850 flex gap-2 overflow-x-auto shrink-0 font-mono text-[9px]">
              <button
                onClick={() => setChatInput("What happens if M17 fails?")}
                className="px-2 py-1 bg-industrial-950 border border-industrial-800 text-slate-400 hover:text-slate-200 hover:border-industrial-700 rounded-sm shrink-0 whitespace-nowrap"
              >
                M17 Failure
              </button>
              <button
                onClick={() => setChatInput("Which machine is most fragile?")}
                className="px-2 py-1 bg-industrial-950 border border-industrial-800 text-slate-400 hover:text-slate-200 hover:border-industrial-700 rounded-sm shrink-0 whitespace-nowrap"
              >
                Vulnerability Map
              </button>
              <button
                onClick={() => setChatInput("What is the safest response to M17 failure?")}
                className="px-2 py-1 bg-industrial-950 border border-industrial-800 text-slate-400 hover:text-slate-200 hover:border-industrial-700 rounded-sm shrink-0 whitespace-nowrap"
              >
                Safest Mitigate
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-industrial-800 flex gap-2 shrink-0 bg-slate-900/40">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask e.g. What happens if M17 fails?"
                className="flex-1 bg-industrial-950 border border-industrial-800 p-2 rounded-sm text-xs font-mono text-slate-100 focus:outline-none focus:border-alarm-purple placeholder-slate-650"
              />
              <button
                type="submit"
                className="p-2 bg-alarm-purple hover:bg-violet-650 text-slate-100 rounded-sm flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </form>
          </div>
        )}
      </div>

    </Layout>
  );
}
