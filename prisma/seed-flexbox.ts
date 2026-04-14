import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash(process.env.ADMIN_PASSWORD ?? "changeme", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cheatsheet.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@cheatsheet.dev",
      hashedPassword,
    },
  });

  await prisma.category.deleteMany({
    where: { name: "CSS Flexbox", userId: admin.id },
  });

  const flex = await prisma.category.create({
    data: {
      name: "CSS Flexbox",
      icon: "📐",
      color: "pink",
      description: "Complete CSS Flexbox reference — container properties, item properties and real-world layout patterns",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Container Setup ───────────────────────────────────────────────────
          {
            title: "Container Setup",
            description: "Enable flexbox and control the main axis direction",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Enable flexbox",
                  content: `.container {
  display: flex;        /* block-level flex container */
}

.container-inline {
  display: inline-flex; /* inline-level flex container */
}`,
                },
                {
                  order: 1, language: "css", label: "flex-direction — main axis",
                  content: `.container {
  flex-direction: row;            /* → default: left to right */
  flex-direction: row-reverse;    /* ← right to left */
  flex-direction: column;         /* ↓ top to bottom */
  flex-direction: column-reverse; /* ↑ bottom to top */
}`,
                },
                {
                  order: 2, language: "css", label: "flex-wrap — overflow behaviour",
                  content: `.container {
  flex-wrap: nowrap;       /* default: all items on one line */
  flex-wrap: wrap;         /* items wrap onto multiple lines */
  flex-wrap: wrap-reverse; /* wraps upward */
}`,
                },
                {
                  order: 3, language: "css", label: "flex-flow — direction + wrap shorthand",
                  content: `.container {
  /* flex-flow: <direction> <wrap> */
  flex-flow: row nowrap;       /* default */
  flex-flow: row wrap;
  flex-flow: column wrap;
  flex-flow: column-reverse wrap-reverse;
}`,
                },
              ],
            },
          },
          // ── Alignment on Main Axis ────────────────────────────────────────────
          {
            title: "Main Axis — justify-content",
            description: "Distribute items along the main axis (horizontal by default)",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "justify-content values",
                  content: `.container {
  justify-content: flex-start;    /* ▐██░░░░░░░░░░░▌ items at start */
  justify-content: flex-end;      /* ▐░░░░░░░░░░░██▌ items at end */
  justify-content: center;        /* ▐░░░░░██░░░░░░▌ items centered */
  justify-content: space-between; /* ▐█░░░░░█░░░░░█▌ equal gaps between */
  justify-content: space-around;  /* ▐░█░░░░█░░░░░█░▌ equal space around */
  justify-content: space-evenly;  /* ▐░░█░░░█░░░█░░▌ equal space everywhere */
}`,
                },
              ],
            },
          },
          // ── Alignment on Cross Axis ───────────────────────────────────────────
          {
            title: "Cross Axis — align-items & align-content",
            description: "Align items perpendicular to the main axis",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "align-items — single-line cross axis",
                  content: `.container {
  align-items: stretch;     /* default: items fill cross-axis height */
  align-items: flex-start;  /* items align to cross-axis start */
  align-items: flex-end;    /* items align to cross-axis end */
  align-items: center;      /* items centered on cross axis */
  align-items: baseline;    /* items aligned by text baseline */
}`,
                },
                {
                  order: 1, language: "css", label: "align-content — multi-line cross axis",
                  content: `/* Only applies when flex-wrap: wrap and there are multiple lines */
.container {
  align-content: stretch;       /* default: lines stretch to fill */
  align-content: flex-start;    /* lines packed to start */
  align-content: flex-end;      /* lines packed to end */
  align-content: center;        /* lines centered */
  align-content: space-between; /* equal gaps between lines */
  align-content: space-around;  /* equal space around lines */
  align-content: space-evenly;  /* equal space everywhere */
}`,
                },
                {
                  order: 2, language: "css", label: "gap — spacing between items",
                  content: `.container {
  gap: 16px;           /* equal row and column gap */
  gap: 16px 24px;      /* row-gap column-gap */
  row-gap: 16px;
  column-gap: 24px;
}`,
                },
              ],
            },
          },
          // ── Item Properties ───────────────────────────────────────────────────
          {
            title: "Item Properties",
            description: "Control how individual flex items grow, shrink and size themselves",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "flex-grow — take up available space",
                  content: `/* flex-grow: <number> — proportion of free space to take */
.item { flex-grow: 0; }  /* default: don't grow */
.item { flex-grow: 1; }  /* take all available space */

/* Ratio example: sidebar gets 1 part, main gets 3 parts */
.sidebar { flex-grow: 1; }
.main    { flex-grow: 3; }`,
                },
                {
                  order: 1, language: "css", label: "flex-shrink — give up space when cramped",
                  content: `/* flex-shrink: <number> — how much to shrink relative to siblings */
.item { flex-shrink: 1; }  /* default: shrink proportionally */
.item { flex-shrink: 0; }  /* never shrink — useful for fixed sidebars */
.item { flex-shrink: 3; }  /* shrink 3× faster than siblings */`,
                },
                {
                  order: 2, language: "css", label: "flex-basis — initial size before grow/shrink",
                  content: `.item { flex-basis: auto; }    /* default: use width/height */
.item { flex-basis: 0; }      /* start from nothing, grow from zero */
.item { flex-basis: 200px; }  /* fixed starting size */
.item { flex-basis: 25%; }    /* percentage of container */
.item { flex-basis: content; } /* size based on content */`,
                },
                {
                  order: 3, language: "css", label: "flex shorthand",
                  content: `/* flex: <grow> <shrink> <basis> */
.item { flex: 0 1 auto; }  /* default */
.item { flex: 1; }         /* flex: 1 1 0  — grow, shrink, from zero */
.item { flex: auto; }      /* flex: 1 1 auto */
.item { flex: none; }      /* flex: 0 0 auto — completely rigid */
.item { flex: 1 200px; }   /* grow from 200px base */

/* Common pattern: equal-width columns */
.col { flex: 1; }`,
                },
                {
                  order: 4, language: "css", label: "align-self — override container alignment",
                  content: `.item {
  align-self: auto;       /* default: inherit align-items */
  align-self: flex-start;
  align-self: flex-end;
  align-self: center;
  align-self: stretch;
  align-self: baseline;
}`,
                },
                {
                  order: 5, language: "css", label: "order — reorder without changing HTML",
                  content: `/* order: <integer> — default is 0, lower renders first */
.item-first  { order: -1; } /* moved before all order: 0 items */
.item-last   { order: 1;  } /* moved after all order: 0 items */

/* Visual reorder for mobile without touching markup */
@media (max-width: 768px) {
  .sidebar { order: 2; }
  .main    { order: 1; }
}`,
                },
              ],
            },
          },
          // ── Common Layout Patterns ────────────────────────────────────────────
          {
            title: "Layout Patterns",
            description: "Real-world flexbox recipes you'll reach for constantly",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Perfect centering (horizontal + vertical)",
                  content: `/* Method 1: flex on parent */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Method 2: margin auto on child */
.parent {
  display: flex;
}
.child {
  margin: auto;
}`,
                },
                {
                  order: 1, language: "css", label: "Holy grail layout — header, footer, sidebar, main",
                  content: `/* Full-page layout: sticky footer, flexible main */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page header,
.page footer {
  flex-shrink: 0; /* never shrink */
}

.page .body {
  display: flex;
  flex: 1;        /* fill remaining vertical space */
}

.page .sidebar { flex: 0 0 240px; } /* fixed-width sidebar */
.page .main    { flex: 1; }         /* flexible main content */`,
                },
                {
                  order: 2, language: "css", label: "Responsive card grid with wrapping",
                  content: `.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  flex: 1 1 280px; /* grow, shrink, min 280px before wrapping */
  max-width: 400px;
}

/* Cards fill row evenly and wrap cleanly at 280px */`,
                },
                {
                  order: 3, language: "css", label: "Navbar — logo left, links right",
                  content: `.navbar {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

.navbar .logo {
  margin-right: auto; /* pushes everything else to the right */
}

.navbar nav {
  display: flex;
  gap: 24px;
  align-items: center;
}`,
                },
                {
                  order: 4, language: "css", label: "Sidebar layout with scrollable main",
                  content: `.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  flex: 0 0 260px;
  overflow-y: auto;
}

.main {
  flex: 1;
  overflow-y: auto; /* main scrolls independently */
}`,
                },
                {
                  order: 5, language: "css", label: "Media object — icon/avatar beside text",
                  content: `.media {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.media__image {
  flex-shrink: 0;   /* image never squishes */
  width: 48px;
  height: 48px;
}

.media__body {
  flex: 1;          /* text fills remaining space */
  min-width: 0;     /* allows text truncation to work */
}`,
                },
                {
                  order: 6, language: "css", label: "Input with button pinned to right",
                  content: `.input-group {
  display: flex;
  gap: 8px;
}

.input-group input {
  flex: 1;          /* input expands to fill space */
  min-width: 0;
}

.input-group button {
  flex-shrink: 0;   /* button stays at its natural width */
}`,
                },
                {
                  order: 7, language: "css", label: "Equal-height columns regardless of content",
                  content: `.columns {
  display: flex;
  gap: 24px;
  align-items: stretch; /* default — columns match tallest sibling */
}

.column {
  flex: 1;
}

/* Each column card fills full column height */
.column .card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.column .card .footer {
  margin-top: auto; /* push footer to bottom of card */
}`,
                },
              ],
            },
          },
          // ── Common Gotchas ────────────────────────────────────────────────────
          {
            title: "Gotchas & Fixes",
            description: "Tricky flexbox edge cases and how to solve them",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "css", label: "Text truncation inside flex item",
                  content: `/* Text doesn't truncate inside flex items by default */

/* Fix: set min-width: 0 on the flex item */
.item {
  flex: 1;
  min-width: 0; /* ← critical */
}

.item p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`,
                },
                {
                  order: 1, language: "css", label: "Image stretching inside flex container",
                  content: `/* Images stretch to fill cross axis by default (align-items: stretch) */

/* Fix 1: align the image itself */
.container img {
  align-self: flex-start; /* or center, flex-end */
}

/* Fix 2: override on container */
.container {
  align-items: flex-start;
}

/* Fix 3: add a wrapper div around the image */`,
                },
                {
                  order: 2, language: "css", label: "Last row of wrapped items stretching",
                  content: `/* With flex: 1 and flex-wrap: wrap, last row items stretch to fill */

/* Fix: add invisible spacer elements */
.grid::after {
  content: "";
  flex: 1 1 280px; /* same flex-basis as real items */
  max-width: 400px;
}

/* Or use CSS Grid for this pattern instead */`,
                },
                {
                  order: 3, language: "css", label: "flex: 1 vs flex: 1 1 0 vs flex: auto",
                  content: `/* These look similar but behave differently */

/* flex: 1  →  flex: 1 1 0%  — starts from zero, distributes all space evenly */
.equal-cols { flex: 1; }

/* flex: auto  →  flex: 1 1 auto  — starts from content size, distributes leftover */
.content-aware { flex: auto; }

/* flex: none  →  flex: 0 0 auto  — completely rigid, ignores free space */
.rigid { flex: none; }

/* Rule of thumb:
   - Equal columns?  → flex: 1
   - Grow but respect content?  → flex: auto
   - Fixed, never change? → flex: none  or  flex: 0 0 <size> */`,
                },
                {
                  order: 4, language: "css", label: "Margin auto — the flex power tool",
                  content: `/* margin: auto consumes all free space in that direction */

/* Push single item to far end */
.nav-items {
  display: flex;
  gap: 16px;
}
.nav-items .logout {
  margin-left: auto; /* pushes logout to right edge */
}

/* Center one item, keep others at start */
.toolbar {
  display: flex;
}
.toolbar .center {
  margin: auto; /* true center regardless of siblings */
}

/* Space between two groups */
.group-a { margin-right: auto; }`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created CSS Flexbox cheatsheet: ${flex.name} (${flex.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
