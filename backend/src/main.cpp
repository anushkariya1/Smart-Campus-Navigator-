#define ASIO_STANDALONE
#define CROW_MAIN

#include "crow_all.h"
#include "CampusGraph.h"
#include "RouteFinder.h"
#include "LocationSearch.h"
#include <nlohmann/json.hpp>
#include <iostream>
#include <filesystem>

// Helper to serialize PathResult to JSON
nlohmann::json pathResultToJson(const PathResult& path) {
    nlohmann::json j;
    j["valid"] = path.valid;
    j["routeLabel"] = path.routeLabel;
    j["totalDistance"] = path.totalDistance;
    j["walkingTimeSeconds"] = path.walkingTimeSeconds;
    j["intersectionsCount"] = path.intersectionsCount;
    j["nodesCount"] = path.nodesCount;

    nlohmann::json nodesArr = nlohmann::json::array();
    for (size_t i = 0; i < path.nodeIds.size(); ++i) {
        nlohmann::json n;
        n["id"] = path.nodeIds[i];
        n["name"] = path.nodeNames[i];
        n["coordinates"] = {{"x", path.coordinates[i].x}, {"y", path.coordinates[i].y}};
        nodesArr.push_back(n);
    }
    j["nodes"] = nodesArr;

    nlohmann::json dirArr = nlohmann::json::array();
    for (const auto& step : path.directions) {
        nlohmann::json s;
        s["stepNumber"] = step.stepNumber;
        s["instruction"] = step.instruction;
        s["fromNode"] = step.fromNode;
        s["toNode"] = step.toNode;
        s["pathwayName"] = step.pathwayName;
        s["distance"] = step.distance;
        dirArr.push_back(s);
    }
    j["directions"] = dirArr;

    return j;
}

// CORS Helper
crow::response makeJsonResponse(const nlohmann::json& j, int statusCode = 200) {
    crow::response res(statusCode, j.dump());
    res.set_header("Content-Type", "application/json");
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    return res;
}

