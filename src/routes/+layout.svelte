<script>
    import '../app.css';
    import {onMount} from 'svelte';
    import {AVERAGE_COLOR} from "../globals";


    onMount(() => {
		document.documentElement.style.setProperty('--compareColor', AVERAGE_COLOR);
	});
</script>


<slot/>