import copy
import math
from typing import Dict, Any, List, Optional
from backend.app.models import (
    FacilityState, MachineState, LineState, UtilityState,
    CoolingZoneState, PowerGridState, CompressedAirState,
    BatchState, InventoryState, FinancialMetrics
)
from backend.app.graph_engine import build_dependency_graph, compute_graph_metrics

INITIAL_VIB = {"M12": 1.2, "M14": 1.5, "M17": 7.8, "M19": 4.5, "M21": 2.1, "M23": 2.5, "M25": 1.8, "M27": 1.1}
INITIAL_LOAD = {"M12": 75.0, "M14": 80.0, "M17": 91.0, "M19": 92.0, "M21": 70.0, "M23": 68.0, "M25": 60.0, "M27": 55.0}
INITIAL_TEMP = {"M12": 42.5, "M14": 45.0, "M17": 87.2, "M19": 74.5, "M21": 52.0, "M23": 55.4, "M25": 48.0, "M27": 38.2}
POWER_COEFFS = {"M12": 0.6, "M14": 0.62, "M17": 0.9, "M19": 1.03, "M21": 1.57, "M23": 1.1, "M25": 2.16, "M27": 0.45}

def get_initial_state() -> FacilityState:
    """
    Generates the default starting state ("ARGUS Manufacturing Plant Alpha")
    where M17 is in a critical condition, M19 is at warning/high utilization,
    and others are healthy.
    """
    G = build_dependency_graph()
    metrics = compute_graph_metrics(G)

    # 1. Machines
    machines = {
        "M12": MachineState(
            id="M12", name="M12 (CNC Milling)", type="CNC Milling", line="Line 1", status="Healthy",
            temperature=42.5, temperatureTrend=0.0, vibration=1.2, vibrationTrend=0.0,
            powerConsumption=45.0, powerTrend=0.0, utilization=75.0, throughput=80.0, rpm=2400.0,
            maintenanceAge=140.0, lastMaintenance="10 days ago", healthScore=95.0, failureProbability=2.0,
            systemicCriticality=metrics["M12"]["systemicCriticality"],
            cascadePotential=metrics["M12"]["cascadePotential"],
            recoveryTime=90.0, repairCost=80000.0, capacity=100.0, currentLoad=75.0
        ),
        "M14": MachineState(
            id="M14", name="M14 (CNC Turning)", type="CNC Turning", line="Line 1", status="Healthy",
            temperature=45.0, temperatureTrend=0.0, vibration=1.5, vibrationTrend=0.0,
            powerConsumption=50.0, powerTrend=0.0, utilization=80.0, throughput=75.0, rpm=2800.0,
            maintenanceAge=220.0, lastMaintenance="15 days ago", healthScore=90.0, failureProbability=5.0,
            systemicCriticality=metrics["M14"]["systemicCriticality"],
            cascadePotential=metrics["M14"]["cascadePotential"],
            recoveryTime=60.0, repairCost=65000.0, capacity=100.0, currentLoad=80.0
        ),
        "M17": MachineState(
            id="M17", name="M17 (CNC Precision)", type="CNC Precision", line="Line 3", status="Critical",
            temperature=87.2, temperatureTrend=1.8, vibration=7.8, vibrationTrend=0.85,
            powerConsumption=82.0, powerTrend=1.2, utilization=91.0, throughput=86.0, rpm=3200.0,
            maintenanceAge=720.0, lastMaintenance="45 days ago", healthScore=38.0, failureProbability=92.0,
            systemicCriticality=metrics["M17"]["systemicCriticality"],
            cascadePotential=metrics["M17"]["cascadePotential"],
            recoveryTime=144.0, repairCost=150000.0, capacity=100.0, currentLoad=91.0
        ),
        "M19": MachineState(
            id="M19", name="M19 (Laser Cutter)", type="Laser Cutter", line="Line 3", status="Warning",
            temperature=74.5, temperatureTrend=0.8, vibration=4.5, vibrationTrend=0.35,
            powerConsumption=95.0, powerTrend=0.5, utilization=92.0, throughput=90.0, rpm=1500.0,
            maintenanceAge=350.0, lastMaintenance="22 days ago", healthScore=72.0, failureProbability=35.0,
            systemicCriticality=metrics["M19"]["systemicCriticality"],
            cascadePotential=metrics["M19"]["cascadePotential"],
            recoveryTime=120.0, repairCost=120000.0, capacity=100.0, currentLoad=92.0
        ),
        "M21": MachineState(
            id="M21", name="M21 (Injection Molder)", type="Injection Molder", line="Line 2", status="Healthy",
            temperature=52.0, temperatureTrend=0.0, vibration=2.1, vibrationTrend=0.0,
            powerConsumption=110.0, powerTrend=0.0, utilization=70.0, throughput=100.0, rpm=1000.0,
            maintenanceAge=180.0, lastMaintenance="12 days ago", healthScore=88.0, failureProbability=8.0,
            systemicCriticality=metrics["M21"]["systemicCriticality"],
            cascadePotential=metrics["M21"]["cascadePotential"],
            recoveryTime=180.0, repairCost=220000.0, capacity=100.0, currentLoad=70.0
        ),
        "M23": MachineState(
            id="M23", name="M23 (Welding Robot)", type="Welding Robot", line="Line 2", status="Healthy",
            temperature=55.4, temperatureTrend=0.0, vibration=2.5, vibrationTrend=0.0,
            powerConsumption=75.0, powerTrend=0.0, utilization=68.0, throughput=65.0, rpm=0.0,
            maintenanceAge=190.0, lastMaintenance="12 days ago", healthScore=85.0, failureProbability=11.0,
            systemicCriticality=metrics["M23"]["systemicCriticality"],
            cascadePotential=metrics["M23"]["cascadePotential"],
            recoveryTime=90.0, repairCost=95000.0, capacity=100.0, currentLoad=68.0
        ),
        "M25": MachineState(
            id="M25", name="M25 (Stamping Press)", type="Stamping Press", line="Line 3", status="Healthy",
            temperature=48.0, temperatureTrend=0.0, vibration=1.8, vibrationTrend=0.0,
            powerConsumption=130.0, powerTrend=0.0, utilization=60.0, throughput=120.0, rpm=120.0,
            maintenanceAge=120.0, lastMaintenance="8 days ago", healthScore=92.0, failureProbability=4.0,
            systemicCriticality=metrics["M25"]["systemicCriticality"],
            cascadePotential=metrics["M25"]["cascadePotential"],
            recoveryTime=240.0, repairCost=350000.0, capacity=100.0, currentLoad=60.0
        ),
        "M27": MachineState(
            id="M27", name="M27 (Packaging Unit)", type="Packaging Unit", line="Line 3", status="Healthy",
            temperature=38.2, temperatureTrend=0.0, vibration=1.1, vibrationTrend=0.0,
            powerConsumption=25.0, powerTrend=0.0, utilization=55.0, throughput=150.0, rpm=500.0,
            maintenanceAge=90.0, lastMaintenance="6 days ago", healthScore=94.0, failureProbability=3.0,
            systemicCriticality=metrics["M27"]["systemicCriticality"],
            cascadePotential=metrics["M27"]["cascadePotential"],
            recoveryTime=60.0, repairCost=40000.0, capacity=100.0, currentLoad=55.0
        )
    }

    # 2. Production Lines
    lines = {
        "Line 1": LineState(id="Line 1", name="Assembly Line 1", capacity=100.0, currentLoad=77.5, status="Operational"),
        "Line 2": LineState(id="Line 2", name="Assembly Line 2", capacity=100.0, currentLoad=69.0, status="Operational"),
        "Line 3": LineState(id="Line 3", name="High-Precision Line 3", capacity=100.0, currentLoad=74.5, status="Operational")
    }

    # 3. Utilities
    cooling_zones = {
        "Cooling Zone 1": CoolingZoneState(id="Cooling Zone 1", load=80.0, capacity=150.0, utilization=53.3, status="Normal"),
        "Cooling Zone 2": CoolingZoneState(id="Cooling Zone 2", load=95.0, capacity=160.0, utilization=59.4, status="Normal"),
        "Cooling Zone 3": CoolingZoneState(id="Cooling Zone 3", load=135.0, capacity=180.0, utilization=75.0, status="Normal")
    }
    power_grid = PowerGridState(load=587.0, limit=800.0, utilization=73.4, status="Stable")
    compressed_air = CompressedAirState(pressure=7.2, utilization=68.0, status="Normal")
    
    utilities = UtilityState(
        cooling_zones=cooling_zones,
        power_grid=power_grid,
        compressed_air=compressed_air
    )

    # 4. Production Batches
    batches = {
        "Batch #481": BatchState(id="Batch #481", name="Batch #481 (Standard Parts)", line="Line 1", progress=65.0, delay_minutes=0.0, status="Processing", priority=3),
        "Batch #482": BatchState(id="Batch #482", name="Batch #482 (Precision CNC)", line="Line 3", progress=38.0, delay_minutes=0.0, status="Processing", priority=1),
        "Batch #483": BatchState(id="Batch #483", name="Batch #483 (Injection Components)", line="Line 2", progress=82.0, delay_minutes=0.0, status="Processing", priority=2),
        "Batch #484": BatchState(id="Batch #484", name="Batch #484 (Stamping & Packaging)", line="Line 3", progress=15.0, delay_minutes=0.0, status="Processing", priority=3)
    }

    # 5. Inventory
    inventory = InventoryState(product_level=60.0, safety_buffer=30.0, status="Normal")

    # 6. Financials
    financials = FinancialMetrics(estimated_loss=0.0, loss_rate=0.0, intervention_cost=0.0, loss_avoided=0.0)

    # Calculate starting resilience score
    resilience_score = calculate_resilience_score(machines)

    return FacilityState(
        machines=machines,
        lines=lines,
        utilities=utilities,
        batches=batches,
        inventory=inventory,
        financials=financials,
        resilience_score=resilience_score,
        timestamp=0.0
    )

