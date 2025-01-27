import {getTableData, getTotalPerOneCoBenefit} from "$lib/duckdb";
import type {CoBenefit} from "../../globals";
// import {getTableData, initDB} from "$lib/duckdb";


export async function load({ url }) {

    let coBenefit  = url.searchParams.get('cobenefit');
    coBenefit = coBenefit as CoBenefit;


    return {
        data: await getTableData(getTotalPerOneCoBenefit(coBenefit)),
        // dataPerCb: await getTableData(getTotalPerBenefit()),
        coBenefit
    };
}

export const ssr = false;
export const prerender = false;