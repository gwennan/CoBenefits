// Map Component using Maplinre
import * as d3 from 'd3';
import * as Plot from "@observablehq/plot";
import {onMount} from 'svelte';

import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css";
import * as topojson from "topojson-client";
import {getCustomCBData, getTableData, getTotalPerPathway} from "$lib/duckdb";
import {type CoBenefit, COBENEFS, type Scenario} from "../../globals";
import {Legend} from "$lib/utils";


// does this work??
import {load} from "../../routes/+layout";


const LSOAzonesPath = 'maps/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824.json';
// const LADzonesPath = 'maps/LAD.json';
const LADzonesPath = 'maps/LAD2.json';


// let datazones = await load().then(data => data.datazones);
let datazones = await d3.json(LSOAzonesPath)
datazones = topojson.feature(datazones, datazones.objects["Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824"]);

let LADZones = await d3.json(LADzonesPath)
// LADZones = topojson.feature(LADZones, LADZones.objects["Local_Authority_Districts_December_2024_Boundaries_UK_BGC_-8811838383176485936"]);
LADZones = topojson.feature(LADZones, LADZones.objects["Local_Authority_Districts_December_2011_GB_BGC_2022_484504071141336946"]);


export class Map {
    colorScale: d3.ScaleDiverging<any>;
    map: maplibregl.Map;
    center: [number, number];
    data: Array<any>;
    component: HTMLElement;
    dataZoneToValue: Record<string, number>;
    tooltip: HTMLElement;
    geojson;
    granularity;
    loaded: boolean
    dataKey: string;
    border: boolean


    constructor(data, granularity: "LSOA" | "LAD", component: HTMLElement, dataKey = "val", border = false) {
        // this.data = data;
        this.component = component;
        this.dataZoneToValue = {};
        this.granularity = granularity;
        this.dataKey = dataKey;
        this.loaded = false;
        this.border = border;

        this.loadData(data);

        // UK centering
        // this.center = [-3.19648, 55.95206] // Edn
        // this.center = [-0.12574, 51.50853] // London
        this.center = [-1.54785, 53.79648] // Leeds

        this.map = new maplibregl.Map({
            container: 'map', // container id
            // style: 'https://demotiles.maplibre.org/style.json', // style URL
            style: {version: 8, sources: {}, layers: []},
            center: this.center, // starting position [lng, lat]
            zoom: 5, // starting zoom
            preserveDrawingBuffer: true,
        });

        // console.log("MAP ", datazones)

        // legendSvg = Legend(colorScale, {
        //     title: "Cobenefits (Millions of £)"
        // })
        // legendDiv.append(legendSvg)
        // document.querySelector("#legend").append(leg)

        this.tooltip = document.createElement('div');
        this.tooltip.style.position = "absolute";
        this.tooltip.style.backgroundColor = "white";
        this.tooltip.style.padding = "5px";
        this.tooltip.style.border = "1px solid black";
        this.tooltip.style.pointerEvents = "none";
        this.tooltip.style.display = "none";
        this.component.append(this.tooltip);
    }

    reset() {
        this.dataZoneToValue = {};
        this.loaded = false;
    }

