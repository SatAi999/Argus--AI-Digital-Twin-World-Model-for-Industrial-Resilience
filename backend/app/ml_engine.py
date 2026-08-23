import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score
import shap
from typing import Dict, Any, Tuple

# Features list
FEATURE_NAMES = [
    "temperature", "temperatureTrend", "vibration", "vibrationTrend",
    "powerConsumption", "powerTrend", "utilization", "rpm", "maintenanceAge"
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), "data", "failure_model.pkl")

# In-memory caches for fast API access
_model_cache = None
_explainer_cache = None

def generate_synthetic_telemetry(num_samples: int = 1200, seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic, physically-correlated telemetry data for machines.
    Higher temperatures, vibrations, loads, and maintenance ages increase failure probability.
    """
    np.random.seed(seed)
    
    # Generate feature distributions
    utilization = np.random.uniform(30.0, 95.0, num_samples)
    maintenance_age = np.random.exponential(250.0, num_samples) # average 250 hours
    
    # Physics-based relations
    # temperature = ambient (30) + utilization * coefficient + random noise
    temperature = 30.0 + (utilization * 0.45) + (maintenance_age * 0.02) + np.random.normal(0, 3.0, num_samples)
    # trend is higher if utilization or age is high
    temp_trend = (utilization / 100.0) * 0.5 + (maintenance_age / 1000.0) * 0.2 + np.random.normal(0, 0.1, num_samples)
    
    # vibration
    vibration = 1.0 + (utilization / 20.0) + (maintenance_age / 100.0) * 0.8 + np.random.normal(0, 0.4, num_samples)
    vibration_trend = (utilization / 100.0) * 0.3 + (maintenance_age / 500.0) * 0.1 + np.random.normal(0, 0.05, num_samples)
    
    # rpm & power
    rpm = utilization * 30.0 + np.random.normal(0, 100, num_samples)
    power = 25.0 + utilization * 0.9 + (vibration - 1.0) * 2.0 + np.random.normal(0, 2.0, num_samples)
    power_trend = (utilization / 100.0) * 0.2 + np.random.normal(0, 0.05, num_samples)
    
    # Failure probability (ground truth formula)
    # Logistic probability
    logits = (
        0.06 * (temperature - 75.0) +
        0.5 * (vibration - 5.0) +
        1.5 * vibration_trend +
        0.3 * temp_trend +
        0.003 * (maintenance_age - 300.0) +
        0.02 * (utilization - 80.0) -
        3.0  # intercept
    )
    prob = 1.0 / (1.0 + np.exp(-logits))
    failure = (np.random.uniform(0, 1, num_samples) < prob).astype(int)
    
    # Pack into dataframe
    df = pd.DataFrame({
        "temperature": temperature,
        "temperatureTrend": temp_trend,
        "vibration": vibration,
        "vibrationTrend": vibration_trend,
        "powerConsumption": power,
        "powerTrend": power_trend,
        "utilization": utilization,
        "rpm": rpm,
        "maintenanceAge": maintenance_age,
        "failure": failure
    })
    
    return df

def train_failure_model() -> Dict[str, float]:
    """
    Trains a RandomForest model to predict machine failure.
    Saves model and returns evaluation metrics.
    """
    global _model_cache, _explainer_cache
    
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    
    df = generate_synthetic_telemetry(num_samples=1500)
    X = df[FEATURE_NAMES]
    y = df["failure"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Train Random Forest classifier
    model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    
    metrics = {
        "precision": float(precision_score(y_test, preds)),
        "recall": float(recall_score(y_test, preds)),
        "f1": float(f1_score(y_test, preds)),
        "roc_auc": float(roc_auc_score(y_test, probs))
    }
    
    # Save the model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
        
    _model_cache = model
    
    # Warm up SHAP TreeExplainer
    _explainer_cache = shap.TreeExplainer(model)
    
    print(f"Model trained successfully. Evaluation metrics: {metrics}")
    return metrics

def get_model_and_explainer() -> Tuple[RandomForestClassifier, shap.TreeExplainer]:
    """
    Loads model and explainer from cache or file. Trains if not present.
    """
    global _model_cache, _explainer_cache
    
    if _model_cache is not None and _explainer_cache is not None:
        return _model_cache, _explainer_cache
        
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            _model_cache = model
            _explainer_cache = shap.TreeExplainer(model)
            return _model_cache, _explainer_cache
        except Exception as e:
            print(f"Error loading model from disk, retraining: {e}")
            
    # Train fresh
    train_failure_model()
    return _model_cache, _explainer_cache

def predict_and_explain(machine_telemetry: Dict[str, float]) -> Dict[str, Any]:
    """
    Predicts the failure probability for a machine based on current telemetry
    and computes SHAP values to explain the risk factors.
    """
    model, explainer = get_model_and_explainer()
    
    # Construct input vector
    input_data = [machine_telemetry.get(feat, 0.0) for feat in FEATURE_NAMES]
    X_input = pd.DataFrame([input_data], columns=FEATURE_NAMES)
    
    # Predict failure probability
    prob = float(model.predict_proba(X_input)[0, 1])
    
    # Compute SHAP values
    # explainer.shap_values returns a list of arrays (one per class). We want index 1 (failure class).
    shap_vals = explainer.shap_values(X_input)
    
    # Handle shap_values shapes (can vary depending on shap/scikit-learn versions)
    if isinstance(shap_vals, list):
        # Class 1 shap values
        shap_class = shap_vals[1][0]
    elif len(shap_vals.shape) == 3: # (samples, features, classes)
        shap_class = shap_vals[0, :, 1]
    else: # (samples, features) or similar
        shap_class = shap_vals[0]
        
    # Zip feature names and contributions
    explanations = []
    for feat, val in zip(FEATURE_NAMES, shap_class):
        explanations.append({
            "feature": feat,
            "impact": float(val),
            "magnitude": abs(float(val))
        })
        
    # Sort explanations by magnitude
    explanations.sort(key=lambda x: x["magnitude"], reverse=True)
    
    return {
        "failureProbability": round(prob * 100.0, 1),
        "explanations": explanations
    }
