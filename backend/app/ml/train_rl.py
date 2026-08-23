import os
import json
from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import BaseCallback
from backend.app.ml.gym_env import ARGUSIndustrialEnv

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
POLICY_PATH = os.path.join(DATA_DIR, "argus_ppo_policy.zip")
METRICS_PATH = os.path.join(DATA_DIR, "rl_training_metrics.json")

class RewardLoggerCallback(BaseCallback):
    """
    Custom callback to log average rewards and episode statistics during PPO training.
    """
    def __init__(self, verbose=0):
        super(RewardLoggerCallback, self).__init__(verbose)
        self.episode_rewards = []
        self.episode_lengths = []
        self.current_reward = 0.0
        self.current_length = 0

    def _on_step(self) -> bool:
        # Accumulate reward and steps for the current episode
        self.current_reward += self.locals["rewards"][0]
        self.current_length += 1
        
        # If the environment signals 'done' (episode terminated)
        if self.locals["dones"][0]:
            self.episode_rewards.append(float(self.current_reward))
            self.episode_lengths.append(self.current_length)
            
            # Reset trackers
            self.current_reward = 0.0
            self.current_length = 0
            
        return True

def train_rl_policy():
    """
    Trains the PPO agent inside the Gymnasium World Model environment.
    Saves policy and logged rewards metrics.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    
    print("Initializing Gym environment and PPO agent...")
    env = ARGUSIndustrialEnv()
    
    # Configure PPO hyperparameters tuned for quick learning in discrete actions
    model = PPO(
        policy="MlpPolicy",
        env=env,
        learning_rate=0.0003,
        n_steps=128,          # Update policy every 128 steps
        batch_size=32,
        n_epochs=4,
        gamma=0.99,
        seed=42,
        verbose=1
    )
    
    # Train PPO
    callback = RewardLoggerCallback()
    total_timesteps = 100000  # Trains in ~35-45 seconds.
    print(f"Training PPO policy for {total_timesteps} timesteps...")
    model.learn(total_timesteps=total_timesteps, callback=callback)
    
    # Save the trained policy zip
    model.save(POLICY_PATH)
    print(f"Policy saved to {POLICY_PATH}")
    
    # Compile and save training metrics
    # To reduce the size and render smooth charts, we group rewards into rolling averages of 10 episodes
    raw_rewards = callback.episode_rewards
    smoothed_rewards = []
    window = 10
    
    for i in range(0, len(raw_rewards), window):
        chunk = raw_rewards[i : i + window]
        avg_r = sum(chunk) / len(chunk)
        smoothed_rewards.append({
            "episode": i + len(chunk),
            "reward": round(avg_r, 2)
        })
        
    metrics = {
        "raw_rewards": raw_rewards,
        "smoothed_rewards": smoothed_rewards,
        "total_episodes": len(raw_rewards),
        "mean_final_reward": float(np.mean(raw_rewards[-50:])) if len(raw_rewards) >= 50 else 0.0
    }
    
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"RL metrics saved to {METRICS_PATH}")
    
    return metrics

import numpy as np

if __name__ == "__main__":
    train_rl_policy()
