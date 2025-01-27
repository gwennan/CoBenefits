<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';


    import MapCanvas from "$lib/components/MapCanvas.svelte";
    import {Map} from "$lib/map";

    let element: HTMLElement
    let plot: HTMLElement
    let chartType: "barchart" | "violin" = "barchart"


    let height = 400;

    // Data from load function
    export let data;

    const fullData = data.data;
    // const dataPerCb = data.dataPerCb;
    const coBenefit = data.coBenefit;
    let map: Map;

    console.log(11, fullData.slice(0, 10))

    let mapDiv: HTMLElement;

    onMount(() => {
        map = new Map(fullData, mapDiv);
        map.initMap();
        // map.render();
    })


    $: {
        plot?.firstChild?.remove(); // remove old chart, if any

        if (chartType == "barchart") {
            plot?.append(
                Plot.plot({
                    height: height,
                    marginLeft: 170,
                    y: {type: "band"},
                    marks: [
                        Plot.barX(fullData, Plot.groupY({x: "mean"}, {
                            x: "total",
                            y: "scenario"
                        })),
                        Plot.link(
                            fullData,
                            Plot.groupY(
                                {
                                    x1: (data) => d3.mean(data) - d3.deviation(data),
                                    x2: (data) => d3.mean(data) + d3.deviation(data)
                                },
                                {
                                    x: "total",
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
            // distrib
            plot?.append(
                Plot.plot({
                    height: height,
                    marginLeft: 170,
                    facet: {data: fullData, y: "scenario"},
                    marks: [

                        Plot.areaY(fullData, Plot.binX({y: "count"}, {
                            x: "total",
                            tip: true
                        }))
                    ]
                })
            );
        } else if (chartType == "violin") {
            // Violin
            plot?.append(
                Plot.plot({
                    height: height,
                    marginLeft: 170,
                    facet: {data: fullData, y: "scenario"},
                    marks: [

                        Plot.areaY(fullData, Plot.binX({y: "count"}, {
                            x: "total",
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
</script>


<h1> {coBenefit} </h1>

<p> Congestion is ...</p>

<div id="main" bind:this={element}>

    <div>
        <h3>{coBenefit} datazone distribution</h3>

        <input type="radio" on:change={onChange} name="visType" value="barchart" checked>
        <label for="html">Barchart</label><br>
        <input type="radio" on:change={onChange} name="visType" value="violin">
        <label for="css">Violin</label><br>
        <input type="radio" on:change={onChange} name="visType" value="distribution">
        <label for="javascript">Distribution</label>

        <div class="plot" bind:this={plot}>
        </div>
    </div>

    <div>
        <h3> Map </h3>

        <div id="map" bind:this={mapDiv}>
        </div>

    </div>

    <div>
        <h3>  </h3>

        <div id="map" bind:this={mapDiv}>
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
        width: 100%;
        /*height: 100%;*/
        height: 400px;
        /*flex: 1; !* take the remaining height *!*/
    }


</style>
