<script lang="ts">
    import {globalMeasures, archetypesInfo, COBENEFS} from "./data.ts"

    // import HeatMap from "./lib/HeatMap.svelte";
    // import Map from "./lib/Map.svelte";

    // import Distribution from "./lib/Distribution.svelte";
    // import SmallPlot from "./lib/SmallPlot.svelte";
    // import BoxPlot from "./lib/BoxPlot.svelte";
    // import SmallPlotTwoCat from "./lib/SmallPlotTwoCat.svelte";
    // import GridMap from "./lib/GridMap.svelte";
    import Overview from "./lib/Overview.svelte";


    let medianIncomeData = globalMeasures.map(d => d['Median.Income']);


//     TODO: host on github Pages
</script>


<!--    <HeatMap></HeatMap>-->
<!--    <Map></Map>-->

<!--    <div id="header" class="comp">-->
<!--    </div>-->

<!--    <h2>-->
<!--        Distribution of properties of each datazones.-->
<!--    </h2>-->

<!--    <div id="descriptivePlots" class="comp">-->
<!--        <Distribution variable="Median.Income"></Distribution>-->
<!--        <Distribution variable="Unemployment"></Distribution>-->
<!--        <Distribution variable="House.value"></Distribution>-->
<!--    </div>-->

<!--    <h2>-->
<!--        Co-Benefits Modeling.-->
<!--    </h2>-->

<!--    <div id="grid" class="comp">-->
<!--        <div class="question">Does the benefits affect the poor or the rich?</div>-->
<!--        <div>Total Co-Benefits</div>-->
<!--        <div>{COBENEFS[0]}</div>-->
<!--        <div>{COBENEFS[1]}</div>-->
<!--        <div>{COBENEFS[2]}</div>-->
<!--        <div>{COBENEFS[3]}</div>-->

<!--        <div>Scenario 1</div>-->
<!--        <SmallPlot scenario={1} variableX="Median.Income" variableY="Total" showAxes={true}></SmallPlot>-->
<!--        <SmallPlot scenario={1} variableX="Median.Income" variableY={COBENEFS[0]} showAxes={true}></SmallPlot>-->
<!--        <SmallPlot scenario={1} variableX="Median.Income" variableY={COBENEFS[1]} showAxes={true}></SmallPlot>-->
<!--        <SmallPlot scenario={1} variableX="Median.Income" variableY={COBENEFS[2]} showAxes={true}></SmallPlot>-->
<!--        <SmallPlot scenario={1} variableX="Median.Income" variableY={COBENEFS[3]} showAxes={true}></SmallPlot>-->

<!--        <div>Scenario 2</div>-->
<!--        <SmallPlot scenario={2} variableX="Median.Income" variableY="Total"></SmallPlot>-->
<!--        <SmallPlot scenario={2} variableX="Median.Income" variableY="{COBENEFS[0]}"></SmallPlot>-->
<!--        <SmallPlot scenario={2} variableX="Median.Income" variableY={COBENEFS[1]}></SmallPlot>-->
<!--        <SmallPlot scenario={2} variableX="Median.Income" variableY={COBENEFS[2]}></SmallPlot>-->
<!--        <SmallPlot scenario={2} variableX="Median.Income" variableY={COBENEFS[3]}></SmallPlot>-->

<!--        <div>Scenario 3</div>-->
<!--        <SmallPlot scenario={3} variableX="Median.Income" variableY="Total"></SmallPlot>-->
<!--        <SmallPlot scenario={3} variableX="Median.Income" variableY="{COBENEFS[0]}"></SmallPlot>-->
<!--        <SmallPlot scenario={3} variableX="Median.Income" variableY={COBENEFS[1]}></SmallPlot>-->
<!--        <SmallPlot scenario={3} variableX="Median.Income" variableY={COBENEFS[2]}></SmallPlot>-->
<!--        <SmallPlot scenario={3} variableX="Median.Income" variableY={COBENEFS[3]}></SmallPlot>-->

<!--        <div>Scenario 4</div>-->
<!--        <SmallPlot scenario={4} variableX="Median.Income" variableY="Total"></SmallPlot>-->
<!--        <SmallPlot scenario={4} variableX="Median.Income" variableY="{COBENEFS[0]}"></SmallPlot>-->
<!--        <SmallPlot scenario={4} variableX="Median.Income" variableY={COBENEFS[1]}></SmallPlot>-->
<!--        <SmallPlot scenario={4} variableX="Median.Income" variableY={COBENEFS[2]}></SmallPlot>-->
<!--        <SmallPlot scenario={4} variableX="Median.Income" variableY={COBENEFS[3]}></SmallPlot>-->

