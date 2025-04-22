<script lang="ts">
import { base } from '$app/paths';
import {COBENEFS, COBENEFS_RANGE, COBENEFS_SCALE, getHeroSlides} from "../globals";
import { page } from '$app/stores';
import * as Plot from "@observablehq/plot";

import { onMount, onDestroy } from 'svelte';


// waffle chart
export let data;
// let aggregationPerBenefit = data.aggregationPerBenefit;
// sort the cobenefits, but should keep the table interactive later
let aggregationPerBenefit = [...data.aggregationPerBenefit].sort(
  (a, b) => b.total - a.total
);
let topLADsData = data.topLADsData;
const maxLADValue = Math.max(...topLADsData.map(d => d.total));
const maxCoBenefValue = Math.max(...aggregationPerBenefit.map(d => d.total));
const minCoBenefValue = Math.min(...aggregationPerBenefit.map(d => d.total));

let waffleData: [];
let waffleOrderedTypes: string[] = [];

let slides: any[] = [];

let waffleEl: HTMLElement;
let waffleBgEl: HTMLElement;
let waffleLabelEl: HTMLElement;
let activeTypeLabel: string;
let activeValueLabel: string;

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
    waffleBgEl.style.width = `${unitSize * gridWidth+20}px`;
    waffleBgEl.style.height = `${height}px`;
    };

    waffleEl.innerHTML = "";
    waffleEl.append(plot);
}

// bars for LAD table
function makeLADBarSVG(value, max) {
  const plot = Plot.plot({
    width: 80,
    height: 20,
    margin: 0,
    x: { domain: [0, max], axis: null },
    marks: [
      Plot.barX([value], {
        x: d => d,
        y: 0,
        // height: 20,
        fill: "#ccc"
      }),
      // Plot.text([value], {
      //   x: d => d + 1, 
      //   // y: 0.5,
      //   text: d => d.toFixed(0),
      //   fill: "#333",
      //   dy: "0.35em",
      //   textAnchor: "start",
      //   style: "font-size: 1rem"
      // })
    ]
  });
  return plot.outerHTML;
}


// bars for coben table
function makeCoBenefBarSVG(value, minAbs, maxAbs, coBenefType) {
  const color = COBENEFS_SCALE(coBenefType);

  const plot = Plot.plot({
    width: 100,
    height: 20,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    x: { domain: [minAbs, maxAbs], axis: null }, //for negative values
    marks: [
      Plot.ruleX([0], { stroke: "#ccc" }), // baseline
      Plot.barX([value], {
        x: d => d,
        y: 0,
        // height: 20,
        fill: color
      }),
      // Plot.text([value], {
      //   x: d => d < 0 ? d - 1 : d + 1,
      //   // y: 0.5,
      //   text: d => d.toFixed(0),
      //   fill: "#333",
      //   dy: "0.35em",
      //   textAnchor: d => d < 0 ? "end" : "start",
      //   style: "font-size: 1rem"
      // })
    ]
  });

  return plot.outerHTML;
}


// let allLADs = data.allLAD;

let isLoading = true;

$: {
    isLoading = !data;
}