def calculate_resilience_score(machines: Dict[str, MachineState]) -> float:
    """
    Computes a facility-wide resilience score based on:
    1. Average machine health (40%)
    2. Failure probability suppression (30%)
    3. Exposure of systemic critical assets (30%)
    """
    avg_health = sum(m.healthScore for m in machines.values()) / len(machines)
    avg_fail_prob = sum(m.failureProbability for m in machines.values()) / len(machines)
    
    # Calculate criticality-weighted risk
    criticality_weighted_risk = 0.0
    total_criticality = 0.0
    for m in machines.values():
        criticality_weighted_risk += (m.failureProbability / 100.0) * m.systemicCriticality
        total_criticality += m.systemicCriticality
    
    weighted_risk_factor = (criticality_weighted_risk / total_criticality) if total_criticality > 0 else 0.0
    exposure_score = max(0.0, 100.0 - (weighted_risk_factor * 100.0))
    
    resilience = (avg_health * 0.4) + ((100.0 - avg_fail_prob) * 0.3) + (exposure_score * 0.3)
    return round(resilience, 1)

def apply_action(state: FacilityState, action: Dict[str, Any]) -> FacilityState:
    """
    Applies an action IMMEDIATELY to modify the state before entering subsequent transitions.
    """
    new_state = copy.deepcopy(state)
    action_type = action.get("type")
    target = action.get("target")

    if action_type == "FAIL_MACHINE":
        if target in new_state.machines:
            m = new_state.machines[target]
            m.status = "Failed"
            m.healthScore = 0.0
            m.failureProbability = 100.0
            m.utilization = 0.0
            m.throughput = 0.0
            m.rpm = 0.0
            m.currentLoad = 0.0
            
    elif action_type == "REPAIR_MACHINE":
        if target in new_state.machines:
            m = new_state.machines[target]
            m.status = "Healthy"
            m.healthScore = 100.0
            m.failureProbability = 1.0
            m.temperature = 40.0
            m.temperatureTrend = 0.0
            m.vibration = 1.0
            m.vibrationTrend = 0.0
            m.utilization = 80.0
            m.throughput = 80.0
            m.rpm = 2500.0
            m.currentLoad = 80.0
            m.maintenanceAge = 0.0
            m.lastMaintenance = "Just now"
            new_state.financials.intervention_cost += m.repairCost

    elif action_type == "REDUCE_LOAD":
        if target in new_state.machines:
            m = new_state.machines[target]
            reduction = action.get("reduction", 20.0)
            m.currentLoad = max(10.0, m.currentLoad - reduction)
            m.utilization = m.currentLoad
            m.temperatureTrend = max(-0.5, m.temperatureTrend - 0.5)
            new_state.financials.intervention_cost += 20000.0

    elif action_type == "SHIFT_BATCH":
        batch_id = target
        target_line = action.get("target_line")
        if batch_id in new_state.batches and target_line in new_state.lines:
            batch = new_state.batches[batch_id]
            batch.line = target_line
            new_state.financials.intervention_cost += 50000.0

    elif action_type == "REALLOCATE_COOLING":
        zone_id = target
        boost = action.get("boost", 40.0)
        if zone_id in new_state.utilities.cooling_zones:
            zone = new_state.utilities.cooling_zones[zone_id]
            zone.capacity += boost
            new_state.financials.intervention_cost += 15000.0

    return new_state

