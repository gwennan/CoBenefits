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
        COBENEFS,
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
        getAggregationPerBenefit,
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
    let aggregationPerBenefit;
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
        aggregationPerBenefit = await getTableData(getAggregationPerBenefit());
        aggregationPerBenefit = aggregationPerBenefit.sort((a, b) => b.total - a.total);

        console.log("coben waffle data",aggregationPerBenefit);
        console.log("coben type", coBenefit);


        LADAveragedData = await getTableData(getSefForOneCoBenefitAveragedByLAD(coBenefit))

        console.log(22, LADAveragedData);
        SEF.forEach(SE => {
            SEFData[SE] = +SEFData[SE];
        })

        totalValue = Math.round(d3.sum(fullData, d => d.total));

        dataLoaded = true;
    }

    let waffleData = [];
    let waffleEl: HTMLElement;
    let waffleBgEl: HTMLElement;

    function renderWaffle(height: number, highlightType?: string) {
        if (!waffleEl) return;

        const unitSize = 20;
        const gridWidth = 15;
        const gridHeight = Math.floor(height / unitSize);
        const gridSize = gridWidth * gridHeight;

        const total = aggregationPerBenefit.reduce((sum, d) => sum + d.total, 0);
        const squares = [];

        for (const item of aggregationPerBenefit) {
        const absCount = Math.round((Math.abs(item.total) / total) * gridSize);
        const isNegative = item.total < 0;
        for (let i = 0; i < absCount; i++) {
            squares.push({
            type: item.co_benefit_type,
            negative: isNegative
            });
        }
        }

        while (squares.length < gridSize) {
        squares.push({ type: "empty" });
        }

        squares.sort((a, b) => {
        if (a.type === "empty") return 1;
        if (b.type === "empty") return -1;
        if (a.negative && !b.negative) return 1;
        if (!a.negative && b.negative) return -1;
        return 0;
        });

        const waffleData = squares.map((d, i) => ({
        x: i % gridWidth,
        y: Math.floor(i / gridWidth),
        ...d
        }));

        const plot = Plot.plot({
        width: unitSize * gridWidth,
        height: unitSize * gridHeight,
        margin: 0,
        x: { axis: null },
        y: { axis: null },
        color: {
            type: "ordinal",
            domain: COBENEFS,
            range: COBENEFS_RANGE,
            unknown: "#eee",
            legend: false
        },
        marks: [
            Plot.rect(waffleData.filter(d => !d.negative), {
            x: d => d.x * unitSize,
            y: d => d.y * unitSize,
            fill: "type",
            fillOpacity: d => (highlightType && d.type !== highlightType ? 0.15 : 1)
            }),
            Plot.rect(waffleData.filter(d => d.negative), {
            x: d => d.x * unitSize,
            y: d => d.y * unitSize,
            stroke: "type",
            strokeOpacity: d => (highlightType && d.type !== highlightType ? 0.15 : 1),
            strokeWidth: 1,
            fill: "none"
            })
        ]
        });

        if (waffleBgEl) {
        waffleBgEl.style.width = `${unitSize * gridWidth}px`;
        waffleBgEl.style.height = `${height}px`;
        };

        waffleEl.innerHTML = "";
        waffleEl.append(plot);
    }



    function renderDistPlot() {
        plotDist?.append(
            Plot.plot({
                height: height / 1.2,
                ...MARGINS,
                marginLeft: 80,
                marginTop: 40,
                marginRight: 40,
                y: {label: "Datazones Frequency"},
                x: {label: '£/capita',  labelArrow:'none', labelAnchor: "center"},
                style: {fontSize: "18px"},
                marks: [
                    Plot.areaY(fullData, Plot.binX({y: "count"}, {
                        x: "total",
                        fill: COBENEFS_SCALE2(coBenefit)[0],
                        tip: true,
                        fillOpacity: 0.5,
                        stroke: COBENEFS_SCALE2(coBenefit)[0],
                        strokeWidth: 3
                    })),
                    Plot.axisY({anchor: "left", label: 'Datazone frequency',  labelArrow:'none', labelAnchor: "center"}),
                    Plot.ruleX([0])
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
                marginLeft: 80,
                marginRight: 40,
                marginBottom: 60,
                marginTop: 40,
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
                    })),
                    Plot.axisY({anchor: "left", grid: true, label: '£/capita',  labelArrow:'none', labelAnchor: "center"}),
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
                    marginRight: 20,
                    marginTop: 10,
                    // y: {grid: true, label: "Average Cost Benefit (£)"},
                    // x: {grid: true, label: sef},
                    x: {grid: true, label: null},
                    y: {grid: true},
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
            renderWaffle(300, coBenefit);
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
        <div class="header-content">
          <div class="header-text">
            <p class="page-subtitle">Co-Benefit Report</p>
            <div class="title-container">
              <h1 class="page-title">
                <img src={icon} alt="Icon" class="heading-icon" />
                {coBenefit}
              </h1>
              <!-- {#if totalValue}
                <p class="description">Total Cost Benefit: £{totalValue.toLocaleString()} million</p>
              {/if} -->
            </div>

          </div>
          <div class="header-waffle-wrapper">
            <div class="waffle-label">
              National gain of <br />
              <strong style="font-size: 1.2rem">{coBenefit}</strong> <br />
              in reaching NetZero <br />
              by 2050 is: <br />
              {#if totalValue}
              <strong style="font-size: 1.1rem">£{totalValue.toLocaleString()} million</strong>
              {/if}
            </div>
            

            <div class="waffle-el" bind:this={waffleEl}></div>
            <div class="waffle-bg" bind:this={waffleBgEl}></div>
          </div>
        </div>
      </div>
      

    <!--    <div id="vis-block">-->
    <div class="section">


        <div id="vis-block">
            <div class="component singlevis">
                <h3 class="component-title"><span style={cobensStyle}>{coBenefit}</span> Total Cost Benefit Over Time
                </h3>
                <p class="description"> The total? cost benefit per capita for each 5 year interval. </p>
                <!--  <div class="component row">-->
                    <div class="plot" bind:this={plot}>
                    </div>
                <!--  </div>-->
                <br>
                <h3 class="component-title"> Distribution of <span style={cobensStyle}>{coBenefit}</span> Total Cost
                    Benefit by LSOA </h3>
                <p class="description"> The total cost benefit per capita for each LSOA. </p>
                <!--<div class="component row">-->
                    <div class="plot" bind:this={plotDist}>
                    <!--</div>-->
                </div>
                <br>
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

    /* .heading-icon {
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
    } */

    .heading-icon {
    width: 5rem;
    height: 5rem;
    }


    .section.header {
    padding: 2rem;
    background-color: #f9f9f9;
    }

    .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    }

    .header-text {
    max-width: 60%;
    }

    .page-subtitle {
    font-size: 1.1rem;
    color: #777;
    margin-bottom: 0.5rem;
    }

    .page-title {
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    }

  
    .total-value {
    font-weight: bold;
    margin-top: 0.5rem;
    }

    .description {
    margin-top: 1rem;
    font-size: 1rem;
    color: #333;
    }

    .header-waffle {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    min-width: 320px;
    }

    .header-waffle-wrapper {
    position: relative;
    min-width: 320px;
    height: 320px;
    }

    .waffle-bg {
    position: absolute;
    top: 0;
    left: 0;
    background: white;
    z-index: -1;
}


    .waffle-label {
        position: absolute;
        top: 50%;
        right: 105%;
        transform: translateY(-50%);
        width: 170px;

        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
        padding: 1rem;
        font-size: 0.9rem;
        line-height: 1.4;
        color: #333;
        text-align: left;
        /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); */
        }

</style>