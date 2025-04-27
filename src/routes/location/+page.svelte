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
        SCENARIOS,
        type Scenario,
        TIMES,
        COBENEFS_RANGE,
        COBENEFS,
        NATION_TO_COLOR,
        COBENEFS_SCALE,
        removeSpinner,
        addSpinner,
        SEF_SCALE
    } from "../../globals";
    import {legend} from "@observablehq/plot";
    import {getRandomSubarray} from "$lib/utils";

    // BADGES
    // import TruncAxisBadge from '$lib/badges/truncatedaxis.png';
    // import overlapBadge from '$lib/badges/(Can) contain overlapping visual marks.png';
    // import mouseOverBadge from '$lib/badges/Mouse Over.png';
    // import roundingBadge from '$lib/badges/Rounding.png';
    // import aggregationBadge from '$lib/badges/Aggregated data.png';
    // import zoomBadge from '$lib/badges/Zoom.png';
    // import normalizedBadge from '$lib/badges/Data normalized.png';
    // import predictionsBadge from '$lib/badges/Contains predictions.png';
    // import multipleDataSourceBadge from '$lib/badges/Contains Multiple Data Sources Full.png';
    // import modeledDataBadge from '$lib/badges/Contains modeled data.png';
    // import binningBadge from '$lib/badges/Binning applied.png';


    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import {
        getAllCBAllDatazones, getAllCBForOneLAD,
        getAverageCBGroupedByLAD,
        getSUMCBGroupedByLAD, getSUMCBGroupedByLADAndCB,
        getTableData,
        getTotalCBAllDatazones, getTotalCBForOneLAD
    } from "$lib/duckdb";


    let element: HTMLElement
    let plotDist: HTMLElement
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

    let height = 400;

    // Data from load function
    export let data;

    const LAD = data.LAD;
    let compareTo: "UK" | "England" | "Wales" | "NI" | "Scotland" = "UK"

    // const oneLADData = data.oneLADData;
    // const oneLADAllCbs = data.oneLADAllCBs;
    //
    // const totalCBAllZones = data.totalCBAllZones;
    // const allCBAllZones = data.totalCBAllZones;
    //
    // const allCBAllLAD = data.allCBAllLAD;
    //
    //
    // // aggregated by sum
    // const totalCBAllLAD = data.totalCBAllLAD;
    // const allCBAllLADSUM = data.allCBAllLADSUM;

    let totalCBAllZones;
    let allCBsAllZones;
    let totalCBAllLAD;

    let allCBAllLAD;

    let allCBAllLADSUM;

    let oneLADData;
    let oneLADAllCbs;

    let dataLoaded = false;


    async function loadData() {
        totalCBAllZones = await getTableData(getTotalCBAllDatazones());
        allCBsAllZones = await getTableData(getAllCBAllDatazones());

        totalCBAllLAD = await getTableData(getSUMCBGroupedByLAD([]));

        allCBAllLAD = await getTableData(getAverageCBGroupedByLAD(COBENEFS.map(d => d.id)));

        allCBAllLADSUM = await getTableData(getSUMCBGroupedByLADAndCB());

        oneLADData = await getTableData(getTotalCBForOneLAD(LAD));
        oneLADAllCbs = await getTableData(getAllCBForOneLAD(LAD));

        dataLoaded = true;
        removeSpinner(element)
    }

    loadData();

    const LADToName = data.LADToName;

    let map: Map;
    let mapDiv: HTMLElement;

    onMount(() => {
        addSpinner(element)
        map = new Map(LAD, "LAD", mapDiv, "val", true);
        map.initMap();
    })

    function renderPlot() {
        if (chartType == "boxplot") {
            plotDist?.append(
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
            // plot?.append(
            let pl = Plot.plot({
                height: height / 1.4,
                ...MARGINS,
                x: {type: "band"},
                style: {fontSize: "18px"},
                marks: [
                    Plot.barY(
                        totalCBAllLAD,
                        Plot.groupX(
                            {y: "mean"},
                            {y: "val", x: "scenario", fill: "lightblue", opacity: 0.7, dx: 20}
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
            // );
            // console.log("debug", pl)

            plotDist?.append(pl);

            setTimeout(() => {

                const rects = d3.select(pl)
                    .selectAll("g[aria-label='bar']")
                // .selectAll("g")

                const rects1 = d3.select(rects.nodes()[0])
                const rects2 = d3.select(rects.nodes()[1])

                console.log(2323232323, rects1.node())
                // console.log(groupA._groups[0][1])

                // const groupB = d3.select("#groupB");
                //
                // // Move all children of groupB into groupA
                rects2.selectAll("rect").each(function () {
                    console.log(2, this)
                    // rects1.node().appendChild(this);
                });
                //
                rects2.remove();

            }, 1000)


        } else if (chartType == "distribution") {
            plotDist?.append(
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
        console.log(99, allCBAllLADSUM)
        plotPerCb?.append(
            Plot.plot({
                height: height,
                width: 811,
                MARGINS,
                x: {type: "band"},
                marks: [
                    // Plot.barY(allCBAllLAD, Plot.groupX({y: "mean"}, {
                    //     y: "val",
                    //     x: "co_benefit_type",
                    //     dx: AVERAGE_DX,
                    //     fill: AVERAGE_COLOR,
                    //     tip: true
                    // })),
                    // Plot.barY(allCBAllZones, Plot.groupX({y: "sum"}, {
                    //     y: "total",
                    //     x: "co_benefit_type",
                    //     dx: AVERAGE_DX,
                    //     fill: AVERAGE_COLOR,
                    //     tip: true
                    // })),

                    Plot.barY(allCBAllLADSUM, Plot.groupX({y: "mean"}, {
                        y: "val",
                        x: "co_benefit_type",
                        dx: AVERAGE_DX,
                        fill: AVERAGE_COLOR,
                        sort: {x: "y", reverse: true},
                        tip: true
                    })),

                    Plot.barY(oneLADAllCbs, Plot.groupX({y: "sum"}, {
                        y: "total",
                        x: "co_benefit_type",
                         fill: d => COBENEFS_SCALE(d["co_benefit_type"]),
                        tip: true
                    }))
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


            } else {
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
                        x: {grid: true, label: sef, tickFormat: d => Math.floor(d)},
                        style: {fontSize: "18px"},
                        color: {legend: true},
                        marks: [
                            Plot.barY(totalCBAllZones, Plot.normalizeY(Plot.groupX({y: "count"}, {
                                x: sef,
                                dx: 20,
                                fill: AVERAGE_COLOR
                            }))),
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
                        x: {label: SEF_SCALE(sef)},
                        style: {fontSize: "18px"},
                        marks: [
                            Plot.areaY(oneLADData, Plot.binX({y: "proportion"}, {
                                x: sef,
                                tip: true,
                                fill: AVERAGE_COLOR,
                                stroke: AVERAGE_COLOR,
                                // stroke:"lightblue",
                                // strokeWidth: 1.2,
                                fillOpacity: 0.2,
                                strokeWidth: 3

                            })),
                            Plot.areaY(totalCBAllZones, Plot.binX({y: "proportion"}, {
                                x: sef,
                                tip: true,
                                fill: "black",
                                stroke: "black",
                                fillOpacity: 0.2,
                                strokeWidth: 3
                                // fill: AVERAGE_COLOR,
                                // opacity: 0.3,
                            })),
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
                x: {label: SEF_SCALE(sef)},
                style: {fontSize: "18px"},
                color: {range: ["rgb(227, 248, 255)", "lightblue"]},
                marks: [
                    // Plot.density(getRandomSubarray(totalCBAllZones, 10000), {
                    //     x: sef,
                    //     y: "total",
                    //     stroke: "lightblue",
                    //     strokeWidth: 0.5,
                    // }),
                    // Plot.density(getRandomSubarray(totalCBAllZones, 10000), {
                    //     x: sef,
                    //     y: "total",
                    //     stroke: "lightblue",
                    //     strokeWidth: 1.2,
                    //     thresholds: 10
                    // }),
                    Plot.density(getRandomSubarray(totalCBAllZones, 30000), {
                        x: sef,
                        y: "total",
                        fill: "density",
                        // strokeWidth: 1.2,
                        thresholds: 10
                    }),
                    Plot.dot(oneLADData, {
                        x: sef,
                        y: "total",
                        fill: "black",
                        r: 2
                    }),
                    Plot.linearRegressionY(oneLADData, { // Adds regression line and confidence interval
                        x: sef,
                        y: "total"
                    }),
                    // Declaring the axes so they are on top of the densities
                    Plot.axisY(),
                    Plot.axisX({anchor: "bottom"})
                ]
            })
            // console.log("debug", cbplot)

            SEFPlotPerCB[sef]?.append(cbplot)
        })
    }

    function renderHeatmap() {

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
                marginLeft: 100,
                // x: {type: "band"},

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

        let plot = Plot.plot({
            height: height,
            width: 800,
            ...MARGINS,
            marginRight: 0,
            marginLeft: 40,
            marginTop: 40,
            style: {fontSize: "18px"},
            y:{label: '£'},
            //x: {tickSize: 0, label: 'Years', ticks: [],
            //tickFormat: d => d.replace(/^Y/, '').split("_")[1]
            //},
            x: {tickSize: 0, label: null, ticks: [], padding: 0},
            //fx:{tickFormat: d => d.replace(/^Y/, '').replace("_","-"),
            //    anchor:"bottom"},
            color: {range: [VIS_COLOR, AVERAGE_COLOR]},
            // color: {range: [VIS_COLOR, NATION_TO_COLOR[compareTo]]},
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
                })),
                Plot.axisFx({anchor: "bottom", 
                            tickFormat: d => d.replace(/^Y/, '').replace("_","-"),
                            offset:5,
                            label: "Years"})
            //Plot.axisX({label: null})
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
                // rects.each(function (d, i2) {
                //     if (i2 == 0) {
                //         // console.log(333, this)
                //         d3.select(this).raise()
                //     }
                //
                //     //Do stuff with first and last child
                // });

            });


        let plotPerScenario = Plot.plot({
            height: height,
            width: 800,
            ...MARGINS,
            paddingLeft: 200,
            marginRight: 0,
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
        console.log("debug", dataCBs);

        let desiredOrder = [
            "Road safety",
            "Congestion",
            "Air quality", 
            "Noise", 
            "Excess cold", 
            "Excess heat", 
            "Dampness", 
            "Road repairs",
            "Physical activity", 
            "Diet change",
            "Hassle costs"
            
            ];

        let plotPerCB = Plot.plot({
            height: height*1.5,
            width: 1000,
            marginRight: 0,
            marginTop:40,
            marginLeft: 60,
            marginBottom:60,
            style: {fontSize: "18px"},
            y: {tickFormat: ".2f", label: 'Value (£)'},
            x: {label: 'Years', 
                tickFormat: d => d.replace(/^Y/, '').split("_")[1],
            },
            // x: {tickSize: 0, label: null, ticks: []},
            color: {legend: true, range: COBENEFS_RANGE, domain: COBENEFS.map(d => d.id)},
            marks: [
                Plot.areaY(dataCBs, Plot.groupX({y: "mean"},
                {
                    x: "time",
                    y: "value",
                    tip: true,
                    fill: "cobenefit",
                    curve: "basis",
                    order: [
                            "Road safety",
                            "Congestion",
                            "Air quality", 
                            "Noise", 
                            "Excess cold", 
                            "Excess heat", 
                            "Dampness", 
                            "Road repairs",
                            "Physical activity", 
                            "Diet change",
                            "Hassle costs"],
                    // offset: 
                })),
                //Plot.ruleY([0], {strokeWidth: 8, stroke: 'white', opacity: 1, strokeLinecap: 'round'}),
                Plot.ruleY([0], {strokeWidth: 2, stroke: '#333333', opacity: 0.5, strokeLinecap: 'round'}),

            ]
        })

        
        CBOverTimePerCBPLot?.append(plotPerCB);

    }

    function removeChart(plotDiv) {
        // Select the figure element within the div
        const figure = plotDiv.querySelector('figure');

        // Remove the figure element if it exists
        if (figure) {
            figure.remove();
        }

        // Sometimes it's not a figure markup but a svg?
        const svg = plotDiv.querySelector('svg');
        if (svg) {
            svg.remove();
        }
    }


    $: {
        // plot?.firstChild?.remove(); // remove old chart, if any
        // plotPerCb?.firstChild?.remove(); // remove old chart, if any
        // CBOverTimePLot?.firstChild?.remove(); // remove old chart, if any
        // CBOverTimePerScenarioPLot?.firstChild?.remove();
        // CBOverTimePerCBPLot?.firstChild?.remove();

        // remove old chart, if any
        if (plotDist) {
            removeChart(plotDist)
        }

        if (plotPerCb) {
            removeChart(plotPerCb)
        } // remove old chart, if any
        if (CBOverTimePLot) removeChart(CBOverTimePLot) // remove old chart, if any
        if (CBOverTimePerScenarioPLot) removeChart(CBOverTimePerScenarioPLot)
        if (CBOverTimePerCBPLot) removeChart(CBOverTimePerCBPLot)

        //ugly hack for reactivity
        if (chartType) {
        }

        if (dataLoaded && allCBAllLADSUM && totalCBAllLAD && totalCBAllZones) {
            console.log("render")
            renderPlot();
            renderPerCobenefPlot();
            renderCBOverTimePlot();
        }
    }

    $: {
        Object.values(SEFPlotLAD).forEach(sefPlot => {
            if (sefPlot) removeChart(sefPlot)
            // sefPlot?.firstChild?.remove();
        })

        Object.values(SEFPlotFullDistrib).forEach(sefPlot => {
            if (sefPlot) removeChart(sefPlot)
            // sefPlot?.firstChild?.remove();
        })

        Object.values(SEFPlotPerCB).forEach(sefPlot => {
            if (sefPlot) removeChart(sefPlot)
            // sefPlot?.firstChild?.remove();
        })

        if (dataLoaded) {
            renderSEFPlot();
        }
    }

    $: {
        heatmapPlot?.firstChild?.remove();

        Object.values(scenarioXcoBenefPLots).forEach(plot => {
            // plot?.firstChild?.remove();
            if (plot) removeChart(plot)
        })

        if (dataLoaded) {
            renderHeatmap();
            renderScenarioXCBPlot();
        }
    }

    function onChange(event) {
        chartType = event.currentTarget.value;
    }

    async function onChangeComparison(event) {
        compareTo = event.currentTarget.value;

        allCBAllLADSUM = await getTableData(getSUMCBGroupedByLADAndCB("total", compareTo));
        totalCBAllLAD = await getTableData(getSUMCBGroupedByLAD([], compareTo));

        totalCBAllZones = await getTableData(getTotalCBAllDatazones(compareTo));
    }
</script>


<NavigationBar></NavigationBar>


<div class="page-container" bind:this={element}>

    <!--Define css variable -->
    <div style="--color: {AVERAGE_COLOR}"></div>

    <div class="section header">
        <p class="page-subtitle">Data Report</p>
        <h1 class="page-title"> {LADToName[LAD]}</h1>
        <p class="description">Explore how this local authority will benefit from achieving Net Zero and general factors
            of their households.</p>

        <div class="radio-set">
            Compare the Local District Area with average of:
            <input type="radio" on:change={onChangeComparison} name="compare" value="UK" checked>
            <label class="nation-label" for="html">UK</label><br>
            <input type="radio" on:change={onChangeComparison} name="compare" value="England">
            <label class="nation-label" for="html">England</label><br>
            <input type="radio" on:change={onChangeComparison} name="compare" value="Wales">
            <label class="nation-label" for="html">Wales</label><br>
            <input type="radio" on:change={onChangeComparison} name="compare" value="Scotland">
            <label class="nation-label" for="javascript" >Scotland</label>
            <input type="radio" on:change={onChangeComparison} name="compare" value="NI">
            <label class="nation-label" for="javascript">Northern Ireland</label>
        </div>

    </div>

    <div class="section">
        <div class="section-header">
            <p class="section-subtitle">Overview</p>
            <h2 class="section-title">How much co-benefit values would this area recieve?</h2>
            <p class="description">We calculate and model 11 types of co-benefits across five different pathyways
                suggested by Climate Change Committee in the Sixth Carbon Budget from 2025-2050 on the level of data
                zones across UK.</p>
        </div>

        <div id="vis-block">
            <!--            <div class="component column" bind:clientHeight={height}>-->
            <!--                <h3 class="component-title">Total Co-benefits Values Across Five Pathways (vs. UK Average)</h3>-->
            <!--                <p class="description">Aggregated values from 2025-2050 in {LADToName[LAD]} verus average value of benefits recieved across all local authorities in UK.</p>-->

            <!--                <div class="radio-set">-->
            <!--                    <input type="radio" on:change={onChange} name="visType" value="barchart" checked>-->
            <!--                    <label for="html">Barchart</label><br>-->
            <!--                    <input type="radio" on:change={onChange} name="visType" value="boxplot">-->
            <!--                    <label for="css">Boxplot</label><br>-->
            <!--                    <input type="radio" on:change={onChange} name="visType" value="distribution">-->
            <!--                    <label for="javascript">Distribution</label>-->
            <!--                </div>-->

            <!--                <div class="plot" bind:this={plot}>-->
            <!--&lt;!&ndash;                    <div class="badge-container">&ndash;&gt;-->
            <!--&lt;!&ndash;                        <img class="badge" src={mouseOverBadge} />&ndash;&gt;-->
            <!--&lt;!&ndash;                        <img class="badge" src={aggregationBadge} />&ndash;&gt;-->
            <!--&lt;!&ndash;                    </div>&ndash;&gt;-->
            <!--                </div>-->
            <!--            </div>-->

            <div class="component column">
                <h3 class="component-title">11 Types of Co-Benefits Values (vs. <span class="nation-label">{compareTo}</span> Average)</h3>
                <p class="description">Co-benefits values in {LADToName[LAD]} verus average value across all local
                    authorities in <span class="nation-label">{compareTo}</span> </p>
                <div class="plot" bind:this={plotPerCb}>
                    <!--                    <div class="badge-container">-->
                    <!--                        <img class="badge" src={aggregationBadge} />-->
                    <!--                    </div>-->
                </div>
            </div>

            <div class="component column">
                <h3 class="component-title">{LADToName[LAD]} on UK Map</h3>
                <p class="description">Scroll for zooming in and out.</p>
                <div id="map" bind:this={mapDiv}>
                    <!--                    <div class="badge-container">-->
                    <!--                        <img class="badge" src={zoomBadge} />-->
                    <!--                    </div>-->
                </div>
            </div>
        </div>
    </div>

    <!--    <div class="section">-->
    <!--        <div class="section-header">-->
    <!--            <p class="section-subtitle">Breakdown</p>-->
    <!--            <h2 class="section-title">How would the co-benefit results vary if we take different pathways?</h2>-->
    <!--            <p class="description">We break down the modeled co-benefit values in different pathways towards achieving Net Zero. All Results are compared with the average value across all local authorities in UK.</p>-->
    <!--        </div>-->

    <!--        <div class="row">-->
    <!--            <div class="component">-->
    <!--                <h3 class="component-title">Five Pathways and their 11 Co-benefits</h3>-->
    <!--                <p class="description">Scroll for zooming in and out.</p>-->
    <!--                <div class="plot" bind:this={heatmapPlot}></div>-->
    <!--            </div>-->

    <!--            {#each SCENARIOS as scenario}-->
    <!--                <div class="component">-->
    <!--                    <h3 class="component-title"> Pathway: {scenario}</h3>-->
    <!--                    <p class="description">Please refer to CCC website on definitions of {scenario}.</p>-->
    <!--                    <div class="plot" bind:this={scenarioXcoBenefPLots[scenario]}>-->
    <!--&lt;!&ndash;                        <div class="badge-container">&ndash;&gt;-->
    <!--&lt;!&ndash;                            <img class="badge" src={roundingBadge} />&ndash;&gt;-->
    <!--&lt;!&ndash;                            <img class="badge" src={aggregationBadge} />&ndash;&gt;-->
    <!--&lt;!&ndash;                        </div>&ndash;&gt;-->
    <!--                    </div>-->
    <!--                </div>  -->
    <!--            {/each}-->
    <!--        </div>-->
    <!--    </div>-->

    <div class="section">
        <div class="section-header">
            <p class="section-subtitle">Temporal Trends</p>
            <h2 class="section-title">How co-benefits change over time?</h2>
            <p class="description">Detailed breakdown of temporal trends for total co-benefits, types of co-benefits,
                and five pathways.</p>
        </div>

        <div class="component singlevis">
            <h3 class="component-title">Total Co-benefits Distribution from 2025-2050 (vs. <span class="nation-label">{compareTo}</span> Average)</h3>
            <div class="row">
                <div class="plot" bind:this={CBOverTimePLot}>
                    <!--                    <div class="badge-container">-->
                    <!--                            <img class="badge" src={predictionsBadge} />-->
                    <!--                        </div>-->
                </div>
            </div>
        </div>


        <div class="component singlevis">
            <h3 class="component-title">11 Types of Co-benefits Distribution Following Balance Pathway from
                2025-2050</h3>
            <div class="row">
                <div class="row">
                    <div class="plot" bind:this={CBOverTimePerCBPLot}>
                        <!--                        <div class="badge-container">-->
                        <!--                            <img class="badge" src={predictionsBadge} />-->
                        <!--                        </div>-->
                    </div>
                </div>
            </div>
        </div>

        <!--        <div class="component singlevis">-->
        <!--            <h3 class="component-title">Total Co-benefits Distribution Across Five Scenarios from 2025-2050</h3>-->
        <!--            <div class="row">-->
        <!--                <div class="plot" bind:this={CBOverTimePerScenarioPLot}>-->
        <!--&lt;!&ndash;                    <div class="badge-container">&ndash;&gt;-->
        <!--&lt;!&ndash;                        <img class="badge" src={TruncAxisBadge} />&ndash;&gt;-->
        <!--&lt;!&ndash;                    </div>&ndash;&gt;-->
        <!--                </div>-->

        <!--            </div>-->
        <!--        </div>-->
    </div>

    <div class="section">
        <div class="section-header">
            <p class="section-subtitle">Households</p>
            <h2 class="section-title">Social Economic Factors of Households</h2>
            <p class="description">We describe the distribution of household economic factors aggregated on the data
                zone level and the different level of co-benefits recieved by those data zones.</p>

            <input type="checkbox" bind:checked={isSEFAggregated}/>
            <label for="checkbox">Aggregate Plots</label>
        </div>

        <div id="multiple-comp">
            {#each SEF as sef}
                <div>
                    <h2>{sef}</h2>
                    <!--                <div class="inside-row">-->
                    <div class="row">


                        {#if isSEFAggregated}
                            <div class="component">
                                <div class="plot" bind:this={SEFPlotLAD[sef]}>
                                </div>
                            </div>
                        {:else}
                            <div class="component">
                                <h3 class="component-title">Data Zones Distribution (vs. <span class="nation-label">{compareTo}</span> average)</h3>
                                <p class="description short">Histogram shows the number of data zones distributed across
                                    different household social economic factors.</p>
                                <div class="plot" bind:this={SEFPlotLAD[sef]}>
                                    <!--                                    <div class="badge-container">-->
                                    <!--                                        <img class="badge" src={normalizedBadge} />-->
                                    <!--                                        <img class="badge" src={modeledDataBadge} />-->
                                    <!--                                        <img class="badge" src={binningBadge} />-->
                                    <!--                                    </div>-->
                                </div>
                            </div>


                            <div class="component">
                                <div>
                                    <h3 class="component-title">Co-benefits Recieved by Data Zones across {sef}
                                        Values</h3>
                                    <p class="description short">Density plot refers to UK distribution while the
                                        scattered points refer to data zones in the local authority.</p>
                                    <div class="plot" bind:this={SEFPlotFullDistrib[sef]}>
                                    </div>
                                </div>

                                <div>
                                    <div class="plot" bind:this={SEFPlotPerCB[sef]}>
                                        <!--                                    <div class="badge-container">-->
                                        <!--                                        <img class="badge" src={overlapBadge} />-->
                                        <!--                                        <img class="badge" src={multipleDataSourceBadge} />-->
                                        <!--                                        <img class="badge" src={modeledDataBadge} />-->
                                        <!--                                    </div>-->
                                    </div>
                                </div>
                            </div>
                        {/if}

                    </div>
                </div>
            {/each}

        </div>

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

    label {
        font-weight: bold;
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

    .nation-label {
        /*color: #90bcca;*/
        color: var(--compareColor);
    }

</style>
