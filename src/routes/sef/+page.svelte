<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount, onDestroy} from 'svelte';

    import {MapUK} from "$lib/components/mapUK";

    import {
        SEF_LABEL,
        SEF_DEF,
        SEF_SHORT_UNITS,
        SEF_DESCR,
        SEF_CATEGORICAL,
        COBENEFS,
        type CoBenefit,
        CBS,
        CO_BEN,
        SEF_UNITS2 
    } from "../../globals";


    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import {getSEFData, getTableData, getSEFbyCobenData, getSefForOneCoBenefit, getAggregationPerCapitaPerBenefit} from "$lib/duckdb";

    import per_capita from '$lib/icons/per_capita.png';
    import total from '$lib/icons/total.png';

    let element: HTMLElement;
    let plotDist: HTMLElement;
    let plotDot: HTMLElement;
    let plotMultDot: HTMLElement;
    let plotSmallMult: Record<string, HTMLElement> = {};
    let plot: HTMLElement;
    let height = 400;
    let fullData;
    let SEFData;
    let PCData;
    let dataLoaded = false;
    let averageValue;
    let maxValue;
    let minValue;
    let maxLookupValue;
    let maxIndex;
    let minLookupValue; 
    let minIndex;
    
    // Data from load function
    export let data;

    const SEF = data.SEF;
    console.log("SEF ", SEF)
    const sefLabel = SEF_LABEL.find(d => d.id === SEF)?.label ?? SEF;
    const sefDef = SEF_DEF.find(d => d.id === SEF)?.def ?? SEF;
    const sefdescr = SEF_DESCR.find(d => d.id === SEF)?.description?? SEF;
    const sefShortUnits = SEF_SHORT_UNITS.find(d => d.id === SEF)?.short_units ?? SEF;
    const sefUnits = SEF_UNITS2.find(d => d.id === SEF)?.units ?? SEF;

    let map: MapUK;

    let mapDiv: HTMLElement;
    let mapLegendDiv: HTMLElement;


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


    onMount(() => {
        window.addEventListener('scroll', handleScroll); // header scroll listener

        handleScroll(); // initialize
        return () => window.removeEventListener('scroll', handleScroll);
    })

    onDestroy(() => {
        window.removeEventListener('scroll', handleScroll); // remove listener
    })


    async function loadData() {
        fullData = await getTableData(getSEFData(SEF));
        console.log("totals", fullData);
        SEFData = await getTableData(getSEFbyCobenData(SEF));
        console.log("by cobens", SEFData);
        PCData = await getTableData(getAggregationPerCapitaPerBenefit());
        console.log("per_capita_data", PCData);
        averageValue = (
            d3.mean(fullData, d => d.val) ?? 0).toLocaleString('en-US', 
            {minimumFractionDigits: 2, maximumFractionDigits: 2});
        console.log("Average Value: ", averageValue);
        
        maxIndex = d3.maxIndex(fullData, d => d.val);
        maxLookupValue = maxIndex !== -1 ? fullData[maxIndex].Lookup_Value : "N/A";
        maxValue = (
            fullData[maxIndex]?.val ?? 0).toLocaleString('en-US', {
                minimumFractionDigits: 2, maximumFractionDigits: 2});

        minIndex = d3.minIndex(fullData, d => d.val);
        minLookupValue = minIndex !== -1 ? fullData[minIndex].Lookup_Value : "N/A";
        minValue = (
            fullData[minIndex]?.val ?? 0).toLocaleString('en-US', {
                minimumFractionDigits: 2, maximumFractionDigits: 2});

        CBS.forEach(CB => {
            SEFData[CB] = +SEFData[CB];
        })

        dataLoaded = true;
    }

    loadData().then(() => {
        map = new MapUK(fullData, "LSOA", mapDiv, "val", false, "Lookup_Value", false);
        map.initMap();

        // let legendSvg = map.legend();
        // mapLegendDiv.append(legendSvg)
    });

    function renderDistPlot() {
        const average = d3.mean(fullData, d => d.val) ?? 0;
        const maxY = d3.max(
                d3.bin().thresholds(20).value(d => d.val)(fullData),
                bin => bin.length
                );

        plotDist?.append(
            Plot.plot({
                height: height / 1.9,
                width: height*1.7,
                marginLeft: 60,
                marginTop: 30,
                marginRight: 20,
                marginBottom: 50,
                x: {label: `${sefUnits}`},
                y: {label:'No. of datazones/LADs', labelArrow: false},
                style: {fontSize: "16px"},
                marks: [
                    Plot.rectY(fullData, Plot.binX({y: "count"}, {
                        x: {value:"val", thresholds: 20},
                        fill: "black",
                        fillOpacity: 0.5,
                        stroke: "black",
                        srokeWidth: 5,
                    })),
                    Plot.ruleX([average], {
                                stroke: "#BD210E",
                                strokeWidth: 4,
                                channels: {average: {value:average, label: "Average"}},
                                tip: {format: {average:true, x:false}},
                            }),
                    Plot.dot(fullData, {
                        x: {value:average, thresholds: 20},
                        y:maxY + 0.1*maxY,
                        r:5,
                        fill: "#BD210E"
                        
                    }),
                    Plot.axisX({label: `${sefUnits}`,  labelArrow:false, labelAnchor: "center"}),
                ]
            })
        );
    }

    function renderDotPlot() {
        plotDot?.append(
            Plot.plot({
                height: height*2,
                width: height*2,
                marginLeft: 60,
                marginTop: 60,
                marginRight: 10,
                marginBottom: 60,
                x: {grid:false},
                y: {grid:true},
                style: {fontSize: "16px"},
                marks: [
                    Plot.ruleY([0],{stroke: "#333", strokeWidth: 1.25}),
                    Plot.ruleX([0],{stroke: "#333", strokeWidth: 0.75}),
                    Plot.dot(fullData, {
                        x: "val",
                        y: d => d.total_per_capita*1000,
                        fill: d => d.total_per_capita<0 ? '#BD210E'
                                : '#242424',
                        r: 0.9,
                        fillOpacity: 0.75,
                        channels: {
                            location: {value: "Lookup_Value", label: "Location"},
                            sef: {value: "val", label: "SEF Value"},
                            value: {value:d => d.total_per_capita*1000, label: "Per Capita Co-Benefit Value"},
                        },
                        tip: {format: {location:true, sef:true, value:true, x:false, y:false}},
                    }),
                    
                    Plot.axisY({label: "Per capita co-benefit value (£, thousand)",  labelArrow:false, labelAnchor: "center"}),
                    Plot.axisX({label: `${sefUnits}`,  labelArrow:false, labelAnchor: "center"}),
                ]
            })
        );
    }

    function renderplotSmallMult() {
        plotMultDot.append(
        Plot.plot({
                height: height*1.5,
                width: height*2,
                marginLeft: 60,
                marginTop: 10,
                marginRight: 10,
                marginBottom: 40,
                x: {label:null},
                y: {label:null},
                style: {fontSize: "16px"},
                marks: [
                    Plot.dot(SEFData.filter(d => d["co_benefit_type"] == "Noise"), {
                        x: "val",
                        y: "total",
                        fill: "black",
                        fillOpacity: 0.5,
                        tip: true,
                    }),
                ]
            })
        );
    }