<!--        <div>Scenario 5</div>-->
<!--        <SmallPlot scenario={5} variableX="Median.Income" variableY="Total"></SmallPlot>-->
<!--        <SmallPlot scenario={5} variableX="Median.Income" variableY="{COBENEFS[0]}"></SmallPlot>-->
<!--        <SmallPlot scenario={5} variableX="Median.Income" variableY={COBENEFS[1]}></SmallPlot>-->
<!--        <SmallPlot scenario={5} variableX="Median.Income" variableY={COBENEFS[2]}></SmallPlot>-->
<!--        <SmallPlot scenario={5} variableX="Median.Income" variableY={COBENEFS[3]}></SmallPlot>-->

<!--        <div>Variance </div>-->
<!--        <BoxPlot></BoxPlot>-->

<!--&lt;!&ndash;        <GridMap></GridMap>&ndash;&gt;-->
<!--    </div>-->


<!--     <div class="comp grid">-->
<!--        <div class="question">Cities or Rurality?</div>-->
<!--        <div>Total Co-Benefits</div>-->
<!--        <div>{COBENEFS[0]}</div>-->
<!--        <div>{COBENEFS[1]}</div>-->
<!--        <div>{COBENEFS[2]}</div>-->
<!--        <div>{COBENEFS[3]}</div>-->

<!--        <div>Scenario 1</div>-->
<!--        <SmallPlotTwoCat scenario={1} variableX="Rurality" variableY="Total" showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={1} variableX="Rurality" variableY={COBENEFS[0]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={1} variableX="Rurality" variableY={COBENEFS[1]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={1} variableX="Rurality" variableY={COBENEFS[2]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={1} variableX="Rurality" variableY={COBENEFS[3]} showAxes={true}></SmallPlotTwoCat>-->

<!--        <div>Scenario 2</div>-->
<!--        <SmallPlotTwoCat scenario={2} variableX="Rurality" variableY="Total" showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={2} variableX="Rurality" variableY={COBENEFS[0]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={2} variableX="Rurality" variableY={COBENEFS[1]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={2} variableX="Rurality" variableY={COBENEFS[2]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={2} variableX="Rurality" variableY={COBENEFS[3]} showAxes={true}></SmallPlotTwoCat>-->

<!--        <div>Scenario 3</div>-->
<!--        <SmallPlotTwoCat scenario={3} variableX="Rurality" variableY="Total" showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={3} variableX="Rurality" variableY={COBENEFS[0]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={3} variableX="Rurality" variableY={COBENEFS[1]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={3} variableX="Rurality" variableY={COBENEFS[2]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={3} variableX="Rurality" variableY={COBENEFS[3]} showAxes={true}></SmallPlotTwoCat>-->

<!--        <div>Scenario 4</div>-->
<!--        <SmallPlotTwoCat scenario={4} variableX="Rurality" variableY="Total" showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={4} variableX="Rurality" variableY={COBENEFS[0]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={4} variableX="Rurality" variableY={COBENEFS[1]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={4} variableX="Rurality" variableY={COBENEFS[2]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={4} variableX="Rurality" variableY={COBENEFS[3]} showAxes={true}></SmallPlotTwoCat>-->

<!--        <div>Scenario 5</div>-->
<!--        <SmallPlotTwoCat scenario={5} variableX="Rurality" variableY="Total" showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={5} variableX="Rurality" variableY={COBENEFS[0]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={5} variableX="Rurality" variableY={COBENEFS[1]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={5} variableX="Rurality" variableY={COBENEFS[2]} showAxes={true}></SmallPlotTwoCat>-->
<!--        <SmallPlotTwoCat scenario={5} variableX="Rurality" variableY={COBENEFS[3]} showAxes={true}></SmallPlotTwoCat>-->

<!--        <div>Summary</div>-->
<!--        <BoxPlot></BoxPlot>-->
<!--    </div>-->



<Overview></Overview>


<style>

    #descriptivePlots {
        display: flex;
        flex-direction: row;
    }

    #grid {
        display: grid;
        grid-auto-flow: column;
        /*grid-template-columns: 1fr 1fr;*/
        grid-template-columns: 1fr repeat(5, 1fr) 1fr;
        grid-template-rows: 1fr repeat(5, 3fr);
        grid-column-gap: 1%;
        grid-row-gap: 1%;

        /*width: 97vw;*/
        height: 50vh;
    }

    .grid {
        display: grid;
        grid-auto-flow: column;
        /*grid-template-columns: 1fr 1fr;*/
        grid-template-columns: 1fr repeat(5, 1fr) 1fr;
        grid-template-rows: 1fr repeat(5, 3fr);
        grid-column-gap: 1%;
        grid-row-gap: 1%;

        /*width: 97vw;*/
        height: 50vh;
    }

    .question {
        font-weight: bold;
    }

    .comp {
        /*border: 1px solid black;*/
        /*background: beige;*/
    }
</style>
