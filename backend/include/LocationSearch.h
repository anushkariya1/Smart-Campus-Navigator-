#ifndef LOCATION_SEARCH_H
#define LOCATION_SEARCH_H

#include "CampusGraph.h"
#include "Types.h"
#include <vector>
#include <string>

class LocationSearch {
public:
    static std::vector<Location> search(
        const CampusGraph& graph,
        const std::string& query,
        const std::string& categoryFilter = "all"
    );

    static std::vector<NearbyFacility> rankFacilitiesByDistance(
        std::vector<NearbyFacility> facilities
    );
};

#endif // LOCATION_SEARCH_H

