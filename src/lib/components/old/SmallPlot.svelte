<script lang="ts">
    import * as d3 from 'd3';
    import {onMount} from "svelte";
    import * as Plot from "@observablehq/plot";

    import {globalMeasures, S1Data, S2Data, S3Data, S4Data, S5Data} from '../../data.page.ts';


    let element: HTMLElement
    let plot: HTMLElement

    export let variableX: string;
    export let variableY: string;
    export let showAxes: boolean = false;
    export let scenario: number;


    let height = 210;

    let data;
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

    // showAxes = true;


    // TODO: compute extent of variables
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
                    // y: {grid: true, axis: showAxes, domain: [0, 10_000_000]},
                    y: {grid: true, axis: showAxes},
                    // x: {grid: true, axis: showAxes},
                    x: {grid: true, axis: showAxes, domain: [0, 11_000_000]},
                    style: {fontSize: "22px"},
                    color: {legend: true},
                    marks: [
                        // Plot.rectY(data, Plot.binX({y: "mean"}, {x: {value: variableX, thresholds: 10}, y: variableY})),
                        Plot.rectX(data, Plot.binY({x: "mean"}, {y: {value: variableX, thresholds: 10}, x: variableY})),

                        // Plot.barY(
                        //     S1Data, Plot.groupX(
                        //         {y: "sum"}, // Use "sum" instead of "count"
                        //         {
                        //             x: (d) => Math.floor(d[variableX] / 1000) * 1000,  // Group income into bins of size 2
                        //             y: variableY,  // Sum the cobenef values
                        //             tip: true,
                        //         },
                        //     ),
                        // )
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
    #main {
        /*background: beige;*/
        /*max-width: 20px;*/
        /*max-height: 10px;*/
    }
</style>
