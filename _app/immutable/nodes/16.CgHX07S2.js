import{s as A,d as m,b as $,i as w,B as T,p as v,D as H,c as g,q as C,g as M,e as W,E as j,h as b,j as S,H as q,v as J,F as N,A as P}from"../chunks/ChnDNINx.js";import{S as I,i as k,d as D,t as L,a as B,m as F,c as O,b as R}from"../chunks/BjCzwqlE.js";import{b as x}from"../chunks/BA4G-MgR.js";import{N as z}from"../chunks/DVijoCt2.js";const V=typeof window<"u"?window:typeof globalThis<"u"?globalThis:global,{document:y}=V;function G(p){let i,h=`window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
        displayAlign: 'left',
        linebreaks: { automatic: true }
      },
      options: {
        renderActions: {
          addMenu: [] // disable context menu
        }
      }
    };
  `,n,l="",_,o,r,u,a,d,s;return r=new z({}),{c(){i=b("script"),i.textContent=h,n=b("script"),n.innerHTML=l,o=S(),R(r.$$.fragment),u=S(),a=b("div"),d=new q(!1),this.h()},l(t){const e=H("svelte-1e8m2m",y.head);i=g(e,"SCRIPT",{"data-svelte-h":!0}),C(i)!=="svelte-1dydvi"&&(i.textContent=h),n=g(e,"SCRIPT",{src:!0,"data-svelte-h":!0}),C(n)!=="svelte-1jz3o7s"&&(n.innerHTML=l),e.forEach(m),o=M(t),O(r.$$.fragment,t),u=M(t),a=g(t,"DIV",{class:!0});var f=W(a);d=j(f,!1),f.forEach(m),this.h()},h(){T(n.src,_="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js")||v(n,"src",_),d.a=null,v(a,"class","pandoc-html")},m(t,e){$(y.head,i),$(y.head,n),w(t,o,e),F(r,t,e),w(t,u,e),w(t,a,e),d.m(p[0],a),p[2](a),s=!0},p(t,[e]){(!s||e&1)&&d.p(t[0])},i(t){s||(B(r.$$.fragment,t),s=!0)},o(t){L(r.$$.fragment,t),s=!1},d(t){t&&(m(o),m(u),m(a)),m(i),m(n),D(r,t),p[2](null)}}}function K(p,i,h){let n="",l;J(async()=>{const r=await(await fetch(`${x}/methods.html`)).text(),a=new DOMParser().parseFromString(r,"text/html");a.querySelectorAll("img[src]").forEach(s=>{const t=s.getAttribute("src");t&&!t.startsWith("http://")&&!t.startsWith("https://")&&!t.startsWith("//")&&!t.startsWith(x)&&!t.startsWith("/")&&s.setAttribute("src",`${x}/${t}`)}),Array.from(a.querySelectorAll("h3")).forEach((s,t)=>{const e=document.createElement("details");t===0&&e.setAttribute("open","");const f=document.createElement("summary");f.textContent=s.textContent||"",e.appendChild(f);let c=s.nextElementSibling;for(;c&&c.tagName!=="H3"&&!(c.tagName==="SECTION"&&c.id==="footnotes");){const E=c.nextElementSibling;e.appendChild(c),c=E}s.replaceWith(e)}),h(0,n=a.body.innerHTML),await N(),window.MathJax&&typeof window.MathJax.startup?.promise?.then=="function"&&(await window.MathJax.startup.promise,await window.MathJax.typesetPromise([l]))});function _(o){P[o?"unshift":"push"](()=>{l=o,h(1,l)})}return[n,l,_]}class Z extends I{constructor(i){super(),k(this,i,K,G,A,{})}}export{Z as component};
