<script lang="ts" async>
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import * as maplibregl from "maplibre-gl"
    import "maplibre-gl/dist/maplibre-gl.css";
    import {getCustomData, getTableData, getTotalPerPathway} from "$lib/duckdb";
    import {type CoBenefit, COBENEFS, type Scenario} from "../../globals";


    export let data;

    const datazones = data.datazones;


    let element: HTMLElement
    let map: maplibregl.Map

    // Main data
    let cobenefData: Array<Record<any, any>>;

    let dataZoneToValue: Record<string, number> = {}
    let scenario: Scenario = "BNZ";
    let coBenefits: Set<CoBenefit> = new Set();
    let mapStyleLoaded = false;
    let mapInit = false;

    // TOTAL COBENEFIT in millions of £
    const colorScale = d3.scaleQuantize()
        .domain([-10, 40])  // Replace this with the actual min and max of your property
        .range(d3.schemeBlues[9]);  // A predefined D3 color scheme


    async function loadData() {
        cobenefData = await getTableData(getCustomData(Array.from(coBenefits), scenario))
    }

    function render() {
        console.log("render");

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
        map.getSource('datazones').setData(
            datazones
        );
    }

    $: {
        if (scenario != null && coBenefits != null) {

            if (mapStyleLoaded) {
                console.log('load')
                loadData().then(
                    () => {
                        console.log('loadEnd')
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

        // Optional: Add border
        map.addLayer({
            id: 'state-borders',
            type: 'line',
            source: 'datazones',
            paint: {
                'line-color': '#000000',
                'line-width': 0.2
            }
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
                'fill-opacity': 0.75
            }
        });
        mapInit = true;
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
    })


    const onChangeScenario = (e) => {
        console.log("SCC")
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

</script>


<div id="main" bind:this={element}>

    <div class="component" id="mapComp">
        <h2> Map </h2>

        <div id="map">
        </div>
<!--        <div id="map-legend">-->
<!--            TEEEEEEEST-->
<!--        </div>-->

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

        </div>
    </div>


</div>

<style>
    #main {
        display: flex;
        flex-direction: row;

        gap: 1%;

        width: 100vw;
        height: 100vh;
    }

    .component {
        background: white;
        border: 1px solid black;
        border-radius: 15px;
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

    /*#map-legend {*/
    /*    position: absolute;*/
    /*    width: 25%;*/
    /*    top: 10%;*/
    /*    left: 0;*/
    /*    padding: 10px;*/
    /*}*/

    #control-panel {
        flex: 0 0 25%; /* Don't grow or shrink, fixed at 75% width */
        display: flex;
    }
</style>
