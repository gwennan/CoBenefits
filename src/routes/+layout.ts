import { base } from '$app/paths'
import { json, csv } from 'd3';

import * as topojson from "topojson-client";

// import {areaIDtoData, dataPage, UKZones, zones} from '../data.page.ts';

// import {rewind} from "@turf/turf";
// import {joinArrays} from "$lib/utils.ts";
import {initDB} from "$lib/duckdb";

// import data for landing page
import {
    getTableData,
    getAggregationPerBenefit
} from "$lib/duckdb";



// const zonesPath = '/maps/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824.geojson';
// topojson
// const zonesPath = '/maps/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824.json';
const zonesPath = 'maps/Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824.json';

const LADEngPath = `${base}/LAD/Eng_Wales_LSOA_LADs.csv`
const LADNIPath = `${base}/LAD/NI_DZ_LAD.csv`
const LADScotlandPath = `${base}/LAD/Scotland_DZ_LA.csv`


export async function load() {
    await initDB();
    // const db = await initDB();

    const zones = await json(zonesPath, (d) => {
        return d;
    })

    const UKZones = topojson.feature(zones, zones.objects["Lower_layer_Super_Output_Areas_2021_EW_BGC_V3_-6823567593069184824"]);

    let LADToName = {};
    await csv(LADEngPath).then(data => {
        for (let lad of data) {
            LADToName[lad.LAD22CD] = lad.LAD22NM;
        }
    })
    await csv(LADNIPath).then(data => {
        for (let lad of data) {
            LADToName[lad.LGD2014_code] = lad.LGD2014_name;
        }
    })
    await csv(LADScotlandPath).then(data => {
        for (let lad of data) {
            LADToName[lad.LA_Code] = lad.LA_Name;
        }
    })

    //get data for the landing page
    // console.log("Landing page data here")
    let aggregationPerBenefit = await getTableData(getAggregationPerBenefit());


    // console.log("Landing page data here", aggregationPerBenefit)

    console.log("end root")

    return {
        datazones: UKZones,
        LADToName,
        aggregationPerBenefit
    }
}

export const ssr = false;
export const prerender = true;