import {
    getAllLAD, getAverageCBGroupedByLAD,
    getSefForOneCoBenefit,
    getTotalCBForOneLAD, getSUMCBGroupedByLAD,
    getTableData, getTotalCBAllDatazones,
    getTotalForOneZone,
    getTotalPerOneCoBenefit, getTotalPerPathway, getAllCBForOneLAD
} from "$lib/duckdb";
import {COBENEFS} from "../../globals";
// import {getTableData, initDB} from "$lib/duckdb";

// Called the page report
export async function load({ url }) {
    console.log("LOAD DATA")

    const LAD  = url.searchParams.get('location');

    let totalCBAllZones = await getTableData(getTotalCBAllDatazones());
    let totalCBAllLAD = await getTableData(getSUMCBGroupedByLAD([]));

    let allCBAllLAD = await getTableData(getAverageCBGroupedByLAD(COBENEFS));

    let oneLADData = await getTableData(getTotalCBForOneLAD(LAD));
    let oneLADAllCBs = await getTableData(getAllCBForOneLAD(LAD));

    console.log("SEND DATA")

    return {
        LAD,
        totalCBAllLAD,
        totalCBAllZones,
        allCBAllLAD,
        oneLADData,
        oneLADAllCBs,

    };
}