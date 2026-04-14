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
      role: "ADMIN",
    },
  });

  await prisma.category.deleteMany({
    where: { name: "Regex", userId: admin.id },
  });

  const regex = await prisma.category.create({
    data: {
      name: "Regex",
      icon: "🔍",
      color: "yellow",
      description: "Regular expressions reference: syntax, anchors, quantifiers, groups, lookaheads, flags, and practical patterns for validation and extraction",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Character Classes & Metacharacters ────────────────────────────
          {
            title: "Character Classes & Metacharacters",
            description: "Literal characters, wildcards, shorthand classes, and character sets",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Metacharacters & wildcards",
                  content: `METACHARACTERS  (must escape with \\ to match literally)
  .   Any character except newline  (use [\\s\\S] or /s flag for newline too)
  \\   Escape next character          \\. matches a literal dot
  ^   Start of string (or line with /m flag)
  $   End of string (or line with /m flag)
  *   Zero or more of preceding
  +   One or more of preceding
  ?   Zero or one of preceding  (also makes quantifiers lazy)
  {   Start of repetition quantifier
  }   End of repetition quantifier
  [   Start of character class
  ]   End of character class
  (   Start of group
  )   End of group
  |   Alternation (OR)

SHORTHAND CHARACTER CLASSES
  \\d   Digit              [0-9]
  \\D   Non-digit          [^0-9]
  \\w   Word character     [a-zA-Z0-9_]
  \\W   Non-word           [^a-zA-Z0-9_]
  \\s   Whitespace         [ \\t\\n\\r\\f\\v]
  \\S   Non-whitespace     [^ \\t\\n\\r\\f\\v]
  \\b   Word boundary      (zero-width)
  \\B   Non-word boundary  (zero-width)

SPECIAL CHARACTERS
  \\n   Newline
  \\t   Tab
  \\r   Carriage return
  \\0   Null character
  \\xHH  Hex code (e.g. \\x41 = A)
  \\uHHHH  Unicode code point`,
                },
                {
                  order: 1, language: "text", label: "Character classes [ ]",
                  content: `CHARACTER CLASS  [ ]  — match any one character inside
  [abc]       a, b, or c
  [^abc]      Any character EXCEPT a, b, c  (negation)
  [a-z]       Any lowercase letter
  [A-Z]       Any uppercase letter
  [0-9]       Any digit  (same as \\d)
  [a-zA-Z]    Any letter
  [a-zA-Z0-9] Any alphanumeric
  [a-z0-9_-]  Lowercase, digit, underscore, or hyphen
  [\\w\\s]      Word character or whitespace
  [^\\n]       Any character except newline

POSIX CLASSES  (some flavours: ERE, Perl, Python re with re.LOCALE)
  [:alpha:]   [a-zA-Z]
  [:digit:]   [0-9]
  [:alnum:]   [a-zA-Z0-9]
  [:space:]   Whitespace
  [:upper:]   [A-Z]
  [:lower:]   [a-z]
  [:punct:]   Punctuation

INSIDE A CHARACTER CLASS
  - Range only between two chars:  [a-z]
  - ] must be first or escaped:    []abc] or [\\]abc]
  - ^ only negates at start:       [^abc]  vs  [a^bc]
  - - must be first, last, or escaped: [-az]  [az-]  [a\\-z]
  - Metacharacters lose special meaning: [.+*?] matches . + * ?`,
                },
              ],
            },
          },
          // ── Anchors & Boundaries ──────────────────────────────────────────
          {
            title: "Anchors & Boundaries",
            description: "Position anchors, word boundaries, and multiline behaviour",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Anchors",
                  content: `ANCHORS  (zero-width — match a position, not a character)

  ^     Start of string
        With /m flag: start of each line
  $     End of string (before optional trailing newline)
        With /m flag: end of each line
  \\A    Absolute start of string  (Python, Java, Ruby — ignores /m)
  \\Z    Absolute end of string before optional newline  (Python, Java)
  \\z    Absolute end of string  (no newline exception)
  \\G    Position where last match ended  (useful with global flag)

WORD BOUNDARY
  \\b    Transition between \\w and \\W (or start/end of string)
        \\bcat\\b  matches "cat" but not "cats" or "scatter"
  \\B    Not a word boundary
        \\Bcat\\B  matches "scatter" but not standalone "cat"

EXAMPLES
  ^hello        "hello world"  ✓  but not "say hello"
  world$        "hello world"  ✓  but not "world domination"
  ^hello$       Only the exact string "hello"
  \\bword\\b      "a word here"  ✓  but not "sword" or "words"
  \\d{4}$        "price: 2024"  ✓  (ends with 4 digits)`,
                },
              ],
            },
          },
          // ── Quantifiers ───────────────────────────────────────────────────
          {
            title: "Quantifiers",
            description: "Greedy, lazy, and possessive quantifiers with repetition syntax",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Greedy vs lazy",
                  content: `GREEDY QUANTIFIERS  (match as much as possible)
  *     Zero or more         a*     "" "a" "aaa"
  +     One or more          a+     "a" "aaa"
  ?     Zero or one          a?     "" "a"
  {n}   Exactly n            a{3}   "aaa"
  {n,}  n or more            a{2,}  "aa" "aaa" ...
  {n,m} Between n and m      a{2,4} "aa" "aaa" "aaaa"

LAZY QUANTIFIERS  (match as little as possible — add ? after)
  *?    Zero or more, lazy
  +?    One or more, lazy
  ??    Zero or one, lazy
  {n,m}? n to m, lazy

GREEDY vs LAZY EXAMPLE
  Input: "<b>bold</b> and <i>italic</i>"

  <.+>   greedy → matches entire "<b>bold</b> and <i>italic</i>"
  <.+?>  lazy   → matches "<b>" then "</b>" etc. (shortest match)

POSSESSIVE QUANTIFIERS  (no backtracking — some flavours: Java, PCRE2)
  *+    Zero or more, possessive
  ++    One or more, possessive
  ?+    Zero or one, possessive
  Prevents catastrophic backtracking but may miss valid matches

CATASTROPHIC BACKTRACKING  (ReDoS)
  Pattern (a+)+ on "aaaaaaaaab" — exponential backtracking
  Always benchmark regex on long inputs; prefer atomic groups`,
                },
              ],
            },
          },
          // ── Groups & Capturing ────────────────────────────────────────────
          {
            title: "Groups & Capturing",
            description: "Capturing groups, non-capturing groups, named groups, and backreferences",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Group syntax",
                  content: `CAPTURING GROUP  ( )
  (abc)       Captures "abc" as group 1
  (a|b|c)     Captures a, b, or c  (alternation inside group)
  Referenced as \\1, \\2 … in pattern; $1, $2 … in replacement

NON-CAPTURING GROUP  (?:)
  (?:abc)     Groups without capturing — faster, cleaner
  (?:foo|bar)+ One or more of "foo" or "bar"

NAMED CAPTURING GROUP  (?<name>) or (?P<name>)
  (?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})
  JavaScript: match.groups.year
  Python:     match.group("year")  or  match["year"]
  .NET:       match.Groups["year"].Value

BACKREFERENCE  \\1  or  \\k<name>
  (\\w+) \\1          Matches repeated word: "hello hello"
  (?<q>["\']).*?\\k<q>  Matches string in matching quotes

ALTERNATION  |
  cat|dog       "cat" or "dog"
  (cat|dog)s    "cats" or "dogs"
  Tip: put longer alternatives first — (catalogue|cat) not (cat|catalogue)

ATOMIC GROUP  (?>)  — no backtracking into group (PCRE, .NET, Java)
  (?>a|ab)c     Won't backtrack if (?>a) consumed "a" and "c" fails
  Prevents ReDoS in complex patterns`,
                },
                {
                  order: 1, language: "text", label: "Backreferences in replacement",
                  content: `REPLACEMENT SYNTAX BY LANGUAGE
  ──────────────────────────────────────────────────────────
  Language    Group ref    Named group ref
  ──────────────────────────────────────────────────────────
  JavaScript  $1 $2        $<name>
  Python      \\1 \\2       \\g<name>
  Java        $1 $2        \${name}
  .NET / C#   $1 $2        \${name}
  Ruby        \\1 \\2       \\k<name>
  sed         \\1 \\2       (no named groups)
  awk         (uses sub/gsub with & for full match)
  ──────────────────────────────────────────────────────────

EXAMPLES
  # Swap first and last name
  Pattern:     (\\w+) (\\w+)
  Replacement: $2, $1
  "Alice Smith" → "Smith, Alice"

  # ISO date reformat  YYYY-MM-DD → DD/MM/YYYY
  Pattern:     (\\d{4})-(\\d{2})-(\\d{2})
  Replacement: $3/$2/$1

  # Named group reformat (Python)
  import re
  s = "2024-03-15"
  result = re.sub(r"(?P<y>\\d{4})-(?P<m>\\d{2})-(?P<d>\\d{2})",
                  r"\\g<d>/\\g<m>/\\g<y>", s)
  # "15/03/2024"`,
                },
              ],
            },
          },
          // ── Lookarounds ───────────────────────────────────────────────────
          {
            title: "Lookahead & Lookbehind",
            description: "Zero-width assertions: positive/negative lookahead and lookbehind",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Lookaround syntax",
                  content: `LOOKAHEADS  (assert what follows — zero-width, no capture)
  (?=...)    Positive lookahead   — must be followed by ...
  (?!...)    Negative lookahead   — must NOT be followed by ...

LOOKBEHINDS  (assert what precedes — zero-width, no capture)
  (?<=...)   Positive lookbehind  — must be preceded by ...
  (?<!...)   Negative lookbehind  — must NOT be preceded by ...

  Note: lookbehind patterns must be fixed-width in most flavours
        (Python 3.12+ allows variable-width; PCRE allows some)

EXAMPLES
  \\d+(?= dollars)     Matches number only if followed by " dollars"
                       "100 dollars" → "100"  ;  "100 euros" → no match

  \\d+(?! dollars)     Matches number NOT followed by " dollars"

  (?<=\\$)\\d+          Matches digits only if preceded by $
                       "$42.00" → "42"

  (?<!\\$)\\d+          Matches digits NOT preceded by $

  (?<=\\bun)\\w+        Matches the part after "un" in "unhappy" → "happy"

  \\b\\w+(?=ing\\b)      Word stem before "ing": "running" → "runn"

COMBINED
  (?<=@)\\w+(?=\\.)     Domain name part in email: user@gmail.com → "gmail"`,
                },
                {
                  order: 1, language: "text", label: "Password strength example",
                  content: `PASSWORD VALIDATION — multiple lookaheads enforce all rules at once

  ^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{8,}$

  Breakdown:
  ^                   start of string
  (?=.*[a-z])         must contain at least one lowercase letter
  (?=.*[A-Z])         must contain at least one uppercase letter
  (?=.*\\d)            must contain at least one digit
  (?=.*[^a-zA-Z\\d])  must contain at least one special character
  .{8,}               at least 8 characters (any)
  $                   end of string

  Test:
  "abc"        ✗  (too short, missing uppercase/digit/special)
  "Abc1234!"   ✓
  "password1"  ✗  (missing uppercase and special char)

USING LOOKAHEADS FOR INSERT-STYLE REPLACEMENT
  # Add commas to large numbers: 1234567 → 1,234,567
  Pattern:     (?<=\\d)(?=(\\d{3})+$)
  JavaScript:  "1234567".replace(/(?<=\\d)(?=(\\d{3})+$)/g, ",")`,
                },
              ],
            },
          },
          // ── Flags / Modifiers ─────────────────────────────────────────────
          {
            title: "Flags & Modifiers",
            description: "Global, case-insensitive, multiline, dotall, verbose, and unicode flags",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Flags by language",
                  content: `COMMON FLAGS
  ────────────────────────────────────────────────────────────────────
  Flag    Meaning                JS   Python   Java    PCRE
  ────────────────────────────────────────────────────────────────────
  i       Case-insensitive       /i   re.I     (?i)    /i
  g       Global (all matches)   /g   findall  (loop)  /g
  m       Multiline ^$ per line  /m   re.M     (?m)    /m
  s       Dotall (. matches \\n)  /s   re.S     (?s)    /s
  x       Verbose (free-spacing) —    re.X     (?x)    /x
  u       Unicode                /u   (always) (?u)    /u
  y       Sticky (JS only)       /y   —        —       —
  d       Indices (JS ES2022)    /d   —        —       —
  ────────────────────────────────────────────────────────────────────

INLINE FLAGS  (inside the pattern, any flavour)
  (?i)abc       Case-insensitive from here
  (?m)^foo      Multiline from here
  (?is).*       Dotall + case-insensitive
  (?-i)abc      Turn OFF case-insensitive
  (?i:abc)      Apply flag only to this group (scoped)`,
                },
                {
                  order: 1, language: "python", label: "Verbose mode (re.X)",
                  content: `import re

# ❌ Hard to read
email_re = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")

# ✅ Verbose mode — whitespace and comments ignored
email_re = re.compile(r"""
    [a-zA-Z0-9._%+-]+   # local part
    @                    # at sign
    [a-zA-Z0-9.-]+       # domain
    \\.                   # dot
    [a-zA-Z]{2,}         # TLD (2+ letters)
""", re.VERBOSE | re.IGNORECASE)

# Multiline + dotall example
html_re = re.compile(r"""
    <                # opening angle bracket
    (\\w+)           # tag name  (captured)
    [^>]*            # optional attributes
    >                # closing angle bracket
    (.*?)            # content  (captured, lazy)
    </\\1>            # matching closing tag
""", re.VERBOSE | re.DOTALL)`,
                },
              ],
            },
          },
          // ── Language APIs ─────────────────────────────────────────────────
          {
            title: "Regex APIs by Language",
            description: "JavaScript, Python, and common CLI tools regex usage",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "JavaScript",
                  content: `// Creating a regex
const re1 = /pattern/flags;
const re2 = new RegExp("pattern", "flags");  // dynamic pattern

// Test — returns boolean
/^\\d+$/.test("123")          // true
/^\\d+$/.test("12x")          // false

// Match — returns array or null
"hello world".match(/\\w+/);       // ["hello"] (first match)
"hello world".match(/\\w+/g);      // ["hello", "world"] (all matches)

// MatchAll — iterator of all matches with groups
const matches = [...str.matchAll(/(?<y>\\d{4})-(?<m>\\d{2})/g)];
matches[0].groups.y   // "2024"

// Replace
"hello world".replace(/o/g, "0");       // "hell0 w0rld"
"Alice Smith".replace(/(\\w+) (\\w+)/, "$2, $1");  // "Smith, Alice"
"hello".replace(/l+/, (m) => m.toUpperCase());     // "hELLo" (function)

// Search — returns index or -1
"hello".search(/l+/);   // 2

// Split
"a1b2c3".split(/\\d/);   // ["a","b","c",""]
"a1b2c3".split(/(\\d)/); // ["a","1","b","2","c","3",""] (capture group kept)

// Named groups
const { year, month } = "2024-03".match(/(?<year>\\d{4})-(?<month>\\d{2})/).groups;`,
                },
                {
                  order: 1, language: "python", label: "Python",
                  content: `import re

# Compile for reuse (faster in loops)
pattern = re.compile(r"\\d{4}-\\d{2}-\\d{2}")

# match — anchored at start of string
m = re.match(r"\\d+", "123abc")     # Match object or None
m.group()    # "123"
m.start()    # 0
m.end()      # 3
m.span()     # (0, 3)

# search — first match anywhere in string
re.search(r"\\d+", "abc123").group()   # "123"

# findall — list of all matches (strings)
re.findall(r"\\d+", "a1 b22 c333")    # ["1", "22", "333"]
re.findall(r"(\\w+)@(\\w+)", "a@b c@d") # [("a","b"), ("c","d")] with groups

# finditer — iterator of match objects
for m in re.finditer(r"\\d+", "a1 b22"):
    print(m.group(), m.start())

# sub — replace
re.sub(r"\\s+", "-", "hello   world")        # "hello-world"
re.sub(r"(\\w+) (\\w+)", r"\\2 \\1", "hi there")  # "there hi"
re.sub(r"\\d+", lambda m: str(int(m.group())*2), "a1b2")  # "a2b4"

# split
re.split(r"\\s+", "a  b  c")   # ["a","b","c"]

# Named groups
m = re.match(r"(?P<y>\\d{4})-(?P<m>\\d{2})", "2024-03")
m.group("y")     # "2024"
m.groupdict()    # {"y": "2024", "m": "03"}`,
                },
                {
                  order: 2, language: "bash", label: "CLI — grep, sed, awk",
                  content: `# grep — search files
grep "pattern" file.txt
grep -E "pattern"   file.txt    # extended regex (ERE)
grep -P "pattern"   file.txt    # Perl-compatible regex (PCRE)
grep -i "pattern"   file.txt    # case-insensitive
grep -r "pattern"   ./dir/      # recursive
grep -n "pattern"   file.txt    # show line numbers
grep -v "pattern"   file.txt    # invert (lines NOT matching)
grep -o "pattern"   file.txt    # only matching part
grep -c "pattern"   file.txt    # count matching lines

# Extract IP addresses
grep -Eo '([0-9]{1,3}\\.){3}[0-9]{1,3}' access.log

# sed — stream edit
sed 's/foo/bar/'          file   # replace first occurrence per line
sed 's/foo/bar/g'         file   # replace all (global)
sed 's/foo/bar/gi'        file   # global + case-insensitive
sed -n '/pattern/p'       file   # print only matching lines
sed '/pattern/d'          file   # delete matching lines
sed -E 's/(\\w+) (\\w+)/\\2 \\1/'  # ERE with backreference
sed -i 's/old/new/g'      file   # in-place edit

# awk — field processing
awk '/pattern/ {print $0}'       file   # print matching lines
awk '/pattern/ {print $1, $3}'   file   # print fields 1 and 3
awk -F',' '/error/ {print $2}'   file   # CSV, print 2nd field on error lines
awk 'NR==5'                      file   # print line 5
awk 'NR>=5 && NR<=10'            file   # print lines 5-10`,
                },
              ],
            },
          },
          // ── Practical Patterns ────────────────────────────────────────────
          {
            title: "Practical Validation Patterns",
            description: "Ready-to-use regex for email, URL, IP, dates, credit cards, and more",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Common validation patterns",
                  content: `EMAIL (simplified — RFC 5322 is far more complex)
  [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}

URL
  https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w.,@?^=%&:/~+#\\-_]*[\\w@?^=%&/~+#\\-_])?

IPv4 ADDRESS
  \\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b

IPv6 ADDRESS (simplified)
  ([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}

MAC ADDRESS
  ([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}

DATES
  ISO 8601:         \\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])
  DD/MM/YYYY:       (?:0[1-9]|[12]\\d|3[01])/(?:0[1-9]|1[0-2])/\\d{4}
  MM/DD/YYYY:       (?:0[1-9]|1[0-2])/(?:0[1-9]|[12]\\d|3[01])/\\d{4}

TIME
  HH:MM:SS (24h):   (?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d
  HH:MM (12h):      (?:0?[1-9]|1[0-2]):[0-5]\\d\\s?[AaPp][Mm]

PHONE (US)
  \\+?1?[-.\\s]?\\(?[0-9]{3}\\)?[-.\\s]?[0-9]{3}[-.\\s]?[0-9]{4}

CREDIT CARD (basic — Luhn check separately)
  Visa:             4[0-9]{12}(?:[0-9]{3})?
  Mastercard:       5[1-5][0-9]{14}
  Amex:             3[47][0-9]{13}
  Any 16-digit:     \\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}`,
                },
                {
                  order: 1, language: "text", label: "Code & markup patterns",
                  content: `SEMANTIC VERSION  (semver)
  (0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z][\\w.]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z][\\w.]*))*))?

HEX COLOR
  #(?:[0-9a-fA-F]{3}){1,2}\\b
  Full: #[0-9a-fA-F]{6}

UUID / GUID
  [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}

SLUG (URL-safe string)
  [a-z0-9]+(?:-[a-z0-9]+)*

USERNAME  (3-20 chars, letters/digits/underscores)
  [a-zA-Z][a-zA-Z0-9_]{2,19}

PASSWORD STRENGTH  (min 8, upper, lower, digit, special)
  ^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).{8,}$

HTML TAG (simplified — do not parse HTML with regex!)
  <([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>

HTML COMMENTS
  <!--[\\s\\S]*?-->

YAML COMMENT LINE
  ^\\s*#.*$

BLANK LINES
  ^\\s*$

TRAILING WHITESPACE
  \\s+$

REPEATED WORDS  (common writing mistake)
  \\b(\\w+)\\s+\\1\\b

CAMEL TO SNAKE CASE  (replace with $1_$2, lowercase result)
  ([a-z])([A-Z])`,
                },
                {
                  order: 2, language: "text", label: "Log & data extraction patterns",
                  content: `UNIX SYSLOG LINE
  (\\w{3}\\s+\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2})\\s+(\\S+)\\s+(\\w+)\\[?(\\d*)\\]?:\\s+(.*)
  Groups: timestamp, host, process, PID, message

NGINX ACCESS LOG
  (\\S+)\\s+-\\s+(\\S+)\\s+\\[([^\\]]+)\\]\\s+"(\\S+)\\s+(\\S+)\\s+(\\S+)"\\s+(\\d{3})\\s+(\\d+)
  Groups: IP, user, time, method, path, protocol, status, bytes

APACHE COMBINED LOG
  ^(\\S+)\\s\\S+\\s(\\S+)\\s\\[([^\\]]+)\\]\\s"([^"]+)"\\s(\\d{3})\\s(\\d+|-)\\s"([^"]*)"\\s"([^"]*)"

DOCKER LOG TIMESTAMP
  \\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z

AWS ARN
  arn:[a-z0-9-]+:[a-z0-9-]+:(?:[a-z0-9-]*)?:(?:\\d{12})?:[\\w:/.-]+

GIT COMMIT HASH
  \\b[0-9a-f]{7,40}\\b

FILE PATH (Unix)
  (?:/[\\w.\\-]+)+/?

FILE PATH (Windows)
  [A-Za-z]:\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*

FILE EXTENSION
  \\.([a-zA-Z0-9]+)$`,
                },
              ],
            },
          },
          // ── POSIX ERE vs PCRE vs RE2 ──────────────────────────────────────
          {
            title: "Flavour Differences",
            description: "POSIX ERE, PCRE, RE2, and key differences between regex engines",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Flavour comparison",
                  content: `REGEX FLAVOUR COMPARISON
  ─────────────────────────────────────────────────────────────────────
  Feature               POSIX ERE   PCRE      RE2       JS (V8)
  ─────────────────────────────────────────────────────────────────────
  Capturing groups      ✓           ✓         ✓         ✓
  Non-capturing (?:)    ✗           ✓         ✓         ✓
  Named groups          ✗           ✓         ✓         ✓
  Lookahead             ✗           ✓         ✓         ✓
  Lookbehind            ✗           ✓         ✓*        ✓**
  Backreferences        ✓           ✓         ✗         ✓
  Atomic groups (?>)    ✗           ✓         ✗         ✗
  Possessive quant.     ✗           ✓         ✗         ✗
  Recursive patterns    ✗           ✓         ✗         ✗
  Verbose mode (?x)     ✗           ✓         ✓         ✗
  Unicode props \\p{}    ✗           ✓         ✓         ✓ (with /u)
  ─────────────────────────────────────────────────────────────────────
  *  RE2: fixed-width lookbehind only
  ** JS: variable-width lookbehind supported in V8

RE2 (Go, Google RE2, Rust regex crate)
  Guarantees O(n) matching — no catastrophic backtracking
  No backreferences (they require backtracking)
  Safe for user-supplied patterns — use when accepting regex from users

PCRE / PCRE2 (PHP, Python re, Perl, Ruby, .NET)
  Most feature-rich; backreferences, lookarounds, recursion
  Worst-case exponential on adversarial input (ReDoS risk)

POSIX ERE (grep -E, awk, sed -E)
  Minimal feature set; no lookarounds, no named groups, no \\d
  Portable across all Unix tools`,
                },
                {
                  order: 1, language: "text", label: "Performance & ReDoS",
                  content: `REDOS — REGULAR EXPRESSION DENIAL OF SERVICE
  Occurs when a regex has exponential worst-case backtracking.
  An attacker can supply input that causes 100% CPU for seconds/minutes.

VULNERABLE PATTERNS (examples)
  (a+)+          on "aaaaaaaaab" — exponential
  ([a-zA-Z]+)*   same class of problem
  (a|aa)+        alternation with overlap
  ^(\\w+\\s?)*$   catastrophic on long strings without trailing newline

HOW TO DETECT
  • Use regex-profiling tools: regexploit, vuln-regex-detector
  • Test with strings like "a" * 30 + "!"
  • Use timeout wrappers around regex execution
  • Switch to RE2 / linear-time engines for untrusted input

SAFE PATTERNS INSTEAD
  (a+)+   →  a+          (flatten nested quantifiers)
  \\w+\\s+  →  \\S+\\s+     (use simpler non-overlapping classes)

PERFORMANCE TIPS
  • Compile regex once, reuse (re.compile in Python, /pattern/ in JS hoisted)
  • Anchor patterns when possible (^ and $) — short-circuits faster
  • Use atomic groups or possessive quantifiers to prevent backtracking
  • Put the most specific alternative first in |
  • Avoid .* in the middle of patterns where possible
  • Measure: timeit / %timeit / performance.now()`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Regex cheatsheet: ${regex.name} (${regex.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
