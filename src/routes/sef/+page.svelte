<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount, onDestroy} from 'svelte';

    import {
        SEF_LABEL,
        SEF_DEF
    } from "../../globals";


    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import {getSEFData, getTableData, getTotalPerOneCoBenefit} from "$lib/duckdb";

    let element: HTMLElement
    let height = 400;
    let fullData;
    let dataLoaded = false;

    // Data from load function
    export let data;

    const SEF = data.SEF;
    console.log("SEF ", SEF)
    const sefLabel = SEF_LABEL.find(d => d.id === SEF)?.label ?? SEF;
    const sefDef = SEF_DEF.find(d => d.id === SEF)?.def ?? SEF;

    loadData().then(() => {

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
        dataLoaded = true;
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
                    <p class='definition'> {sefDef} </p>
                </div>
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

</style>