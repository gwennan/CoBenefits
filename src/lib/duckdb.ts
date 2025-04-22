import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_worker from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?worker';
import type {AsyncDuckDB} from '@duckdb/duckdb-wasm';

import {type CoBenefit, COBENEFS, type Scenario, SEF, type SEFactor, TIMES} from "../globals";
import {browser} from '$app/environment';

let db: AsyncDuckDB;

// Name of the database table name
const DB_TABLE_NAME = "cobenefits";
const DB_TABLE_SE_NAME = "socioEconmicFactors";


const initDB = async () => {

    // when building, Sveltekit prerenders pages using Node. In this step, we don't want to call duckdb.
    if (!browser) {
        return
    }

    if (db) {
        return db; // Return existing database, if any
    }

    console.log("INIT DB")

    // Instantiate worker
    const logger = new duckdb.ConsoleLogger();
    const worker = new duckdb_worker();

    // and asynchronous database
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(duckdb_wasm);

    await loadData();
    return db;
};


async function loadData() {
    console.log("loading parqet file in db");

    const response = await fetch('database.parquet');
    // const response = await fetch('database_onlyIreland.parquet');


    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load the parquet file into the DuckDB instance
    await db.registerFileBuffer("filename", uint8Array);
    // await db.open({path: "filename"});

    const conn = await db.connect();

    await conn.query(`CREATE TABLE ${DB_TABLE_NAME} AS
    SELECT *
    FROM read_parquet('filename');`);
    console.log("Table created from parquet");


    // Load socio economic table (currenlty merged)
    // const response2 = await fetch('tableSocio.parquet');
    // const arrayBuffer2 = await response2.arrayBuffer();
    // const uint8Array2 = new Uint8Array(arrayBuffer2);
    //
    // // Load the parquet file into the DuckDB instance
    // await db.registerFileBuffer("filename2", uint8Array2);
    //
    // await conn.query(`CREATE TABLE ${DB_TABLE_SE_NAME} AS SELECT * FROM read_parquet('filename2');`);
    //
    // // Close the connection to release memory
    // await conn.close();

    console.log("DB INFO: ", await getTableData(getInfo()));

    const result = await conn.query(`PRAGMA table_info(${DB_TABLE_NAME})`);
    console.log("Table schema:", await result.toArray());

    await conn.close();
}


async function getTableData(request: string) {
    await initDB();

    const conn = await db.connect();

    // await conn.query(`CREATE TABLE ${DB_TABLE_NAME} AS SELECT * FROM read_parquet('filename');`);
    // console.log("Table created from parquet");

    // Now you can query the table
    // result is actually an Arrow Table
    // const result = await conn.query(`SELECT * FROM ${DB_TABLE_NAME}`);

    const result = await conn.query(request);

    // Close the connection to release memory
    await conn.close();

    const allData = result.toArray().map((row) => row.toJSON());
    return allData;
}

export function getInfo() {
    return `
        SELECT *
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = N'${DB_TABLE_NAME}'
    `
}

export function getTotalPerPathway() {
    return `SELECT total, scenario, Lookup_Value
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type = 'Total'`
}

export function getSEFData(sef: SEF) {
    // Select total line because the value is repeated for one LSOA
    let query = `SELECT ${sef} as val, Lookup_Value
                 FROM ${DB_TABLE_NAME}
                 WHERE co_benefit_type = 'Total'`
    return query
}

// CAST(25.65 AS int);
export function getAverageSEFGroupedByLAD(sef: SEF) {
    let query;
    query = `SELECT AVG(${sef}) as val, LAD as Lookup_Value
             FROM ${DB_TABLE_NAME}
             WHERE co_benefit_type = 'Total'
             GROUP BY LAD, scenario`
    return query
}

