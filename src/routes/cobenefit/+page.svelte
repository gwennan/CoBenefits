<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import {Map} from "$lib/components/map";
    import {
        MARGINS,
        SEF,
        SEF_CATEGORICAL,
        type SEFactor,
        TIMES,
        COBENEFS_RANGE,
        getIconFromCobenef,
        COBENEFS_SCALE,
        type CoBenefit,

		COBENEFS_SCALE2

    } from "../../globals";
    import {
        getAverageCBGroupedByLAD,
        getSefForOneCoBenefit, getSefForOneCoBenefitAveragedByLAD,
        getTableData,
        getTotalPerOneCoBenefit,
        initDB
    } from "$lib/duckdb";

    import NavigationBar from "$lib/components/NavigationBar.svelte";

    let element: HTMLElement
    let plotDist: HTMLElement
    let plot: HTMLElement
    let SEFPlot: Record<SEFactor, HTMLElement> = {};
    let chartType: "barchart" | "violin" | "distribution" = "barchart"

    let height = 400;

    // Data from load function
    export let data;

    const coBenefit = data.coBenefit;
    let fullData;
    let LADAveragedData;
    let SEFData;
    let totalValue;
    let dataLoaded = false;

    let map: Map;

    let mapDiv: HTMLElement;
    let mapLegendDiv: HTMLElement;

    loadData().then(() => {
        map = new Map(LADAveragedData, "LAD", mapDiv, "total", false, "LAD");
        map.initMap();

        let legendSvg = map.legend();
        mapLegendDiv.append(legendSvg)
    });



    let icon = getIconFromCobenef(coBenefit)


    onMount(() => {
        // map = new Map(LADAveragedData, "LAD", mapDiv, "total");
        // map.initMap();
        //
        // let legendSvg = map.legend();
        // mapLegendDiv.append(legendSvg)
    })


    async function loadData() {
        fullData = await getTableData(getTotalPerOneCoBenefit(coBenefit))

        SEFData = await getTableData(getSefForOneCoBenefit(coBenefit))

        LADAveragedData = await getTableData(getSefForOneCoBenefitAveragedByLAD(coBenefit))

        console.log(22, LADAveragedData);
        SEF.forEach(SE => {
            SEFData[SE] = +SEFData[SE];
        })

        totalValue = Math.round(d3.sum(fullData, d => d.total));

        dataLoaded = true;
    }

    function renderDistPlot() {
        plotDist?.append(
            Plot.plot({
                height: height / 1.2,
                ...MARGINS,
                marginLeft: 60,
                marginRight: 60,
                y: {label: "Datazones Frequency"},
                x: {label: "Cost Per Capita (£)"},
                style: {fontSize: "18px"},
                marks: [
                    Plot.areaY(fullData, Plot.binX({y: "count"}, {
                        x: "total",
                        fill: COBENEFS_SCALE2(coBenefit)[0],
                        tip: true,
                        fillOpacity: 0.5,
                        stroke: COBENEFS_SCALE2(coBenefit)[0],
                        strokeWidth: 3
                    }))
                ]
            })
        );
    }

    function renderPlot() {

        let pivotedData = fullData.flatMap(d => {
            return TIMES.map(t => {
                return {time: t, value: d[t], total: d.total, scenario: d.scenario}
            });
        });

        plot?.append(
            Plot.plot({
                height: height / 1.2,
                ...MARGINS,
                
                style: {fontSize: "18px"},
                x: {
                    type: "band",
                    tickFormat: d => d.replace(/^Y/, '').replace('_', '-'),
                    label: "Year Intervals"
                },
                y: {
                    label: "Cost Benefit £/Capita",
                    grid: true
                },
                marks: [
                    Plot.barY(pivotedData, Plot.groupX({y: "sum"}, {
                        x: "time",
                        y: "value",
                        fill: COBENEFS_SCALE2(coBenefit)[0],
                        tip: true,
                        fillOpacity: 0.8,
                        //ry1: 5,
                        insetLeft: 15,
                        insetRight: 15
                    }))
                ]
            })
        );
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
                    //title: sef,
                    style: {fontSize: "16px", textAnchor: "middle", fill: '#333'},
                    height: height / 1.4,
                    width: height / 1.5,
                    marginLeft: 60,
                    marginBottom: 60,
                    marginRight: 10,
                    marginTop: 10,
                    // y: {grid: true, label: "Average Cost Benefit (£)"},
                    // Very weird it's needed!
                    //x: {grid: true, label: sef, type: "band", tickFormat: d => Math.floor(d)},
                    x: {grid: true, label: null, type: "band", tickFormat: d => Math.floor(d)},
                    //y: {label: '£/capita', labelOffset:0, labelArrow:'none'},
                    color: {legend: true},
                    marks: [
                        Plot.boxY(SEFData.filter(d => d["SEFMAME"] == sef), {
                            x: "SE",
                            y: "total",
                            stroke: COBENEFS_SCALE2(coBenefit)[0],
                            fill: COBENEFS_SCALE2(coBenefit)[4],
                            r: 1,
                            strokeOpacity: 0.5,
                            fillOpacity:0.3
                        }),
                        Plot.axisY({anchor: "left", grid: true, label: '£/capita',  labelArrow:'none', labelAnchor: "center"}),
                        Plot.ruleY([0])
                    ]
                })
            } else {
                plot = Plot.plot({
                    //title: sef,
                    style: {fontSize: "16px", textAnchor: "middle", fill: '#333'},
                    height: height / 1.4,
                    width: height / 1.5,
                    marginLeft: 60,
                    marginBottom: 60,
                    marginRight: 10,
                    marginTop: 10,
                    // y: {grid: true, label: "Average Cost Benefit (£)"},
                    // x: {grid: true, label: sef},
                    x: {grid: true, label: null},
                    //y: {grid: true, label: '£/capita', labelOffset:0, labelArrow:'none', labelAnchor: "top"},
                    color: {legend: true},
                    marks: [
                        Plot.dot(LADAveragedData.filter(d => d["SEFMAME"] == sef), {
                            x: "SE",
                            y: "total",
                            //stroke: COBENEFS_SCALE(coBenefit),
                            fill: d => d.LAD.startsWith("S") ? COBENEFS_SCALE2(coBenefit)[1]
                                : d.LAD.startsWith("N") ? COBENEFS_SCALE2(coBenefit)[2]
                                : d.LAD.startsWith("E") ? COBENEFS_SCALE2(coBenefit)[3]
                                : COBENEFS_SCALE2(coBenefit)[4],
                            r: 2,
                            fillOpacity: 1
                        }),
                        Plot.axisY({anchor: "left", grid: true, label: '£/capita',  labelArrow:'none', labelAnchor: "center"}),
                        Plot.ruleY([0])
                        //Plot.linearRegressionY(SEFData.filter(d => d["SEFMAME"] == sef), {
                          //  x: "SE",
                          //  y: "total",
                          //  stroke: '#F0F0F0',
                          //  strokeWidth: 4,
                          //  strokeOpacity: 0.75,
                          //  strokeDasharray: "5,5",
                        // clip: true
                        //}),
                        //Plot.linearRegressionY(SEFData.filter(d => d["SEFMAME"] == sef), {
                          //  x: "SE",
                          //  y: "total",
                          //  stroke: '#222',
                          //  strokeWidth: 2,
                          //  strokeOpacity: 0.75,
                          //  strokeDasharray: "5,5",
                          //  clip: true
                        //})
                        ]
                })
            }

            SEFPlot[sef]?.append(plot)
        })
    }


    $: {
        plot?.firstChild?.remove(); // remove old chart, if any
        Object.values(SEFPlot).forEach(sefPlot => {
            sefPlot.firstChild?.remove();
        })

        //ugly hack for reactivity
        if (chartType) {
        }


        // loadData()

        if (height && dataLoaded) {

            renderDistPlot();
            renderPlot();
            renderSEFPlot();
        }
    }

    $: textColor = COBENEFS_SCALE2(coBenefit)[0];
    $: cobensStyle = `color: ${textColor}; font-weight: bold; font-size: 22px;`;


    function onChange(event) {
        chartType = event.currentTarget.value;
    }


