import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Edge,
  Node,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphData, FacilityState } from '../../types';

interface GraphViewProps {
  graphData: GraphData;
  facilityState: FacilityState | null;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  activeCascadePath?: string[]; // IDs of nodes in active propagation
  simulationMode?: boolean;
}

// Preset positions for nodes to ensure a clean grid flow layout
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Utilities (Top Row)
  "Material Storage": { x: 100, y: 50 },
  "Compressed Air": { x: 300, y: 50 },
  "Power Grid": { x: 500, y: 50 },
  "Cooling Zone 1": { x: 750, y: 50 },
  "Cooling Zone 2": { x: 950, y: 50 },
  "Cooling Zone 3": { x: 1150, y: 50 },
  
  // Machines (Middle Row)
  "M12": { x: 100, y: 220 },
  "M14": { x: 280, y: 220 },
  "M21": { x: 500, y: 220 },
  "M23": { x: 680, y: 220 },
  "M17": { x: 880, y: 220 },
  "M19": { x: 1060, y: 220 },
  "M25": { x: 1240, y: 220 },
  "M27": { x: 1420, y: 220 },
  
  // Assembly Lines (Lower Middle Row)
  "Line 1": { x: 190, y: 380 },
  "Line 2": { x: 590, y: 380 },
  "Line 3": { x: 1150, y: 380 },
  
  // Batches (Bottom Row)
  "Batch #481": { x: 190, y: 520 },
  "Batch #483": { x: 590, y: 520 },
  "Batch #482": { x: 1060, y: 520 },
  "Batch #484": { x: 1240, y: 520 },
  
  // Sinks
  "Inventory": { x: 650, y: 660 },
  "Order Fulfillment": { x: 650, y: 780 }
};

