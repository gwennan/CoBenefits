<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import {Map} from "$lib/map";
    import {SEF, SEF_CATEGORICAL, type SEFactor} from "../../globals";

    let element: HTMLElement
    let plot: HTMLElement
    let SEFPlotLAD: Record<SEFactor, HTMLElement> = {};
    let SEFPlotFullDistrib: Record<SEFactor, HTMLElement> = {};
    let chartType: "barchart" | "violin" | "distribution" = "barchart"

    let height = 300;

    // Data from load function
    export let data;

    // const oneZoneData = data.oneZoneData;
    const oneLADData = data.oneLADData;
    const LAD = data.LAD;
    const totalCBAllZones = data.totalCBAllZones;
    let map: Map;

    // console.log(11, fullData.slice(0, 10))

    let mapDiv: HTMLElement;

    onMount(() => {
        // map = new Map(fullData, mapDiv);
        // map.initMap();
    })

    function renderSEFPlot() {
        SEF.forEach(sef => {
            let plot
            let plotFullDistrib;
            if (SEF_CATEGORICAL.includes(sef)) {
                plotFullDistrib = Plot.plot({
                    height: height / 2,
                    width: 500,
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
                        Plot.barY(totalCBAllZones, Plot.binX({y: "count"}, {
                            x: d => Math.floor(Number(d[sef])).toString(),
                            y: "total"
                        })),
                    ]
                })
                SEFPlotFullDistrib[sef]?.append(plotFullDistrib);


                // console.log(23, )


                plot = Plot.plot({
                    height: height / 2,
                    width: 500,
                    marginLeft: 80,
                    marginBottom: 60,
                    marginRight: 30,
                    marginTop: 60,
                    y: {grid: true, label: "mean value (£)"},
                    // Very weird it's needed!
                    // x: {grid: true, label: sef, type: "band"},
                    // x: {grid: true, label: sef, domain: plotFullDistrib.scale('x').domain, type: "band", tickFormat: d => Math.floor(d)},
                    x: {grid: true, label: sef, tickFormat: d => Math.floor(d)},
                    style: {fontSize: "18px"},
                    color: {legend: true},
                    marks: [
                        Plot.barY(oneLADData, Plot.binX({y: "count"}, {
                            x: d => Math.floor(Number(d[sef])).toString(),
                            y: "total"
                        })),
                    ]
                })
                SEFPlotLAD[sef]?.append(plot)

            } else {
                // plot = Plot.plot({
                //     height: height / 2,
                //     width: 330,
                //     marginLeft: 80,
                //     marginBottom: 60,
                //     marginRight: 30,
                //     marginTop: 60,
                //     y: {grid: true, label: "mean value (£)"},
                //     x: {grid: true, label: sef},
                //     style: {fontSize: "18px"},
                //     color: {legend: true},
                //     marks: [
                //         Plot.areaY(SEFData.filter(d => d["SEFMAME"] == sef), Plot.binX({y: "mean"}, {
                //             x: "SE",
                //             y: "total"
                //         })),
                //     ]
                // })
            }

            SEFPlotLAD[sef]?.append(plot)
        })


    }


    $: {
        // plot?.firstChild?.remove(); // remove old chart, if any
        Object.values(SEFPlotLAD).forEach(sefPlot => {
            sefPlot.firstChild?.remove();
        })
        Object.values(SEFPlotFullDistrib).forEach(sefPlot => {
            sefPlot.firstChild?.remove();
        })

        //ugly hack for reactivity
        if (chartType) {
        }

        // renderPlot();
        renderSEFPlot();
    }


    function onChange(event) {
        chartType = event.currentTarget.value;
    }
</script>


<div class="page-container" bind:this={element}>

    <div class="component">
        <h1> {LAD} </h1>
        <p> {LAD} is ... </p>
    </div>

    <div id="vis-block">
        <div class="component column" bind:clientHeight={height}>
            <!--            <h3>{coBenefit} datazone distribution</h3>-->

            <!--            <input type="radio" on:change={onChange} name="visType" value="barchart" checked>-->
            <!--            <label for="html">Barchart</label><br>-->
            <!--            &lt;!&ndash;        <input type="radio" on:change={onChange} name="visType" value="violin">&ndash;&gt;-->
            <!--            &lt;!&ndash;        <label for="css">Violin</label><br>&ndash;&gt;-->
            <!--            <input type="radio" on:change={onChange} name="visType" value="distribution">-->
            <!--            <label for="javascript">Distribution</label>-->

            <!--            <div class="plot" bind:this={plot}>-->
            <!--            </div>-->
        </div>

        <div class="component column">
            <h3> Map </h3>
            <div id="map" bind:this={mapDiv}>
            </div>
        </div>
    </div>


    <div id="multiple-comp" class="component">
        <h2> Socio Economic Factors </h2>
        <!--        <div >-->
        {#each SEF as sef}

            <div>
                <strong>{sef}</strong>

                <div class="inside-row">

                    <div>
                        LAD Distribution:
                        <div class="plot" bind:this={SEFPlotLAD[sef]}>
                        </div>
                    </div>

                    <div>
                        Global Distribution:
                        <div class="plot" bind:this={SEFPlotFullDistrib[sef]}>
                        </div>
                    </div>

                </div>

            </div>

        {/each}
        <!--        </div>-->
    </div>


</div>

<style>
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

    .inside-row {
        display: flex;
        flex-direction: row;
    }

</style>
