<script lang="ts">

    import * as d3 from 'd3';
    import {feature} from 'topojson';
    import {onMount} from "svelte";
    import {rewind} from "@turf/turf";

    import {areaIDtoData, data, UKZones, zones} from '../data.ts';

    const columns = Object.keys(data[0]);

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let transform = d3.zoomIdentity


    const width = 800;
    const height = 1200;


    // TODO: use https://observablehq.com/@jwolondon/gridmap-allocation


    const projection = d3.geoMercator()
        .scale(4500)
        .translate([width / 2, height / 2])
        .center([-0.118092, 51.509865])


    let [min, max] = d3.extent(data.map(d => d.Total));
    const costColorScale = d3.scaleDiverging()
        // .domain([-5000, 0, 5000])
        .domain([-max, 0, max])
        // .interpolator(d3.interpolatePuOr)
        .interpolator(d3.interpolateBrBG)

    onMount(() => {
        d3.select(canvas).call(d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", ({transform}) => render(canvas, transform)));
    })

    function render(canvas: HTMLElement, transform: d3.ZoomTransform) {
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        const path = d3.geoPath(projection, ctx);

        ctx.save();

        ctx.clearRect(0, 0, width, height);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        ctx.lineWidth = 0.1;
        ctx.strokeStyle = "grey";

        ctx.beginPath();
        for (let feature of zones.features) {
            // feature.geometry = rewind(feature.geometry, {reverse:true});

            // let areaID = feature.properties.OA21CD;
            let areaID = feature.properties.LSOA21CD;

            let data = areaIDtoData[areaID];
            let totalCost = data.Total;

            console.log(feature)
            console.log(getCentroid(feature))

            break;

            // ctx.beginPath();
            // path(feature);
            // ctx.fillStyle = costColorScale(totalCost);
            // ctx.fill();
        }

        ctx.restore();
    }

    $: {
        render(canvas, transform);
    }


    function getCentroid(feat) {
        if (feat.geometry.type === "MultiPolygon") {
            const maxPoly = ([aMax, coords], cs) => {
                const area = d3.polygonArea(cs.flat());
                return area > aMax ? [area, cs] : [aMax, coords];
            };
            const [area, coords] = feat.geometry.coordinates.reduce(maxPoly, [0, []]);
            return d3.polygonCentroid(coords.flat());
        } else {
            return d3.polygonCentroid(feat.geometry.coordinates.flat());
        }
    }

    async function pointsToGrid(pts, nRows, nCols, compactness = 1, spacers = []) {
        const grid = gridLocations(nRows, nCols, spacers);
        if (pts.length > grid.cells.length) {
            console.log(
                "Cannot allocate " +
                pts.length +
                " points to a grid with only " +
                grid.cells.length +
                " cells."
            );
            return {nRows: nRows, nCols: nCols, cells: null};
        }

        const solution = await solveLP(pts, grid, compactness);
        const gPos = Object.entries(solution.vars)
            .filter((v) => v[1] === 1) // Select true variables
            .map((v) => Number(v[0].slice(1))) // The x-number corresponds to grid allocation.
            .sort((a, b) => a - b); // Keep grid positions in original point order
        return {
            nRows: nRows,
            nCols: nCols,
            cells: gPos.map((v) => grid.cells[v % gPos.length])
        };
    }

    function gridLocations(nRows, nCols, spacers = []) {
        const isSpacer = (r, c) => {
            let matched = false;
            spacers.forEach(([sr, sc]) => {
                if (sr === r && sc === c) matched = true;
            });
            return matched;
        };

        const grd = [];
        for (let row = 0; row < nRows; row++) {
            for (let col = 0; col < nCols; col++) {
                if (!isSpacer(nRows - 1 - row, col)) {
                    grd.push([row, col]);
                }
            }
        }
        return {nRows: nRows, nCols: nCols, cells: grd};
    }

    function objective(pts, grd, compactness = 1) {
        // Scale points to unit square
        const xDomain = d3.extent(pts.map((p) => p[0]));
        const yDomain = d3.extent(pts.map((p) => p[1]));

        // Scale to rectangle centred at middle of gird.
        // Size of grid inversely proportional to compactness
        const cc = (grd.nCols - 1) / 2;
        const cr = (grd.nRows - 1) / 2;
        const rWidth = (1 / (compactness + 0.001) - 1) * (grd.nCols - 1) + 1;
        const rHeight = (1 / (compactness + 0.001) - 1) * (grd.nRows - 1) + 1;

        const xNorm = d3
            .scaleLinear()
            .domain(xDomain)
            .range([cc - rWidth / 2, cc + rWidth / 2]);
        const yNorm = d3
            .scaleLinear()
            .domain(yDomain)
            .range([cc - rHeight / 2, cc + rHeight / 2]);
        const ptsNorm = pts.map(([x, y]) => [xNorm(x), yNorm(y)]);

        // This is how costly it is to move from point (x,y) to grid position (r,c)
        const cost = ([x, y], [r, c]) => (x - c) * (x - c) + (y - r) * (y - r);

        // Build the expression from the coefficients
        const vars = [];
        let i = 0;
        const n = grd.cells.length;

        for (let a = 0; a < n; a++) {
            for (let b = 0; b < n; b++) {
                if (a < pts.length) {
                    const coeff = cost(ptsNorm[a], grd.cells[b]);
                    if (coeff != 0) {
                        vars.push((coeff === 1 ? "" : coeff) + "x" + i);
                    }
                }
                i++;
            }
        }
        return vars.join("+");
    }


    function pointToOneCell(n) {
        const constraint = (a) =>
            Array.from(Array(n))
                .map((_, i) => "x" + (a + i))
                .join(" + ") + " == 1";
        return Array.from(Array(n)).map((_, i) => constraint(i * n));
    }

    function cellMaxOnePoint(n) {
        const constraint = (a) =>
            Array.from(Array(n))
                .map((_, i) => "x" + (a + i * n))
                .join(" + ") + " <= 1";
        return Array.from(Array(n)).map((_, i) => constraint(i));
    }


    function solveLP(pts, grid, compactness) {
        const n = grid.cells.length;
        const lp = mip().objective(Math.min, objective(pts, grid, compactness));
        pointToOneCell(n).forEach((expr) => lp.subjectTo(expr));
        cellMaxOnePoint(n).forEach((expr) => lp.subjectTo(expr));
        vars(n).forEach((expr) => lp.var(expr, Boolean));
        return lp.solve();
    }

    function vars(n) {
        return Array.from(Array(n * n)).map((_, i) => "x" + i);
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