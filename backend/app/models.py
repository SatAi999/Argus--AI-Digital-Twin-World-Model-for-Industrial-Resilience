from pydantic import BaseModel
from typing import List, Dict, Optional

class MachineState(BaseModel):
    id: str
    name: str
    type: str
    line: str
    status: str  # "Healthy", "Warning", "Critical", "Failed"
    temperature: float
    temperatureTrend: float
    vibration: float
    vibrationTrend: float
    powerConsumption: float
    powerTrend: float
    utilization: float
    throughput: float
    rpm: float
    maintenanceAge: float  # hours since maintenance
    lastMaintenance: str
    healthScore: float
    failureProbability: float
    systemicCriticality: float
    cascadePotential: float
    recoveryTime: float  # minutes to repair
    repairCost: float  # ₹ cost
    capacity: float  # maximum capacity
    currentLoad: float  # actual load

class LineState(BaseModel):
    id: str
    name: str
    capacity: float  # 0.0 to 100.0 %
    currentLoad: float
    status: str  # "Operational", "Degraded", "Offline"

class CoolingZoneState(BaseModel):
    id: str
    load: float  # kW of heat load
    capacity: float  # max cooling kW
    utilization: float  # %
    status: str  # "Normal", "Stressed", "Overloaded"

class PowerGridState(BaseModel):
    load: float  # total current power consumption in kW
    limit: float  # max grid threshold in kW
    utilization: float  # %
    status: str  # "Stable", "PeakDemand", "Overloaded"

class CompressedAirState(BaseModel):
    pressure: float  # bar (typically 6-8 bar)
    utilization: float  # %
    status: str

class UtilityState(BaseModel):
    cooling_zones: Dict[str, CoolingZoneState]
    power_grid: PowerGridState
    compressed_air: CompressedAirState

class BatchState(BaseModel):
    id: str
    name: str
    line: str
    progress: float  # % complete
    delay_minutes: float
    status: str  # "Processing", "Delayed", "Completed", "Paused"
    priority: int  # 1-3 (high-low)

class InventoryState(BaseModel):
    product_level: float  # % of warehouse buffer filled
    safety_buffer: float  # threshold below which alert triggers
    status: str  # "Normal", "Low", "CriticalStockout"

class FinancialMetrics(BaseModel):
    estimated_loss: float  # total accumulated loss in ₹
    loss_rate: float  # current financial loss rate per minute in ₹
    intervention_cost: float  # cost of applied interventions in ₹
    loss_avoided: float  # calculated loss avoided in ₹

class FacilityState(BaseModel):
    machines: Dict[str, MachineState]
    lines: Dict[str, LineState]
    utilities: UtilityState
    batches: Dict[str, BatchState]
    inventory: InventoryState
    financials: FinancialMetrics
    resilience_score: float  # 0 to 100
    timestamp: float  # relative simulated time (e.g. 0 to 180 min)
