#include "YenKSP.h"
#include "Dijkstra.h"
#include <unordered_set>
#include <algorithm>

struct RawPath {
    std::vector<int> nodes;
    double totalDistance = 0.0;
};

static bool pathsEqual(const std::vector<int>& a, const std::vector<int>& b) {
    return a == b;
}

static PathResult buildPathResultFromIndices(
    const CampusGraph& graph,
    const std::vector<int>& nodes,
    double walkingSpeed,
    const std::string& label
) {
    PathResult res;
    res.valid = true;
    res.routeLabel = label;
    res.nodesCount = static_cast<int>(nodes.size());

    double totalDist = 0.0;
    std::vector<double> legDistances;
    std::vector<std::string> pathwayNames;
    const auto& adjList = graph.getAdjList();

    int junctions = 0;
    for (size_t i = 0; i < nodes.size(); ++i) {
        int u = nodes[i];
        const auto& loc = graph.getLocation(u);
        res.nodeIds.push_back(loc.id);
        res.nodeNames.push_back(loc.name);
        res.coordinates.push_back(loc.coordinates);
        if (loc.isJunction) junctions++;

        if (i + 1 < nodes.size()) {
            int v = nodes[i + 1];
            double edgeDist = 0;
            std::string edgeName = "Campus Pathway";
            for (const auto& e : adjList[u]) {
                if (e.toIndex == v) {
                    edgeDist = e.distance;
                    edgeName = e.name;
                    break;
                }
            }
            legDistances.push_back(edgeDist);
            pathwayNames.push_back(edgeName);
            totalDist += edgeDist;
        }
    }

    res.totalDistance = totalDist;
    if (walkingSpeed <= 0.1) walkingSpeed = 1.2;
    res.walkingTimeSeconds = totalDist / walkingSpeed;
    res.intersectionsCount = junctions;
    res.directions = Dijkstra::generateTurnByTurnDirections(graph, nodes, legDistances, pathwayNames);

    return res;
}

std::vector<PathResult> YenKSP::findKShortestPaths(
    const CampusGraph& graph,
    int sourceIndex,
    int destIndex,
    int K,
    double walkingSpeed
) {
    std::vector<PathResult> results;
    if (sourceIndex == destIndex) {
        PathResult single = Dijkstra::findShortestPath(graph, sourceIndex, destIndex, walkingSpeed);
        if (single.valid) results.push_back(single);
        return results;
    }

    // 1. Initial shortest path A[0]
    PathResult firstPath = Dijkstra::findShortestPath(graph, sourceIndex, destIndex, walkingSpeed);
    if (!firstPath.valid) {
        return results;
    }
    firstPath.routeLabel = "Shortest Route";
    results.push_back(firstPath);

    // Maintain raw node indices for Yen's algorithm
    std::vector<RawPath> A;
    RawPath p0;
    for (const auto& nid : firstPath.nodeIds) {
        p0.nodes.push_back(graph.getNodeIndex(nid));
    }
    p0.totalDistance = firstPath.totalDistance;
    A.push_back(p0);

    std::vector<RawPath> B; // Candidate paths

    for (int k = 1; k < K; ++k) {
        const auto& prevPath = A[k - 1];

        for (size_t i = 0; i + 1 < prevPath.nodes.size(); ++i) {
            int spurNode = prevPath.nodes[i];
            std::vector<int> rootPath(prevPath.nodes.begin(), prevPath.nodes.begin() + i + 1);

            // Collect excluded edges
            std::vector<std::pair<int, int>> excludedEdges;
            for (const auto& p : A) {
                if (p.nodes.size() > i && std::equal(rootPath.begin(), rootPath.end(), p.nodes.begin())) {
                    excludedEdges.push_back({p.nodes[i], p.nodes[i + 1]});
                }
            }

            // Collect excluded nodes (all in rootPath except spurNode)
            std::unordered_set<int> excludedNodes;
            for (size_t r = 0; r < i; ++r) {
                excludedNodes.insert(rootPath[r]);
            }

            // Find spur path from spurNode to destination
            PathResult spurResult = Dijkstra::findShortestPath(
                graph, spurNode, destIndex, walkingSpeed, excludedNodes, excludedEdges
            );

            if (spurResult.valid) {
                RawPath totalCandidate;
                totalCandidate.nodes = rootPath;
                // Add nodes from spur path (excluding the spurNode itself to avoid duplicate)
                for (size_t s = 1; s < spurResult.nodeIds.size(); ++s) {
                    totalCandidate.nodes.push_back(graph.getNodeIndex(spurResult.nodeIds[s]));
                }

                // Calculate candidate distance
                double candDist = 0.0;
                const auto& adjList = graph.getAdjList();
                for (size_t c = 0; c + 1 < totalCandidate.nodes.size(); ++c) {
                    int u = totalCandidate.nodes[c];
                    int v = totalCandidate.nodes[c + 1];
                    for (const auto& e : adjList[u]) {
                        if (e.toIndex == v) {
                            candDist += e.distance;
                            break;
                        }
                    }
                }
                totalCandidate.totalDistance = candDist;

                // Check if already in B or A
                bool alreadyExists = false;
                for (const auto& existPath : A) {
                    if (pathsEqual(existPath.nodes, totalCandidate.nodes)) {
                        alreadyExists = true;
                        break;
                    }
                }
                if (!alreadyExists) {
                    for (const auto& existPath : B) {
                        if (pathsEqual(existPath.nodes, totalCandidate.nodes)) {
                            alreadyExists = true;
                            break;
                        }
                    }
                }

                if (!alreadyExists) {
                    B.push_back(totalCandidate);
                }
            }
        }

        if (B.empty()) {
            break;
        }

        // Sort B to find the shortest candidate
        std::sort(B.begin(), B.end(), [](const RawPath& x, const RawPath& y) {
            return x.totalDistance < y.totalDistance;
        });

        RawPath bestCandidate = B.front();
        B.erase(B.begin());
        A.push_back(bestCandidate);

        std::string label = "Alternative Route " + std::to_string(k);
        results.push_back(buildPathResultFromIndices(graph, bestCandidate.nodes, walkingSpeed, label));
    }

    return results;
}

