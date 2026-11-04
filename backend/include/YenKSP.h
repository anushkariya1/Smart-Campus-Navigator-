#ifndef YEN_KSP_H
#define YEN_KSP_H

#include "CampusGraph.h"
#include "Types.h"
#include <vector>

class YenKSP {
public:
    static std::vector<PathResult> findKShortestPaths(
        const CampusGraph& graph,
        int sourceIndex,
        int destIndex,
        int K = 3,
        double walkingSpeed = 1.2
    );
};

#endif // YEN_KSP_H

