# 🧭 BudgetTrail — Orienteering Problem Solver & Route Reward Maximizer

> **Design and Analysis of Algorithms (DAA) CIA Project**  
> A spatial interactive single-page application for the **Orienteering Problem (Selective TSP with Time Budget)** built with React 18, Vite, Framer Motion, GSAP, Lenis, and Chart.js.

---

## 🌟 1. Project Overview

In many real-world expeditions, drone surveys, and tourist itineraries, a traveler or autonomous agent **cannot visit all available locations** due to strict time, fuel, or battery limits.

The **Orienteering Problem (OP)** models this scenario:
* You start at a central **Depot ($v_0$)**.
* There are $n$ candidate destinations $V = \{v_1, v_2, \dots, v_n\}$, each with:
  1. A geographic coordinate $(x_i, y_i)$.
  2. A **Reward $r_i \in [1, 10]$** collected upon visiting.
  3. A **Stay Time $s_i$ (minutes)** required at the location.
* A total travel **Time Budget $B$** is given.
* **Objective:** Select a subset of destinations and a visiting sequence to **MAXIMIZE total collected reward** such that $(\text{Travel Time} + \text{Stay Time} + \text{Return Time}) \le B$.

---

## 🚀 2. Quick Start & Installation

```bash
# 1. Clone the repository
git clone https://github.com/shariya-ai/daa.git
cd daa

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

---

## 🧠 3. Algorithms Implemented

### 🟢 1. Bitmask Dynamic Programming ($\Theta(n^2 \cdot 2^n)$) — *Exact Optimal Solver*
* **State Definition:** $\text{DP}[\text{mask}][\text{last}]$ = minimum time required to visit the subset represented by `mask`, ending at destination `last`.
* **Recurrence Relation:**
  $$\text{DP}[S \cup \{v\}][v] = \min_{u \in S} \Big( \text{DP}[S][u] + \text{travel\_time}(u, v) + s_v \Big)$$
* **Optimal Reward Selection:**
  $$\text{MaxReward} = \max_{\text{mask}} \sum_{i \in \text{mask}} r_i \quad \text{s.t.} \quad \min_{u \in \text{mask}} (\text{DP}[\text{mask}][u] + \text{return}(u)) \le B$$
* **Space Complexity:** $\Theta(n \cdot 2^n)$ using contiguous `Float64Array` and predecessor table for $O(n)$ path reconstruction. Capped at $n \le 17$.

### 🔵 2. Backtracking with Branch & Bound ($O(n!)$) — *Exact Search with Pruning*
* Recursive Depth-First Search with two aggressive pruning rules:
  1. **Feasibility Pruning:** Prune if $\text{CurrentTime} + \text{travel}(u, v) + s_v + \text{return}(v) > B$.
  2. **Upper-Bound Pruning:** Prune if $\text{CurrentReward} + \sum_{k \in \text{Unvisited}} r_k \le \text{BestRewardFoundSoFar}$.
* Can be toggled on/off to visualize the exponential node explosion of naive backtracking.

### 🟡 3. Greedy Heuristic ($O(n^2)$) — *Fast Ratio Heuristic*
* At each step, selects the feasible unvisited destination maximizing the ratio:
  $$\text{Score}(v) = \frac{\text{Reward}(v)}{\text{TravelTime}(\text{curr}, v) + s_v}$$
* Vulnerable to "Greedy Traps" where it consumes budget on low-reward local clusters, resulting in **10% to 40% suboptimality** compared to DP.

---

## 🎯 4. The 5 Preset Test Scenarios

1. **The Scenic Tour Trap (Greedy Trap):**
   * A nearby cluster of 4 low-reward cafes ($R=2$, Stay=$12\text{m}$) vs distant high-value summits ($R=10, 9$). Greedy scores only 8 points; DP scores **28 points (+250% higher!)**.
2. **Strict Time Crunch:**
   * Razor-thin 65-minute budget testing return-to-depot closing constraints.
3. **Metropolis Sightseeing Marathon ($n=12$):**
   * Diverse spread of 12 landmarks across 4 city quadrants with varied stay times.
4. **Step-Through Mini Demo ($n=4$):**
   * Configured specifically for the 16-row Bitmask DP Matrix debugger.
5. **Drone Survey Relay ($n=14$):**
   * Battery-limited UAV autonomous sensor node harvesting.

---

## 🧪 5. In-App Self-Check Verification Suite

Click the **"Self-Check (50)"** button in the navbar to run 50 randomized small instances ($n \in [3, 7]$) in real time. The suite automatically asserts that Bitmask DP and Branch & Bound output **identical global maximum rewards**, proving mathematical correctness.

---

## 📊 6. Complexity Summary

| Algorithm | Time Complexity | Space Complexity | Optimality Guarantee | Practical Scale |
|---|---|---|---|---|
| **Bitmask DP** | $\mathbf{\Theta(n^2 \cdot 2^n)}$ | $\mathbf{\Theta(n \cdot 2^n)}$ | ✅ **100% Exact Global Maximum** | $n \le 17$ (Instant) |
| **Branch & Bound** | $O(n!)$ worst | $O(n)$ call stack | ✅ **100% Exact Global Maximum** | $n \le 12$ |
| **Greedy Ratio** | $O(n^2)$ | $O(n)$ | ❌ Suboptimal ($10\text{--}40\%$ gap) | $n \le 10,000+$ |
