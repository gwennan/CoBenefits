import {getTableData, getTotalPerBenefit, getTotalPerPathway, initDB} from "$lib/duckdb";
import {json} from "d3";
import {rewind} from "@turf/turf";
// import {getTableData, initDB} from "$lib/duckdb";


export async function load() {
    return {
        // data: await getTableData(getTotalPerPathway),
        // dataPerCb: await getTableData(getTotalPerBenefit)
    };
}

export const ssr = false;