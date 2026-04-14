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
    where: { name: "Bash", userId: admin.id },
  });

  const bash = await prisma.category.create({
    data: {
      name: "Bash",
      icon: "💲",
      color: "green",
      description: "Bash scripting reference: variables, arrays, functions, control flow, string/arithmetic operations, I/O, error handling, and script patterns",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Variables & Parameters ────────────────────────────────────────
          {
            title: "Variables & Parameters",
            description: "Declaring, expanding, and applying default values to variables and special parameters",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Variable basics",
                  content: `# Assign (no spaces around =)
name="Alice"
count=42
readonly PI=3.14159      # constant

# Expand
echo "$name"
echo "\${name}"           # unambiguous form

# Unset
unset name

# Environment variables
export APP_ENV="production"
printenv APP_ENV
env | grep APP`,
                },
                {
                  order: 1, language: "bash", label: "Parameter expansion & defaults",
                  content: `# Default values
echo "\${VAR:-default}"       # use default if unset or empty
echo "\${VAR:=default}"       # assign default if unset or empty
echo "\${VAR:?error msg}"     # error and exit if unset or empty
echo "\${VAR:+other}"         # use other if VAR is set

# String length
echo "\${#name}"

# Substring
str="Hello, World"
echo "\${str:7}"              # World
echo "\${str:7:5}"            # World (5 chars from pos 7)

# Remove prefix / suffix
path="/usr/local/bin/bash"
echo "\${path##*/}"           # bash (strip longest prefix match)
echo "\${path%/*}"            # /usr/local/bin (strip suffix)
echo "\${path#*/}"            # usr/local/bin/bash (strip shortest prefix)

# Replace
echo "\${str/World/Bash}"     # replace first
echo "\${str//l/L}"           # replace all`,
                },
                {
                  order: 2, language: "bash", label: "Special parameters",
                  content: `$0     # script name
$1..$9 # positional arguments
$@     # all arguments (preserves quoting)
$*     # all arguments as single word
$#     # number of arguments
$?     # exit status of last command
$$     # PID of current shell
$!     # PID of last background job
$_     # last argument of previous command

# Shift positional parameters
shift         # discard $1, $2 becomes $1
shift 2       # discard first two`,
                },
              ],
            },
          },
          // ── Strings & Arithmetic ──────────────────────────────────────────
          {
            title: "Strings & Arithmetic",
            description: "String manipulation, case conversion, printf formatting, and arithmetic",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "String operations",
                  content: `str="Hello, World!"

# Uppercase / lowercase (Bash 4+)
echo "\${str^^}"              # HELLO, WORLD!
echo "\${str,,}"              # hello, world!
echo "\${str^}"               # Capitalise first char

# Check if string contains substring
if [[ "$str" == *"World"* ]]; then echo "found"; fi

# Regex match
if [[ "$str" =~ ^Hello ]]; then echo "starts with Hello"; fi
echo "\${BASH_REMATCH[0]}"    # full match
echo "\${BASH_REMATCH[1]}"    # first capture group`,
                },
                {
                  order: 1, language: "bash", label: "printf & here-docs",
                  content: `# printf — better than echo for formatting
printf "Name: %s, Age: %d\\n" "Alice" 30
printf "%05d\\n" 42           # 00042
printf "%.2f\\n" 3.14159      # 3.14

# Here-document
cat <<EOF
Line one
Line two: $name
EOF

# Here-doc without variable expansion
cat <<'EOF'
Literal $name — not expanded
EOF

# Here-string
grep "pattern" <<< "$variable"`,
                },
                {
                  order: 2, language: "bash", label: "Arithmetic",
                  content: `# (( )) — arithmetic evaluation
((x = 5 + 3))
((x++))
((x *= 2))
echo $((10 / 3))             # integer division: 3
echo $((10 % 3))             # modulo: 1
echo $((2 ** 8))             # exponentiation: 256

# let
let "x = 5 * 4"

# Floating point requires bc or awk
echo "scale=2; 10 / 3" | bc  # 3.33
awk 'BEGIN { printf "%.4f\\n", 10/3 }'`,
                },
              ],
            },
          },
          // ── Arrays ────────────────────────────────────────────────────────
          {
            title: "Arrays",
            description: "Indexed arrays, associative arrays, and common array operations",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Indexed arrays",
                  content: `# Declare and assign
fruits=("apple" "banana" "cherry")
fruits[3]="date"

# Access
echo "\${fruits[0]}"          # apple
echo "\${fruits[@]}"          # all elements
echo "\${#fruits[@]}"         # count
echo "\${!fruits[@]}"         # all indices

# Slice
echo "\${fruits[@]:1:2}"      # banana cherry

# Append
fruits+=("elderberry")

# Iterate
for fruit in "\${fruits[@]}"; do
  echo "$fruit"
done

# Delete element / array
unset 'fruits[1]'
unset fruits`,
                },
                {
                  order: 1, language: "bash", label: "Associative arrays (Bash 4+)",
                  content: `# Must declare explicitly
declare -A colors

colors["red"]="#FF0000"
colors["green"]="#00FF00"
colors["blue"]="#0000FF"

# Access
echo "\${colors[red]}"

# All keys / values
echo "\${!colors[@]}"         # keys
echo "\${colors[@]}"          # values

# Iterate
for key in "\${!colors[@]}"; do
  echo "$key = \${colors[$key]}"
done

# Check key exists
if [[ -v colors["red"] ]]; then echo "exists"; fi`,
                },
              ],
            },
          },
          // ── Control Flow ──────────────────────────────────────────────────
          {
            title: "Control Flow",
            description: "if/elif/else, case, for, while, until, break, and continue",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "if / elif / else",
                  content: `# File tests
if [ -f "$file" ]; then
  echo "regular file"
elif [ -d "$file" ]; then
  echo "directory"
else
  echo "other"
fi

# String comparison ([[ preferred ])
if [[ "$env" == "prod" ]]; then echo "production"; fi
if [[ -z "$var" ]]; then echo "empty"; fi
if [[ -n "$var" ]]; then echo "not empty"; fi

# Numeric comparison
if (( count > 10 )); then echo "large"; fi
if [ "$count" -gt 10 ]; then echo "large"; fi   # POSIX style

# Combine conditions
if [[ "$a" == "x" && "$b" == "y" ]]; then echo "both"; fi
if [[ "$a" == "x" || "$b" == "y" ]]; then echo "either"; fi`,
                },
                {
                  order: 1, language: "bash", label: "case",
                  content: `case "$1" in
  start)
    echo "Starting..."
    ;;
  stop|halt)
    echo "Stopping..."
    ;;
  restart)
    echo "Restarting..."
    ;;
  [0-9]*)
    echo "Numeric argument"
    ;;
  *)
    echo "Unknown: $1"
    exit 1
    ;;
esac`,
                },
                {
                  order: 2, language: "bash", label: "Loops",
                  content: `# for — list
for item in one two three; do
  echo "$item"
done

# for — C-style
for ((i = 0; i < 10; i++)); do
  echo "$i"
done

# for — range with step
for i in {1..5}; do echo "$i"; done
for i in {0..20..5}; do echo "$i"; done

# while — read file line by line
while IFS= read -r line; do
  echo "$line"
done < file.txt

# until
until ping -c1 host &>/dev/null; do
  echo "waiting..."; sleep 5
done

# break / continue
for i in {1..10}; do
  ((i % 2 == 0)) && continue
  ((i > 7))      && break
  echo "$i"
done`,
                },
              ],
            },
          },
          // ── Functions ─────────────────────────────────────────────────────
          {
            title: "Functions",
            description: "Declaring functions, local variables, return values, and common patterns",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Declaring & calling",
                  content: `# Two equivalent syntaxes
greet() {
  echo "Hello, $1!"
}

function greet {
  echo "Hello, $1!"
}

greet "World"

# Local variables (avoid polluting global scope)
calculate() {
  local result=$(( $1 * $2 ))
  echo "$result"
}

product=$(calculate 6 7)
echo "$product"    # 42`,
                },
                {
                  order: 1, language: "bash", label: "Return values & error codes",
                  content: `# return sets exit status (0–255)
is_even() {
  (( $1 % 2 == 0 ))   # returns 0 (true) if even
}

if is_even 4; then echo "even"; fi

# Return data via stdout
get_date() {
  date +%Y-%m-%d
}
today=$(get_date)

# Return data via nameref (Bash 4.3+)
get_info() {
  local -n _result=$1   # nameref — points to caller's variable
  _result="some value"
}
get_info my_var
echo "$my_var"`,
                },
                {
                  order: 2, language: "bash", label: "Useful function patterns",
                  content: `# Logging helpers
info()  { echo "[INFO]  $*"; }
warn()  { echo "[WARN]  $*" >&2; }
error() { echo "[ERROR] $*" >&2; }
die()   { error "$*"; exit 1; }

# Require command exists
require() {
  command -v "$1" &>/dev/null || die "$1 is required but not installed"
}
require docker
require kubectl

# Retry with backoff
retry() {
  local tries=$1; shift
  for ((i=1; i<=tries; i++)); do
    "$@" && return 0
    echo "Attempt $i/$tries failed. Retrying in \${i}s..."
    sleep "$i"
  done
  return 1
}
retry 3 curl -sf https://api.example.com/health`,
                },
              ],
            },
          },
          // ── Input / Output & Redirection ──────────────────────────────────
          {
            title: "Input / Output & Redirection",
            description: "read, file descriptors, redirection, pipes, and process substitution",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "read — user input",
                  content: `# Basic read
read -p "Enter name: " name
echo "Hello, $name"

# Silent (passwords)
read -s -p "Password: " password
echo

# Timeout
read -t 10 -p "Continue? [y/N] " answer || answer="n"

# Read into array
read -ra parts <<< "one two three"
echo "\${parts[1]}"    # two

# Read file line by line
while IFS= read -r line; do
  echo ">> $line"
done < input.txt

# Read CSV with delimiter
while IFS=',' read -r field1 field2; do
  echo "$field1 | $field2"
done < data.csv`,
                },
                {
                  order: 1, language: "bash", label: "Redirection & file descriptors",
                  content: `# Standard streams: 0=stdin  1=stdout  2=stderr

command > out.txt          # stdout → file (overwrite)
command >> out.txt         # stdout → file (append)
command 2> err.txt         # stderr → file
command &> all.txt         # stdout + stderr → file
command 2>&1               # redirect stderr to stdout
command > /dev/null 2>&1   # suppress all output

# Custom file descriptors
exec 3> output.txt         # open fd 3 for writing
echo "data" >&3
exec 3>&-                  # close fd 3

exec 4< input.txt          # open fd 4 for reading
read -u4 line
exec 4<&-

# Process substitution
diff <(sort file1.txt) <(sort file2.txt)
wc -l <(find . -name "*.go")`,
                },
                {
                  order: 2, language: "bash", label: "Pipes & tee",
                  content: `# Pipe stdout to next command
cat file.txt | grep error | sort | uniq -c | sort -rn

# tee — write to file AND stdout
command | tee output.txt
command | tee -a output.txt     # append

# Named pipes (FIFOs)
mkfifo /tmp/mypipe
producer > /tmp/mypipe &
consumer < /tmp/mypipe

# Redirect stderr through pipe
command 2>&1 | grep error

# pipefail — catch errors in pipelines
set -o pipefail
false | true; echo $?   # 1 (without pipefail would be 0)`,
                },
              ],
            },
          },
          // ── Error Handling & Debugging ────────────────────────────────────
          {
            title: "Error Handling & Debugging",
            description: "set options, trap, strict mode, and bash debug techniques",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Strict mode",
                  content: `#!/usr/bin/env bash
set -euo pipefail
# -e  exit immediately on error
# -u  treat unset variables as errors
# -o pipefail  catch errors in pipelines
# Combine with -E for trap inheritance in functions:
set -Eeuo pipefail

# Allow a single command to fail
grep "pattern" file.txt || true
if ! command; then echo "failed but continuing"; fi`,
                },
                {
                  order: 1, language: "bash", label: "trap — cleanup & signals",
                  content: `# Run cleanup on exit (even on error)
cleanup() {
  echo "Cleaning up..."
  rm -f /tmp/lockfile
}
trap cleanup EXIT

# Catch errors with line number
on_error() {
  echo "Error on line $1" >&2
}
trap 'on_error $LINENO' ERR

# Handle signals
trap 'echo "Interrupted"; exit 130' INT TERM

# Ignore a signal
trap '' HUP

# Reset to default
trap - EXIT`,
                },
                {
                  order: 2, language: "bash", label: "Debugging",
                  content: `# Trace execution (print each command before running)
set -x
# ... commands ...
set +x    # stop tracing

# Run entire script in debug mode
bash -x script.sh

# Dry-run pattern
DRY_RUN=\${DRY_RUN:-false}
run() {
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] $*"
  else
    "$@"
  fi
}
run rm -rf /tmp/old_data

# Static analysis
shellcheck script.sh`,
                },
              ],
            },
          },
          // ── Script Structure & Patterns ───────────────────────────────────
          {
            title: "Script Structure & Patterns",
            description: "Shebang, getopts argument parsing, lock files, and script templates",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Script header template",
                  content: `#!/usr/bin/env bash
set -Eeuo pipefail

# Reliable script directory
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

# Colours
RED='\\033[0;31m'; GREEN='\\033[0;32m'; YELLOW='\\033[1;33m'; NC='\\033[0m'

log()   { echo -e "\${GREEN}[INFO]\${NC} $*"; }
warn()  { echo -e "\${YELLOW}[WARN]\${NC} $*" >&2; }
error() { echo -e "\${RED}[ERROR]\${NC} $*" >&2; }
die()   { error "$*"; exit 1; }`,
                },
                {
                  order: 1, language: "bash", label: "Argument parsing with getopts",
                  content: `usage() {
  cat <<EOF
Usage: $(basename "$0") [-v] [-o output] <input>
  -v        verbose
  -o FILE   output file (default: output.txt)
  -h        show help
EOF
  exit 0
}

VERBOSE=false
OUTPUT="output.txt"

while getopts ":vo:h" opt; do
  case $opt in
    v) VERBOSE=true ;;
    o) OUTPUT="$OPTARG" ;;
    h) usage ;;
    :) die "Option -$OPTARG requires an argument" ;;
    ?) die "Unknown option: -$OPTARG" ;;
  esac
done
shift $((OPTIND - 1))   # remove parsed options

INPUT="\${1:-}"
[[ -z "$INPUT" ]] && die "Input file required"`,
                },
                {
                  order: 2, language: "bash", label: "Lock files & temp dirs",
                  content: `# Prevent concurrent runs
LOCKFILE="/tmp/$(basename "$0").lock"
exec 200>"$LOCKFILE"
flock -n 200 || die "Another instance is already running"
trap 'rm -f "$LOCKFILE"' EXIT

# Idempotent operation
MARKER="/var/run/setup-done"
if [[ ! -f "$MARKER" ]]; then
  # ... do setup ...
  touch "$MARKER"
fi

# Safe temp files / dirs
TMP=$(mktemp)
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMP" "$TMPDIR"' EXIT`,
                },
              ],
            },
          },
          // ── Advanced Features ─────────────────────────────────────────────
          {
            title: "Advanced Features",
            description: "Brace expansion, globs, subshells, command grouping, and parallel execution",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Brace expansion & globs",
                  content: `# Brace expansion
echo {a,b,c}.txt              # a.txt b.txt c.txt
echo file{1..5}.log           # file1.log ... file5.log
mkdir -p project/{src,tests,docs}
cp config.yaml{,.bak}         # backup: config.yaml.bak

# Glob patterns
ls *.txt                      # any .txt
ls file?.log                  # single char wildcard
ls [abc]*.sh                  # character class
ls **/*.ts                    # recursive (needs globstar)

# shopt — shell options
shopt -s globstar             # enable ** recursive glob
shopt -s nullglob             # no match → empty, not literal
shopt -s nocaseglob           # case-insensitive glob
shopt -s extglob              # extended patterns
ls !(*.log)                   # extglob: anything except .log`,
                },
                {
                  order: 1, language: "bash", label: "Subshells & grouping",
                  content: `# Subshell — changes don't affect parent
(cd /tmp && ls)               # pwd unchanged afterwards
(export VAR=x; echo $VAR)     # VAR not set in parent

# Command grouping (same shell)
{ echo "start"; do_work; echo "end"; } > output.txt

# Command substitution
result=$(command)             # preferred — nestable
files=$(find . -name "*.go" | wc -l)
echo "Found $((files)) Go files"`,
                },
                {
                  order: 2, language: "bash", label: "Parallel execution",
                  content: `# Background jobs + wait
for url in "\${urls[@]}"; do
  curl -sO "$url" &
done
wait    # wait for all background jobs

# Wait for specific PIDs
process1 & pid1=$!
process2 & pid2=$!
wait "$pid1" && wait "$pid2"

# xargs parallel
find . -name "*.jpg" | xargs -P4 -I{} convert {} -resize 800x {}

# Limit concurrency manually
MAX=4; running=0
for item in "\${items[@]}"; do
  process "$item" &
  ((++running))
  (( running >= MAX )) && { wait -n; ((--running)); }
done
wait`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Bash cheatsheet: ${bash.name} (${bash.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
