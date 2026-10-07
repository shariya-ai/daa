# 🗺️ BudgetTrail — Comprehensive Study & Viva Voce Guide
> **Subject**: Design and Analysis of Algorithms (DAA)  
> **Problem**: The Orienteering Problem (Selective Traveling Salesperson Problem with Time/Budget Constraints)  
> **Repository**: [https://github.com/shariya-ai/daa.git](https://github.com/shariya-ai/daa.git)

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Algorithmic Paradigms Breakdown](#2-algorithmic-paradigms-breakdown)
3. [Mathematical Formulations & Recurrence Relations](#3-mathematical-formulations--recurrence-relations)
4. [Asymptotic Time & Space Complexity Derivations](#4-asymptotic-time--space-complexity-derivations)
5. [Comparative Analysis: Why Bitmask DP is Best](#5-comparative-analysis-why-bitmask-dp-is-best)
6. [Real-World Applications](#6-real-world-applications)
7. [Step-by-Step Teacher Presentation Walkthrough](#7-step-by-step-teacher-presentation-walkthrough)
8. [Comprehensive Viva Voce Questions & Model Answers](#8-comprehensive-viva-voce-questions--model-answers)

---

## 1. Executive Summary & Problem Statement

### 🎯 What is BudgetTrail?
**BudgetTrail** is an interactive spatial algorithm visualization and analysis platform for solving the **Orienteering Problem (OP)** (also known as the *Selective Traveling Salesperson Problem* or *Bank Robber Problem*).

### 🔍 The Core Problem Statement
In classical TSP, an agent must visit **every single city** exactly once while minimizing the total distance traveled.

In the **Orienteering Problem**, visiting all destinations is **impossible** because the agent has a finite hard resource limit (time budget $B$, battery capacity, or fuel ceiling).

#### Problem Parameters:
- **Depot ($v_0$)**: Starting location $(x_0, y_0)$ (and optional return target).
- **Set of Locations ($V = \{v_1, v_2, \dots, v_n\}$)**: Each place $i$ has coordinates $(x_i, y_i)$, an intrinsic reward value $r_i \in [1, 10]$, and a mandatory stay/service duration $s_i \ge 0$.
- **Travel Cost Metric**: Euclidean distance divided by vehicle speed $t(u, v) = \frac{\sqrt{(x_u - x_v)^2 + (y_u - y_v)^2}}{\text{speed}}$.
- **Total Time Budget ($B$)**: Maximum permissible time for the entire journey.
- **Goal**: Select a subset of vertices $S \subseteq V$ and determine their sequence order $P = (p_1, p_2, \dots, p_k)$ to **MAXIMIZE total collected reward** without exceeding budget $B$:
$$\text{Maximize } \sum_{i=1}^{k} r_{p_i} \quad \text{subject to} \quad \text{TotalTime}(P) \le B$$

---

## 2. Algorithmic Paradigms Breakdown

BudgetTrail implements and benchmarks **4 distinct algorithmic paradigms**:

### 1. Bitmask Dynamic Programming (Held-Karp Extension) — *Exact & Optimal*
- **Concept**: Represents visited subsets as binary integers (bitmasks from $0$ to $2^n - 1$).
- **State Definition**: $\text{DP}[S][u]$ = The **minimum time** required to start at depot $v_0$, visit all places in subset $S$, and end at location $u$.
- **Why it works**: The subproblem exhibits **Optimal Substructure** and **Overlapping Subproblems**. To find the minimum time to reach state $(S \cup \{v\}, v)$, we take the minimum over all possible previous nodes $u \in S$.
- **Guarantee**: Mathematically guaranteed to find the **global maximum reward**.

### 2. Branch & Bound (DFS with Pruning) — *Exact & Optimal*
- **Concept**: Traverses a state-space search tree of permutations while tracking the current best reward (`bestReward`).
- **Pruning Criteria (Bounding)**:
  1. **Budget Violation Pruning**: If current accumulated time + direct return time $> B$, prune the branch immediately.
  2. **Upper Bound Pruning**: If `currentReward + remainingPotentialReward` $\le$ `bestReward`, backtrack without exploring deeper.
- **Guarantee**: Finds exact optimal solution, but worst-case time is factorial $O(n!)$.

### 3. Greedy Heuristic (Efficiency Ratio) — *Fast Approximation*
- **Concept**: At each step, evaluates all unvisited nodes and greedily jumps to the node with the highest **Reward-to-Time Efficiency Ratio**:
$$\text{Ratio}(u) = \frac{r_u}{\text{travelTime}(\text{current}, u) + s_u}$$
- **Time Complexity**: $O(n^2)$.
- **Limitation**: Suffers from "myopic decision traps" — can get lured into low-value clusters and run out of budget before reaching massive reward hubs.

### 4. 2-Opt Local Search Heuristic — *Iterative Improvement*
- **Concept**: Starts from an initial sequence (e.g., Greedy) and repeatedly performs pairwise edge swaps (reversing sub-paths) to eliminate path crossings and reduce total travel time.
- **Benefit**: Frees up extra time budget, allowing additional high-reward nodes to be inserted.

---

## 3. Mathematical Formulations & Recurrence Relations

### 📐 Bitmask DP Recurrence
For a subset $S \subseteq \{1, 2, \dots, n\}$ represented as bitmask integer $S = \sum_{v \in S} 2^v$:

$$\text{DP}[S \cup \{v\}][v] = \min_{u \in S} \Big( \text{DP}[S][u] + t(u, v) + s_v \Big)$$

#### Base Case (Direct departure from Depot $v_0$):
$$\text{DP}[\{v\}][v] = t(v_0, v) + s_v \quad \forall v \in \{1, \dots, n\}$$

#### Optimal Solution Extraction:
$$\text{Best Reward} = \max_{S \subseteq V} \left\{ \sum_{v \in S} r_v \ \Bigg|\ \min_{u \in S} \big( \text{DP}[S][u] + (t(u, v_0) \text{ if return else } 0) \big) \le B \right\}$$

---

## 4. Asymptotic Time & Space Complexity Derivations

### ⏱️ Dynamic Programming Derivation
1. **Number of States**: There are $2^n$ possible subsets $S$, and for each subset, $n$ possible ending nodes $u$.
   $$\text{Total States} = n \cdot 2^n$$
2. **State Transition Work**: To compute each state $\text{DP}[S \cup \{v\}][v]$, we check all $u \in S$, taking $O(n)$ steps.
3. **Total Time Complexity**:
   $$T(n) = \sum_{k=1}^{n} \binom{n}{k} \cdot k \cdot (n - k) = \Theta(n^2 \cdot 2^n)$$
4. **Space Complexity**: The DP memoization table requires storing $2^n \times n$ floating-point values:
   $$S(n) = \Theta(n \cdot 2^n)$$

### 📊 Comparative Complexity Summary Table

| Algorithm | Paradigm | Time Complexity | Space Complexity | Optimality Guarantee |
| :--- | :--- | :--- | :--- | :--- |
| **Bitmask DP** | Dynamic Programming | $\Theta(n^2 \cdot 2^n)$ | $\Theta(n \cdot 2^n)$ | **100% Guaranteed Global Maximum** |
| **Branch & Bound** | Backtracking + Bounding | $O(n \cdot n!)$ worst / $O(b^d)$ avg | $O(n)$ | **100% Guaranteed Global Maximum** |
| **Greedy Heuristic** | Greedy Selection | $O(n^2)$ | $O(n)$ | Sub-optimal (Prone to local traps) |
| **2-Opt Local Search** | Local Search / Swap | $O(k \cdot n^2)$ | $O(n)$ | Sub-optimal (Refines tour layout) |

---

## 5. Comparative Analysis: Why Bitmask DP is Best

### ❌ Why Not Pure Greedy?
- Greedy makes local choices based on immediate reward density $\frac{r_i}{\Delta t_i}$.
- **The "Scenic Trap" Scenario**: In Preset Scenario #1 (*The Scenic Tour Trap*), a cluster of small reward nodes ($r=2$) is close to the start. Greedy devours all small nodes, exhausts the 135 min budget, and fails to reach two massive reward nodes ($r=10$) located 20 units away.
- **Result**: Greedy collects **8 points**, whereas Bitmask DP computes the global trade-off and collects **20 points** (+150% improvement!).

### ❌ Why Not Pure Backtracking?
- Pure brute-force generates $n!$ permutations. For $n=15$:
  - $15! \approx 1.307 \times 10^{12}$ operations (takes **several hours**).
  - DP takes $15^2 \cdot 2^{15} = 225 \cdot 32,768 \approx 7.37 \times 10^6$ operations (runs in **under 15 milliseconds**).
- Dynamic Programming achieves an **exponential speedup** by caching subproblem solutions so that the same subset is never recalculated.

---

## 6. Real-World Applications

1. **Autonomous Drone & UAV Surveillance**: Drones with limited 30-minute LiPo battery life must prioritize high-threat reconnaissance waypoints.
2. **Tourist City Sightseeing Planners**: Travelers with a 4-hour layover selecting the highest-rated museums and monuments within subway constraints.
3. **Planetary Rover Exploration (NASA/ESA)**: Mars rovers (Curiosity/Perseverance) allocate finite solar energy to sample geological sites before nightfall.
4. **Disaster Relief & Supply Airdrops**: Cargo aircraft delivering urgent medical kits to isolated flood zones before storm landfall.

---

## 7. Step-by-Step Teacher Presentation Walkthrough

Follow this structured 5-minute presentation script during your project evaluation:

### Step 1: Introduce the Problem Statement (1 min)
- *"Good morning Professor. Today I am presenting **BudgetTrail**, an algorithm optimization platform for the **Orienteering Problem**."*
- Open the **Problem Story** tab. Explain: *"Unlike standard TSP where you must visit all cities, here we have a hard time budget $B$. We must decide which places to visit and in what sequence to maximize total reward."*

### Step 2: Demonstrate the "Scenic Trap" on Playground Canvas (1.5 min)
- Go to the **Playground** tab.
- Click **Preset #1: The Scenic Tour Trap**.
- Select **Greedy Heuristic** and click **Play Route**. Show the trail scout drone visiting the small nearby cafes. Point out: *"Greedy got trapped and collected only 8 reward points."*
- Switch solver to **Bitmask DP (Exact Optimal)**. Point out: *"DP ignores the low-value distractions, heads directly to the high-reward landmarks, and collects 20 points within the exact same 135-minute budget."*

### Step 3: Open the DP Bitmask Step-Through Matrix (1 min)
- Click the **DP Bitmask Stepper** button in the controls panel.
- Step through the matrix. Explain: *"Each row represents a binary bitmask representing visited subsets. The cells store the minimum time to reach that state. This avoids recomputing the $(n-1)!$ permutations."*

### Step 4: Show Live Benchmark Charts (1 min)
- Switch to the **Benchmark** tab and click **Run Multi-Scenario Stress Test**.
- Show the interactive Chart.js graphs displaying the exponential time growth of Branch & Bound vs. the predictable curve of Bitmask DP.

### Step 5: Highlight Self-Check Test Suite (30 sec)
- Click the **Self-Check (50)** button in the top navbar.
- Show the **50 Automated Unit & Stress Tests** passing with 100% green checkmarks.

---

## 8. Comprehensive Viva Voce Questions & Model Answers

### Q1: What is the formal definition of the Orienteering Problem (OP)?
> **Answer**: The Orienteering Problem is an NP-hard combinatorial optimization problem where given a set of nodes with rewards, travel costs, service times, and a budget $B$, we seek a path starting from depot $v_0$ that maximizes total reward while total duration (travel time + stay time) does not exceed $B$.

### Q2: Is the Orienteering Problem NP-Hard? Prove it.
> **Answer**: Yes. If we set all node rewards $r_i = 1$ and set the budget $B$ equal to the length of the optimal Traveling Salesperson tour, solving OP solves the Traveling Salesperson Problem (TSP) decision problem. Since TSP is NP-hard, OP is also **NP-hard**.

### Q3: Why is Bitmask DP faster than Backtracking?
> **Answer**: Backtracking evaluates orders independently, leading to $O(n!)$ time complexity. Bitmask DP recognizes that the order in which past nodes were visited does not matter—only the **set of visited nodes** and the **current ending node** matter. Memoizing this collapses the search space from $O(n!)$ to $\Theta(n^2 \cdot 2^n)$.

### Q4: How is a bitmask used in this algorithm?
> **Answer**: A bitmask is an integer where the $i$-th bit is $1$ if node $i$ is included in the visited subset, and $0$ if not. For example, `mask = 13` (binary `1101`₂) represents the subset containing places $\{v_0, v_2, v_3\}$. We use fast bitwise operations:
> - Test inclusion: `(mask & (1 << i)) !== 0`
> - Add node: `nextMask = mask | (1 << i)`

### Q5: What is the purpose of the 2-Opt algorithm in this project?
> **Answer**: 2-Opt is a local search heuristic that iteratively reverses sub-paths $(u, v)$ to eliminate crossing edges. By shortening the travel path, 2-Opt reduces total travel time, which often creates surplus budget to insert additional unvisited high-reward locations.

### Q6: What bounding functions are used in Branch & Bound?
> **Answer**: Two bounding criteria are used:
> 1. **Feasibility Bound**: $\text{CurrentTime} + \text{ReturnTime} \le B$. If exceeded, prune immediately.
> 2. **Optimality Bound**: $\text{CurrentReward} + \sum_{v \notin \text{Visited}} r_v \le \text{BestKnownReward}$. If the theoretical maximum possible reward cannot beat our existing best solution, the subtree is pruned.

### Q7: What is the space complexity of your DP implementation?
> **Answer**: The state table is sized $(2^n \times n)$ floating-point entries. For $n=15$, this is $32,768 \times 15 \approx 491,520$ numbers, which consumes less than $4 \text{ MB}$ of RAM.

---
*Created for DAA CIA Evaluation • BudgetTrail Orienteering System*
