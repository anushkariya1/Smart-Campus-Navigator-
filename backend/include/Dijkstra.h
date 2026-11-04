#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include "CampusGraph.h"
#include "Types.h"
#include <vector>
#include <unordered_set>
#include <string>

class Dijkstra {
public:
    static PathResult findShortestPath(
        const CampusGraph& graph,
        int sourceIndex,
        int destIndex,
        double walkingSpeed = 1.2,
        const std::unordered_set<int>& excludedNodes = {},
        const std::vector<std::pair<int, int>>& excludedEdges = {}
    );

    static std::vector<double> calculateAllDistances(
        const CampusGraph& graph,
        int sourceIndex,
        std::vector<int>& outParents
    );

    static std::vector<StepDirection> generateTurnByTurnDirections(
        const CampusGraph& graph,
        const std::vector<int>& pathIndices,
        const std::vector<double>& legDistances,
        const std::vector<std::string>& pathwayNames
    );
};

#endif // DIJKSTRA_H