function renderMultPlotDot() {
        CBS.forEach(CB => {
            let plot;
            plot = Plot.plot({
                height: height*1.5,
                width: height*2,
                marginLeft: 60,
                marginTop: 10,
                marginRight: 10,
                marginBottom: 40,
                x: {label:null},
                y: {label:null},
                style: {fontSize: "16px"},
                marks: [
                    Plot.dot(SEFData.filter(d => d["co_benefit_type"] == CB), {
                        x: "val",
                        y: "total",
                        fill: "black",
                        fillOpacity: 0.5,
                        tip: true,
                    }),
                ]
            });
        plotSmallMult[CB]?.append(plot)
    })
}

function formatValue(value, unit) {
  return unit === "£" ? `${unit}${value}` : `${value} ${unit}`;
}

    $: {
        plot?.firstChild?.remove(); // remove old chart, if any
        Object.values(plotSmallMult).forEach(multPlot => {
            multPlot.firstChild?.remove();
        })

        if (height && dataLoaded) {

            renderDistPlot();
            renderDotPlot();
            // renderplotSmallMult();
            renderMultPlotDot();
        }
    }


</script>

<NavigationBar></NavigationBar>

<div class="page-container" bind:this={element}>

    <div class="section header">
        <div class="header-content">
          <div class="header-text">
            <p class="page-subtitle">SEF Report</p>
            <div class="title-container">
              <h1 class="page-title">{sefdescr}</h1>
              <p class="definition">{sefDef}</p>
            </div>
          </div>

          <div class="header-vis">
            <div class="plot" bind:this={plotDist}></div>
          </div>

          <div class="header-stats">
            <p class="definition-stat">Max value: <strong>{formatValue(maxValue, sefShortUnits)}</strong> ({maxLookupValue})</p>
            <p class="definition-stat">Average value: <strong style="color: #BD210E;">{formatValue(averageValue, sefShortUnits)}</strong></p>
            <p class="definition-stat">Min value: <strong>{formatValue(minValue, sefShortUnits)}</strong> ({minLookupValue})</p>
          </div>
        </div>
      </div>

    {#if scrolledPastHeader}
    <div class="mini-header">
      <div class="mini-header-content">
        <span class="mini-header-text">
          {sefLabel} >> 
        </span>     
      </div>
    </div>
  {/if}

  <div class="section">
  <div class="radio-set">
    Select which level of data you'd like to view:<br/>
    <input type="radio" name="compare" value="LSOA" checked>
    <label class="nation-label" for="html">Data Zone (LSOA)</label><br>
    <input type="radio" name="compare" value="LAD">
    <label class="nation-label" for="html">Local Authority (LAD)</label><br>
</div>
</div>

    <div class="section">
        <div id="overview">
            <div class="section-header">
                <p class="section-subtitle">Overview</p>
            </div>
            <div id="vis-block">
                <div class="component column">
                    <h3 class="component-title">{sefLabel} against per capita co-benefit values (£, thousand)</h3>
                    <p class="description">Each point in the chart below represents a UK data zone (LSOA). </p>
                    <div class="aggregation-icon-container">
                        <div class="tooltip-wrapper">
                          <img class="aggregation-icon" src="{per_capita}" alt="icon" />
                          <span class="tooltip-text">This chart uses per capita values. i.e. shows the cost/benefit per person in each AREA.</span>
                        </div>
                      </div>
        <div class="plot-dot" bind:this={plotDot}></div>
    </div>
    <div class="component column">
        <h3 class="component-title">{sefLabel} </h3>
        <p class="description">Scroll for zooming in and out.</p>
<!--        <p> MAP </p>-->
         <div id="map" bind:this={mapDiv}> </div>
        
    </div>
</div>
</div>
</div>

<div class="section">
    <div id="compare">
        <div class="section-header">
            <p class="section-subtitle">Comparison</p>
        </div>
        <div id="vis-block">
            <div class="component column">
                <h3 class="component-title">{sefLabel} against per capita co-benefit values (£, thousand)</h3>
                <p class="description">By Co-Benefit. </p>
    <div class="plot" bind:this={plotMultDot}></div>
</div>
</div>
</div>
</div>

<div id="multiple-comp">
    <div id="multiple-plots">
        {#each CO_BEN as CB}
            <div class="plot-container">                         
                <h3 class="component-chart-title">{CB.label}</h3>
                <p class="component-chart-caption"> </p>
                {#if plotSmallMult[CB.id] === undefined}
                    {console.log("Missing key in plotSmallMult:", CB.id)}
                {/if}
                  <div class="plot" bind:this={plotSmallMult[CB.id]}></div>
            </div>
        {/each}
    </div>
</div>

</div>

<style>
    .section.header {
    padding: 2% 6%;
    background-color: #f9f9f9;
    }
    .section-subtitle {
    font-size: 1.3rem;
    font-weight: bold;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 5px;
    margin-top: 0px;
}

    .header-content {
    display: flex;
    align-items: top;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-direction: row;  /* or column, depending on your layout */
    gap: 2rem;            /* adjust spacing between children */
    align-items: flex-start;
    }

    .header-text {
    max-width: 30%;
    height :100%;
    }

    .header-vis {
    text-align: left;
    flex: 1;
    margin-left: 0rem;        /* pushes it to the far right */
    margin-top: 1rem;         /* moves it down slightly */
    padding-right: 0rem;  
    padding-left: 0rem;    /* adds space from the right edge */
    flex-grow: 1;
    flex-shrink: 0;
    flex-basis: auto;
    max-width: 40%;
    }

    .header-stats {
    text-align: left;
    flex: 1;
    margin-left: 0rem;        /* pushes it to the far right */
    margin-top: 2rem;         /* moves it down slightly */
    padding-right: 0rem;  
    padding-left: 0rem;    /* adds space from the right edge */
    line-height: 2;
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

    .radio-set {
    margin: 10px 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.nation-label {
        /*color: #90bcca;*/
        color: #777;
    }

.aggregation-icon-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  width: 99%; 
  margin-top: 20px;
  margin-right: 10px;
}

.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.aggregation-icon {
  width: 40px;
  height: 40px;
}

.tooltip-text {
  visibility: hidden;
  background-color: #333;
  color: #fff;
  font-size: 12px;
  padding: 5px 8px;
  border-radius: 4px;
  position: absolute;
  top: 35px;
  right: -60px;
  left: -60px;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.2s ease;
  max-width: 200px;          /* control width */
  white-space: normal;       /* allow wrapping */
  word-break: break-word;    /* instead of word-wrap */
  display: inline-block;     /* important for width + wrapping */
}

.tooltip-wrapper:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.plot {
  margin-top: 0px; /* pull it upward */
}

.plot-dot {
  margin-top: -80px; /* pull it upward */
}

.definition-stat {
  font-size: 18px;
  font-weight: semibold;
  color: #555;
  max-width: 800px;
  margin: 0;
}

 #map {
        width: 100%;
     height: 90%;
    }
</style>