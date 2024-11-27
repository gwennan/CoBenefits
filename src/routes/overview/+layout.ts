import {getTableData, getTotalPerBenefit, getTotalPerPathway} from "$lib/duckdb";
// import {getTableData, initDB} from "$lib/duckdb";


export async function load() {
    return {
        data: await getTableData(getTotalPerPathway()),
        dataPerCb: await getTableData(getTotalPerBenefit())
    };
}

export const ssr = false;