/**
 * BudgetTrail - Orienteering Problem Solvers
 * 
 * Problem: Selective TSP with Time Budget
 * Given a depot (start/end), n places with rewards & stay times, travel speed, and a total time budget:
 * Find a visiting sequence that MAXIMIZES total reward such that (travel time + stay time) <= budget.
 */

export class OrienteeringSolvers {
  /**
   * Euclidean distance between two points
   */
  static distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.hypot(dx, dy);
  }

  /**
   * Travel time between two points given vehicle speed
   */
  static travelTime(p1, p2, speed) {
    const d = OrienteeringSolvers.distance(p1, p2);
    return speed > 0 ? d / speed : 0;
  }

  /**
   * Build detailed timeline of an ordered route
   */
  static evaluateRoute(depot, places, order, speed, returnToStart = true) {
    const n = order.length;
    let currentTime = 0;
    let totalReward = 0;
    let totalTravelTime = 0;
    let totalStayTime = 0;
    let prev = depot;
    const arrivalTimes = [];

    for (let i = 0; i < n; i++) {
      const idx = order[i];
      const place = places[idx];
      const travel = OrienteeringSolvers.travelTime(prev, place, speed);
      const arrival = currentTime + travel;
      const departure = arrival + place.stayTime;

      arrivalTimes.push({
        step: i + 1,
        placeIndex: idx,
        place,
        travelFromPrev: travel,
        arrivalTime: arrival,
        stayTime: place.stayTime,
        departureTime: departure,
        rewardCollected: place.reward,
        cumulativeReward: totalReward + place.reward
      });

      totalReward += place.reward;
      totalTravelTime += travel;
      totalStayTime += place.stayTime;
      currentTime = departure;
      prev = place;
    }

    let returnTravelTime = 0;
    if (returnToStart && n > 0) {
      returnTravelTime = OrienteeringSolvers.travelTime(prev, depot, speed);
      currentTime += returnTravelTime;
      totalTravelTime += returnTravelTime;
    }

    return {
      order,
      totalReward,
      timeUsed: currentTime,
      totalTravelTime,
      totalStayTime,
      returnTravelTime,
      arrivalTimes,
      isFeasible: true
    };
  }

  // =========================================================================
  // 1. DYNAMIC PROGRAMMING WITH BITMASK (Exact Optimal Solver, O(n^2 * 2^n))
  // =========================================================================
  static solveDP(depot, places, speed, budget, returnToStart = true, recordSteps = false) {
    const startTime = performance.now();
    const n = places.length;

    if (n === 0) {
      return {
        name: 'Bitmask Dynamic Programming',
        code: 'DP',
        order: [],
        totalReward: 0,
        timeUsed: 0,
        arrivalTimes: [],
        runtimeMs: 0,
        nodesExplored: 1,
        memoryEstimate: '0 KB',
        stepHistory: [],
        isOptimal: true
      };
    }

    if (n > 17) {
      throw new Error(`Bitmask DP is capped at n <= 17 to prevent browser memory exhaustion (Requested: n=${n}).`);
    }

    const numStates = 1 << n;

    // Precalculate rewards of every subset mask
    const rewardOfMask = new Float64Array(numStates);
    for (let mask = 0; mask < numStates; mask++) {
      let r = 0;
      for (let i = 0; i < n; i++) {
        if ((mask & (1 << i)) !== 0) {
          r += places[i].reward;
        }
      }
      rewardOfMask[mask] = r;
    }

    // Precalculate time matrix: 0..n-1 places, index n is depot
    const timeMatrix = Array.from({ length: n + 1 }, () => new Float64Array(n + 1));
    for (let i = 0; i < n; i++) {
      timeMatrix[n][i] = OrienteeringSolvers.travelTime(depot, places[i], speed);
      timeMatrix[i][n] = timeMatrix[n][i];
      for (let j = 0; j < n; j++) {
        timeMatrix[i][j] = OrienteeringSolvers.travelTime(places[i], places[j], speed);
      }
    }

    // dp[mask * n + last] = minimum time to visit subset `mask` ending at node `last`
    const dp = new Float64Array(numStates * n);
    const parent = new Int16Array(numStates * n);
    dp.fill(Infinity);
    parent.fill(-1);

    let statesComputed = 0;
    const stepHistory = [];

    // Base cases: single node visited directly from depot
    for (let i = 0; i < n; i++) {
      const mask = 1 << i;
      const initialTime = timeMatrix[n][i] + places[i].stayTime;
      const stateIdx = mask * n + i;
      dp[stateIdx] = initialTime;
      parent[stateIdx] = -1;
      statesComputed++;

      if (recordSteps && n <= 5) {
        stepHistory.push({
          type: 'base_case',
          mask,
          maskBinary: mask.toString(2).padStart(n, '0'),
          last: i,
          prev: 'Depot',
          travelTime: timeMatrix[n][i],
          stayTime: places[i].stayTime,
          accumulatedTime: initialTime,
          reward: places[i].reward,
          isFeasible: initialTime + (returnToStart ? timeMatrix[i][n] : 0) <= budget,
          explanation: `Base Case: Depot ➔ ${places[i].name}. Travel: ${timeMatrix[n][i].toFixed(1)}m + Stay: ${places[i].stayTime}m = ${initialTime.toFixed(1)}m (Reward: +${places[i].reward})`
        });
      }
    }

    // Populate DP states by subset mask
    for (let mask = 1; mask < numStates; mask++) {
      for (let u = 0; u < n; u++) {
        if ((mask & (1 << u)) === 0) continue;
        const curTime = dp[mask * n + u];
        if (curTime === Infinity || curTime > budget) continue;

        for (let v = 0; v < n; v++) {
          if ((mask & (1 << v)) !== 0) continue;

          const nextMask = mask | (1 << v);
          const travel = timeMatrix[u][v];
          const newTime = curTime + travel + places[v].stayTime;
          const nextStateIdx = nextMask * n + v;

          statesComputed++;

          if (newTime < dp[nextStateIdx]) {
            dp[nextStateIdx] = newTime;
            parent[nextStateIdx] = u;

            if (recordSteps && n <= 5) {
              const returnCost = returnToStart ? timeMatrix[v][n] : 0;
              const totalEst = newTime + returnCost;
              stepHistory.push({
                type: 'transition',
                mask: nextMask,
                maskBinary: nextMask.toString(2).padStart(n, '0'),
                last: v,
                prev: u,
                travelTime: travel,
                stayTime: places[v].stayTime,
                accumulatedTime: newTime,
                reward: rewardOfMask[nextMask],
                isFeasible: totalEst <= budget,
                explanation: `From [${mask.toString(2).padStart(n, '0')}, #${u + 1}] ➔ #${v + 1} (${places[v].name}): +${travel.toFixed(1)}m travel + ${places[v].stayTime}m stay = ${newTime.toFixed(1)}m (New Min Time for this subset)`
              });
            }
          }
        }
      }
    }

    // Find the subset mask that MAXIMIZES reward within budget
    let bestReward = 0;
    let minTimeForBestReward = Infinity;
    let bestMask = 0;
    let bestLast = -1;

    for (let mask = 1; mask < numStates; mask++) {
      const maskReward = rewardOfMask[mask];

      for (let u = 0; u < n; u++) {
        if ((mask & (1 << u)) === 0) continue;
        const endTime = dp[mask * n + u] + (returnToStart ? timeMatrix[u][n] : 0);

        if (endTime <= budget) {
          if (maskReward > bestReward || (maskReward === bestReward && endTime < minTimeForBestReward)) {
            bestReward = maskReward;
            minTimeForBestReward = endTime;
            bestMask = mask;
            bestLast = u;
          }
        }
      }
    }

    // Reconstruct optimal route sequence from parent table
    const order = [];
    if (bestLast !== -1) {
      let currMask = bestMask;
      let currNode = bestLast;

      while (currNode !== -1) {
        order.push(currNode);
        const p = parent[currMask * n + currNode];
        currMask = currMask ^ (1 << currNode);
        currNode = p;
      }
      order.reverse();
    }

    const endTime = performance.now();
    const runtimeMs = Math.max(0.01, endTime - startTime);
    const evalResult = OrienteeringSolvers.evaluateRoute(depot, places, order, speed, returnToStart);

    const bytesUsed = (numStates * n * 8) + (numStates * n * 2) + (numStates * 8);
    const memoryEstimate = bytesUsed > 1048576 
      ? `${(bytesUsed / 1048576).toFixed(2)} MB` 
      : `${(bytesUsed / 1024).toFixed(1)} KB`;

    return {
      name: 'Bitmask Dynamic Programming',
      code: 'DP',
      order,
      totalReward: evalResult.totalReward,
      timeUsed: evalResult.timeUsed,
      arrivalTimes: evalResult.arrivalTimes,
      totalTravelTime: evalResult.totalTravelTime,
      totalStayTime: evalResult.totalStayTime,
      returnTravelTime: evalResult.returnTravelTime,
      runtimeMs,
      nodesExplored: statesComputed,
      memoryEstimate,
      stepHistory,
      numStates,
      isOptimal: true
    };
  }

  // =========================================================================
  // 2. BACKTRACKING WITH BRANCH & BOUND PRUNING (O(n!))
  // =========================================================================
  static solveBacktracking(depot, places, speed, budget, returnToStart = true, enablePruning = true) {
    const startTime = performance.now();
    const n = places.length;

    if (n === 0) {
      return {
        name: enablePruning ? 'Branch & Bound Search' : 'Exhaustive Backtracking',
        code: enablePruning ? 'BB' : 'BT_NAIVE',
        order: [],
        totalReward: 0,
        timeUsed: 0,
        arrivalTimes: [],
        runtimeMs: 0,
        nodesExplored: 1,
        memoryEstimate: '< 1 KB',
        isOptimal: true
      };
    }

    const timeMatrix = Array.from({ length: n + 1 }, () => new Float64Array(n + 1));
    for (let i = 0; i < n; i++) {
      timeMatrix[n][i] = OrienteeringSolvers.travelTime(depot, places[i], speed);
      timeMatrix[i][n] = timeMatrix[n][i];
      for (let j = 0; j < n; j++) {
        timeMatrix[i][j] = OrienteeringSolvers.travelTime(places[i], places[j], speed);
      }
    }

    const totalRewardSum = places.reduce((sum, p) => sum + p.reward, 0);

    let bestReward = 0;
    let bestTime = Infinity;
    let bestOrder = [];
    let nodesExplored = 0;

    const currentOrder = [];
    const visited = new Uint8Array(n);

    // If pruning is enabled, seed bestReward with Greedy for faster early pruning
    if (enablePruning) {
      const greedyRes = OrienteeringSolvers.solveGreedy(depot, places, speed, budget, returnToStart);
      bestReward = greedyRes.totalReward;
      bestTime = greedyRes.timeUsed;
      bestOrder = [...greedyRes.order];
    }

    function search(lastNodeIndex, currentTime, currentReward, remainingPotentialReward) {
      nodesExplored++;

      // Check current route as a valid candidate
      const returnTime = returnToStart ? (lastNodeIndex === n ? 0 : timeMatrix[lastNodeIndex][n]) : 0;
      const totalTimeWithReturn = currentTime + returnTime;

      if (totalTimeWithReturn <= budget) {
        if (currentReward > bestReward || (currentReward === bestReward && totalTimeWithReturn < bestTime)) {
          bestReward = currentReward;
          bestTime = totalTimeWithReturn;
          bestOrder = [...currentOrder];
        }
      }

      // Hard safety limit on unpruned search to prevent freeze
      if (!enablePruning && nodesExplored > 5000000) {
        return;
      }

      for (let i = 0; i < n; i++) {
        if (!visited[i]) {
          const travel = timeMatrix[lastNodeIndex][i];
          const nextTime = currentTime + travel + places[i].stayTime;
          const returnFromNext = returnToStart ? timeMatrix[i][n] : 0;

          // Pruning Rule 1: Time budget violation
          if (enablePruning && nextTime + returnFromNext > budget) {
            continue;
          }

          // Pruning Rule 2: Upper bound optimality check
          if (enablePruning && currentReward + remainingPotentialReward <= bestReward) {
            return; // Prune entire branch
          }

          visited[i] = 1;
          currentOrder.push(i);

          search(
            i,
            nextTime,
            currentReward + places[i].reward,
            remainingPotentialReward - places[i].reward
          );

          currentOrder.pop();
          visited[i] = 0;
        }
      }
    }

    search(n, 0, 0, totalRewardSum);

    const endTime = performance.now();
    const runtimeMs = Math.max(0.01, endTime - startTime);
    const evalResult = OrienteeringSolvers.evaluateRoute(depot, places, bestOrder, speed, returnToStart);

    return {
      name: enablePruning ? 'Branch & Bound (Pruning Active)' : 'Exhaustive Backtracking (No Pruning)',
      code: enablePruning ? 'BB' : 'BT_NAIVE',
      order: bestOrder,
      totalReward: evalResult.totalReward,
      timeUsed: evalResult.timeUsed,
      arrivalTimes: evalResult.arrivalTimes,
      totalTravelTime: evalResult.totalTravelTime,
      totalStayTime: evalResult.totalStayTime,
      returnTravelTime: evalResult.returnTravelTime,
      runtimeMs,
      nodesExplored,
      memoryEstimate: `${((n * 4 * 2) / 1024).toFixed(2)} KB (Call Stack)`,
      isOptimal: true
    };
  }

  // =========================================================================
  // 3. GREEDY HEURISTIC SOLVER (O(n^2))
  // =========================================================================
  static solveGreedy(depot, places, speed, budget, returnToStart = true) {
    const startTime = performance.now();
    const n = places.length;

    if (n === 0) {
      return {
        name: 'Greedy Heuristic (Max Reward/Time)',
        code: 'GREEDY',
        order: [],
        totalReward: 0,
        timeUsed: 0,
        arrivalTimes: [],
        runtimeMs: 0,
        nodesExplored: 1,
        memoryEstimate: '< 1 KB',
        isOptimal: false
      };
    }

    const unvisited = new Set(places.map((_, i) => i));
    const order = [];
    let currentPos = depot;
    let currentTime = 0;
    let comparisons = 0;

    while (unvisited.size > 0) {
      let bestIdx = -1;
      let bestScore = -Infinity;

      for (const idx of unvisited) {
        comparisons++;
        const place = places[idx];
        const travel = OrienteeringSolvers.travelTime(currentPos, place, speed);
        const cost = travel + place.stayTime;
        const returnTravel = returnToStart ? OrienteeringSolvers.travelTime(place, depot, speed) : 0;

        // Check if feasible within total budget
        if (currentTime + cost + returnTravel <= budget) {
          const score = place.reward / Math.max(cost, 0.001);
          if (score > bestScore) {
            bestScore = score;
            bestIdx = idx;
          }
        }
      }

      if (bestIdx === -1) {
        break; // No more places fit within budget
      }

      order.push(bestIdx);
      unvisited.delete(bestIdx);
      const chosen = places[bestIdx];
      const travel = OrienteeringSolvers.travelTime(currentPos, chosen, speed);
      currentTime += travel + chosen.stayTime;
      currentPos = chosen;
    }

    const endTime = performance.now();
    const runtimeMs = Math.max(0.01, endTime - startTime);
    const evalResult = OrienteeringSolvers.evaluateRoute(depot, places, order, speed, returnToStart);

    return {
      name: 'Greedy Heuristic (Reward/Cost Ratio)',
      code: 'GREEDY',
      order,
      totalReward: evalResult.totalReward,
      timeUsed: evalResult.timeUsed,
      arrivalTimes: evalResult.arrivalTimes,
      totalTravelTime: evalResult.totalTravelTime,
      totalStayTime: evalResult.totalStayTime,
      returnTravelTime: evalResult.returnTravelTime,
      runtimeMs,
      nodesExplored: comparisons,
      memoryEstimate: '< 2 KB',
      isOptimal: false
    };
  }

  // =========================================================================
  // 4. SOLVE ALL & CROSS-COMPARE
  // =========================================================================
  static solveAll(depot, places, speed, budget, returnToStart = true, enablePruning = true) {
    const n = places.length;
    const greedy = OrienteeringSolvers.solveGreedy(depot, places, speed, budget, returnToStart);

    let dp = null;
    let dpError = null;
    if (n <= 17) {
      try {
        dp = OrienteeringSolvers.solveDP(depot, places, speed, budget, returnToStart);
      } catch (err) {
        dpError = err.message;
      }
    } else {
      dpError = `DP bypassed (n = ${n} > 17 limit)`;
    }

    let bb = null;
    let bbError = null;
    if (n <= 14 || (enablePruning && n <= 16)) {
      try {
        bb = OrienteeringSolvers.solveBacktracking(depot, places, speed, budget, returnToStart, enablePruning);
      } catch (err) {
        bbError = err.message;
      }
    } else {
      bbError = `Branch & Bound bypassed (n = ${n} > 14 limit)`;
    }

    const optimalReward = dp ? dp.totalReward : (bb ? bb.totalReward : greedy.totalReward);

    const enrich = (sol) => {
      if (!sol) return null;
      const gap = optimalReward > 0 ? ((optimalReward - sol.totalReward) / optimalReward) * 100 : 0;
      return {
        ...sol,
        rewardGapPct: Math.max(0, gap),
        budgetUtilizationPct: budget > 0 ? Math.min(100, (sol.timeUsed / budget) * 100) : 0
      };
    };

    return {
      dp: enrich(dp),
      dpError,
      backtracking: enrich(bb),
      bbError,
      greedy: enrich(greedy),
      optimalReward
    };
  }

  // =========================================================================
  // 5. IN-APP SELF-CHECK VERIFICATION SUITE (50 Random Instances)
  // =========================================================================
  static runSelfCheck(numTests = 50) {
    const results = [];
    let passedCount = 0;
    let failedCount = 0;

    for (let t = 1; t <= numTests; t++) {
      const n = Math.floor(Math.random() * 5) + 3; // 3 to 7 places
      const speed = Math.floor(Math.random() * 50) + 50; // 50-100 px/min
      const budget = Math.floor(Math.random() * 200) + 100; // 100-300 min
      const returnToStart = Math.random() > 0.3;

      const depot = { x: 300, y: 250, name: 'Start Depot' };
      const places = [];
      for (let i = 0; i < n; i++) {
        places.push({
          id: i + 1,
          name: `Spot #${i + 1}`,
          x: Math.floor(50 + Math.random() * 500),
          y: Math.floor(50 + Math.random() * 400),
          reward: Math.floor(Math.random() * 10) + 1,
          stayTime: Math.floor(Math.random() * 20) + 5
        });
      }

      const dpRes = OrienteeringSolvers.solveDP(depot, places, speed, budget, returnToStart);
      const bbRes = OrienteeringSolvers.solveBacktracking(depot, places, speed, budget, returnToStart, true);
      const greedyRes = OrienteeringSolvers.solveGreedy(depot, places, speed, budget, returnToStart);

      const isMatch = dpRes.totalReward === bbRes.totalReward && dpRes.timeUsed <= budget + 1e-4;

      if (isMatch) passedCount++;
      else failedCount++;

      results.push({
        testId: t,
        n,
        budget,
        returnToStart,
        dpReward: dpRes.totalReward,
        bbReward: bbRes.totalReward,
        greedyReward: greedyRes.totalReward,
        dpTime: dpRes.timeUsed,
        bbTime: bbRes.timeUsed,
        passed: isMatch
      });
    }

    return {
      total: numTests,
      passed: passedCount,
      failed: failedCount,
      allPassed: failedCount === 0,
      details: results
    };
  }
}
