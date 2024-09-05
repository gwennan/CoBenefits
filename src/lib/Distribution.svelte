<script lang="ts">
    import * as d3 from 'd3';
    import {onMount} from "svelte";
    import * as Plot from "@observablehq/plot";


    import {globalMeasures} from '../data.ts';


    let element: HTMLElement
    let plot: HTMLElement

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;


    // export let distribData;
    export let variable;


    // onMount(() => {
    //     console.log(element.getBoundingClientRect());
    // })


    $: {

        if (variable) {
            plot?.firstChild?.remove(); // remove old chart, if any

            // add the new chart
            plot?.append(
                Plot.plot({
                    style: {fontSize: "16px"},
                    marginLeft: 75,
                    marginBottom: 75,
                    marginTop: 40,
                    y: {grid: true},
                    x: {inset: 8, labelOffset: 45},
                    color: {legend: true},
                    marks: [
                        Plot.rectY(globalMeasures, Plot.binX({y: "count"}, {x: variable})),
                        Plot.ruleY([0])
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