let showDropdown = false;



  onMount(() => {
    const heroHeight = heroEl.getBoundingClientRect().height;
    renderWaffle(heroHeight);
    startWaffleHighlightLoop(heroHeight);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<nav class="navbar">
    <div class="nav-left">
      <img src="{base}/logo.png" alt="Logo" class="logo" />
    </div>
  
    <div class="nav-right">
      <a href="{base}/" class:active={$page.url.pathname === `${base}`}>Home</a>
  
      <div
        class="dropdown"
        on:mouseenter={() => (showDropdown = true)}
        on:mouseleave={() => (showDropdown = false)}
      >
        <span
          class="dropdown-label"
          class:active={$page.url.pathname.startsWith(`${base}/cobenefit`)}
        >
          Co-benefits
        </span>
        {#if showDropdown}
          <ul class="dropdown-menu">
            {#each COBENEFS as coBenef}
              <li><a href="{base}/cobenefit?cobenefit={coBenef}">{coBenef}</a></li>
            {/each}
          </ul>
        {/if}
      </div>
  
      <a href="{base}/map" class:active={$page.url.pathname === `${base}/map`}>Map</a>
      <a href="{base}/methods" class:active={$page.url.pathname === `${base}/methods`}>Methods</a>
      <a href="{base}/about" class:active={$page.url.pathname === `${base}/about`}>About</a>
    </div>
  </nav>

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
        <!-- <p class="hero-stats">
          We model <span class="big-bold">11</span> 
          <a href="" target="_blank" rel="noopener" class="link-underline">co-benefits</a> 
          in <span class="big-bold">317</span> 
          <a href="" target="_blank" rel="noopener" class="link-underline">local authorities</a> 
          on the data zone level across the UK.
        </p> -->
      </div>
  
      <!-- <div class="hero-fact-box" transition:fade>
        <p>
          If we reach NetZero in 2050,<br />
          average UK household will benefit<br />
          about an equivalent of
        </p>
        <span class="big-bold">{slides[currentIndex].value}</span>
        <p>{slides[currentIndex].source}</p>
      </div> -->
  
      <!-- <a href="{base}/map" class="hero-map-button">Explore Map</a>
    </div> -->

    <!-- <div bind:this={waffleEl} class="waffle-overlay"></div> -->
    <!-- <div class="waffle-label" bind:this={waffleLabelEl}></div> -->

    <div class="waffle-overlay">
      <div class="waffle-label" bind:this={waffleLabelEl}>
        National gain of <br>
        <strong style="font-size: 1.2rem">{activeTypeLabel}</strong> <br>
        in reaching NetZero <br>
        by 2050 is: <br>
        <strong style="font-size: 1.2rem">{activeValueLabel}</strong>
      </div>
      
      <div class="waffle-bg" bind:this={waffleBgEl}></div>
      <div bind:this={waffleEl}></div>
  </div>
  </section>


  <section class="side-by-side-section">
    <div class="side-box">
      <h2>Explore by Local Authority</h2>
      <input type="text" placeholder="Search local authorities..." class="search-input" />
  
      <table class="data-table">
        <thead>
          <tr>
            <th style="max-width: 200px;">Name</th>
            <th>Value</th>
            <th>Per Capita</th>
          </tr>
        </thead>
        <tbody>
          {#each topLADsData as LAD, index}
            <tr>
              <td>
                <a href="{base}/location?location={LAD.LAD}">{LAD.name}</a>
              </td>
              <td>
                <div class="bar-cell">
                  {@html makeLADBarSVG(LAD.total, maxLADValue)}
                  <span>{LAD.total.toFixed(1)}</span>
                </div>
              </td>
              <td>000</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  
    <div class="side-box">
      <h2>Explore by Co-Benefit</h2>
  
      <table class="data-table">
        <thead>
          <tr>
            <th style="max-width: 200px;">Name</th>
            <th>Value</th>
            <th>Per Capita</th>
          </tr>
        </thead>
        <tbody>
          {#each aggregationPerBenefit as coBenef, index}
            <tr>
              <td>
                <a href="{base}/cobenefit?cobenefit={coBenef.co_benefit_type}">{coBenef.co_benefit_type}</a>
              </td>
              <td>
                <div class="bar-cell">
                  {@html makeCoBenefBarSVG(coBenef.total, minCoBenefValue, maxCoBenefValue, coBenef.co_benefit_type)}
                  <span>{coBenef.total.toFixed(1)}</span>
                </div>
              </td>
              <td>000</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
  
  

<main>

    <!-- Spinner -->
    {#if isLoading}
        <div class="spinner">
            GGGGGGGGG
            GGGGGGGGG
            GGGGGGGGG
            GGGGGGGGG
            GGGGGGGGG
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

    .navbar {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    /* align-items: center; */
    height: 80px;
    background-color: #fff;
    z-index: 1000;
    padding-bottom: 4px;
    border-bottom: 1px solid #ddd;
  }

  .nav-left {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .logo {
    height: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .nav-right {
    display: flex;
    gap: 2rem;
    align-items: flex-end; 
    padding-bottom: 0.4rem; 
    margin-right: 2rem;
  }

  .dropdown {
    position: relative;
    display: inline-flex; 
    align-items: flex-end; 
    height: 100%;
    }

  .nav-right a,
  .dropdown-label {
    display: inline-block;
    text-decoration: none;
    color: #333;
    cursor: pointer;
    font-weight: 500;
    position: relative;
    padding-bottom: 4px;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
  }

  .nav-right a:hover{
    color: #0077cc;
    border-bottom: 3px solid #0077cc;
  }

  .nav-right a.active {
    color: #0077cc;
    border-bottom: 3px solid #0077cc;
  }


  .dropdown-label:hover {
    color: #0077cc;
    /* border-bottom: 3px solid #0077cc; */
  }

  .dropdown-label.active {
    color: #0077cc;
    /* border-bottom: 3px solid #0077cc; */
  }

  .dropdown {
    position: relative;
  }

  .dropdown-menu {
    min-width: 180px;
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 220px;
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    list-style: none;
    padding: 0.5rem 0;
    margin: 0;
    z-index: 1001;
  }

  .dropdown-menu li {
    padding: 0.25rem 1rem;
  }

  .dropdown-menu li a {
    color: #333;
    text-decoration: none;
  }

  .dropdown-menu li a:hover {
    color: #0077cc;
  }

  @media (max-width: 768px) {
    .navbar {
      flex-direction: column;
      align-items: stretch;
      height: auto;
    }

    .nav-right {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.5rem 0;
    }

    .dropdown-menu {
      position: static;
      box-shadow: none;
      border: none;
    }
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

.hero-stats {
  font-size: 1rem;
  line-height: 1.6;
}

.big-bold {
  font-size: 1.5rem;
  font-weight: 700;
  /* color: #fff; */
}

.link-underline {
  text-decoration: underline;
  color: black;
  font-weight: 500;
}

.link-underline:hover {
  color: #0077cc;
}


.hero-fact-box {
  position: absolute;
  top: 5rem;
  right: 3rem;
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
  padding: 1rem 1.25rem;
  /* border-radius: 8px; */
  max-width: 260px;
  font-size: 0.95rem;
  line-height: 1.4;
  z-index: 2;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.hero-map-button {
  position: absolute;
  bottom: 2rem;
  right: 3rem;
  background-color: rgba(0, 0, 0, 0.2);
  color: #000;
  padding: 0.75rem 1.25rem;
  /* border-radius: 6px; */
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
  transition: background-color 0.2s ease, transform 0.2s ease;
  z-index: 2;
}

.hero-map-button:hover {
  text-decoration: underline;
}


.hero-container {
  position: relative;
  height: 70vh;
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

.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 1rem;
}


.side-by-side-section {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.data-table {
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
  font-family: "Roboto", sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.87);
}

.data-table thead {
  background-color: #f5f5f5;
}

.data-table th,
.data-table td {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(224, 224, 224, 1);
  text-align: left;
  vertical-align: middle;
  background-color: #fff;
}

.data-table th {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.data-table th:first-child,
.data-table td:first-child {
  max-width: 180px;
  width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table tr:hover {
  background-color: rgba(0, 0, 0, 0.04); 
}

.data-table a {
  background-color: #fff;
  padding: 0.75rem 0rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: default;
}

.data-table a:hover {
  color: #0077cc;
  cursor: pointer;
}



</style>