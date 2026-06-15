---
title: Move external DLL to the build folder
description: How to copy external third-party DLLs into the CMake build folder on Windows.
date: 2024-04-10 12:00 -03:00
author: Luna G. Cezar
tags:
  - cmake
  - windows
  - dll
---

# Move external DLL to the build folder

**Created:** 2024-04-10

After adding your executable on [[cmakelists]], you can do a file operation with [[cmake]]:

```cmake
if(WIN32 AND (CMAKE_C_COMPILER_ID MATCHES Clang OR MSVC))
	if(EXISTS ${CMAKE_BINARY_DIR}/${CMAKE_BUILD_TYPE} AND NOT EXISTS ${CMAKE_BINARY_DIR}/${CMAKE_BUILD_TYPE}/${YOUR_DLL})
		file(COPY "${PATH_TO_DLL}" DESTINATION ${CMAKE_BINARY_DIR}/${CMAKE_BUILD_TYPE})
	endif()
	if(NOT EXISTS ${CMAKE_BINARY_DIR}/${YOUR_DLL})
		file(COPY "${PATH_TO_DLL}" DESTINATION ${CMAKE_BINARY_DIR})
	endif()
endif()
```

## Variables

**YOUR_DLL** is the name of the DLL that you want to copy

**PATH_TO_DLL** is the path of the DLL provided by the third-party library

[cmakelists]: cmakelists "CMakeLists"
[cmake]: ../cmake "CMake"
