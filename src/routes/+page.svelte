<script lang="ts">
import { base } from '$app/paths';
import { goto } from '$app/navigation';
import * as Plot from "@observablehq/plot";
import { onMount, onDestroy } from 'svelte';

import {COBENEFS, COBENEFS_RANGE, COBENEFS_SCALE, getHeroSlides} from "../globals";

import NavigationBar from "$lib/components/NavigationBar.svelte";
import LADSearch from './LADSearch.svelte';
import CoBenefitTable from './CoBenTable.svelte';
import LADTable from './LADTable.svelte';

// explore by lad: reactive queries
import { getTopSelectedLADs } from '$lib/duckdb';
import { getTableData } from '$lib/duckdb';


export let data;
let aggregationPerBenefit = [...data.aggregationPerBenefit].sort((a, b) => b.total - a.total);
let aggregationPerCapitaPerBenefit = [...data.aggregationPerCapitaPerBenefit].sort((a, b) => b.total_value - a.total_value);
// console.log("aggregationPerCapitaPerBenefit", aggregationPerCapitaPerBenefit);

// explore by lad: reactive queries
let ladData = [];
let region = 'All';
let sortBy = 'total';
let maxLADValue = 0;
let maxHHLADValue = 0;
let LADToName = data.LADToName;

async function fetchLADData() {
    const sql = getTopSelectedLADs({ region, sortBy });
    const rows = await getTableData(sql);
    ladData = rows;
    // console.log("ladData", ladData);

    maxLADValue = Math.max(...rows.map(d => d.total_value));
    maxHHLADValue = Math.max(...rows.map(d => d.value_per_capita));
  }

function handleFilterChange(event) {
    region = event.detail.region;
    sortBy = event.detail.sortBy;
    fetchLADData();
  }

const maxCoBenefValue = Math.max(...aggregationPerCapitaPerBenefit.map(d => d.total_value));
const minCoBenefValue = Math.min(...aggregationPerCapitaPerBenefit.map(d => d.total_value));
const minHHCoBenefValue = Math.min(...aggregationPerCapitaPerBenefit.map(d => d.value_per_capita));
const maxHHCoBenefValue = Math.max(...aggregationPerCapitaPerBenefit.map(d => d.value_per_capita));

// for waffle
let waffleData: [];
let waffleOrderedTypes: string[] = [];
let waffleEl: HTMLDivElement | null = null;
let waffleBgEl: HTMLElement;
let waffleLabelEl: HTMLElement;
let activeTypeLabel: string;
let activeValueLabel: string;
// for hero background images
let slides: any[] = [];
let heroEl: HTMLElement;
let highlight: string | null = null;
// for waffle animation and hero background images
let activeType: string | null = null;
let intervalId: any;
let currentIndex = 0;
let previousIndex = 0;
let interval;


function startWaffleHighlightLoop(height: number) {
    // sort in the waffle display order
    const visibleTypes = waffleData
        .filter(d => d.type !== "empty")
        .map(d => d.type);
    const orderedTypes = Array.from(new Set(visibleTypes));

    // total cobenfits by default
    const totalValue = aggregationPerBenefit.reduce((sum, d) => sum + d.total, 0);
    
    const highlightSequence = [
      {
        type: null,
        label: 'total co-benefits',
        value: totalValue.toFixed(1)
      },
      ...orderedTypes.map((type) => {
        const label = type;
        const value = aggregationPerBenefit.find((d) => d.co_benefit_type === type)?.total.toFixed(1) ?? "";
        return { type, label, value };
      })
    ];

    // refresh 5s for each type
    intervalId = setInterval(() => {
        previousIndex = currentIndex;
        currentIndex = (currentIndex + 1) % highlightSequence.length;
        const { type, label, value } = highlightSequence[currentIndex];
        activeType = type;
        activeTypeLabel = label;
        activeValueLabel = value;

        renderWaffle(height, type);
    }, 5000);

    // On default load, show the total
    const firstSlide = slides[0];
    activeType = firstSlide.type;
    activeTypeLabel = firstSlide.label;
    activeValueLabel = totalValue.toFixed(1);
    renderWaffle(height, firstSlide.type);
}

function renderWaffle(height: number, highlightType?: string) {

    if (!waffleEl) return;

    waffleEl.innerHTML = "";

    // waffle size
    const unitSize = 20; // fixed size of each square in pixels 
    const gridWidth = 15; // fixed number of columns
    const gridHeight = Math.floor(height / unitSize); // number of rows that fit in the hero height
    const gridSize = gridWidth * gridHeight;

    const total = aggregationPerBenefit.reduce((sum, d) => sum + d.total, 0);
    const squares = [];

    // grid sizes
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

    // Sort
    squares.sort((a, b) => {
        // Move 'empty' to the end
        if (a.type === "empty") return 1;
        if (b.type === "empty") return -1;

        // negative values at the end
        if (a.negative && !b.negative) return 1;
        if (!a.negative && b.negative) return -1;

        return 0;
    });

    waffleData = squares.map((d, i) => ({
        x: i % gridWidth,
        y: Math.floor(i / gridWidth),
        ...d
    }));

    // for hero backeground sequence
    waffleOrderedTypes = Array.from(
        new Set(waffleData.map(d => d.type).filter(type => type !== "empty"))
    );

    slides = getHeroSlides(waffleOrderedTypes);

    // console.log("waffle height", height);
    const highlight = highlightType ?? null;
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
        // Postive values
        Plot.rect(waffleData.filter(d => !d.negative), {
            x: d => d.x * unitSize,
            y: d => d.y * unitSize,
            fill: "type",
            fillOpacity: d => (highlight && d.type !== highlight ? 0.15 : 1)
        }),

        // Outlined rects (negative values)
        Plot.rect(waffleData.filter(d => d.negative), {
            x: d => d.x * unitSize,
            y: d => d.y * unitSize,
            stroke: "type",
            strokeOpacity: d => (highlight && d.type !== highlight ? 0.15 : 1),
            strokeWidth: 1,
            fill: "none"
        })
        ]
    });
    // white background
    if (waffleBgEl) {
    waffleBgEl.style.width = `${unitSize * gridWidth}px`;
    waffleBgEl.style.height = `${height}px`;
    };

    waffleEl.innerHTML = "";
    waffleEl.append(plot);
}


