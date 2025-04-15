<script lang="ts">

    import * as d3 from 'd3';
    // import {feature} from 'topojson-client';
    import {onMount} from "svelte";
    // import {rewind} from "@turf/turf";

    // import {areaIDtoData, dataPage, UKZones, zones} from '../data.page.ts';

    // const columns = Object.keys(dataPage[0]);


    export let mapData;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let transform = d3.zoomIdentity

    console.log(23, mapData);



    const width = 800;
    const height = 1200;


    const projection = d3.geoMercator()
        .scale(4500)
        .translate([width / 2, height / 2])
        .center([-0.118092, 51.509865])


    // let [min, max] = d3.extent(dataPage.map(d => d.Total));
    // const costColorScale = d3.scaleDiverging()
    //     .domain([-max, 0, max])
    //     // .interpolator(d3.interpolatePuOr)
    //     .interpolator(d3.interpolateBrBG)

    onMount(() => {
         d3.select(canvas).call(d3.zoom()
          .scaleExtent([1, 8])
          .on("zoom", ({transform}) => render(canvas, transform)));
    })

    // console.log(23, turf);
    function render(canvas: HTMLCanvasElement, transform: d3.ZoomTransform) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const path = d3.geoPath(projection, ctx);

        ctx.save();
        
        ctx.clearRect(0, 0, width, height);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        ctx.lineWidth = 0.1;
        ctx.strokeStyle = "grey";

        let i = 0;
        ctx.beginPath();
        for (let feature of zones.features) {
            // i += 1;

            // feature.geometry = rewind(feature.geometry, {reverse:true});

            // let areaID = feature.properties.OA21CD;
            let areaID = feature.properties.LSOA21CD;

            // let data = areaIDtoData[areaID];
            // let totalCost = data.Total;

            ctx.beginPath();
            path(feature);
            // ctx.fillStyle = costColorScale(totalCost);
            // ctx.strokeStyle = costColorScale(totalCost);
            // ctx.stroke();
            ctx.fill();
        }

        console.log("END RENDER")
        ctx.restore();
    }

    $: {
        render(canvas, transform);
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