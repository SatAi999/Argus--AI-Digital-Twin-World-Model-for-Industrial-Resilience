import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Radio, AlertTriangle, ShieldCheck, Play, RotateCcw } from 'lucide-react';
import { fetchSHAP } from '../services/api';

interface LiveTelemetryProps {
  onTriggerWarning: () => void;
}

export default function LiveTelemetry({ onTriggerWarning }: LiveTelemetryProps) {
  const [isDegrading, setIsDegrading] = useState(false);
  const [timeStep, setTimeStep] = useState(0);
  
  // M17 Telemetry State
  const [telemetry, setTelemetry] = useState({
    temp: 87.2,
    vib: 7.8,
    util: 91.0,
    risk: 92.0
  });

  const [history, setHistory] = useState<Array<{ time: string; Temp: number; Vib: number; Risk: number }>>([
    { time: '09:40:00', Temp: 85.0, Vib: 7.0, Risk: 80.0 },
    { time: '09:40:10', Temp: 85.5, Vib: 7.2, Risk: 82.0 },
    { time: '09:40:20', Temp: 86.0, Vib: 7.4, Risk: 85.0 },
    { time: '09:40:30', Temp: 86.5, Vib: 7.6, Risk: 88.0 },
    { time: '09:40:40', Temp: 87.2, Vib: 7.8, Risk: 92.0 }
  ]);

  // Telemetry streaming simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStep(prev => prev + 1);
      
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      setTelemetry(curr => {
        let nextTemp = curr.temp;
        let nextVib = curr.vib;
        
        if (isDegrading) {
          nextTemp = Math.min(105.0, curr.temp + 1.2);
          nextVib = Math.min(10.0, curr.vib + 0.18);
        } else {
          // slight random jitter around nominal/current levels
          nextTemp = Math.max(40.0, curr.temp + (Math.random() - 0.5) * 0.4);
          nextVib = Math.max(0.5, curr.vib + (Math.random() - 0.5) * 0.1);
        }
        
        // Recalculate failure risk (sigmoidal approximation)
        const h_fac = 0.6; // constant health factor for telemetry demo
        const t_fac = 1.0 / (1.0 + Math.exp(-(nextTemp - 80.0)/4.0));
        const v_fac = 1.0 / (1.0 + Math.exp(-(nextVib - 5.5)/0.8));
        const nextRisk = Math.round((h_fac * 0.35 + t_fac * 0.45 + v_fac * 0.2) * 1000) / 10;
        
        // Update history (keep last 12 points)
        setHistory(prevHist => {
          const updated = [...prevHist, { time: timeStr, Temp: nextTemp, Vib: nextVib, Risk: nextRisk }];
          if (updated.length > 12) updated.shift();
          return updated;
        });

        // Trigger early warning callback if risk crosses 96% (or let's say 97% for the demo trigger)
        if (nextRisk >= 97.0 && isDegrading) {
          setIsDegrading(false);
          // Wait 1.5 seconds then redirect
          setTimeout(() => {
            onTriggerWarning();
          }, 1500);
        }

        return {
          temp: nextTemp,
          vib: nextVib,
          util: curr.util,
          risk: nextRisk
        };
      });
      
    }, 1000);

    return () => clearInterval(interval);
  }, [isDegrading]);

  const handleStartDegradation = () => {
    // Reset to healthy starting point then start degradation
    setTelemetry({
      temp: 50.0,
      vib: 1.8,
      util: 80.0,
      risk: 5.0
    });
    setHistory([
      { time: '09:40:00', Temp: 48.0, Vib: 1.6, Risk: 3.0 },
      { time: '09:40:10', Temp: 49.0, Vib: 1.7, Risk: 4.0 },
      { time: '09:40:20', Temp: 50.0, Vib: 1.8, Risk: 5.0 }
    ]);
    setIsDegrading(true);
  };

  const handleReset = () => {
    setIsDegrading(false);
    setTelemetry({
      temp: 42.5,
      vib: 1.2,
      util: 75.0,
      risk: 2.0
    });
    setHistory([
      { time: '09:40:00', Temp: 42.0, Vib: 1.1, Risk: 2.0 },
      { time: '09:40:10', Temp: 42.3, Vib: 1.2, Risk: 2.0 },
      { time: '09:40:20', Temp: 42.5, Vib: 1.2, Risk: 2.0 }
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100">LIVE TELEMETRY STREAM</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Monitor real-time sensor streams and test proactive predictive warning boundaries.</p>
        </div>
        
        {/* Telemetry Actions */}
        <div className="flex items-center gap-3">
          {!isDegrading ? (
            <button
              onClick={handleStartDegradation}
              className="px-4 py-2 bg-alarm-amber hover:bg-amber-600 active:bg-alarm-amber text-slate-900 rounded-sm text-xs font-bold font-mono tracking-wider flex items-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.2)] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              SIMULATE M17 DEGRADATION (PROACTIVE RISK)
            </button>
          ) : (
            <span className="px-4 py-2 border border-alarm-red bg-red-950/20 text-alarm-red text-xs font-bold font-mono rounded-sm animate-pulse tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-alarm-red animate-ping" />
              DEGRADATION SIMULATION ACTIVE
            </span>
          )}
          
          <button
            onClick={handleReset}
            className="px-3.5 py-2 border border-industrial-800 bg-industrial-900 hover:bg-industrial-850 text-slate-350 hover:text-slate-100 text-xs font-bold font-mono rounded-sm transition-all"
            title="Reset Sensors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Streaming Line Charts (2 Cols) */}
        <div className="col-span-2 flex flex-col gap-6">
          
          {/* Temperature & Vibration Streaming Chart */}
          <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2 flex justify-between items-center">
              <span>M17 SENSOR telemetry STREAMS</span>
              <span className="text-[10px] text-slate-500">Updates every 1s</span>
            </h3>
            
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#161920" />
                  <XAxis dataKey="time" stroke="#4c5566" tick={{ fill: '#738099', fontSize: 9 }} />
                  <YAxis yAxisId="temp" stroke="#4c5566" tick={{ fill: '#738099', fontSize: 10 }} domain={[30, 110]} label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#738099', fontSize: 9 }} />
                  <YAxis yAxisId="vib" orientation="right" stroke="#4c5566" tick={{ fill: '#738099', fontSize: 10 }} domain={[0, 12]} label={{ value: 'Vibration (mm/s)', angle: 90, position: 'insideRight', fill: '#738099', fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e1014', border: '1px solid #2c3240', borderRadius: '2px', color: '#e2e8f0', fontSize: 10 }} />
                  <Line yAxisId="temp" type="monotone" dataKey="Temp" stroke="#ef4444" strokeWidth={2} dot={false} name="Temperature (°C)" />
                  <Line yAxisId="vib" type="monotone" dataKey="Vib" stroke="#3b82f6" strokeWidth={2} dot={false} name="Vibration (mm/s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>

        {/* Right 1 Col: Live Indicators & Alert Warnings */}
        <div className="flex flex-col gap-6">
          
          {/* Live Sensor Value Cards */}
          <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2">
              REAL-TIME DIGITAL READOUTS
            </h3>

            <div className="flex flex-col gap-3 font-mono text-xs">
              {/* Temp Readout */}
              <div className="p-3 bg-industrial-950 border border-industrial-850 rounded-sm flex justify-between items-center">
                <span className="text-slate-400">BEARING TEMPERATURE</span>
                <span className={`text-base font-bold ${telemetry.temp > 85.0 ? 'text-alarm-red animate-pulse' : 'text-slate-200'}`}>
                  {round(telemetry.temp, 1)} °C
                </span>
              </div>

              {/* Vib Readout */}
              <div className="p-3 bg-industrial-950 border border-industrial-850 rounded-sm flex justify-between items-center">
                <span className="text-slate-400">HOUSING VIBRATION</span>
                <span className={`text-base font-bold ${telemetry.vib > 6.0 ? 'text-alarm-red animate-pulse' : 'text-slate-200'}`}>
                  {round(telemetry.vib, 2)} mm/s
                </span>
              </div>

              {/* Risk Readout */}
              <div className="p-3 bg-industrial-950 border border-industrial-850 rounded-sm flex justify-between items-center">
                <span className="text-slate-400">ML FAILURE PROBABILITY</span>
                <span className={`text-base font-bold ${telemetry.risk > 80.0 ? 'text-alarm-red animate-pulse' : telemetry.risk > 30.0 ? 'text-alarm-amber' : 'text-alarm-green'}`}>
                  {round(telemetry.risk, 1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Trigger Alert Panel */}
          {telemetry.risk >= 80.0 && (
            <div className="p-4 border border-alarm-red bg-red-950/20 rounded-sm flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <AlertTriangle className="w-5 h-5 text-alarm-red shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs leading-relaxed">
                <strong className="text-alarm-red block font-mono">⚠️ PREDICTIVE ALARM SHUTDOWN EXCEEDED</strong>
                ML failure prediction probability crossed 80%. Plant alpha is entering a critical cascade risk window. Preparing redirection...
              </div>
            </div>
          )}

          {telemetry.risk < 80.0 && (
            <div className="p-4 border border-alarm-green/30 bg-emerald-950/5 rounded-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-alarm-green shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-400">
                <strong className="text-slate-350 block font-mono">TELEMETRY MONITOR NOMINAL</strong>
                Operating parameters remain within safely configured feasibility envelopes. Early warning sensors primed.
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
