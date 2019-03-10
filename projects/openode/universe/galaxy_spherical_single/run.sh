#!/bin/bash

ulimit -s 81920
./release_build.sh && ./galaxy_spherical_single && ./fix_video.sh

