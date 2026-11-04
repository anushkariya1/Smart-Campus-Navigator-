cmake_minimum_required(VERSION 3.15)
project(SmartCampusNavigationBackend CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

set(SOURCES
    src/main.cpp
    src/CampusGraph.cpp
    src/Dijkstra.cpp
    src/YenKSP.cpp
    src/BFS.cpp
    src/LocationSearch.cpp
    src/RouteFinder.cpp
)

add_executable(smart_campus_server ${SOURCES})

if (WIN32)
    target_link_libraries(smart_campus_server PRIVATE ws2_32 mswsock)
endif()

if (MSVC)
    target_compile_options(smart_campus_server PRIVATE /W4 /O2)
else()
    target_compile_options(smart_campus_server PRIVATE -Wall -Wextra -O3)
endif()

# Copy data files to build directory
add_custom_command(TARGET smart_campus_server POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_CURRENT_SOURCE_DIR}/data
        $<TARGET_FILE_DIR:smart_campus_server>/data
)

