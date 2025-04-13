<script>
import { base } from '$app/paths';
import {COBENEFS} from "../globals";
import { page } from '$app/stores';
import { derived } from 'svelte/store';

import { onMount, onDestroy } from 'svelte';
import { fade } from 'svelte/transition';


export let data;

// let allLADs = data.allLAD;

let isLoading = true;

$: {
    console.log(12121, data)
    isLoading = !data;
}

let showDropdown = false;

// current path to determine active tab
const currentPath = derived(page, ($page) => $page.url.pathname);

// Helper to apply active class
const getActive = (path, exact = true) => $currentPath =>
  exact ? ($currentPath === path) : $currentPath.startsWith(path);


const slides = [
{
    image: '/hero1.png',
    value: '£100',
    source: 'from the total co-benefits.'
},
{
    image: '/hero2.png',
    value: '£10',
    source: 'from improving air quality.'
},
{
    image: '/hero3.png',
    value: '£70',
    source: 'from reducing access cold.'
}
];

  let currentIndex = 0;
  let previousIndex = 0;
  let interval;

  onMount(() => {
    interval = setInterval(() => {
      previousIndex = currentIndex;
      currentIndex = (currentIndex + 1) % slides.length;
    }, 6000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<!-- <h1>Welcome to the Cobenefit Atlas!</h1> -->

<nav class="navbar">
    <div class="nav-left">
      <img src="{base}/logo.png" alt="Logo" class="logo" />
    </div>
  
    <div class="nav-right">
      <a href="{base}" class:active={$page.url.pathname === `${base}`}>Home</a>
  
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

  <section class="hero-container">
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
        <h1 class="hero-title">UK’s Co-Benefits towards Reaching NetZero</h1>
        <p class="hero-description">
            CO-BENS develops methodologies and models to understand how climate action complements and conflicts with the wider set of economic, environmental and social challenges we are facing.
        </p>
        <p class="hero-stats">
          We model <span class="big-bold">11</span> 
          <a href="https://example.com/cobenefits" target="_blank" rel="noopener" class="link-underline">co-benefits</a> 
          in <span class="big-bold">317</span> 
          <a href="https://example.com/local-authorities" target="_blank" rel="noopener" class="link-underline">local authorities</a> 
          on the data zone level across the UK.
        </p>
      </div>
  
      <div class="hero-fact-box" transition:fade>
        <p>
          If we reach NetZero in 2050,<br />
          average UK household will benefit<br />
          about an equivalent of
        </p>
        <span class="big-bold">{slides[currentIndex].value}</span>
        <p>{slides[currentIndex].source}</p>
      </div>
  
      <a href="{base}/map" class="hero-map-button">Explore Map</a>
    </div>
  </section>


  <section class="side-by-side-section">
    <div class="side-box">
      <h2>Explore by Local Authority</h2>
      <input type="text" placeholder="Search local authorities..." class="search-input" />
  
      <div class="list">
        <div class="list-item">Arberdeen</div>
       <div class="list-item">City of Edinburgh</div>
       <div class="list-item">West Highland</div>
       <div class="list-item">Glasgow</div> 
      </div>
    </div>
  
    <div class="side-box">
      <h2>Explore by Co-Benefit</h2>
  
      <div class="list">
        <div class="list-item">Air Quality</div>
      <div class="list-item">Physical Activity</div>
      <div class="list-item">Noise Reduction</div>
      <div class="list-item">Carbon Reduction</div>
      </div>
    </div>
  </section>
  
  

<!--<div>-->
<!--        <h1> Glossary</h1>-->
<!--</div>-->

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

    <!-- <div>
        <a href="{base}/overview">Overview</a>
    </div>

    <div>
        <a href="{base}/map">Map Application</a>
    </div> -->

    <!-- <div>
        Report pages by Co-Benefit

        <ul>
            {#each COBENEFS as coBenef}

                <li>
                    <a href="{base}/cobenefit?cobenefit={coBenef}">{coBenef}</a>
                </li>

            {/each}
        </ul>
    </div> -->

    <!-- <div> -->
        <!-- Report pages by Local District -->

<!--        <ul>-->
<!--            {#each allLADs as LAD}-->
<!--                <li>-->
<!--                    <a href="{base}/location?location={LAD}" > {LAD} </a>-->
<!--                </li>-->
<!--            {/each}-->
<!--        </ul>-->

    <!-- </div> -->
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
  max-width: 600px;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 3rem;
  line-height: 3rem;
}

.hero-description {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.2rem;
  max-width: 450px;
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
  height: 60vh;
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

.side-by-side-section {
  display: flex;
  gap: 2rem;
  padding: 2rem 3rem;
  justify-content: space-between;
}

.side-box {
  flex: 1;
  background-color: #f0f0f0;
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

.list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  background-color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  cursor: default;
}

</style>