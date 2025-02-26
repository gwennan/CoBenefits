## Map

The data uses Lower Areas (LSOA), and Local Area Districts (LAD).
The geojson delmitations are in static/maps downloaded from https://geoportal.statistics.gov.uk/datasets/
The .geojson files are geojson while the .json files are topojson, converted with the command

```bash
geo2topo input.geojson > output.topojson
```
