#include "Dijkstra.h"
#include <queue>
#include <limits>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <cmath>

PathResult Dijkstra::findShortestPath(
    const CampusGraph& graph,
    int sourceIndex,
    int destIndex,
    double walkingSpeed,
    const std::unordered_set<int>& excludedNodes,
    const std::vector<std::pair<int, int>>& excludedEdges
) {
    PathResult result;
    int n = graph.getNumVertices();

    if (sourceIndex < 0 || sourceIndex >= n || destIndex < 0 || destIndex >= n) {
        result.valid = false;
        return result;
    }

    if (sourceIndex == destIndex) {
        result.valid = true;
        result.totalDistance = 0;
        result.walkingTimeSeconds = 0;
        result.nodesCount = 1;
        result.intersectionsCount = 0;
        const auto& loc = graph.getLocation(sourceIndex);
        result.nodeIds.push_back(loc.id);
        result.nodeNames.push_back(loc.name);
        result.coordinates.push_back(loc.coordinates);

        StepDirection step;
        step.stepNumber = 1;
        step.instruction = "You are already at " + loc.name + ".";
        step.fromNode = loc.name;
        step.toNode = loc.name;
        step.pathwayName = "Current Location";
        step.distance = 0;
        result.directions.push_back(step);
        return result;
    }

    const double INF = std::numeric_limits<double>::infinity();
    std::vector<double> dist(n, INF);
    std::vector<int> parent(n, -1);
    std::vector<std::string> pathwayNames(n, "");
    std::vector<double> legDistance(n, 0.0);

    // Min-priority queue: pair of (distance, vertex_index)
    typedef std::pair<double, int> PQElement;
    std::priority_queue<PQElement, std::vector<PQElement>, std::greater<PQElement>> pq;

    dist[sourceIndex] = 0.0;
    pq.push({0.0, sourceIndex});

    const auto& adjList = graph.getAdjList();

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;
        if (u == destIndex) break; // Reached target

        for (const auto& edge : adjList[u]) {
            int v = edge.toIndex;

            // Skip restricted edges
            if (edge.restricted) continue;

            // Skip excluded nodes
            if (excludedNodes.find(v) != excludedNodes.end()) continue;

            // Skip excluded edges
            bool isExcludedEdge = false;
            for (const auto& ee : excludedEdges) {
                if ((ee.first == u && ee.second == v) || (ee.first == v && ee.second == u)) {
                    isExcludedEdge = true;
                    break;
                }
            }
            if (isExcludedEdge) continue;

            // Edge Relaxation
            double newDist = dist[u] + edge.distance;
            if (newDist < dist[v]) {
                dist[v] = newDist;
                parent[v] = u;
                pathwayNames[v] = edge.name;
                legDistance[v] = edge.distance;
                pq.push({newDist, v});
            }
        }
    }

    // Check if target is reachable
    if (dist[destIndex] == INF) {
        result.valid = false;
        return result;
    }

    // Reconstruct path from destination to source
    std::vector<int> pathIndices;
    std::vector<double> legs;
    std::vector<std::string> pNames;

    int curr = destIndex;
    while (curr != -1) {
        pathIndices.push_back(curr);
        if (parent[curr] != -1) {
            legs.push_back(legDistance[curr]);
            pNames.push_back(pathwayNames[curr]);
        }
        curr = parent[curr];
    }

    std::reverse(pathIndices.begin(), pathIndices.end());
    std::reverse(legs.begin(), legs.end());
    std::reverse(pNames.begin(), pNames.end());

    result.valid = true;
    result.totalDistance = dist[destIndex];
    if (walkingSpeed <= 0.1) walkingSpeed = 1.2;
    result.walkingTimeSeconds = result.totalDistance / walkingSpeed;
    result.nodesCount = static_cast<int>(pathIndices.size());

    int junctions = 0;
    for (int idx : pathIndices) {
        const auto& loc = graph.getLocation(idx);
        result.nodeIds.push_back(loc.id);
        result.nodeNames.push_back(loc.name);
        result.coordinates.push_back(loc.coordinates);
        if (loc.isJunction) junctions++;
    }
    result.intersectionsCount = junctions;

    // Generate human readable directions
    result.directions = generateTurnByTurnDirections(graph, pathIndices, legs, pNames);

    return result;
}

std::vector<double> Dijkstra::calculateAllDistances(
    const CampusGraph& graph,
    int sourceIndex,
    std::vector<int>& outParents
) {
    int n = graph.getNumVertices();
    const double INF = std::numeric_limits<double>::infinity();
    std::vector<double> dist(n, INF);
    outParents.assign(n, -1);

    if (sourceIndex < 0 || sourceIndex >= n) return dist;

    typedef std::pair<double, int> PQElement;
    std::priority_queue<PQElement, std::vector<PQElement>, std::greater<PQElement>> pq;

    dist[sourceIndex] = 0.0;
    pq.push({0.0, sourceIndex});

    const auto& adjList = graph.getAdjList();

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (const auto& edge : adjList[u]) {
            if (edge.restricted) continue;
            int v = edge.toIndex;
            double newDist = dist[u] + edge.distance;
            if (newDist < dist[v]) {
                dist[v] = newDist;
                outParents[v] = u;
                pq.push({newDist, v});
            }
        }
    }

    return dist;
}

std::vector<StepDirection> Dijkstra::generateTurnByTurnDirections(
    const CampusGraph& graph,
    const std::vector<int>& pathIndices,
    const std::vector<double>& legDistances,
    const std::vector<std::string>& pathwayNames
) {
    std::vector<StepDirection> steps;
    if (pathIndices.size() < 2) return steps;

    int stepNum = 1;

    for (size_t i = 0; i < legDistances.size(); ++i) {
        int uIdx = pathIndices[i];
        int vIdx = pathIndices[i + 1];
        const auto& uLoc = graph.getLocation(uIdx);
        const auto& vLoc = graph.getLocation(vIdx);
        double dist = legDistances[i];
        std::string pName = pathwayNames[i];

        StepDirection step;
        step.stepNumber = stepNum++;
        step.fromNode = uLoc.name;
        step.toNode = vLoc.name;
        step.pathwayName = pName;
        step.distance = dist;

        std::ostringstream ss;
        if (i == 0) {
            ss << "Start from " << uLoc.name << " and walk " << std::fixed << std::setprecision(0) << dist
               << "m along " << pName;
            if (vLoc.isJunction) {
                ss << " towards " << vLoc.name << ".";
            } else {
                ss << " to " << vLoc.name << ".";
            }
        } else if (i == legDistances.size() - 1) {
            ss << "Continue for " << std::fixed << std::setprecision(0) << dist << "m along " << pName
               << " and arrive at your destination: " << vLoc.name << ".";
        } else {
            // Calculate cardinal angle if possible
            double dx = vLoc.coordinates.x - uLoc.coordinates.x;
            double dy = vLoc.coordinates.y - uLoc.coordinates.y;
            std::string dir = "Follow";
            if (std::abs(dx) > std::abs(dy)) {
                dir = (dx > 0) ? "Head east along" : "Head west along";
            } else {
                dir = (dy > 0) ? "Head south along" : "Head north along";
            }
            ss << dir << " " << pName << " for " << std::fixed << std::setprecision(0) << dist
               << "m towards " << vLoc.name << ".";
        }

        step.instruction = ss.str();
        steps.push_back(step);
    }

    return steps;
}

