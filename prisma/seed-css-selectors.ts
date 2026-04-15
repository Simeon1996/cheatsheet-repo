import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "CSS Selectors", userId: null },
  });

  const selectors = await prisma.category.create({
    data: {
      name: "CSS Selectors",
      icon: "🎯",
      color: "orange",
      description: "Every CSS selector type — basic, combinators, attribute, pseudo-classes, pseudo-elements and the new :is() :has() :where() family",
      isPublic: true,
      snippets: {
        create: [
          // ── Basic Selectors ───────────────────────────────────────────────────
          {
            title: "Basic Selectors",
            description: "Type, class, ID, universal and grouping",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Type, class, ID and universal",
                  content: `/* Type selector — matches element name */
p { color: #333; }
h1, h2, h3 { font-weight: bold; }

/* Class selector — matches class attribute */
.card { border-radius: 8px; }
.btn.btn-primary { background: blue; } /* element must have BOTH classes */

/* ID selector — matches unique id attribute */
#navbar { position: sticky; top: 0; }

/* Universal selector — matches everything */
* { box-sizing: border-box; }
*.highlight { background: yellow; } /* same as .highlight */

/* Grouping — comma-separated list */
h1, h2, h3,
.title,
#hero-heading {
  font-family: "Inter", sans-serif;
}`,
                },
              ],
            },
          },
          // ── Combinators ───────────────────────────────────────────────────────
          {
            title: "Combinators",
            description: "Descendant, child, adjacent sibling and general sibling",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Descendant combinator (space)",
                  content: `/* Matches any p inside .card, no matter how deeply nested */
.card p { margin-bottom: 8px; }

/* Any em inside a blockquote */
blockquote em { font-style: normal; font-weight: bold; }`,
                },
                {
                  order: 1, language: "css", label: "Child combinator >",
                  content: `/* Matches p that is a DIRECT child of .card only */
.card > p { margin-bottom: 8px; }

/* Direct li children of ul only — not nested lists */
ul > li { list-style: disc; }

/* Menu items at the top level only */
nav > ul > li > a { font-weight: 600; }`,
                },
                {
                  order: 2, language: "css", label: "Adjacent sibling combinator +",
                  content: `/* Matches the FIRST p immediately after an h2 */
h2 + p { font-size: 1.1em; color: #555; }

/* Remove margin-top from first element after a heading */
h1 + *, h2 + *, h3 + * { margin-top: 0; }

/* Label immediately after a checkbox */
input[type="checkbox"] + label { cursor: pointer; }`,
                },
                {
                  order: 3, language: "css", label: "General sibling combinator ~",
                  content: `/* Matches ALL p elements that are siblings after an h2 */
h2 ~ p { color: #444; }

/* All siblings after a :checked checkbox */
input:checked ~ .drawer { display: block; }

/* All .item siblings after .item--active */
.item--active ~ .item { opacity: 0.5; }`,
                },
              ],
            },
          },
          // ── Attribute Selectors ───────────────────────────────────────────────
          {
            title: "Attribute Selectors",
            description: "Target elements by their HTML attributes and values",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Presence and exact match",
                  content: `/* [attr] — element has the attribute (any value) */
a[href]       { color: blue; }        /* links with an href */
input[required] { border-color: red; } /* required inputs */
button[disabled] { opacity: 0.5; }

/* [attr="value"] — exact match */
input[type="text"]     { border: 1px solid #ccc; }
input[type="checkbox"] { width: 16px; height: 16px; }
a[rel="noopener"]      { text-decoration: underline; }`,
                },
                {
                  order: 1, language: "css", label: "Substring matching",
                  content: `/* [attr^="value"] — starts with */
a[href^="https"] { /* secure links */ }
a[href^="mailto"] { /* email links */ }
a[href^="tel"]    { /* phone links */ }
[class^="icon-"]  { font-family: "Icons"; }

/* [attr$="value"] — ends with */
a[href$=".pdf"]  { /* PDF links */ }
a[href$=".zip"]  { /* download links */ }
img[src$=".svg"] { /* SVG images */ }

/* [attr*="value"] — contains anywhere */
a[href*="example.com"] { font-weight: bold; }
[class*="--modifier"]  { /* BEM modifiers */ }`,
                },
                {
                  order: 2, language: "css", label: "List and hyphen matching",
                  content: `/* [attr~="value"] — value is in a space-separated list */
/* Useful for multi-value attributes like class or rel */
[rel~="noopener"] { }      /* matches rel="noopener noreferrer" */
[data-tags~="js"] { }      /* matches data-tags="css js html" */

/* [attr|="value"] — equals value OR starts with value- */
/* Most common use: language codes */
[lang|="en"] { font-family: serif; }  /* matches en, en-US, en-GB */
[lang|="zh"] { font-family: "Noto"; } /* matches zh, zh-CN, zh-TW */

/* Case-insensitive matching with i flag */
a[href$=".PDF" i] { }  /* matches .pdf .PDF .Pdf */`,
                },
              ],
            },
          },
          // ── Pseudo-classes: State ─────────────────────────────────────────────
          {
            title: "Pseudo-classes — State",
            description: "User interaction and element state selectors",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Link and user-action states",
                  content: `/* Link states — order matters: LVHA */
a:link    { color: blue; }           /* unvisited */
a:visited { color: purple; }         /* visited */
a:hover   { text-decoration: none; } /* mouse over */
a:active  { color: red; }            /* being clicked */

/* Keyboard focus */
:focus         { outline: 2px solid blue; }
:focus-visible { outline: 2px solid blue; } /* only for keyboard, not mouse */
:focus-within  { background: #f0f4ff; }     /* ancestor of focused element */

/* Interactive states */
button:hover    { background: #0056b3; }
button:active   { transform: scale(0.98); }
input:disabled  { opacity: 0.5; cursor: not-allowed; }
input:enabled   { cursor: text; }
input:read-only { background: #f5f5f5; }`,
                },
                {
                  order: 1, language: "css", label: "Form and input states",
                  content: `/* Validity */
input:valid   { border-color: green; }
input:invalid { border-color: red; }

/* Only show validation after user interaction */
input:not(:focus):not(:placeholder-shown):invalid {
  border-color: red;
}

/* Required / optional */
input:required { border-left: 3px solid orange; }
input:optional { border-left: 3px solid #ccc; }

/* Checkbox / radio states */
input:checked           { accent-color: blue; }
input:indeterminate     { opacity: 0.7; }  /* partially checked */

/* Range and number */
input:in-range     { border-color: green; }
input:out-of-range { border-color: red; }

/* Placeholder shown */
input:placeholder-shown { font-style: italic; }`,
                },
              ],
            },
          },
          // ── Pseudo-classes: Structural ────────────────────────────────────────
          {
            title: "Pseudo-classes — Structural",
            description: "Select elements by their position in the document tree",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "First, last and only child",
                  content: `/* Child position */
li:first-child  { font-weight: bold; }
li:last-child   { border-bottom: none; }
li:only-child   { margin: auto; }

/* Type-specific position */
p:first-of-type { font-size: 1.1em; }  /* first p among siblings */
p:last-of-type  { margin-bottom: 0; }
p:only-of-type  { text-align: center; }

/* Remove margin from last child — classic pattern */
.card > *:last-child  { margin-bottom: 0; }
.stack > * + *        { margin-top: 16px; } /* lobotomised owl */`,
                },
                {
                  order: 1, language: "css", label: "nth-child and nth-of-type",
                  content: `/* :nth-child(An+B) — A=step, B=offset */

li:nth-child(1)    { }   /* first item */
li:nth-child(2)    { }   /* second item */
li:nth-child(-n+3) { }   /* first 3 items */
li:nth-child(n+4)  { }   /* from 4th item onwards */

/* Keywords */
li:nth-child(odd)  { background: #f9f9f9; }  /* 1,3,5,7... */
li:nth-child(even) { background: #ffffff; }  /* 2,4,6,8... */

/* Every 3rd, starting from 3 */
li:nth-child(3n)   { border-bottom: 2px solid; }

/* Every 3rd, starting from 1 (1,4,7,10...) */
li:nth-child(3n+1) { font-weight: bold; }

/* nth-of-type — counts only elements of matching type */
p:nth-of-type(2)      { color: blue; }  /* second p, ignores other siblings */
img:nth-of-type(odd)  { float: left; }

/* From the end */
li:nth-last-child(2)      { }  /* second to last */
li:nth-last-of-type(1)    { }  /* same as last-of-type */`,
                },
                {
                  order: 2, language: "css", label: "Empty, root and scope",
                  content: `/* :empty — no children (including text nodes) */
td:empty    { background: #f5f5f5; }
p:empty     { display: none; }

/* :root — the document root (<html>) */
:root {
  --color-primary: #3b82f6;
  --spacing-unit: 8px;
  font-size: 16px;
}

/* :target — element whose ID matches the URL hash */
/* e.g. https://example.com/page#section-2 */
:target {
  scroll-margin-top: 80px;
  outline: 3px solid var(--color-primary);
}

/* :scope — the element being styled (useful in @scope) */
@scope (.card) {
  :scope { border-radius: 8px; }   /* the .card itself */
  p { margin: 0; }                  /* p inside .card only */
}`,
                },
              ],
            },
          },
          // ── :is(), :not(), :has(), :where() ──────────────────────────────────
          {
            title: "Modern Pseudo-classes",
            description: ":is(), :not(), :has(), :where() and :any-link",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: ":is() — match any in a list",
                  content: `/* :is() takes a selector list — specificity is the highest in the list */

/* Without :is() */
header h1, header h2, header h3,
footer h1, footer h2, footer h3,
main   h1, main   h2, main   h3 { color: navy; }

/* With :is() — much shorter */
:is(header, footer, main) :is(h1, h2, h3) { color: navy; }

/* Forgiving — invalid selectors are ignored, rest still work */
:is(h1, h2, :unsupported-selector, h3) { font-weight: bold; }

/* Nest heading styles cleanly */
:is(h1, h2, h3, h4) {
  font-family: "Inter", sans-serif;
  line-height: 1.2;
}`,
                },
                {
                  order: 1, language: "css", label: ":not() — exclude elements",
                  content: `/* Single argument */
a:not([href])     { color: gray; }     /* anchor without href */
li:not(:last-child) { border-bottom: 1px solid #eee; }
input:not([type="submit"]) { border: 1px solid #ccc; }

/* Multiple arguments (CSS Selectors Level 4) */
p:not(.intro, .outro) { text-indent: 1.5em; }

/* Chain :not() calls for older browsers */
p:not(.intro):not(.outro) { text-indent: 1.5em; }

/* Exclude multiple elements from styling */
:is(h1,h2,h3,h4,h5,h6):not(.no-anchor)::before {
  content: "#";
  margin-right: 8px;
  opacity: 0.3;
}`,
                },
                {
                  order: 2, language: "css", label: ":has() — parent and relational selector",
                  content: `/* :has() styles an element based on what it CONTAINS */
/* Often called the "parent selector" CSS never had */

/* Card that contains an image gets different padding */
.card:has(img) { padding: 0; }
.card:has(> img:first-child) { border-radius: 8px 8px 0 0; }

/* Form groups with errors */
.form-group:has(input:invalid) label { color: red; }
.form-group:has(input:invalid)::after {
  content: "Required";
  color: red;
}

/* Navigation with active descendant */
nav li:has(> a[aria-current="page"]) { background: #f0f4ff; }

/* Figure without a caption */
figure:not(:has(figcaption)) img { border-radius: 8px; }

/* Select previous sibling (was impossible before :has) */
/* Style h2 when followed immediately by a table */
h2:has(+ table) { margin-bottom: 4px; }

/* Article with more than one paragraph */
article:has(p ~ p) { column-count: 2; }`,
                },
                {
                  order: 3, language: "css", label: ":where() — zero-specificity grouping",
                  content: `/* :where() is identical to :is() but ALWAYS has 0 specificity */
/* Use it for base/reset styles that are easy to override */

/* Reset margins on common elements — easily overridden */
:where(h1, h2, h3, h4, h5, h6) { margin: 0; }
:where(p, ul, ol, figure)       { margin: 0; }
:where(a) { color: inherit; text-decoration: none; }

/* vs :is() which inherits the specificity of its most specific argument */
:is(#main, .content) p   { color: blue; } /* specificity: 1,0,1 */
:where(#main, .content) p { color: blue; } /* specificity: 0,0,1 — easy to override */

/* Theme baseline that components can always override */
:where(.btn) {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}`,
                },
                {
                  order: 4, language: "css", label: ":any-link, :local-link and :visited",
                  content: `/* :any-link — matches any a, area, or link with href */
/* Equivalent to :is(:link, :visited) */
:any-link { color: blue; text-decoration: underline; }
:any-link:hover { text-decoration: none; }

/* Useful when you want to style all links regardless of visited state */
:any-link { color: var(--color-link); }

/* :link — unvisited links only */
a:link { color: #0066cc; }

/* :visited — only visited links */
a:visited { color: #551a8b; }`,
                },
              ],
            },
          },
          // ── Pseudo-elements ───────────────────────────────────────────────────
          {
            title: "Pseudo-elements",
            description: "Style specific parts of elements with ::before, ::after and friends",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "::before and ::after",
                  content: `/* Insert generated content before/after element content */
/* Must have content property — even content: "" for decorative use */

/* Icon before links */
a[href^="https"]::before {
  content: "🔒 ";
}

/* Decorative separator between items */
li:not(:last-child)::after {
  content: " •";
  margin-left: 8px;
  color: #999;
}

/* Quote marks */
blockquote::before { content: open-quote; font-size: 3em; line-height: 0; }
blockquote::after  { content: close-quote; }

/* Clearfix */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* Overlay using ::before */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
}`,
                },
                {
                  order: 1, language: "css", label: "::placeholder, ::selection and ::marker",
                  content: `/* ::placeholder — style input placeholder text */
input::placeholder {
  color: #999;
  font-style: italic;
}

::placeholder { opacity: 1; } /* Firefox reduces opacity by default */

/* ::selection — text selected by user */
::selection {
  background: #3b82f6;
  color: white;
}

p::selection { background: #fef08a; color: #000; }

/* ::marker — list item bullet or number */
li::marker {
  color: #3b82f6;
  font-weight: bold;
}

/* Custom counter */
ol { counter-reset: steps; }
li { counter-increment: steps; }
li::marker { content: "Step " counter(steps) ": "; }`,
                },
                {
                  order: 2, language: "css", label: "::first-line, ::first-letter and ::backdrop",
                  content: `/* ::first-line — style the first rendered line of a block */
p::first-line {
  font-variant: small-caps;
  letter-spacing: 0.05em;
}

/* ::first-letter — style the first letter (drop cap) */
p:first-of-type::first-letter {
  font-size: 3em;
  font-weight: bold;
  float: left;
  line-height: 0.8;
  margin-right: 8px;
}

/* ::backdrop — full-screen backdrop behind dialog/<details> */
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* ::file-selector-button — the button inside <input type="file"> */
input[type="file"]::file-selector-button {
  padding: 4px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}`,
                },
              ],
            },
          },
          // ── Specificity ───────────────────────────────────────────────────────
          {
            title: "Specificity",
            description: "How browsers decide which rule wins when selectors conflict",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Specificity scoring (A, B, C)",
                  content: `/*
  Specificity is a 3-part score: (A, B, C)

  A — ID selectors              #nav          = (1,0,0)
  B — class, attribute, pseudo-class
      .card  [type]  :hover     each          = (0,1,0)
  C — type and pseudo-element
      div  p  ::before          each          = (0,0,1)

  Universal * and combinators (> + ~ space) contribute 0.
  :is() :not() :has() take specificity of their most specific argument.
  :where() always contributes (0,0,0).

  Examples:
  h1                           = (0,0,1)
  .card                        = (0,1,0)
  .card h1                     = (0,1,1)
  #navbar                      = (1,0,0)
  #navbar .link:hover          = (1,1,1)
  style="" attribute           = (1,0,0,0) — inline style, separate layer
  !important                   overrides everything (avoid)
*/`,
                },
                {
                  order: 1, language: "css", label: "Cascade layers — @layer",
                  content: `/* @layer gives you explicit cascade control without fighting specificity */

/* Declare layer order — later layers win */
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}

@layer base {
  a { color: blue; }           /* lower priority than components */
}

@layer components {
  .btn { padding: 8px 16px; }  /* wins over base, loses to utilities */
}

@layer utilities {
  .mt-4 { margin-top: 16px !important; } /* highest priority layer */
}

/* Unlayered styles beat ALL layers */
a { color: red; } /* this wins over @layer base a { color: blue; } */`,
                },
                {
                  order: 2, language: "css", label: "Specificity tips and tricks",
                  content: `/* Bump specificity without adding meaning */

/* Repeat class — unusual but valid */
.card.card { color: blue; } /* (0,2,0) — beats .card */

/* :is() trick to match current element with higher specificity */
:is(#root) .card { }   /* (1,1,0) — the #root raises specificity */

/* Use :where() to write reusable low-specificity base styles */
:where(.btn) { padding: 8px; }  /* (0,0,0) — any rule beats this */

/* Avoid !important — use it only to override 3rd party styles */
/* If you need !important, use @layer instead */

/* Debugging: which rule is winning? */
/* Open DevTools → Elements → Computed → click the property */`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created CSS Selectors cheatsheet: ${selectors.name} (${selectors.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
