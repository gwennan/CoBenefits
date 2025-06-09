<script>
    import { base } from '$app/paths';
    import * as Plot from "@observablehq/plot";

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let ladData = [];
    export let region;
    export let sortBy;
    export let maxLADValue;
    export let maxHHLADValue;
    export let LADToName = {};
    export let viewMode = 'total';
  
    export let selectedRegion = 'All';
    const regions = [
        { label: 'All', value: 'All' },
        { label: 'England', value: 'England' },
        { label: 'Wales', value: 'Wales' },
        { label: 'Scotland', value: 'Scotland' },
        { label: 'Northern Ireland', value: 'NI' }
      ];

    function updateRegion(e) {
      dispatch('filterChange', {
        region: e.target.value,
        sortBy
      });
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
          })
        ]
      });
      return plot.outerHTML;
    }

    function makeHHLADBarSVG(value, max) {
      const plot = Plot.plot({
        width: 80,
        height: 20,
        margin: 0,
        x: { domain: [0, max], axis: null },
        marks: [
          Plot.barX([value], {
            x: d => d,
            y: 0,
            fill: "#ccc"
          })
        ]
      });
      return plot.outerHTML;
    }

  </script>
  
  <div class="controls">
    <label>Nation:</label>
    <select bind:value={region} on:change={updateRegion}>
      {#each regions as r}
        <option value={r.value}>{r.label}</option>
      {/each}
    </select>

    <div class="button-group">
      <button
        class:selected={sortBy === 'total'}
        on:click={() =>dispatch('filterChange', { region, sortBy: 'total' })}>
        Total
      </button>
    
      <button
        class:selected={sortBy === 'per_capita'}
        on:click={() =>dispatch('filterChange', { region, sortBy: 'per_capita' })}>
        Per Capita
      </button>
    </div>
    
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th>Name <span style="font-weight:300; color: #545454">(Top 12 in display)</span></th>
        <th style="width: 120px;">{sortBy === 'total' ? 'Total' : 'Per Capita'}</th>
        <th style="width: 80px;">{sortBy === 'total' ? '£, billion' : '£'}</th>
      </tr>
    </thead>
    <tbody>
      {#each ladData as LAD}
        <tr>
          <td><a href="{base}/location?location={LAD.LAD}" target="_blank">{LADToName[LAD.LAD] ?? LAD.LAD}</a></td>
          <td>
            <div class="bar-cell">
              {@html sortBy === 'total'
                ? makeLADBarSVG(LAD.total_value, maxLADValue)
                : makeHHLADBarSVG(LAD.value_per_capita, maxHHLADValue)
              }
            </div>
          </td>
          <td>
            {#if sortBy === 'total'}
              <span>{LAD.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {:else}
              <!-- <span>{LAD.value_per_capita.toFixed(2).toLocaleString('en-US')}</span> -->
              <span>{LAD.value_per_capita.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            {/if}
          </td> 
        </tr>
      {/each}
    </tbody>
  </table>
  