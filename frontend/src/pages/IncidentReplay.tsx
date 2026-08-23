import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';
import { TimelineEvent } from '../types';

interface IncidentReplayProps {
  timeline: TimelineEvent[];
}

export default function IncidentReplay({ timeline }: IncidentReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  
  const timerRef = useRef<any>(null);
  const maxTime = 180;

  const visibleEvents = timeline.filter(event => event.time <= currentTime);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return prev + 1 * speed;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSpeedChange = () => {
    setSpeed(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 5;
      if (prev === 5) return 10;
      return 1;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold font-mono tracking-wider text-slate-100">INCIDENT REPLAY</h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">Chronologically review past failures and scrub through step-by-step propagation events.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Player Controls & Visual Scrubber */}
        <div className="col-span-2 bg-industrial-900 border border-industrial-800 p-6 rounded-sm flex flex-col gap-6">
          
          {/* Main Media Player Console */}
          <div className="bg-industrial-950 border border-industrial-800 p-5 rounded-sm flex flex-col gap-5 items-center">
            
            {/* Large Time Indicator */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">ELAPSED INCIDENT TIME</span>
              <span className="text-4xl font-mono font-bold text-alarm-red tracking-wider mt-1">
                {String(Math.floor(currentTime / 60)).padStart(2, '0')}:
                {String(currentTime % 60).padStart(2, '0')}
                <span className="text-xs text-slate-500 font-mono font-normal ml-1">HR:MIN</span>
              </span>
            </div>

            {/* Scrubber Slider */}
            <div className="w-full px-2 flex flex-col gap-2 mt-2">
              <input
                type="range"
                min="0"
                max={maxTime}
                value={currentTime}
                onChange={e => setCurrentTime(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-alarm-red"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>T+0 MIN (M17 FAILURE)</span>
                <span>T+60 MIN</span>
                <span>T+120 MIN</span>
                <span>T+180 MIN (OUTCOME REALIZED)</span>
              </div>
            </div>

            {/* Media Action Buttons */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={handleReset}
                className="p-2 border border-industrial-800 bg-industrial-900 hover:bg-industrial-800 text-slate-300 rounded-sm hover:text-slate-100 transition-colors"
                title="Reset Replay"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className={`p-3.5 rounded-full ${
                  isPlaying ? 'bg-alarm-amber text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'bg-alarm-red text-slate-100 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                } hover:scale-105 active:scale-100 transition-all`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleSpeedChange}
                className="px-3 py-2 border border-industrial-800 bg-industrial-900 hover:bg-industrial-850 text-[10px] font-mono font-bold tracking-wider text-slate-300 hover:text-slate-100 rounded-sm transition-all"
                title="Change Play Speed"
              >
                {speed}X SPEED
              </button>
            </div>

          </div>

          {/* Chronological list of events up to the selected scrubber time */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider">
              REALIZED EVENT SEQUENCE (T &le; T_{currentTime})
            </h3>
            
            <div className="border border-industrial-800 bg-industrial-950/40 p-4 rounded-sm flex flex-col gap-3 min-h-[150px]">
              {visibleEvents.length === 0 ? (
                <div className="text-xs text-slate-500 font-mono text-center py-10">
                  Scrub timeline forward to observe incident events.
                </div>
              ) : (
                <div className="relative border-l border-industrial-800 pl-4 ml-2 flex flex-col gap-4 py-1">
                  {visibleEvents.map((event, idx) => {
                    const isFail = event.status === 'Failed' || event.status === 'Critical';
                    return (
                      <div key={idx} className="relative flex gap-4 text-xs">
                        <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                          isFail ? 'bg-alarm-red' : 'bg-alarm-amber'
                        }`} />
                        <div className="w-14 shrink-0 font-mono text-[10px] text-slate-500">T+{event.time}m</div>
                        <div className="w-24 shrink-0 font-bold font-mono text-slate-400">{event.asset}</div>
                        <div className={`flex-1 ${isFail ? 'text-slate-200' : 'text-slate-350'}`}>{event.event}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Diagnostics Info Panel */}
        <div className="bg-industrial-900 border border-industrial-800 p-5 rounded-sm h-fit flex flex-col gap-4">
          <h3 className="text-xs font-bold font-mono text-slate-300 tracking-wider border-b border-industrial-800 pb-2 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-alarm-purple" />
            INCIDENT DIAGNOSTICS
          </h3>

          <div className="flex flex-col gap-3.5 text-xs text-slate-400 leading-relaxed">
            <p>
              Replay maps the sequential causal chain of failures through dependency paths.
            </p>
            
            <div className="p-3 bg-industrial-950 border border-industrial-850 rounded-sm">
              <strong className="text-slate-300 font-mono block mb-1">PROPAGATION LAGS</strong>
              <span>
                Cascades are not instantaneous. Thermal conduction, queue backlogs, and inventory depleting require physical time to propagate, 
                giving operators a vital window of opportunity to intervene.
              </span>
            </div>

            <div className="p-3 bg-industrial-950 border border-industrial-850 rounded-sm">
              <strong className="text-slate-300 font-mono block mb-1">AUDIT LOGGING</strong>
              <span>
                All incident logs are chronologically timestamped for post-mortem analysis, enabling historical World Model calibration.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
