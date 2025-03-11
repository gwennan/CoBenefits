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
    let chartType: "barchart" | "boxplot" | "distribution" = "barchart"
    let isSEFAggregated = false;

    let height = 300;

    const margins = {
        marginLeft: 60,
        marginRight: 60,
        marginBottom: 60,
        marginTop: 60
    }

    // Data from load function
    export let data;

    // const oneZoneData = data.oneZoneData;
    const oneLADData = data.oneLADData;
    const LAD = data.LAD;
    const totalCBAllZones = data.totalCBAllZones;
    const totalCBAllLAD = data.totalCBAllLAD;
    let map: Map;

    console.log(11, totalCBAllZones);
    console.log("ONE LAD", oneLADData);


    let mapDiv: HTMLElement;

    onMount(() => {
        map = new Map(LAD, "LAD", mapDiv, "val", true);
        map.initMap();
    })

    function renderPlot() {
        if (chartType == "boxplot") {
            plot?.append(
                Plot.plot({
                    height: height / 1.4,
                    ...margins,
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
                    ...margins,
                    y: {type: "band"},
                    style: {fontSize: "18px"},
                    marks: [
                        Plot.barX(oneLADData, Plot.groupY({x: "sum"}, {
                            x: "total",
                            y: "scenario"
                        })),

                        //  Median and Mean from ALL datazones
                        Plot.tickX(
                            totalCBAllLAD,
                            Plot.groupY(
                                {x: "mean"},
                                {x: "val", y: "scenario", stroke: "red", strokeWidth: 2}
                            )
                        ),
                        Plot.tickX(
                            totalCBAllLAD,
                            Plot.groupY(
                                {x: "median"},
                                {x: "val", y: "scenario", stroke: "blue", strokeWidth: 2}
                            )
                        )

                    ]
                })
            );

        } else if (chartType == "distribution") {
            plot?.append(
                Plot.plot({
                    height: height / 1.4,
                    ...margins,
                    y: {label: "Datazones Frequency"},
                    style: {fontSize: "18px"},
                    facet: {data: totalCBAllZones, y: "scenario"},
                    marks: [
                        Plot.areaY(oneLADData, Plot.binX({y: "count"}, {
                            x: "total",
                            tip: true
                        })),
                        //  Median and Mean from ALL datazones
                        Plot.ruleX(
                            totalCBAllZones,
                            Plot.groupY(
                                {x: "median"},
                                {x: "total", y1: 0, y2: 1500, fy: "scenario", stroke: "blue", strokeWidth: 3}
                            )
                        ),
                        // Plot.tickX(
                        //     totalCBAllZones,
                        //     Plot.groupY(
                        //         {x: "mean"},
                        //         {x: "total", stroke: "red", strokeWidth: 2}
                        //     )
                        // )
                    ]
                })
            );

        }


    }

    function renderSEFPlot() {
        SEF.forEach(sef => {
            let plot
            let plotFullDistrib;

            if (isSEFAggregated) {

                if (SEF_CATEGORICAL.includes(sef)) {
                    plot = Plot.plot({
                        height: height / 3,
                        width: 500  * 2,
                        ...margins,
                        // y: {grid: true, label: "mean value (£)"},
                        style: {fontSize: "18px"},
                        color: {legend: true, scheme: "greys"},
                        x: {domain: d3.range(0,6), ticks: new Set(oneLADData.map(d => d[sef]))},
                        marks: [
                            // Plot.cell(oneLADData, {x: sef}),
                            Plot.cell(oneLADData,
                                Plot.groupX({fill:"count"}, {x: sef, stroke: "black" })
                            ),
                            Plot.cell([Math.floor(d3.mean(totalCBAllZones.map(d => d[sef])))],
                                {x: d => d, stroke: "red", fill: null, strokeWidth: 2}
                            )
                        ]
                    })
                } else {
                    plot = Plot.plot({
                        height: height / 3,
                        width: 500  * 2,
                        ...margins,
                        // y: {grid: true, label: "mean value (£)"},
                        style: {fontSize: "18px"},
                        color: {legend: true},
                        marks: [
                            Plot.tickX(oneLADData, {
                                x: sef,
                                tip: true
                            }),
                            //  Median and Mean from ALL datazones
                            Plot.tickX(
                                [d3.mean(oneLADData.map(d => d[sef]))],
                                {stroke: "blue", strokeWidth: 2}
                            ),
                            Plot.tickX(
                                [d3.mean(totalCBAllZones.map(d => d[sef]))],
                                {stroke: "red", strokeWidth: 2}
                            ),
                        ]
                    })
                }

                SEFPlotLAD[sef]?.append(plot)


            } else {
                if (SEF_CATEGORICAL.includes(sef)) {
                    plotFullDistrib = Plot.plot({
                        height: height / 2,
                        width: 500,
                        ...margins,
                        y: {grid: true, label: "mean value (£)"},
                        x: {grid: true, label: sef, type: "band"},
                        style: {fontSize: "18px"},
                        color: {legend: true},
                        marks: [
                            Plot.barY(totalCBAllZones, Plot.groupX({y: "count"}, {
                                x: sef
                            })),
                        ]
                    })
                    let domain = plotFullDistrib.scale('x').domain;

                    plot = Plot.plot({
                        height: height / 2,
                        width: 500,
                        ...margins,
                        y: {grid: true, label: "mean value (£)"},
                        x: {grid: true, label: sef, domain: domain, tickFormat: d => Math.floor(d)},
                        style: {fontSize: "18px"},
                        color: {legend: true},
                        marks: [
                            Plot.barY(oneLADData, Plot.groupX({y: "count"}, {
                                x: sef
                            })),
                        ]
                    })
                } else {

                    plotFullDistrib = Plot.plot({
                        height: height / 2,
                        width: 500,
                        ...margins,
                        // y: {grid: true, label: "mean value (£)"},
                        style: {fontSize: "18px"},
                        color: {legend: true},
                        marks: [
                            Plot.areaY(totalCBAllZones, Plot.binX({y: "count"}, {
                                x: sef,
                                tip: true
                            })),
                        ]
                    })

                    let domain = plotFullDistrib.scale('x').domain;

                    plot = Plot.plot({
                        height: height / 2,
                        ...margins,
                        // y: {label: "Datazones Frequency"},
                        x: {domain},
                        style: {fontSize: "18px"},
                        marks: [
                            Plot.areaY(oneLADData, Plot.binX({y: "count"}, {
                                x: sef,
                                tip: true
                            })),
                            //  Median and Mean from ALL datazones
                        ]
                    })
                }

                SEFPlotFullDistrib[sef]?.append(plotFullDistrib);
                SEFPlotLAD[sef]?.append(plot)

            }


        })


    }


    $: {
        plot?.firstChild?.remove(); // remove old chart, if any

        //ugly hack for reactivity
        if (chartType) {
        }

        renderPlot();

    }

    $: {
        Object.values(SEFPlotLAD).forEach(sefPlot => {
            sefPlot?.firstChild?.remove();
        })

        Object.values(SEFPlotFullDistrib).forEach(sefPlot => {
            sefPlot?.firstChild?.remove();
        })

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
            <input type="radio" on:change={onChange} name="visType" value="boxplot">
            <label for="css">Boxplot</label><br>
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
        <h1> Socio Economic Factors </h1>

        <!--        <div>-->
        <input type="checkbox" bind:checked={isSEFAggregated}/>
        <label for="checkbox">Aggregate Plots</label>
        <!--</div>-->

        <!--        <div >-->
        {#each SEF as sef}
            <div>
                <h2>{sef}</h2>

                <!--                <div class="inside-row">-->
                <div class="row">

                    {#if isSEFAggregated}
                        <div class="plot" bind:this={SEFPlotLAD[sef]}>
                        </div>
                    {:else}
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
                    {/if}


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
