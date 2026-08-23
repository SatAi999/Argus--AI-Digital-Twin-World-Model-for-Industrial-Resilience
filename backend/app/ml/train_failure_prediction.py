import os
import pickle
import json
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

FEATURE_NAMES = [
    "temperature", "temperatureTrend", "vibration", "vibrationTrend",
    "powerConsumption", "powerTrend", "utilization", "rpm", "maintenanceAge"
]

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODEL_PATH = os.path.join(DATA_DIR, "failure_model.pkl")
METRICS_PATH = os.path.join(DATA_DIR, "failure_metrics.json")

def generate_telemetry_dataset(num_samples: int = 55000, seed: int = 42) -> pd.DataFrame:
    """
    Generates a large correlated dataset (55,000+ records) modeling physical relationships.
    """
    np.random.seed(seed)
    print(f"Generating {num_samples} synthetic telemetry records...")
    
    # Base distributions
    utilization = np.random.uniform(20.0, 98.0, num_samples)
    maintenance_age = np.random.exponential(300.0, num_samples)  # hours
    
    # Operating variables under correlated physical rules
    # Temperature rises with utilization and wear age
    temperature = 28.0 + (utilization * 0.48) + (maintenance_age * 0.025) + np.random.normal(0, 3.5, num_samples)
    temp_trend = (utilization / 100.0) * 0.6 + (maintenance_age / 800.0) * 0.25 - 0.2 + np.random.normal(0, 0.12, num_samples)
    
    # Vibration spikes as components wear out or run at high utilizations
    vibration = 0.8 + (utilization / 22.0) + (maintenance_age / 90.0) * 0.9 + np.random.normal(0, 0.5, num_samples)
    vibration_trend = (utilization / 100.0) * 0.35 + (maintenance_age / 400.0) * 0.15 - 0.1 + np.random.normal(0, 0.06, num_samples)
    
    # Electrical load and speed
    rpm = utilization * 32.0 + np.random.normal(0, 120, num_samples)
    power = 20.0 + utilization * 0.85 + max(0, float(vibration.mean() - 1.0)) * 2.5 + np.random.normal(0, 2.5, num_samples)
    power_trend = (utilization / 100.0) * 0.22 - 0.1 + np.random.normal(0, 0.05, num_samples)
    
    # Formulate logistic failure ground-truth
    # Extreme heat (>85C) and vibration (>6.0) spike risk significantly
    logits = (
        0.075 * (temperature - 80.0) +
        0.65 * (vibration - 5.5) +
        1.8 * vibration_trend +
        0.4 * temp_trend +
        0.0035 * (maintenance_age - 350.0) +
        0.025 * (utilization - 85.0) -
        3.5
    )
    prob = 1.0 / (1.0 + np.exp(-logits))
    failure = (np.random.uniform(0, 1, num_samples) < prob).astype(int)
    
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

def train_xgb_model():
    """
    Trains the XGBoost classifier, evaluates performance on a test split,
    and persists the model and metrics.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    
    df = generate_telemetry_dataset()
    X = df[FEATURE_NAMES]
    y = df["failure"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training XGBoost classifier...")
    model = XGBClassifier(
        n_estimators=120,
        max_depth=5,
        learning_rate=0.08,
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_train, y_train)
    
    # Inference & metrics
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    
    cm = confusion_matrix(y_test, preds)
    # cm format: [[TN, FP], [FN, TP]]
    tn, fp, fn, tp = cm.ravel()
    
    metrics = {
        "precision": float(precision_score(y_test, preds)),
        "recall": float(recall_score(y_test, preds)),
        "f1": float(f1_score(y_test, preds)),
        "roc_auc": float(roc_auc_score(y_test, probs)),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp)
        },
        "dataset_size": len(df),
        "test_size": len(X_test)
    }
    
    # Save model using pickle (so it fits ml_engine.py loader)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to {MODEL_PATH}")
    
    # Save metrics JSON
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to {METRICS_PATH}")
    
    return metrics

if __name__ == "__main__":
    train_xgb_model()
