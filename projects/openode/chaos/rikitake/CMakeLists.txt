####################################################
#  Warning: Autogenerated and subjected to change  #
#  Sun Aug 12 2014 18:47:20 GMT+1000 (AEST)        #
#  Path: ./CMakeLists.txt                          #
#  Generator mark: G5416829841                     #
####################################################

cmake_minimum_required(VERSION 2.8.9)

project(chaos_rikitake)

find_package(Threads)

include_directories(.)

# Detect operating system
if(${CMAKE_SYSTEM_NAME} STREQUAL "Linux")
    add_definitions(-DSYSTEM_LINUX)
endif()
if(${CMAKE_SYSTEM_NAME} MATCHES "FreeBSD")
    add_definitions(-DSYSTEM_FREEBSD)
endif()
if(${CMAKE_SYSTEM_NAME} MATCHES "Windows")
    add_definitions(-DSYSTEM_WINDOWS)
endif()

# settings
set(Boost_USE_STATIC_LIBS OFF)
set(Boost_USE_MULTITHREADED ON)
set(Boost_USE_STATIC_RUNTIME OFF)
set(BOOST_VERSION "1.65.0")
set(CMAKE_MODULE_PATH "/usr/share/SFML/cmake/Modules" ${CMAKE_MODULE_PATH})
# Libraries
find_package(Boost ${BOOST_VERSION} COMPONENTS filesystem regex system thread date_time wave)
find_package(OpenGL)
find_package(GLUT)
find_package(SFML 2.3 REQUIRED graphics window system)
find_package(SDL2)


# Flags
set(CMAKE_CXX_FLAGS         "${CMAKE_CXX_FLAGS} -std=c++17 -Wall -Wconversion -Wfatal-errors -Wextra")
set(CMAKE_CXX_FLAGS_DEBUG   "-Og -g3")
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")

include_directories(SYSTEM ${Boost_INCLUDE_DIR})
include_directories(${Boost_INCLUDE_DIRS})
include_directories(${OPENGL_INCLUDE_DIRS})
include_directories(${GLUT_INCLUDE_DIRS})
include_directories(${SFML_INCLUDE_DIR})
include_directories(${SDL2_INCLUDE_DIRS})

if(NOT Boost_FOUND)
	message(FATAL_ERROR "Boost ${BOOST_VERSION} not found." )
endif()

add_executable(chaos_rikitake
	main.cpp
	auto-coded/types/position.cpp
	hand-coded/systems/rikitakesys/plant_model.cpp
	auto-coded/systems/rikitakesys/manager.cpp
	auto-coded/systems/rikitakesys/solver.cpp
	# transferred libraries
	auto-coded/libs/graphics/chaosgraph.cpp
	auto-coded/libs/graphics/capture.cpp
	auto-coded/libs/graphics/video_writer.cpp
	auto-coded/libs/graphics/window.cpp
	auto-coded/libs/graphics/keyboard.cpp
)

# Link
target_link_libraries(chaos_rikitake ${Boost_LIBRARIES})
target_link_libraries(chaos_rikitake ${CMAKE_THREAD_LIBS_INIT})
target_link_libraries(chaos_rikitake avdevice)
target_link_libraries(chaos_rikitake avfilter)
target_link_libraries(chaos_rikitake avformat)
target_link_libraries(chaos_rikitake avcodec)
target_link_libraries(chaos_rikitake rt)
target_link_libraries(chaos_rikitake dl)
target_link_libraries(chaos_rikitake Xfixes)
target_link_libraries(chaos_rikitake Xext)
target_link_libraries(chaos_rikitake X11)
target_link_libraries(chaos_rikitake asound)
target_link_libraries(chaos_rikitake z)
target_link_libraries(chaos_rikitake swresample)
target_link_libraries(chaos_rikitake swscale)
target_link_libraries(chaos_rikitake avutil)
target_link_libraries(chaos_rikitake m)
target_link_libraries(chaos_rikitake lzma)
target_link_libraries(chaos_rikitake bz2)
target_link_libraries(chaos_rikitake pthread)
target_link_libraries(chaos_rikitake ${OPENGL_LIBRARIES})
target_link_libraries(chaos_rikitake ${GLUT_LIBRARY})
target_link_libraries(chaos_rikitake ${SFML_LIBRARIES} ${SFML_DEPENDENCIES})
target_link_libraries(chaos_rikitake ${SDL2_LIBRARIES})
target_link_libraries(chaos_rikitake stdc++fs)
