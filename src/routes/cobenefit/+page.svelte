<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount} from 'svelte';

    import {Map} from "$lib/components/map";
    import {MARGINS, SEF, SEF_CATEGORICAL, type SEFactor, TIMES} from "../../globals";

    import AirqualityIcon from '$lib/icons/AirQuality.jpg';

    let element: HTMLElement
    let plot: HTMLElement
    let SEFPlot: Record<SEFactor, HTMLElement> = {};
    let chartType: "barchart" | "violin" | "distribution" = "barchart"

    let height = 400;

    // Data from load function
    export let data;

    const fullData = data.data;
    const SEFData = data.SEFData;
    const coBenefit = data.coBenefit;
    const LAD = data.LAD;
    
    let map: Map;

    let mapDiv: HTMLElement;
    let mapLegendDiv: HTMLElement;

    let chartColor: string = "steelblue"; // Default color

    onMount(() => {
        map = new Map(fullData, "LSOA", mapDiv, "total");
        map.initMap();

        // let legendSvg = map.legend();
        // mapLegendDiv.append(legendSvg)
    })

function renderPlot() {
    
    let pivotedData = fullData.flatMap(d => {
        return TIMES.map(t => {
            return {time: t, value: d[t], total: d.total, scenario: d.scenario}
        })
    })
    
    if (chartType == "barchart") {
        plot?.append(
            Plot.plot({
                height: height / 1.4,
                ...MARGINS,
                style: {fontSize: "18px"},
                x: {type: "band"},
                marks: [
                    Plot.barY(pivotedData, Plot.groupX({y: "mean"}, {
                        x: "time",
                        y: "value",
                        fill: "#71C35D",
                        tip: true,
                        fillOpacity: 0.8,
                        ry1:5,
                        insetLeft: 15,
                        insetRight:15
                    })),
                ]
            })
        );
    } else if (chartType == "distribution") {
        plot?.append(
            Plot.plot({
                height: height / 1.4,
                marginLeft: 60,
                marginRight: 60,
                y: {label: "Datazones Frequency"},
                style: {fontSize: "18px"},
                marks: [
                    Plot.areaY(pivotedData, Plot.binX({y: "count"}, {
                        x: "total",
                        fill:"#71C35D",
                        tip: true,
                        fillOpacity: 0.5,
                        stroke: "#71C35D",
                        strokeWidth: 3
                    }))                    
                ]
                })
            );
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
                    height: height,
                    width: height,
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
                        Plot.dot(SEFData.filter(d => d["SEFMAME"] == sef), {
                            x: "SE",
                            y: "total",
                            stroke: "#71C35D",
                            r:1,
                            strokeOpacity: 0.2
                        })]
                })
            } else {
                plot = Plot.plot({
                    height: height,
                    width: height,
                    marginLeft: 80,
                    marginBottom: 60,
                    marginRight: 30,
                    marginTop: 60,
                    y: {grid: true, label: "mean value (£)"},
                    x: {grid: true, label: sef},
                    style: {fontSize: "18px"},
                    color: {legend: true},
                    marks: [
                        Plot.dot(SEFData.filter(d => d["SEFMAME"] == sef), {
                            x: "SE",
                            y: "total",
                            stroke: "#71C35D",
                            r:1,
                            strokeOpacity: 0.2
                        })]
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

    <div class="section header">
        <p class="page-subtitle">Co-Benefit Report</p>
        <h1 class="page-title"> 
            <img src={AirqualityIcon} alt="Icon" class="heading-icon">
            {coBenefit} 
        </h1>
        <p class="description"> Total cost benefit regarding {coBenefit}: [TOTAL] </p>
    </div>

<!--    <div id="vis-block">-->
    <div class="section">


    <div id="vis-block">
        <div class="component singlevis" >
            <h3 class="component-title">{coBenefit} Total Cost Benefit Over Time</h3>

            <input type="radio" on:change={onChange} name="visType" value="barchart" checked>
            <label for="html">Barchart</label><br>
            <input type="radio" on:change={onChange} name="visType" value="distribution">
            <label for="javascript">Distribution</label>

            <div class="component row">
                <div class="plot" bind:this={plot}>
                </div>
            </div>
        </div>

        <div class="component column">
            <h3 class="component-title">{coBenefit} on UK Map</h3>
            <p class="description">Scroll for zooming in and out.</p>
            <div id="map" bind:this={mapDiv}>
            </div>
        </div>
    </div>
        </div>


    <div id="multiple-comp" class="component">
        <h3 class="component-title"> {coBenefit} Cost Benefit by Socio Economic Factors </h3>
        <div id="multiple-plots">
            {#each SEF as sef}
                <div class="plot" bind:this={SEFPlot[sef]}>
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
</style>