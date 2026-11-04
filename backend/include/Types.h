#ifndef TYPES_H
#define TYPES_H

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

struct Coordinate {
    double x = 0;
    double y = 0;
};

struct Location {
    std::string id;
    std::string code;
    std::string name;
    std::string category; // academic, hostel, sports, library, admin, parking, gate, landmark, cafeteria
    std::vector<std::string> departments;
    Coordinate coordinates;
    double width = 40;
    double height = 40;
    std::string description;
    std::string color = "#3182CE";
    bool isJunction = false;
};

struct Edge {
    int toIndex;
    std::string toId;
    double distance; // in meters
    std::string name;
    bool restricted = false;
    int edgeId = 0;
};

struct StepDirection {
    int stepNumber;
    std::string instruction;
    std::string fromNode;
    std::string toNode;
    std::string pathwayName;
    double distance; // in meters
};

struct PathResult {
    std::vector<std::string> nodeIds;
    std::vector<std::string> nodeNames;
    std::vector<Coordinate> coordinates;
    std::vector<StepDirection> directions;
    double totalDistance = 0; // in meters
    double walkingTimeSeconds = 0; // in seconds
    int intersectionsCount = 0;
    int nodesCount = 0;
    bool valid = false;
    std::string routeLabel = "Shortest Route";
};

struct NearbyFacility {
    std::string id;
    std::string code;
    std::string name;
    std::string category;
    double distance; // in meters
    double walkingTimeSeconds;
    std::string description;
};

#endif // TYPES_H

