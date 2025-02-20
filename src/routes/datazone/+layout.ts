import {
    getSefForOneCoBenefit,
    getSefForOneZone,
    getTableData,
    getTotalForOneZone,
    getTotalPerOneCoBenefit, getTotalPerPathway
} from "$lib/duckdb";
import {type CoBenefit, SEF} from "../../globals";
// import {getTableData, initDB} from "$lib/duckdb";

// Called the page report
export async function load({ url }) {
    console.log("LOAD DATA")

    let datazone  = url.searchParams.get('zone');

    // let totalPerPathway = await getTableData(getTotalPerPathway());
    //
    let SEFData = await getTableData(getSefForOneCoBenefit("Total"));
    SEF.forEach(SE => {
        SEFData[SE] = +SEFData[SE];
    })
    // console.log(10, SEFData)

    // let oneZoneData = await getTableData(getTotalForOneZone(datazone))


    console.log("SEND DATA")

    return {
        SEFData: SEFData,
        // oneZoneData: oneZoneData,
        datazone
    };
}