int main(int argc, char* argv[]) {
    int port = 18080;
    if (argc > 1) {
        try {
            port = std::stoi(argv[1]);
        } catch (...) {}
    }

    // Determine paths for data files
    std::string locPath = "data/locations.json";
    std::string pathPath = "data/pathways.json";

    if (!std::filesystem::exists(locPath)) {
        locPath = "../backend/data/locations.json";
        pathPath = "../backend/data/pathways.json";
    }
    if (!std::filesystem::exists(locPath)) {
        locPath = "backend/data/locations.json";
        pathPath = "backend/data/pathways.json";
    }

    CampusGraph graph;
    if (!graph.loadData(locPath, pathPath)) {
        std::cerr << "Fatal Error: Failed to load campus dataset from " << locPath << std::endl;
        return 1;
    }

    RouteFinder routeFinder(graph);
    crow::SimpleApp app;

    // Global Options Route for CORS Preflight
    CROW_ROUTE(app, "/<path>")
    .methods("OPTIONS"_method)([](const crow::request&, const std::string&) {
        crow::response res(200);
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        return res;
    });

    CROW_ROUTE(app, "/api/<path>")
    .methods("OPTIONS"_method)([](const crow::request&, const std::string&) {
        crow::response res(200);
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        return res;
    });

    // 1. GET /api/locations
    CROW_ROUTE(app, "/api/locations")
    .methods("GET"_method)([&graph]() {
        nlohmann::json j = nlohmann::json::array();
        for (const auto& loc : graph.getAllLocations()) {
            if (!loc.isJunction) {
                j.push_back(graph.toLocationJson(loc));
            }
        }
        return makeJsonResponse(j);
    });

    // 2. GET /api/locations/<id>
    CROW_ROUTE(app, "/api/locations/<string>")
    .methods("GET"_method)([&graph](const std::string& id) {
        const auto* loc = graph.findLocation(id);
        if (!loc) {
            nlohmann::json err;
            err["error"] = "Location not found: " + id;
            return makeJsonResponse(err, 404);
        }
        return makeJsonResponse(graph.toLocationJson(*loc));
    });

    // 3. GET /api/search?q=...&cat=...
    CROW_ROUTE(app, "/api/search")
    .methods("GET"_method)([&graph](const crow::request& req) {
        std::string q = "";
        std::string cat = "all";
        if (req.url_params.get("q") != nullptr) {
            q = req.url_params.get("q");
        }
        if (req.url_params.get("cat") != nullptr) {
            cat = req.url_params.get("cat");
        }

        auto results = LocationSearch::search(graph, q, cat);
        nlohmann::json j = nlohmann::json::array();
        for (const auto& loc : results) {
            j.push_back(graph.toLocationJson(loc));
        }
        return makeJsonResponse(j);
    });

    // 4. POST /api/route (Dijkstra Shortest Path)
    CROW_ROUTE(app, "/api/route")
    .methods("POST"_method)([&routeFinder](const crow::request& req) {
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string source = body.value("source", "");
            std::string destination = body.value("destination", "");
            double speed = body.value("speed", 1.2);

            if (source.empty() || destination.empty()) {
                nlohmann::json err;
                err["error"] = "Both 'source' and 'destination' fields are required.";
                return makeJsonResponse(err, 400);
            }

            PathResult path = routeFinder.getShortestRoute(source, destination, speed);
            if (!path.valid) {
                nlohmann::json err;
                err["error"] = "No available path found between " + source + " and " + destination +
                               ". Paths may be blocked or disconnected.";
                err["valid"] = false;
                return makeJsonResponse(err, 404);
            }

            return makeJsonResponse(pathResultToJson(path));
        } catch (const std::exception& e) {
            nlohmann::json err;
            err["error"] = std::string("Malformed JSON request: ") + e.what();
            return makeJsonResponse(err, 400);
        }
    });

    // 5. POST /api/alternatives (Yen's K-Shortest Paths)
    CROW_ROUTE(app, "/api/alternatives")
    .methods("POST"_method)([&routeFinder](const crow::request& req) {
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string source = body.value("source", "");
            std::string destination = body.value("destination", "");
            int k = body.value("k", 3);
            double speed = body.value("speed", 1.2);

            if (source.empty() || destination.empty()) {
                nlohmann::json err;
                err["error"] = "Both 'source' and 'destination' fields are required.";
                return makeJsonResponse(err, 400);
            }

            auto paths = routeFinder.getAlternativeRoutes(source, destination, k, speed);
            if (paths.empty()) {
                nlohmann::json err;
                err["error"] = "No available routes between " + source + " and " + destination;
                return makeJsonResponse(err, 404);
            }

            nlohmann::json response;
            nlohmann::json arr = nlohmann::json::array();
            for (const auto& p : paths) {
                arr.push_back(pathResultToJson(p));
            }
            response["routes"] = arr;
            response["count"] = paths.size();
            return makeJsonResponse(response);
        } catch (const std::exception& e) {
            nlohmann::json err;
            err["error"] = std::string("Malformed JSON request: ") + e.what();
            return makeJsonResponse(err, 400);
        }
    });

    // 6. POST /api/nearby (Nearest Facilities Finder)
    CROW_ROUTE(app, "/api/nearby")
    .methods("POST"_method)([&routeFinder](const crow::request& req) {
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string source = body.value("source", "");
            double speed = body.value("speed", 1.2);

            if (source.empty()) {
                nlohmann::json err;
                err["error"] = "'source' field is required.";
                return makeJsonResponse(err, 400);
            }

            auto res = routeFinder.getNearbyFacilities(source, speed);
            return makeJsonResponse(res);
        } catch (const std::exception& e) {
            nlohmann::json err;
            err["error"] = std::string("Malformed JSON request: ") + e.what();
            return makeJsonResponse(err, 400);
        }
    });

    // 7. GET /api/graph (Full SVG Map Graph Network)
    CROW_ROUTE(app, "/api/graph")
    .methods("GET"_method)([&graph]() {
        return makeJsonResponse(graph.getGraphJson());
    });

    // 8. POST /api/restricted-path (Toggle Pathway Restriction)
    CROW_ROUTE(app, "/api/restricted-path")
    .methods("POST"_method)([&graph](const crow::request& req) {
        try {
            auto body = nlohmann::json::parse(req.body);
            if (body.contains("reset") && body["reset"].get<bool>()) {
                graph.resetRestrictions();
                nlohmann::json res;
                res["status"] = "ok";
                res["message"] = "All pathway restrictions reset.";
                return makeJsonResponse(res);
            }

            std::string u = body.value("u", "");
            std::string v = body.value("v", "");
            bool restricted = body.value("restricted", true);

            if (u.empty() || v.empty()) {
                nlohmann::json err;
                err["error"] = "Both 'u' and 'v' node IDs are required.";
                return makeJsonResponse(err, 400);
            }

            bool ok = graph.setEdgeRestricted(u, v, restricted);
            nlohmann::json res;
            if (ok) {
                res["status"] = "ok";
                res["message"] = "Updated restriction between " + u + " and " + v;
                res["restricted"] = restricted;
            } else {
                res["status"] = "error";
                res["message"] = "Could not find edge between " + u + " and " + v;
                return makeJsonResponse(res, 404);
            }
            return makeJsonResponse(res);
        } catch (const std::exception& e) {
            nlohmann::json err;
            err["error"] = std::string("Malformed JSON request: ") + e.what();
            return makeJsonResponse(err, 400);
        }
    });

    // 9. GET /api/restricted-paths (List Restricted Edges)
    CROW_ROUTE(app, "/api/restricted-paths")
    .methods("GET"_method)([&graph]() {
        nlohmann::json res;
        res["restrictedPaths"] = graph.getRestrictedEdges();
        return makeJsonResponse(res);
    });

    // 10. POST /api/bfs (Breadth First Search Traversal)
    CROW_ROUTE(app, "/api/bfs")
    .methods("POST"_method)([&routeFinder](const crow::request& req) {
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string source = body.value("source", "");
            int maxHops = body.value("maxHops", 3);

            if (source.empty()) {
                nlohmann::json err;
                err["error"] = "'source' field is required.";
                return makeJsonResponse(err, 400);
            }

            auto bfsRes = routeFinder.runBFS(source, maxHops);
            nlohmann::json j;
            j["sourceId"] = bfsRes.sourceId;
            j["sourceName"] = bfsRes.sourceName;
            j["maxHops"] = bfsRes.maxHops;
            j["totalVisited"] = bfsRes.totalVisited;
            j["traversalOrder"] = bfsRes.traversalOrder;

            nlohmann::json visitedArr = nlohmann::json::array();
            for (const auto& item : bfsRes.visitedNodes) {
                nlohmann::json v;
                v["id"] = item.id;
                v["code"] = item.code;
                v["name"] = item.name;
                v["category"] = item.category;
                v["hops"] = item.hops;
                v["coordinates"] = {{"x", item.coordinates.x}, {"y", item.coordinates.y}};
                v["isJunction"] = item.isJunction;
                visitedArr.push_back(v);
            }
            j["visitedNodes"] = visitedArr;

            return makeJsonResponse(j);
        } catch (const std::exception& e) {
            nlohmann::json err;
            err["error"] = std::string("Malformed JSON request: ") + e.what();
            return makeJsonResponse(err, 400);
        }
    });

    // 11. GET /api/statistics
    CROW_ROUTE(app, "/api/statistics")
    .methods("GET"_method)([&routeFinder]() {
        return makeJsonResponse(routeFinder.getNavigationStatistics());
    });

    // 12. GET /api/adsa-info
    CROW_ROUTE(app, "/api/adsa-info")
    .methods("GET"_method)([&routeFinder]() {
        return makeJsonResponse(routeFinder.getAdsaAcademicDetails());
    });

    std::cout << "============================================================" << std::endl;
    std::cout << "  Chandigarh University Smart Campus Navigation Server" << std::endl;
    std::cout << "  Advanced Data Structures & Algorithms (ADSA) Backend" << std::endl;
    std::cout << "  Port: " << port << " | Listening for REST requests..." << std::endl;
    std::cout << "============================================================" << std::endl;

    app.port(port).multithreaded().run();
    return 0;
}

