<script lang="ts" async>
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import * as maplibregl from "maplibre-gl"
    import "maplibre-gl/dist/maplibre-gl.css";
    import {getCustomData, getTableData, getTotalPerPathway} from "$lib/duckdb";
    import {type CoBenefit, COBENEFS, type Scenario} from "../../globals";
    import {Legend} from "$lib/utils";


    export let data;

    const datazones = data.datazones;


    let element: HTMLElement
    let map: maplibregl.Map
    let legendSvg: SVGSVGElement | null;
    let legendDiv: HTMLElement;

    // Main data
    let cobenefData: Array<Record<any, any>>;

    let dataZoneToValue: Record<string, number> = {}
    let scenario: Scenario = "BNZ";
    let coBenefits: Set<CoBenefit> = new Set();
    let timeSelected: string = "total";
    let mapStyleLoaded = false;

    // TOTAL COBENEFIT in millions of £
    // const colorScale = d3.scaleQuantize()
    //     .domain([-10, 40])  // Replace this with the actual min and max of your property
    //     .range(d3.schemeBlues[9]);  // A predefined D3 color scheme

    const colorScale = d3.scaleDiverging()
        .domain([-10, 0, 40])
        // .interpolator(d3.interpolatePuOr)
        .interpolator(d3.interpolateBrBG)


    async function loadData() {
        cobenefData = await getTableData(getCustomData(Array.from(coBenefits), scenario, timeSelected))
        // console.log(cobenefData);
    }

    function render() {
        console.log("render");

        cobenefData.forEach((d) => {
            // Might change total
            // dataZoneToValue[d.Lookup_Value] = d.total
            dataZoneToValue[d.Lookup_Value] = d[timeSelected]
        })

        // Put cobenef values inside the geojson for maplibre rendering
        for (let zone of datazones.features) {
            let zoneId = zone.properties.LSOA21CD;
            zone.properties.value = dataZoneToValue[zoneId]
        }

        // Add data source
        map.getSource('datazones').setData(
            datazones
        );
    }

    $: {
        // Explicitly setting reactivity
        if (scenario != null && coBenefits != null && timeSelected != null) {

            if (mapStyleLoaded) {
                loadData().then(
                    () => {
                        render()
                    }
                )
            }
        }
    }

    function initMap() {

        cobenefData.forEach((d) => {
            // Might change total
            dataZoneToValue[d.Lookup_Value] = d.total
        })

        // Put cobenef values inside the geojson for maplibre rendering
        for (let zone of datazones.features) {
            let zoneId = zone.properties.LSOA21CD;
            zone.properties.value = dataZoneToValue[zoneId]
        }

        // Add data source
        map.addSource('datazones', {
            type: 'geojson',
            data: datazones
        });

        map.addLayer({
            id: 'fill',
            type: 'fill',
            source: 'datazones',
            paint: {
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'value'], // Replace with your data property
                    ...colorScale.domain().flatMap((d) => [d, colorScale(d)])
                ],
                'fill-opacity': 0.9
            }
        });

        // Optional: Add border
        map.addLayer({
            id: 'state-borders',
            type: 'line',
            source: 'datazones',
            paint: {
                'line-color': '#000000',
                'line-width': 0.1
            }
        });
    }


    onMount(() => {

        // UK centering
        let center = [-4.5481, 54.2361]

        map = new maplibregl.Map({
            container: 'map', // container id
            // style: 'https://demotiles.maplibre.org/style.json', // style URL
            style: {version: 8, sources: {}, layers: []},
            center: center, // starting position [lng, lat]
            zoom: 5, // starting zoom
            preserveDrawingBuffer: true,
        });

        // console.log("MAP ", datazones)

        map.on('style.load', () => {
            mapStyleLoaded = true;

            loadData().then(() => {
                initMap();
            });
        })

        legendSvg = Legend(colorScale, {
            title: "Cobenefits (Millions of £)"
        })
        legendDiv.append(legendSvg)
        console.log("ll ", legendSvg);
        // document.querySelector("#legend").append(leg)
    })


    const onChangeScenario = (e) => {
        scenario = e.currentTarget.value;
    }
    const onChangeCobenef = (e) => {
        const cobenef: CoBenefit = e.currentTarget.value;
        if (coBenefits.has(cobenef)) {
            coBenefits.delete(cobenef)
        } else {
            coBenefits.add(cobenef)
        }
    }
    const onChangeTime = (e) => {
        const time = e.currentTarget.value;
        timeSelected = time;
    }


