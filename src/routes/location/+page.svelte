<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import {Map} from "$lib/components/map";
    import {
        SEF,
        SEF_CATEGORICAL,
        type SEFactor,
        VIS_COLOR,
        AVERAGE_COLOR,
        MARGINS,
        AVERAGE_DX,
        SCENARIOS, type Scenario, TIMES, COBENEFS_RANGE, COBENEFS
    } from "../../globals";
    import {legend} from "@observablehq/plot";
    import {getRandomSubarray} from "$lib/utils";


    let element: HTMLElement
    let plot: HTMLElement
    let plotPerCb: HTMLElement
    let heatmapPlot: HTMLElement
    let CBOverTimePLot: HTMLElement
    let CBOverTimePerScenarioPLot: HTMLElement
    let CBOverTimePerCBPLot: HTMLElement
    let SEFPlotLAD: Record<SEFactor, HTMLElement> = {};
    let SEFPlotFullDistrib: Record<SEFactor, HTMLElement> = {};
    let SEFPlotPerCB: Record<SEFactor, HTMLElement> = {};
    let scenarioXcoBenefPLots: Record<Scenario, HTMLElement> = {};
    let chartType: "barchart" | "boxplot" | "distribution" = "barchart"
    let isSEFAggregated = false;

    let height = 300;

    // Data from load function
    export let data;

    const LAD = data.LAD;

    const oneLADData = data.oneLADData;
    const oneLADAllCbs = data.oneLADAllCBs;

    const allCBAllLAD = data.allCBAllLAD;
    const totalCBAllZones = data.totalCBAllZones;

    // aggregated by sum
    const totalCBAllLAD = data.totalCBAllLAD;


    // console.log(1,oneLADAllCbs)
     // console.log(2,oneLADData)
     //
     console.log(99,oneLADAllCbs.reduce((a, b) => {
         return a + b.total
     }, 0))
     console.log(999,oneLADData.reduce((a, b) => {
         return a + b.total
     }, 0))

     console.log(99,oneLADAllCbs.filter(d => d.scenario == "BNZ").reduce((a, b) => {
         return a + b.total
     }, 0))
     console.log(999,oneLADData.filter(d => d.scenario == "BNZ").reduce((a, b) => {
         return a + b.total
     }, 0))

    console.log(88,oneLADAllCbs.filter(d => d.scenario == "Tailwinds").reduce((a, b) => {
         return a + b.total
     }, 0))
     console.log(888,oneLADData.filter(d => d.scenario == "Tailwinds").reduce((a, b) => {
         return a + b.total
     }, 0))


    const LADToName = data.LADToName;

    let map: Map;


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
                    ...MARGINS,
                    x: {type: "band"},
                    style: {fontSize: "18px"},
                    marks: [
                        Plot.boxY(oneLADData, {y: "total", x: "scenario", tip: true}),
                        // Plot.tickX([{totalCBAllZones, scenario: "BNZ"}], {y: "scenario", x:'v', stroke: 'red'}),

                        //  Median and Mean from ALL datazones
                        Plot.tickY(
                            totalCBAllZones,
                            Plot.groupX(
                                {y: "median"},
                                {y: "total", x: "scenario", stroke: "blue", strokeWidth: 2}
                            )
                        ),
                        Plot.tickY(
                            totalCBAllZones,
                            Plot.groupX(
                                {y: "mean"},
                                {y: "total", x: "scenario", stroke: "red", strokeWidth: 2}
                            )
                        )
                    ]
                }))
        } else if (chartType == "barchart") {
            plot?.append(
                Plot.plot({
                    height: height / 1.4,
                    ...MARGINS,
                    x: {type: "band"},
                    style: {fontSize: "18px"},
                    marks: [

                        Plot.barY(
                            totalCBAllLAD,
                            Plot.groupX(
                                {y: "mean"},
                                {y: "val", x: "scenario", fill: "gray", opacity: 0.7, dx: 20}
                            )
                        ),
                        Plot.barY(oneLADData, Plot.groupX({y: "sum"}, {
                            y: "total",
                            x: "scenario",
                            tip: true
                        })),

                        //  Median and Mean from ALL datazones
                        // Plot.tickY(
                        //     totalCBAllLAD,
                        //     Plot.groupX(
                        //         {y: "mean"},
                        //         {y: "val", x: "scenario", stroke: "red", strokeWidth: 2}
                        //     )
                        // ),
                        // Plot.tickY(
                        //     totalCBAllLAD,
                        //     Plot.groupX(
                        //         {y: "median"},
                        //         {y: "val", x: "scenario", stroke: "blue", strokeWidth: 2}
                        //     )
                        // )

                    ]
                })
            );

        } else if (chartType == "distribution") {
            plot?.append(
                Plot.plot({
                    height: height / 1.4,
                    ...MARGINS,
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

    function renderPerCobenefPlot() {
        plotPerCb?.append(
            Plot.plot({
                height: height,
                MARGINS,
                x: {type: "band"},

                marks: [
                    Plot.barY(allCBAllLAD, Plot.groupX({y: "sum"}, {
                        y: "val",
                        x: "co_benefit_type",
                        dx: AVERAGE_DX,
                        fill: AVERAGE_COLOR,
                        tip: true
                    })),
                    Plot.barY(oneLADAllCbs, Plot.groupX({y: "sum"}, {
                        y: "total",
                        x: "co_benefit_type",
                        tip: true
                    }))


                    // Plot.link(
                    //     dataPerCb,
                    //     Plot.groupY(
                    //         {
                    //             x1: (data) => d3.mean(data) - d3.deviation(data),
                    //             x2: (data) => d3.mean(data) + d3.deviation(data)
                    //         },
                    //         {
                    //             x: "total",
                    //             y: "co_benefit_type",
                    //             stroke: "gray",
                    //             strokeWidth: 3
                    //         }
                    //     )
                ]
            }))
    }

    function renderSEFPlot() {
        SEF.forEach(sef => {
            let plot
            let plotFullDistrib;

            if (isSEFAggregated) {
                if (SEF_CATEGORICAL.includes(sef)) {
                    plot = Plot.plot({
                        height: height / 3,
                        width: 500 * 2,
                        ...MARGINS,
                        // y: {grid: true, label: "mean value (£)"},
                        style: {fontSize: "18px"},
                        color: {legend: true, scheme: "greys"},
                        x: {domain: d3.range(0, 6), ticks: new Set(oneLADData.map(d => d[sef]))},
                        marks: [
                            // Plot.cell(oneLADData, {x: sef}),
                            Plot.cell(oneLADData,
                                Plot.groupX({fill: "count"}, {x: sef, stroke: "black"})
                            ),
                            Plot.cell([Math.floor(d3.mean(totalCBAllZones.map(d => d[sef])))],
                                {x: d => d, stroke: "red", fill: null, strokeWidth: 2}
                            )
                        ]
                    })
                } else {
                    plot = Plot.plot({
                        height: height / 3,
                        width: 500 * 2,
                        ...MARGINS,
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


            }
            else {
                if (SEF_CATEGORICAL.includes(sef)) {
                    // plotFullDistrib = Plot.plot({
                    //     height: height / 2,
                    //     width: 500,
                    //     ...MARGINS,
                    //     y: {grid: true, label: "mean value (£)"},
                    //     x: {grid: true, label: sef, type: "band"},
                    //     style: {fontSize: "18px"},
                    //     color: {legend: true},
                    //     marks: [
                    //         Plot.barY(totalCBAllZones, Plot.groupX({y: "count"}, {
                    //             x: sef
                    //         })),
                    //     ]
                    // })
                    // let domain = plotFullDistrib.scale('x').domain;

                    plot = Plot.plot({
                        height: height / 2,
                        width: 500,
                        ...MARGINS,
                        marginLeft: 100,
                        // y: {grid: true, label: "mean value (£)"},
                        // x: {grid: true, label: sef, domain: domain, tickFormat: d => Math.floor(d)},
                        x: {grid: true, label: sef, tickFormat: d => Math.floor(d)},
                        style: {fontSize: "18px"},
                        color: {legend: true},
                        marks: [
                            Plot.barY(totalCBAllZones, Plot.normalizeY(Plot.groupX({y: "count"}, {
                                x: sef,
                                dx: 20,
                                fill: AVERAGE_COLOR
                            })  )),
                            Plot.barY(oneLADData, Plot.normalizeY(Plot.groupX({y: "count"}, {
                                x: sef
                            })))
                        ]
                    })
                } else {
                    // plotFullDistrib = Plot.plot({
                    //     height: height / 2,
                    //     width: 500,
                    //     ...MARGINS,
                    //     // y: {grid: true, label: "mean value (£)"},
                    //     style: {fontSize: "18px"},
                    //     color: {legend: true},
                    //     marks: [
                    //         Plot.areaY(totalCBAllZones, Plot.binX({y: "count"}, {
                    //             x: sef,
                    //             tip: true
                    //         })),
                    //     ]
                    // })
                    //
                    // let domain = plotFullDistrib.scale('x').domain;

                    plot = Plot.plot({
                        height: height / 2,
                        ...MARGINS,
                        // y: {label: "Datazones Frequency"},
                        // x: {domain},
                        style: {fontSize: "18px"},
                        marks: [
                            Plot.lineY(oneLADData, Plot.normalizeY(Plot.binX({y: "count"}, {
                                x: sef,
                                tip: true,
                                opacity: 0.3
                            }))),
                            Plot.lineY(totalCBAllZones, Plot.normalizeY(Plot.binX({y: "count"}, {
                                x: sef,
                                tip: true,
                                // fill: AVERAGE_COLOR,
                                // opacity: 0.3,
                            }))),
                            //  Median and Mean from ALL datazones
                        ]
                    })
                }
                SEFPlotFullDistrib[sef]?.append(plotFullDistrib);
                SEFPlotLAD[sef]?.append(plot)
            }

            let cbplot = Plot.plot({
                height: height / 2,
                ...MARGINS,
                // y: {label: "Datazones Frequency"},
                // x: {domain},
                style: {fontSize: "18px"},
                marks: [
                    Plot.density(getRandomSubarray(totalCBAllZones, 10000), {
                        x: sef,
                        y: "total"
                    }),
                    Plot.dot(oneLADData, {
                        x: sef,
                        y: "total"
                    }),
                    Plot.linearRegressionY(oneLADData, { // Adds regression line and confidence interval
                      x: sef,
                      y: "total"
                    }),
                ]
            })

            SEFPlotPerCB[sef]?.append(cbplot)
        })
    }

    function renderHeatmap() {

        // console.log(29, oneLADAllCbs)
        // console.log(30, allCBAllLAD)

        // May want to show sum
        heatmapPlot?.append(Plot.plot({
            ...MARGINS,
            marginLeft: 100,
            height: height,
            width: 300,
            grid: true,
            // x: {axis: "top", label: "Season"},
            // y: {label: "Episode"},
            color: {type: "linear", scheme: "greys", legend: true},
            marks: [
                Plot.cell(allCBAllLAD, Plot.group({fill: "mean"}, {
                    x: "scenario",
                    y: "co_benefit_type",
                    fill: "val",
                    stroke: "black",
                    dx: AVERAGE_DX / 2,
                    dy: -AVERAGE_DX / 2,
                    inset: 0.5
                })),
                Plot.cell(oneLADAllCbs, Plot.group({fill: "mean"}, {
                    x: "scenario",
                    y: "co_benefit_type",
                    fill: "total",
                    stroke: "black",
                    inset: 0.5
                }))
                // Plot.text(allCBAllLAD, {x: "scenario", y: "co_benefit_type", text: (d) => d.val?.toFixed(1), fill: "black", title: "title"})
            ]
        }))
    }

    function renderScenarioXCBPlot() {
        for (let scenario of SCENARIOS) {
            let plot = Plot.plot({
                height: height,
                width: 410,
                ...MARGINS,
                marginRight: 0,
                x: {type: "band"},

                marks: [
                    Plot.barX(allCBAllLAD, Plot.groupY({x: "mean"}, {
                        x: "val",
                        y: "co_benefit_type",
                        // dx: AVERAGE_DX,
                        dy: -AVERAGE_DX / 2,
                        fill: AVERAGE_COLOR,
                        tip: true
                    })),
                    Plot.barX(oneLADAllCbs, Plot.groupY({x: "mean"}, {
                        x: "total",
                        y: "co_benefit_type",
                        tip: true
                    }))
                ]
            })

            scenarioXcoBenefPLots[scenario]?.append(plot);

        }
    }

    function renderCBOverTimePlot() {
        let dataLAD = oneLADData.flatMap(d => {
            return TIMES.map(t => {
                return {time: t, value: d[t], scenario: d.scenario, zone: "local"}
            })
        })
        let dataAllZones = totalCBAllZones.flatMap(d => {
            return TIMES.map(t => {
                return {time: t, value: d[t], scenario: d.scenario, zone: "UK"}
            })
        })
        let data = dataLAD.concat(dataAllZones)

        console.log(data[20])


        let plot = Plot.plot({
            height: height,
            width: 800,
            ...MARGINS,
            paddingLeft: 200,
            marginRight: 0,
            x: {tickSize: 0, label: null, ticks: []},
            // x: {tickSize: 0, label: null, ticks: [], padding: 0},
            color: {range: [VIS_COLOR, AVERAGE_COLOR]},

            marks: [
                // Plot.barX(allCBAllLAD, Plot.groupY({x: "mean"}, {
                //     x: "val",
                //     y: "co_benefit_type",
                //     // dx: AVERAGE_DX,
                //     dy: -AVERAGE_DX / 2,
                //     fill: AVERAGE_COLOR,
                //     tip: true
                // })),
                Plot.barY(data, Plot.groupX({y: "mean"}, {
                    x: "zone",
                    y: "value",
                    fx: "time",
                    tip: true,
                    fill: "zone",
                }))
            ]
        })
        CBOverTimePLot?.append(plot);


        // Make the bars overlay and one on top of the other depending of values
        // TODO: finish
        d3.select(CBOverTimePLot)
            .select("g[aria-label='bar']")
            .selectAll("g")
            .each(function (d, i) {
                // Translate the second <rect>
                const secondRect = d3.select(this).selectAll("rect").nodes()[0];

                // Get the current transform of the second rect, if any
                const currentTransform = d3.select(secondRect).attr("transform") || "";

                // Apply translation (e.g., move it 20 units to the right and 10 down)
                d3.select(secondRect)
                    .attr("transform", `${currentTransform} translate(-20, 0)`);


                // Select both <rect> elements within the current <g>

                let first = d3.select(this).selectAll("rect").nodes()[0].getAttribute("height")
                let second = d3.select(this).selectAll("rect").nodes()[1].getAttribute("height")

                // console.log(first, second)
                const rects = d3.select(this).selectAll("rect");

                // if (first < second) {
                rects.each(function (d, i2) {
                    if (i2 == 0) {
                        // console.log(333, this)
                        d3.select(this).raise()
                    }

                    //Do stuff with first and last child
                });
            });



        let plotPerScenario = Plot.plot({
            height: height,
            width: 800,
            ...MARGINS,
            paddingLeft: 200,
            marginRight: 0,
            // x: {tickSize: 0, label: null, ticks: []},
            color: {legend: true},

            marks: [
                Plot.lineY(data, Plot.groupX({y: "mean"}, {
                    x: "time",
                    y: "value",
                    tip: true,
                    stroke: "scenario"
                    // fill: "scenario",
                })),

            ]
        })
        CBOverTimePerScenarioPLot?.append(plotPerScenario);



        let dataCBs = oneLADAllCbs.flatMap(d => {
            return TIMES.map(t => {
                return {time: t, value: d[t], cobenefit: d.co_benefit_type}
            })
        })

        let plotPerCB = Plot.plot({
            height: height,
            width: 1000,
            ...MARGINS,
            paddingLeft: 200,
            marginRight: 0,
            insetLeft:10,
            insetRight:10,
            insetBottom:30,
            style: {fontSize: "10px"},
            y: {tickFormat: ".2f", label:'Value (£)'},
            x: {label:'Year'},
            // x: {tickSize: 0, label: null, ticks: []},
            color: {legend: true, range: COBENEFS_RANGE, domain: COBENEFS},
            marks: [
                Plot.areaY(dataCBs, Plot.groupX({y: "mean"}, {
                    x: "time",
                    y: "value",
                    tip: true,
                    fill: "cobenefit"
                    // fill: "scenario",
                })), 
                Plot.ruleY([0], {strokeWidth:8, stroke:'white', opacity:1, strokeLinecap:'round'}),
                Plot.ruleY([0], {strokeWidth:2, stroke:'#333333', opacity:1, strokeLinecap:'round'}),

            ]
        })
        CBOverTimePerCBPLot?.append(plotPerCB);

    }


    $: {
        plot?.firstChild?.remove(); // remove old chart, if any
        plotPerCb?.firstChild?.remove(); // remove old chart, if any
        CBOverTimePLot?.firstChild?.remove(); // remove old chart, if any

        //ugly hack for reactivity
        if (chartType) {
        }

        renderPlot();
        renderPerCobenefPlot();
        renderCBOverTimePlot();
    }

    $: {
        Object.values(SEFPlotLAD).forEach(sefPlot => {
            sefPlot?.firstChild?.remove();
        })

        Object.values(SEFPlotFullDistrib).forEach(sefPlot => {
            sefPlot?.firstChild?.remove();
        })

        Object.values(SEFPlotPerCB).forEach(sefPlot => {
            sefPlot?.firstChild?.remove();
        })

        renderSEFPlot();
    }

    $: {
        heatmapPlot?.firstChild?.remove();

        Object.values(scenarioXcoBenefPLots).forEach(plot => {
            plot?.firstChild?.remove();
        })

        renderHeatmap();
        renderScenarioXCBPlot();
    }

    function onChange(event) {
        chartType = event.currentTarget.value;
    }
</script>


<div class="page-container" bind:this={element}>

    <div class="section header">
        <p class="page-subtitle">Data Report</p>
        <h1 class="page-title"> {LADToName[LAD]}</h1>
        <p class="description">Explore how this local authority will benefit from achieving Net Zero and general factors of their households.</p>
    </div>

    <div class="section">
        <div class="section-header">
            <p class="section-subtitle">Overview</p>
            <h2 class="section-title">How much co-benefit values would this area recieve?</h2>
            <p class="description">We calculate and model 11 types of co-benefits across five different pathyways suggested by Climate Change Committee in the Sixth Carbon Budget from 2025-2050 on the level of data zones across UK.</p>
        </div>

        <div id="vis-block">
            <div class="component column" bind:clientHeight={height}>
                <h3 class="component-title">Total Co-benefits Values Across Five Pathways (vs. UK Average)</h3>
                <p class="description">Aggregated values from 2025-2050 in {LADToName[LAD]} verus average value of benefits recieved across all local authorities in UK.</p>

                <div class="radio-set">
                    <input type="radio" on:change={onChange} name="visType" value="barchart" checked>
                    <label for="html">Barchart</label><br>
                    <input type="radio" on:change={onChange} name="visType" value="boxplot">
                    <label for="css">Boxplot</label><br>
                    <input type="radio" on:change={onChange} name="visType" value="distribution">
                    <label for="javascript">Distribution</label>
                </div>

                <div class="plot" bind:this={plot}>
                </div>
            </div>

            <div class="component column">
                <h3 class="component-title">11 Types of Co-Benefits Values (vs. UK Average)</h3>
                <p class="description">Co-benefits values in {LADToName[LAD]} verus average value across all local authorities in UK.</p>
                <div class="plot" bind:this={plotPerCb}>
                </div>
            </div>

            <div class="component column">
                <h3 class="component-title">{LADToName[LAD]} on UK Map</h3>
                <p class="description">Scroll for zooming in and out.</p>
                <div id="map" bind:this={mapDiv}>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">
            <p class="section-subtitle">Breakdown</p>
            <h2 class="section-title">How would the co-benefit results vary if we take different pathways?</h2>
            <p class="description">We break down the modeled co-benefit values in different pathways towards achieving Net Zero. All Results are compared with the average value across all local authorities in UK.</p>
        </div>

        <div class="row">
            <div class="component">
                <h3 class="component-title">Five Pathways and their 11 Co-benefits</h3>
                <p class="description">Scroll for zooming in and out.</p>
                <div class="plot" bind:this={heatmapPlot}></div>
            </div>

            {#each SCENARIOS as scenario}
                <div class="component">
                    <h3 class="component-title"> Pathway: {scenario}</h3>
                    <p class="description">Please refer to CCC website on definitions of {scenario}.</p>
                    <div class="plot" bind:this={scenarioXcoBenefPLots[scenario]}>
                    </div>
                </div>  
            {/each}
        </div>
    </div>

    <div class="component">
        <h3> Cobenefits over Time </h3>

        <div class="row">
            <div class="plot" bind:this={CBOverTimePLot}></div>
        </div>

        <div class="row">
            <div class="plot" bind:this={CBOverTimePerScenarioPLot}>
                <div class="badge"> SUP </div>
            </div>
        </div>

        <div class="row">
            <div class="plot" bind:this={CBOverTimePerCBPLot}></div>
        </div>
    </div>


    <div id="multiple-comp" class="component">
        <h1> Socio Economic Factors </h1>

        <input type="checkbox" bind:checked={isSEFAggregated}/>
        <label for="checkbox">Aggregate Plots</label>

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

                        <div>
                            Per Cobenefit
                            <div class="plot" bind:this={SEFPlotPerCB[sef]}>
                            </div>
                        </div>
                    {/if}

                </div>
            </div>
        {/each}

    </div>
</div>

<style>
    #vis-block {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1%;
        /* width: 98%; */
        padding-left: 1%;
        padding-right: 1%;
        padding-bottom: 1%;
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
