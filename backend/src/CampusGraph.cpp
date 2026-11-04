#include "CampusGraph.h"
#include <fstream>
#include <iostream>
#include <algorithm>

bool CampusGraph::loadData(const std::string& locationsFile, const std::string& pathwaysFile) {
    locations.clear();
    idToIndex.clear();
    codeToIndex.clear();
    adjList.clear();

    // 1. Read locations.json
    std::ifstream locStream(locationsFile);
    if (!locStream.is_open()) {
        std::cerr << "Failed to open locations file: " << locationsFile << std::endl;
        return false;
    }

    nlohmann::json locJson;
    locStream >> locJson;

    for (const auto& item : locJson) {
        Location loc;
        loc.id = item.value("id", "");
        loc.code = item.value("code", "");
        loc.name = item.value("name", "");
        loc.category = item.value("category", "academic");
        if (item.contains("departments") && item["departments"].is_array()) {
            for (const auto& dep : item["departments"]) {
                loc.departments.push_back(dep.get<std::string>());
            }
        }
        if (item.contains("coordinates")) {
            loc.coordinates.x = item["coordinates"].value("x", 0.0);
            loc.coordinates.y = item["coordinates"].value("y", 0.0);
        }
        loc.width = item.value("width", 40.0);
        loc.height = item.value("height", 40.0);
        loc.description = item.value("description", "");
        loc.color = item.value("color", "#3182CE");
        loc.isJunction = false;

        int idx = static_cast<int>(locations.size());
        idToIndex[loc.id] = idx;
        if (!loc.code.empty()) {
            std::string upperCode = loc.code;
            std::transform(upperCode.begin(), upperCode.end(), upperCode.begin(), ::toupper);
            codeToIndex[upperCode] = idx;
        }
        locations.push_back(loc);
    }

    // 2. Read pathways.json (junctions + edges)
    std::ifstream pathStream(pathwaysFile);
    if (!pathStream.is_open()) {
        std::cerr << "Failed to open pathways file: " << pathwaysFile << std::endl;
        return false;
    }

    nlohmann::json pathJson;
    pathStream >> pathJson;

    if (pathJson.contains("junctions") && pathJson["junctions"].is_array()) {
        for (const auto& junc : pathJson["junctions"]) {
            Location loc;
            loc.id = junc.value("id", "");
            loc.code = junc.value("id", "");
            loc.name = junc.value("name", "Pathway Junction");
            loc.category = "junction";
            if (junc.contains("coordinates")) {
                loc.coordinates.x = junc["coordinates"].value("x", 0.0);
                loc.coordinates.y = junc["coordinates"].value("y", 0.0);
            }
            loc.width = 12.0;
            loc.height = 12.0;
            loc.description = "Pathway walking intersection";
            loc.color = "#CBD5E0";
            loc.isJunction = true;

            int idx = static_cast<int>(locations.size());
            idToIndex[loc.id] = idx;
            locations.push_back(loc);
        }
    }

    // Prepare Adjacency List for all vertices
    adjList.resize(locations.size());

    // Load edges
    if (pathJson.contains("edges") && pathJson["edges"].is_array()) {
        for (const auto& e : pathJson["edges"]) {
            std::string uId = e.value("u", "");
            std::string vId = e.value("v", "");
            double distance = e.value("distance", 10.0);
            std::string name = e.value("name", "Campus Pathway");
            bool restricted = e.value("restricted", false);

            if (idToIndex.find(uId) == idToIndex.end() || idToIndex.find(vId) == idToIndex.end()) {
                std::cerr << "Warning: edge refers to unknown node: " << uId << " <-> " << vId << std::endl;
                continue;
            }

            int u = idToIndex[uId];
            int v = idToIndex[vId];
            int curEdgeId = nextEdgeId++;

            Edge e1;
            e1.toIndex = v;
            e1.toId = vId;
            e1.distance = distance;
            e1.name = name;
            e1.restricted = restricted;
            e1.edgeId = curEdgeId;
            adjList[u].push_back(e1);

            Edge e2;
            e2.toIndex = u;
            e2.toId = uId;
            e2.distance = distance;
            e2.name = name;
            e2.restricted = restricted;
            e2.edgeId = curEdgeId;
            adjList[v].push_back(e2);
        }
    }

    std::cout << "Loaded Campus Graph: " << locations.size() << " nodes, " << nextEdgeId - 1 << " undirected edges." << std::endl;
    return true;
}

