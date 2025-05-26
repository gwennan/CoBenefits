<script lang="ts">
    import { base } from "$app/paths";
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import {getTableData, getLADRegion} from '$lib/duckdb'
    import { csv } from "d3";
    import { onMount } from "svelte";

    import PeopleIcon from '$lib/icons/People.png';
    import HouseIcon from '$lib/icons/House.png';
    import CarIcon from '$lib/icons/Car.png';

    onMount(async () => {
        await loadData();
    });

</script>   

<NavigationBar />

<main>
    <h1>Browse socio-economic factors</h1>
    <p>Click on a socio-economic factor for detailed reports.</p>
</main>

<main class="main-container">
    <div class="left-column">
        <div class="heading-container">
            <img src={PeopleIcon} alt="Icon" class="heading-icon" />
            <h2>Demographic related factors</h2>
        </div>
        <a class="sef-link" href="{base}/sef?sef=Under_35">% inhabitants under 35</a>
        <a class="sef-link" href="{base}/sef?sef=Over_65">% inhabitants over 65</a>
        <a class="sef-link" href="{base}/sef?sef=Median_Income">Median income</a>
        <a class="sef-link" href="{base}/sef?sef=Unemployment">Unemployment rate</a>
        
        <div class="heading-container">
            <img src={CarIcon} alt="Icon" class="heading-icon" />
            <h2>Travel related factors</h2>
        </div>
        <a class="sef-link" href="{base}/sef?sef=Number_cars">No. cars</a>
        <a class="sef-link" href="{base}/sef?sef=Urban_trips">No. urban trips</a>
        <a class="sef-link" href="{base}/sef?sef=Total_vkm">Total car travel</a>
        <a class="sef-link" href="{base}/sef?sef=Urban_vkm">Urban car travel</a>
    </div>
    
    <div class="right-column">
        <div class="heading-container">
            <img src={HouseIcon} alt="Icon" class="heading-icon" />
            <h2>Housing related factors</h2>
        </div>
        <a class="sef-link" href="{base}/sef?sef=EPC">EPC Band</a>
        <a class="sef-link" href="{base}/sef?sef=Tenure">Tenure</a>
        <a class="sef-link" href="{base}/sef?sef=Typology">Typology</a>
        <a class="sef-link" href="{base}/sef?sef=Fuel_Type">Domestic fuel type</a>
        <a class="sef-link" href="{base}/sef?sef=Gas_flag">On gas grid</a>
        <a class="sef-link" href="{base}/sef?sef=Rurality">Rurality</a>
        <a class="sef-link" href="{base}/sef?sef=House_value">House value</a>
        <a class="sef-link" href="{base}/sef?sef=Fuel_consumption_total">Annual fuel consumption</a>
        <a class="sef-link" href="{base}/sef?sef=Floor_area">Floor area</a>
    </div>
</main>

<style>
    main {
        padding: 2rem 4rem 0rem 4rem; /* top right bottom left */
        font-family: Arial, sans-serif;
    }

    .main-container {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        padding: 0rem 4rem 0rem 4rem; /* top right bottom left */
    }
    .left-column,
    .right-column {
        flex: 1;
    }
            
    h2 {
        font-size: 1.5em;
        margin-bottom: 0.3em;
        margin-top: 1em;
    }
    .sef-link {
        text-decoration: none;
        color: #1a73e8;
        font-weight: 500;
        display: block;
        font-size: 1.2em;
    }
    .heading-container {
        display: flex;
        align-items: center;
        gap: 0.8rem; 
        margin-top: 1.5rem;
    }
    .heading-icon {
        width: 40px; 
        height: 40px;
    }
</style>