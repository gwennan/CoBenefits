<script lang="ts">
    import * as d3 from 'd3';
    import {onMount} from "svelte";
    import * as Plot from "@observablehq/plot";

    import {globalMeasures, S1Data, S2Data, S3Data, S4Data, S5Data} from '../data.page.ts';


    let element: HTMLElement
    let plot: HTMLElement

    // export let variableX: string;
    // export let variableY: string;


    let height = 230;

    const data = S1Data.concat(S2Data).concat(S3Data).concat(S4Data).concat(S5Data);


    console.log(121212, data)


    $: {
        plot?.firstChild?.remove(); // remove old chart, if any


        // plot?.append(
        //     Plot.plot({
        //         y: {
        //             grid: true,
        //             // label: "↑ Price"
        //         },
        //         fx: {
        //             // interval: 0.5,
        //             // label: "Carats →",
        //             // labelAnchor: "right",
        //             // tickFormat: (x) => x.toFixed(1)
        //         },
        //         marks: [
        //             // Plot.ruleY([0]),
        //             // Plot.boxY(data, {fx: "scenario", y: "Total"})
        //             Plot.boxX(data, {fy: "scenario", x: "Total"})
        //         ]
        //     })
        // )


        console.log(22, Plot.group())

            plot?.append(
                Plot.plot({
                    height: height,
                    marginLeft: 170,
                    marginBottom: 50,
                    marginTop: 30,
                    y: {grid: true, axis: true},
                    x: {grid: true, axis: true},
                    style: {fontSize: "22px"},
                    color: {legend: true},
                    marks: [
                        Plot.rectY(data, Plot.binX({y: "deviation"}, {x: {value: "Median.Income", thresholds: 10}, y: "Total"})),
                        // Plot.rectY(data, Plot.binX({y: "mean"}, {x: variableX, y: variableY})),
                        // Plot.rectX(data, Plot.binY({x: "sum"}, {y: {value: variableX, thresholds: 10}, x: variableY})),
                    ]
                })
            )
    }


</script>

<div id="main" bind:this={element}>
    <div class="plot" bind:this={plot}>
    </div>
</div>

<style>

</style>
