import{s as E,d as m,b as y,i as _,B as T,p as v,D as A,c as w,q as $,g as C,e as H,E as W,h as g,j as M,H as q,v as j,F as J,A as N}from"../chunks/ChnDNINx.js";import{S as P,i as I,d as k,t as D,a as L,m as B,c as F,b as O}from"../chunks/BjCzwqlE.js";import{b as x}from"../chunks/lhRKLYoL.js";import{N as R}from"../chunks/32xf2dDW.js";const z=typeof window<"u"?window:typeof globalThis<"u"?globalThis:global,{document:b}=z;function V(p){let i,h=`window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
        displayAlign: 'left',
        linebreaks: { automatic: true }
      },
      options: {
        renderActions: {
          addMenu: [] // disable context menu if needed
        }
      }
    };
  `,n,c="",f,l,o,u,a,d,s;return o=new R({}),{c(){i=g("script"),i.textContent=h,n=g("script"),n.innerHTML=c,l=M(),O(o.$$.fragment),u=M(),a=g("div"),d=new q(!1),this.h()},l(t){const e=A("svelte-3xvfya",b.head);i=w(e,"SCRIPT",{"data-svelte-h":!0}),$(i)!=="svelte-vpxqui"&&(i.textContent=h),n=w(e,"SCRIPT",{src:!0,"data-svelte-h":!0}),$(n)!=="svelte-1jz3o7s"&&(n.innerHTML=c),e.forEach(m),l=C(t),F(o.$$.fragment,t),u=C(t),a=w(t,"DIV",{class:!0});var r=H(a);d=W(r,!1),r.forEach(m),this.h()},h(){T(n.src,f="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js")||v(n,"src",f),d.a=null,v(a,"class","pandoc-html")},m(t,e){y(b.head,i),y(b.head,n),_(t,l,e),B(o,t,e),_(t,u,e),_(t,a,e),d.m(p[0],a),p[2](a),s=!0},p(t,[e]){(!s||e&1)&&d.p(t[0])},i(t){s||(L(o.$$.fragment,t),s=!0)},o(t){D(o.$$.fragment,t),s=!1},d(t){t&&(m(l),m(u),m(a)),m(i),m(n),k(o,t),p[2](null)}}}function G(p,i,h){let n="",c;j(async()=>{const o=await(await fetch(`${x}/methods.html`)).text(),a=new DOMParser().parseFromString(o,"text/html");a.querySelectorAll("img[src]").forEach(s=>{const t=s.getAttribute("src");t&&!t.startsWith("http://")&&!t.startsWith("https://")&&!t.startsWith("//")&&!t.startsWith(x)&&!t.startsWith("/")&&s.setAttribute("src",`${x}/${t}`)}),Array.from(a.querySelectorAll("h3")).forEach(s=>{const t=document.createElement("details"),e=document.createElement("summary");e.textContent=s.textContent||"",t.appendChild(e);let r=s.nextElementSibling;for(;r&&r.tagName!=="H3"&&!(r.tagName==="SECTION"&&r.id==="footnotes");){const S=r.nextElementSibling;t.appendChild(r),r=S}s.replaceWith(t)}),h(0,n=a.body.innerHTML),await J(),window.MathJax&&typeof window.MathJax.startup?.promise?.then=="function"&&(await window.MathJax.startup.promise,await window.MathJax.typesetPromise([c]))});function f(l){N[l?"unshift":"push"](()=>{c=l,h(1,c)})}return[n,c,f]}class Y extends P{constructor(i){super(),I(this,i,G,V,E,{})}}export{Y as component};
