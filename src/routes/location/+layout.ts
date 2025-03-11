import {
    getAllLAD, getAverageCBGroupedByLAD,
    getSefForOneCoBenefit,
    getSEFForOneLAD, getSUMCBGroupedByLAD,
    getTableData, getTotalCBAllDatazones,
    getTotalForOneZone,
    getTotalPerOneCoBenefit, getTotalPerPathway
} from "$lib/duckdb";
import {type CoBenefit, SEF} from "../../globals";
// import {getTableData, initDB} from "$lib/duckdb";

// Called the page report
export async function load({ url }) {
    console.log("LOAD DATA")

    const LAD  = url.searchParams.get('location');

    let totalCBAllZones = await getTableData(getTotalCBAllDatazones());
    let totalCBAllLAD = await getTableData(getSUMCBGroupedByLAD([]));
    let oneLADData = await getTableData(getSEFForOneLAD(LAD));

    console.log("SEND DATA")

    return {
        // SEFData: SEFData,
        totalCBAllZones,
        oneLADData,
        totalCBAllLAD,
        LAD
    };
}