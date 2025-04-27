<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount, onDestroy} from 'svelte';

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
		COBENEFS_SCALE2,
        SEF_UNITS,
        SEF_SCALE

    } from "../../globals";
    import {
        getAverageCBGroupedByLAD,
        getSefForOneCoBenefit, getSefForOneCoBenefitAveragedByLAD,
        getTableData,
        getTotalPerOneCoBenefit,
        getAggregationPerBenefit,
        getAggregationPerCapitaPerBenefit,
        initDB,
        getTotalAggregation
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
    const coBenefitLabel = COBENEFS.find(d => d.id === coBenefit)?.label ?? coBenefit;
    let fullData;
    let LADAveragedData;
    let SEFData;
    let totalValue;
    let aggregationPerBenefit;
    let aggregationPerCapitaPerBenefit;
    let totalBenefits;
    let totalBenefitsValue;
    let dataLoaded = false;
    let coBenefit_percapita;

    let map: Map;

    let mapDiv: HTMLElement;
    let mapLegendDiv: HTMLElement;

    loadData().then(() => {
        map = new Map(LADAveragedData, "LAD", mapDiv, "total", false, "LAD", false);
        map.initMap();

        let legendSvg = map.legend();
        mapLegendDiv.append(legendSvg)
    });



    let icon = getIconFromCobenef(coBenefit)

    let scrolledPastHeader = false;

    function handleScroll() {
        const scrollY = window.scrollY;
        scrolledPastHeader = scrollY > 250;
    }

    onMount(() => {
        // map = new Map(LADAveragedData, "LAD", mapDiv, "total");
        // map.initMap();
        //
        // let legendSvg = map.legend();
        // mapLegendDiv.append(legendSvg)
        window.addEventListener('scroll', handleScroll); // header scroll listener
    })

    onDestroy(() => {
        window.removeEventListener('scroll', handleScroll); // remove listener
    })


    async function loadData() {
        fullData = await getTableData(getTotalPerOneCoBenefit(coBenefit))

        SEFData = await getTableData(getSefForOneCoBenefit(coBenefit))
        aggregationPerBenefit = await getTableData(getAggregationPerBenefit());
        aggregationPerBenefit = aggregationPerBenefit.sort((a, b) => b.total - a.total);

        aggregationPerCapitaPerBenefit = await getTableData(getAggregationPerCapitaPerBenefit());
        aggregationPerCapitaPerBenefit = aggregationPerCapitaPerBenefit.sort((a, b) => b.total_value - a.total_value);
        const matched = aggregationPerCapitaPerBenefit.find(d => d.co_benefit_type === coBenefit);
        coBenefit_percapita = matched ? matched.value_per_capita : null;

        console.log("coben waffle data",aggregationPerCapitaPerBenefit);
        console.log("coben type", coBenefit);


        LADAveragedData = await getTableData(getSefForOneCoBenefitAveragedByLAD(coBenefit))
        totalBenefits = await getTableData(getTotalAggregation())
        totalBenefitsValue = totalBenefits[0].total_value

        console.log(22, LADAveragedData);
        SEF.forEach(SE => {
            SEFData[SE] = +SEFData[SE];
        })

        totalValue = (d3.sum(fullData, d => d.total / 1000)).toFixed(3);


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
            domain: COBENEFS.map(d => d.id),
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
                    Plot.areaY(LADAveragedData, Plot.binX({y: "count"}, {
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
                marginLeft: 90,
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
                    style: {fontSize: "14px", textAnchor: "middle", fill: '#333'},
                    height: height / 1.2,
                    width: height/1.1 ,
                    marginLeft: 60,
                    marginBottom: 60,
                    marginRight: 10,
                    marginTop: 20,
                    // Very weird it's needed!
                    //x: {label: SEF_SCALE(sef)},
                    //x: {grid: true, label: null, type: "band", tickFormat: d => Math.floor(d)},
                    y: {label: '£/capita',  labelArrow:'none'},
                    color: {legend: true},
                    marks: [
                        Plot.dot(LADAveragedData.filter(d => d["SEFMAME"] == sef), 
                        Plot.dodgeX("middle",{
                            fx: "SE",
                            y: "total",
                            r: 1,
                            padding: -2,
                            fill: d => d.LAD.startsWith("S") ? COBENEFS_SCALE2(coBenefit)[1]
                                : d.LAD.startsWith("N") ? COBENEFS_SCALE2(coBenefit)[2]
                                : d.LAD.startsWith("E") ? COBENEFS_SCALE2(coBenefit)[3]
                                : COBENEFS_SCALE2(coBenefit)[4],})),
                        
                        Plot.boxY(LADAveragedData.filter(d => d["SEFMAME"] == sef), {
                            fx: "SE",
                            y: "total",
                            stroke: COBENEFS_SCALE2(coBenefit)[0],
                            fill: COBENEFS_SCALE2(coBenefit)[4],
                            r: 0,
                            //strokeOpacity: 0.5,
                            fillOpacity:0.3
                        }),
                        //Plot.axisY({anchor: "left", grid: true, label: '£/capita',  labelArrow:'none', labelAnchor: "center"}),
                        Plot.ruleY([0], {stroke: "#333", strokeWidth: 0.75})
                    ]
                })
            } else {
                plot = Plot.plot({
                    //title: sef,
                    style: {fontSize: "14px", textAnchor: "middle", fill: '#333'},
                    height: height / 1.4,
                    width: height / 1.4,
                    marginLeft: 60,
                    marginBottom: 40,
                    marginRight: 40,
                    marginTop: 20,
                    // y: {grid: true, label: "Average Cost Benefit (£)"},
                    // x: {grid: true, label: sef},
                    x: {label: SEF_SCALE(sef)},
                    y: {label: '£/capita'},
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
                        //Plot.axisX({label: sef,  labelArrow:'none', labelAnchor: "center"}),
                        Plot.ruleY([0], {stroke: "#333", strokeWidth: 0.75}),
                        Plot.ruleX([0], {stroke: "#333", strokeWidth: 0.75})
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
    // $: cobensNavStyle = `color: ${textColor}; font-weight: bold; font-size: 14px;`;



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
                {coBenefitLabel}
              </h1>
            </div>

          </div>
          <div class="header-waffle-wrapper">
            <div class="waffle-label">
              <!-- National gain of <br />
              <strong style="font-size: 1.2rem">{coBenefitLabel}</strong> <br />
              in reaching NetZero <br />
              by 2050 is: <br />
              {#if totalValue}
              <strong style="font-size: 1.1rem">£{totalValue.toLocaleString()} billion</strong>
              {/if} -->
              <div class="waffle-stats">
              <div class="waffle-stat">
                <div class="waffle-value">
                    {#if totalValue}
                  <span class="waffle-big">£{totalValue.toLocaleString()}</span>
                  {/if}
                  <span class="small">billion</span>
                </div>
                {#if totalValue > 0}
                  <div class="waffle-caption">National benefits</div>
                {:else}
                  <div class="waffle-caption">National costs</div>
                {/if}
              </div>
              <div class="waffle-stat">
                <div class="waffle-value">
                    {#if totalValue}
                  <span class="waffle-big">£{coBenefit_percapita.toLocaleString()}</span>
                  {/if}
                  <span class="small">thousand</span>
                </div>
                {#if totalValue > 0}
                  <div class="waffle-caption">Per capita benefits</div>
                {:else}
                  <div class="waffle-caption">Per capita costs</div>
                {/if}
              </div>
              <div class="waffle-stat">
                {#if totalValue}
                <div class="waffle-value">
                  <span class="waffle-big">{((totalValue / totalBenefitsValue) * 100).toFixed(2)}</span>
                  <span class="small">%</span>
                </div>
                {/if}
                  <div class="waffle-caption">Contribution</div>
              </div>
            </div>
            </div>

            <div class="waffle-el" bind:this={waffleEl}></div>
            <div class="waffle-bg" bind:this={waffleBgEl}></div>
          </div>
        </div>
      </div>
    
    {#if scrolledPastHeader}
      <div class="mini-header">
        <div class="mini-header-content">
          <img src={icon} alt="Icon" class="mini-heading-icon" />
          <span class="mini-header-text">{coBenefitLabel}</span>
          {#if totalValue}
            <span class="mini-header-value">UK total: £{totalValue.toLocaleString()} billion</span>
          {/if}
        </div>
      </div>
    {/if}
      

    <!--    <div id="vis-block">-->
    <div class="section">
        <div id="vis-block">
            <div class="component singlevis">
                <h3 class="component-title">Total <span style={cobensStyle}>{coBenefitLabel.toLowerCase()}</span> (£k) to 2050
                </h3>
                {#if totalValue>0}
                    <p class="description">The benefit per capita for each 5 year interval towards 2050. </p>
                {:else}
                    <p class="description">The cost per capita for each 5 year interval towards 2050. </p>
                {/if}
                <!--  <div class="component row">-->
                    <div class="plot" bind:this={plot}>
                    </div>
                <!--  </div>-->
                <br>
                <h3 class="component-title"> Distribution of <span style={cobensStyle}>{coBenefitLabel.toLowerCase()}</span> across UK data zones.</h3>
                {#if totalValue>0}
                    <p class="description"> The total benefit per capita for each data zone. </p>
                {:else}
                    <p class="description"> The total cost per capita for each data zone. </p>
                {/if}
                <!-- <p class="description"> The total cost benefit per capita for each LSOA. </p> -->
                <!--<div class="component row">-->
                    <div class="plot" bind:this={plotDist}>
                    <!--</div>-->
                </div>
                <br>
            </div>


            <div class="component column">
                <h3 class="component-title"><span style={cobensStyle}>{coBenefitLabel}</span> on a map of the UK</h3>
                <p class="description">Scroll for zooming in and out.</p>
                <div id="map" bind:this={mapDiv}>
                </div>
            </div>
        </div>

        <div id="se-block" class="component" style="margin-left: 1rem;">
            <div id="se-title">
                <h3 class="component-title">Mapping the impact of <span style={cobensStyle}>{coBenefitLabel?.toLowerCase()}</span> across UK local authorities according to socio-economic factors</h3>
                <br>
                <!-- Disclaimer -->
                <div id="se-disclaimer" class="disclaimer-box">
                    <p style="margin: 0 0 1rem 0;"><strong>Correlation ≠ Causation:</strong> The scatter plots represents modeled associations and should not be interpreted as direct causal relationships. </p>
                    <p style="margin: 0 0 1rem 0;"><strong>Discrete scales:</strong> The first set of socio-economic factors are using categorical values where x-axis is non-liner:  EPC, Tenure, Typology, Fuel type, Gas flag, Number of cars.</p>

                </div>

                <!-- Legend -->
                <div id="se-legend" class="legend-box">
                    <strong style="margin-bottom: 1rem;">Legend:</strong> <br/>
                    <span>The scatter plots are shaded by nation.</span>

                    <ul class="legend-list">
                        <li><span class="legend-color" style="background-color: {COBENEFS_SCALE2(coBenefit)[1]}"></span>
                            Scotland</li>
                        <li><span class="legend-color" style="background-color: {COBENEFS_SCALE2(coBenefit)[2]}"></span>
                            Northern Ireland</li>
                        <li><span class="legend-color" style="background-color: {COBENEFS_SCALE2(coBenefit)[3]}"></span>England</li>
                        <li><span class="legend-color" style="background-color: {COBENEFS_SCALE2(coBenefit)[4]}"></span>Wales</li>
                    </ul>
                    
                </div>
            </div>

        

            <div id="multiple-comp">

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
</div>

<style>
    #vis-block {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1%;
        width: 100%;
    }

    #se-block {
        display: flex;
        /* width: 100%; */
        flex-direction: row;
        min-height: 100vh;
    }

    #se-title {
        min-width: 25vw;
        margin-left: 1rem;
        margin-right: 2rem;
        position: sticky;
        top: 120px;
        align-self: flex-start;
        height: fit-content;
    }


    #map {
        width: 100%;

        /*TODO: height is given by this currently but better to change at some point*/
        height: 800px;
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
    width: 150px;

    /* background-color: #fff; */
    /* border: 1px solid #ddd; */
    border-radius: 0.5rem;
    padding: 1rem;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #333;
    text-align: left;
    /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); */
    }

.disclaimer-box {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: #f9f9f9;
    border-left: 4px solid #ccc;
    font-size: 0.9rem;
    color: #555;
}

.legend-box {
    margin-bottom: 2rem;
    padding: 0.75rem;
    background-color: #f0f0f0;
    border-radius: 8px;
    font-size: 0.9rem;
}

.legend-list {
    list-style: none;
    padding-left: 0;
    margin: 0;
}

.legend-list li {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
}

.legend-color {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 6px;
    border-radius: 2px;
}

.mini-header {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #ddd;
  z-index: 1000;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px; /* mini header height */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mini-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-heading-icon {
  width: 24px;
  height: 24px;
}

.mini-header-text {
  font-weight: 600;
  font-size: 1rem;
}

.mini-header-value {
  font-weight: 500;
  font-size: 0.9rem;
  margin-left: auto;
  color: #555;
}

.waffle-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.waffle-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.waffle-value {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.waffle-big {
  font-size: 1.5rem;
  font-weight: medium;
}

.small {
  font-size: 0.9rem;
  color: black;
}

.waffle-caption {
  margin-top: 0.2rem;
  font-size: 0.85rem;
  color: black;
}

</style>