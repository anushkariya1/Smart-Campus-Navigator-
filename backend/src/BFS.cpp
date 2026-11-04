#include "BFS.h"
#include <queue>
#include <vector>

BFSResult BFS::traverse(
    const CampusGraph& graph,
    int sourceIndex,
    int maxHops
) {
    BFSResult result;
    int n = graph.getNumVertices();
    if (sourceIndex < 0 || sourceIndex >= n) {
        return result;
    }

    const auto& srcLoc = graph.getLocation(sourceIndex);
    result.sourceId = srcLoc.id;
    result.sourceName = srcLoc.name;
    result.maxHops = maxHops;

    std::vector<bool> visited(n, false);
    std::vector<int> hops(n, -1);
    std::queue<int> q;

    visited[sourceIndex] = true;
    hops[sourceIndex] = 0;
    q.push(sourceIndex);

    const auto& adjList = graph.getAdjList();

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        const auto& uLoc = graph.getLocation(u);
        result.traversalOrder.push_back(uLoc.id);

        BFSNodeResult nr;
        nr.id = uLoc.id;
        nr.code = uLoc.code;
        nr.name = uLoc.name;
        nr.category = uLoc.category;
        nr.hops = hops[u];
        nr.coordinates = uLoc.coordinates;
        nr.isJunction = uLoc.isJunction;
        result.visitedNodes.push_back(nr);

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
    }

    result.totalVisited = static_cast<int>(result.visitedNodes.size());
    return result;
}

std::vector<std::string> BFS::getConnectedComponent(
    const CampusGraph& graph,
    int sourceIndex
) {
    std::vector<std::string> comp;
    int n = graph.getNumVertices();
    if (sourceIndex < 0 || sourceIndex >= n) return comp;

    std::vector<bool> visited(n, false);
    std::queue<int> q;

    visited[sourceIndex] = true;
    q.push(sourceIndex);

    const auto& adjList = graph.getAdjList();

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        comp.push_back(graph.getLocation(u).id);

        for (const auto& edge : adjList[u]) {
            if (edge.restricted) continue;
            int v = edge.toIndex;
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }

    return comp;
}

