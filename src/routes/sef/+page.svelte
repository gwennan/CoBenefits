<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount, onDestroy} from 'svelte';

    import {MapUK} from "$lib/components/mapUK";

    import {
        SEF_LABEL,
        SEF_DEF,
        SEF_CATEGORICAL,
    } from "../../globals";


    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import {getSEFData, getTableData, getTotalPerOneCoBenefit} from "$lib/duckdb";

    let element: HTMLElement;
    let plotDist: HTMLElement;
    let plotDot: HTMLElement;
    let plot: HTMLElement;
    let height = 400;
    let fullData;
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
        fullData = await getTableData(getSEFData(SEF))
        console.log(fullData)
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

        dataLoaded = true;
    }

    function renderDistPlot() {
        plotDist?.append(
            Plot.plot({
                height: height / 2,
                width: height*2,
                marginLeft: 60,
                marginTop: 10,
                marginRight: 10,
                marginBottom: 40,
                x: {label:null},
                y: {label:null},
                style: {fontSize: "16px"},
                marks: [
                    Plot.areaY(fullData, Plot.binX({y: "count"}, {
                        x: "val",
                        fill: "black",
                        fillOpacity: 0.5,
                        stroke: "black",
                        srokeWidth: 4,
                    })),
                    // Plot.ruleY([0],{stroke: "#333", strokeWidth: 0.75}),
                ]
            })
        );
    }

    function renderDotPlot() {
        plotDot?.append(
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
                    Plot.dot(fullData, {
                        x: "val",
                        y: "total",
                        fill: "black",
                        fillOpacity: 0.5,
                        tip: true,
                    }),
                    // Plot.ruleY([0],{stroke: "#333", strokeWidth: 0.75}),
                ]
            })
        );
    }

    $: {
        plot?.firstChild?.remove(); // remove old chart, if any

        if (height && dataLoaded) {

            renderDistPlot();
            renderDotPlot();
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
              <h1 class="page-title">{sefLabel}</h1>
              <p class="definition">{sefDef}</p>
            </div>
          </div>

          <div class="header-vis">
            <div class="plot" bind:this={plotDist}></div>
          </div>

          <div class="header-stats">
            <p class="definition">Max Value: {maxValue} [{maxLookupValue}]</p>
            <p class="definition">Average Value: {averageValue}</p>
            <p class="definition">Min Value: {minValue} [{minLookupValue}]</p>
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
        <div id="overview">
            <div class="section-header">
                <p class="section-subtitle">Overview</p>
            </div>
            <div id="vis-block">
                <div class="component column">
                    <h3 class="component-title">{sefLabel} against total co-benefit values (£, billion)</h3>
                    <p class="description">Each point represent a data zone. </p>
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
    margin-top: 2rem;         /* moves it down slightly */
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
</style>