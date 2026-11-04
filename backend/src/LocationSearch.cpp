#include "LocationSearch.h"
#include <algorithm>
#include <cctype>

static std::string toLower(const std::string& str) {
    std::string s = str;
    std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    return s;
}

std::vector<Location> LocationSearch::search(
    const CampusGraph& graph,
    const std::string& query,
    const std::string& categoryFilter
) {
    std::vector<Location> results;
    std::string q = toLower(query);
    std::string cat = toLower(categoryFilter);

    for (const auto& loc : graph.getAllLocations()) {
        // Exclude junction nodes from general building search
        if (loc.isJunction) continue;

        // Apply category filter if not "all"
        if (cat != "all" && !cat.empty()) {
            if (toLower(loc.category) != cat) {
                continue;
            }
        }

        if (q.empty()) {
            results.push_back(loc);
            continue;
        }

        bool match = false;
        if (toLower(loc.code).find(q) != std::string::npos) match = true;
        if (toLower(loc.name).find(q) != std::string::npos) match = true;
        if (toLower(loc.category).find(q) != std::string::npos) match = true;
        if (toLower(loc.description).find(q) != std::string::npos) match = true;

        for (const auto& dep : loc.departments) {
            if (toLower(dep).find(q) != std::string::npos) {
                match = true;
                break;
            }
        }

        if (match) {
            results.push_back(loc);
        }
    }

    // Sort matching results: exact code match first, then alphabetically by code/name
    std::sort(results.begin(), results.end(), [&q](const Location& a, const Location& b) {
        bool aExact = toLower(a.code) == q;
        bool bExact = toLower(b.code) == q;
        if (aExact != bExact) return aExact > bExact;

        bool aStarts = toLower(a.code).rfind(q, 0) == 0;
        bool bStarts = toLower(b.code).rfind(q, 0) == 0;
        if (aStarts != bStarts) return aStarts > bStarts;

        return a.code < b.code;
    });

    return results;
}

std::vector<NearbyFacility> LocationSearch::rankFacilitiesByDistance(
    std::vector<NearbyFacility> facilities
) {
    // Custom comparator to sort ascending by walking distance
    std::sort(facilities.begin(), facilities.end(), [](const NearbyFacility& a, const NearbyFacility& b) {
        if (a.distance != b.distance) {
            return a.distance < b.distance;
        }
        return a.name < b.name;
    });
    return facilities;
}

