import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({
    where: { name: "Excel", userId: null },
  });

  const excel = await prisma.category.create({
    data: {
      name: "Excel",
      icon: "📊",
      color: "green",
      description: "Excel formulas, functions, shortcuts, and data tools — from lookup functions to dynamic arrays and pivot tables",
      isPublic: true,
      snippets: {
        create: [
          // ── Lookup & Reference ─────────────────────────────────────────────────
          {
            title: "Lookup & Reference",
            description: "VLOOKUP, HLOOKUP, INDEX/MATCH, and the modern XLOOKUP",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "excel", label: "VLOOKUP",
                  content: `=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])

-- Find exact match (FALSE = exact, TRUE = approximate)
=VLOOKUP(A2, $E$2:$G$100, 2, FALSE)

-- Look up price from product table
=VLOOKUP(B2, Products!$A:$C, 3, FALSE)

-- Handle missing values with IFERROR
=IFERROR(VLOOKUP(A2, $E$2:$G$100, 2, FALSE), "Not found")`,
                },
                {
                  order: 1, language: "excel", label: "INDEX / MATCH",
                  content: `-- INDEX returns a value from a range by position
=INDEX(array, row_num, [col_num])

-- MATCH returns the position of a value in a range
=MATCH(lookup_value, lookup_array, [match_type])
-- match_type: 0 = exact, 1 = less than, -1 = greater than

-- Combined INDEX/MATCH (more flexible than VLOOKUP)
=INDEX($C$2:$C$100, MATCH(A2, $A$2:$A$100, 0))

-- Two-way lookup (row and column)
=INDEX($B$2:$D$10, MATCH(A13, $A$2:$A$10, 0), MATCH(B13, $B$1:$D$1, 0))

-- With IFERROR
=IFERROR(INDEX($C$2:$C$100, MATCH(A2, $A$2:$A$100, 0)), "Not found")`,
                },
                {
                  order: 2, language: "excel", label: "XLOOKUP",
                  content: `=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])

-- Basic lookup
=XLOOKUP(A2, $E$2:$E$100, $F$2:$F$100)

-- With fallback for missing values
=XLOOKUP(A2, $E$2:$E$100, $F$2:$F$100, "Not found")

-- Return multiple columns at once
=XLOOKUP(A2, $E$2:$E$100, $F$2:$H$100)

-- Wildcard match (match_mode = 2)
=XLOOKUP("*"&A2&"*", $E$2:$E$100, $F$2:$F$100, "Not found", 2)

-- Last match (search_mode = -1)
=XLOOKUP(A2, $E$2:$E$100, $F$2:$F$100, , , -1)`,
                },
                {
                  order: 3, language: "excel", label: "OFFSET & INDIRECT",
                  content: `-- OFFSET: return range offset from a starting cell
=OFFSET(reference, rows, cols, [height], [width])
=OFFSET(A1, 2, 3)        -- cell 2 rows down, 3 cols right from A1
=SUM(OFFSET(A1, 0, 0, 5, 1))  -- sum 5 rows starting at A1

-- INDIRECT: build a cell reference from a string
=INDIRECT("A"&ROW())
=INDIRECT(B1)            -- reference the address stored in B1
=SUM(INDIRECT("Sheet2!A1:A10"))`,
                },
              ],
            },
          },

          // ── Logical Functions ──────────────────────────────────────────────────
          {
            title: "Logical Functions",
            description: "IF, IFS, AND, OR, NOT, SWITCH, and conditional patterns",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "excel", label: "IF & nested IF",
                  content: `=IF(logical_test, value_if_true, value_if_false)

-- Basic
=IF(A2>100, "High", "Low")

-- Nested IF (up to 64 levels, but avoid deep nesting)
=IF(A2>=90, "A", IF(A2>=80, "B", IF(A2>=70, "C", "F")))

-- IF with AND / OR
=IF(AND(A2>0, B2>0), "Both positive", "Not both positive")
=IF(OR(A2="Yes", B2="Yes"), "At least one Yes", "No")`,
                },
                {
                  order: 1, language: "excel", label: "IFS & SWITCH",
                  content: `-- IFS: multiple conditions without nesting (Excel 2019+)
=IFS(A2>=90, "A", A2>=80, "B", A2>=70, "C", TRUE, "F")

-- SWITCH: match a value against a list of cases
=SWITCH(A2,
  1, "January",
  2, "February",
  3, "March",
  "Unknown")

-- SWITCH with default
=SWITCH(WEEKDAY(A2),
  1, "Sunday",
  7, "Saturday",
  "Weekday")`,
                },
                {
                  order: 2, language: "excel", label: "AND / OR / NOT / XOR",
                  content: `-- AND: all conditions must be true
=AND(A2>0, B2<100, C2="Active")

-- OR: at least one condition must be true
=OR(A2="Admin", A2="Manager", A2="Owner")

-- NOT: reverses logic
=NOT(ISBLANK(A2))
=IF(NOT(A2=""), A2, "Empty")

-- XOR: exactly one condition must be true
=XOR(A2>50, B2>50)`,
                },
              ],
            },
          },

          // ── Math & Statistical ─────────────────────────────────────────────────
          {
            title: "Math & Statistical",
            description: "SUM, COUNT, AVERAGE with conditions, RANK, PERCENTILE",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "excel", label: "SUM variants",
                  content: `-- Basic sum
=SUM(A2:A100)

-- SUMIF: sum if condition is met
=SUMIF(range, criteria, [sum_range])
=SUMIF(B2:B100, "North", C2:C100)   -- sum sales for "North" region
=SUMIF(A2:A100, ">100", A2:A100)    -- sum values > 100

-- SUMIFS: multiple conditions
=SUMIFS(sum_range, criteria_range1, criteria1, ...)
=SUMIFS(D2:D100, B2:B100, "North", C2:C100, "Q1")

-- SUMPRODUCT: multiply arrays then sum
=SUMPRODUCT(B2:B100 * C2:C100)              -- sum of price × qty
=SUMPRODUCT((A2:A100="North") * D2:D100)    -- conditional sum`,
                },
                {
                  order: 1, language: "excel", label: "COUNT variants",
                  content: `-- COUNT: count numeric cells
=COUNT(A2:A100)

-- COUNTA: count non-empty cells
=COUNTA(A2:A100)

-- COUNTBLANK: count empty cells
=COUNTBLANK(A2:A100)

-- COUNTIF: count with one condition
=COUNTIF(B2:B100, "Completed")
=COUNTIF(A2:A100, ">50")
=COUNTIF(A2:A100, "<>"&"")   -- count non-empty

-- COUNTIFS: count with multiple conditions
=COUNTIFS(B2:B100, "North", C2:C100, "Q1", D2:D100, ">1000")`,
                },
                {
                  order: 2, language: "excel", label: "AVERAGE, RANK, PERCENTILE",
                  content: `-- AVERAGE / AVERAGEIF / AVERAGEIFS
=AVERAGE(A2:A100)
=AVERAGEIF(B2:B100, "Active", C2:C100)
=AVERAGEIFS(D2:D100, B2:B100, "North", C2:C100, ">0")

-- MIN / MAX with conditions
=MINIFS(D2:D100, B2:B100, "North")
=MAXIFS(D2:D100, C2:C100, "Q1")

-- RANK
=RANK(A2, $A$2:$A$100, 0)   -- 0 = descending, 1 = ascending
=RANK.EQ(A2, $A$2:$A$100)   -- same rank for ties

-- PERCENTILE and QUARTILE
=PERCENTILE(A2:A100, 0.9)   -- 90th percentile
=QUARTILE(A2:A100, 1)       -- Q1 (25th percentile)
=MEDIAN(A2:A100)`,
                },
                {
                  order: 3, language: "excel", label: "ROUND, MOD, TRUNC",
                  content: `-- ROUND: round to N decimal places
=ROUND(3.14159, 2)    -- 3.14
=ROUND(1234, -2)      -- 1200  (negative digits round left of decimal)

-- ROUNDUP / ROUNDDOWN
=ROUNDUP(2.1, 0)      -- 3
=ROUNDDOWN(2.9, 0)    -- 2

-- TRUNC: remove decimal without rounding
=TRUNC(3.99)          -- 3

-- INT: round down to nearest integer
=INT(3.99)            -- 3
=INT(-3.1)            -- -4  (rounds toward -∞)

-- MOD: remainder after division
=MOD(10, 3)           -- 1
=MOD(ROW(), 2)        -- alternate rows (0 or 1)`,
                },
              ],
            },
          },

          // ── Text Functions ─────────────────────────────────────────────────────
          {
            title: "Text Functions",
            description: "Concatenate, extract, search, and format text",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "excel", label: "Concatenate & join",
                  content: `-- & operator
=A2 & " " & B2

-- CONCAT (no delimiter)
=CONCAT(A2, " ", B2, " ", C2)

-- TEXTJOIN: join with delimiter, optionally skip empty
=TEXTJOIN(", ", TRUE, A2:A10)
=TEXTJOIN(" - ", FALSE, B2:B5)   -- FALSE = include empty cells

-- TEXT: format a number/date as text
=TEXT(A2, "0.00")
=TEXT(A2, "$#,##0.00")
=TEXT(TODAY(), "DD/MM/YYYY")
=TEXT(A2, "YYYY-MM-DD")`,
                },
                {
                  order: 1, language: "excel", label: "Extract & search",
                  content: `-- LEFT / RIGHT / MID
=LEFT(A2, 5)                        -- first 5 characters
=RIGHT(A2, 3)                       -- last 3 characters
=MID(A2, 3, 4)                      -- 4 chars starting at position 3

-- LEN: string length
=LEN(A2)

-- FIND / SEARCH (SEARCH is case-insensitive)
=FIND("@", A2)                      -- position of @ in email
=SEARCH("total", A2)                -- case-insensitive position

-- Extract domain from email
=MID(A2, FIND("@", A2)+1, LEN(A2)-FIND("@", A2))

-- Extract first word
=LEFT(A2, FIND(" ", A2)-1)

-- Extract last word
=MID(A2, FIND("*", SUBSTITUTE(A2," ","*",LEN(A2)-LEN(SUBSTITUTE(A2," ",""))))+1, LEN(A2))`,
                },
                {
                  order: 2, language: "excel", label: "Clean & transform",
                  content: `-- TRIM: remove leading/trailing spaces
=TRIM(A2)

-- CLEAN: remove non-printable characters
=CLEAN(A2)

-- UPPER / LOWER / PROPER
=UPPER(A2)
=LOWER(A2)
=PROPER(A2)   -- Title Case

-- SUBSTITUTE: replace all occurrences
=SUBSTITUTE(A2, " ", "_")
=SUBSTITUTE(A2, "-", "")   -- remove dashes

-- REPLACE: replace by position
=REPLACE(A2, 1, 3, "XXX")  -- replace first 3 chars with XXX

-- VALUE: convert text to number
=VALUE(A2)

-- TRIM + CLEAN + VALUE pipeline for dirty data
=VALUE(TRIM(CLEAN(A2)))`,
                },
              ],
            },
          },

          // ── Date & Time ────────────────────────────────────────────────────────
          {
            title: "Date & Time",
            description: "Date arithmetic, formatting, extraction, and DATEDIF",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "excel", label: "Today, Now, Date construction",
                  content: `-- Current date and time
=TODAY()
=NOW()

-- Build a date from parts
=DATE(year, month, day)
=DATE(2025, 12, 31)
=DATE(YEAR(A2), MONTH(A2)+1, 1)-1   -- last day of the current month

-- Build a time from parts
=TIME(hours, minutes, seconds)
=TIME(14, 30, 0)   -- 2:30 PM

-- Date serial: Excel stores dates as integers from 1-Jan-1900
-- Use TEXT() to display formatted
=TEXT(A2, "DD MMM YYYY")
=TEXT(A2, "ddd, D MMMM")`,
                },
                {
                  order: 1, language: "excel", label: "Extract date parts",
                  content: `=YEAR(A2)
=MONTH(A2)
=DAY(A2)
=HOUR(A2)
=MINUTE(A2)
=SECOND(A2)

-- Day of week (1=Sunday by default)
=WEEKDAY(A2)
=WEEKDAY(A2, 2)   -- 1=Monday mode

-- Week number
=WEEKNUM(A2)
=ISOWEEKNUM(A2)   -- ISO 8601 week number

-- Quarter
=INT((MONTH(A2)-1)/3)+1

-- Last day of month
=EOMONTH(A2, 0)        -- last day of same month
=EOMONTH(A2, 1)        -- last day of next month
=EOMONTH(A2, -1)+1     -- first day of current month`,
                },
                {
                  order: 2, language: "excel", label: "Date arithmetic & DATEDIF",
                  content: `-- Days between two dates (simple subtraction)
=B2 - A2
=DAYS(end_date, start_date)

-- DATEDIF: difference in years / months / days
=DATEDIF(start_date, end_date, unit)
-- units: "Y" years, "M" months, "D" days
--        "YM" months ignoring years, "MD" days ignoring months

=DATEDIF(A2, TODAY(), "Y")          -- age in full years
=DATEDIF(A2, TODAY(), "Y") & " yrs, " & DATEDIF(A2, TODAY(), "YM") & " mo"

-- Add/subtract months
=EDATE(A2, 3)    -- 3 months later
=EDATE(A2, -1)   -- 1 month earlier

-- Working days
=NETWORKDAYS(start, end, [holidays])
=WORKDAY(start, days, [holidays])   -- date N working days from start`,
                },
              ],
            },
          },

          // ── Dynamic Arrays ─────────────────────────────────────────────────────
          {
            title: "Dynamic Arrays",
            description: "FILTER, SORT, UNIQUE, SEQUENCE, and spill behavior (Excel 365/2021)",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "excel", label: "FILTER",
                  content: `=FILTER(array, include, [if_empty])

-- Filter rows where column B = "Active"
=FILTER(A2:D100, B2:B100="Active")

-- Multiple conditions (AND)
=FILTER(A2:D100, (B2:B100="Active") * (C2:C100>1000))

-- Multiple conditions (OR)
=FILTER(A2:D100, (B2:B100="North") + (B2:B100="South"))

-- Filter single column
=FILTER(A2:A100, C2:C100>500, "No results")

-- Filter with SORT
=SORT(FILTER(A2:D100, B2:B100="Active"), 3, -1)  -- sort by col 3 descending`,
                },
                {
                  order: 1, language: "excel", label: "SORT & SORTBY",
                  content: `=SORT(array, [sort_index], [sort_order], [by_col])
-- sort_order: 1 = ascending (default), -1 = descending

-- Sort range by first column ascending
=SORT(A2:C100)

-- Sort by second column descending
=SORT(A2:C100, 2, -1)

-- SORTBY: sort by external arrays
=SORTBY(array, by_array1, [sort_order1], ...)

-- Sort names by age
=SORTBY(A2:A100, B2:B100, 1)

-- Sort by multiple keys
=SORTBY(A2:C100, C2:C100, -1, B2:B100, 1)`,
                },
                {
                  order: 2, language: "excel", label: "UNIQUE & SEQUENCE",
                  content: `=UNIQUE(array, [by_col], [exactly_once])

-- Unique values from a column
=UNIQUE(A2:A100)

-- Unique rows in a range
=UNIQUE(A2:D100)

-- Values that appear exactly once
=UNIQUE(A2:A100, FALSE, TRUE)

-- SEQUENCE: generate a number sequence
=SEQUENCE(rows, [cols], [start], [step])
=SEQUENCE(10)              -- 1 to 10 in a column
=SEQUENCE(5, 3)            -- 5×3 grid starting at 1
=SEQUENCE(12, 1, 0, 30)   -- 0, 30, 60, ..., 330

-- Generate dates for a month
=SEQUENCE(28, 1, DATE(2025,2,1), 1)`,
                },
                {
                  order: 3, language: "excel", label: "XLOOKUP / XMATCH (array)",
                  content: `-- XMATCH: position in an array (like MATCH but more powerful)
=XMATCH(lookup_value, lookup_array, [match_mode], [search_mode])

=XMATCH("Alice", A2:A100)        -- exact position
=XMATCH(100, B2:B100, 1)         -- next larger value
=XMATCH("Z*", A2:A100, 2)        -- wildcard match

-- Spill reference with #
-- If UNIQUE spills into C2:C20, reference it as:
=C2#

-- SORT the spill range dynamically
=SORT(C2#)

-- Count unique values
=COUNTA(UNIQUE(A2:A100))`,
                },
              ],
            },
          },

          // ── Error Handling ─────────────────────────────────────────────────────
          {
            title: "Error Handling",
            description: "IFERROR, IFNA, ISERROR, IS* functions",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "excel", label: "IFERROR & IFNA",
                  content: `-- IFERROR: catch any error
=IFERROR(formula, value_if_error)
=IFERROR(A2/B2, 0)
=IFERROR(VLOOKUP(A2, $D:$E, 2, 0), "Not found")

-- IFNA: catch only #N/A errors (more precise)
=IFNA(VLOOKUP(A2, $D:$E, 2, 0), "Not found")
=IFNA(XMATCH(A2, B2:B100), -1)`,
                },
                {
                  order: 1, language: "excel", label: "IS* check functions",
                  content: `=ISERROR(A2)    -- TRUE for any error
=ISERR(A2)      -- TRUE for any error except #N/A
=ISNA(A2)       -- TRUE only for #N/A
=ISBLANK(A2)    -- TRUE if cell is empty
=ISNUMBER(A2)   -- TRUE if numeric
=ISTEXT(A2)     -- TRUE if text
=ISLOGICAL(A2)  -- TRUE if TRUE/FALSE
=ISREF(A2)      -- TRUE if valid reference

-- Error type
=ERROR.TYPE(A2)
-- 1=#NULL!, 2=#DIV/0!, 3=#VALUE!, 4=#REF!, 5=#NAME?, 6=#NUM!, 7=#N/A

-- Pattern: only calculate if not blank
=IF(ISBLANK(A2), "", A2*B2)`,
                },
              ],
            },
          },

          // ── Keyboard Shortcuts ─────────────────────────────────────────────────
          {
            title: "Keyboard Shortcuts",
            description: "Essential Excel shortcuts for navigation, editing, and formatting",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Navigation",
                  content: `Ctrl + Home          Go to cell A1
Ctrl + End           Go to last used cell
Ctrl + Arrow         Jump to edge of data region
Ctrl + Shift + End   Select to last used cell
Ctrl + Backspace     Scroll back to active cell
Ctrl + G / F5        Go To dialog
Ctrl + F             Find
Ctrl + H             Find & Replace
F5 → Special         Go To Special (blanks, formulas, etc.)
Ctrl + Page Up/Down  Switch between sheets`,
                },
                {
                  order: 1, language: "text", label: "Selection",
                  content: `Ctrl + A             Select all (or current region)
Ctrl + Shift + *     Select current region
Shift + Arrow        Extend selection
Ctrl + Shift + Arrow Extend selection to edge
Ctrl + Space         Select entire column
Shift + Space        Select entire row
Ctrl + Shift + +     Insert cells/rows/columns
Ctrl + -             Delete cells/rows/columns`,
                },
                {
                  order: 2, language: "text", label: "Editing",
                  content: `F2                   Enter edit mode for active cell
Escape               Cancel edit
Tab / Shift+Tab      Move right / left in selection
Enter / Shift+Enter  Move down / up in selection
Ctrl + Enter         Fill selection with entry
Ctrl + D             Fill down
Ctrl + R             Fill right
Ctrl + '             Copy formula from cell above
Ctrl + ;             Insert today's date
Ctrl + Shift + ;     Insert current time
Alt + Enter          New line within a cell
Ctrl + Z / Y         Undo / Redo
Ctrl + C/X/V         Copy / Cut / Paste
Ctrl + Alt + V       Paste Special`,
                },
                {
                  order: 3, language: "text", label: "Formatting",
                  content: `Ctrl + 1             Format Cells dialog
Ctrl + B             Bold
Ctrl + I             Italic
Ctrl + U             Underline
Ctrl + Shift + $     Currency format
Ctrl + Shift + %     Percentage format
Ctrl + Shift + #     Date format
Ctrl + Shift + !     Number format (comma, 2 decimals)
Ctrl + Shift + @     Time format
Alt + H + H          Fill color (Home → Fill Color)
Alt + H + FC         Font color`,
                },
                {
                  order: 4, language: "text", label: "Formulas & Data",
                  content: `F4                   Cycle absolute/relative references ($A$1 → A$1 → $A1 → A1)
F9                   Evaluate selected part of formula
Ctrl + ~             Toggle show formulas / values
Ctrl + Shift + U     Expand/collapse formula bar
Alt + =              AutoSum
Ctrl + T             Create/format as Table
Ctrl + Shift + L     Toggle AutoFilter
Alt + D + F + F      Filter (legacy)
Ctrl + Shift + F3    Create names from selection
F3                   Paste Name dialog
Ctrl + Shift + Enter Array formula (legacy Ctrl+Shift+Enter)`,
                },
              ],
            },
          },

          // ── Tables & Structured References ────────────────────────────────────
          {
            title: "Tables & Structured References",
            description: "Excel Tables (Ctrl+T), structured references, and table operations",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "excel", label: "Create & reference a Table",
                  content: `-- Convert range to Table: Ctrl + T (or Insert → Table)
-- Tables auto-expand when you add rows/columns

-- Structured references (inside or outside the table)
=Sales[Amount]                    -- entire Amount column
=Sales[@Amount]                   -- same row Amount
=Sales[[#Headers],[Amount]]       -- header cell
=Sales[[#Totals],[Amount]]        -- total row cell
=Sales[[Amount]:[Discount]]       -- columns Amount through Discount

-- Aggregate the table
=SUM(Sales[Amount])
=AVERAGEIF(Sales[Region], "North", Sales[Amount])

-- COUNTIF on a table column
=COUNTIF(Sales[Status], "Closed")`,
                },
                {
                  order: 1, language: "excel", label: "Table operations",
                  content: `-- Resize table: Table Design → Resize Table
-- Name a table: Table Design → Table Name box

-- Remove duplicates from table: Data → Remove Duplicates
-- Table total row: Table Design → Total Row checkbox

-- Convert back to range: Table Design → Convert to Range

-- Useful: reference another table in formulas
=XLOOKUP([@ID], Customers[ID], Customers[Name])

-- Dynamic table reference with INDIRECT (avoid if possible)
=SUM(INDIRECT(TableName & "[Amount]"))`,
                },
              ],
            },
          },

          // ── Data Validation & Conditional Formatting ──────────────────────────
          {
            title: "Data Validation & Conditional Formatting",
            description: "Dropdown lists, input constraints, and formula-based CF rules",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Data Validation setup",
                  content: `Data → Data Validation → Settings tab

Allow: Whole number
  Between 1 and 100

Allow: Decimal
  Greater than 0

Allow: List
  Source: Pending,Active,Closed       (comma-separated)
  Source: =$E$2:$E$10                 (range reference)
  Source: =TableName[ColumnName]      (table column)

Allow: Date
  Between: =TODAY()-30 and =TODAY()

Allow: Custom (formula)
  =AND(LEN(A2)=10, ISNUMBER(A2))     -- 10-digit number
  =COUNTIF($A$2:$A$100, A2)=1         -- unique values only

Input Message tab: shown when cell selected
Error Alert tab:   Stop / Warning / Information`,
                },
                {
                  order: 1, language: "text", label: "Conditional Formatting — common rules",
                  content: `Home → Conditional Formatting → New Rule

-- Highlight cell rules (built-in)
Greater Than, Less Than, Between, Equal To
Text that Contains, Duplicate Values, Top/Bottom %

-- Formula-based rules (most powerful)
Use a formula to determine which cells to format:

=A2>100                          -- highlight if value > 100
=A2=""                           -- highlight blank cells
=$B2="Overdue"                   -- highlight row when col B = Overdue (lock col, not row)
=AND($C2>0, $C2<TODAY())         -- past due dates
=MOD(ROW(),2)=0                  -- alternate row shading (even rows)
=COUNTIF($A$2:$A2, A2)>1         -- flag duplicates as they appear
=A2=MAX($A$2:$A$100)             -- highlight maximum value

-- Tip: when applying to a range (e.g. A2:D100),
-- the formula uses the top-left cell (A2) with
-- mixed references to let it shift per row/column.`,
                },
                {
                  order: 2, language: "excel", label: "Named Ranges",
                  content: `-- Define via Formulas → Define Name
-- Or Ctrl+Shift+F3 to create from selection headers

-- Reference in formulas
=SUM(AnnualBudget)
=VLOOKUP(A2, ProductTable, 2, FALSE)

-- Dynamic named range with OFFSET
=OFFSET(Sheet1!$A$1, 0, 0, COUNTA(Sheet1!$A:$A), 1)

-- Dynamic named range with modern approach (Excel 365)
-- Just use a Table instead; Tables auto-expand.

-- List all names: Formulas → Name Manager (Ctrl+F3)
-- Paste all names into sheet: F3 → Paste List`,
                },
              ],
            },
          },

          // ── Pivot Tables ──────────────────────────────────────────────────────
          {
            title: "Pivot Tables",
            description: "Creating pivot tables, calculated fields, slicers, and GETPIVOTDATA",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Create & configure a Pivot Table",
                  content: `-- Insert → PivotTable
-- Source: Table/Range or external connection
-- Place in: New Worksheet (recommended)

Field List zones:
  Filters   → drop a field here to add a report filter
  Columns   → fields become column headers
  Rows      → fields become row labels
  Values    → aggregated data (default: SUM for numbers, COUNT for text)

-- Change aggregation: right-click value → Value Field Settings
  Sum, Count, Average, Max, Min, StdDev, Var, etc.
  Show Values As: % of Grand Total, % of Row, Running Total, etc.

-- Group dates: right-click a date field → Group
  Year, Quarter, Month, Day options

-- Refresh: right-click → Refresh  (or Alt+F5 / Ctrl+Alt+F5 for all)`,
                },
                {
                  order: 1, language: "text", label: "Slicers & Timelines",
                  content: `-- Add Slicer: PivotTable Analyze → Insert Slicer
-- Add Timeline: PivotTable Analyze → Insert Timeline (for date fields)

-- Connect slicer to multiple pivots:
  Right-click slicer → Report Connections
  Check all pivots to control

-- Slicer shortcuts:
  Ctrl+Click     Multi-select items
  Alt+Click      Clear filter on slicer

-- Timeline filter levels: Years / Quarters / Months / Days`,
                },
                {
                  order: 2, language: "excel", label: "Calculated Field & GETPIVOTDATA",
                  content: `-- Calculated Field: PivotTable Analyze → Fields, Items & Sets → Calculated Field
-- Example: Profit = Revenue - Cost
-- Note: calculated fields always use SUM of source fields

-- GETPIVOTDATA: reference pivot values in formulas
=GETPIVOTDATA("Sales", $A$3, "Region", "North", "Year", 2025)
-- args: data_field, pivot_cell, [field1, item1, ...]

-- Disable GETPIVOTDATA auto-insert:
-- File → Options → Formulas → uncheck "Use GetPivotData"
-- Then you can reference cells directly with = and click`,
                },
              ],
            },
          },

          // ── Power Query Basics ────────────────────────────────────────────────
          {
            title: "Power Query Basics",
            description: "Import, transform, and load data with Power Query (Get & Transform)",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Launch & common transforms",
                  content: `-- Open Power Query:
  Data → Get Data → From File / Database / Web / etc.
  Data → Get Data → Launch Power Query Editor

-- Common transforms (Home / Transform tabs):
  Remove Columns         -- right-click column header
  Rename Column          -- double-click header
  Change Type            -- right-click → Change Type (critical: do this early)
  Remove Rows            -- Remove Top/Bottom/Blank/Duplicate rows
  Filter Rows            -- click column dropdown
  Split Column           -- by delimiter or number of chars
  Merge Columns          -- Transform → Merge Columns
  Group By               -- group and aggregate rows
  Pivot / Unpivot        -- reshape data
  Merge Queries          -- like SQL JOIN (Home → Merge Queries)
  Append Queries         -- stack tables vertically (Home → Append)

-- Refresh: Data → Refresh All  (or right-click query → Refresh)`,
                },
                {
                  order: 1, language: "text", label: "M formula basics",
                  content: `-- Power Query uses M language (functional, case-sensitive)
-- View/edit in: Home → Advanced Editor

-- Each step is a named let-in expression:
let
  Source      = Excel.CurrentWorkbook(){[Name="Sales"]}[Content],
  ChangedType = Table.TransformColumnTypes(Source,{
                  {"Date", type date},
                  {"Amount", type number}}),
  Filtered    = Table.SelectRows(ChangedType, each [Amount] > 0),
  Sorted      = Table.Sort(Filtered, {{"Date", Order.Descending}})
in
  Sorted

-- Add custom column (Transform → Custom Column):
= [Price] * [Quantity]
= Text.Upper([Name])
= Date.Year([OrderDate])
= if [Status] = "Active" then "Y" else "N"`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded category:", excel.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