export function getCustomCBData(cobenefits: CoBenefit[], scenario: Scenario, time = "total") {
    let query;

    if (cobenefits.length == 0) {
        query = `SELECT "${time}" as val, scenario, Lookup_Value
                 FROM ${DB_TABLE_NAME}
                 WHERE co_benefit_type = 'Total'`
    } else {
        query = `SELECT "${time}" as val, scenario, Lookup_Value
                 FROM ${DB_TABLE_NAME}
                 WHERE co_benefit_type in (${cobenefits.map(v => `'${v}'`).join(",")})`
    }
    return query
}

export function getAverageCBGroupedByLAD(cobenefits: CoBenefit[], scenario: Scenario, time = "total") {
    let query;

    if (cobenefits.length == 0) {
        query = `SELECT scenario, AVG("${time}") as val, LAD as Lookup_Value
                 FROM ${DB_TABLE_NAME}
                 WHERE co_benefit_type = 'Total'
                 GROUP BY LAD, scenario`

    } else {
        // Need to sum on selected cobenef and then average for the LAD
        query = `
            SELECT scenario, AVG(val) as val, LAD as Lookup_Value
            FROM (SELECT Lookup_Value, scenario, SUM("${time}") as val, LAD
                  FROM ${DB_TABLE_NAME}
                  WHERE co_benefit_type in (${cobenefits.map(v => `'${v}'`).join(",")})
                  GROUP BY Lookup_value, LAD, scenario) AS summed
            GROUP BY LAD, scenario
        `
    }
    return query
}

export function getSUMCBGroupedByLAD(cobenefits: CoBenefit[], scenario: Scenario, time = "total") {
    let query;

    if (cobenefits.length == 0) {
        query = `SELECT scenario, SUM("${time}") as val, LAD as Lookup_Value
                 FROM ${DB_TABLE_NAME}
                 WHERE co_benefit_type = 'Total'
                 GROUP BY LAD, scenario`
    } else {
        query = `SELECT scenario, SUM("${time}") as val, LAD as Lookup_Value
                 FROM ${DB_TABLE_NAME}
                 WHERE co_benefit_type in (${cobenefits.map(v => `'${v}'`).join(",")})
                 GROUP BY LAD, scenario`
    }
    return query
}

export function getSUMCBGroupedByLADAndCB(time = "total") {
    let query = `SELECT SUM("${time}") as val, LAD as Lookup_Value, co_benefit_type
                 FROM ${DB_TABLE_NAME}
                 WHERE co_benefit_type in (${COBENEFS.map(v => `'${v}'`).join(",")})
                 GROUP BY LAD, co_benefit_type`
    return query
}


export function getTotalPerBenefit() {
    return `SELECT total, co_benefit_type
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type!='Total'`
}


export function getTotalPerOneCoBenefit(cobenefit: CoBenefit) {
    return `SELECT total, Lookup_Value, scenario, co_benefit_type, LAD, ${SEF.join(", ")}, ${TIMES.map(d => `"${d}"`).join(", ")}
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type = '${cobenefit}'`
}


export function getTotalForOneZone(datazone: string) {
    return `SELECT total, Lookup_Value, scenario
            FROM ${DB_TABLE_NAME}
            WHERE Lookup_Value = '${datazone}'`
}


// Co-benefit=total to get only one row per datazone
export function getTotalCBAllDatazones() {

    // return `SELECT total, Lookup_value, scenario, co_benefit_type, LAD, ${SEF.join(", ")}, ${TIMES.map(d => `"${d}"`).join(", ")}
    let query = `SELECT total, Lookup_value, scenario, co_benefit_type, LAD, HHs, ${SEF.join(", ")}, ${TIMES.map(d => `"${d}"`).join(", ")}
                 FROM ${DB_TABLE_NAME}
                 WHERE co_benefit_type = 'Total'`


    // console.log(22, query);
    return query;
}

// Co-benefit=total to get only one row per datazone
export function getAllCBAllDatazones() {
    // const roundedSEF = SEF.map(sef => `ROUND(${sef}) AS ${sef}`)

    // return `SELECT total, Lookup_value, scenario, co_benefit_type, LAD, ${roundedSEF.join(", ")  }
    return `SELECT total, Lookup_value, scenario, co_benefit_type, LAD, ${SEF.join(", ")}, ${TIMES.map(d => `"${d}"`).join(", ")}
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type!='Total'`
}


