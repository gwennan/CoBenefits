<script lang="ts">
    import {base} from "$app/paths";
    import {page} from '$app/stores';
    import {goto} from '$app/navigation';
    import {get} from 'svelte/store';
</script>

<footer>
        <div class="logos-grid">
            <img src="{base}/logos/SBNZ.png" alt="SBNZ" class="logo"/>
            <img src="{base}/logos/ECCI.png" alt="ECCI" class="logo"/>
            <img src="{base}/logos/vishub.svg" alt="VISHUB" class="logo"/>
            <img src="{base}/logos/DI.png" alt="DI" class="logo"/>
            <img src="{base}/logos/UOE.png" alt="UOE" class="logo"/>
        </div>

    <div id="footer-text">
        Work funded by Scotland Beyond Net Zero.
    </div>

    <div>
        <ul id="footer-list">
            <li><a href="https://github.com/Edinburgh-Futures-Institute/CoBenefits">Feedback</a></li>
            <li><a href="https://github.com/Edinburgh-Futures-Institute/CoBenefits">Code</a></li>
        </ul>
    </div>
</footer>

<style>
    footer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-left: 3em;
        margin-right: 3em;

        font-size: 14px;
        padding-top: 1rem;
        padding-bottom: 1rem;
    }

    .logo {
        max-width: 140px;
        height: auto;
        object-fit: contain;
    }

    #footer-text {
        max-width: 200px;
    }


    .logos-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        justify-content: flex-start;
        align-items: center;
    }

    #footer-list {
        list-style-type: none; /* removes bullet points */
        padding: 0; /* removes left padding */
        margin: 0;  /* optional: removes default margin */
    }

    #footer-list > li {
        color: #6C6C6C;
        text-decoration: underline;
    }

    #footer-list a:visited {
        color: #6C6C6C;
    }

</style>