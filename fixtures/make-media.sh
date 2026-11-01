#!/bin/bash
# Synthetic test media (ffmpeg test pattern + tone). No third-party content. Output goes to fixtures/media (gitignored).
set -e
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "ffmpeg not found (brew install ffmpeg)"; exit 1; }
mkdir -p media/hls
SRC=(-f lavfi -i "testsrc2=size=640x360:rate=30" -f lavfi -i "sine=frequency=440:sample_rate=48000" -t 30)
ENC=(-c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p -g 60 -keyint_min 60 -sc_threshold 0 -c:a aac -b:a 96k -ar 48000 -ac 2)
ffmpeg -y -loglevel error "${SRC[@]}" "${ENC[@]}" -movflags +faststart media/sample.mp4
ffmpeg -y -loglevel error -i media/sample.mp4 -c copy -movflags frag_keyframe+empty_moov+default_base_moof media/sample-frag.mp4
ffmpeg -y -loglevel error -i media/sample.mp4 -c copy -f hls -hls_time 4 -hls_playlist_type vod -hls_segment_filename media/hls/seg%03d.ts media/hls/index.m3u8
ls -la media media/hls | grep -v '^total'
