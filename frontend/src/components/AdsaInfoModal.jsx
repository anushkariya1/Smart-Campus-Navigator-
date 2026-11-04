import React, { useState } from 'react';
import { X, GraduationCap, Cpu, Code2, Network, Clock, Database, Layers } from 'lucide-react';

export default function AdsaInfoModal({ isOpen, onClose, adsaData }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <GraduationCap size={22} color="#C53030" />
            <span>ADSA Academic Project Specification & Algorithms</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #334155', paddingBottom: 8 }}>
            <button
              className={`alt-tab ${activeTab === 'overview' ? 'active' : ''}`}
              style={{ flex: 'none', padding: '6px 14px' }}
              onClick={() => setActiveTab('overview')}
            >
              Overview & Matrix
            </button>
            <button
              className={`alt-tab ${activeTab === 'dijkstra' ? 'active' : ''}`}
              style={{ flex: 'none', padding: '6px 14px' }}
              onClick={() => setActiveTab('dijkstra')}
            >
              Dijkstra Algorithm
            </button>
            <button
              className={`alt-tab ${activeTab === 'yen' ? 'active' : ''}`}
              style={{ flex: 'none', padding: '6px 14px' }}
              onClick={() => setActiveTab('yen')}
            >
              Yen's K-Shortest Paths
            </button>
            <button
              className={`alt-tab ${activeTab === 'bfs' ? 'active' : ''}`}
              style={{ flex: 'none', padding: '6px 14px' }}
              onClick={() => setActiveTab('bfs')}
            >
              BFS Traversal
            </button>
            <button
              className={`alt-tab ${activeTab === 'ds' ? 'active' : ''}`}
              style={{ flex: 'none', padding: '6px 14px' }}
              onClick={() => setActiveTab('ds')}
            >
              Data Structures
            </button>
          </div>

          {/* TAB 1: Overview & Matrix */}
          {activeTab === 'overview' && (
            <div>
              <p style={{ fontSize: 13.5, color: '#CBD5E1', lineHeight: 1.6 }}>
                The <strong>Smart Campus Navigation System</strong> is engineered as a core demonstration of
                Advanced Data Structures & Algorithms (ADSA) for Chandigarh University. All graph operations,
                shortest-path routing, priority queues, and traversals are natively implemented in <strong>C++17</strong>.
              </p>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#D69E2E', marginBottom: 6 }}>
                  ALGORITHMIC COMPLEXITY MATRIX (ACTUAL C++ IMPLEMENTATION)
                </div>
                <table className="adsa-table">
                  <thead>
                    <tr>
                      <th>ADSA Concept</th>
                      <th>C++ Data Structure / STL</th>
                      <th>Time Complexity</th>
                      <th>Space Complexity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Adjacency List</strong></td>
                      <td><code>std::vector&lt;std::vector&lt;Edge&gt;&gt;</code></td>
                      <td><span className="complexity-tag">O(V + E)</span></td>
                      <td><span className="complexity-tag">O(V + E)</span></td>
                    </tr>
                    <tr>
                      <td><strong>Dijkstra Shortest Path</strong></td>
                      <td><code>std::priority_queue&lt;pair, vector, greater&gt;</code></td>
                      <td><span className="complexity-tag">O((V + E) log V)</span></td>
                      <td><span className="complexity-tag">O(V)</span></td>
                    </tr>
                    <tr>
                      <td><strong>Yen's K-Shortest Paths</strong></td>
                      <td>Deviation spur nodes + Candidate queue</td>
                      <td><span className="complexity-tag">O(K · V · (E + V log V))</span></td>
                      <td><span className="complexity-tag">O(K · V + E)</span></td>
                    </tr>
                    <tr>
                      <td><strong>Breadth First Search (BFS)</strong></td>
                      <td><code>std::queue&lt;int&gt;</code> + Visited array</td>
                      <td><span className="complexity-tag">O(V + E)</span></td>
                      <td><span className="complexity-tag">O(V)</span></td>
                    </tr>
                    <tr>
                      <td><strong>Fast Location Hash Table</strong></td>
                      <td><code>std::unordered_map&lt;string, int&gt;</code></td>
                      <td><span className="complexity-tag">O(1) avg</span></td>
                      <td><span className="complexity-tag">O(V)</span></td>
                    </tr>
                    <tr>
                      <td><strong>Nearby Facility Ranking</strong></td>
                      <td><code>std::sort</code> (Introsort) with custom lambda</td>
                      <td><span className="complexity-tag">O(N log N)</span></td>
                      <td><span className="complexity-tag">O(log N)</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Dijkstra */}
          {activeTab === 'dijkstra' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                Dijkstra's Single-Source Shortest Path Algorithm
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>
                Employs a binary min-heap priority queue to greedily extract the unvisited vertex with the minimum
                tentative distance. Performs edge relaxation on all incident pathways and ignores restricted edges.
              </p>
              <div className="code-block">
{`// C++ Dijkstra Shortest Path Implementation
std::priority_queue<PQElement, std::vector<PQElement>, std::greater<PQElement>> pq;
std::vector<double> dist(n, INF);
std::vector<int> parent(n, -1);

dist[source] = 0.0;
pq.push({0.0, source});

while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) continue;
    if (u == destination) break; // Destination reached

    for (const auto& edge : adjList[u]) {
        if (edge.restricted) continue; // Skip blocked pathways
        int v = edge.toIndex;
        double newDist = dist[u] + edge.distance;
        if (newDist < dist[v]) { // Relaxation step
            dist[v] = newDist;
            parent[v] = u;
            pq.push({newDist, v});
        }
    }
}`}
              </div>
            </div>
          )}

          {/* TAB 3: Yen's KSP */}
          {activeTab === 'yen' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                Yen's K-Shortest Loopless Paths Algorithm
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>
                Calculates Alternative Route 1 and Alternative Route 2 without loops or duplicate edges by systematically
                deviating from the spur nodes along previously discovered shortest paths.
              </p>
              <div className="code-block">
{`// Yen's Algorithm: A contains shortest paths, B contains candidates
A[0] = Dijkstra(G, source, target);

for (int k = 1; k < K; ++k) {
    for (int i = 0; i < A[k-1].size() - 1; ++i) {
        int spurNode = A[k-1].nodes[i];
        vector<int> rootPath = A[k-1].nodes[0..i];

        // Temporarily mask coinciding edges and root nodes
        for (const auto& path : A) {
            if (path.shares(rootPath)) maskEdge(path.nodes[i], path.nodes[i+1]);
        }
        maskNodes(rootPath except spurNode);

        // Run Dijkstra from spurNode to target
        PathResult spurPath = Dijkstra(G_masked, spurNode, target);
        if (spurPath.valid) {
            RawPath totalCandidate = rootPath + spurPath;
            if (!contains(A, totalCandidate) && !contains(B, totalCandidate))
                B.push(totalCandidate);
        }
        restoreGraph(G);
    }
    if (B.empty()) break;
    A.push(extractMin(B));
}`}
              </div>
            </div>
          )}

          {/* TAB 4: BFS */}
          {activeTab === 'bfs' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                Breadth First Search (BFS) Campus Traversal
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>
                Explores the campus network layer by layer using an STL FIFO queue. Discovers all reachable buildings
                within a radius of $K$ walking hops.
              </p>
              <div className="code-block">
{`// BFS Implementation
std::queue<int> q;
std::vector<bool> visited(n, false);
std::vector<int> hops(n, -1);

visited[source] = true;
hops[source] = 0;
q.push(source);

while (!q.empty()) {
    int u = q.front();
    q.pop();
    if (hops[u] >= maxHops) continue;

    for (const auto& edge : adjList[u]) {
        if (edge.restricted) continue;
        int v = edge.toIndex;
        if (!visited[v]) {
            visited[v] = true;
            hops[v] = hops[u] + 1;
            q.push(v);
        }
    }
}`}
              </div>
            </div>
          )}

          {/* TAB 5: Data Structures */}
          {activeTab === 'ds' && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                Core STL Data Structures Employed
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                  <div style={{ color: '#E53E3E', fontWeight: 700, fontSize: 13 }}>std::unordered_map</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                    Provides $O(1)$ average-time resolution mapping building codes (e.g. "D6", "NC1", "B1") and IDs to vertex indices.
                  </div>
                </div>
                <div style={{ background: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                  <div style={{ color: '#D69E2E', fontWeight: 700, fontSize: 13 }}>std::priority_queue</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                    Binary min-heap providing $O(\log V)$ node extraction and insertion during Dijkstra execution.
                  </div>
                </div>
                <div style={{ background: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                  <div style={{ color: '#38BDF8', fontWeight: 700, fontSize: 13 }}>std::vector (Adjacency List)</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                    Contiguous cache-friendly storage of graph edges with distance, restricted flags, and walkway names.
                  </div>
                </div>
                <div style={{ background: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155' }}>
                  <div style={{ color: '#4ADE80', fontWeight: 700, fontSize: 13 }}>std::sort (Dual-Pivot)</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                    Sorts and ranks nearest campus facilities, libraries, hostels, and dining centres by distance in $O(N \log N)$.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

