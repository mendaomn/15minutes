#!/bin/bash

# init the volume for serving tiles as described in
# https://switch2osm.org/serving-tiles/using-a-docker-container/

cd pbf
docker volume create openstreetmap-data
PBF_FILE=$(ls .)
docker run -v $(pwd)/$PBF_FILE:/data.osm.pbf -v openstreetmap-data:/var/lib/postgresql/12/main overv/openstreetmap-tile-server:1.3.10 import

echo "Init end. Run"
echo "  docker-compose up"
