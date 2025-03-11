import { json } from 'd3';

import * as topojson from "topojson-client";

// import {areaIDtoData, dataPage, UKZones, zones} from '../data.page.ts';

// import {rewind} from "@turf/turf";
// import {joinArrays} from "$lib/utils.ts";
import {getAllLAD, getTableData, initDB} from "$lib/duckdb";


// const zonesPath = '/maps/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824.geojson';
// topojson
// const zonesPath = '/maps/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824.json';
const zonesPath = 'maps/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824.json';


export async function load() {
    const zones = await json(zonesPath, (d) => {
        return d;
    })

    const UKZones = topojson.feature(zones, zones.objects["Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824"]);
    await initDB();

    // let allLAD = await getTableData(getAllLAD());
    // allLAD = allLAD.map(d => d.LAD);
    // console.log("fewfef", allLAD)

    return {
        datazones: UKZones,
        // allLAD: allLAD
    }
}

export const ssr = false;
export const prerender = true;