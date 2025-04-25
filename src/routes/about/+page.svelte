<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import { base } from "$app/paths";

</script>

<NavigationBar />

<div class="about-page">
    <section class="about-header">
      <h1 class="title-about">About the UK Co-Benefit Atlas</h1>
    </section>
  
    <section class="about-intro">
      <p class="intro-paragraph">
        Climate actions are designed to lower greenhouse gas (GHG) emissions but the gains for society reach further. For example, electric cars reduce air pollution, retrofitting homes minimises cold, damp and mould growth, and our health outcomes in turn improve.
        </p>
      
      <p class="intro-paragraph"> 
        The CO-BENS project models 11 additional benefits for the climate actions recommended by the Climate Change Committee (CCC) in its <a href="https://www.theccc.org.uk/publication/the-seventh-carbon-budget/" target="_blank" rel="noopener noreferrer">Seventh Carbon Budget (2025)</a> to assist the United Kingdom with meeting its net zero target.
        </p>

      <p class="intro-paragraph">
        For 45,000 communities and regions, calculations consider localised context to determine actions that can be implemented in addition to how, when and for whom benefits will emerge (or in some cases costs).
        </p>

      <p class="intro-paragraph">
        Explore this data atlas to further understand connections between a wide range of social, economic and environmental priorities and drive more effective decision-making. 
      </p>
    </section>
  

  
    <section class="about-citation">
      <h2>Atlas Citation</h2>
      <p class="citation-text">
        Citation: Wang, J; Pister, A; Phillips, S, Hinrichs, U; Field, S; Sudmant, A; Bisset, S; Wharmby, C; Higgins-Lavery, R.; Bach, B (2025). “The UK Co-Benefits Atlas”. Published May 6, 2025.
      </p>
    </section>

    <section class="about-logos-wrapper">
        <div class="logos-grid">
          <img src="{base}/logos/SBNZ.png" alt="SBNZ" class="about-logo" />
          <img src="{base}/logos/ECCI.png" alt="ECCI" class="about-logo" />
          <img src="{base}/logos/vishub.svg" alt="VISHUB" class="about-logo" />
          <img src="{base}/logos/DI.png" alt="DI" class="about-logo" />
          <img src="{base}/logos/UOE.png" alt="UOE" class="about-logo" />
        </div>
      </section>

  </div>
  

<style>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 4rem;
  padding: 2rem 1rem;
  font-family: 'Helvetica Neue', sans-serif;
  color: #333;
}

.title-about {
  font-size: 2rem;
  text-align: left;
  margin-bottom: 1.5rem;
  font-weight: lighter;
  color: #6C6C6C;
}

.intro-paragraph {
  font-size: 1.125rem;
  line-height: 1.5;
  text-align: left;
  max-width: 800px;
  margin: 0 0 1.5rem 0;
}

.intro-paragraph a {
  color: #333; 
  text-decoration: underline; 
  transition: text-decoration 0.2s ease;
  font-weight: normal;
}

.intro-paragraph a:hover {
  text-decoration: underline; 
  color: #0077cc;
}

.about-logos-wrapper {
  /* text-align: left; */
  margin-bottom: 3rem;
}

.logos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: flex-start;
  align-items: center;
}

.about-logo {
  max-width: 150px;
  height: auto;
  object-fit: contain;
}

.about-citation {
  margin-top: 2rem;
  text-align: left;
  font-size: 0.875rem;
  color: #6C6C6C;
  
}

.about-citation h2 {
    font-weight: lighter;
}

.citation-text {
  max-width: 800px;
  /* margin: 0 auto; */
  line-height: 1.4;
}

  </style>