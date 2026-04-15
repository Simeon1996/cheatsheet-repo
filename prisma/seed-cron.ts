import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "Cron Expressions", userId: null },
  });

  const result = await prisma.category.create({
    data: {
      name: "Cron Expressions",
      icon: "⏰",
      color: "orange",
      description: "Cron syntax, field definitions, special strings, and common schedule patterns for Unix cron, systemd timers, and cloud schedulers.",
      isPublic: true,
      snippets: {
        create: [
          {
            title: "Cron Field Syntax",
            description: "The five (or six) positional fields that make up a cron expression.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Field positions",
                  content: `STANDARD CRON (5 fields)
  ┌─────────── minute        (0–59)
  │ ┌───────── hour          (0–23)
  │ │ ┌─────── day of month  (1–31)
  │ │ │ ┌───── month         (1–12 or JAN–DEC)
  │ │ │ │ ┌─── day of week   (0–7 or SUN–SAT; 0 and 7 = Sunday)
  │ │ │ │ │
  * * * * *

EXTENDED CRON (6 fields — used by Quartz, AWS, GCP, etc.)
  ┌──────────── second       (0–59)  ← prepended
  │ ┌────────── minute       (0–59)
  │ │ ┌──────── hour         (0–23)
  │ │ │ ┌────── day of month (1–31)
  │ │ │ │ ┌──── month        (1–12)
  │ │ │ │ │ ┌── day of week  (1–7; 1 = Sunday in Quartz)
  │ │ │ │ │ │
  * * * * * *`,
                },
              ],
            },
          },
          {
            title: "Special Characters",
            description: "Wildcards, ranges, steps, lists, and platform-specific modifiers.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Character reference",
                  content: `CHARACTER   MEANING                          EXAMPLE
──────────────────────────────────────────────────────────────
*           every value in the field           * (every minute)
,           list of values                     1,15,30
-           inclusive range                    9-17 (9 am to 5 pm)
/           step / interval                    */15 (every 15 units)
            can combine with range             1-59/2 (every odd minute)

PLATFORM-SPECIFIC (Quartz / AWS EventBridge)
L           last — last day of month or week   L  (last day of month)
                                               5L (last Friday)
W           nearest weekday to a date          15W (weekday nearest 15th)
LW          last weekday of the month          LW
#           nth weekday of month               2#3 (3rd Monday)
?           no specific value (DOM or DOW)     ? (use when other is set)

NOTES
  • Most Unix cron implementations do NOT support L, W, #, or ?
  • Use ? in Quartz/AWS when specifying both DOM and DOW would conflict
  • Steps wrap: */5 in the minute field fires at 0,5,10,15,20,25,...,55`,
                },
              ],
            },
          },
          {
            title: "Common Schedule Patterns",
            description: "Ready-to-use expressions for the most frequent scheduling needs.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Frequent patterns",
                  content: `EXPRESSION      DESCRIPTION
──────────────────────────────────────────────────────────────────
* * * * *       Every minute
*/5 * * * *     Every 5 minutes
*/15 * * * *    Every 15 minutes
*/30 * * * *    Every 30 minutes
0 * * * *       Every hour (on the hour)
0 */2 * * *     Every 2 hours
0 */6 * * *     Every 6 hours
0 0 * * *       Daily at midnight
0 6 * * *       Daily at 6:00 AM
0 12 * * *      Daily at noon
0 0,12 * * *    Twice a day (midnight and noon)
0 9-17 * * *    Every hour between 9 AM and 5 PM
0 9 * * 1-5     Weekdays at 9 AM
0 0 * * 1       Every Monday at midnight
0 0 1 * *       1st of every month at midnight
0 0 1 1 *       Every January 1st at midnight (yearly)
0 0 L * *       Last day of every month (Quartz/AWS)
0 0 * * 0       Every Sunday at midnight`,
                },
              ],
            },
          },
          {
            title: "Special Strings (@reboot, @daily …)",
            description: "Named shortcuts supported by Vixie cron and many modern implementations.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "@ shortcuts",
                  content: `STRING        EQUIVALENT        DESCRIPTION
──────────────────────────────────────────────────────────────
@reboot       (none)            Run once at system startup
@yearly       0 0 1 1 *         Once a year (Jan 1 midnight)
@annually     0 0 1 1 *         Alias for @yearly
@monthly      0 0 1 * *         First day of every month at midnight
@weekly       0 0 * * 0         Every Sunday at midnight
@daily        0 0 * * *         Once a day at midnight
@midnight     0 0 * * *         Alias for @daily
@hourly       0 * * * *         Start of every hour

USAGE (crontab)
  @daily /usr/local/bin/backup.sh
  @reboot /home/ubuntu/start-server.sh

NOTES
  • @reboot does NOT have a cron-field equivalent
  • Not all implementations support all @ strings (check your cron daemon)
  • systemd timers use OnCalendar= instead (see next snippet)`,
                },
              ],
            },
          },
          {
            title: "systemd OnCalendar Syntax",
            description: "systemd timer calendar expressions — an alternative to traditional cron.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "systemd calendar format",
                  content: `FORMAT
  DayOfWeek Year-Month-Day Hour:Minute:Second

  • Any field can be * (wildcard) or omitted
  • Comma lists and ranges (1..5) are supported
  • ~ means "last" (e.g., *-*~1 = last day of month)
  • /N is a repetition (e.g., *:0/15 = every 15 min)

EXAMPLES
  *-*-* *:*:*           Every second
  *:0/15                Every 15 minutes
  hourly                Every hour
  daily                 Daily at midnight
  weekly                Every Monday at midnight
  monthly               1st of month at midnight
  Mon *-*-* 09:00:00    Every Monday at 9 AM
  Mon..Fri 09:00:00     Weekdays at 9 AM
  *-*-1 00:00:00        1st of every month
  *-*~1 00:00:00        Last day of every month

USEFUL COMMANDS
  systemctl list-timers --all          # list all timers
  systemd-analyze calendar "Mon 09:00" # validate & next fire times
  journalctl -u myservice.timer        # timer logs`,
                },
              ],
            },
          },
          {
            title: "Cloud Scheduler Syntax",
            description: "Cron expression formats for AWS EventBridge, GCP Cloud Scheduler, and Azure Logic Apps.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "AWS EventBridge (6 fields)",
                  content: `AWS EVENTBRIDGE — 6 fields, uses cron() or rate()
  cron(minute hour day-of-month month day-of-week year)

  Fields:      0-59   0-23   1-31 | ?   1-12 | JAN-DEC   1-7 | SUN-SAT | ?   1970-2199
  Special:     , - * / L W #  (? required in DOM or DOW when the other is set)

  EXAMPLES
  cron(0 12 * * ? *)          Daily at 12:00 PM UTC
  cron(0 8 ? * MON-FRI *)     Weekdays at 8 AM UTC
  cron(0/5 * * * ? *)         Every 5 minutes
  cron(0 0 1 * ? *)           1st of every month at midnight
  cron(0 0 L * ? *)           Last day of every month

  RATE EXPRESSIONS (simpler for fixed intervals)
  rate(1 minute)
  rate(5 minutes)
  rate(1 hour)
  rate(7 days)`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "GCP Cloud Scheduler (unix cron)",
                  content: `GCP CLOUD SCHEDULER — standard unix cron (5 fields)
  Timezone can be set separately in the scheduler config.

  EXAMPLES
  0 9 * * 1        Every Monday at 9 AM
  */10 * * * *     Every 10 minutes
  0 0 1 * *        Monthly on the 1st
  0 6 * * 1-5      Weekdays at 6 AM`,
                },
                {
                  order: 2,
                  language: "text",
                  label: "Azure (NCRONTAB — 6 fields with seconds)",
                  content: `AZURE FUNCTIONS / LOGIC APPS — NCRONTAB (6 fields)
  {second} {minute} {hour} {day} {month} {day-of-week}

  EXAMPLES
  0 */5 * * * *    Every 5 minutes (second=0)
  0 0 9 * * 1-5   Weekdays at 9 AM
  0 0 0 1 * *     1st of every month at midnight
  0 30 8 * * 2    Every Tuesday at 8:30 AM`,
                },
              ],
            },
          },
          {
            title: "Crontab Commands",
            description: "Managing user and system crontabs from the command line.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "crontab management",
                  content: `# Edit current user's crontab
crontab -e

# List current user's crontab
crontab -l

# Remove current user's crontab
crontab -r

# Edit another user's crontab (root only)
crontab -u username -e

# Import crontab from file
crontab /path/to/mycron.txt

# System-wide cron files (no crontab command needed)
/etc/cron.d/          # drop-in cron files (must include username field)
/etc/cron.daily/      # scripts run daily by run-parts
/etc/cron.hourly/     # scripts run hourly
/etc/cron.weekly/     # scripts run weekly
/etc/cron.monthly/    # scripts run monthly

# System-wide crontab format (6 fields: adds username before command)
# min hour dom month dow user command
  0   2   *   *    *  root /usr/local/bin/backup.sh`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "cron logs & debugging",
                  content: `# View cron log (Debian/Ubuntu)
grep CRON /var/log/syslog

# View cron log (RHEL/CentOS)
cat /var/log/cron

# journald (systemd systems)
journalctl -u cron
journalctl -u crond

# Test a command exactly as cron would run it
# (cron has minimal PATH — always use absolute paths)
env -i HOME=/home/user PATH=/usr/bin:/bin /your/script.sh

# Redirect output in crontab entry
0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1

# Suppress all output (no email)
0 2 * * * /usr/local/bin/backup.sh > /dev/null 2>&1

# Send output to email (set MAILTO at top of crontab)
MAILTO=admin@example.com
0 2 * * * /usr/local/bin/backup.sh`,
                },
              ],
            },
          },
          {
            title: "Cron Expression Examples by Use Case",
            description: "Real-world scheduling patterns grouped by common DevOps and application needs.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "DevOps & maintenance",
                  content: `USE CASE                        EXPRESSION
──────────────────────────────────────────────────────────────────
DB backup at 2 AM daily         0 2 * * *
DB backup + weekly full         0 2 * * 0   (full on Sunday)
Log rotation at midnight        0 0 * * *
SSL cert renewal check          0 3 * * 1   (every Monday 3 AM)
Disk usage report weekly        0 8 * * 1   (Monday 8 AM)
Security scan monthly           0 1 1 * *
Dependency updates weekly       0 9 * * 2   (Tuesday 9 AM)
Cache warm-up before peak       30 8 * * 1-5  (weekdays 8:30 AM)
Health-check ping every minute  * * * * *
Clean temp files at 3 AM        0 3 * * *`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Business / reporting",
                  content: `USE CASE                        EXPRESSION
──────────────────────────────────────────────────────────────────
Daily report at 7 AM (weekdays) 0 7 * * 1-5
Weekly summary Monday 6 AM      0 6 * * 1
Monthly invoice 1st at 8 AM     0 8 1 * *
Quarterly on Jan/Apr/Jul/Oct    0 8 1 1,4,7,10 *
End-of-month rollup             0 23 L * *  (Quartz/AWS)
Peak-hour data refresh          */5 9-17 * * 1-5  (every 5 min, biz hours)
Off-hours batch job             0 0-6 * * *  (every hour midnight–6 AM)`,
                },
              ],
            },
          },
          {
            title: "Gotchas & Best Practices",
            description: "Common mistakes, edge cases, and tips for writing reliable cron jobs.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Common pitfalls",
                  content: `GOTCHA                          EXPLANATION & FIX
──────────────────────────────────────────────────────────────────────
Missing PATH                    Cron runs with minimal PATH (/usr/bin:/bin).
                                Always use absolute paths: /usr/bin/python3
                                Or set PATH= at top of crontab.

% is a newline in crontab       Literal % must be escaped as \\%
                                date +%Y-%m-%d → date +\\%Y-\\%m-\\%d

Timezone surprises              Cron uses the system timezone.
                                Set TZ=America/New_York in crontab, or
                                use the cloud scheduler's timezone field.

DOM + DOW are OR'd (not AND)    "0 0 1 * 1" fires on 1st of month OR every Monday.
                                Use only one; set the other to *.

Script not executable           chmod +x /path/to/script.sh

Environment not loaded          ~/.bashrc / ~/.profile not sourced by cron.
                                Source explicitly: source /home/user/.profile

Overlapping runs                Long job may still be running at next trigger.
                                Use flock to prevent overlap:
                                * * * * * flock -n /tmp/myjob.lock /path/to/job.sh

Missing trailing newline        Some cron daemons ignore last line without newline.
                                Always end crontab with a blank line.

Daylight saving time gaps       Jobs at skipped/duplicated hours may run 0 or 2×.
                                Schedule critical jobs outside DST transition hours.`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "Validation tools",
                  content: `# Online validators (paste expression to check next fire times)
# crontab.guru — most popular cron expression explainer

# CLI: systemd-analyze (even without systemd timers)
systemd-analyze calendar "0 9 * * 1-5"
# Output shows Next elapse times

# Python: croniter library
pip install croniter
python3 -c "
from croniter import croniter
from datetime import datetime
cron = croniter('0 9 * * 1-5', datetime.now())
for _ in range(5):
    print(cron.get_next(datetime))
"

# Node.js: cron-parser
npx cron-parser '0 9 * * 1-5'

# Dry-run with crond (Vixie cron)
# Add MAILTO="" to suppress email during testing
# Check /var/log/syslog or journalctl after a test fire`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Cron Expressions cheatsheet: ${result.name} (${result.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
