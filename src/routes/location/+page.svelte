<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import {Map} from "$lib/components/map";
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

    console.log(11, totalCBAllZones);
    console.log("ONE LAD", oneLADData);


    let mapDiv: HTMLElement;

    onMount(() => {
        map = new Map(LAD, "LAD", mapDiv);
        map.initMap();
    })

    function renderPlot() {
        if (chartType == "boxplot") {
            plot?.append(
                Plot.plot({
                    height: height / 1.4,
                    marginLeft: 60,
                    marginRight: 60,
                    marginBottom: 60,
                    y: {type: "band"},
                    style: {fontSize: "18px"},
                    marks: [
                        Plot.boxX(oneLADData, {x: "total", y: "scenario", tip: true}),
                        // Plot.tickX([{totalCBAllZones, scenario: "BNZ"}], {y: "scenario", x:'v', stroke: 'red'}),

                        //  Median and Mean from ALL datazones
                        Plot.tickX(
                          totalCBAllZones,
                          Plot.groupY(
                            {x: "median"},
                            {x: "total", y: "scenario", stroke: "blue", strokeWidth: 2}
                          )
                        ),
                        Plot.tickX(
                          totalCBAllZones,
                          Plot.groupY(
                            {x: "mean"},
                            {x: "total", y: "scenario", stroke: "red", strokeWidth: 2}
                          )
                        )

                    ]
                }))
        } else if (chartType == "barchart") {

                plot?.append(
                Plot.plot({
                    height: height / 1.4,
                    marginLeft: 60,
                    marginRight: 60,
                    marginBottom: 60,
                    y: {type: "band"},
                    style: {fontSize: "18px"},
                    marks: [
                        Plot.barX(oneLADData, Plot.groupY({x: "sum"}, {
                            x: "total",
                            y: "scenario"
                        })),

                        //  Median and Mean from ALL datazones
                        Plot.tickX(
                          totalCBAllZones,
                          // Plot.groupY(
                          //   {x: "mean"},
                          //   {x: "total", y: "scenario", stroke: "red", strokeWidth: 2}
                          // )
                            Plot.groupX(
        { x: "mean", y: "sum" }, // Perform sum, then calculate mean
        { x: "total", y: "LAD" } // Group by 'category', and sum 'value'
      )
                        )

                    ]
                })
            );

            } else if (chartType == "distribution") {

            }



    }

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
                    // x: {grid: true, label: sef, type: "band", tickFormat: d => Math.floor(d)},
                    x: {grid: true, label: sef, type: "band"},
                    style: {fontSize: "18px"},
                    color: {legend: true},
                    marks: [
                        Plot.barY(totalCBAllZones, Plot.binX({y: "count"}, {
                            x: d => Math.floor(Number(d[sef]))
                            // x: sef
                            // x: d => Math.floor(d[sef])
                            // y: "total"
                        })),
                    ]
                })
                SEFPlotFullDistrib[sef]?.append(plotFullDistrib);


                // console.log(23, plotFullDistrib.scale('x').domain.map(d => Math.floor(d))

                let domain = plotFullDistrib.scale('x').domain.map(d => Math.floor(d));
                // console.log(domain);

                plot = Plot.plot({
                    height: height / 2,
                    width: 500,
                    marginLeft: 80,
                    marginBottom: 60,
                    marginRight: 30,
                    marginTop: 60,
                    y: {grid: true, label: "mean value (£)"},
                    // Very weird it's needed!
                    // x: {grid: true, label: sef},
                    x: {grid: true, label: sef, domain: domain, type: "band", tickFormat: d => Math.floor(d)},
                    // x: {grid: true, label: sef, tickFormat: d => Math.floor(d)},
                    style: {fontSize: "18px"},
                    color: {legend: true},
                    marks: [
                        Plot.barY(oneLADData, Plot.binX({y: "count"}, {
                            x: d => Math.floor(d[sef]),
                            // x: d => Math.floor(d[sef]),
                            // x: sef
                            // y: "total"
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

        renderPlot();
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
                        <h3>{LAD} datazone distribution</h3>

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