</script>

<NavigationBar></NavigationBar>

<div class="page-container" bind:this={element}>

    <div class="section header">
        <p class="page-subtitle">Co-Benefit Report</p>
        <div class="header-container">
            <div class="title-container">
                <h1 class="page-title">
                    <img src={icon} alt="Icon" class="heading-icon">
                    {coBenefit}
                </h1>

            </div>
            <div class="total-value-container">
                {#if totalValue}
                <p class="total-value">Total Cost Benefit: £{totalValue.toLocaleString()} million</p>
                {/if}
            </div>
        </div>
        <p class="description"> Total cost benefit regarding <span style={cobensStyle}> {coBenefit}:  </span></p>

    </div>

    <!--    <div id="vis-block">-->
    <div class="section">


        <div id="vis-block">
            <div class="component singlevis">
                <h3 class="component-title"><span style={cobensStyle}>{coBenefit}</span> Total Cost Benefit Over Time
                </h3>
                <p class="description"> The total? cost benefit per capita for each 5 year interval. </p>
                <div class="component row">
                    <div class="plot" bind:this={plot}>
                    </div>
                </div>

                <h3 class="component-title"> Distribution of <span style={cobensStyle}>{coBenefit}</span> Total Cost
                    Benefit by LSOA </h3>
                <p class="description"> The total cost benefit per capita for each LSOA. </p>
                <div class="component row">
                    <div class="plot" bind:this={plotDist}>
                    </div>
                </div>
            </div>


            <div class="component column">
                <h3 class="component-title"><span style={cobensStyle}>{coBenefit}</span> on UK Map</h3>
                <p class="description">Scroll for zooming in and out.</p>
                <div id="map" bind:this={mapDiv}>
                </div>
            </div>
        </div>


        <div id="multiple-comp" class="component">

            <h3 class="component-title"><span style={cobensStyle}>{coBenefit}</span> Cost Benefit by Socio-Economic
                Factors </h3>
            <br>

            <div id="multiple-plots">
                {#each SEF as sef}
                    <div class="plot-container">
                        <h3 class="component-title" style="text-align: center;"> {sef.replaceAll('_', ' ')} </h3>
                        <div class="plot" bind:this={SEFPlot[sef]}></div>
                    </div>
                {/each}
            </div>
        </div>

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

    #multiple-plots {
        display: flex;
        gap: 1%;
        flex-direction: row;
        flex-flow: wrap;
        align-items: center;
        align-content: space-between;
        justify-content: center;
    }

    .heading-icon {
        width: 80px;
        height: 80px;
        margin-right: 15px;
        margin-top: 8px;
        margin-bottom: 8px;
        vertical-align: middle;
        object-fit: cover;
    }

    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .title-container {
        display: flex;
        align-items: top;
        font-size: 36px;
    }

    .total-value-container {
        text-align: right;
    }

    .total-value {
        font-size: 36px;
        font-weight: bold;
        color: #555;
        margin-right: 30px;
    }
</style>