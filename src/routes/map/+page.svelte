<script lang="ts" async>
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import * as maplibregl from "maplibre-gl"
    import "maplibre-gl/dist/maplibre-gl.css";
    import {getCustomCBData, getAverageCBGroupedByLAD, getTableData, getTotalPerPathway} from "$lib/duckdb";
    import {type CoBenefit, COBENEFS, type Scenario} from "../../globals";
    import {Legend} from "$lib/utils";
    import {Map} from "$lib/components/map";
    import {legend} from "@observablehq/plot";


    export let data;

    let element: HTMLElement
    let mapDiv: HTMLElement;
    let legendSvg: SVGSVGElement | null;
    let legendDiv: HTMLElement;
    let map: Map;
    // let fullData;


    // Main data
    let cobenefData: Array<Record<any, any>>;

    let scenario: Scenario = "BNZ";
    let coBenefits: Set<CoBenefit> = new Set(COBENEFS);
    let timeSelected: string = "total";
    let mapStyleLoaded = false;
    let granularity: "LSOA" | "LAD" = "LAD";

    let fullData;


    // $: (async () => {
    //     if (granularity == "LAD") {
    //         fullData = await getTableData(getAverageCBGroupedByLAD(Array.from(coBenefits), scenario, timeSelected))
    //         console.log(2323, fullData)
    //     } else if (granularity == "LSOA") {
    //         fullData = await getTableData(getCustomCBData(Array.from(coBenefits), scenario, timeSelected))
    //     }
    //
    //     if (map) {
    //         console.log("map update")
    //         map.update(fullData);
    //     }
    // })()

    $: {
        if (map?.loaded) {

            console.log(3, granularity)

            if (granularity == "LAD") {
                console.log(222, coBenefits)
                fullData = getTableData(getAverageCBGroupedByLAD(Array.from(coBenefits), scenario, timeSelected))
            } else if (granularity == "LSOA") {
                console.log(111)
                fullData = getTableData(getCustomCBData(Array.from(coBenefits), scenario, timeSelected))
            }

            fullData.then((data) => {
                console.log(2, data)
                map.update(data);
            })

            legendSvg = map.legend();
            legendDiv.innerHTML = "";
            legendDiv.append(legendSvg)
            // document.querySelector("#legend").append(legendSvg)

        }


    }

    // $: {
    //     if (map?.loaded) {
    //         legendSvg = map.legend();
    //         legendDiv.append(legendSvg)
    //         document.querySelector("#legend").append(legendSvg)
    //     }
    // }


    onMount(async () => {

        // first load of data
        // fullData = await getTableData(getCustomCBData(Array.from(coBenefits), scenario, timeSelected));
        // fullData = await getTableData(getAverageCBGroupedByLAD(Array.from(coBenefits), scenario, timeSelected))
        fullData = await getTableData(getAverageCBGroupedByLAD([], scenario, timeSelected))


        console.log(1, fullData)

        map = new Map(fullData, granularity, mapDiv);
        map.initMap();
        console.log("map initiated")

        legendSvg = map.legend();
        legendDiv.append(legendSvg)


        // Listen for zoom events
        // map.map.on('zoom', () => {
        //     const currentZoom = map.map.getZoom();
        //
        //     console.log("zz ", currentZoom);
        //     if (currentZoom > 30 && map.granularity != "LSOA") {
        //     // if (currentZoom > 8 && map.granularity != "LSOA") {
        //         console.log("GOOOOO")
        //
        //         granularity = "LSOA";
        //         // Zoom level is greater than the threshold, update the layer
        //
        //
        //         // Remove all layers from the map
        //         const layers = map.map.getStyle().layers; // Get all layers in the current map style
        //         if (layers) {
        //             layers.forEach(layer => {
        //                 map.map.removeLayer(layer.id); // Remove each layer by its id
        //             });
        //         }
        //
        //         // Remove all sources from the map
        //         const sources = map.map.getStyle().sources;
        //         for (const sourceId in sources) {
        //             map.map.removeSource(sourceId); // Remove each source by its id
        //         }
        //
        //         map.reset();
        //         // map.dataKey = "total";
        //         map.granularity = "LSOA";
        //         getTableData(getCustomCBData(Array.from(coBenefits), scenario, timeSelected)).then(data => {
        //             map.loadData(data);
        //             map.loadLayers();
        //             // map.initMap();
        //         })
        //         // map.loadData(data);
        //         // map.initMap();
        //
        //     } else {
        //         // Zoom level is below or equal to the threshold, revert changes
        //     }
        // });


        // legendSvg = Legend(colorScale, {
        //     title: "Cobenefits (Millions of £)"
        // })
        // legendDiv.append(legendSvg)
        // document.querySelector("#legend").append(leg)
    })


    const onChangeScenario = (e) => {
        scenario = e.currentTarget.value;
    }
    const onChangeCobenef = (e) => {
        const cobenef: CoBenefit = e.currentTarget.value;

        if (coBenefits.size == 0) {
            coBenefits = new Set(COBENEFS);
        }

        if (coBenefits.has(cobenef)) {
            coBenefits.delete(cobenef)
        } else {
            coBenefits.add(cobenef)
        }
        coBenefits = coBenefits;
    }
    const onChangeTime = (e) => {
        const time = e.currentTarget.value;
        timeSelected = time;
    }

