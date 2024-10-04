<script lang="ts">
    import * as d3 from 'd3';
    import {onMount} from "svelte";
    import * as Plot from "@observablehq/plot";

    import {globalMeasures, S1Data, S2Data, S3Data, S4Data, S5Data} from '../data.page.ts';


    let element: HTMLElement
    let plot: HTMLElement

    export let variableX: string;
    export let variableY: string;
    export let showAxes: boolean = false;
    export let scenario: number;


    let height = 160;

    let data: Array<object>;
    if (scenario == 1) {
        data = S1Data;
    } else if (scenario == 2) {
        data = S2Data;
    } else if (scenario == 3) {
        data = S3Data;
    } else if (scenario == 4) {
        data = S4Data;
    } else if (scenario == 5) {
        data = S5Data;
    }


    $: {
        if (variableX) {
            plot?.firstChild?.remove(); // remove old chart, if any

            // add the new chart
            plot?.append(
                Plot.plot({
                    height: height,
                    marginLeft: 170,
                    marginBottom: 50,
                    marginTop: 30,
                    y: {grid: true, axis: showAxes},
                    x: {grid: true, axis: showAxes},
                    style: {fontSize: "22px"},
                    color: {legend: true},
                    marks: [
                        Plot.barX(data, Plot.binX({x: "sum"}, {y: variableX, x: variableY, thresholds: 2})),
                    ]
                })
            );
        }
    }


</script>

<div id="main" bind:this={element}>
    <div class="plot" bind:this={plot}>
    </div>
</div>

<style>
</style>
