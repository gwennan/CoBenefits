import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

import type { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { browser } from '$app/environment';

// TODO: the load seems to be done server side still, and create an error

let db: AsyncDuckDB | null = null;

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
    },
    eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
    },
};

// const initDB = async () => {
//     console.log(2323, browser)
// 	if (db) {
// 		return db; // Return existing database, if any
// 	}
//
// 	// Select a bundle based on browser checks
//     const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
//     // Instantiate the asynchronus version of DuckDB-wasm
//     const worker = new Worker(bundle.mainWorker!);
//     const logger = new duckdb.ConsoleLogger();
//     db = new duckdb.AsyncDuckDB(logger, worker);
//     await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
//     return db;
// };


export async function load() {

    // let db = initDB();
    console.log(22, browser)

    return {
        test: "a"
    };
}