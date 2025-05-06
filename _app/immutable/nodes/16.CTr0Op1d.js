import{s as A,e as w,a as $,H as T,D as H,c as g,p as v,f as m,g as C,b as W,E as q,C as I,q as M,h as S,i as b,v as J,F as N,A as P}from"../chunks/scheduler.GkBzG_tJ.js";import{S as j,i as k,c as D,b as L,m as F,t as O,a as R,d as z}from"../chunks/index.puHNmHGV.js";import{b as x}from"../chunks/paths.B69BYf6l.js";import{N as B}from"../chunks/NavigationBar.DIkruH83.js";const V=typeof window<"u"?window:typeof globalThis<"u"?globalThis:global,{document:y}=V;function G(p){let i,h=`window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
      },
      chtml: {
        displayAlign: 'left',
        displayIndent: '0em',
        linebreaks: { automatic: true }
      },
      options: {
        renderActions: {
          addMenu: [] // disable context menu
        }
      }
    };
  `,n,l="",_,o,r,u,a,d,s;return r=new B({}),{c(){i=w("script"),i.textContent=h,n=w("script"),n.innerHTML=l,o=$(),D(r.$$.fragment),u=$(),a=w("div"),d=new T(!1),this.h()},l(t){const e=H("svelte-sp5bra",y.head);i=g(e,"SCRIPT",{"data-svelte-h":!0}),v(i)!=="svelte-1wdi56k"&&(i.textContent=h),n=g(e,"SCRIPT",{src:!0,"data-svelte-h":!0}),v(n)!=="svelte-1jz3o7s"&&(n.innerHTML=l),e.forEach(m),o=C(t),L(r.$$.fragment,t),u=C(t),a=g(t,"DIV",{class:!0});var f=W(a);d=q(f,!1),f.forEach(m),this.h()},h(){I(n.src,_="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js")||M(n,"src",_),d.a=null,M(a,"class","pandoc-html")},m(t,e){S(y.head,i),S(y.head,n),b(t,o,e),F(r,t,e),b(t,u,e),b(t,a,e),d.m(p[0],a),p[2](a),s=!0},p(t,[e]){(!s||e&1)&&d.p(t[0])},i(t){s||(O(r.$$.fragment,t),s=!0)},o(t){R(r.$$.fragment,t),s=!1},d(t){t&&(m(o),m(u),m(a)),m(i),m(n),z(r,t),p[2](null)}}}function K(p,i,h){let n="",l;J(async()=>{const r=await(await fetch(`${x}/methods-doc.html`)).text(),a=new DOMParser().parseFromString(r,"text/html");a.querySelectorAll("img[src]").forEach(s=>{const t=s.getAttribute("src");t&&!t.startsWith("http://")&&!t.startsWith("https://")&&!t.startsWith("//")&&!t.startsWith(x)&&!t.startsWith("/")&&s.setAttribute("src",`${x}/${t}`)}),Array.from(a.querySelectorAll("h3")).forEach((s,t)=>{const e=document.createElement("details");t===0&&e.setAttribute("open","");const f=document.createElement("summary");f.textContent=s.textContent||"",e.appendChild(f);let c=s.nextElementSibling;for(;c&&c.tagName!=="H3"&&!(c.tagName==="SECTION"&&c.id==="footnotes");){const E=c.nextElementSibling;e.appendChild(c),c=E}s.replaceWith(e)}),h(0,n=a.body.innerHTML),await N(),window.MathJax&&typeof window.MathJax.startup?.promise?.then=="function"&&(await window.MathJax.startup.promise,await window.MathJax.typesetPromise([l]))});function _(o){P[o?"unshift":"push"](()=>{l=o,h(1,l)})}return[n,l,_]}class Z extends j{constructor(i){super(),k(this,i,K,G,A,{})}}export{Z as component};
