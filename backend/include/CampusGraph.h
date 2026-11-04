#ifndef CAMPUS_GRAPH_H
#define CAMPUS_GRAPH_H

#include "Types.h"
#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>

class CampusGraph {
private:
    std::vector<Location> locations;
    std::unordered_map<std::string, int> idToIndex;
    std::unordered_map<std::string, int> codeToIndex;
    std::vector<std::vector<Edge>> adjList;
    int nextEdgeId = 1;

public:
    CampusGraph() = default;

    bool loadData(const std::string& locationsFile, const std::string& pathwaysFile);

    int getNodeIndex(const std::string& idOrCode) const;
    const Location& getLocation(int index) const;
    const Location* findLocation(const std::string& idOrCode) const;
    const std::vector<Location>& getAllLocations() const;
    const std::vector<std::vector<Edge>>& getAdjList() const;
    int getNumVertices() const;

    bool setEdgeRestricted(const std::string& uId, const std::string& vId, bool restricted);
    std::vector<nlohmann::json> getRestrictedEdges() const;
    void resetRestrictions();

    nlohmann::json toLocationJson(const Location& loc) const;
    nlohmann::json getGraphJson() const;
};

#endif // CAMPUS_GRAPH_H