</script>


<div id="main" bind:this={element}>

    <div class="component" id="mapComp">
        <h2> Map </h2>

        <div id="map">
        </div>
        <div id="map-legend" bind:this={legendDiv}>
            <!--            fef-->
            <!--            <div id="legend"></div>-->
            <!--            <svg bind:this={legendSvg} width="400" height="300">-->
            <!-- SVG content -->
            <!--            </svg>-->
        </div>

    </div>

    <div class="component" id="control-panel">

        <div>
            <h2> Scenario </h2>
            <input type="radio" on:change={onChangeScenario} name="visType" value="BNZ" checked>
            <label for="html">BNZ</label><br>
            <input type="radio" on:change={onChangeScenario} name="visType" value="Test">
            <label for="css">Test</label><br>

            <h2> Co Benefits </h2>
            {#each COBENEFS as coBenef}
                <input type="checkbox" on:change={onChangeCobenef} name="cobenef" value={coBenef} checked>
                <!--                <input type="checkbox" id="scales" name="scales" checked />-->
                <label for="css">{coBenef}</label><br>
            {/each}

            <h2> Time </h2>
            <div id="time">
                <label class="time-radio"><input type="radio" name="toggle" value="total" on:change={onChangeTime} checked><span>total</span></label>
                <label class="time-radio"><input type="radio" name="toggle" value="2025_2029" on:change={onChangeTime}><span>2025-2029</span></label>
                <label class="time-radio"><input type="radio" name="toggle" value="2030_2034" on:change={onChangeTime}><span>2030-2034</span></label>
                <label class="time-radio"><input type="radio" name="toggle" value="2035_2039" on:change={onChangeTime}><span>2035-2039</span></label>
                <label class="time-radio"><input type="radio" name="toggle" value="2040_2044" on:change={onChangeTime}><span>2040-2044</span></label>
                <label class="time-radio"><input type="radio" name="toggle" value="2045_2049" on:change={onChangeTime}><span>2045-2049</span></label>
            </div>

        </div>
    </div>


</div>

<style>
    #main {
        display: flex;
        flex-direction: row;

        gap: 1%;

        /*width: 100vw;*/
        width: 100%;
        height: 100vh;

        /* width includes padding */
        box-sizing: border-box;
    }

    .component {
        background: white;
        border: 1px solid black;
        border-radius: 15px;
        padding-left: 1%;
        padding-right: 1%;
    }

    #mapComp {
        flex: 0 0 75%; /* Don't grow or shrink, fixed at 75% width */
        display: flex;
        flex-direction: column;
    }

    #map {
        width: 100%;
        flex: 1; /* take the remaining height */
    }

    #map-legend {
        position: absolute;
        width: 25%;
        top: 10%;
        right: 25%;
        padding: 10px;
    }

    #control-panel {
        flex: 0 0 25%; /* Don't grow or shrink, fixed at 75% width */
        display: flex;
    }

    .time-radio {
        margin: 6px;
        break-inside: avoid;
    }

    #time label span {
        padding: 3px;
        white-space: nowrap;
    }

    /* This hides the html circle radio button */
    #time label input {
        position: absolute;
        top: -20px;
    }

    #time input:checked + span {
        background-color: #0031c3;
        color: #F7F7F7;
    }

    #time .time-radio {
        /*background-color: #FFCC00;*/
        color: #333;
    }
</style>
