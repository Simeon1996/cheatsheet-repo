import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "CSS Grid", userId: null },
  });

  const grid = await prisma.category.create({
    data: {
      name: "CSS Grid",
      icon: "🔲",
      color: "indigo",
      description: "Complete CSS Grid reference — tracks, placement, alignment, template areas and real-world layout patterns",
      isPublic: true,
      snippets: {
        create: [
          // ── Defining the Grid ─────────────────────────────────────────────────
          {
            title: "Defining the Grid",
            description: "Set up columns, rows and track sizes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Enable grid",
                  content: `.container {
  display: grid;        /* block-level grid */
}

.container-inline {
  display: inline-grid; /* inline-level grid */
}`,
                },
                {
                  order: 1, language: "css", label: "grid-template-columns & grid-template-rows",
                  content: `.container {
  /* Fixed track sizes */
  grid-template-columns: 200px 200px 200px;

  /* Fractional units — share available space */
  grid-template-columns: 1fr 2fr 1fr;

  /* Mixed units */
  grid-template-columns: 240px 1fr;
  grid-template-rows: 64px 1fr 48px;

  /* Named lines */
  grid-template-columns: [sidebar-start] 240px [sidebar-end main-start] 1fr [main-end];

  /* repeat() shorthand */
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: repeat(3, 200px 1fr); /* alternating pattern */
}`,
                },
                {
                  order: 2, language: "css", label: "repeat() with auto-fill and auto-fit",
                  content: `/* auto-fill: create as many tracks as fit, keep empty tracks */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

/* auto-fit: same but collapses empty tracks, items stretch to fill */
.grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

/* Result: responsive columns with NO media queries
   Items wrap naturally when container is too narrow */`,
                },
                {
                  order: 3, language: "css", label: "minmax(), min() and max() track sizing",
                  content: `.container {
  /* minmax(min, max) — track is at least min, at most max */
  grid-template-columns: minmax(200px, 1fr) 2fr;

  /* min-content / max-content */
  grid-template-columns: min-content 1fr max-content;

  /* fit-content(value) — like max-content but capped */
  grid-template-columns: fit-content(300px) 1fr;
}

/* Responsive sidebar that won't go below 200px or above 300px */
.layout {
  grid-template-columns: minmax(200px, 300px) 1fr;
}`,
                },
                {
                  order: 4, language: "css", label: "gap — gutters between tracks",
                  content: `.container {
  gap: 16px;           /* equal row and column gap */
  gap: 24px 16px;      /* row-gap column-gap */
  row-gap: 24px;
  column-gap: 16px;
}`,
                },
                {
                  order: 5, language: "css", label: "Implicit grid — auto rows and columns",
                  content: `/* Explicit grid: tracks you define with grid-template-* */
/* Implicit grid: auto-created tracks for items that overflow */

.container {
  grid-template-columns: repeat(3, 1fr);

  /* Control size of auto-created rows */
  grid-auto-rows: 200px;
  grid-auto-rows: minmax(100px, auto); /* min 100px, grows with content */

  /* Control direction items are auto-placed */
  grid-auto-flow: row;    /* default: fill rows first */
  grid-auto-flow: column; /* fill columns first */
  grid-auto-flow: row dense; /* fill gaps with smaller items */
}`,
                },
              ],
            },
          },
          // ── Template Areas ────────────────────────────────────────────────────
          {
            title: "Template Areas",
            description: "Name regions of the grid for readable layouts",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "grid-template-areas",
                  content: `.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 64px 1fr 48px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  min-height: 100vh;
}

.page header  { grid-area: header; }
.page aside   { grid-area: sidebar; }
.page main    { grid-area: main; }
.page footer  { grid-area: footer; }`,
                },
                {
                  order: 1, language: "css", label: "Responsive template areas with media query",
                  content: `.page {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}

@media (min-width: 768px) {
  .page {
    grid-template-columns: 240px 1fr;
    grid-template-areas:
      "header  header"
      "sidebar main"
      "footer  footer";
  }
}

/* Use . to leave a cell empty */
.dashboard {
  grid-template-areas:
    "header header header"
    "nav    main   .     "
    "nav    footer footer";
}`,
                },
              ],
            },
          },
          // ── Item Placement ────────────────────────────────────────────────────
          {
            title: "Item Placement",
            description: "Place and span items across specific grid lines and cells",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "grid-column and grid-row",
                  content: `.item {
  /* grid-column: start-line / end-line */
  grid-column: 1 / 3;    /* spans columns 1 and 2 */
  grid-row: 2 / 4;       /* spans rows 2 and 3 */

  /* span keyword */
  grid-column: 1 / span 2;  /* start at 1, span 2 tracks */
  grid-column: span 3;       /* span 3 tracks from auto position */

  /* Negative line numbers count from the end */
  grid-column: 1 / -1;      /* full width, regardless of column count */
  grid-row: 1 / -1;         /* full height */
}`,
                },
                {
                  order: 1, language: "css", label: "grid-area shorthand for placement",
                  content: `/* grid-area: row-start / col-start / row-end / col-end */
.item {
  grid-area: 1 / 1 / 3 / 4; /* rows 1-2, columns 1-3 */
}

/* Or reference a named area */
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }`,
                },
                {
                  order: 2, language: "css", label: "Named grid lines for semantic placement",
                  content: `.container {
  grid-template-columns:
    [full-start] 16px
    [content-start] 1fr
    [content-end] 16px
    [full-end];

  grid-template-rows:
    [header-start] 64px [header-end body-start] 1fr [body-end];
}

/* Items reference names instead of numbers */
.breakout { grid-column: full-start / full-end; }
.content  { grid-column: content-start / content-end; }
.header   { grid-row: header-start / header-end; }`,
                },
              ],
            },
          },
          // ── Alignment ─────────────────────────────────────────────────────────
          {
            title: "Alignment",
            description: "Align the grid and items within their cells",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "justify-items & align-items — all cells",
                  content: `/* justify-items: inline axis (horizontal) */
/* align-items:   block axis (vertical)   */

.container {
  justify-items: stretch; /* default: fill cell width */
  justify-items: start;
  justify-items: end;
  justify-items: center;

  align-items: stretch;   /* default: fill cell height */
  align-items: start;
  align-items: end;
  align-items: center;
  align-items: baseline;

  /* Shorthand */
  place-items: center;           /* align then justify */
  place-items: start end;        /* align-items justify-items */
}`,
                },
                {
                  order: 1, language: "css", label: "justify-content & align-content — whole grid",
                  content: `/* Distributes the grid tracks within the container
   (only has effect if grid is smaller than container) */

.container {
  justify-content: start;         /* default */
  justify-content: end;
  justify-content: center;
  justify-content: stretch;
  justify-content: space-between;
  justify-content: space-around;
  justify-content: space-evenly;

  align-content: start;           /* default */
  align-content: end;
  align-content: center;
  align-content: space-between;
  align-content: space-around;

  /* Shorthand: align-content justify-content */
  place-content: center;
  place-content: space-between center;
}`,
                },
                {
                  order: 2, language: "css", label: "justify-self & align-self — single item",
                  content: `/* Override container alignment for one item */
.item {
  justify-self: start;
  justify-self: end;
  justify-self: center;
  justify-self: stretch; /* default */

  align-self: start;
  align-self: end;
  align-self: center;
  align-self: stretch;   /* default */

  /* Shorthand: align-self justify-self */
  place-self: center;
  place-self: end start;
}`,
                },
              ],
            },
          },
          // ── Layout Patterns ───────────────────────────────────────────────────
          {
            title: "Layout Patterns",
            description: "Battle-tested grid recipes for real interfaces",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Responsive card grid — no media queries",
                  content: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Cards automatically wrap at 280px minimum width.
   1 col on mobile, 2–3 on tablet, 4+ on desktop — zero media queries. */`,
                },
                {
                  order: 1, language: "css", label: "Classic page layout — header, sidebar, main, footer",
                  content: `.page {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main  "
    "footer  footer";
  min-height: 100vh;
}

.page > header  { grid-area: header;  }
.page > aside   { grid-area: sidebar; }
.page > main    { grid-area: main;    }
.page > footer  { grid-area: footer;  }`,
                },
                {
                  order: 2, language: "css", label: "The RAM pattern — Repeat Auto Minmax",
                  content: `/* Fluid columns that fill the row, then wrap.
   Items on the last row stretch to fill — use auto-fit for this. */

.ram {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 16px;
}

/* min(100%, 320px) prevents overflow on very small screens */`,
                },
                {
                  order: 3, language: "css", label: "Masonry-style layout (CSS only)",
                  content: `.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 10px; /* small row unit for fine-grained control */
  gap: 16px;
}

