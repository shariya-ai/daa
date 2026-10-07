/**
 * Theory, mathematical formulations, and complexity derivations for the Orienteering Problem
 */

export const THEORY_DATA = {
  problemDefinition: {
    title: 'Formal Problem Formulation (Orienteering Problem / OP)',
    badge: 'NP-Hard Combinatorial Optimization',
    description: `The Orienteering Problem (also known as the Selective Traveling Salesperson Problem or Maximum Collection Problem) models routing scenarios where the traveler cannot visit all available locations due to a strict budget constraint.

Given:
• A graph G = (V, E) with a start depot v₀ and n candidate places V = {v₁, v₂, ..., vₙ}
• Each place vᵢ has a positive reward rᵢ > 0 and stay duration sᵢ ≥ 0
• Each directed edge (u, v) has a travel time cost t(u, v) = dist(u, v) / speed
• A maximum time budget B > 0
• A Boolean flag ReturnToStart indicating whether the tour must close at v₀

Objective:
Find a subset of places S ⊆ V and a visiting permutation P = (p₁, p₂, ..., pₖ) such that:
  Maximize  ∑ [i=1 to k] r_{pᵢ}
  Subject to:
    t(v₀, p₁) + s_{p₁} + ∑ [i=2 to k] (t(p_{i-1}, pᵢ) + s_{pᵢ}) + [if ReturnToStart then t(pₖ, v₀) else 0] ≤ B`
  },

  differenceFromClassicProblems: [
    {
      name: 'Traveling Salesperson Problem (TSP)',
      nature: 'Pure Ordering / All-Node Tour',
      objective: 'Minimize total travel distance / time.',
      constraint: 'Must visit ALL n nodes exactly once.',
      contrast: 'In OP, visiting all nodes is impossible due to budget B. OP must choose WHICH subset of nodes to visit AND their order.'
    },
    {
      name: '0/1 Knapsack Problem',
      nature: 'Pure Subset Selection (No Geometry)',
      objective: 'Maximize sum of item values.',
      constraint: 'Total weight of items ≤ capacity W.',
      contrast: 'In Knapsack, the cost of adding an item is independent of other items. In OP, the travel cost depends on the sequence and spatial coordinates of previous visits.'
    },
    {
      name: 'The Orienteering Problem (OP)',
      nature: 'Hybrid: Knapsack Selection + TSP Ordering',
      objective: 'Maximize total reward of visited subset.',
      constraint: 'Total sequence travel time + stay times ≤ budget B.',
      contrast: 'OP generalizes both TSP (when B = ∞) and Knapsack (when spatial distance between all points is constant).'
    }
  ],

  complexityDerivations: {
    time: {
      formula: 'Θ(n² · 2ⁿ)',
      steps: [
        '1. State Space: A subproblem is uniquely identified by (S, u), where S is a non-empty subset of places (represented as a bitmask 1 ≤ mask < 2ⁿ) and u ∈ S is the last visited place. Total states = ∑ [k=1 to n] C(n, k) · k = n · 2ⁿ⁻¹ = Θ(n · 2ⁿ).',
        '2. Transitions: From state (S, u), we can transition to any unvisited place v ∉ S. There are (n - |S|) choices for v.',
        '3. Total Transitions: Summing over all subset sizes k: ∑ [k=1 to n] C(n, k) · k · (n - k) = n(n - 1) · 2ⁿ⁻² = Θ(n² · 2ⁿ).',
        '4. Work per Transition: Calculating travel time, adding stay time, and comparing min float values is O(1).',
        '5. Post-Processing Scan: Scanning all 2ⁿ masks to pick the highest reward within budget takes Θ(n · 2ⁿ).',
        '6. Total Time Complexity: Θ(n² · 2ⁿ) deterministic operations.'
      ]
    },
    space: {
      formula: 'Θ(n · 2ⁿ)',
      steps: [
        '1. DP Time Table: dp[2ⁿ][n] stores the minimum time to reach subset mask ending at place last. Using 64-bit IEEE floats (Float64Array), size = 2ⁿ · n · 8 bytes.',
        '2. Predecessor Parent Table: parent[2ⁿ][n] stores the index of the preceding node u for path reconstruction. Using 16-bit integers (Int16Array), size = 2ⁿ · n · 2 bytes.',
        '3. Subset Reward Array: rewardOfMask[2ⁿ] stores the precalculated reward sum for each bitmask (2ⁿ · 8 bytes).',
        '4. Total Memory: 2ⁿ · (10n + 8) bytes. For n = 10: ~108 KB; for n = 16: ~10.4 MB; for n = 17: ~22.8 MB (fits instantly in browser RAM).',
        '5. Total Space Complexity: Θ(n · 2ⁿ).'
      ]
    }
  },

  pseudocode: {
    dp: `// ================================================================
// ALGORITHM 1: Bitmask Dynamic Programming for Orienteering Problem
// Time: Θ(n² · 2ⁿ) | Space: Θ(n · 2ⁿ) | Optimality: 100% Guaranteed
// ================================================================

function SolveOrienteeringDP(depot, places, speed, budget, returnToStart):
  n = places.length
  numStates = 1 << n  // 2^n possible subsets
  
  // Step 1: Initialize DP and Parent tables
  dp = Array(numStates, n).fill(Infinity)
  parent = Array(numStates, n).fill(-1)
  
  // Step 2: Base Cases (Travel from depot to first place i)
  for i = 0 to n - 1:
    mask = 1 << i
    dp[mask][i] = travel_time(depot, places[i], speed) + places[i].stayTime
    parent[mask][i] = -1 // depot
  
  // Step 3: Populate Subproblems by Subset Mask
  for mask = 1 to numStates - 1:
    for u = 0 to n - 1 (where u is in mask):
      if dp[mask][u] == Infinity or dp[mask][u] > budget: continue
      
      for v = 0 to n - 1 (where v is NOT in mask):
        nextMask = mask | (1 << v)
        travel = travel_time(places[u], places[v], speed)
        newTime = dp[mask][u] + travel + places[v].stayTime
        
        if newTime < dp[nextMask][v]:
          dp[nextMask][v] = newTime
          parent[nextMask][v] = u
  
  // Step 4: Scan all masks to pick the subset with MAX reward within budget
  bestReward = 0
  bestTime = Infinity
  bestMask = 0
  bestLast = -1
  
  for mask = 1 to numStates - 1:
    maskReward = sum of places[i].reward for i in mask
    for u = 0 to n - 1 (where u is in mask):
      endTime = dp[mask][u] + (returnToStart ? travel_time(places[u], depot) : 0)
      if endTime <= budget:
        if maskReward > bestReward or (maskReward == bestReward and endTime < bestTime):
          bestReward = maskReward
          bestTime = endTime
          bestMask = mask
          bestLast = u
  
  // Step 5: Reconstruct optimal route using parent table
  optimalOrder = BacktrackParents(parent, bestMask, bestLast)
  return optimalOrder, bestReward, bestTime`,

    bb: `// ================================================================
// ALGORITHM 2: Backtracking with Branch & Bound Pruning
// Time: O(n!) Worst-Case | Space: O(n) Call Stack | Optimality: 100%
// ================================================================

function SolveBranchAndBound(depot, places, speed, budget, returnToStart, enablePruning):
  bestReward = 0
  bestTime = Infinity
  bestOrder = []
  
  // Seed upper bound using Greedy for rapid early pruning
  if enablePruning:
    bestReward, bestOrder = SolveGreedy(depot, places, speed, budget)
  
  function Search(lastNode, currentTime, currentReward, remainingPotentialReward):
    // Check if current route is a valid complete candidate
    returnTime = returnToStart ? travel_time(places[lastNode], depot) : 0
    totalTime = currentTime + returnTime
    
    if totalTime <= budget:
      if currentReward > bestReward:
        bestReward = currentReward
        bestTime = totalTime
        bestOrder = currentPath.clone()
    
    for each unvisited place v:
      travel = travel_time(lastNode, places[v])
      nextTime = currentTime + travel + places[v].stayTime
      returnFromNext = returnToStart ? travel_time(places[v], depot) : 0
      
      // PRUNING RULE 1: Feasibility Check
      if enablePruning and (nextTime + returnFromNext > budget):
        continue // Exceeds budget
      
      // PRUNING RULE 2: Optimality Upper Bound Check
      if enablePruning and (currentReward + remainingPotentialReward <= bestReward):
        return // Cannot possibly beat the best known solution
      
      visited[v] = true
      currentPath.push(v)
      Search(v, nextTime, currentReward + places[v].reward, remainingPotentialReward - places[v].reward)
      currentPath.pop()
      visited[v] = false
  
  Search(depot, currentTime=0, currentReward=0, remainingPotentialReward=sum_all_rewards)
  return bestOrder, bestReward, bestTime`,

    greedy: `// ================================================================
// ALGORITHM 3: Greedy Priority Heuristic (Reward / Cost Ratio)
// Time: O(n²) | Space: O(n) | Optimality: Heuristic Suboptimal (~10-40% gap)
// ================================================================

function SolveGreedy(depot, places, speed, budget, returnToStart):
  currentPos = depot
  currentTime = 0
  unvisited = Set(0, 1, ..., n - 1)
  order = []
  
  while unvisited is not empty:
    bestIdx = -1
    bestRatio = -Infinity
    
    for each candidate v in unvisited:
      travel = travel_time(currentPos, places[v], speed)
      cost = travel + places[v].stayTime
      returnTravel = returnToStart ? travel_time(places[v], depot, speed) : 0
      
      // Feasibility check
      if currentTime + cost + returnTravel <= budget:
        ratio = places[v].reward / max(cost, 0.001)
        if ratio > bestRatio:
          bestRatio = ratio
          bestIdx = v
    
    if bestIdx == -1:
      break // No more candidate places fit within the remaining budget
    
    order.push(bestIdx)
    unvisited.remove(bestIdx)
    travel = travel_time(currentPos, places[bestIdx], speed)
    currentTime += travel + places[bestIdx].stayTime
    currentPos = places[bestIdx]
  
  return order, CalculateReward(order), currentTime`
  }
};
