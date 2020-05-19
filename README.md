# in 15 minutes

Get a map of your nearby zone and find out how far you can go in just 15
minutes.

You just need to click on the map to see coloured the zones reachable in that
time, and you can share that map using a qrcode.

A stub for printing the map with the qrcode is also provided.

## Running via `docker-compose`

### 1. Get the `pbf`

You'll need a `.pbf` file of the zone you're interested in (see for example
[here](http://docs.opentripplanner.org/en/latest/Basic-Tutorial/), section 
"OSM for Streets").

Create a `pbf` directory in the project's root; it will be mounted inside the
containers.

### 2. Set limits

In `ugly_conf` you'll find a default configuration for the city of Turin,
Italy. Edit the limits for your latitude and longitude.

(Also note that there is some rounding up of the coordinates, so that queryes
can be afficiently cached).

### 3. Initialize maps

We'll serve our own tiles; for doing so we need to run

```bash
./init.sh
```

### 4. Enjoy

Just run

```bash
docker-compose up
```

Be patient: the tiles server and the isochrone server are pretty big and needs
some time for starting.

