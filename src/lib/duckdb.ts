import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_worker from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?worker';
import type {AsyncDuckDB} from '@duckdb/duckdb-wasm';

import type {CoBenefit, Scenario} from "../globals";
import { browser } from '$app/environment';

let db: AsyncDuckDB;

// Name of the database table name
const DB_TABLE_NAME = "cobenefits";



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


    // Close the connection to release memory
    await conn.close();

    // console.log("INFO ", await getTableData(getInfo));
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

export function getCustomData(cobenefits: CoBenefit[], scenario: Scenario) {
    if (cobenefits.length == 0) {
        return `SELECT total, scenario, Lookup_Value
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type='Total'`
    } else {
        return `SELECT total, scenario, Lookup_Value
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type in (${cobenefits.map(v => `'${v}'`).join(",")})`
    }
}

export function getTotalPerBenefit() {
    // return `SELECT sum(total), co_benefit_type
    //         FROM ${DB_TABLE_NAME}
    //         WHERE co_benefit_type!='Total'
    //         GROUP BY co_benefit_type
    //         `

    return `SELECT total, co_benefit_type
            FROM ${DB_TABLE_NAME}
            WHERE co_benefit_type!='Total'`
}


export {initDB, getTableData}; // so we can import this elsewhere