// Co-benefit=total to get only one row per datazone. We can use this for the SEF data too.
export function getTotalCBForOneLAD(LAD: string) {
    let q = `SELECT total, Lookup_value, co_benefit_type, LAD, scenario, ${TIMES.map(d => `"${d}"`).join(", ")}, ${SEF.join(", ")}
             FROM ${DB_TABLE_NAME}
             WHERE LAD = '${LAD}'
               AND co_benefit_type = 'Total'`

    // let q= `SELECT ${TIMES.map(d => d).join(" , ")}
    //     FROM ${DB_TABLE_NAME}
    //     WHERE LAD = '${LAD}'
    //     AND co_benefit_type='Total'`

    // console.log("Q ", q)
    return q;
}

export function getAllCBForOneLAD(LAD: string) {
    return `SELECT total, Lookup_value, co_benefit_type, LAD, scenario, ${SEF.join(", ")}, ${TIMES.map(d => `"${d}"`).join(", ")}
            FROM ${DB_TABLE_NAME}
            WHERE LAD = '${LAD}'
              AND co_benefit_type!='Total'
    `
}

export function getTotalCBForOneLADTimed(LAD: string) {
    return `SELECT total, Lookup_value, co_benefit_type, LAD, scenario
            FROM ${DB_TABLE_NAME}
            WHERE LAD = '${LAD}'
              AND co_benefit_type!='Total'
    `
}


// Useful for facetted charts, but not for individual charts.
export function getSefForOneCoBenefit(cobenefit: CoBenefit) {

    const oneQuery = (SE: SEFactor) => {
        return `SELECT total, Lookup_value, LAD, ${SE} AS SE, '${SE}' AS SEFMAME
                FROM ${DB_TABLE_NAME}
                WHERE co_benefit_type = '${cobenefit}'`
    }

    // let SEF = ['Under_35', 'Over_65'];
    let query = SEF.map(sef => oneQuery(sef)).join(" UNION ALL ");
    return query;
}

export function getSefForOneCoBenefitAveragedByLAD(cobenefit: CoBenefit) {

    const oneQuery = (SE: SEFactor) => {
        return `SELECT AVG(total) as total, LAD, AVG(${SE}) AS SE, '${SE}' AS SEFMAME
                FROM ${DB_TABLE_NAME}
                WHERE co_benefit_type = '${cobenefit}'
                GROUP BY LAD
                `
    }

    // let SEF = ['Under_35', 'Over_65'];
    let query = SEF.map(sef => oneQuery(sef)).join(" UNION ALL ");
    return query;
}


export function getAllLAD() {
    return `SELECT DISTINCT LAD
            FROM ${DB_TABLE_NAME}`;
}


// prepare for landing page waffle
export function getAggregationPerBenefit() {
    return `
        SELECT co_benefit_type, SUM(total) as total
        FROM ${DB_TABLE_NAME}
        WHERE co_benefit_type != 'Total'
        GROUP BY co_benefit_type
        ORDER BY co_benefit_type
    `;
}

// LAD total benefits for sorting the top 10 in display for landing page
export function getAggregatedTotalPerLAD() {
    return `
        SELECT LAD, SUM(total) AS total_value
        FROM ${DB_TABLE_NAME}
        WHERE co_benefit_type = 'Total'
        GROUP BY LAD
    `;
}

export function getTopSeletedLADsByTotal(n: number) {
    return `
        SELECT LAD, SUM(total) AS total_value
        FROM ${DB_TABLE_NAME}
        WHERE co_benefit_type = 'Total'
        GROUP BY LAD
        ORDER BY total_value DESC
        LIMIT ${n}
    `;
}




export {initDB, getTableData}; // so we can import this elsewhere