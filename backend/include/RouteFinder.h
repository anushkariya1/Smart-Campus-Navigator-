#ifndef ROUTE_FINDER_H
#define ROUTE_FINDER_H

#include "CampusGraph.h"
#include "Types.h"
#include "Dijkstra.h"
#include "YenKSP.h"
#include "BFS.h"
#include "LocationSearch.h"
#include <nlohmann/json.hpp>
#include <atomic>

class RouteFinder {
private:
    CampusGraph& graph;
    std::atomic<long long> totalQueriesProcessed{0};
    std::atomic<long long> totalDistanceCalculated{0};

public:
    explicit RouteFinder(CampusGraph& g) : graph(g) {}

    PathResult getShortestRoute(
        const std::string& sourceId,
        const std::string& destId,
        double speed = 1.2
    );

    std::vector<PathResult> getAlternativeRoutes(
        const std::string& sourceId,
        const std::string& destId,
        int K = 3,
        double speed = 1.2
    );

    nlohmann::json getNearbyFacilities(
        const std::string& sourceId,
        double speed = 1.2
    );

    BFSResult runBFS(
        const std::string& sourceId,
        int maxHops = 3
    );

    nlohmann::json getNavigationStatistics() const;
    nlohmann::json getAdsaAcademicDetails() const;
};

#endif // ROUTE_FINDER_H

