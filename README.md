# Smart Campus Navigation & Room Finder
## Chandigarh University | Advanced Data Structures & Algorithms (ADSA) Academic Project

[![C++17](https://img.shields.io/badge/C%2B%2B-17-00599C?style=flat&logo=c%2B%2B)](https://isocpp.org/)
[![Crow C++](https://img.shields.io/badge/Crow-REST%20API-red)](https://crowcpp.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![CMake](https://img.shields.io/badge/CMake-4-064F8C?style=flat&logo=cmake)](https://cmake.org/)

A full-stack, enterprise-grade campus navigation system modeled specifically on the **Chandigarh University** campus (NH-05, Mohali, Punjab). The core graph algorithms, shortest-path computations, alternative route generators, and traversals are written natively in **C++17** using the **Crow REST microframework**, coupled with a responsive, modern **React.js + SVG** frontend.

---

## 1. System Architecture

```
                          +------------------------------------------------+
                          |      React 18 + Vite Web Application           |
                          |  - Interactive SVG Campus Map (Zoom/Pan/Click) |
                          |  - Searchable Location Pickers & Preset Tests  |
                          |  - Turn-by-Turn Directions & Walk Time (m/s)   |
                          |  - ADSA Algorithm Modal & BFS Reachability Map |
                          +-----------------------+------------------------+
                                                  |
                                                  | REST JSON (HTTP Port 18080)
                                                  v
                          +------------------------------------------------+
                          |         Crow C++17 Asynchronous Server        |
                          |  - SSSP Dijkstra with Min-Heap Priority Queue  |
                          |  - Yen's K-Shortest Loopless Paths Algorithm   |
                          |  - BFS Breadth-First-Search Wavefront Engine   |
                          |  - Dynamic Pathway Restriction & Rerouting     |
                          |  - Fast O(1) Hash Table Lookup & QuickSort     |
                          +-----------------------+------------------------+
                                                  |
                                                  | Graph Data
                                                  v
                          +------------------------------------------------+
                          |        Adjacency List & JSON Database          |
                          |  - locations.json: 43 campus buildings & gates |
                          |  - pathways.json: 62 junctions, 127 edges     |
                          +------------------------------------------------+
```

---

## 2. Advanced Data Structures & Algorithms (ADSA) Specification

| ADSA Concept | C++ STL / Concrete Implementation | Time Complexity | Space Complexity | Practical Campus Application |
|---|---|---|---|---|
| **Graph Representation** | `std::vector<std::vector<Edge>>` (Adjacency List) | $O(V + E)$ init, $O(\text{deg}(u))$ visit | $O(V + E)$ | Models campus buildings, pathways, and walking intersections without dense matrix overhead. |
| **Dijkstra's Algorithm** | `std::priority_queue<pair<double, int>, vector, greater>` | $O((V + E) \log V)$ | $O(V)$ | Computes the globally optimal walking path and distance between any two university locations. |
| **Alternative Routes** | **Yen's K-Shortest Paths Algorithm** | $O(K \cdot V \cdot (E + V \log V))$ | $O(K \cdot V + E)$ | Generates 3 strictly distinct alternative routes (Shortest, Alt 1, Alt 2) by deviating at spur nodes without duplicate paths. |
| **Breadth First Search** | `std::queue<int>` with boolean visited array | $O(V + E)$ | $O(V)$ | Explores campus reachability level-by-level within $K$ walking hops and validates network connectivity. |
| **Hash Tables** | `std::unordered_map<std::string, int>` | $O(1)$ average | $O(V)$ | Instant lookups from building codes (`D6`, `NC1`, `B1`, etc.) to graph vertex indices. |
| **Sorting** | `std::sort` (Introsort) with lambda comparator | $O(N \log N)$ | $O(\log N)$ | Ranks nearest facilities (libraries, hostels, sports, cafeterias) by metric walking distance. |
| **Dynamic Restriction** | Edge restriction flags in adjacency list relaxation | $O(\text{deg}(u))$ toggle, $O(1)$ check | $O(1)$ per edge | Simulates barricades, construction, and festival closures with instantaneous route recalculation. |

---

## 3. Chandigarh University Locations Mapped

All locations are derived directly from the official campus billboard photograph:

### Academic Blocks
- **A1**: University Institute of Biotechnology (Bioscience, Biotechnology)
- **A2**: University Institute of Architecture & Media Studies (Architecture, Film & Visual Arts, Animation VFX)
- **A3**: University Institute of Liberal Arts, Design & Humanities (Psychology, Fashion Design, Teacher Training)
- **B1**: University Institute of Engineering (CSE Networks, CSE IoT)
- **B2**: University Institute of Tourism & Hospitality Management (Airlines, Culinary Mock Setups)
- **B3**: University Institute of Engineering - Vikramshila (CSE Vikramshila)
- **B4**: Core Engineering Block (Aerospace, Automobile, Chemical, Civil, ECE, Electrical, Mechanical, Mechatronics, Food Tech)
- **B5**: University Institute of Legal Studies (UILS Moot Courts, DACA Cultural Affairs)
- **C1**: Engineering Foundation Block (First-year engineering labs on Main Ground)
- **C2**: Takshila CSE Block (Advanced coding studios)
- **C3**: Engineering Foundation Non-CSE Block (West perimeter of Main Ground)
- **D1**: Apex Institute of Management (MBA AIM)
- **D2**: Apex CSE AI & ML Block (Deep Neural Labs)
- **D3**: Apex Core CSE Block (Systems architecture, compiler design)
- **D4**: Apex Management Senior Wing (BBA Apex, MBA 2nd Year)
- **D5**: University School of Business (BBA 1st Year, Economics)
- **D6**: Knowledge Resource Centre (KRC - Multi-storey Central Campus Library)
- **D7**: Institute of Allied Health Sciences (Optometry, Nutrition, MLS, Forensics, Physiotherapy, Chemistry)
- **D8**: Pharmaceutical Sciences, Nursing & Global Finance (ACCA, BBA AIB)
- **DD1**: University Institute of Sciences (Mathematics, Physical Education & Sports)
- **DD2**: Institute of Sciences - Physics (Optics, Nuclear & Semiconductor Labs)
- **DD3**: Adesh Campus USB Business Block (BBA)
- **DD4**: Adesh Campus Commerce Block (Commerce, Auditing)
- **DD5**: Adesh Campus Engineering Workshops

### Hostels
- **NC1 to NC6**: North Campus Hostels quadrangle surrounding the central Open Theatre
- **Zakir A, B, C, D**: Western residential hostel complex with dining and sports access
- **LC Girls Hostel**: Dedicated multi-wing girls residence near B5 Law School
- **Gobind Hostel**: Located near Gate 3 and northern highway
- **Shivalik Hostel**: Located near Knowledge Resource Centre
- **Sukhna Hostel**: Located north of D-block quadrangle
- **Tapovan Hostel**: Faculty & scholar residences near Main Ground

### Sports, Landmarks & Amenities
- **Sports Complex**: World-class air-conditioned indoor stadium
- **Sports Ground**: Open athletic running tracks, football pitch, cricket nets
- **Main Ground**: University central lush green festival lawn
- **Academic Orientation Venue**: Mega convention pavilion near Gate 3
- **Student Centre & Food Court**: Multi-brand food court, bookstores, ATMs
- **D-Cluster Dome Cafeteria**: Courtyard cafeteria in central D-block quad
- **TBI**: Technology Business Incubator
- **UCRD**: University Centre for Research & Development
- **Kalpana Chawla Space & Research Centre**: Ground satellite tracking station
- **Cultural Performance Venue**: Outdoor concert stage
- **Gates 1, 2, 3, 4**: Campus entrance gates and vehicle checkpoints
- **Student & Staff Parking Lots**: Shaded vehicle lots across campus zones

---

## 4. REST API Documentation

The C++ Crow backend listens on **`http://localhost:18080`**.

### `GET /api/locations`
Returns all registered campus locations with codes, categories, departments, and map coordinates.

### `POST /api/route`
Computes the shortest walking route using Dijkstra.
```json
// Request
{
  "source": "NC1",
  "destination": "D6",
  "speed": 1.2
}

// Response
{
  "valid": true,
  "routeLabel": "Shortest Route",
  "totalDistance": 570.0,
  "walkingTimeSeconds": 475.0,
  "intersectionsCount": 8,
  "nodesCount": 9,
  "nodes": [...],
  "directions": [
    {
      "stepNumber": 1,
      "instruction": "Start from NC1 Boys Hostel and walk 35m along NC1 Hostel North Entrance towards NC Hostels North Walkway.",
      "distance": 35.0,
      "pathwayName": "NC1 Hostel North Entrance"
    },
    ...
  ]
}
```

### `POST /api/alternatives`
Computes $K$ alternative loopless routes using Yen's algorithm.
```json
// Request
{
  "source": "NC1",
  "destination": "D6",
  "k": 3,
  "speed": 1.2
}
```

### `POST /api/nearby`
Finds and ranks all nearby amenities grouped by category (Library, Hostel, Cafeteria, Sports, Academic, Parking, Gate).
```json
// Request
{
  "source": "NC1",
  "speed": 1.2
}
```

### `POST /api/restricted-path`
Toggles pathway barriers (construction, security closures) to force dynamic rerouting.
```json
// Request to block
{
  "u": "J_MAIN_GROUND_SW",
  "v": "J_HOSTELS_GATE",
  "restricted": true
}

// Request to reset
{
  "reset": true
}
```

### `POST /api/bfs`
Executes Breadth First Search up to $K$ hops.
```json
// Request
{
  "source": "NC1",
  "maxHops": 2
}
```

### `GET /api/statistics`
Returns real-time server and graph navigation statistics.

### `GET /api/adsa-info`
Returns formal algorithmic complexity matrices, pseudocode, and implementation roles.

---

## 5. Verification Test Cases

The application includes built-in verification presets corresponding to Section 15 of the ADSA specification:

1. **NC1 → D6 Library**: Hostels to Main Knowledge Resource Centre (570m, 8 waypoints)
2. **NC4 → B1 Engineering**: Hostels to Computer Science IoT block (365m, 8 waypoints)
3. **Zakir A → Sports Complex**: Residential to indoor athletics stadium (225m, direct bypass)
4. **A1 → A3 Liberal Arts**: Inter-departmental pathway via Grand Roundabout (150m)
5. **D6 → Student Centre**: Central Library to Main Food Court (435m)
6. **NC6 → B5 Law School**: Hostels to Legal Studies block (520m)
7. **B1 → Sports Ground**: Engineering to western athletic track (615m)
8. **Zakir D → D1 Management**: Hostels to Apex MBA block (485m)

---

## 6. How to Run the Application on Windows 11

### Prerequisites
- Modern C++ Compiler: GCC 14+ / MinGW-w64 (configured in `D:\tools\w64devkit\bin` or System PATH)
- CMake 3.20+ (`C:\Program Files\CMake\bin`)
- Node.js 18+ and npm (`C:\Program Files\nodejs`)

### One-Click Launch (Recommended)
Double-click `start_project.bat` in the root project folder:
```cmd
start_project.bat
```
This automatically builds the C++ backend (if needed), starts the Crow REST server on port 18080, launches the React Vite frontend on port 5173, and opens your browser.

---

### Manual Launch via Terminal

#### Terminal 1: Build & Run C++ Backend
```powershell
cd "D:\Downloads\ADSA PROJECT\backend"
cmake -B build -S . -G "MinGW Makefiles" -DCMAKE_CXX_COMPILER="D:/tools/w64devkit/bin/g++.exe"
cmake --build build -j 4
cd build
.\smart_campus_server.exe 18080
```

#### Terminal 2: Run React Frontend
```powershell
cd "D:\Downloads\ADSA PROJECT\frontend"
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
Now visit **`http://localhost:5173`** in your browser!

---

## 7. Faculty Demonstration Highlights
When presenting to the ADSA Faculty panel:
1. **Interactive SVG Campus Map**: Click any campus building to inspect details or set start/destination.
2. **ADSA Algorithms Button**: Click the top navbar button to display the full algorithmic complexity analysis and C++ code.
3. **Preset Verification**: Click any of the 8 faculty test cases on the left sidebar to see instant route plotting.
4. **Alternative Routes (Yen's KSP)**: Click "Alternative Routes" and switch tabs between Shortest, Alt 1, and Alt 2.
5. **Dynamic Pathway Barrier Rerouting**: Open "Restricted Paths", block any corridor (e.g. main hostels gate), and observe the route dynamically reroute through the eastern concourse in real-time.
6. **BFS Wavefront**: Open "BFS Explorer", set 2 hops from NC1, and see the ripple animation discover adjacent buildings.

