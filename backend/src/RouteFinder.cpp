#include "RouteFinder.h"
#include <map>
#include <limits>

PathResult RouteFinder::getShortestRoute(
    const std::string& sourceId,
    const std::string& destId,
    double speed
) {
    int srcIdx = graph.getNodeIndex(sourceId);
    int dstIdx = graph.getNodeIndex(destId);

    PathResult res;
    if (srcIdx == -1 || dstIdx == -1) {
        res.valid = false;
        return res;
    }

    res = Dijkstra::findShortestPath(graph, srcIdx, dstIdx, speed);
    if (res.valid) {
        totalQueriesProcessed++;
        totalDistanceCalculated += static_cast<long long>(res.totalDistance);
    }
    return res;
}

std::vector<PathResult> RouteFinder::getAlternativeRoutes(
    const std::string& sourceId,
    const std::string& destId,
    int K,
    double speed
) {
    int srcIdx = graph.getNodeIndex(sourceId);
    int dstIdx = graph.getNodeIndex(destId);

    if (srcIdx == -1 || dstIdx == -1) {
        return {};
    }

    auto paths = YenKSP::findKShortestPaths(graph, srcIdx, dstIdx, K, speed);
    if (!paths.empty()) {
        totalQueriesProcessed++;
        totalDistanceCalculated += static_cast<long long>(paths[0].totalDistance);
    }
    return paths;
}

nlohmann::json RouteFinder::getNearbyFacilities(
    const std::string& sourceId,
    double speed
) {
    int srcIdx = graph.getNodeIndex(sourceId);
    nlohmann::json response;
    if (srcIdx == -1) {
        response["error"] = "Invalid source location: " + sourceId;
        return response;
    }

    std::vector<int> parents;
    std::vector<double> dist = Dijkstra::calculateAllDistances(graph, srcIdx, parents);

    std::map<std::string, std::vector<NearbyFacility>> categorized;

    for (int i = 0; i < graph.getNumVertices(); ++i) {
        if (i == srcIdx) continue;
        const auto& loc = graph.getLocation(i);
        if (loc.isJunction) continue;
        if (std::isinf(dist[i])) continue; // unreachable

        NearbyFacility fac;
        fac.id = loc.id;
        fac.code = loc.code;
        fac.name = loc.name;
        fac.category = loc.category;
        fac.distance = dist[i];
        if (speed <= 0.1) speed = 1.2;
        fac.walkingTimeSeconds = dist[i] / speed;
        fac.description = loc.description;

        categorized[loc.category].push_back(fac);
    }

    // Sort each category by distance
    nlohmann::json categoriesJson;
    for (auto& pair : categorized) {
        auto sortedList = LocationSearch::rankFacilitiesByDistance(pair.second);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& item : sortedList) {
            nlohmann::json itemJson;
            itemJson["id"] = item.id;
            itemJson["code"] = item.code;
            itemJson["name"] = item.name;
            itemJson["category"] = item.category;
            itemJson["distance"] = item.distance;
            itemJson["walkingTimeSeconds"] = item.walkingTimeSeconds;
            itemJson["description"] = item.description;
            arr.push_back(itemJson);
        }
        categoriesJson[pair.first] = arr;
    }

    // Top highlights: nearest of each key service
    nlohmann::json highlights;
    auto getNearest = [&](const std::string& cat) -> nlohmann::json {
        if (categoriesJson.contains(cat) && !categoriesJson[cat].empty()) {
            return categoriesJson[cat][0];
        }
        return nullptr;
    };

    highlights["library"] = getNearest("library");
    highlights["hostel"] = getNearest("hostel");
    highlights["academic"] = getNearest("academic");
    highlights["sports"] = getNearest("sports");
    highlights["cafeteria"] = getNearest("cafeteria");
    highlights["parking"] = getNearest("parking");
    highlights["gate"] = getNearest("gate");
    highlights["admin"] = getNearest("admin");

    response["source"] = graph.toLocationJson(graph.getLocation(srcIdx));
    response["highlights"] = highlights;
    response["categorized"] = categoriesJson;

    return response;
}

BFSResult RouteFinder::runBFS(const std::string& sourceId, int maxHops) {
    int srcIdx = graph.getNodeIndex(sourceId);
    if (srcIdx == -1) return BFSResult{};
    return BFS::traverse(graph, srcIdx, maxHops);
}