let selectedLAD: string | null = null;
function handleSearch(code: string) {
  goto(`${base}/location?location=${code}`);
}

let isLoading = true;

$: {
    isLoading = !data;
}

let showDropdown = false;

  onMount(() => {
    fetchLADData();
    const heroHeight = heroEl.getBoundingClientRect().height;
    renderWaffle(heroHeight);
    startWaffleHighlightLoop(heroHeight);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<NavigationBar></NavigationBar>

  <section class="hero-container" bind:this={heroEl}>
    {#each slides as slide, index}
      <div
        class="hero-slide"
        style="background-image: url({slide.image});"
        class:active={index === currentIndex}
        class:previous={index === previousIndex}
      />
    {/each}
  
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">The Co-Benefits of the UK’s Path to Net-Zero GHG Emissions</h1>
        <p class="hero-description">
          Climate actions affects more than GHG emissions. Electric cars reduce urban air pollution, retrofits prevent mould and damp, cycling improves public health. The CO-BENS project models 11 co-benefits from the climate actions in the UK Climate Change Committee’s most recent pathway to Net Zero for the UK. In each of 45,000 local communities and regions we consider our local context determine both which climate actions will be implemented and how, when and for whom those climate actions will lead to benefits (and in some cases costs).
        </p>
        <p class="hero-description">
          Just as climate actions affects more than GHG emissions, climate solutions require more than climate modelling. This website provides data and visualisations to support local, regional and national stakeholders who want to understand how climate actions are closely connected with a wide range of social, economic and environmental priorities. <br>
        </p>

        <p class="hero-description">
          If you would like bespoke analysis highlighting how co-benefits are key to the work your team or organisation is doing, please reach out!
        </p>
      </div>

    <div class="waffle-overlay">
      <div class="waffle-label" bind:this={waffleLabelEl}>
        National gain of <br>
        <strong style="font-size: 1.5rem">{activeTypeLabel}</strong> <br>
        in reaching NetZero <br>
        by 2050 is: <br>
        <strong style="font-size: 1.2rem">{activeValueLabel}</strong>
        £billion
      </div>
      
      <div class="waffle-bg" bind:this={waffleBgEl}></div>
      <div bind:this={waffleEl}></div>
  </div>
  </section>

  <section class="search-section">
    <h1>Find My Place</h1>
    <LADSearch 
      items={LADToName} 
      on:search={(e) => handleSearch(e.detail)} 
      />
    <!-- {#if selectedLAD}
      <h2>Total Cobenefits</h2>
      <h2>Cobenefits Over Time</h2>

    {/if} -->
  </section>


  <section class="side-by-side-section">
    <div class="side-box">
      <h2>Explore by Local Authority</h2>
      <LADTable
        {ladData}
        {region}
        {sortBy}
        {maxLADValue}
        {maxHHLADValue}
        {LADToName}
        on:filterChange={handleFilterChange}
      />
    </div>

    <div class="side-box">
      <h2>Explore by Co-Benefit</h2>
      <CoBenefitTable
        {aggregationPerCapitaPerBenefit}
        {minCoBenefValue}
        {maxCoBenefValue}
        {minHHCoBenefValue}
        {maxHHCoBenefValue}
        {COBENEFS_SCALE}
      />
    </div>

  </section>


<main>

    <!-- Spinner -->
    {#if isLoading}
        <div class="spinner">
            GGGGGGGGG
        </div>
    {/if}
</main>



<style>
main {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 60%;
}

.hero-text {
  position: relative;
  z-index: 1;
  max-width: 700px;
}

.hero-title {
  font-size: 2.75rem;
  font-weight: bold;
  margin-bottom: 3rem;
  line-height: 3rem;
}

.hero-description {
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  line-height: 1rem;
  max-width: 600px;
}



.hero-container {
  position: relative;
  height: 55vh;
  overflow: hidden;
}

.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  z-index: 0;
}

.hero-slide.active {
  opacity: 1;
  z-index: 1;
}

.hero-slide.previous {
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 2rem;
  color: #000;
}

.waffle-overlay {
    position: absolute;
    top: 0;
    right: 0.5rem;
    /* width: 150px; 
    height: 150px; */
    pointer-events: none;
    z-index: 10;
    margin: 0;
    /* background-color: white; */
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
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
  padding: 1rem 1rem;
  white-space: nowrap;
  /* max-width: 400px; */
  font-size: 0.95rem;
  line-height: 1.4;
  z-index: 2;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  text-align: left;
}


.side-by-side-section {
  display: flex;
  gap: 2rem;
  padding: 2rem 3rem;
  justify-content: space-between;
  background-color: #f9f9f9;
}

.side-box {
  flex: 1;
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}


.side-box h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #333;
}



.side-by-side-section {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.search-section h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

</style>