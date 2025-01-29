import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_worker from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?worker';
import type {AsyncDuckDB} from '@duckdb/duckdb-wasm';

import {type CoBenefit, type Scenario, SEF, type SEFactor} from "../globals";
import { browser } from '$app/environment';

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

    const response = await fetch('/database.parquet');
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load the parquet file into the DuckDB instance
    await db.registerFileBuffer("filename", uint8Array);
    // await db.open({path: "filename"});

    const conn = await db.connect();

    await conn.query(`CREATE TABLE ${DB_TABLE_NAME} AS SELECT * FROM read_parquet('filename');`);
    console.log("Table created from parquet");


    // Load socio economic table
    const response2 = await fetch('/tableSocio.parquet');
    const arrayBuffer2 = await response2.arrayBuffer();
    const uint8Array2 = new Uint8Array(arrayBuffer2);

    // Load the parquet file into the DuckDB instance
    await db.registerFileBuffer("filename2", uint8Array2);

    await conn.query(`CREATE TABLE ${DB_TABLE_SE_NAME} AS SELECT * FROM read_parquet('filename2');`);

    // Close the connection to release memory
    await conn.close();

    console.log("INFO ", await getTableData(getInfo()));
}


async function getTableData(request: string) {
    await initDB();

    const conn = await db.connect();

    // await conn.query(`CREATE TABLE ${DB_TABLE_NAME} AS SELECT * FROM read_parquet('filename');`);
    // console.log("Table created from parquet");


    // Now you can query the table
    // result is actually an Arrow Table
    // const result = await conn.query(`SELECT * FROM ${DB_TABLE_NAME}`);

    // const result = await conn.query(`SELECT total, scenario FROM ${DB_TABLE_NAME}`);


    const result = await conn.query(request);


    // Close the connection to release memory
    await conn.close();

    const allData = result.toArray().map((row) => row.toJSON());

    // Apache Arrow
    // const allData = result;

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
            WHERE co_benefit_type='Total'`
}

export function getCustomData(cobenefits: CoBenefit[], scenario: Scenario, time="total") {
    let query;

    if (cobenefits.length == 0) {
        query = `SELECT "${time}", scenario, Lookup_Value
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type='Total'`
    } else {
        query = `SELECT "${time}", scenario, Lookup_Value
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type in (${cobenefits.map(v => `'${v}'`).join(",")})`
    }
    return query
}


export function getTotalPerBenefit() {
    return `SELECT total, co_benefit_type
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type!='Total'`
}



export function getTotalPerOneCoBenefit(cobenefit: CoBenefit) {
    return `SELECT total, Lookup_Value, scenario, 2025_2029, 2030_2034, 2035_2039, 2040_2044, 2045_2040
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type='${cobenefit}'`
}



export function getSefForOneCoBenefit(cobenefit: CoBenefit) {

    const oneQuery = (SE: SEFactor) => {
        return `SELECT total, Lookup_value, ${SE} AS SE, '${SE}' AS SEFMAME
        FROM ${DB_TABLE_NAME}
        WHERE co_benefit_type='${cobenefit}'`
    }

    // let SEF = ['Under_35', 'Over_65'];
    let query = SEF.map(sef => oneQuery(sef)).join(" UNION ALL ");

    // console.log(query);
    return query;
}


export {initDB, getTableData}; // so we can import this elsewhere