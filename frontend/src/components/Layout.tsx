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
    <div className="flex h-screen bg-industrial-950 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-industrial-900/90 border-r border-industrial-800/60 flex flex-col justify-between shrink-0 font-mono backdrop-blur-md">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-industrial-800/50 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-widest bg-gradient-to-r from-slate-50 to-slate-400 bg-clip-text text-transparent">ARGUS</h1>
              <p className="text-[9px] text-slate-500 tracking-wider mt-0.5">DECISION INTELLIGENCE</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-alarm-green shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" title="System Live" />
          </div>
          
          {/* Navigation Items */}
          <nav className="p-4 flex flex-col gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-bold tracking-wide text-left transition-all duration-200 border ${
                    isActive
                      ? 'bg-industrial-850/80 border-industrial-700/80 text-alarm-purple shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-850/30 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-alarm-purple stroke-[2.5px]' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Resilience Widget & Reset Controls */}
        <div className="p-4 border-t border-industrial-800/50 flex flex-col gap-3">
          <div className="bg-industrial-950/60 p-4 border border-industrial-800/80 rounded-md shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
            <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">PLANT RESILIENCE</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold font-mono tracking-tight ${
                resilienceScore > 75 ? 'text-alarm-green' : resilienceScore > 40 ? 'text-alarm-amber' : 'text-alarm-red'
              }`}>{resilienceScore}</span>
              <span className="text-[10px] text-slate-500 font-semibold">/ 100</span>
            </div>
          </div>
          
          <button
            onClick={onReset}
            className="w-full py-2.5 border border-industrial-800 bg-industrial-850 hover:bg-industrial-800 active:bg-industrial-850 rounded-md text-[10px] font-bold tracking-widest font-mono text-center flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 shadow-sm transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET TWIN STATE</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-industrial-950 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-alarm-purple/3 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Header Status Bar */}
        <header className="h-14 bg-industrial-900/40 border-b border-industrial-800/50 flex items-center justify-between px-6 shrink-0 backdrop-blur-sm z-10">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-bold font-mono tracking-widest text-alarm-green flex items-center gap-1.5 bg-emerald-950/20 px-2.5 py-1 border border-alarm-green/10 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-alarm-green animate-pulse" />
              SYSTEM OPERATIONAL
            </span>
            <span className="w-px h-4 bg-industrial-800" />
            <div className="flex gap-4 text-[9px] font-mono text-slate-500">
              <span className="flex items-center gap-1">WORLD MODEL: <strong className="text-slate-350 font-semibold">SYNCED</strong></span>
              <span className="flex items-center gap-1">DIGITAL TWIN: <strong className="text-slate-350 font-semibold">LIVE</strong></span>
              <span className="flex items-center gap-1">GRAPH: <strong className="text-slate-350 font-semibold">22 NODES</strong></span>
              <span className="flex items-center gap-1">SIMULATOR: <strong className="text-slate-350 font-semibold">READY</strong></span>
              <span className="flex items-center gap-1">OPTIMIZER: <strong className="text-slate-350 font-semibold">READY</strong></span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-[10px] text-slate-500 font-mono">
              DEMO CASE: <span className="text-slate-300 font-bold">PLANT ALPHA CNC CRITICALITY</span>
            </div>
          </div>
        </header>
        
        {/* Page Content Panel */}
        <section className="flex-1 p-6 overflow-y-auto bg-industrial-950/20 z-10 relative">
          <div className="max-w-[1400px] mx-auto h-full">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
