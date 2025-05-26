<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount, onDestroy} from 'svelte';
    import { writable } from 'svelte/store';

    import {MapUK} from "$lib/components/mapUK";
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
        COBENEFS_SCALE3,
        SEF_UNITS,
        SEF_SCALE,
        DEFINITIONS,
        SE_FACTORS,
        SEF_LEVEL_LABELS

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
    const coBenefitDef = DEFINITIONS.find(d => d.id === coBenefit)?.def ?? coBenefit;
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

    let map: MapUK;

    let mapDiv: HTMLElement;
    let mapLegendDiv: HTMLElement;

    loadData().then(() => {
        let colorRange = JSON.parse(JSON.stringify(COBENEFS_SCALE2(coBenefit)))
        colorRange.shift()
        colorRange = colorRange.reverse()

        // TODO: show sum and not avergade
        map = new MapUK(LADAveragedData, "LAD", mapDiv, "total", false, "LAD", false, colorRange);
        map.initMap();



        let legendSvg = map.legend();
        mapLegendDiv.append(legendSvg)
    });



    let icon = getIconFromCobenef(coBenefit)

    let scrolledPastHeader = false;
    let currentSection = '';
    const sectionIds = ['overview', 'compare'];

    function handleScroll() {
        const scrollY = window.scrollY;
        scrolledPastHeader = scrollY > 250;

        for (const id of sectionIds) {
            const el = document.getElementById(id);
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            const isInView = rect.top <= 150 && rect.bottom >= 150;

            if (isInView) {
                currentSection = id;
                // console.log("currentSection", currentSection);
                break;
            }
            }
    }

    function formatLabel(id: string): string {
        const labels: Record<string, string> = {
            overview: 'Overview',
            compare: 'Compare by socio-economic factor',
        };
        return labels[id] || '';
    }


    onMount(() => {
        // map = new MapUK(LADAveragedData, "LAD", mapDiv, "total");
        // map.initMap();
        //
        // let legendSvg = map.legend();
        // mapLegendDiv.append(legendSvg)
        window.addEventListener('scroll', handleScroll); // header scroll listener

        handleScroll(); // initialize
        return () => window.removeEventListener('scroll', handleScroll);
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

        // console.log("coben waffle data",aggregationPerCapitaPerBenefit);
        // console.log("coben type", coBenefit);

        LADAveragedData = await getTableData(getSefForOneCoBenefitAveragedByLAD(coBenefit))
        totalBenefits = await getTableData(getTotalAggregation())
        totalBenefitsValue = totalBenefits[0].total_value

        SEF.forEach(SE => {
            SEFData[SE] = +SEFData[SE];
        })

        totalValue = (d3.sum(fullData, d => d.total / 1000)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        dataLoaded = true;
    }

    let waffleData = [];
    let waffleEl: HTMLElement;
    let waffleBgEl: HTMLElement;

    function renderWaffle(height: number, highlightType?: string) {
        if (!waffleEl) return;

        const unitSize = 20;
        const gridWidth = 15;
        const gridHeight = Math.floor(200 / unitSize);
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
        waffleBgEl.style.height = `${height-100}px`;
        };

        waffleEl.innerHTML = "";
        waffleEl.append(plot);
    }

    function renderDistPlot() {
        plotDist?.append(
            Plot.plot({
                height: height / 1.5,
                ...MARGINS,
                marginLeft: 90,
                marginTop: 40,
                marginRight: 40,
                y: {label: "Number of Datazoness", grid: true},
                x: {label: 'Total (£, billion)',  labelArrow:'none', labelAnchor: "center"},
                style: {fontSize: "15px"},
                marks: [
                    Plot.areaY(LADAveragedData, Plot.binX({y: "count"}, {
                        x: "total",
                        fill: COBENEFS_SCALE2(coBenefit)[0],
                        tip: true,
                        fillOpacity: 0.5,
                        stroke: COBENEFS_SCALE2(coBenefit)[0],
                        strokeWidth: 2
                    })),
                    Plot.axisY({anchor: "left", label: 'Number of datazones',  labelArrow:'none', labelAnchor: "center"}),
                    Plot.ruleY([0],{stroke: "#333", strokeWidth: 0.75}),
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
                height: height / 1.5,
                marginLeft: 80,
                marginRight: 40,
                marginBottom: 60,
                marginTop: 40,
                style: {fontSize: "15px"},
                x: {
                    type: "band",
                    tickFormat: d => d.replace(/^Y/, '').replace('_', '-'),
                    label: "Year Intervals"
                },
                y: {grid:true, label: 'Total (£, billion)'},
                marks: [
                    Plot.barY(pivotedData, Plot.groupX({y: "sum"}, {
                        x: "time",
                        y: d => d.value / 1000,
                        fill: COBENEFS_SCALE2(coBenefit)[0],
                        tip:{ format: {y:d => `${d.toFixed(2)}`, x: false}},
                        fillOpacity: 0.8,
                        //ry1: 5,
                        insetLeft: 15,
                        insetRight: 15,
                    })),
                    Plot.axisY({anchor: "left", grid: true, label: 'Total (£, billion)',  labelArrow:'none', labelAnchor: "center"}),
                    Plot.ruleY([0],{stroke: "#333", strokeWidth: 0.75})
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
                const labelLookup = SEF_LEVEL_LABELS[sef]; 

                const fullLevels = labelLookup
                    ? Object.keys(labelLookup).map(Number)
                    : LADAveragedData.filter(d => d["SEFMAME"] == sef).map(d => d.SE);

                plot = Plot.plot({
                    //title: sef,
                    style: {fontSize: "14px", textAnchor: "middle", fill: '#333'},
                    height: height/1.4 ,
                    width: height*1.2,
                    marginLeft: 70,
                    marginBottom: sef === "Typology" ? 80 : 60,
                    marginRight: 20,
                    marginTop: 20,
                    x: {  domain: fullLevels,
                            label: SEF_SCALE(sef),
                            tickFormat: d => labelLookup?.[d] ?? d,
                            tickRotate: sef === "Typology" ? -20 : 0
                        },
                    y: {label: '£, billion',  labelArrow:'none'},
                    color: {legend: true},
                    marks: [
                        //Plot.dot(LADAveragedData.filter(d => d["SEFMAME"] == sef), 
                        //Plot.dodgeX("middle",{
                        //    fx: "SE",
                            //x: "SE",
                        //    y: "total",
                        //    r: 1,
                        //    padding: -2,
                        //    fill: d => d.LAD.startsWith("S") ? COBENEFS_SCALE2(coBenefit)[1]
                        //        : d.LAD.startsWith("N") ? COBENEFS_SCALE2(coBenefit)[2]
                        //        : d.LAD.startsWith("E") ? COBENEFS_SCALE2(coBenefit)[3]
                        //        : COBENEFS_SCALE2(coBenefit)[4],})),
                        
                        Plot.boxY(LADAveragedData.filter(d => d["SEFMAME"] == sef), {
                            //fx: "SE",
                            x: "SE",
                            y: "total",
                            stroke: COBENEFS_SCALE2(coBenefit)[0],
                            fill: COBENEFS_SCALE2(coBenefit)[0],
                            r: 2,
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
                    width: height*1.2,
                    marginLeft: 70,
                    marginBottom: 60,
                    marginRight: 20,
                    marginTop: 30,
                    // y: {grid: true, label: "Average Cost Benefit (£)"},
                    // x: {grid: true, label: sef},
                    x: {label: SEF_SCALE(sef),  labelArrow:false, labelAnchor: "center"},
                    y: {label: '£, billion', labelArrow:false},
                    color: {legend: true},
                    marks: [
                        Plot.dot(LADAveragedData.filter(d => d["SEFMAME"] == sef), {
                            x: d => (["Under_35", "Over_65", "Unemployment"].includes(sef)
                                    ? d.SE * 100
                                    : d.SE), // multiply to get appropraite percentage value 
                            y: "total",
                            //stroke: COBENEFS_SCALE(coBenefit),
                            fill: d => d.LAD.startsWith("S") ? COBENEFS_SCALE3(coBenefit)[0]
                                : d.LAD.startsWith("N") ? COBENEFS_SCALE3(coBenefit)[1]
                                : d.LAD.startsWith("E") ? COBENEFS_SCALE3(coBenefit)[2]
                                : COBENEFS_SCALE3(coBenefit)[3],
                            r: 2,
                            fillOpacity: 1
                        }),
                        Plot.axisX({label: SEF_SCALE(sef),  labelArrow:false, labelAnchor: "center"}),
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
                <div style="margin-top: 10px;"></div>
                {coBenefitLabel}
              </h1>
              <div style="margin-top: 14px;"></div>
              <p class='definition'> {coBenefitDef} </p>
            </div>

          </div>
          <div class="header-waffle-wrapper">
            <div class="waffle-label">
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
                  <span class="waffle-big">£{coBenefit_percapita.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  {/if}
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
                  <div class="waffle-caption">Contribution to national benefits</div>
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
          <span class="mini-header-text">
            {coBenefitLabel} 
            {#if totalValue}
            <span class="mini-header-value">(UK total: £{totalValue} billion)</span>
            {/if}
            >> {formatLabel(currentSection)}</span>
          
        </div>
      </div>
    {/if}


    <div class="section">
        <div id="overview">
            <div class="section-header">
                <p class="section-subtitle">Overview</p>
            </div>
            <div id="vis-block">
                <div class="component singlevis">
                    <h3 class="component-title">Total values (£, billion) for <span style={cobensStyle}>{coBenefitLabel.toLowerCase()}</span> over time
                    </h3>
                    {#if totalValue>0}
                        <!-- <p class="description">The total benefit for each 5 year interval towards 2050. </p> -->
                        <p class="description">Each bar shows the total values obtained in that period. </p>
                        {:else}
                        <!-- <p class="description">The total cost/benefit for each 5 year interval towards 2050. </p> -->
                        <p class="description">Each bar shows the total benefits or costs obtained in that period. </p>
                    {/if}
                        <div class="plot" bind:this={plot}></div>
                    <!-- <p class="explanation">Each bar shows the total benefits obtain within the given period.</p> -->

                    <br>
                    <h3 class="component-title"> Distribution of values (£, billion) for <span style={cobensStyle}>{coBenefitLabel.toLowerCase()}</span> by UK data zones</h3>
                    {#if totalValue>0}
                        <p class="description"> Along the x-axis, see how many data zones (y-axis) benefit by how much.</p>
                    {:else}
                        <!-- <p class="description"> The total cost/benefit for each data zone across the UK. </p> -->
                        <p class="description"> Along the x-axis, see how many data zones (y-axis) lose/benefit how much.</p>
                        {/if}
                        <div class="plot" bind:this={plotDist}>
                            
                        </div>
                        <br>
                    <!-- <p class="explanation">``Bumps'' in the chart indicate </p> -->
                </div>


                <div class="component column">
                    <h3 class="component-title">Total values (£, billion) for <span style={cobensStyle}>{coBenefitLabel.toLowerCase()}</span> across the UK</h3>
                    <p class="description">Scroll for zooming in and out.</p>
                    {#if map}
                    <div id="legend">
                        {@html map.legend().outerHTML}
                    </div>
                        {/if}
                    <div id="map" bind:this={mapDiv}>
                    </div>
                </div>
            </div>
        </div>

        <div id="compare">
        <!-- <div class="section-header">
        <p class="section-subtitle">Compare by socio-economic factor</p>
        </div> -->

        <div class="section-header">
            <p class="section-subtitle">Socio-economic factors</p>
        </div>
        <div id="se-block" class="component" style="margin-left: 1rem;">
            <div id="se-title">
                <h3 class="component-title">Mapping the impact of <span style={cobensStyle}>{coBenefitLabel?.toLowerCase()}</span> across UK local authorities according to socio-economic factors</h3>
                <p class="explanation">Each scatterplot shows the distribution of benefits or costs depending on a given socio-economic factor.</p> 
                <br>

                <!-- Disclaimer -->
                <div id="se-disclaimer" class="disclaimer-box">
                    <p style="margin: 0 0 1rem 0;"><strong>Correlation ≠ Causation:</strong> The scatter plots represent modelled associations and should not be interpreted as direct causal relationships. </p>
                    <p style="margin: 0 0 1rem 0;"><strong>Discrete scales:</strong> The first set of socio-economic factors are using categorical values where the x-axis is non-linear:  EPC, Tenure, Typology, Fuel type, Gas flag, Number of cars.</p>

                </div>

                <!-- Legend -->
                <div id="se-legend" class="legend-box">
                    <strong style="margin-bottom: 1rem;">Legend:</strong> <br/>
                    <span>The scatter plots are shaded by nation.</span>

                    <ul class="legend-list">
                        <li><span class="legend-color" style="background-color: {COBENEFS_SCALE3(coBenefit)[0]}"></span>
                            Scotland</li>
                        <li><span class="legend-color" style="background-color: {COBENEFS_SCALE3(coBenefit)[1]}"></span>
                            Northern Ireland</li>
                        <li><span class="legend-color" style="background-color: {COBENEFS_SCALE3(coBenefit)[2]}"></span>England</li>
                        <li><span class="legend-color" style="background-color: {COBENEFS_SCALE3(coBenefit)[3]}"></span>Wales</li>
                    </ul>
                    
                </div>
            </div>

        

            <div id="multiple-comp">
                <div id="multiple-plots">
                    {#each SE_FACTORS as sef}
                        <div class="plot-container">                         
                            <h3 class="component-chart-title">{sef.label}</h3>
                            <p class="component-chart-caption">{sef.def}</p>
                              <div class="plot" bind:this={SEFPlot[sef.id]}></div>
                        </div>
                    {/each}
                </div>
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
        /* min-width: 25vw; */
        /* width: 30vw; */
        width: 400px;
        margin-left: 1rem;
        /* margin-right: 2rem; */
        margin-right: 50px;
        position: sticky;
        top: 120px;
        align-self: flex-start;
        height: fit-content;
    }


    #map {
        width: 100%;

        /*TODO: height is given by this currently but better to change at some point*/
        height: 600px;
        /*flex: 1; !* take the remaining height *!*/
    }

    #multiple-comp {
        /* grid-column: span 2 / span 2; */
        width: 100%;
        padding: 1rem 0;
    }

    /* #multiple-plots {
        display: flex;
        gap: 1%;
        flex-direction: row;
        flex-flow: wrap;
        align-items: center;
        align-content: space-between;
        justify-content: center;
    } */

    #multiple-plots {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        justify-items: start;
    }


    .plot-container {
        width: 100%;
        margin-bottom: 20px;
    }
    
    .component-chart-title {
        font-size: 1.2rem;
        font-weight: bold;
        margin: 0;
        margin-bottom: 10px;
        text-align: left;
    }

    .component-chart-caption {
        font-size: 0.9rem;
        line-height: 1.1rem;
        color: #555;
        margin: 0 0 15px 0;
        text-align: left;
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
    width: 4rem;
    height: 4rem;
    }


    .section.header {
    padding: 2% 6%;
    background-color: #f9f9f9;
    }

    .header-content {
    display: flex;
    align-items: top;
    justify-content: space-between;
    flex-wrap: wrap;
    }

    .header-text {
    max-width: 60%;
    height :100%;
    }

    .page-subtitle {
    font-size: 1.2rem;
    color: #777;
    margin-bottom: 2rcap;
    }

    .page-title {
    font-size: 1.7rem;
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
    margin-top: .9rem;
    font-size: .9rem;
    color: #333;
    }

    .header-waffle {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    min-width: 120px;
    }

    .header-waffle-wrapper {
    position: relative;
    min-width: 120px;
    height: 2%;
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
    line-height: 1.1;
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
  font-size: 1.3rem;
  font-weight: 500;
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

.definition {
    max-width: 550px;
    font-size: 1rem;
    line-height: 1.25rem;
}

</style>