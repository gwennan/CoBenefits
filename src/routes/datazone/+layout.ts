import {getSefForOneCoBenefit, getTableData, getTotalForOneZone, getTotalPerOneCoBenefit} from "$lib/duckdb";
import {type CoBenefit, SEF} from "../../globals";
// import {getTableData, initDB} from "$lib/duckdb";

// Called the page report
export async function load({ url }) {
    let datazone  = url.searchParams.get('zone');

    // let SEFData = await getTableData(getSefForOneCoBenefit(coBenefit))
    // SEF.forEach(SE => {
    //     SEFData[SE] = +SEFData[SE];
    // })

    let oneZoneData = await getTableData(getTotalForOneZone(datazone))


    return {
        // data: await getTableData(getTotalPerOneCoBenefit(coBenefit)),
        // SEFData: SEFData,
        oneZoneData: oneZoneData,
        datazone
    };
}