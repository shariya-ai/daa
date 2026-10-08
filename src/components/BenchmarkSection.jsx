import React, { useState, useRef } from 'react';
import { OrienteeringSolvers } from '../algorithms/solvers';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Play, Square, Download, Activity } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function BenchmarkSection({ speed = 80 }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Ready to run empirical benchmark across n = 4 to 100.');
  const [kTrials, setKTrials] = useState(3);
  const [benchmarkData, setBenchmarkData] = useState([]);
  const cancelRef = useRef(false);

  const generateRandomInstance = (n, w = 600, h = 400) => {
    const depot = { x: Math.random() * w, y: Math.random() * h, name: 'Depot' };
    const places = [];
    for (let i = 0; i < n; i++) {
      places.push({
        id: i + 1,
        name: `Node #${i + 1}`,
        x: Math.random() * w,
        y: Math.random() * h,
        reward: Math.floor(Math.random() * 10) + 1,
        stayTime: Math.floor(Math.random() * 15) + 5
      });
    }
    const budget = 120 + n * 12;
    return { depot, places, budget };
  };

  const handleRunBenchmark = async () => {
    if (isRunning) return;
    sounds.playClick();
    setIsRunning(true);
    cancelRef.current = false;
    setBenchmarkData([]);

    const nValues = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 25, 50, 100];
    const results = [];
    const total = nValues.length;

    for (let step = 0; step < total; step++) {
      if (cancelRef.current) break;
      const n = nValues[step];
      setProgress(Math.round(((step + 1) / total) * 100));
      setStatusText(`Evaluating n = ${n} (${step + 1}/${total}) across ${kTrials} trials...`);

      let dpTime = 0, dpRuns = 0;
      let bbTime = 0, bbNodes = 0, bbRuns = 0;
      let bbNaiveTime = 0, bbNaiveNodes = 0, bbNaiveRuns = 0;
      let greedyTime = 0, greedyRuns = 0;
      let gapSum = 0, gapCount = 0;

      for (let t = 0; t < kTrials; t++) {
        if (cancelRef.current) break;
        await new Promise((r) => setTimeout(r, 6)); // Yield to keep UI smooth

        const inst = generateRandomInstance(n);

        // 1. Greedy
        const gRes = OrienteeringSolvers.solveGreedy(inst.depot, inst.places, speed, inst.budget, true);
        greedyTime += gRes.runtimeMs;
        greedyRuns++;

        // 2. DP (n <= 16)
        if (n <= 16) {
          const dpRes = OrienteeringSolvers.solveDP(inst.depot, inst.places, speed, inst.budget, true);
          dpTime += dpRes.runtimeMs;
          dpRuns++;

          if (dpRes.totalReward > 0) {
            const gap = ((dpRes.totalReward - gRes.totalReward) / dpRes.totalReward) * 100;
            gapSum += Math.max(0, gap);
            gapCount++;
          }
        }

        // 3. Pruned B&B (n <= 12)
        if (n <= 12) {
          const bbRes = OrienteeringSolvers.solveBacktracking(inst.depot, inst.places, speed, inst.budget, true, true);
          bbTime += bbRes.runtimeMs;
          bbNodes += bbRes.nodesExplored;
          bbRuns++;
        }

        // 4. Naive Backtracking (n <= 9)
        if (n <= 9) {
          const bbNRes = OrienteeringSolvers.solveBacktracking(inst.depot, inst.places, speed, inst.budget, true, false);
          bbNaiveTime += bbNRes.runtimeMs;
          bbNaiveNodes += bbNRes.nodesExplored;
          bbNaiveRuns++;
        }
      }

      const row = {
        n,
        dpAvgMs: dpRuns > 0 ? dpTime / dpRuns : null,
        bbAvgMs: bbRuns > 0 ? bbTime / bbRuns : null,
        bbAvgNodes: bbRuns > 0 ? Math.round(bbNodes / bbRuns) : null,
        bbNaiveAvgMs: bbNaiveRuns > 0 ? bbNaiveTime / bbNaiveRuns : null,
        bbNaiveAvgNodes: bbNaiveRuns > 0 ? Math.round(bbNaiveNodes / bbNaiveRuns) : null,
        greedyAvgMs: greedyRuns > 0 ? greedyTime / greedyRuns : null,
        greedyGapPct: gapCount > 0 ? gapSum / gapCount : null
      };

      results.push(row);
      setBenchmarkData([...results]);
    }

    setIsRunning(false);
    setStatusText('✅ Empirical Benchmark Suite execution finished!');
    sounds.playOptimalChime();
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setIsRunning(false);
    setStatusText('Benchmark cancelled.');
  };

  const handleExportCSV = () => {
    if (benchmarkData.length === 0) return;
    sounds.playClick();

    let csv = 'n,DP_Runtime_ms,BB_Pruned_Runtime_ms,Naive_BT_Runtime_ms,Greedy_Runtime_ms,BB_Nodes_Explored,Naive_BT_Nodes_Explored,Greedy_Reward_Gap_Pct\n';
    benchmarkData.forEach((r) => {
      csv += `${r.n},${r.dpAvgMs ?? ''},${r.bbAvgMs ?? ''},${r.bbNaiveAvgMs ?? ''},${r.greedyAvgMs ?? ''},${r.bbAvgNodes ?? ''},${r.bbNaiveAvgNodes ?? ''},${r.greedyGapPct?.toFixed(2) ?? ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `budgettrail_benchmark_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const labels = benchmarkData.map((d) => `n=${d.n}`);

  // Chart 1: Logarithmic Runtime
  const runtimeChartData = {
    labels,
    datasets: [
      {
        label: 'Bitmask DP (Θ(n² 2ⁿ))',
        data: benchmarkData.map((d) => (d.dpAvgMs !== null ? Math.max(0.01, d.dpAvgMs) : null)),
        borderColor: '#F2C46A',
        backgroundColor: 'rgba(242, 196, 106, 0.25)',
        tension: 0.3
      },
      {
        label: 'Branch & Bound (Pruned)',
        data: benchmarkData.map((d) => (d.bbAvgMs !== null ? Math.max(0.01, d.bbAvgMs) : null)),
        borderColor: '#AEAC78',
        backgroundColor: 'rgba(174, 172, 120, 0.25)',
        tension: 0.3
      },
      {
        label: 'Naive Search (O(n!))',
        data: benchmarkData.map((d) => (d.bbNaiveAvgMs !== null ? Math.max(0.01, d.bbNaiveAvgMs) : null)),
        borderColor: '#4C4541',
        borderDash: [5, 5],
        tension: 0.3
      },
      {
        label: 'Greedy Ratio (O(n²))',
        data: benchmarkData.map((d) => (d.greedyAvgMs !== null ? Math.max(0.005, d.greedyAvgMs) : null)),
        borderColor: '#4C4541',
        backgroundColor: 'rgba(76, 69, 65, 0.15)',
        tension: 0.3
      }
    ]
  };

  // Chart 2: Greedy Suboptimality Gap
  const gapChartData = {
    labels: benchmarkData.filter((d) => d.greedyGapPct !== null).map((d) => `n=${d.n}`),
    datasets: [
      {
        label: 'Greedy Suboptimality Gap (%) vs Optimal DP',
        data: benchmarkData.filter((d) => d.greedyGapPct !== null).map((d) => d.greedyGapPct.toFixed(2)),
        backgroundColor: '#F2C46A',
        borderColor: '#4C4541',
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  // Chart 3: Pruning Nodes Explored
  const pruningChartData = {
    labels: benchmarkData.filter((d) => d.bbAvgNodes !== null).map((d) => `n=${d.n}`),
    datasets: [
      {
        label: 'Pruned B&B Explored Nodes',
        data: benchmarkData.filter((d) => d.bbAvgNodes !== null).map((d) => d.bbAvgNodes),
        borderColor: '#AEAC78',
        backgroundColor: 'rgba(174, 172, 120, 0.3)',
        fill: true,
        tension: 0.2
      },
      {
        label: 'Naive Backtracking Nodes (O(n!))',
        data: benchmarkData.filter((d) => d.bbAvgNodes !== null).map((d) => d.bbNaiveAvgNodes),
        borderColor: '#4C4541',
        borderDash: [4, 4],
        tension: 0.2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#4C4541',
          font: { family: 'Inter', size: 11, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: '#FCF0DA',
        titleColor: '#4C4541',
        bodyColor: '#4C4541',
        borderColor: '#4C4541',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(76, 69, 65, 0.08)' },
        ticks: { color: '#4C4541', font: { family: 'JetBrains Mono', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(76, 69, 65, 0.08)' },
        ticks: { color: '#4C4541', font: { family: 'JetBrains Mono', size: 10 } }
      }
    }
  };

  return (
    <section id="benchmark" className="benchmark-neo-section">
      <div className="neo-section-header">
        <div className="neo-tag">EMPIRICAL BENCHMARKS • NEO-LIQUID GLASS SUITE</div>
        <h2 className="neo-title">Algorithmic Performance & Complexity Scaling</h2>
        <p className="neo-subtitle">
          Real-time execution across increasing problem sizes ($n=4$ to $n=100$) demonstrating the mathematical phase transitions of DP, Branch & Bound, and Greedy heuristics.
        </p>
      </div>

      {/* Neo Brutalist Controls Bar */}
      <div className="neo-card neo-controls-bar">
        <div className="neo-controls-left">
          <div className="neo-param-unit">
            <label htmlFor="k-trials-neo">TRIALS / (n):</label>
            <select
              id="k-trials-neo"
              className="neo-select"
              value={kTrials}
              onChange={(e) => setKTrials(Number(e.target.value))}
              disabled={isRunning}
            >
              <option value={3}>k = 3 Instances</option>
              <option value={5}>k = 5 Instances</option>
              <option value={10}>k = 10 Instances</option>
            </select>
          </div>

          <button className="neo-btn neo-btn-cyan" onClick={handleRunBenchmark} disabled={isRunning}>
            <Play size={16} fill="currentColor" /> RUN BENCHMARK
          </button>

          {isRunning && (
            <button className="neo-btn neo-btn-red" onClick={handleCancel}>
              <Square size={14} /> CANCEL
            </button>
          )}
        </div>

        <button
          className="neo-btn neo-btn-yellow"
          onClick={handleExportCSV}
          disabled={benchmarkData.length === 0}
        >
          <Download size={16} /> EXPORT CSV DATA
        </button>
      </div>

      {/* Status & Progress */}
      <div className="neo-status-box">
        <div className="neo-progress-track">
          <div className="neo-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="neo-status-text">
          <Activity size={14} style={{ display: 'inline', marginRight: '6px' }} />
          {statusText}
        </div>
      </div>

      {/* Charts Grid */}
      {benchmarkData.length > 0 && (
        <div className="neo-charts-grid">
          
          {/* Chart 1: Log Runtime */}
          <div className="neo-chart-card">
            <h3 className="neo-chart-title">1. Logarithmic Runtime Scaling (ms vs n)</h3>
            <div style={{ height: '260px' }}>
              <Line
                data={runtimeChartData}
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: { ...chartOptions.scales.y, type: 'logarithmic' }
                  }
                }}
              />
            </div>
          </div>

          {/* Chart 2: Greedy Gap */}
          <div className="neo-chart-card">
            <h3 className="neo-chart-title">2. Greedy Suboptimality Gap (%) vs Optimal</h3>
            <div style={{ height: '260px' }}>
              <Bar data={gapChartData} options={chartOptions} />
            </div>
          </div>

          {/* Chart 3: Search Space Pruning */}
          <div className="neo-chart-card" style={{ gridColumn: '1 / -1' }}>
            <h3 className="neo-chart-title">3. Search Tree Pruning Efficiency (Nodes Explored: Pruned B&B vs Naive DFS)</h3>
            <div style={{ height: '260px' }}>
              <Line data={pruningChartData} options={chartOptions} />
            </div>
          </div>

        </div>
      )}

      {/* Data Table */}
      {benchmarkData.length > 0 && (
        <div className="neo-table-card">
          <div className="comparison-table-scroll">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Instance (n)</th>
                  <th>Bitmask DP Avg (ms)</th>
                  <th>Pruned B&B Avg (ms)</th>
                  <th>Naive Search Avg (ms)</th>
                  <th>Greedy Ratio Avg (ms)</th>
                  <th>B&B Nodes Explored</th>
                  <th>Greedy Gap (%)</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkData.map((row) => (
                  <tr key={row.n}>
                    <td><strong>n = {row.n}</strong></td>
                    <td>{row.dpAvgMs !== null ? `${row.dpAvgMs.toFixed(2)} ms` : '—'}</td>
                    <td>{row.bbAvgMs !== null ? `${row.bbAvgMs.toFixed(2)} ms` : '—'}</td>
                    <td>{row.bbNaiveAvgMs !== null ? `${row.bbNaiveAvgMs.toFixed(2)} ms` : '—'}</td>
                    <td>{row.greedyAvgMs !== null ? `${row.greedyAvgMs.toFixed(3)} ms` : '—'}</td>
                    <td>{row.bbAvgNodes !== null ? row.bbAvgNodes.toLocaleString() : '—'}</td>
                    <td>
                      {row.greedyGapPct !== null ? (
                        <span className="badge badge-warning">-{row.greedyGapPct.toFixed(1)}%</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </section>
  );
}
