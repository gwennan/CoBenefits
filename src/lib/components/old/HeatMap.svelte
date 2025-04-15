<script lang="ts">
    import * as d3 from 'd3';
    import {onMount} from "svelte";

    import {dataPage} from '../../data.page.ts';

    const columns = Object.keys(dataPage[0]);
    const columnsToPlot = columns.filter(c => !["Datazone", "Total", "", " "].includes(c))

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    const margin = 20;

    const width = 800;
    const height = dataPage.length + margin * 2;

    // Build X scales and axis:
    const xScale = d3.scaleBand()
        .range([margin, width - margin])
        .domain(columns)
        .padding(0.01);

    const yScale = d3.scaleBand()
        .range([margin, height - margin])
        .domain(d3.range(dataPage.length))
        .padding(0.01);

    const costColorScale = d3.scaleDiverging()
        .domain([-5000, 0, 5000])
        // .interpolator(d3.interpolatePuOr)
        .interpolator(d3.interpolateBrBG)




    function render(canvas) {
        if (!canvas) return;

        ctx = canvas.getContext('2d');


        renderAxis();
        let i = 0;
        for (let d of dataPage) {
            for (let col of columnsToPlot) {

                const x = xScale(col);
                const y = yScale(i + 1);

                let value = d[col];
                ctx.fillStyle = costColorScale(value);
                ctx.fillRect(x,y,xScale.bandwidth() - 2,1);
            }

            // if (i > 0) break;
            i++;
        }
    }

    function renderAxis() {
        for (let col of columnsToPlot) {
            ctx.fillText(col, xScale(col), 10);
        }
    }

    $: {
        render(canvas);
    }


</script>

<div>
    <canvas width="{width}" height="{height}" bind:this={canvas}>
    </canvas>
</div>

<style>
    canvas {
        grid-area: auto;
    }
</style>