/* Each item sets its row span via JS or a known ratio:
   item with 300px height → span ceil(300 / 10) = 30 rows */
.item-tall   { grid-row: span 30; }
.item-medium { grid-row: span 20; }
.item-short  { grid-row: span 15; }`,
                },
                {
                  order: 4, language: "css", label: "Full-bleed layout with constrained content",
                  content: `/* Items default to content column.
   Use .full-bleed to break out to full width. */

.layout {
  display: grid;
  grid-template-columns:
    [full-start]    1fr
    [content-start] min(65ch, 100% - 48px)
    [content-end]   1fr
    [full-end];
}

.layout > * {
  grid-column: content; /* all children in content column */
}

.layout > .full-bleed {
  grid-column: full;    /* hero, images, banners break out */
  width: 100%;
}`,
                },
                {
                  order: 5, language: "css", label: "Dashboard grid with featured item",
                  content: `.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(160px, auto);
  gap: 16px;
}

/* Featured card spans 2 columns and 2 rows */
.card--featured {
  grid-column: span 2;
  grid-row: span 2;
}

/* Wide stat bar spans full width */
.card--wide {
  grid-column: 1 / -1;
}`,
                },
                {
                  order: 6, language: "css", label: "Centered content with sidebar",
                  content: `/* Sidebar on left, centered constrained content on right */