export default function GraphView({
  graphData,
  facilityState,
  selectedNodeId,
  onSelectNode,
  activeCascadePath = [],
  simulationMode = false
}: GraphViewProps) {
  
  // Map GraphData to React Flow Nodes
  const nodes: Node[] = useMemo(() => {
    return graphData.nodes.map(n => {
      const pos = NODE_POSITIONS[n.id] || { x: Math.random() * 800, y: Math.random() * 600 };
      const isSelected = selectedNodeId === n.id;
      const isInCascade = activeCascadePath.includes(n.id);
      
      // Determine node status & details from facility state
      let status: string = 'Healthy';
      let health = 100;
      let labelDetail = '';
      
      if (facilityState) {
        if (n.type === 'machine' && facilityState.machines[n.id]) {
          const m = facilityState.machines[n.id];
          status = m.status;
          health = m.healthScore;
          labelDetail = `${round(m.temperature, 0)}°C | ${round(m.vibration, 1)}mm/s`;
        } else if (n.type === 'line' && facilityState.lines[n.id]) {
          const l = facilityState.lines[n.id];
          status = l.status === 'Operational' ? 'Healthy' : l.status === 'Degraded' ? 'Warning' : 'Critical';
          health = l.capacity;
          labelDetail = `Cap: ${round(l.capacity, 0)}%`;
        } else if (n.type === 'utility') {
          if (n.id === 'Power Grid') {
            const pg = facilityState.utilities.power_grid;
            status = pg.status === 'Stable' ? 'Healthy' : pg.status === 'PeakDemand' ? 'Warning' : 'Critical';
            health = 100 - pg.utilization;
            labelDetail = `Load: ${round(pg.load, 0)}kW`;
          } else if (n.id === 'Compressed Air') {
            const ca = facilityState.utilities.compressed_air;
            status = ca.status === 'Normal' ? 'Healthy' : 'Warning';
            health = ca.pressure * 13;
            labelDetail = `${round(ca.pressure, 1)} bar`;
          } else if (facilityState.utilities.cooling_zones[n.id]) {
            const cz = facilityState.utilities.cooling_zones[n.id];
            status = cz.status === 'Normal' ? 'Healthy' : cz.status === 'Stressed' ? 'Warning' : 'Critical';
            health = 100 - cz.utilization;
            labelDetail = `Util: ${round(cz.utilization, 0)}%`;
          }
        } else if (n.type === 'batch' && facilityState.batches[n.id]) {
          const b = facilityState.batches[n.id];
          status = b.status === 'Completed' ? 'Healthy' : b.status === 'Delayed' ? 'Critical' : 'Warning';
          health = b.progress;
          labelDetail = `Prog: ${round(b.progress, 0)}%`;
        } else if (n.id === 'Inventory') {
          const inv = facilityState.inventory;
          status = inv.status === 'Normal' ? 'Healthy' : inv.status === 'Low' ? 'Warning' : 'Critical';
          health = inv.product_level;
          labelDetail = `Stock: ${round(inv.product_level, 0)}%`;
        } else if (n.id === 'Order Fulfillment') {
          const activeFail = Object.values(facilityState.machines).some(m => m.status === 'Failed');
          status = activeFail ? 'Critical' : 'Healthy';
          health = activeFail ? 20 : 100;
          labelDetail = activeFail ? 'Missed Window' : 'In Window';
        }
      }

      // Border and background classes based on status and selection
      let statusBorder = 'border-slate-700 bg-slate-900';
      let statusPulse = 'bg-alarm-green';
      
      if (simulationMode) {
        statusBorder = 'border-purple-500/50 bg-slate-900/90 shadow-[0_0_10px_rgba(139,92,246,0.15)]';
        statusPulse = 'bg-alarm-purple animate-pulse';
      } else {
        switch (status) {
          case 'Healthy':
            statusBorder = isSelected ? 'border-alarm-green bg-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-alarm-green/40 bg-slate-950/90';
            statusPulse = 'bg-alarm-green';
            break;
          case 'Warning':
            statusBorder = isSelected ? 'border-alarm-amber bg-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.35)]' : 'border-alarm-amber/50 bg-slate-950/90';
            statusPulse = 'bg-alarm-amber animate-pulse';
            break;
          case 'Critical':
            statusBorder = isSelected ? 'border-alarm-red bg-slate-900 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-alarm-red/60 bg-slate-950/90';
            statusPulse = 'bg-alarm-red animate-pulse';
            break;
          case 'Failed':
            statusBorder = 'border-alarm-red bg-red-950/20 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)] animate-pulse';
            statusPulse = 'bg-red-500 animate-ping';
            break;
        }
      }

      const cascadeHighlight = isInCascade ? 'ring-2 ring-alarm-purple ring-offset-2 ring-offset-slate-950' : '';

      return {
        id: n.id,
        position: pos,
        type: 'default',
        className: `w-44 text-left p-3 border-2 ${statusBorder} ${cascadeHighlight} rounded-sm text-xs select-none transition-all duration-300 cursor-pointer`,
        data: {
          label: (
            <div className="flex flex-col gap-1 text-slate-100" onClick={() => onSelectNode(n.id)}>
              <div className="flex items-center justify-between font-semibold">
                <span className="truncate">{n.id}</span>
                <span className={`w-2 h-2 rounded-full ${statusPulse}`} />
              </div>
              <div className="text-[10px] text-slate-400 capitalize flex justify-between">
                <span>{n.type}</span>
                <span className="font-mono text-slate-300">{labelDetail}</span>
              </div>
              {/* Mini Health Bar */}
              <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${status === 'Failed' ? 'bg-alarm-red' : status === 'Critical' ? 'bg-alarm-red' : status === 'Warning' ? 'bg-alarm-amber' : 'bg-alarm-green'}`} 
                  style={{ width: `${Math.min(100, Math.max(0, health))}%` }} 
                />
              </div>
            </div>
          )
        }
      };
    });
  }, [graphData, facilityState, selectedNodeId, activeCascadePath, simulationMode]);

  // Map GraphData to React Flow Edges
  const edges: Edge[] = useMemo(() => {
    return graphData.edges.map((e, idx) => {
      const isSimulationActive = simulationMode;
      const isFailedFlow = facilityState && (
        (facilityState.machines[e.source]?.status === 'Failed') ||
        (facilityState.lines[e.source]?.status === 'Offline')
      );
      
      let animated = false;
      let className = '';
      let edgeColor = '#434b5c';
      
      if (isFailedFlow) {
        animated = true;
        className = 'edge-failed';
        edgeColor = '#ef4444';
      } else if (isSimulationActive && activeCascadePath.includes(e.source) && activeCascadePath.includes(e.target)) {
        animated = true;
        className = 'edge-pulsing';
        edgeColor = '#8b5cf6';
      }
      
      return {
        id: `e-${idx}`,
        source: e.source,
        target: e.target,
        animated,
        className,
        style: { stroke: edgeColor, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
          width: 14,
          height: 14
        }
      };
    });
  }, [graphData, facilityState, activeCascadePath, simulationMode]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '520px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        className="w-full h-full bg-industrial-950"
      >
        <Background color="#161920" gap={24} size={1} />
        <Controls className="bg-slate-900 border border-slate-700 text-slate-100 rounded-sm fill-slate-100" />
        <MiniMap 
          nodeColor={(node) => {
            const element = nodes.find(n => n.id === node.id);
            if (element?.className?.includes('border-alarm-red')) return '#ef4444';
            if (element?.className?.includes('border-alarm-amber')) return '#f59e0b';
            if (element?.className?.includes('border-alarm-green')) return '#10b981';
            return '#252932';
          }}
          maskColor="rgba(7, 8, 10, 0.7)"
          className="bg-slate-900 border border-slate-700 rounded-sm"
        />
      </ReactFlow>
    </div>
  );
}

function round(val: number, decimals = 1): number {
  if (val === undefined || isNaN(val)) return 0;
  const mult = Math.pow(10, decimals);
  return Math.round(val * mult) / mult;
}
