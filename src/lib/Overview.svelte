<script lang="ts">
    import * as d3 from 'd3';
    import {onMount} from "svelte";
    import * as Plot from "@observablehq/plot";

    import {
        globalMeasures,
        S1Data,
        S2Data,
        S3Data,
        S4Data,
        S5Data,
        fullData,
        COBENEFS,
        fullDataPerCB
    } from '../data.ts';
    import Map from "./Map.svelte";


    let element: HTMLElement
    let plot: HTMLElement
    let plotCB: HTMLElement

    let chartType: "barchart" | "violin" = "barchart"
    let chartTypeCB: "barchart" | "violin" = "barchart"


    let height = 400;

    // TODO: compute extent of variables
    $: {
        plot?.firstChild?.remove(); // remove old chart, if any

        if (chartType == "barchart") {
            plot?.append(
                Plot.plot({
                    height: height,
                    marginLeft: 170,
                    // marginBottom: 50,
                    // marginTop: 30,
                    y: {type: "band"},
                    // style: {fontSize: "22px"},
                    // color: {legend: true},
                    marks: [
                        Plot.barX(fullData, Plot.groupY({x: "mean"}, {
                            x: "Total",
                            y: "scenario",
                            tip: true
                        })),
                        Plot.link(
                            fullData,
                            Plot.groupY(
                                {
                                    x1: (data) => d3.mean(data) - d3.deviation(data),
                                    x2: (data) => d3.mean(data) + d3.deviation(data)
                                },
                                {
                                    x: "Total",
                                    y: "scenario",
                                    stroke: "gray",
                                    strokeWidth: 3
                                }
                            )
                        )
                    ]
                })
            );
        } else if (chartType == "distribution") {
            // Violin
            plot?.append(
                Plot.plot({
                    height: height,
                    marginLeft: 170,
                    facet: {data: fullData, y: "scenario"},
                    marks: [

                        Plot.areaY(fullData, Plot.binX({y: "count"}, {
                            x: "Total",
                            tip: true
                        }))
                    ]
                })
            );
        }
    }

    $: {
        plotCB?.firstChild?.remove(); // remove old chart, if any

        if (chartTypeCB == "barchart") {
            plotCB?.append(
                Plot.plot({
                    height: height,
                    marginLeft: 170,
                    y: {type: "band"},
                    // style: {fontSize: "22px"},
                    // color: {legend: true},

                    marks: [Plot.barX(fullDataPerCB, Plot.groupY({x: "mean"}, {
                            x: "cost",
                            y: "coBenefit",
                            tip: true
                        })),
                    Plot.link(
                            fullDataPerCB,
                            Plot.groupY(
                                {
                                    x1: (data) => d3.mean(data) - d3.deviation(data),
                                    x2: (data) => d3.mean(data) + d3.deviation(data)
                                },
                                {
                                    x: "cost",
                                    y: "coBenefit",
                                    stroke: "gray",
                                    strokeWidth: 3
                                }
                            )
                        )]
        }))
        } else if (chartType == "distribution") {
            // Violin
            plotCB?.append(
                Plot.plot({
                    facet: {data: fullData, y: "scenario"},
                    marks: [

                        Plot.areaY(fullData, Plot.binX({y: "count"}, {
                            x: "Total",
                            tip: true
                        }))
                    ]
                })
            );
        }

    }


    function onChange(event) {
        chartType = event.currentTarget.value;
    }

    function onChangeCB(event) {
        chartTypeCB = event.currentTarget.value;
    }
</script>


    <h1> Overview </h1>

<div id="main" bind:this={element}>

    <div>
        <h3>Benefits per pathway</h3>

        <input type="radio" on:change={onChange} name="visType" value="barchart" checked>
        <label for="html">Barchart</label><br>
        <input type="radio" on:change={onChange} name="visType" value="violin">
        <label for="css">Violin</label><br>
        <input type="radio" on:change={onChange} name="visType" value="distribution">
        <label for="javascript">Distribution</label>

        <div class="plot" bind:this={plot}>
        </div>
    </div>

<!--    <div>map</div>-->
    <div id="map">
        <Map></Map>
    </div>

    <div>
        <h3>Benefits per Co-Benefit</h3>

        <input type="radio" on:change={onChangeCB} name="visTypeCB" value="barchart" checked>
        <label for="html">Barchart</label><br>
        <input type="radio" on:change={onChangeCB} name="visTypeCB" value="violin">
        <label for="css">Violin</label><br>
        <input type="radio" on:change={onChangeCB} name="visTypeCB" value="distribution">
        <label for="javascript">Distribution</label>

        <div class="plot" bind:this={plotCB}>
        </div>
    </div>
</div>

<style>
    #main {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(4, 1fr);
        grid-column-gap: 2%;
        grid-row-gap: 1%;

        width: 97vw;
        /*height: 50vh;*/
    }

    #map {
        grid-row: span 2;
    }
</style>
