<script>
    import { base } from '$app/paths';

import {COBENEFS} from "../globals";

export let data;

let isLoading = true;

$: {
    console.log(12121, data)
    isLoading = !data;
}


</script>

<h1>Welcome to the Cobenefit Atlas!</h1>


<!--<div>-->
<!--        <h1> Glossary</h1>-->
<!--</div>-->

<main>

    <!-- Spinner -->
    {#if isLoading}
        <div class="spinner">
            GGGGGGGGG
            GGGGGGGGG
            GGGGGGGGG
            GGGGGGGGG
            GGGGGGGGG
            GGGGGGGGG
        </div>
    {/if}

    <div>
        <a href="{base}/overview">Overview</a>
    </div>

    <div>
        <a href="{base}/map">Map Application</a>
    </div>

    <div>
        Report pages by Co-Benefit

        <ul>
            {#each COBENEFS as coBenef}

                <li>
                    <a href="{base}/cobenefit?cobenefit={coBenef}">{coBenef}</a>
                </li>

            {/each}
        </ul>

    </div>
</main>



<style>

    main {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 60%;
    }


</style>