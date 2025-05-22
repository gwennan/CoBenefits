<script lang="ts">
    import * as d3 from 'd3';
    import * as Plot from "@observablehq/plot";
    import {onMount, onDestroy} from 'svelte';


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
                    <h1 class="page-title"></h1>
                </div>
            </div>
        </div>
    </div>

    <div class="section">

    </div>
</div>

<style>

</style>