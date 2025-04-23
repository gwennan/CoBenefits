<script>
    import { base } from '$app/paths';
    import * as Plot from "@observablehq/plot";

    export let aggregationPerHouseholdPerBenefit;
    export let minCoBenefValue;
    export let maxCoBenefValue;
    export let minHHCoBenefValue;
    export let maxHHCoBenefValue;
    export let COBENEFS_SCALE;

  
    let viewMode = 'total';

    // bars for coben table
    function makeCoBenefBarSVG(value, minAbs, maxAbs, coBenefType, colorScale) {
    const color = colorScale(coBenefType);

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
            fill: color
        })
        ]
    });
    return plot.outerHTML;
    }
</script>
  

<div class="controls">
    <div class="button-group">
        <button
          class:selected={viewMode === 'total'}
          on:click={() => viewMode = 'total'}>
          Total
        </button>
      
        <button
          class:selected={viewMode === 'per_household'}
          on:click={() => viewMode = 'per_household'}>
          Per Household
        </button>
    </div>
</div>

<table class="data-table">
    <thead>
        <tr>
            <th>Name</th>
            <th style="width: 150px;">{viewMode === 'total' ? 'Total' : 'Per Household'}</th>
            <th style="width: 80px;">{viewMode === 'total' ? '£billion' : '£thousand'}</th>
        </tr>
    </thead>
    <tbody>
    {#each aggregationPerHouseholdPerBenefit as coBenef}
        <tr>
        <td>
            <a href="{base}/cobenefit?cobenefit={coBenef.co_benefit_type}">
            {coBenef.co_benefit_type}</a>
        </td>
        <td>
            <div class="bar-cell">
              {#key viewMode}
                {@html viewMode === 'total'
                  ? makeCoBenefBarSVG(coBenef.total_value, minCoBenefValue, maxCoBenefValue, coBenef.co_benefit_type, COBENEFS_SCALE)
                  : makeCoBenefBarSVG(coBenef.value_per_household, minHHCoBenefValue, maxHHCoBenefValue, coBenef.co_benefit_type, COBENEFS_SCALE)
                }
              {/key}
            </div>
        </td>
        <td>
            {#if viewMode === 'total'}
                <span>{coBenef.total_value.toFixed(1)}</span>
            {:else}
                <span>{coBenef.value_per_household.toFixed(1)}</span>
            {/if}
        </td>
        </tr>
    {/each}
    </tbody>
</table>