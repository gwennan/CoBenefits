// Map Component using Maplinre
import * as d3 from 'd3';
import * as Plot from "@observablehq/plot";
import {onMount} from 'svelte';

import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css";
import {getCustomData, getTableData, getTotalPerPathway} from "$lib/duckdb";
import {type CoBenefit, COBENEFS, type Scenario} from "../globals";
import {Legend} from "$lib/utils";

// does this work??
import {load} from "../routes/+layout";


let datazones = await load().then(data => data.datazones);

// console.log("WDJJIDOE", datazones);


export class Map {
    colorScale: d3.ScaleDiverging<any>;
    map: maplibregl.Map;
    center: [number, number];
    data: Array<any>;
    component: HTMLElement;
    dataZoneToValue: Record<string, number>;
    tooltip: HTMLElement;


    constructor(data, component: HTMLElement) {
        this.data = data;
        this.component = component;
        this.dataZoneToValue = {};

        data.forEach((d) => {
            // change total for time selection
            this.dataZoneToValue[d.Lookup_Value] = d["total"];
        })
        // Put cobenef values inside the geojson for maplibre rendering
        for (let zone of datazones.features) {
            let zoneId = zone.properties.LSOA21CD;
            zone.properties.value = this.dataZoneToValue[zoneId]
        }

        let domain = d3.extent(data.map(d => d.total));
        domain.splice(1, 0, 0);

        this.colorScale = d3.scaleDiverging()
            .domain(domain)
            // .interpolator(d3.interpolatePuOr)
            .interpolator(d3.interpolateBrBG)


        // UK centering
        // this.center = [-4.5481, 54.2361]
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


        // this.map.on('style.load', () => {
        //     loadData().then(() => {
        //         initMap();
        //     });
        // })

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

    initMap() {
        this.map.on('style.load', () => {
            // Add data source
            this.map.addSource('datazones', {
                type: 'geojson',
                data: datazones
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
        })

        this.map.on('mousemove', (event) => {


            const zones = this.map.queryRenderedFeatures(event.point, {
                layers: ['fill']
            });

            let zone = zones[0];

            if (zone) {
                let cobenefValue = zone.properties.value;
                this.tooltip.innerHTML = `Value: ${cobenefValue}`;
                this.tooltip.style.left = event.point.x + 10 + 'px';
                this.tooltip.style.top = event.point.y + 10 + 'px';
                this.tooltip.style.display = 'block';
            } else {
                this.tooltip.style.display = 'none';
            }
        });


        // Optional: Add border
        // map.addLayer({
        //     id: 'state-borders',
        //     type: 'line',
        //     source: 'datazones',
        //     paint: {
        //         'line-color': '#000000',
        //         'line-width': 0.1
        //     }
        // });
    }

    update() {

        // Put cobenef values inside the geojson for maplibre rendering
        for (let zone of datazones.features) {
            let zoneId = zone.properties.LSOA21CD;
            zone.properties.value = this.dataZoneToValue[zoneId]
        }

        // Add data source
        this.map.getSource('datazones').setData(
            datazones
        );
    }
}