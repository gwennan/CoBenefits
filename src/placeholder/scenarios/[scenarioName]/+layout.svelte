<script lang="ts">
    import { page } from '$app/stores';
    // import {initDB} from "$lib/duckdb";
    import {onMount} from "svelte";

    export let data;

    $: scenario = $page.params.scenarioName;


    onMount(() => {
        // let db = initDB();
    })


    // const conn = await db.connect();
    // const queryResult = await conn.query(`SELECT * FROM scenarios LIMIT 10;`);
    // let result = queryResult.toArray();
    // console.log(22, result)

    export const browser = true;

</script>

<slot />