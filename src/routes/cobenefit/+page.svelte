<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import {Map} from "$lib/components/map";
    import {SEF, SEF_CATEGORICAL, type SEFactor} from "../../globals";

    let element: HTMLElement
    let plot: HTMLElement
    let SEFPlot: Record<SEFactor, HTMLElement> = {};
    let chartType: "barchart" | "violin" | "distribution" = "barchart"

    let height;

    // Data from load function
    export let data;

    const fullData = data.data;
    const SEFData = data.SEFData;
    const coBenefit = data.coBenefit;
    let map: Map;

    // console.log(11, fullData.slice(0, 10))

    let mapDiv: HTMLElement;

    onMount(() => {
        map = new Map(fullData, "LSOA", mapDiv, "total");
        map.initMap();
    })

    function renderPlot() {
        if (chartType == "barchart") {
            plot?.append(
                Plot.plot({
                    height: height / 1.4,
                    marginLeft: 60,
                    marginRight: 60,
                    marginBottom: 60,
                    y: {type: "band"},
                    style: {fontSize: "18px"},
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
                    height: height / 1.4,
                    marginLeft: 60,
                    marginRight: 60,
                    y: {label: "Datazones Frequency"},
                    style: {fontSize: "18px"},
                    facet: {data: fullData, y: "scenario"},
                    marks: [
                        Plot.areaY(fullData, Plot.binX({y: "count"}, {
                            x: "total",
                            tip: true
                        }))                    ]
                })
            );
        } else if (chartType == "violin") {
            // Violin
        }
    }

    function renderSEFPlot() {

        // FACETED CHART
        // SEFPlotLAD?.append(
        //     Plot.plot({
        //         height: height,
        //         width: 2000,
        //         // marginLeft: 170,
        //         // marginBottom: 50,
        //         // marginTop: 30,
        //         // y: {grid: true, axis: showAxes},
        //         // x: {grid: true, axis: showAxes},
        //         style: {fontSize: "22px"},
        //         color: {legend: true},
        //         marks: [
        //             Plot.areaY(SEFData, Plot.binX({y: "mean"}, {x: "SE", y: "total", fx: "SEFMAME"})),
        //         ]
        //     })
        // )

        SEF.forEach(sef => {
            let plot;
            if (SEF_CATEGORICAL.includes(sef)) {
                plot = Plot.plot({
                    height: height / 2,
                    width: 330,
                    marginLeft: 80,
                    marginBottom: 60,
                    marginRight: 30,
                    marginTop: 60,
                    y: {grid: true, label: "mean value (£)"},
                    // Very weird it's needed!
                    x: {grid: true, label: sef, type: "band", tickFormat: d => Math.floor(d)},
                    style: {fontSize: "18px"},
                    color: {legend: true},
                    marks: [
                        Plot.barY(SEFData.filter(d => d["SEFMAME"] == sef), Plot.binX({y: "mean"}, {
                            x: d => Math.floor(d["SE"]).toString(),
                            y: "total"
                        })),
                    ]
                })
            } else {
                plot = Plot.plot({
                    height: height / 2,
                    width: 330,
                    marginLeft: 80,
                    marginBottom: 60,
                    marginRight: 30,
                    marginTop: 60,
                    y: {grid: true, label: "mean value (£)"},
                    x: {grid: true, label: sef},
                    style: {fontSize: "18px"},
                    color: {legend: true},
                    marks: [
                        Plot.areaY(SEFData.filter(d => d["SEFMAME"] == sef), Plot.binX({y: "mean"}, {
                            x: "SE",
                            y: "total"
                        })),
                        Plot.ruleX([d3.mean(SEFData.filter(d => d["SEFMAME"] == sef).map(d => d.SE))], {stroke: "red"}),
                        Plot.ruleX([d3.median(SEFData.filter(d => d["SEFMAME"] == sef).map(d => d.SE))], {stroke: "blue"}),
                    ]
                })
            }

            SEFPlot[sef]?.append(plot)
        })


    }


    $: {
        plot?.firstChild?.remove(); // remove old chart, if any
        // SEFPlotLAD?.firstChild?.remove(); // remove old chart, if any
        Object.values(SEFPlot).forEach(sefPlot => {
          sefPlot.firstChild?.remove();
        })

        //ugly hack for reactivity
        if (chartType) {
        }

        if (height) {

            renderPlot();
            renderSEFPlot();
        }
    }


    function onChange(event) {
        chartType = event.currentTarget.value;
    }
</script>


<div class="page-container" bind:this={element}>

    <div class="component">
        <h1> {coBenefit} </h1>
        <p> {coBenefit} is ... </p>
    </div>

    <div id="vis-block">
        <div class="component column" bind:clientHeight={height}>
            <h3>{coBenefit} datazone distribution</h3>

            <input type="radio" on:change={onChange} name="visType" value="barchart" checked>
            <label for="html">Barchart</label><br>
            <!--        <input type="radio" on:change={onChange} name="visType" value="violin">-->
            <!--        <label for="css">Violin</label><br>-->
            <input type="radio" on:change={onChange} name="visType" value="distribution">
            <label for="javascript">Distribution</label>

            <div class="plot" bind:this={plot}>
            </div>
        </div>

        <div class="component column">
            <h3> Map </h3>
            <div id="map" bind:this={mapDiv}>
            </div>
        </div>
    </div>


    <div id="multiple-comp" class="component">
        <h3> Socio Economic Factors </h3>
        <div id="multiple-plots">
            {#each SEF as sef}
                <div class="plot" bind:this={SEFPlot[sef]}>
                </div>
            {/each}
        </div>
    </div>


</div>

<style>
    /*#main {*/
    /*    display: grid;*/
    /*    grid-template-columns: repeat(2, 1fr);*/
    /*    grid-template-rows: repeat(3, 1fr);*/
    /*    grid-column-gap: 2%;*/
    /*    grid-row-gap: 1%;*/

    /*    width: 97vw;*/
    /*    height: 100%;*/
    /*    !*height: 50vh;*!*/
    /*}*/

    #vis-block {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1%;
        width: 100%;
    }


    #map {
        width: 100%;

        /*TODO: height is given by this currently but better to change at some point*/
        height: 400px;
        /*flex: 1; !* take the remaining height *!*/
    }

    #multiple-comp {
        grid-column: span 2 / span 2;
    }

    #multiple-plots {
        display: flex;
        gap: 1%;
        flex-direction: row;
        flex-flow: wrap;
        align-items: center;
        align-content: space-between;
        justify-content: center;
    }
</style>