    loadData(data) {
        this.data = data;

        let justHighlightArea = false;
        if (!Array.isArray(this.data)) {
            // console.log(2323232323, this.data)
            justHighlightArea = true;
        }

        if (justHighlightArea) {
            if (this.granularity != "LAD") throw "Only works for LAD";
            this.geojson = LADZones;

            for (let zone of this.geojson.features) {
                // let zoneId = zone.properties.LAD24CD;
                let zoneId = zone.properties.lad11cd;

                if (zoneId == data) {
                    zone.properties.value = 1
                } else {
                    zone.properties.value = 0
                }
            }
        } else {
            if (this.granularity == "LAD") {
                this.geojson = LADZones;

                data.forEach((d) => {
                    // change total for time selection
                    this.dataZoneToValue[d.Lookup_Value] = d[this.dataKey];
                })

                // Put cobenef values inside the geojson for maplibre rendering
                for (let zone of this.geojson.features) {
                    // let zoneId = zone.properties.LAD24CD;
                    let zoneId = zone.properties.lad11cd;
                    zone.properties.value = this.dataZoneToValue[zoneId]
                }
            } else {
                this.geojson = datazones;

                data.forEach((d) => {
                    // change total for time selection
                    this.dataZoneToValue[d.Lookup_Value] = d[this.dataKey];
                })

                // Put cobenef values inside the geojson for maplibre rendering
                for (let zone of this.geojson.features) {
                    let zoneId = zone.properties.LSOA21CD;
                    zone.properties.value = this.dataZoneToValue[zoneId]
                    // console.log(this.dataZoneToValue[zoneId], zoneId)
                }
            }
        }
        // console.log(" OK ", this.dataZoneToValue, Object.keys(this.dataZoneToValue).length)


        let domain;
        if (justHighlightArea) {
            domain = [0, 1]
            this.colorScale = d3.scaleLinear()
                .domain(domain)
                .range(["white", "red"])

        } else {
            domain = d3.extent(data.map(d => d[this.dataKey]));
            // domain.splice(1, 0, 0);
            // if (domain[0] >= 0) {
            //     domain[0] = -0.1;
            // }

            // this.colorScale = d3.scaleDiverging()
            //     .domain(domain)
            //     // .interpolator(d3.interpolatePuOr)
            //     .interpolator(d3.interpolateBrBG)

            // Remove outlier values from the scale otherwise we dont see anything
            if (this.granularity == "LSOA") {
                domain[0] = 0;
                domain[domain.length - 1] = d3.mean(data.map(d => d[this.dataKey])) + d3.variance(data.map(d => d[this.dataKey]));
            }

            this.colorScale = d3.scaleSequential()
                .domain(domain)
                .interpolator(d3.interpolateCividis)
                // .interpolator(d3.interpolateYlGnBu)
                // .range(d3.interpolatePuBuGn)


            // console.log(d3.mean(data.map(d => d.val)))
            // console.log(d3.min(data.map(d => d.val)))
            // console.log(d3.max(data.map(d => d.val)))
            // console.log("DOMAIN ", domain, this.dataKey)
        }

    }

    loadLayers() {
        // Add data source
        this.map.addSource('datazones', {
            type: 'geojson',
            data: this.geojson
        });

        this.map.addLayer({
            id: 'fill',
            type: 'fill',
            source: 'datazones',
            paint: {
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'value'], // Replace with your data property
                    ...this.colorScale.domain().flatMap((d) => [d, this.colorScale(d)])
                ],
                'fill-opacity': 0.9
            }
        });

        // Optional: Add border
        if (this.border) {
        // if (true) {
            this.map.addLayer({
                id: 'state-borders',
                type: 'line',
                source: 'datazones',
                paint: {
                    'line-color': '#000000',
                    'line-width': 0.4
                }
            });
        }

        this.loaded = true;
    }

    initMap() {
        this.map.on('style.load', () => {
            this.loadLayers();
        })

        this.map.on('mousemove', (event) => {

            const zones = this.map.queryRenderedFeatures(event.point, {
                layers: ['fill']
            });

            let zone = zones[0];

            if (zone) {
                let cobenefValue = zone.properties.value;
                this.tooltip.innerHTML = `
                 Zone: ${this.zoneName(zone)}
                 <br>
                 Value: ${cobenefValue}
                 `;
                this.tooltip.style.left = event.point.x + 10 + 'px';
                this.tooltip.style.top = event.point.y + 10 + 'px';
                this.tooltip.style.display = 'block';
            } else {
                this.tooltip.style.display = 'none';
            }
        });

        // // Listen for zoom events
        // this.map.on('zoom',  () => {
        //     const currentZoom = this.map.getZoom();
        //
        //     // console.log("zz ", currentZoom);
        //     if (currentZoom > 8) {
        //         // Zoom level is greater than the threshold, update the layer
        //         this.granularity = "LSOA"
        //
        //     } else {
        //         // Zoom level is below or equal to the threshold, revert changes
        //     }
        // });
    }

    update = (newData) => {
        if (!this.loaded) return;

        this.loadData(newData);

        // Put cobenef values inside the geojson for maplibre rendering
        for (let zone of this.geojson.features) {

            // let zoneId = this.granularity == "LSOA" ? zone.properties.LSOA21CD : zone.properties.LAD24CD;
            let zoneId = this.granularity == "LSOA" ? zone.properties.LSOA21CD : zone.properties.lad11cd;

            zone.properties.value = this.dataZoneToValue[zoneId]
        }
        //
        // // Add data source
        this.map.getSource('datazones').setData(
            this.geojson
        );
    }

    legend() {
        let legendSvg = Legend(this.colorScale, {
            title: "Cobenefits (Millions of £)"
        })
        return legendSvg;
    }

    zoneName(zone) {
        // return this.granularity == "LSOA" ? zone.properties.LSOA21CD : zone.properties.LAD24CD;
        return this.granularity == "LSOA" ? zone.properties.LSOA21CD : zone.properties.lad11cd;
    }
}