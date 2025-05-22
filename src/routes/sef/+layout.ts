// Called the page report
import type {SEFactor} from "../../globals";

export async function load({ data, url }) {
    let SEF  = url.searchParams.get('sef');
    SEF = SEF as SEFactor;
    //
    // let SEFData = await getTableData(getSefForOneCoBenefit(coBenefit))
    //
    // SEF.forEach(SE => {
    //     SEFData[SE] = +SEFData[SE];
    // })

    return {
        // data: await getTableData(getTotalPerOneCoBenefit(coBenefit)),
        // SEFData: SEFData,
        SEF
    };
}