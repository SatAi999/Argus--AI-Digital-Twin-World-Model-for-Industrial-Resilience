# ARGUS — AI Digital Twin & Industrial World Model for Preventing Cascade Failures

### Tagline
**Predict the Cascade. Simulate the Future. Prevent the Failure.**

---

## 1. THE DETAILED PROBLEM STATEMENT

In modern manufacturing plants and automated assembly lines, machines do not operate in isolation. They form a tightly coupled, interconnected network of physical processes, utilities, and logistics. 

Traditional industrial monitoring platforms rely on **Predictive Maintenance (PdM)**. PdM asks a simple, localized question: *“Is Machine 17 likelihood to fail?”* It treats machines as isolated components, monitoring temperature and vibration, and triggers an alert when a threshold is breached.

However, in practice, localized failures are rarely isolated. They trigger cascading chain reactions throughout the facility:
1. **Physical Redundancy Overloads**: If a CNC machine (M17) fails, the production line capacity drops, shifting the workload onto adjacent machines (such as the Laser Cutter M19).
2. **Thermal & Utility Stress**: The overloaded machine draws more electrical power and generates excessive friction heat, which spikes the thermal load on adjacent cooling systems (Cooling Zone 3).
3. **Utility Collapse**: Stressed cooling zones exceed their capacity, causing ambient temperatures in the production zone to rise, which degrades the health of nearby healthy machinery (Stamping and Milling units).
4. **Logistics & Financial Penalties**: Downstream assembly lines are starved of parts, causing delays in contract batches (Batch #482). This triggers warehouse stockouts and active contract delivery penalties.

### The Problem Gap
Traditional PdM systems cannot forecast downstream propagation routes or determine the systemic criticality of an asset. An operator receives an alert that M17 has failed, but they have no tool to predict the cascade trajectory or search the combinatorial space of interventions (such as load-throttling, line-shifting, and utility reallocations) to find the most cost-efficient and safe response in real time.

---

## 2. THE PROPOSED SOLUTION: ARGUS

**ARGUS** is a Model-Based Decision Intelligence and Industrial Resilience Platform. It moves beyond predicting failures to simulating and preventing their system-wide consequences. 

ARGUS integrates telemetry forecasting, explainable machine learning, graph network topology, a hybrid World Model simulation, and model-based reinforcement learning (RL) to assist operators in containing cascading disruptions before they lead to factory-wide shutdowns.

```
 [ SENSE ]   ──►  Continuous Telemetry Feed (Temperature, Vibration, Load)
     │
 [ PREDICT ] ──►  XGBoost Classifier predicts localized failure probability
     │
[UNDERSTAND] ──►  SHAP Attributions explain local risk parameters (heat trend, wear)
     │
 [SIMULATE]  ──►  Topological Graph AI & World Model simulate cascade trajectories
     │
  [ LEARN ]  ──►  Gymnasium Environment trains PPO RL agent on rollout dynamics
     │
 [ DECIDE ]  ──►  Multi-Objective Optimizer & Safety constraints select optimal action
     │
 [PREVENT ]  ──►  Human-in-the-Loop Override applies the containment strategy
```

---

## 3. COMPONENT DEEP DIVE: MODELS, ALGORITHMS & EQUATIONS

### A. Synthetic Telemetry Generator
* **File Location**: [`train_failure_prediction.py`](file:///d:/Argus-Ai/backend/app/ml/train_failure_prediction.py)
* **Design**: Generates **55,000+ telemetry records** representing physical relationships to avoid trivial random data.
* **Correlation Logic**:
  * **Temperature**: Simulates operating heat using:
    \(T = 28.0 + (U \cdot 0.48) + (M_{\text{age}} \cdot 0.025) + \mathcal{N}(0, 3.5)\)
    where \(U\) is active utilization (%), \(M_{\text{age}}\) is maintenance age (hours), and \(\mathcal{N}\) represents normal sensor noise.
  * **Vibration**: Simulates vibration signals based on physical component wear:
    \(V = 0.8 + (U / 22.0) + (M_{\text{age}} / 90.0) \cdot 0.9 + \mathcal{N}(0, 0.5)\)
  * **Power Consumption**: Simulates load-drawn electricity:
    \(P = 20.0 + U \cdot 0.85 + \max(0, V - 1.0) \cdot 2.5 + \mathcal{N}(0, 2.5)\)

---

### B. Machine Failure Prediction Model (XGBoost)
* **File Location**: [`train_failure_prediction.py`](file:///d:/Argus-Ai/backend/app/ml/train_failure_prediction.py)
* **Algorithm**: **XGBClassifier** (eXtreme Gradient Boosting Classifier) chosen for its high accuracy on structured tabular sensor datasets.
* **Hyperparameters**:
  * `n_estimators`: 120
  * `max_depth`: 5 (prevents overfitting to sensor noise)
  * `learning_rate`: 0.08
  * `eval_metric`: `logloss`
* **Input Features**: `[temperature, temperatureTrend, vibration, vibrationTrend, powerConsumption, powerTrend, utilization, rpm, maintenanceAge]`
* **Outputs**: Probability of a bearing lockup or component failure within the next 3 hours.
* **Model Evaluation Metrics (Test Set Split)**:
  * **Precision**: 94.2% (minimizes false alarms)
  * **Recall**: 91.5% (ensures critical failures are caught)
  * **F1-Score**: 92.8% (balanced harmonic mean)
  * **ROC-AUC**: 0.982 (indicates outstanding classifier separability)

---

### C. Explainable AI (SHAP)
* **File Location**: [`ml_engine.py`](file:///d:/Argus-Ai/backend/app/ml_engine.py)
* **Algorithm**: **SHAP (SHapley Additive exPlanations)** based on cooperative game theory.
* **Mathematical Equation**: Calculates the Shapley value \(\phi_i\) for feature \(i\):
  \[\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f_x(S \cup \{i\}) - f_x(S) \right]\]
  where \(F\) is the set of all features, \(S\) is a subset of features excluding \(i\), and \(f_x(S)\) is the conditional expectation of the model output given the features in \(S\).
* **Usage**: Generates local feature attribution charts for any clicked machine in the Digital Twin, showing exactly which sensor signal (e.g. vibration spikes vs cooling loads) is driving the failure risk.

---

### D. Graph AI & Network Topology
* **File Location**: [`graph_engine.py`](file:///d:/Argus-Ai/backend/app/graph_engine.py)
* **Algorithm**: Constructs a directed dependency graph \(G = (V, E)\) representing the physical factory layout.
* **Topology Metrics**:
  * **PageRank (Structural Importance)**: Measures the systemic influence of a node based on link connectivity:
    \(PR(u) = \frac{1-d}{N} + d \sum_{v \in B_u} \frac{PR(v)}{L(v)}\)
    where \(d = 0.85\) is the damping factor, and \(B_u\) is the set of nodes pointing to \(u\).
  * **Betweenness Centrality (Flow Bottlenecks)**: Computes how often a node sits on shortest flow paths between other nodes:
    \(g(v) = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}}\)
* **Systemic Criticality**: Normalized scoring combining centrality and downstream node dependency depth. This identifies "fragile single points of failure" that have low failure probabilities but catastrophic downstream reach.

---

### E. Hybrid learned World Model
* **File Location**: [`world_model.py`](file:///d:/Argus-Ai/backend/app/world_model.py)
* **Design**: Simulates the state trajectory \(S_{t+1} = f(S_t, a_t)\) using a hybrid approach combining physical equations (conservation of energy, thermal loads) and machine learning estimates.
* **Operational Rules**:
  * **Thermal Load in Cooling Zones**:
    \(L_{\text{zone}} = \sum_{m \in \text{Zone}} P_m \cdot \eta_{\text{thermal}} + L_{\text{ambient}}\)
  * **Machine Degradation rate**:
    \(H_{t+1} = H_t - (T_t / 100.0) \cdot 0.15 - (V_t / 10.0) \cdot 0.22\) (health score deterioration)
* **Validation Metrics**:
  * **MAE (Mean Absolute Error)**: 1.18°C
  * **RMSE**: 1.54°C
  * **R² (Coefficient of Determination)**: 0.984 (recovers 98.4% of actual temperature variance)

---

### F. Model-Based Reinforcement Learning (PPO)
* **File Locations**: [`gym_env.py`](file:///d:/Argus-Ai/backend/app/ml/gym_env.py) and [`train_rl.py`](file:///d:/Argus-Ai/backend/app/ml/train_rl.py)
* **Environment**: Implements Gymnasium interface wrapping the World Model.
* **Observation Space** (49 Dimensions):
  * 8 Machines \(\times\) 5 features (health, risk, temp, vibration, load) = 40
  * 3 assembly lines \(\times\) 1 feature (capacity) = 3
  * 3 cooling zones \(\times\) 1 feature (utilization) = 3
  * 1 power grid \(\times\) 1 feature (utilization) = 1
  * 1 inventory \(\times\) 1 feature (level) = 1
  * 1 time tracker = 1
* **Action Space** (6 Discrete Actions):
  * `0`: Do Nothing
  * `1`: Prioritize M17 Emergency Overhaul (Repair M17)
  * `2`: Reduce M19 Load by 20%
  * `3`: Shift Batch #482 to Line 2
  * `4`: Boost Cooling Zone 3 (Auxiliary reallocation)
  * `5`: Throttle M17 Load by 15%
* **Multi-Objective Reward Function**:
  \[\text{Reward} = - \left( \frac{\Delta \text{Loss}}{10000} \right) - \left( \frac{\Delta \text{Cost}}{20000} \right) - \text{SafetyPenalties} + 1.5 \cdot \Delta \text{Resilience} + \text{StatusBonus}\]
* **Algorithm**: **PPO** (Proximal Policy Optimization) using Stable-Baselines3, configured with an MLP policy.
* **Training Results (100k Steps)**:
  * Mean episode reward stabilized at **+66.4**.
  * Total policy/value loss dropped to **0.656** with an explained variance of **99.1%**.

---

### G. Multi-Objective Decision Optimizer
* **File Location**: [`optimizer.py`](file:///d:/Argus-Ai/backend/app/optimizer.py)
* **Design**: Explores combination sets of candidate actions. Evaluates feasibility checks (verifying that reallocating cooling doesn't starve other zones), rejects strategies that breach safety bounds, and scores them using weighted objectives:
  \[\text{Fitness} = w_{\text{risk}} \cdot R_{\text{reduction}} + w_{\text{prod}} \cdot P_{\text{preserved}} - w_{\text{cost}} \cdot C_{\text{intervention}}\]

---

## 4. SYSTEM ARCHITECTURE & REPOSITORY LAYOUT

```text
ARGUS/
│
├── .gitignore              # Configured Git exclusions
├── requirements.txt        # Python dependency stack
├── .env.example            # Environment configurations
├── README.md               # Extensive project README (this file)
│
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI HTTP routing & startup loaders
│   │   ├── models.py              # Pydantic state space schemas
│   │   ├── graph_engine.py        # Dependency graph NetworkX centralities
│   │   ├── world_model.py         # State transition rules & rollouts
│   │   ├── cascade_engine.py      # Downstream temporal failure simulation
│   │   ├── ml_engine.py           # Classifier loader & local SHAP explainer
│   │   ├── optimizer.py           # Constraint solver & objective normalizations
│   │   ├── natural_language.py    # English query NLP rule parser
│   │   │
│   │   ├── ml/
│   │   │   ├── train_failure_prediction.py  # XGBoost dataset & classifier trainer
│   │   │   ├── gym_env.py                  # Gymnasium environment wrapper
│   │   │   ├── train_rl.py                  # Stable-Baselines3 PPO training
│   │   │   └── evaluate_rl.py               # Evaluates PPO vs Baselines
│   │   │
│   │   └── data/                  # Persisted serialized model artifacts
│   │       ├── failure_model.pkl
│   │       ├── failure_metrics.json
│   │       ├── argus_ppo_policy.zip
│   │       ├── rl_training_metrics.json
│   │       └── policy_comparison.json
│   │
│   └── tests/
│       └── test_backend.py        # Pytest automated test suite
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js          # Tailwind v4 configuration
    ├── index.html
    │
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx                # App state, layout router & chat triggers
    │   ├── types/
    │   │   └── index.ts           # Shared TypeScript interfaces
    │   ├── services/
    │   │   └── api.ts             # Axios HTTP endpoints bindings
    │   ├── components/
    │   │   ├── Layout.tsx         # Sidebar navigation & status headers
    │   │   └── DigitalTwin/
    │   │       └── GraphView.tsx  # React Flow interactive network map
    │   └── pages/
    │       ├── CommandCenter.tsx  # KPI indicators & syslog log terminal
    │       ├── DigitalTwin.tsx    # Inspector panel & Time Machine scrubber
    │       ├── LiveTelemetry.tsx  # Real-time sensors & degradation trigger
    │       ├── CascadeLab.tsx     # Failure target inputs & timeline outputs
    │       ├── WorldModel.tsx     # Recharts branching trajectory plot
    │       ├── InterventionLab.tsx# Objective weight sliders & strategies table
    │       ├── Resilience.tsx     # Vulnerability map & investment budget planner
    │       ├── IncidentReplay.tsx # media-style player control panels
    │       └── ModelIntelligence.tsx # XGBoost, World Model, & PPO reward curves
```

---

## 5. INSTALLATION & SETUP

Ensure you have Python 3.10+ and Node.js v20+ installed.

### A. Python Backend Setup
1. Clone the project and navigate to the directory:
   ```bash
   cd D:\Argus-Ai
   ```
2. Activate your virtual environment and install all dependencies:
   ```bash
   # If you are using D:/Computer_Vision/venv
   & "D:\Computer_Vision\venv\Scripts\activate"
   pip install -r requirements.txt
   ```
3. Run the automated test suite to verify tests pass:
   ```bash
   python -m pytest backend/tests/
   ```
4. Start the FastAPI uvicorn server:
   ```bash
   python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *(Note: The server will automatically load the pre-trained failure models and PPO policy files at startup. If they are missing, it will rebuild and train them automatically).*

### B. React Frontend Setup
1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd D:\Argus-Ai\frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Compile a production build to check compile-time warnings:
   ```bash
   npm run build
   ```
4. Launch the local Vite development server:
   ```bash
   npm run dev
   ```
5. Open the local address in your web browser (usually `http://localhost:5173`).

---

## 6. HACKATHON LIVE DEMO SCRIPT (3 MINUTES)

When presenting ARGUS to the judges, follow this step-by-step walkthrough:

1. **Nominal State Audit (Command Center)**:
   * Point out the plant KPIs: Health is nominal (91%), Cascade Risk is secure (18%), and Resilience is high (78/100).
   * Review the **Syslog Terminal** at the bottom showing normal initializations.
   * Point out **M17** on the warning dashboard—sensor values are slightly elevated, but the plant remains stable.
2. **Early Prediction & Explainability (Digital Twin)**:
   * Click **Digital Twin** tab, then select the **M17 (Line 3 CNC Precision Unit)** node.
   * Explain the **ML SHAP explanation** display: The model predicts a 92% failure probability, highlighting that vibration trend and temperature wear are the primary contributing factors.
3. **Simulate Cascading Failure (Cascade Lab)**:
   * Click **Simulate M17 Failure** in the Command Center (or input severity in Cascade Lab).
   * Watch the network map lines pulse orange and red as the failure propagates.
   * Review the **Failure Propagation Timeline**:
     * **T+0m**: M17 bearings lock up.
     * **T+4m**: Line 3 throughput drops to 30%.
     * **T+11m**: Laser Cutter M19 experiences overload spike (load rises past 110%).
     * **T+17m**: Cooling Zone 3 utilization exceeds 85%.
     * **T+34m**: Batch #482 production delayed.
     * **T+144m**: Warehouse inventory drops below safety buffer, triggering a **₹18.4 Lakh** contract delay penalty.
4. **World Model Branching Futures (World Model)**:
   * Open the **World Model** tab. Explain that ARGUS has simulated branching futures (Future A: Unmitigated collapse vs Future B: Contained recovery). Show the dual-axis chart comparing predicted temperatures and losses.
5. **PPO Intervention Search (Interventions)**:
   * Open the **Interventions** tab. Let the PPO RL Agent choose the best policy.
   * Point out the recommended strategy: **Repair M17 + Shift Batch #482 to Line 2 + Throttle M19 load by 20%**. Explain that PPO found this combination in under 1 millisecond.
6. **Confirm & Prevent (Command Center)**:
   * Click **Apply Containment Strategy** (Human-in-the-Loop Override).
   * Observe the plant state recover: M17 is repaired, the batch is completed on Line 2, and the total financial loss is capped at only **₹49,000**, saving **₹17.9 Lakhs** in late delivery penalties.
