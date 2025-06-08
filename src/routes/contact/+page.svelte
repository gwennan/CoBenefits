<script lang="ts">
    import NavigationBar from "$lib/components/NavigationBar.svelte";
    import { base } from "$app/paths";
    import { onMount } from 'svelte';

  onMount(() => {
    const hash = window.location.hash?.substring(1); // remove the `#`
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 130;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 30); // Delay ensures DOM is ready
    }
  });

</script>

<NavigationBar />

<div class="about-page">
    <section class="about-header">
      <h1 class="title-about">Contact</h1>
    </section>

    <section class="contact" id="email">
      <h2>Email</h2>
      <p class="intro-paragraph">
      If you have any questions, feedback, or suggestions regarding the UK Co-Benefits Atlas, please email us via <a href="mailto:cobens@ed.ac.uk" style="color: #646cff">cobens@ed.ac.uk</a>.
      </p>
    </section>

    <section class="contact" id="newsletter">
      <h2>Newsletter</h2>
      <p class="intro-paragraph">
      <a href="https://groups.google.com/g/ukcobenefitsatlas" style="color: #646cff">Subscribe</a> to our mailing list for lastest feature updates, training sessions, and more community events!
      </p>
    </section>

    <section class="contact" id="training" style="margin-bottom: 100px;">
      <h2>Training Sessions</h2>
      <p class="intro-paragraph">
      We are planning a first set of tutorial sessions on the atlas to: (1) help you better understand the atlas (content, navigation, analysis, etc.); (2) have us help you with your task and to learn how we can improve the atlas; and (3) to meet other people who would like to use the atlas.
      </p>

      <p class="intro-paragraph" style="font-weight: 700;">
      No pre-knowledge is required. Our team is here to answer your questions.
      </p>

      <p class="intro-paragraph">
      Sessions are scheduled weekly on a Friday morning <strong>11-12pm</strong>, while alternating between online and in-person sessions. More sessions will be announced, please check back here! 
      </p>

      <p class="intro-paragraph">
        Sign-up: <a href="https://forms.gle/KFrsGALcVK3XZNKr7" target="_blank" style="color: #646cff">https://forms.gle/KFrsGALcVK3XZNKr7</a>
      </p>

      <p class="intro-paragraph">
        <ul style="max-width: 700px;">
          <li>June 13: Online <a href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_MzQzODYzNDMtNzRmMC00Mjg4LWJkYjktNTQ2MmFiNjNlMGIx%40thread.v2/0?context=%7b%22Tid%22%3a%222e9f06b0-1669-4589-8789-10a06934dc61%22%2c%22Oid%22%3a%221c4cc21f-0698-4756-b656-1d9b7595893a%22%7d" target="_blank">TEAMS-LINK</a></li>
          <li>June 20: In-person, ECCI, The Pod. <span style="font-style: italic;">(on entering the ECCI building, continue into the atrium - The Pod is the first room on your right hand side, next to the individual meeting spaces)</span></li>
          <li>June 27: Online <a href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_MzQzODYzNDMtNzRmMC00Mjg4LWJkYjktNTQ2MmFiNjNlMGIx%40thread.v2/0?context=%7b%22Tid%22%3a%222e9f06b0-1669-4589-8789-10a06934dc61%22%2c%22Oid%22%3a%221c4cc21f-0698-4756-b656-1d9b7595893a%22%7d" target="_blank">TEAMS-LINK</a></li>
          <li>July 4: In-person, ECCI, The Pod</li>
        </ul>
      <!-- </p> -->

      <p class="intro-paragraph">
          While no sign-up is required and drop-ins are possible, signing up helps us plan ahead. To have enough time for questions and to help you with your tasks, a session is limited to a max of 10 participants. You are welcome to join multiple sessions.
      </p>

      <p class="intro-paragraph">
          Sessions are open to everyone, so please don't hesitate to forward this invitation and mailing list. If you have any questions, please reach out to us. 
      </p>

      <p class="intro-paragraph" style="font-style: italic; font-size: 1rem;">
          Please note: To help improve the co-benefits atlas, we audio and video record the online training sessions and take notes during in-person sessions. Your participation in the training sessions indicates consent. Materials will be shared only among the atlas developer team at ECCI and the School of Informatics and, in case of use for scientific publication (e.g., summary of observations, quotes), will be fully anonymized. If you wish to exclude your quotes or examples, please contact us before or shortly after a session.
      </p>
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

.contact {
  margin-bottom: 70px;;
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