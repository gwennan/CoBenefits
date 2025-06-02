<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount, onDestroy} from 'svelte';

    import {MapUK} from "$lib/components/mapUK";

    import {
        SEF_LABEL,
        SEF_DEF,
        SEF_UNITS,
        SEF_DESCR,
        SEF_CATEGORICAL,
        COBENEFS,
        type CoBenefit,
        CBS,
        CO_BEN
    } from "../../globals";


    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import {getSEFData, getTableData, getSEFbyCobenData, getSefForOneCoBenefit, getAggregationPerCapitaPerBenefit} from "$lib/duckdb";

    let element: HTMLElement;
    let plotDist: HTMLElement;
    let plotDot: HTMLElement;
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
    const sefUnits = SEF_UNITS.find(d => d.id === SEF)?.units ?? SEF;
    const sefdescr = SEF_DESCR.find(d => d.id === SEF)?.description?? SEF;

    let map: MapUK;

    let mapDiv: HTMLElement;
    let mapLegendDiv: HTMLElement;

    loadData().then(() => {
        map = new MapUK(fullData, "Lookup_Value", mapDiv, "total", false, "Lookup_Value", false);
        map.initMap();

        let legendSvg = map.legend();
        mapLegendDiv.append(legendSvg)

    });

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

    function renderDistPlot() {
        plotDist?.append(
            Plot.plot({
                height: height / 2,
                width: height*2,
                marginLeft: 60,
                marginTop: 30,
                marginRight: 10,
                marginBottom: 50,
                x: {label:null},
                y: {label:'No. of datazones/LADs', labelArrow: false},
                style: {fontSize: "16px"},
                marks: [
                    Plot.rectY(fullData, Plot.binX({y: "count"}, {
                        x: {value:"val", thresholds: 20},
                        fill: "black",
                        fillOpacity: 0.5,
                        stroke: "black",
                        srokeWidth: 4,
                    })),
                    // Plot.ruleY([0],{stroke: "#333", strokeWidth: 0.75}),
                    Plot.axisX({label: "{sefdef}",  labelArrow:false, labelAnchor: "center"}),
                ]
            })
        );
    }

    function renderDotPlot() {
        plotDot?.append(
            Plot.plot({
                height: height*1.5,
                width: height*2,
                marginLeft: 80,
                marginTop: 40,
                marginRight: 10,
                marginBottom: 60,
                x: {grid:false},
                y: {grid:true},
                style: {fontSize: "16px"},
                marks: [
                    Plot.dot(fullData, {
                        x: "val",
                        y: d => d.total_per_capita*1000,
                        fill: d => d.total_per_capita<0 ? '#BD210E'
                                : '#242424',
                        r: 0.9,
                        fillOpacity: 0.75,
                        tip: true,
                    }),
                    Plot.ruleY([0],{stroke: "#333", strokeWidth: 0.75}),
                    Plot.axisY({label: "Per capita co-benefit value (£, thousand)",  labelArrow:false, labelAnchor: "center"}),
                    Plot.axisX({label: "{sefdef}",  labelArrow:false, labelAnchor: "center"}),
                ]
            })
        );
    }

    function renderplotSmallMult() {
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
        plotSmallMult[CB]?.append()
    })
}

    $: {
        plot?.firstChild?.remove(); // remove old chart, if any
        Object.values(plotSmallMult).forEach(multPlot => {
            multPlot.firstChild?.remove();
        })

        if (height && dataLoaded) {

            renderDistPlot();
            renderDotPlot();
            renderplotSmallMult();
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
            <p class="definition">Max value: <strong>{maxValue} ({maxLookupValue})</strong></p>
            <p class="definition">Average value: <strong>{averageValue}</strong></p>
            <p class="definition">Min value: <strong>{minValue} in ({minLookupValue})</strong></p>
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
        <div class="plot" bind:this={plotDot}></div>
    </div>
    <div class="component column">
        <h3 class="component-title">{sefLabel} </h3>
        <p class="description">Scroll for zooming in and out.</p>
        <p> MAP </p>
        <!-- <div id="map" bind:this={mapDiv}> </div> -->
        
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
    <div class="plot" bind:this={plotSmallMult}></div>
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

    .header-vis {
    text-align: left;
    flex: 1;
    margin-left: auto;        /* pushes it to the far right */
    margin-top: 2.5rem;         /* moves it down slightly */
    padding-right: 0rem;  
    padding-left: 5rem;    /* adds space from the right edge */
    }

    .header-stats {
    text-align: left;
    flex: 1;
    margin-left: auto;        /* pushes it to the far right */
    margin-top: 2rem;         /* moves it down slightly */
    padding-right: 0rem;  
    padding-left: 5rem;    /* adds space from the right edge */
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
    margin: 10px 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.nation-label {
        /*color: #90bcca;*/
        color: #777;
    }
</style>