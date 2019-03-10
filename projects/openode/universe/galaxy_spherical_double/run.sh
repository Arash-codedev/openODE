#!/bin/bash

ulimit -s 81920
./release_build.sh && ./galaxy_spherical_double && ./fix_video.sh

