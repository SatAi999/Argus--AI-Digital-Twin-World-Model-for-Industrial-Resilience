export interface MachineState {
  id: string;
  name: string;
  type: string;
  line: string;
  status: 'Healthy' | 'Warning' | 'Critical' | 'Failed';
  temperature: number;
  temperatureTrend: number;
  vibration: number;
  vibrationTrend: number;
  powerConsumption: number;
  powerTrend: number;
  utilization: number;
  throughput: number;
  rpm: number;
  maintenanceAge: number;
  lastMaintenance: string;
  healthScore: number;
  failureProbability: number;
  systemicCriticality: number;
  cascadePotential: number;
  recoveryTime: number;
  repairCost: number;
  capacity: number;
  currentLoad: number;
}

export interface LineState {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  status: 'Operational' | 'Degraded' | 'Offline';
}

export interface CoolingZoneState {
  id: string;
  load: number;
  capacity: number;
  utilization: number;
  status: 'Normal' | 'Stressed' | 'Overloaded';
}

export interface PowerGridState {
  load: number;
  limit: number;
  utilization: number;
  status: 'Stable' | 'PeakDemand' | 'Overloaded';
}

export interface CompressedAirState {
  pressure: number;
  utilization: number;
  status: string;
}

export interface UtilityState {
  cooling_zones: Record<string, CoolingZoneState>;
  power_grid: PowerGridState;
  compressed_air: CompressedAirState;
}

export interface BatchState {
  id: string;
  name: string;
  line: string;
  progress: number;
  delay_minutes: number;
  status: 'Processing' | 'Delayed' | 'Completed' | 'Paused';
  priority: number;
}

export interface InventoryState {
  product_level: number;
  safety_buffer: number;
  status: 'Normal' | 'Low' | 'CriticalStockout';
}

export interface FinancialMetrics {
  estimated_loss: number;
  loss_rate: number;
  intervention_cost: number;
  loss_avoided: number;
}

export interface FacilityState {
  machines: Record<string, MachineState>;
  lines: Record<string, LineState>;
  utilities: UtilityState;
  batches: Record<string, BatchState>;
  inventory: InventoryState;
  financials: FinancialMetrics;
  resilience_score: number;
  timestamp: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'machine' | 'line' | 'utility' | 'batch' | 'business';
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  propagationFactor: number;
  dependencyType: 'process' | 'utility';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TimelineEvent {
  time: number;
  asset: string;
  event: string;
  status: string;
}

export interface CascadeSimulationResult {
  initialFailure: string;
  cascadeRisk: number;
  affectedAssets: number;
  productionLossPercent: number;
  energyImpactPercent: number;
  inventoryImpactPercent: number;
  estimatedFinancialLoss: number;
  recoveryTimeMinutes: number;
  timeline: TimelineEvent[];
  trajectory: FacilityState[];
}

export interface StrategyResult {
  strategy: string;
  actions: any[];
  objectiveScore: number;
  cascadeRiskBefore: number;
  cascadeRiskAfter: number;
  riskReduction: number;
  productionPreserved: number;
  estimatedInterventionCost: number;
  recoveryTime: number;
  energyStressPercent: number;
  safetyStatus: 'Safe' | 'Unsafe';
  safetyViolations: string[];
  trajectory: FacilityState[];
  lossAvoided?: number;
}

export interface OptimizationResult {
  recommendedStrategy: string;
  recommendedActions: any[];
  cascadeRiskBefore: number;
  cascadeRiskAfter: number;
  riskReduction: number;
  productionPreserved: number;
  estimatedLossAvoided: number;
  estimatedInterventionCost: number;
  recoveryTime: number;
  safetyStatus: string;
  reasoning: string[];
  confidence: number;
  allStrategies: StrategyResult[];
  searchSummary: {
    evaluated: number;
    feasible: number;
    safe: number;
    unsafe: number;
  };
}

export interface SHAPExplanation {
  feature: string;
  impact: number;
  magnitude: number;
}

export interface MachineAnalysisResult {
  failureProbability: number;
  explanations: SHAPExplanation[];
  systemicCriticality: number;
  cascadePotential: number;
  name: string;
  id: string;
}

export interface NLPResult {
  intent: string;
  entities?: Record<string, any>;
  answer: string;
  data: any;
}
