import {getSefForOneCoBenefit, getTableData, getTotalPerOneCoBenefit} from "$lib/duckdb";
import {type CoBenefit, SEF} from "../../globals";
// import {getTableData, initDB} from "$lib/duckdb";

// Called the page report
export async function load({ url }) {
    let coBenefit  = url.searchParams.get('cobenefit');
    coBenefit = coBenefit as CoBenefit;

    let SEFData = await getTableData(getSefForOneCoBenefit(coBenefit))

    SEF.forEach(SE => {
        SEFData[SE] = +SEFData[SE];
    })

    return {
        data: await getTableData(getTotalPerOneCoBenefit(coBenefit)),
        SEFData: SEFData,
        coBenefit
    };
}

export const ssr = false;
export const prerender = false;