.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: 24px;
}

.sidebar {
  position: sticky;
  top: 80px;
  align-self: start;  /* sticky needs this — don't stretch */
  height: fit-content;
}

.content {
  max-width: 72ch;
}`,
                },
              ],
            },
          },
          // ── Subgrid ───────────────────────────────────────────────────────────
          {
            title: "Subgrid",
            description: "Let nested elements participate in the parent grid",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "subgrid — align nested content to parent tracks",
                  content: `/* Without subgrid, nested grids are independent */
/* With subgrid, children inherit parent grid tracks   */

.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Card spans 1 column but uses subgrid for its rows */
.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* inherit parent's row tracks */
}

/* Now all cards' title/body/footer align across columns */
.card__title  { grid-row: 1; }
.card__body   { grid-row: 2; }
.card__footer { grid-row: 3; margin-top: auto; }`,
                },
                {
                  order: 1, language: "css", label: "subgrid on both axes",
                  content: `.parent {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto auto;
  gap: 16px 24px;
}

.item {
  grid-column: span 2;
  grid-row: span 2;

  display: grid;
  grid-template-columns: subgrid; /* use parent's 2 spanned columns */
  grid-template-rows: subgrid;    /* use parent's 2 spanned rows */
}

/* Children of .item snap to the grandparent grid lines */`,
                },
              ],
            },
          },
          // ── Gotchas & Tips ────────────────────────────────────────────────────
          {
            title: "Gotchas & Tips",
            description: "Grid edge cases, browser quirks and practical tips",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "fr vs % — don't mix with gap",
                  content: `/* % tracks include the gap in calculations → can overflow */
.bad {
  grid-template-columns: 50% 50%; /* overflows when gap is added */
  gap: 16px;
}

/* fr tracks exclude the gap automatically → always correct */
.good {
  grid-template-columns: 1fr 1fr; /* gap is subtracted before fr is applied */
  gap: 16px;
}`,
                },
                {
                  order: 1, language: "css", label: "min-width: 0 — prevent overflow in grid items",
                  content: `/* Grid items default to min-width: auto, which respects content size.
   This can cause overflow with long words, code blocks, or flex children. */

/* Fix: set min-width: 0 on the grid item */
.grid-item {
  min-width: 0;     /* allows item to shrink below content size */
  overflow: hidden; /* or overflow-wrap: break-word for text */
}

/* Same issue exists for min-height on row-spanning items */
.grid-item-tall {
  min-height: 0;
}`,
                },
                {
                  order: 2, language: "css", label: "auto vs 1fr — when to use each",
                  content: `/* auto: track sizes to fit its content */
/* 1fr:  track takes a fraction of the *remaining* free space */

/* Sidebar auto, main flexible */
.layout {
  grid-template-columns: auto 1fr; /* sidebar hugs content, main fills rest */
}

/* All equal regardless of content */
.equal {
  grid-template-columns: repeat(3, 1fr); /* each column is exactly 1/3 */
}

/* Header row auto-sizes, body fills remaining height */
.page {
  grid-template-rows: auto 1fr auto; /* header, main, footer */
  height: 100vh;
}`,
                },
                {
                  order: 3, language: "css", label: "Debugging grid with DevTools",
                  content: `/* Chrome / Firefox both have visual grid overlays */

/* Quick debug: show grid lines with outline */
.container * {
  outline: 1px solid rgba(255, 0, 0, 0.3);
}

/* Log grid info in JS */
const el = document.querySelector('.grid');
const style = getComputedStyle(el);
console.log(style.gridTemplateColumns);
console.log(style.gridTemplateRows);

/* Firefox: Layout panel → Grid overlay → show line numbers
   Chrome:  Elements panel → Layout tab → Grid overlays */`,
                },
                {
                  order: 4, language: "css", label: "Grid vs Flexbox — when to use which",
                  content: `/*
  Use GRID when:
  ─ You need 2-dimensional layout (rows AND columns)
  ─ You want precise placement into named areas
  ─ You're designing the layout first (layout-in)
  ─ Items should align to a shared grid regardless of content
  Examples: page layouts, dashboards, card grids, image galleries

  Use FLEXBOX when:
  ─ You need 1-dimensional layout (row OR column)
  ─ Items should size themselves based on their content
  ─ You're distributing space among unknown items (content-out)
  Examples: navbars, toolbars, button groups, media objects

  They complement each other — use grid for the macro layout,
  flexbox for the micro components inside grid areas.
*/`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created CSS Grid cheatsheet: ${grid.name} (${grid.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
