<script>
    import '../app.css';
    import {onMount} from 'svelte';
    import {AVERAGE_COLOR} from "../globals";
    import {browser} from '$app/environment'

    onMount(() => {
		document.documentElement.style.setProperty('--compareColor', AVERAGE_COLOR);
	});

    if (browser) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(){dataLayer.push(arguments);}
        window.gtag('js', new Date());
        window.gtag('config', 'G-GGZ403XD90');
    }
</script>


<slot/>

<svelte:head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-GGZ403XD90"></script>
</svelte:head>