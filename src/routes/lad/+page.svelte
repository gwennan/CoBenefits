<script lang="ts">
    import { base } from "$app/paths";
    import NavigationBar from "$lib/components/NavigationBar.svelte";

    export let data;
    const { LADToName, LADToNation } = data;

    let entries = Object.entries(LADToName).map(([code, name]) => ({
        code,
        name,
        nation: LADToNation[code]
    }));

    // Group by nation
    let nations = ["England/Wales", "Northern Ireland", "Scotland"];
    let grouped = {};

    for (let nation of nations) {
        grouped[nation] = entries
            .filter(entry => entry.nation === nation)
            .sort((a, b) => a.name.localeCompare(b.name));
    }

</script>

<NavigationBar />

<main>
    <h1>List of Local Authorities across UK</h1>
    <p>Click on a local authority for detailed reports.</p>
    {#each nations as nation}
    <details>
        <summary>
            {nation} ({grouped[nation].length})
        </summary>
        <div class="lad-grid">
            {#each grouped[nation] as lad}
                <a class="lad-link" href="{base}/location?location={lad.code}">{lad.name}</a>
            {/each}
        </div>
    </details>
{/each}
</main>


<style>
    main {
        padding: 2rem 4rem;
        font-family: Arial, sans-serif;
    }

    section {
        margin: 2em 0;
    }

    h2 {
        font-size: 1.5em;
        margin-bottom: 0.5em;
        margin-top: 2em;
    }

    details {
        margin: 1em 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        background-color: #fff;
    }

    summary {
        font-size: 1.1em;
        font-weight: 600;
        padding: 1em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
        transition: background-color 0.2s ease;
    }

    summary:hover {
        background-color: #eee;
    }

    summary::marker,
    summary::-webkit-details-marker {
        display: none;
    }

    summary::after {
        content: "▶";
        font-size: 0.9em;
        transform: rotate(0deg);
        transition: transform 0.2s ease;
    }

    details[open] summary::after {
        transform: rotate(90deg);
    }

    .lad-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 0.75em;
        padding: 1em;
    }

    .lad-link {
        text-decoration: none;
        color: #1a73e8;
        font-weight: 500;
        display: block;
    }

    .lad-link:hover {
        text-decoration: underline;
        color: #155ab6;
    }
</style>