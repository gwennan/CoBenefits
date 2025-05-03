<script lang="ts">
    import { base } from '$app/paths';
    import { onMount, tick } from 'svelte';
    import NavigationBar from '$lib/components/NavigationBar.svelte';
  
    let htmlContent: string = '';

    let container: HTMLDivElement;

    // onMount(async () => {
    // const res = await fetch(`${base}/methods.html`);
    // const rawHtml = await res.text();
    // htmlContent = rawHtml;

    // await tick(); // wait for DOM update
    // if (window.MathJax && container) {
    //     await window.MathJax.typesetPromise([container]);
    // }
    // });

    onMount(async () => {
        const res = await fetch(`${base}/methods.html`);
        const rawHtml = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // Fix <img src="..."> with base path
        doc.querySelectorAll('img[src]').forEach(img => {
            const src = img.getAttribute('src');
            if (
            src &&
            !src.startsWith('http://') &&
            !src.startsWith('https://') &&
            !src.startsWith('//') &&
            !src.startsWith(base) &&
            !src.startsWith('/')
            ) {
            img.setAttribute('src', `${base}/${src}`);
            }
        });

        htmlContent = doc.body.innerHTML;

        await tick();

        if (window.MathJax && typeof window.MathJax.startup?.promise?.then === 'function') {
                await window.MathJax.startup.promise;
                await window.MathJax.typesetPromise([container]);
            }
        });


  </script>
  
  <svelte:head>
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        displayAlign: 'left',
        linebreaks: { automatic: true }
      },
      options: {
        renderActions: {
          addMenu: [] // disable context menu if needed
        }
      }
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
</svelte:head>

  
  <NavigationBar />
  
  <div class="pandoc-html" bind:this={container}>
    {@html htmlContent}
  </div>
  
  <style>
  .pandoc-html {
  max-width: 1000px;
  margin: auto;
  padding: 1rem;
  line-height: 1.6;
  font-size: 1rem;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* Ensure math container doesn't overflow */
.pandoc-html .mjx-container {
  overflow-x: auto;
  max-width: 100%;
  white-space: normal;
  display: block;
}

/* Optional: Soft wrap inside equations */
.pandoc-html .mjx-mrow {
  white-space: normal !important;
}

.pandoc-html blockquote {
    align-items: start;
    text-align: start;
}
  </style>
  