</script>


<div class="page-container" bind:this={element}>

    <div class="component" id="heaser">
        <h2> Map </h2>

        <p>
            This interactive map shows the co-benefit of each datazone. The pathway and time window can be selected,
            along a given set of co-benefits.
        </p>
    </div>

    <div id="map-row" class="row">
        <div class="component column" id="mapComp">
            <div id="map" bind:this={mapDiv}>
            </div>
            <div id="map-legend" bind:this={legendDiv}>
            </div>
            <div id="tooltip" class="tooltip"></div>
        </div>

        <div class="component column" id="control-panel">

            <div>
                <!--                <h2> Scenario </h2>-->
                <!--                <input type="radio" on:change={onChangeScenario} name="visType" value="BNZ" checked>-->
                <!--                <label for="html">BNZ</label><br>-->
                <!--                <input type="radio" on:change={onChangeScenario} name="visType" value="Test">-->
                <!--                <label for="css">Test</label><br>-->

                <h2> Co Benefits </h2>
                {#each COBENEFS as coBenef}
                    <input type="checkbox" on:change={onChangeCobenef} name="cobenef" value={coBenef} checked>
                    <!--                <input type="checkbox" id="scales" name="scales" checked />-->
                    <label for="css">{coBenef}</label><br>
                {/each}

                <h2> Time </h2>
                <div id="time">
                    <label class="time-radio"><input type="radio" name="toggle" value="total" on:change={onChangeTime}
                                                     checked><span>total</span></label>
                    <label class="time-radio"><input type="radio" name="toggle" value="2025_2029"
                                                     on:change={onChangeTime}><span>2025-2029</span></label>
                    <label class="time-radio"><input type="radio" name="toggle" value="2030_2034"
                                                     on:change={onChangeTime}><span>2030-2034</span></label>
                    <label class="time-radio"><input type="radio" name="toggle" value="2035_2039"
                                                     on:change={onChangeTime}><span>2035-2039</span></label>
                    <label class="time-radio"><input type="radio" name="toggle" value="2040_2044"
                                                     on:change={onChangeTime}><span>2040-2044</span></label>
                    <label class="time-radio"><input type="radio" name="toggle" value="2045_2049"
                                                     on:change={onChangeTime}><span>2045-2049</span></label>
                </div>

            </div>
        </div>

    </div>


</div>

<style>

    /*#main {*/
    /*    display: flex;*/
    /*    flex-direction: row;*/

    /*    gap: 1%;*/

    /*    !*TODO: Make alignement layour better*!*/
    /*    !*width: 100vw;*!*/
    /*    width: 95%;*/
    /*    height: 100vh;*/

    /*    !* width includes padding *!*/
    /*    box-sizing: content-box;*/
    /*}*/

    #mapComp {
        position: relative;
    }

    .page-container {
        height: 100vh;
    }

    #map-row {
        /*height: 1400px;*/
        flex: 1;
    }

    #map {
        width: 100%;
        height: 100%;
        /*flex: 1; !* take the remaining height *!*/
    }

    #map-legend {
        position: absolute;
        width: 25%;
        top: 5%;
        right: 10%;
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

    .tooltip {
        position: absolute;
        background-color: white;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 3px;
        pointer-events: none;
        display: none;
    }
</style>
