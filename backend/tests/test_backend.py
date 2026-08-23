import pytest
import os
import numpy as np
from stable_baselines3 import PPO
from backend.app.models import FacilityState
from backend.app.graph_engine import build_dependency_graph, compute_graph_metrics
from backend.app.world_model import get_initial_state, transition, calculate_resilience_score
from backend.app.cascade_engine import run_cascade_simulation
from backend.app.ml_engine import generate_synthetic_telemetry, train_failure_model, predict_and_explain
from backend.app.optimizer import run_optimization, evaluate_strategy, CANDIDATE_INTERVENTIONS
from backend.app.natural_language import parse_and_execute_query
from backend.app.ml.gym_env import ARGUSIndustrialEnv

PPO_POLICY_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "data", "argus_ppo_policy.zip")

def test_graph_engine():
    G = build_dependency_graph()
    assert G.number_of_nodes() > 10
    assert "M17" in G.nodes
    assert "Line 3" in G.nodes
    
    metrics = compute_graph_metrics(G)
    assert "M17" in metrics
    assert metrics["M17"]["systemicCriticality"] == 97.0
    assert metrics["M17"]["cascadePotential"] == 94.0

def test_world_model():
    state = get_initial_state()
    assert isinstance(state, FacilityState)
    assert state.machines["M17"].status == "Critical"
    assert state.machines["M12"].status == "Healthy"
    
    next_state = transition(state, action=None, time_step=5.0)
    assert next_state.timestamp == 5.0
    assert next_state.machines["M17"].temperature != state.machines["M17"].temperature
    
    fail_state = transition(state, action={"type": "FAIL_MACHINE", "target": "M17"}, time_step=5.0)
    assert fail_state.machines["M17"].status == "Failed"
    assert fail_state.machines["M17"].utilization == 0.0
    assert fail_state.lines["Line 3"].capacity < 100.0

def test_cascade_engine():
    res = run_cascade_simulation("M17", severity=1.0, horizon_minutes=60.0)
    assert res["initialFailure"] == "M17"
    assert res["cascadeRisk"] == 84.0
    assert len(res["timeline"]) > 0
    assert res["timeline"][0]["asset"] == "M17"
    assert res["timeline"][0]["time"] == 0.0

def test_ml_engine():
    df = generate_synthetic_telemetry(num_samples=100)
    assert len(df) == 100
    assert "failure" in df.columns
    
    metrics = train_failure_model()
    assert "f1" in metrics
    assert metrics["f1"] >= 0.0
    
    sample_telemetry = {
        "temperature": 88.0,
        "temperatureTrend": 1.5,
        "vibration": 7.5,
        "vibrationTrend": 0.8,
        "powerConsumption": 85.0,
        "powerTrend": 0.5,
        "utilization": 90.0,
        "rpm": 3000.0,
        "maintenanceAge": 500.0
    }
    explanation = predict_and_explain(sample_telemetry)
    assert "failureProbability" in explanation
    assert len(explanation["explanations"]) > 0

def test_optimizer():
    state = get_initial_state()
    failed_state = transition(state, action={"type": "FAIL_MACHINE", "target": "M17"})
    
    res = run_optimization(failed_state)
    assert "recommendedStrategy" in res
    assert len(res["recommendedActions"]) > 0
    assert res["cascadeRiskAfter"] < res["cascadeRiskBefore"]

def test_natural_language():
    state = get_initial_state()
    
    res1 = parse_and_execute_query("What happens if M17 fails?", state)
    assert res1["intent"] == "SIMULATE_FAILURE"
    assert "M17" in res1["answer"]
    
    res2 = parse_and_execute_query("Which machine has the highest cascade potential?", state)
    assert res2["intent"] == "QUERY_GRAPH"
    assert "M17" in res2["answer"]
    
    res3 = parse_and_execute_query("How can I preserve Batch #482?", state)
    assert res3["intent"] == "OPTIMIZE_STRATEGY"

def test_gym_env():
    """Verifies that the Gymnasium wrapper resets and steps properly."""
    env = ARGUSIndustrialEnv()
    obs, info = env.reset()
    assert obs.shape == (49,)
    assert isinstance(obs, np.ndarray)
    
    # Step environment
    obs_next, reward, term, trunc, info_next = env.step(1) # repair M17 action
    assert obs_next.shape == (49,)
    assert isinstance(reward, float)
    assert term in [True, False]
    assert "financial_loss" in info_next

def test_ppo_inference():
    """Verifies that the saved PPO policy can load and execute predictions on our observation vector."""
    if os.path.exists(PPO_POLICY_PATH):
        model = PPO.load(PPO_POLICY_PATH)
        sample_obs = np.zeros(49, dtype=np.float32)
        action, _ = model.predict(sample_obs, deterministic=True)
        assert int(action) in range(6)
