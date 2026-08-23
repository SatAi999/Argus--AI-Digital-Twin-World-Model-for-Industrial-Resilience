import React from 'react';
import { LayoutDashboard, Radio, Cpu, Workflow, ShieldAlert, RefreshCw, Layers, Activity, Database } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  onReset: () => void;
  resilienceScore: number;
}

export default function Layout({
  children,
  activePage,
  setActivePage,
  onReset,
  resilienceScore
}: LayoutProps) {
  
  const navItems = [
    { id: 'command-center', name: 'COMMAND CENTER', icon: LayoutDashboard },
    { id: 'digital-twin', name: 'DIGITAL TWIN', icon: Radio },
    { id: 'live-telemetry', name: 'LIVE TELEMETRY', icon: Activity },
    { id: 'cascade-lab', name: 'CASCADE LAB', icon: Cpu },
    { id: 'world-model', name: 'WORLD MODEL', icon: Workflow },
    { id: 'interventions', name: 'INTERVENTIONS', icon: ShieldAlert },
    { id: 'resilience', name: 'RESILIENCE', icon: Layers },
    { id: 'replay', name: 'INCIDENT REPLAY', icon: RefreshCw },
    { id: 'model-intelligence', name: 'MODEL METRICS', icon: Database }
  ];

  return (
    <div className="flex h-screen bg-industrial-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-industrial-900 border-r border-industrial-800 flex flex-col justify-between shrink-0 font-mono">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-industrial-800 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-wider text-slate-50 font-mono">ARGUS</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">RESILIENCE DECISION ENGINE</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-alarm-green animate-pulse" title="System Live" />
          </div>
          
          {/* Navigation Items */}
          <nav className="p-4 flex flex-col gap-1.5 overflow-y-auto max-h-[50vh]">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs font-semibold tracking-wide text-left transition-all ${
                    isActive
                      ? 'bg-industrial-800 border border-industrial-600 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-alarm-purple' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Resilience Widget & Reset Controls */}
        <div className="p-4 border-t border-industrial-800 flex flex-col gap-4">
          <div className="bg-industrial-950 p-4 border border-industrial-800 rounded-sm">
            <span className="text-[10px] text-slate-400 font-mono font-bold block mb-1">PLANT RESILIENCE SCORE</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${
                resilienceScore > 75 ? 'text-alarm-green' : resilienceScore > 40 ? 'text-alarm-amber' : 'text-alarm-red'
              }`}>{resilienceScore}</span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
          </div>
          
          <button
            onClick={onReset}
            className="w-full py-2.5 border border-industrial-700 bg-industrial-800 hover:bg-industrial-700/80 active:bg-industrial-800 rounded-sm text-[10px] font-bold tracking-widest font-mono text-center flex items-center justify-center gap-2 hover:text-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET FACILITY STATE</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header Status Bar */}
        <header className="h-14 bg-industrial-900 border-b border-industrial-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold font-mono tracking-widest text-alarm-green flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-alarm-green animate-pulse" />
              SYSTEM OPERATIONAL
            </span>
            <span className="w-px h-4 bg-slate-800" />
            <div className="flex gap-4 text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1">WORLD MODEL: <strong className="text-slate-300">SYNCED</strong></span>
              <span className="flex items-center gap-1">DIGITAL TWIN: <strong className="text-slate-300">LIVE</strong></span>
              <span className="flex items-center gap-1">GRAPH: <strong className="text-slate-300">22 NODES</strong></span>
              <span className="flex items-center gap-1">SIMULATOR: <strong className="text-slate-300">READY</strong></span>
              <span className="flex items-center gap-1">OPTIMIZER: <strong className="text-slate-300">READY</strong></span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-[10px] text-slate-400 font-mono">
              DEMO SCENARIO: <span className="text-slate-100 font-semibold">PLANT ALPHA CNC CRITICALITY</span>
            </div>
          </div>
        </header>
        
        {/* Page Content Panel */}
        <section className="flex-1 p-6 overflow-y-auto bg-industrial-950">
          {children}
        </section>
      </main>
    </div>
  );
}