def transition(state: FacilityState, action: Optional[Dict[str, Any]] = None, time_step: float = 5.0) -> FacilityState:
    """
    Core World Model step transition function:
    next_state = transition(current_state, action)
    Updates physical equations, resource stress, and production metrics.
    """
    if action:
        current_state = apply_action(state, action)
    else:
        current_state = copy.deepcopy(state)
        
    current_state.timestamp += time_step
    
    machines = current_state.machines
    lines = current_state.lines
    utilities = current_state.utilities
    batches = current_state.batches
    inventory = current_state.inventory
    financials = current_state.financials
    
    # Check if cooling zones have overload deficits
    cz_deficits = {}
    for cz_id, cz in utilities.cooling_zones.items():
        cz_deficits[cz_id] = max(0.0, cz.utilization - 95.0) / 10.0

    # 2. Update physical states of machines
    for m_id, m in machines.items():
        if m.status == "Failed":
            m.utilization = 0.0
            m.throughput = 0.0
            m.currentLoad = 0.0
            m.rpm = 0.0
            m.temperature = max(35.0, m.temperature - 0.8 * time_step)
            m.vibration = max(0.5, m.vibration - 1.2 * time_step)
            m.healthScore = 0.0
            m.failureProbability = 100.0
            continue
            
        # Get zone association
        cz_id = "Cooling Zone 1"
        if m_id in ["M21", "M23"]:
            cz_id = "Cooling Zone 2"
        elif m_id in ["M17", "M19", "M25", "M27"]:
            cz_id = "Cooling Zone 3"
            
        cooling_deficit = cz_deficits.get(cz_id, 0.0)
        
        # Repaired base state calibration
        is_repaired = (m.status == "Healthy" and m_id in ["M17", "M19"] and m.healthScore > 90)
        base_temp = 40.0 if is_repaired else INITIAL_TEMP[m_id]
        base_vib = 1.0 if is_repaired else INITIAL_VIB[m_id]
        base_load = 80.0 if is_repaired else INITIAL_LOAD[m_id]
        
        load_factor = m.currentLoad / 100.0
        wear_factor = (100.0 - m.healthScore) / 100.0
        
        # Target temperature calculation (physics-consistent)
        temp_load_impact = (m.currentLoad - base_load) * 0.3
        target_temp = base_temp + temp_load_impact + (wear_factor * 25.0) + (cooling_deficit * 5.0)
        if target_temp < 30.0: target_temp = 30.0
        
        # Temp delta
        temp_delta = (target_temp - m.temperature) * 0.08 * time_step
        m.temperature += temp_delta
        m.temperatureTrend = round(temp_delta / time_step * 5.0, 2)

        # Target vibration calculation
        vib_load_impact = (m.currentLoad - base_load) * 0.015
        target_vib = base_vib + vib_load_impact + (wear_factor * 3.5)
        if target_vib < 0.4: target_vib = 0.4
        
        vib_delta = (target_vib - m.vibration) * 0.1 * time_step
        m.vibration += vib_delta
        m.vibrationTrend = round(vib_delta / time_step * 5.0, 2)

        # Recalculate power draw
        m.powerConsumption = round((m.currentLoad * POWER_COEFFS[m_id] + max(0.0, m.vibration - base_vib) * 1.2), 1)

        # Update machine health
        health_penalty = 0.0
        if m.temperature > 85.0:
            health_penalty += 0.05 * (m.temperature - 85.0) * time_step
        if m.vibration > 6.0:
            health_penalty += 0.10 * (m.vibration - 6.0) * time_step
            
        health_penalty += 0.0005 * m.maintenanceAge * time_step
        m.healthScore = max(0.0, m.healthScore - health_penalty)
        
        # Increment maintenance age
        m.maintenanceAge += time_step / 60.0
        
        # Recalculate failure probability
        h_fac = (100.0 - m.healthScore) / 100.0
        t_fac = 1.0 / (1.0 + math.exp(-(m.temperature - 80.0)/4.0)) if m.temperature > 65.0 else 0.0
        v_fac = 1.0 / (1.0 + math.exp(-(m.vibration - 5.5)/0.8)) if m.vibration > 3.5 else 0.0
        
        fail_prob = (h_fac * 0.45 + t_fac * 0.35 + v_fac * 0.2) * 100.0
        m.failureProbability = round(min(99.0, max(1.0, fail_prob)), 1)
        
        # Update Status
        if m.failureProbability > 80.0:
            m.status = "Critical"
        elif m.failureProbability > 30.0:
            m.status = "Warning"
        else:
            m.status = "Healthy"

    # 3. Update Lines
    line_machs = {
        "Line 1": [("M12", 0.5), ("M14", 0.5)],
        "Line 2": [("M21", 0.5), ("M23", 0.5)],
        "Line 3": [("M17", 0.7), ("M25", 0.15), ("M27", 0.15)]
    }

    for line_id, line in lines.items():
        mach_weights = line_machs[line_id]
        net_capacity = 0.0
        for m_id, weight in mach_weights:
            m = machines[m_id]
            mach_cap = 100.0 if m.status != "Failed" else 0.0
            net_capacity += mach_cap * weight
            
        line.capacity = round(net_capacity, 1)
        if line.capacity > 85.0:
            line.status = "Operational"
        elif line.capacity > 30.0:
            line.status = "Degraded"
        else:
            line.status = "Offline"

    # 4. Update Utilities (cooling base load + active draw)
    cooling_mapping = {
        "Cooling Zone 1": (50.0, ["M12", "M14"]),
        "Cooling Zone 2": (60.0, ["M21", "M23"]),
        "Cooling Zone 3": (80.0, ["M17", "M19", "M25", "M27"])
    }
    
    for cz_id, cz in utilities.cooling_zones.items():
        base_draw, conn_machines = cooling_mapping[cz_id]
        thermal_load = base_draw
        for m_id in conn_machines:
            m = machines[m_id]
            thermal_load += m.powerConsumption * (m.utilization / 100.0) * 0.3
            
        cz.load = round(thermal_load, 1)
        cz.utilization = round((cz.load / cz.capacity) * 100.0, 1)
        
        if cz.utilization > 100.0:
            cz.status = "Overloaded"
        elif cz.utilization > 80.0:
            cz.status = "Stressed"
        else:
            cz.status = "Normal"

    # Power Grid total load is machine power + cooling zones
    cooling_overhead = sum(cz.load * 0.25 for cz in utilities.cooling_zones.values())
    machine_power = sum(m.powerConsumption for m in machines.values())
    utilities.power_grid.load = round(machine_power + cooling_overhead, 1)
    utilities.power_grid.utilization = round((utilities.power_grid.load / utilities.power_grid.limit) * 100.0, 1)
    
    if utilities.power_grid.utilization > 100.0:
        utilities.power_grid.status = "Overloaded"
    elif utilities.power_grid.utilization > 85.0:
        utilities.power_grid.status = "PeakDemand"
    else:
        utilities.power_grid.status = "Stable"

    # Compressed air
    if utilities.power_grid.status == "Overloaded":
        utilities.compressed_air.pressure = max(4.0, utilities.compressed_air.pressure - 0.2 * time_step)
        utilities.compressed_air.status = "LowPressure"
    else:
        utilities.compressed_air.pressure = min(7.5, utilities.compressed_air.pressure + 0.1 * time_step)
        utilities.compressed_air.status = "Normal"
        
    utilities.compressed_air.utilization = round((7.5 - utilities.compressed_air.pressure) / 3.5 * 100.0, 1)

    # 5. Update Production Batches and Inventory
    active_line_loads = {"Line 1": 0.0, "Line 2": 0.0, "Line 3": 0.0}
    
    for b_id, b in batches.items():
        if b.status == "Completed":
            continue
            
        line = lines[b.line]
        
        if line.status == "Offline":
            prog_inc = 0.0
            b.status = "Delayed"
            b.delay_minutes += time_step
        else:
            priority_mult = 1.2 if b.priority == 1 else (1.0 if b.priority == 2 else 0.8)
            base_rate = 0.15
            prog_inc = base_rate * (line.capacity / 100.0) * priority_mult * time_step
            b.progress = min(100.0, b.progress + prog_inc)
            
            if b.progress >= 100.0:
                b.status = "Completed"
            elif line.status == "Degraded":
                b.status = "Delayed"
                b.delay_minutes += time_step * (1.0 - line.capacity / 100.0)
            else:
                b.status = "Processing"
                
        active_line_loads[b.line] += 30.0 if b.status == "Processing" else 10.0

    # Redefine Line Load
    for line_id, line in lines.items():
        line.currentLoad = min(100.0, active_line_loads[line_id] + 40.0)

    # 6. Inventory updates
    drain_rate = 0.1 * time_step
    replenish_rate = 0.0
    
    for b_id, b in batches.items():
        if b.status == "Completed" and b.progress >= 100.0 and b_id not in state.batches or (state.batches[b_id].status != "Completed" and b.status == "Completed"):
            if b_id == "Batch #482":
                replenish_rate += 25.0
            elif b_id == "Batch #481":
                replenish_rate += 15.0
            else:
                replenish_rate += 10.0
                
    inventory.product_level = max(0.0, min(100.0, inventory.product_level - drain_rate + replenish_rate))
    if inventory.product_level < inventory.safety_buffer:
        inventory.status = "CriticalStockout" if inventory.product_level < 10.0 else "Low"
    else:
        inventory.status = "Normal"

    # 7. Financial Losses Calculation
    loss_rate = 0.0
    
    for l_id, l in lines.items():
        if l.status == "Offline":
            loss_rate += 8000.0 if l_id == "Line 3" else 4000.0
        elif l.status == "Degraded":
            loss_rate += (1.0 - l.capacity/100.0) * (6000.0 if l_id == "Line 3" else 3000.0)
            
    for b_id, b in batches.items():
        if b.status == "Delayed":
            p_mult = 1500.0 if b.priority == 1 else (800.0 if b.priority == 2 else 300.0)
            loss_rate += p_mult
            
    if utilities.power_grid.status == "Overloaded":
        loss_rate += 5000.0
        
    if inventory.status == "CriticalStockout":
        loss_rate += 6000.0
    elif inventory.status == "Low":
        loss_rate += 2000.0
        
    financials.loss_rate = loss_rate
    financials.estimated_loss += loss_rate * time_step
    
    current_state.resilience_score = calculate_resilience_score(machines)
    
    return current_state

def rollout(state: FacilityState, actions: List[Dict[str, Any]] = [], horizon_minutes: float = 180.0, time_step: float = 5.0) -> List[FacilityState]:
    """
    Simulates multiple step transitions over a time horizon.
    """
    trajectory = [state]
    curr_state = state
    steps = int(horizon_minutes / time_step)
    
    for step in range(steps):
        target_time = (step + 1) * time_step
        
        step_action = None
        for act in actions:
            act_time = act.get("timestamp", 0.0)
            if target_time - time_step <= act_time < target_time:
                step_action = act
                break
                
        curr_state = transition(curr_state, action=step_action, time_step=time_step)
        trajectory.append(curr_state)
        
    return trajectory
