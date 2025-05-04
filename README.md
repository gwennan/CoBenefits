## Data

The data is not included in the repository because of the size. You need to download the data first and put it in the static/ and staticNotDeployed/ directories

You can run the notebook [dataProcess.ipynb](dataProcess.ipynb) to generate the .parquet files used in the web application.


## Running the app

The atlas is a npm Svelte app.

Install the dependencies:
```
npm i
```

Run the app locally:
```
npm run dev
```

Build the application:
```
npm run build
```
 


## MapUK

The data uses Lower Areas (LSOA), and Local Area Districts (LAD).
The geojson delmitations are in static/maps downloaded from https://geoportal.statistics.gov.uk/datasets/
The .geojson files are geojson while the .json files are topojson, converted with the command

```bash
geo2topo input.geojson > output.topojson
```
