<script lang="ts">
    import { base } from "$app/paths";
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import {getTableData, getLADRegion} from '$lib/duckdb'
    import { csv } from "d3";
    import { onMount } from "svelte";

    import PeopleIcon from '$lib/icons/People.png';
    import CarIcon from '$lib/icons/Car.png';
    import HouseIcon from '$lib/icons/Exterior.png';
    import TreeIcon from '$lib/icons/Forest.png';

    onMount(async () => {
        await loadData();
    });

</script>   

<NavigationBar />

<main>
    <h1>Browse socio-economic factors</h1>
    <p>Click on a socio-economic factor for a detailed report.</p>
</main>

<main class="main-container">
    <div class="left-column">
        <div class="heading-container">
            <img src={PeopleIcon} alt="Icon" class="heading-icon" />
            <h2>Demographic factors</h2>
        </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Under_35">Age - under 35 </a>
        </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Over_65">Age - over 65</a>
        </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Median_Income">Income</a>
        </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Unemployment">Unemployment</a>
        </div>

        <div class="heading-container">
            <img src={CarIcon} alt="Icon" class="heading-icon" />
            <h2>Transport factors</h2>
        </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Number_cars">Number of cars</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Urban_trips">Number of urban trips</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Total_vkm">Car travel</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Urban_vkm">Urban car travel</a>
    </div>
    </div>
    
    <div class="right-column">
        <div class="heading-container">
            <img src={HouseIcon} alt="Icon" class="heading-icon" />
            <h2>Building factors</h2>
        </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=EPC">Domestic energy performance certificate (EPC)</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Tenure">Housing tenure</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Typology">Building type</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Fuel_Type">Domestic fuel type</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Gas_flag">Gas grid connection</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=House_value">House value</a>
    </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Fuel_consumption_total">Annual fuel consumption</a>
        </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Floor_area">Floor area</a>
        </div>


        <div class="heading-container">
            <img src={TreeIcon} alt="Icon" class="heading-icon" />
            <h2>Geographic factors</h2>
        </div>
        <div class="sef-link-wrapper">
        <a class="sef-link" href="{base}/sef?sef=Rurality">Rurality</a>
        </div>
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
        color: #5A5A5A;
        font-weight: 500;
        display: block;
        font-size: 1.2em;
    }
    .sef-link:hover {
    color: #ECECEC;
    background: #404040
}
    .heading-container {
        display: flex;
        align-items: center;
        gap: 0.8rem; 
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }
    .heading-icon {
        width: 40px; 
        height: 40px;
        margin-bottom: -0.5rem; 
    }

    .sef-link-wrapper {
        display: inline-flex; 
        align-items: center;
        gap: 0.5rem; 
        background: #F8F8F8;
        border: 1px solid #ECECEC;
        border-radius: 5px;
        padding-left: 1%;
        padding-right: 1%;
        padding-top: 0.5%;
        padding-bottom: 0.5%;
        margin: 5px 5px;
    }
    .sef-link-wrapper:hover {
        background: #404040;
}

</style>