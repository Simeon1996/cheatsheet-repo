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
    where: { name: "Linux", userId: admin.id },
  });

  const linux = await prisma.category.create({
    data: {
      name: "Linux",
      icon: "🐧",
      color: "orange",
      description: "Essential Linux commands for file management, permissions, processes, networking, disk usage, users, and system administration",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── File & Directory Operations ───────────────────────────────────
          {
            title: "File & Directory Operations",
            description: "Navigation, listing, creating, copying, moving, and finding files",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Navigate & list",
                  content: `# Navigate
cd /path/to/dir        # change directory
cd ~                   # go home
cd -                   # go to previous directory
pwd                    # print working directory

# List
ls -la                 # long format, including hidden
ls -lh                 # human-readable sizes
ls -lt                 # sort by modification time
ls -R                  # recursive listing`,
                },
                {
                  order: 1, language: "bash", label: "Create / copy / move / delete",
                  content: `mkdir -p a/b/c             # create nested dirs
touch file.txt            # create empty file / update timestamp
cp -r src/ dest/          # copy directory recursively
mv old.txt new.txt        # move / rename
rm -rf dir/               # remove directory and contents (careful!)
ln -s /path/to/orig link  # create symlink`,
                },
                {
                  order: 2, language: "bash", label: "Find files",
                  content: `find . -name "*.log" -mtime -7          # modified in last 7 days
find . -type f -size +100M              # files larger than 100 MB
find . -name "*.sh" -exec chmod +x {} \\; # exec on each match
locate filename                         # fast index-based search (needs updatedb)
which python3                           # location of a binary
type bash                               # type info (alias/builtin/file)`,
                },
              ],
            },
          },
          // ── File Content & Text Processing ────────────────────────────────
          {
            title: "File Content & Text Processing",
            description: "cat, less, head, tail, grep, awk, sed, sort, cut and other text tools",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "View content",
                  content: `cat file.txt                  # print entire file
less file.txt                 # paginated view (q to quit)
head -n 20 file.txt           # first 20 lines
tail -n 50 file.txt           # last 50 lines
tail -f /var/log/syslog       # follow live output`,
                },
                {
                  order: 1, language: "bash", label: "Search with grep",
                  content: `grep -r "pattern" /path/       # recursive search
grep -i "error" app.log       # case-insensitive
grep -n "TODO" *.ts           # show line numbers
grep -v "debug" app.log       # invert match (exclude)
grep -E "err|warn" app.log    # extended regex (OR)
grep -l "pattern" *.txt       # only filenames`,
                },
                {
                  order: 2, language: "bash", label: "Transform & process",
                  content: `sort file.txt                  # sort lines
sort -u file.txt               # sort and deduplicate
uniq -c sorted.txt             # count consecutive dupes
cut -d',' -f1,3 data.csv       # extract columns 1 and 3
awk '{print $1, $3}' file.txt  # print fields 1 and 3
awk -F':' '{print $1}' /etc/passwd  # custom delimiter
sed 's/foo/bar/g' file.txt     # replace all occurrences
sed -i 's/old/new/g' file.txt  # in-place edit
wc -l file.txt                 # count lines
diff a.txt b.txt               # show differences`,
                },
              ],
            },
          },
          // ── Permissions & Ownership ───────────────────────────────────────
          {
            title: "Permissions & Ownership",
            description: "chmod, chown, setuid/setgid/sticky bits, ACLs, and umask",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "chmod — change mode",
                  content: `# Permission notation: rwxrwxrwx (owner/group/other)
# r=4, w=2, x=1

chmod 755 script.sh        # rwxr-xr-x
chmod 644 file.txt         # rw-r--r--
chmod +x script.sh         # add execute bit for all
chmod -R 750 /app/         # recursive

# Special bits
chmod u+s binary           # setuid — run as file owner
chmod g+s /shared/         # setgid — new files inherit group
chmod +t /tmp/             # sticky bit — only owner can delete`,
                },
                {
                  order: 1, language: "bash", label: "chown & ACLs",
                  content: `# chown — change owner
chown user:group file.txt
chown -R www-data:www-data /var/www/

# View permissions
ls -la
stat file.txt              # detailed metadata

# ACLs (extended permissions)
getfacl file.txt
setfacl -m u:alice:rw file.txt
setfacl -x u:alice file.txt    # remove ACL entry

# umask — default permission mask
umask                          # show current mask (e.g. 022)
umask 027                      # new files: 640, dirs: 750`,
                },
              ],
            },
          },
          // ── Process Management ────────────────────────────────────────────
          {
            title: "Process Management",
            description: "ps, kill, background jobs, nice/renice, lsof, and strace",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "View & kill processes",
                  content: `ps aux                     # all processes, detailed
ps aux | grep nginx
top                        # live process viewer
htop                       # interactive (install separately)
pgrep nginx                # find PID by name
pidof nginx

# Signals
kill PID                   # SIGTERM (graceful)
kill -9 PID                # SIGKILL (force)
killall nginx              # kill by name
pkill -f "python app.py"   # kill by command pattern`,
                },
                {
                  order: 1, language: "bash", label: "Background jobs & priority",
                  content: `command &                  # run in background
jobs                       # list background jobs
fg %1                      # bring job 1 to foreground
bg %1                      # resume job 1 in background
nohup command &            # immune to hangup
disown %1                  # detach job from shell

# nice / renice — priority (-20 high → 19 low)
nice -n 10 command         # start with lower priority
renice -n 5 -p PID         # adjust running process

# Monitoring
lsof -i :8080              # processes using port 8080
lsof -p PID                # files opened by PID
strace -p PID              # trace system calls
watch -n 2 'ps aux | grep app'  # repeat every 2s`,
                },
              ],
            },
          },
          // ── Disk & Storage ────────────────────────────────────────────────
          {
            title: "Disk & Storage",
            description: "df, du, lsblk, mount/umount, fdisk, LVM, and filesystem tools",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Disk usage",
                  content: `df -h                      # filesystem usage (human-readable)
df -h /                    # specific filesystem
du -sh /var/log/           # total size of directory
du -sh * | sort -h         # sizes of all items, sorted
du -ah --max-depth=1 /     # one level deep`,
                },
                {
                  order: 1, language: "bash", label: "Block devices & mounts",
                  content: `lsblk                      # list block devices (tree)
blkid                      # show UUIDs and FSTypes
fdisk -l                   # partition table (requires root)
mount                      # list mounted filesystems
mount /dev/sdb1 /mnt/data  # mount device
umount /mnt/data           # unmount

# Persistent mounts — /etc/fstab
# UUID=xxxx  /mnt/data  ext4  defaults  0  2

# Filesystem tools
mkfs.ext4 /dev/sdb1        # format as ext4
fsck /dev/sdb1             # check and repair (unmounted)
resize2fs /dev/vg0/lv_data # grow filesystem after LV extend`,
                },
                {
                  order: 2, language: "bash", label: "LVM",
                  content: `pvs / vgs / lvs                        # show PVs, VGs, LVs
lvcreate -L 10G -n lv_data vg0        # create logical volume
lvextend -L +5G /dev/vg0/lv_data      # extend LV
resize2fs /dev/vg0/lv_data            # grow ext4 filesystem
lvremove /dev/vg0/lv_data             # remove LV`,
                },
              ],
            },
          },
          // ── Networking ────────────────────────────────────────────────────
          {
            title: "Networking",
            description: "ip, ping, dig, ss/netstat, curl, scp, rsync, and ufw",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Interfaces, routing & DNS",
                  content: `ip addr show               # all interfaces and IPs
ip addr show eth0          # specific interface
ip link set eth0 up/down   # enable/disable interface
ip route show              # routing table
ip route add default via 192.168.1.1

ping -c 4 8.8.8.8          # ICMP ping
traceroute 8.8.8.8         # path tracing
dig example.com            # DNS lookup
dig example.com +short     # just the IP
nslookup example.com`,
                },
                {
                  order: 1, language: "bash", label: "Open ports & connections",
                  content: `ss -tlnp                   # TCP listening ports with PID
ss -an | grep :80          # connections on port 80
netstat -tlnp              # older alternative to ss
lsof -i :443               # processes on port 443`,
                },
                {
                  order: 2, language: "bash", label: "Transfer & sync",
                  content: `curl -O https://example.com/file.tar.gz        # download
curl -I https://example.com                   # headers only
curl -d '{"key":"val"}' -H 'Content-Type: application/json' https://api.example.com
wget https://example.com/file.zip
scp user@host:/path/file .                    # secure copy from remote
rsync -avz --progress src/ user@host:/dest/   # sync files`,
                },
                {
                  order: 3, language: "bash", label: "Firewall (ufw)",
                  content: `ufw status
ufw allow 22/tcp
ufw allow from 10.0.0.0/8 to any port 5432
ufw deny 3306
ufw delete allow 3306
ufw enable
ufw disable`,
                },
              ],
            },
          },
          // ── Users & Groups ────────────────────────────────────────────────
          {
            title: "Users & Groups",
            description: "whoami, id, useradd/usermod/userdel, groups, sudo, and su",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Current user & context",
                  content: `whoami                     # current username
id                         # uid, gid, groups
groups                     # groups current user belongs to
who                        # logged-in users
w                          # logged-in users + activity
last                       # login history`,
                },
                {
                  order: 1, language: "bash", label: "User management",
                  content: `useradd -m -s /bin/bash alice         # create with home dir
useradd -m -G sudo,docker alice      # add to groups at creation
usermod -aG docker alice             # add to group
usermod -s /bin/zsh alice            # change shell
userdel -r alice                     # delete user and home dir
passwd alice                         # set/change password
chage -l alice                       # password expiry info
chage -E 2026-12-31 alice            # set account expiry`,
                },
                {
                  order: 2, language: "bash", label: "Groups & sudo",
                  content: `groupadd devs
groupdel devs
gpasswd -a alice devs                # add user to group
gpasswd -d alice devs                # remove user from group

sudo command                         # run as root
sudo -u postgres psql                # run as specific user
sudo -i                              # interactive root shell
visudo                               # safely edit /etc/sudoers

su - alice                           # switch to alice (login shell)
su -                                 # switch to root`,
                },
              ],
            },
          },
          // ── System Info & Logs ────────────────────────────────────────────
          {
            title: "System Info & Logs",
            description: "uname, lscpu, free, systemctl, journalctl, and system logs",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "OS & hardware info",
                  content: `uname -a                   # kernel version and arch
hostnamectl                # hostname, OS, kernel info
cat /etc/os-release        # distro information
lscpu                      # CPU details
free -h                    # memory usage
lspci                      # PCI devices
lsusb                      # USB devices
uptime                     # uptime and load averages
last reboot                # reboot history`,
                },
                {
                  order: 1, language: "bash", label: "Systemd services",
                  content: `systemctl status nginx
systemctl start / stop / restart / reload nginx
systemctl enable / disable nginx         # start at boot
systemctl list-units --type=service --state=running
journalctl -u nginx -f                   # follow service logs
journalctl -u nginx --since "1 hour ago"
journalctl -xe                           # recent errors`,
                },
                {
                  order: 2, language: "bash", label: "Logs & time",
                  content: `tail -f /var/log/syslog
tail -f /var/log/auth.log          # auth/sudo events
grep -i error /var/log/messages

timedatectl                        # current time/timezone
timedatectl set-timezone America/New_York
date                               # current date/time
hwclock                            # hardware clock`,
                },
              ],
            },
          },
          // ── Shell Productivity & Scripting ────────────────────────────────
          {
            title: "Shell Productivity & Scripting",
            description: "History tricks, redirection, pipes, variables, loops, and useful aliases",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "History & shortcuts",
                  content: `history | grep ssh         # search command history
!!                         # repeat last command
!ssh                       # repeat last ssh command
Ctrl+R                     # reverse history search
Ctrl+C                     # kill foreground job
Ctrl+Z                     # suspend foreground job
Ctrl+D                     # send EOF / exit shell`,
                },
                {
                  order: 1, language: "bash", label: "Redirection & pipes",
                  content: `command > file.txt         # stdout to file (overwrite)
command >> file.txt        # stdout to file (append)
command 2> err.txt         # stderr to file
command &> all.txt         # stdout+stderr to file
command 2>&1 | tee out.txt # both to pipe and file
command1 | command2        # pipe stdout to next command`,
                },
                {
                  order: 2, language: "bash", label: "Variables, conditionals & loops",
                  content: `export VAR="value"
echo "Hello, $VAR"
VAR=$(command)             # capture command output

# Conditionals
if [ -f /etc/hosts ]; then echo "exists"; fi
[ -d /tmp ] && echo "dir exists"
[ -z "$VAR" ] && echo "empty"

# Loops
for f in *.log; do gzip "$f"; done
while read line; do echo "$line"; done < file.txt

# Useful aliases & tricks
alias ll='ls -lahF'
xargs -P4 -I{} command {}            # parallel execution
seq 1 10 | xargs -I{} echo "item {}"
env                                  # all environment variables
export PATH="$PATH:/usr/local/bin"`,
                },
              ],
            },
          },
          // ── Archives & Package Management ─────────────────────────────────
          {
            title: "Archives & Package Management",
            description: "tar, zip, apt, dnf/yum, dpkg/rpm, snap and flatpak",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "tar & zip",
                  content: `# tar
tar -czf archive.tar.gz dir/          # create gzip archive
tar -cjf archive.tar.bz2 dir/         # create bzip2 archive
tar -xzf archive.tar.gz               # extract gzip
tar -xzf archive.tar.gz -C /dest/     # extract to directory
tar -tzf archive.tar.gz               # list contents
tar -czf - dir/ | ssh user@host 'tar -xzf - -C /dest/'

# zip / unzip
zip -r archive.zip dir/
zip -r -e secure.zip dir/             # with password
unzip archive.zip
unzip -l archive.zip                  # list contents
unzip archive.zip -d /dest/`,
                },
                {
                  order: 1, language: "bash", label: "apt (Debian/Ubuntu)",
                  content: `apt update                   # refresh package index
apt upgrade                  # upgrade all packages
apt install nginx
apt remove nginx
apt autoremove               # remove unused dependencies
apt search keyword
apt show nginx
dpkg -l | grep nginx         # list installed matching`,
                },
                {
                  order: 2, language: "bash", label: "dnf/yum (RHEL/CentOS/Fedora)",
                  content: `dnf update
dnf install nginx
dnf remove nginx
dnf search keyword
rpm -qa | grep nginx         # list installed RPMs
rpm -qi nginx                # package info
rpm -ql nginx                # list package files

# Snap / Flatpak
snap install code --classic
flatpak install flathub com.spotify.Client`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Linux cheatsheet: ${linux.name} (${linux.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
