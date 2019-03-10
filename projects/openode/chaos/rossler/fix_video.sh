#!/bin/bash
rm fixed.mp4
ffmpeg -i video.mp4 -crf 0 -preset veryslow fixed.mp4 

