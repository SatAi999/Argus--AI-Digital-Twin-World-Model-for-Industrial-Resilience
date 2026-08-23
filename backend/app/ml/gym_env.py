import gymnasium as gym
import numpy as np
from gymnasium import spaces
from typing import Dict, Any, Tuple, Optional
from backend.app.models import FacilityState
from backend.app.world_model import get_initial_state, transition

class ARGUSIndustrialEnv(gym.Env):
    """
    Model-Based Reinforcement Learning environment for ARGUS Manufacturing Plant Alpha.
    Wraps the World Model state transitions and operational rules.
    """
    metadata = {"render_modes": ["human"]}

    def __init__(self):
        super(ARGUSIndustrialEnv, self).__init__()
        
        # 1. Observation space: 49 continuous variables
        # - Machines (8 machines * 5 properties = 40): health, fail_prob, temp, vib, load
        # - Lines (3 lines * 1 property = 3): capacity
        # - Utilities (3 cooling zones + 1 power grid = 4): utilizations
        # - Inventory (1): level
        # - Timestamp / Cascade Risk (1): timestamp
        self.observation_space = spaces.Box(
            low=0.0,
            high=200.0,
            shape=(49,),
            dtype=np.float32
        )
        
        # 2. Action space: 6 discrete mitigation strategies
        # 0: Do Nothing
        # 1: Prioritize M17 Maintenance (Repair M17)
        # 2: Reduce M19 Load by 20%
        # 3: Shift Batch #482 to Line 2
        # 4: Boost Cooling Zone 3 (Auxiliary Cooling reallocation)
        # 5: Throttle M17 Load by 15%
        self.action_space = spaces.Discrete(6)
        
        # In-memory facility state
        self.state: Optional[FacilityState] = None
        self.steps_count = 0
        self.max_steps = 36  # 180 minutes simulation horizon / 5 minute steps
        
        # Track values for step-by-step delta calculations
        self.last_loss = 0.0
        self.last_intervention_cost = 0.0
        self.last_resilience = 78.0

    def _get_obs(self) -> np.ndarray:
        """Packs the FacilityState into a flat 49-element numpy array."""
        obs = []
        
        # 1. Machines (40 features)
        for m_id in ["M12", "M14", "M17", "M19", "M21", "M23", "M25", "M27"]:
            m = self.state.machines[m_id]
            obs.extend([
                m.healthScore,
                m.failureProbability,
                m.temperature,
                m.vibration,
                m.utilization
            ])
            
        # 2. Lines (3 features)
        for l_id in ["Line 1", "Line 2", "Line 3"]:
            obs.append(self.state.lines[l_id].capacity)
            
        # 3. Utilities (4 features)
        for cz_id in ["Cooling Zone 1", "Cooling Zone 2", "Cooling Zone 3"]:
            obs.append(self.state.utilities.cooling_zones[cz_id].utilization)
        obs.append(self.state.utilities.power_grid.utilization)
        
        # 4. Inventory (1 feature)
        obs.append(self.state.inventory.product_level)
        
        # 5. Timestamp (1 feature)
        obs.append(self.state.timestamp)
        
        return np.array(obs, dtype=np.float32)

    def reset(self, seed: Optional[int] = None, options: Optional[Dict[str, Any]] = None) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Resets the environment. Injects a failure on M17 with 50% probability to teach recovery policies."""
        super().reset(seed=seed)
        
        self.state = get_initial_state()
        self.steps_count = 0
        
        # Inject failure on M17 to train mitigation responses
        # For evaluation, we can choose option to force failure
        force_failure = options.get("force_failure", True) if options else True
        if force_failure:
            self.state = transition(self.state, action={"type": "FAIL_MACHINE", "target": "M17"})
            
        self.last_loss = self.state.financials.estimated_loss
        self.last_intervention_cost = self.state.financials.intervention_cost
        self.last_resilience = self.state.resilience_score
        
        return self._get_obs(), {}

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        """Executes a transition step in the environment by applying the agent's action choice."""
        self.steps_count += 1
        
        # Map discrete action index to World Model transition action
        action_dict = None
        if action == 1:
            action_dict = {"type": "REPAIR_MACHINE", "target": "M17"}
        elif action == 2:
            action_dict = {"type": "REDUCE_LOAD", "target": "M19", "reduction": 20.0}
        elif action == 3:
            action_dict = {"type": "SHIFT_BATCH", "target": "Batch #482", "target_line": "Line 2"}
        elif action == 4:
            action_dict = {"type": "REALLOCATE_COOLING", "target": "Cooling Zone 3", "boost": 40.0}
        elif action == 5:
            action_dict = {"type": "REDUCE_LOAD", "target": "M17", "reduction": 15.0}
            
        # Apply transition using the Hybrid World Model
        self.state = transition(self.state, action=action_dict, time_step=5.0)
        
        # Calculate Reward elements
        curr_loss = self.state.financials.estimated_loss
        loss_incurred = curr_loss - self.last_loss
        self.last_loss = curr_loss
        
        curr_int_cost = self.state.financials.intervention_cost
        intervention_incurred = curr_int_cost - self.last_intervention_cost
        self.last_intervention_cost = curr_int_cost
        
        curr_resilience = self.state.resilience_score
        resilience_delta = curr_resilience - self.last_resilience
        self.last_resilience = curr_resilience
        
        # Penalties:
        # 1. Financial Loss penalty (scaled: ₹10,000 loss = -1.0 reward)
        loss_penalty = - (loss_incurred / 10000.0)
        # 2. Intervention Cost penalty (scaled: ₹10,000 cost = -0.5 reward)
        cost_penalty = - (intervention_incurred / 20000.0)
        # 3. Safety boundaries check: penalize if temp > 105C or cooling > 140%
        safety_penalty = 0.0
        for m in self.state.machines.values():
            if m.temperature > 105.0:
                safety_penalty -= 5.0
            if m.utilization > 120.0:
                safety_penalty -= 3.0
        for cz in self.state.utilities.cooling_zones.values():
            if cz.utilization > 140.0:
                safety_penalty -= 5.0
                
        # Rewards:
        # 1. Resilience improvement reward
        resilience_reward = resilience_delta * 1.5
        # 2. High steady-state resilience bonus (reward maintaining healthy operations)
        status_bonus = 2.0 if curr_resilience > 75.0 else (0.5 if curr_resilience > 50.0 else -2.0)
        
        # Compute final weighted reward
        reward = loss_penalty + cost_penalty + safety_penalty + resilience_reward + status_bonus
        
        # Determine episode termination
        terminated = self.steps_count >= self.max_steps
        truncated = False
        
        info = {
            "elapsed_minutes": self.state.timestamp,
            "resilience_score": curr_resilience,
            "financial_loss": curr_loss,
            "intervention_cost": curr_int_cost,
            "is_safe": safety_penalty == 0.0
        }
        
        return self._get_obs(), float(reward), terminated, truncated, info
