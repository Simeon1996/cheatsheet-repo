import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "JavaScript DOM API", userId: null },
  });

  const dom = await prisma.category.create({
    data: {
      name: "JavaScript DOM API",
      icon: "🌐",
      color: "yellow",
      description: "Querying, manipulating, traversing and observing the DOM — plus events, forms, dimensions and modern APIs",
      isPublic: true,
      snippets: {
        create: [
          // ── Querying the DOM ──────────────────────────────────────────────────
          {
            title: "Querying the DOM",
            description: "Find elements with selectors, IDs, tags and relationships",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "querySelector and querySelectorAll",
                  content: `// Returns the FIRST matching element (or null)
const btn    = document.querySelector(".btn");
const input  = document.querySelector("input[type='email']");
const active = document.querySelector("nav a.active");

// Scoped to a subtree
const card    = document.querySelector(".card");
const heading = card.querySelector("h2");  // search inside .card only

// Returns a static NodeList of ALL matches
const items   = document.querySelectorAll("li");
const checked = document.querySelectorAll("input:checked");

// NodeList → Array (for array methods)
const arr = Array.from(document.querySelectorAll(".item"));
const arr2 = [...document.querySelectorAll(".item")];

arr.filter(el => el.dataset.active === "true");`,
                },
                {
                  order: 1, language: "javascript", label: "getElementById, getElementsBy*",
                  content: `// By ID — fastest lookup, returns element or null
const nav = document.getElementById("navbar");

// By tag — returns live HTMLCollection
const divs   = document.getElementsByTagName("div");
const inputs = document.getElementsByTagName("input");

// By class — returns live HTMLCollection
const cards = document.getElementsByClassName("card");

// Live HTMLCollection updates automatically when DOM changes
// (unlike querySelectorAll which is static)
const items = document.getElementsByClassName("item");
console.log(items.length); // 3
document.querySelector(".item").remove();
console.log(items.length); // 2 — updates automatically`,
                },
                {
                  order: 2, language: "javascript", label: "matches(), closest() and contains()",
                  content: `const el = document.querySelector(".btn");

// Does this element match a selector?
el.matches(".btn");                 // true
el.matches(".btn.btn-primary");     // true/false
el.matches(":hover");               // true if hovered

// Walk UP the tree to find nearest ancestor matching selector
// Returns the element itself if it matches, or null
el.closest(".card");                // nearest .card ancestor
el.closest("[data-modal]");
el.closest("form");

// Practical: event delegation
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn");
  if (!btn) return;
  handleButtonClick(btn);
});

// Does node contain another node?
document.body.contains(el);        // true
card.contains(btn);                 // true if btn is inside card`,
                },
              ],
            },
          },
          // ── Creating & Modifying Elements ─────────────────────────────────────
          {
            title: "Creating & Modifying Elements",
            description: "Create, clone, insert and remove DOM nodes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "createElement and insertAdjacentElement",
                  content: `// Create element
const div  = document.createElement("div");
const text = document.createTextNode("Hello");
const frag = document.createDocumentFragment(); // batched insert

// Build element
div.className  = "card";
div.id         = "card-1";
div.textContent = "Hello";

// Append children
div.appendChild(text);
div.append("text", anotherEl, fragment);  // multiple, mixed types
div.prepend(headerEl);                    // insert at beginning

// insertAdjacentElement — precise placement
// "beforebegin" — before the element itself
// "afterbegin"  — inside, before first child
// "beforeend"   — inside, after last child
// "afterend"    — after the element itself
el.insertAdjacentElement("afterend", newEl);
el.insertAdjacentHTML("beforeend", "<p>Hello</p>");
el.insertAdjacentText("afterbegin", "Label: ");

// Modern: before(), after(), replaceWith()
referenceEl.before(newEl);
referenceEl.after(newEl1, newEl2);
oldEl.replaceWith(newEl);`,
                },
                {
                  order: 1, language: "javascript", label: "innerHTML, textContent and innerText",
                  content: `const el = document.querySelector(".output");

// innerHTML — parses HTML string (XSS risk with user data!)
el.innerHTML = "<strong>Bold</strong> text";
el.innerHTML = "";  // clear all children

// Safe alternative for user-supplied content
el.textContent = userInput;  // always treated as plain text, never parsed

// innerText — respects CSS (visibility, display:none), triggers reflow
// textContent — raw text including hidden elements, faster
el.innerText;    // "Visible text"
el.textContent;  // "Visible text\nHidden text"

// Safe HTML insertion (modern browsers)
const safe = document.createElement("div");
safe.setHTMLUnsafe(trustedHTML);  // parse HTML safely
// or use a library: DOMPurify.sanitize(userHTML)

// Clone a node
const clone = el.cloneNode(true);   // deep clone (includes children)
const shell = el.cloneNode(false);  // shallow (element only)`,
                },
                {
                  order: 2, language: "javascript", label: "Removing elements and child manipulation",
                  content: `// Remove element from DOM
el.remove();

// Remove child
parent.removeChild(child);

// Replace child
parent.replaceChild(newChild, oldChild);

// Clear all children — fastest method
el.replaceChildren();          // modern, removes all children
while (el.firstChild) {        // compatible, also works
  el.removeChild(el.firstChild);
}

// Move element (inserting an existing node moves it)
newParent.append(existingEl);  // removes from old parent automatically

// Check if element is in the document
document.contains(el);         // true if attached to DOM
el.isConnected;                 // modern equivalent`,
                },
              ],
            },
          },
          // ── Attributes, Classes & Styles ──────────────────────────────────────
          {
            title: "Attributes, Classes & Styles",
            description: "Read and write attributes, class lists and inline styles",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Attributes",
                  content: `const el = document.querySelector("input");

// Get / set / remove attributes
el.getAttribute("type");           // "text"
el.setAttribute("placeholder", "Search…");
el.removeAttribute("disabled");
el.hasAttribute("required");       // true/false
el.toggleAttribute("disabled");    // toggle boolean attribute

// Property vs attribute (they can differ)
input.value;                       // current value (live property)
input.getAttribute("value");       // original default value

// Dataset — data-* attributes
// <div data-user-id="42" data-is-admin="true">
el.dataset.userId;                 // "42"
el.dataset.isAdmin;                // "true" (always a string)
el.dataset.newKey = "value";       // sets data-new-key="value"
delete el.dataset.userId;          // removes data-user-id

// All attributes as NamedNodeMap
[...el.attributes].map(a => \`\${a.name}=\${a.value}\`);`,
                },
                {
                  order: 1, language: "javascript", label: "classList",
                  content: `const el = document.querySelector(".card");

el.classList.add("active");
el.classList.add("visible", "highlighted");   // multiple
el.classList.remove("hidden");
el.classList.remove("a", "b");                // multiple
el.classList.toggle("open");                   // add if absent, remove if present
el.classList.toggle("open", condition);        // force add/remove
el.classList.replace("old-class", "new-class");
el.classList.contains("active");              // true/false

// Iterate classes
[...el.classList].forEach(cls => console.log(cls));

// className — set/replace all classes at once
el.className = "card card--featured";
el.className += " is-active";`,
                },
                {
                  order: 2, language: "javascript", label: "Inline styles and computed styles",
                  content: `const el = document.querySelector(".box");

// Set inline styles (camelCase)
el.style.backgroundColor = "#3b82f6";
el.style.marginTop       = "16px";
el.style.transform       = "translateX(100px)";
el.style.cssText         = "color: red; font-size: 14px;"; // replace all

// Remove inline style
el.style.backgroundColor = "";  // reset to stylesheet value

// Set CSS custom properties
el.style.setProperty("--color-primary", "#3b82f6");
el.style.getPropertyValue("--color-primary");
el.style.removeProperty("--color-primary");

// Computed style — final resolved value after all CSS applied
const computed = getComputedStyle(el);
computed.fontSize;           // "16px"
computed.display;            // "flex"
computed.getPropertyValue("--color-primary"); // custom prop`,
                },
              ],
            },
          },
          // ── Events ───────────────────────────────────────────────────────────
          {
            title: "Events",
            description: "Add listeners, delegate events and work with the event object",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "addEventListener and removeEventListener",
                  content: `const btn = document.querySelector(".btn");

// Add listener
btn.addEventListener("click", handleClick);
btn.addEventListener("click", handleClick, { once: true });    // fires once then removes itself
btn.addEventListener("click", handleClick, { passive: true }); // can't call preventDefault (scroll perf)
btn.addEventListener("click", handleClick, { capture: true }); // capture phase (top-down)

// Remove listener — must pass same function reference
btn.removeEventListener("click", handleClick);

// Arrow functions can't be removed — store reference
const handler = (e) => console.log(e.target);
btn.addEventListener("click", handler);
btn.removeEventListener("click", handler); // works

// AbortController — cleanly remove multiple listeners
const controller = new AbortController();
btn.addEventListener("click", handler, { signal: controller.signal });
document.addEventListener("keydown", handler, { signal: controller.signal });
controller.abort(); // removes ALL listeners registered with this signal`,
                },
                {
                  order: 1, language: "javascript", label: "Event object and common properties",
                  content: `document.addEventListener("click", (e) => {
  e.target;           // element that was actually clicked
  e.currentTarget;    // element the listener is attached to
  e.type;             // "click"
  e.timeStamp;        // ms since page load

  e.preventDefault(); // stop default action (link navigation, form submit)
  e.stopPropagation(); // stop event bubbling up to parents
  e.stopImmediatePropagation(); // stop other listeners on same element too

  // Mouse events
  e.clientX; e.clientY;   // viewport coordinates
  e.pageX;   e.pageY;     // document coordinates
  e.offsetX; e.offsetY;   // relative to target element
  e.button;               // 0=left 1=middle 2=right
  e.ctrlKey; e.shiftKey; e.altKey; e.metaKey; // modifier keys

  // Keyboard events
  e.key;       // "Enter", "ArrowUp", "a"
  e.code;      // "KeyA", "Enter" (physical key)
  e.repeat;    // true if key held down

  // Touch events
  e.touches[0].clientX;
  e.changedTouches[0].clientY;
});`,
                },
                {
                  order: 2, language: "javascript", label: "Event delegation",
                  content: `// Attach ONE listener to a parent instead of many to children.
// Works for dynamically added elements too.

const list = document.querySelector("#todo-list");

list.addEventListener("click", (e) => {
  // Delete button
  const deleteBtn = e.target.closest("[data-action='delete']");
  if (deleteBtn) {
    const item = deleteBtn.closest("li");
    item.remove();
    return;
  }

  // Checkbox toggle
  const checkbox = e.target.closest("input[type='checkbox']");
  if (checkbox) {
    const item = checkbox.closest("li");
    item.classList.toggle("done", checkbox.checked);
  }
});

// Dispatch custom events
const event = new CustomEvent("item:deleted", {
  bubbles: true,
  detail: { id: 42, title: "Buy milk" },
});
el.dispatchEvent(event);

document.addEventListener("item:deleted", (e) => {
  console.log(e.detail.id);  // 42
});`,
                },
                {
                  order: 3, language: "javascript", label: "Common event types",
                  content: `// Mouse
el.addEventListener("click",       handler);
el.addEventListener("dblclick",    handler);
el.addEventListener("mousedown",   handler);
el.addEventListener("mouseup",     handler);
el.addEventListener("mousemove",   handler);
el.addEventListener("mouseenter",  handler); // doesn't bubble
el.addEventListener("mouseleave",  handler); // doesn't bubble
el.addEventListener("mouseover",   handler); // bubbles (includes children)
el.addEventListener("contextmenu", handler);

// Keyboard (on document or focused element)
document.addEventListener("keydown",  handler);
document.addEventListener("keyup",    handler);
document.addEventListener("keypress", handler); // deprecated

// Form
form.addEventListener("submit",  handler);  // before form sends
input.addEventListener("input",  handler);  // every keystroke
input.addEventListener("change", handler);  // on blur after change
input.addEventListener("focus",  handler);
input.addEventListener("blur",   handler);

// Document / Window
document.addEventListener("DOMContentLoaded", handler); // DOM ready
window.addEventListener("load",   handler);  // page + assets loaded
window.addEventListener("resize", handler);
window.addEventListener("scroll", handler);
window.addEventListener("beforeunload", handler);

// Pointer (unified mouse + touch + stylus)
el.addEventListener("pointerdown", handler);
el.addEventListener("pointerup",   handler);
el.addEventListener("pointermove", handler);`,
                },
              ],
            },
          },
          // ── Traversal ─────────────────────────────────────────────────────────
          {
            title: "DOM Traversal",
            description: "Navigate the DOM tree — parents, children and siblings",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Parent, children and siblings",
                  content: `const el = document.querySelector(".item");

// Parents
el.parentElement;                  // direct parent element
el.parentNode;                     // direct parent node (could be document)
el.closest(".list");               // nearest ancestor matching selector

// Children
el.children;                       // HTMLCollection of element children only
el.childNodes;                     // NodeList including text/comment nodes
el.firstElementChild;              // first element child
el.lastElementChild;               // last element child
el.childElementCount;              // number of element children

// Siblings
el.previousElementSibling;        // previous element sibling
el.nextElementSibling;             // next element sibling

// Iterate children
for (const child of el.children) { }
[...el.children].forEach(child => { });
Array.from(el.children).filter(c => c.matches(".active"));`,
                },
                {
                  order: 1, language: "javascript", label: "Node types and properties",
                  content: `const el = document.querySelector("p");

// Node type constants
el.nodeType;           // 1 = ELEMENT_NODE
el.nodeType === Node.ELEMENT_NODE;  // true
// 3 = TEXT_NODE, 8 = COMMENT_NODE, 9 = DOCUMENT_NODE

el.nodeName;           // "P" (tag name in uppercase)
el.nodeValue;          // null for elements, text content for text nodes
el.textContent;        // text content of element and all descendants

// Check node types while traversing
function walkText(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    console.log(node.nodeValue);
  }
  for (const child of node.childNodes) {
    walkText(child);
  }
}`,
                },
              ],
            },
          },
          // ── Dimensions & Scroll ───────────────────────────────────────────────
          {
            title: "Dimensions & Scroll",
            description: "Measure elements and control scroll position",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "getBoundingClientRect and element dimensions",
                  content: `const el = document.querySelector(".card");

// Precise position and size (relative to viewport)
const rect = el.getBoundingClientRect();
rect.top;     // distance from top of viewport
rect.left;    // distance from left of viewport
rect.bottom;  // rect.top + rect.height
rect.right;   // rect.left + rect.width
rect.width;   // includes padding + border
rect.height;

// Is element visible in viewport?
const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

// Offset dimensions (relative to offset parent, includes padding)
el.offsetWidth;   // width  including padding + border
el.offsetHeight;  // height including padding + border
el.offsetTop;     // distance from top of offset parent
el.offsetLeft;

// Scroll dimensions (full scrollable area)
el.scrollWidth;   // full width including overflow
el.scrollHeight;  // full height including overflow
el.scrollTop;     // pixels scrolled from top
el.scrollLeft;    // pixels scrolled from left

// Client dimensions (visible area, includes padding, excludes border/scrollbar)
el.clientWidth;
el.clientHeight;

// Viewport size
window.innerWidth;
window.innerHeight;`,
                },
                {
                  order: 1, language: "javascript", label: "Scrolling",
                  content: `// Scroll window
window.scrollTo({ top: 500, behavior: "smooth" });
window.scrollBy({ top: 100, behavior: "smooth" });
window.scrollTo(0, 0);  // jump to top

// Scroll element into view
el.scrollIntoView();
el.scrollIntoView({ behavior: "smooth", block: "start" });
el.scrollIntoView({ behavior: "smooth", block: "center" });
// block:  "start" | "center" | "end" | "nearest"
// inline: "start" | "center" | "end" | "nearest"

// Scroll a scrollable container
container.scrollTo({ top: 0, behavior: "smooth" });
container.scrollBy({ top: 200, left: 0, behavior: "smooth" });

// Current scroll position
window.scrollY;     // vertical scroll (same as pageYOffset)
window.scrollX;     // horizontal scroll
document.documentElement.scrollTop; // also works`,
                },
              ],
            },
          },
          // ── Observers ────────────────────────────────────────────────────────
          {
            title: "Observers",
            description: "IntersectionObserver, MutationObserver and ResizeObserver",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "IntersectionObserver — detect visibility",
                  content: `// Fires when element enters/leaves the viewport (or a custom root)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target); // stop after first trigger
    }
  });
}, {
  root: null,            // null = viewport
  rootMargin: "0px",     // expand/contract root bounds
  threshold: 0.1,        // 0–1: fraction visible before callback fires
  // threshold: [0, 0.25, 0.5, 0.75, 1] — fire at multiple points
});

// Observe elements
document.querySelectorAll(".animate-on-scroll").forEach(el => {
  observer.observe(el);
});

// Lazy load images
const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    target.src = target.dataset.src;
    imgObserver.unobserve(target);
  });
}, { rootMargin: "200px" }); // load 200px before entering viewport`,
                },
                {
                  order: 1, language: "javascript", label: "MutationObserver — watch DOM changes",
                  content: `// Fires when the DOM tree changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach(node => console.log("Added:", node));
      mutation.removedNodes.forEach(node => console.log("Removed:", node));
    }
    if (mutation.type === "attributes") {
      console.log(\`\${mutation.attributeName} changed to:\`,
        mutation.target.getAttribute(mutation.attributeName));
    }
    if (mutation.type === "characterData") {
      console.log("Text changed:", mutation.target.nodeValue);
    }
  });
});

observer.observe(document.body, {
  childList: true,       // direct children added/removed
  subtree: true,         // all descendants
  attributes: true,      // attribute changes
  attributeFilter: ["class", "data-state"], // only these attributes
  characterData: true,   // text content changes
});

observer.disconnect(); // stop observing`,
                },
                {
                  order: 2, language: "javascript", label: "ResizeObserver — watch element size changes",
                  content: `// Fires when an element's size changes (more precise than window resize)
const observer = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    const { width, height } = entry.contentRect;
    console.log(\`Element is now \${width}×\${height}\`);

    // entry.borderBoxSize — includes padding and border
    // entry.contentBoxSize — content area only
    const [box] = entry.borderBoxSize;
    box.inlineSize;  // width (in horizontal writing mode)
    box.blockSize;   // height
  });
});

observer.observe(el);
observer.observe(el, { box: "border-box" }); // measure border box
observer.unobserve(el);
observer.disconnect();

// Common use: update chart/canvas on resize
const chartObserver = new ResizeObserver(([entry]) => {
  const { width } = entry.contentRect;
  canvas.width  = width;
  canvas.height = width * 0.5;
  drawChart();
});
chartObserver.observe(chartContainer);`,
                },
              ],
            },
          },
          // ── Forms ─────────────────────────────────────────────────────────────
          {
            title: "Forms & Input",
            description: "Read, validate and control form elements",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Reading form values",
                  content: `const form = document.querySelector("form");

// FormData — easiest way to grab all fields
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);

  data.get("email");          // single value
  data.getAll("tags");        // multiple values (checkboxes)
  data.has("newsletter");     // boolean
  data.set("source", "web");  // add/override
  data.delete("hidden");

  // Convert to plain object
  const obj = Object.fromEntries(data);

  // Convert to URLSearchParams
  const params = new URLSearchParams(data);
  fetch("/api", { method: "POST", body: data });
});

// Individual element access
const email    = form.elements["email"].value;
const agree    = form.elements["agree"].checked;
const selected = form.elements["role"].value;  // select

// Access by name shortcut
form.email.value;
form.newsletter.checked;`,
                },
                {
                  order: 1, language: "javascript", label: "Validation and focus control",
                  content: `const input = document.querySelector("input[type='email']");

// Constraint Validation API
input.validity.valid;          // true/false overall
input.validity.valueMissing;   // required but empty
input.validity.typeMismatch;   // wrong format (email, url)
input.validity.tooShort;       // minlength not met
input.validity.tooLong;        // maxlength exceeded
input.validity.rangeUnderflow; // below min
input.validity.rangeOverflow;  // above max
input.validity.patternMismatch;
input.validity.customError;    // setCustomValidity was called

input.validationMessage;       // browser's error message
input.checkValidity();         // returns false + fires "invalid" event
input.reportValidity();        // shows native error UI

// Custom error
input.setCustomValidity("Username already taken");
input.setCustomValidity(""); // clear custom error

// Focus management
input.focus();
input.blur();
input.select();        // select all text
input.setSelectionRange(0, 5); // select first 5 chars

// Focus the first invalid field
form.querySelector(":invalid")?.focus();`,
                },
              ],
            },
          },
          // ── Useful Patterns ───────────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "Debounce, throttle, template cloning and URL/history",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Debounce and throttle",
                  content: `// Debounce — wait until calls stop for N ms
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const onSearch = debounce((e) => {
  fetch(\`/api/search?q=\${e.target.value}\`);
}, 300);

searchInput.addEventListener("input", onSearch);

// Throttle — execute at most once per N ms
function throttle(fn, limit) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

const onScroll = throttle(() => {
  updateScrollProgress();
}, 100);

window.addEventListener("scroll", onScroll, { passive: true });`,
                },
                {
                  order: 1, language: "javascript", label: "Template element cloning",
                  content: `// <template> elements are inert — not rendered, not queried
// <template id="card-template">
//   <div class="card">
//     <h2 class="card__title"></h2>
//     <p  class="card__body"></p>
//   </div>
// </template>

const tmpl = document.getElementById("card-template");

function createCard({ title, body }) {
  const clone = tmpl.content.cloneNode(true); // deep clone
  clone.querySelector(".card__title").textContent = title;
  clone.querySelector(".card__body").textContent  = body;
  return clone;
}

// Batch insert with DocumentFragment (one reflow)
const frag = document.createDocumentFragment();
items.forEach(item => frag.appendChild(createCard(item)));
document.querySelector(".card-grid").appendChild(frag);`,
                },
                {
                  order: 2, language: "javascript", label: "History API and URL",
                  content: `// Push a new URL without page reload
history.pushState({ page: "about" }, "", "/about");
history.replaceState({ page: "home" }, "", "/");  // replace, no new history entry
history.back();
history.forward();
history.go(-2);  // go back 2 steps

// Listen for back/forward navigation
window.addEventListener("popstate", (e) => {
  const state = e.state;  // { page: "about" }
  renderPage(state?.page ?? "home");
});

// URL API — parse and build URLs safely
const url = new URL("https://example.com/search?q=css&page=2");
url.pathname;          // "/search"
url.searchParams.get("q");      // "css"
url.searchParams.set("page", 3);
url.searchParams.append("tag", "layout");
url.searchParams.delete("page");
url.toString();        // updated URL string

// Current page URL
const current = new URL(window.location.href);
current.searchParams.get("filter");`,
                },
                {
                  order: 3, language: "javascript", label: "Clipboard, dialog and other modern APIs",
                  content: `// Clipboard API
await navigator.clipboard.writeText("Copied text!");
const text = await navigator.clipboard.readText();

// Copy on click pattern
btn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(codeEl.textContent);
  btn.textContent = "Copied!";
  setTimeout(() => btn.textContent = "Copy", 2000);
});

// <dialog> element
const modal = document.querySelector("dialog");
modal.showModal();    // opens as modal (blocks background)
modal.show();         // opens as non-modal
modal.close();        // close with optional return value
modal.close("saved"); // returnValue = "saved"
modal.returnValue;    // "saved"

modal.addEventListener("close", () => console.log(modal.returnValue));
modal.addEventListener("cancel", (e) => {
  e.preventDefault(); // prevent Escape from closing
});

// Focus trap is automatic for showModal()
// Click backdrop to close:
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created JavaScript DOM API cheatsheet: ${dom.name} (${dom.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
