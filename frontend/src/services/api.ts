import {
  FacilityState, MachineState, GraphData,
  CascadeSimulationResult, OptimizationResult,
  MachineAnalysisResult, NLPResult
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function fetchFacility(): Promise<FacilityState> {
  const res = await fetch(`${API_BASE}/facility`);
  if (!res.ok) throw new Error('Failed to fetch facility state');
  return res.json();
}

export async function fetchMachines(): Promise<Record<string, MachineState>> {
  const res = await fetch(`${API_BASE}/machines`);
  if (!res.ok) throw new Error('Failed to fetch machines');
  return res.json();
}

export async function fetchGraph(): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error('Failed to fetch dependency graph');
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch KPIs');
  return res.json();
}

export async function fetchRisks() {
  const res = await fetch(`${API_BASE}/risks`);
  if (!res.ok) throw new Error('Failed to fetch risk vulnerability list');
  return res.json();
}

export async function fetchSHAP(machineId: string): Promise<MachineAnalysisResult> {
  const res = await fetch(`${API_BASE}/explain/${machineId}`);
  if (!res.ok) throw new Error(`Failed to fetch SHAP for ${machineId}`);
  return res.json();
}

export async function simulateFailure(
  machineId: string,
  severity = 1.0,
  duration = 144.0
): Promise<CascadeSimulationResult> {
  const res = await fetch(`${API_BASE}/simulate/failure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machine_id: machineId, severity, duration })
  });
  if (!res.ok) throw new Error('Failed to simulate cascade');
  return res.json();
}

export async function triggerFailure(machineId: string, severity = 1.0) {
  const res = await fetch(`${API_BASE}/trigger-failure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machine_id: machineId, severity })
  });
  if (!res.ok) throw new Error('Failed to trigger failure');
  return res.json();
}

export async function optimizeInterventions(weights: {
  risk_weight: number;
  production_weight: number;
  cost_weight: number;
  recovery_weight: number;
  energy_weight: number;
}): Promise<OptimizationResult> {
  const res = await fetch(`${API_BASE}/interventions/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weights)
  });
  if (!res.ok) throw new Error('Failed to optimize strategies');
  return res.json();
}

export async function applyStrategy(actions: any[]) {
  const res = await fetch(`${API_BASE}/apply-strategy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actions })
  });
  if (!res.ok) throw new Error('Failed to apply strategy');
  return res.json();
}

export async function askArgus(query: string): Promise<NLPResult> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to query ARGUS NLP');
  return res.json();
}

export async function resetFacility() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset facility');
  return res.json();
}

// ----------------- NEW ML / RL METRICS CALLS -----------------
export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/model/metrics`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return res.json();
}

export async function fetchRLMetrics() {
  const res = await fetch(`${API_BASE}/rl/metrics`);
  if (!res.ok) throw new Error('Failed to fetch RL metrics');
  return res.json();
}

export async function fetchRLAction() {
  const res = await fetch(`${API_BASE}/rl/action`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to infer RL action');
  return res.json();
}
