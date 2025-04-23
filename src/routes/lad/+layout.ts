import { base } from '$app/paths'
import { csv } from 'd3';

import {initDB} from "$lib/duckdb";

const LADEngPath = `${base}/LAD/Eng_Wales_LSOA_LADs.csv`
const LADNIPath = `${base}/LAD/NI_DZ_LAD.csv`
const LADScotlandPath = `${base}/LAD/Scotland_DZ_LA.csv`

let LADToName = {};
let LADToNation = {};

export async function load() {
    await initDB();

    let LADToName = {};
    await csv(LADEngPath).then(data => {
        for (let lad of data) {
            LADToName[lad.LAD22CD] = lad.LAD22NM;
            LADToNation[lad.LAD22CD] = "England/Wales";
        }
    })
    await csv(LADNIPath).then(data => {
        for (let lad of data) {
            LADToName[lad.LGD2014_code] = lad.LGD2014_name;
            LADToNation[lad.LGD2014_code] = "Northern Ireland";
        }
    })
    await csv(LADScotlandPath).then(data => {
        for (let lad of data) {
            LADToName[lad.LA_Code] = lad.LA_Name;
            LADToNation[lad.LA_Code] = "Scotland";
        }
    })

    console.log(LADToName);

    return {
        LADToName, LADToNation
    }
}

export const ssr = false;
export const prerender = true;