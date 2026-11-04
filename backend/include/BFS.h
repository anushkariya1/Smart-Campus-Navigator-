#ifndef BFS_H
#define BFS_H

#include "CampusGraph.h"
#include "Types.h"
#include <vector>
#include <string>
#include <nlohmann/json.hpp>

struct BFSNodeResult {
    std::string id;
    std::string code;
    std::string name;
    std::string category;
    int hops = 0;
    Coordinate coordinates;
    bool isJunction = false;
};

struct BFSResult {
    std::string sourceId;
    std::string sourceName;
    int maxHops = 0;
    int totalVisited = 0;
    std::vector<BFSNodeResult> visitedNodes;
    std::vector<std::string> traversalOrder;
};

class BFS {
public:
    static BFSResult traverse(
        const CampusGraph& graph,
        int sourceIndex,
        int maxHops = 3
    );

    static std::vector<std::string> getConnectedComponent(
        const CampusGraph& graph,
        int sourceIndex
    );
};

#endif // BFS_H

