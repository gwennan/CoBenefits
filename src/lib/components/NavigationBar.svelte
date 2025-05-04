<script>
import {base} from "$app/paths";
import { page } from '$app/stores';
import { derived } from 'svelte/store';

import { onMount, onDestroy } from 'svelte';
import { fade } from 'svelte/transition';

import {COBENEFS} from "../../globals";

let showDropdown = false;

// console.log("links", $page.url.pathname);

</script>


<nav class="navbar">
    <div class="nav-left">
      <img src="{base}/atlas-logos/logo-black-small.png" alt="Logo" class="logo" />
    </div>

    <div class="nav-center">
      <div class="dropdown nav-item"
          on:mouseenter={() => (showDropdown = true)}
          on:mouseleave={() => (showDropdown = false)}
      >
        <div class="nav-count">17</div>
        <span
          class="dropdown-label"
          class:active={$page.url.pathname.startsWith(`${base}/cobenefit`)}
        >
          Co-Benefits
        </span>
        {#if showDropdown}
          <ul class="dropdown-menu">
            {#each COBENEFS as coBenef}
              <li>
                <a href="{base}/cobenefit?cobenefit={coBenef.id}" data-sveltekit-reload>
                  {coBenef.label}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="nav-item">
        <div class="nav-count">317</div>
        <a href="{base}/lad" class:active={$page.url.pathname === `${base}/lad`}>Local Authorities</a>
      </div>

      <div class="nav-item inactive">
        <div class="nav-count">17</div>
        <!-- <a>Households</a> -->
        <a>Factors</a>
      </div>

      <div class="nav-item">
        <div class="nav-count">46,000</div>
        <!-- <a href="{base}/map" class:active={$page.url.pathname === `${base}/map`}>Map</a> -->
        <a href="{base}/map" class:active={$page.url.pathname === `${base}/map`}>Data Zones</a>
      </div>
    </div>

    <div class="nav-right">
      <a href="{base}/" class="nav-item" class:active={$page.url.pathname === `${base}`}>Home</a>
      <a href="{base}/methods" class="nav-item" class:active={$page.url.pathname === `${base}/methods`}>Methods</a>
      <a href="{base}/about" class="nav-item" class:active={$page.url.pathname === `${base}/about`}>About</a>
    </div>
  </nav>


<style>

  .navbar {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    height: 65px;
    background-color: #fff;
    z-index: 1000;
    padding-bottom: 4px;
    border-bottom: 1px solid #ddd;
  }

  /* .nav-left {
    height: 100%;
    display: flex;
    align-items: center;
  } */

  .nav-left,
  .nav-center,
  .nav-right {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-left {
    flex: 1;
    max-width: 350px;
  }

  .nav-center {
    flex: 2;
    justify-content: center;
  }

  .nav-right {
    flex: 1;
    justify-content: flex-end;
  }

  .logo {
    height: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* .nav-right {
    display: flex;
    gap: 2rem;
    align-items: flex-end;
    padding-bottom: 0.4rem;
    margin-right: 2rem;
  } */

  .nav-item {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .nav-item.inactive a {
    cursor: not-allowed;
  }

  .nav-item.inactive a:hover {
    color: #999;
    border-bottom: 3px solid transparent;
  }


  .nav-count {
  font-size: 1.3em;
  color: #555;
  margin-bottom: 2px;
  line-height: 1;
  text-align: center;
  width: 100%;
  font-weight: 700;
}

  .dropdown {
    position: relative;
    display: block;
    padding-bottom: 0;
    margin-bottom: 0;
  }


  .nav-right a,
  .nav-center a,
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
    /* text-decoration: underline; */
  }

  .nav-center a:hover,
  .dropdown-label:hover,
  .nav-right a:hover{
    color: #0077cc;
    border-bottom: 3px solid #0077cc;
  }

  .nav-right a.active,
  .nav-center a.active,
  .dropdown-label.active {
    color: #0077cc;
    border-bottom: 3px solid #0077cc;
  }


  .dropdown {
    position: relative;
    align-items: center;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .dropdown-menu {
    min-width: 180px;
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 220px;
    background: white;
    border: 1px solid #636363;
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

    .nav-left,
    .nav-center,
    .nav-right {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.5rem 0;
      /* min-width: 0 */
    }

    .dropdown-menu {
      position: static;
      box-shadow: none;
      border: none;
    }
}

</style>