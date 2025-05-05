<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import { base } from "$app/paths";

</script>

<NavigationBar />

<div class="about-page">
    <section class="about-header">
      <h1 class="title-about">Contact</h1>
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