int CampusGraph::getNodeIndex(const std::string& idOrCode) const {
    if (idToIndex.find(idOrCode) != idToIndex.end()) {
        return idToIndex.at(idOrCode);
    }
    std::string upperCode = idOrCode;
    std::transform(upperCode.begin(), upperCode.end(), upperCode.begin(), ::toupper);
    if (codeToIndex.find(upperCode) != codeToIndex.end()) {
        return codeToIndex.at(upperCode);
    }
    return -1;
}

const Location& CampusGraph::getLocation(int index) const {
    return locations.at(index);
}

const Location* CampusGraph::findLocation(const std::string& idOrCode) const {
    int idx = getNodeIndex(idOrCode);
    if (idx >= 0 && idx < static_cast<int>(locations.size())) {
        return &locations[idx];
    }
    return nullptr;
}

const std::vector<Location>& CampusGraph::getAllLocations() const {
    return locations;
}

const std::vector<std::vector<Edge>>& CampusGraph::getAdjList() const {
    return adjList;
}

int CampusGraph::getNumVertices() const {
    return static_cast<int>(locations.size());
}

bool CampusGraph::setEdgeRestricted(const std::string& uId, const std::string& vId, bool restricted) {
    int u = getNodeIndex(uId);
    int v = getNodeIndex(vId);
    if (u == -1 || v == -1) return false;

    bool found = false;
    for (auto& edge : adjList[u]) {
        if (edge.toIndex == v) {
            edge.restricted = restricted;
            found = true;
        }
    }
    for (auto& edge : adjList[v]) {
        if (edge.toIndex == u) {
            edge.restricted = restricted;
            found = true;
        }
    }
    return found;
}

std::vector<nlohmann::json> CampusGraph::getRestrictedEdges() const {
    std::vector<nlohmann::json> list;
    for (size_t u = 0; u < adjList.size(); ++u) {
        for (const auto& edge : adjList[u]) {
            if (edge.restricted && static_cast<int>(u) < edge.toIndex) {
                nlohmann::json item;
                item["uId"] = locations[u].id;
                item["uName"] = locations[u].name;
                item["vId"] = locations[edge.toIndex].id;
                item["vName"] = locations[edge.toIndex].name;
                item["distance"] = edge.distance;
                item["pathway"] = edge.name;
                item["restricted"] = true;
                list.push_back(item);
            }
        }
    }
    return list;
}

void CampusGraph::resetRestrictions() {
    for (auto& neighbors : adjList) {
        for (auto& edge : neighbors) {
            edge.restricted = false;
        }
    }
}

nlohmann::json CampusGraph::toLocationJson(const Location& loc) const {
    nlohmann::json j;
    j["id"] = loc.id;
    j["code"] = loc.code;
    j["name"] = loc.name;
    j["category"] = loc.category;
    j["departments"] = loc.departments;
    j["coordinates"] = {{"x", loc.coordinates.x}, {"y", loc.coordinates.y}};
    j["width"] = loc.width;
    j["height"] = loc.height;
    j["description"] = loc.description;
    j["color"] = loc.color;
    j["isJunction"] = loc.isJunction;
    return j;
}

nlohmann::json CampusGraph::getGraphJson() const {
    nlohmann::json j;
    nlohmann::json locArray = nlohmann::json::array();
    for (const auto& loc : locations) {
        locArray.push_back(toLocationJson(loc));
    }
    j["locations"] = locArray;

    nlohmann::json edgeArray = nlohmann::json::array();
    for (size_t u = 0; u < adjList.size(); ++u) {
        for (const auto& e : adjList[u]) {
            if (static_cast<int>(u) < e.toIndex) {
                nlohmann::json edgeJson;
                edgeJson["u"] = locations[u].id;
                edgeJson["v"] = locations[e.toIndex].id;
                edgeJson["distance"] = e.distance;
                edgeJson["name"] = e.name;
                edgeJson["restricted"] = e.restricted;
                edgeArray.push_back(edgeJson);
            }
        }
    }
    j["edges"] = edgeArray;
    return j;
}