nlohmann::json RouteFinder::getNavigationStatistics() const {
    nlohmann::json j;
    int buildingCount = 0;
    int junctionCount = 0;
    for (const auto& loc : graph.getAllLocations()) {
        if (loc.isJunction) junctionCount++;
        else buildingCount++;
    }

    int totalEdges = 0;
    for (const auto& adj : graph.getAdjList()) {
        totalEdges += static_cast<int>(adj.size());
    }
    totalEdges /= 2; // undirected

    auto restrictedList = graph.getRestrictedEdges();

    j["totalLocations"] = graph.getNumVertices();
    j["buildingsCount"] = buildingCount;
    j["junctionsCount"] = junctionCount;
    j["walkingConnections"] = totalEdges;
    j["restrictedPathsCount"] = restrictedList.size();
    j["queriesProcessed"] = totalQueriesProcessed.load();
    j["totalMetersCalculated"] = totalDistanceCalculated.load();
    j["averageDistanceMeters"] = (totalQueriesProcessed > 0)
        ? (totalDistanceCalculated.load() / totalQueriesProcessed.load())
        : 0;
    return j;
}

nlohmann::json RouteFinder::getAdsaAcademicDetails() const {
    nlohmann::json j;
    j["title"] = "Advanced Data Structures & Algorithms (ADSA) Specification";
    j["project"] = "Smart Campus Navigation & Room Finder - Chandigarh University";
    
    nlohmann::json concepts = nlohmann::json::array();

    concepts.push_back({
        {"concept", "Graph Representation"},
        {"implementation", "Undirected, weighted graph via Adjacency List: std::vector<std::vector<Edge>>"},
        {"timeComplexity", "O(V + E) memory allocation, O(deg(u)) neighbor iteration"},
        {"spaceComplexity", "O(V + E)"},
        {"roleInProject", "Accurately models campus buildings, gates, outdoor plazas and walking intersections with estimated distances."}
    });

    concepts.push_back({
        {"concept", "Dijkstra's Algorithm"},
        {"implementation", "Min-Priority Queue: std::priority_queue<std::pair<double, int>, std::vector<std::pair<double, int>>, std::greater<...>>"},
        {"timeComplexity", "O((V + E) log V)"},
        {"spaceComplexity", "O(V) for dist, parent, and min-heap arrays"},
        {"roleInProject", "Calculates the globally optimal shortest walking route between any starting point and destination."}
    });

    concepts.push_back({
        {"concept", "Yen's K-Shortest Paths Algorithm"},
        {"implementation", "Loopless K-Shortest Path generation with deviation/spur node graph branching"},
        {"timeComplexity", "O(K * V * (E + V log V))"},
        {"spaceComplexity", "O(K * V + E)"},
        {"roleInProject", "Computes Alternative Route 1 and Alternative Route 2 without loops or duplicate corridors."}
    });

    concepts.push_back({
        {"concept", "Breadth First Search (BFS)"},
        {"implementation", "Queue-based traversal: std::queue<int> with boolean visitation array"},
        {"timeComplexity", "O(V + E)"},
        {"spaceComplexity", "O(V)"},
        {"roleInProject", "Explores reachable campus amenities level-by-level up to K hops and validates graph connectivity."}
    });

    concepts.push_back({
        {"concept", "Hash Map (std::unordered_map)"},
        {"implementation", "String to Index mappings: idToIndex and codeToIndex with average O(1) hash resolution"},
        {"timeComplexity", "O(1) average lookup, O(L) string hashing"},
        {"spaceComplexity", "O(V)"},
        {"roleInProject", "Instantly resolves building codes (e.g. 'D6', 'NC1', 'B1') and location IDs."}
    });

    concepts.push_back({
        {"concept", "Dual-Pivot Quicksort (std::sort)"},
        {"implementation", "Custom lambda comparator on NearbyFacility distance metrics"},
        {"timeComplexity", "O(N log N)"},
        {"spaceComplexity", "O(log N)"},
        {"roleInProject", "Ranks nearest library, cafeterias, hostels, sports, and parking facilities by proximity."}
    });

    concepts.push_back({
        {"concept", "Dynamic Path Restriction"},
        {"implementation", "Runtime edge restriction masking in adjacency list relaxation steps"},
        {"timeComplexity", "O(deg(u)) to toggle, 0 extra time in Dijkstra"},
        {"spaceComplexity", "O(1) boolean flag per edge"},
        {"roleInProject", "Simulates roadblocks, construction, or event barricades, instantly forcing rerouting."}
    });

    j["concepts"] = concepts;
    return j;
}

