import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "SaltStack", userId: null } });

  const salt = await prisma.category.create({
    data: {
      name: "SaltStack",
      icon: "🧂",
      color: "blue",
      description: "SaltStack: salt CLI, states, pillars, grains, execution modules, orchestration, reactors, and Salt SSH",
      isPublic: true,
      snippets: {
        create: [
          // ── salt CLI ──────────────────────────────────────────────────────
          {
            title: "salt CLI",
            description: "Core salt, salt-call, and salt-run commands",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Targeting & remote exec",
                  content: `# Run a command on all minions
salt '*' cmd.run 'uptime'

# Target by glob
salt 'web*' test.ping

# Target by grain
salt -G 'os:Ubuntu' pkg.install nginx

# Target by pillar
salt -I 'role:webserver' state.apply

# Target by compound (grain AND glob)
salt -C 'G@os:Ubuntu and web*' test.ping

# Target by node group (defined in master config)
salt -N webservers test.ping

# Target a list of minions
salt -L 'web1,web2,db1' test.ping

# Target by regex
salt -E 'web[0-9]+' test.ping`,
                },
                {
                  order: 1, language: "bash", label: "salt-call (local)",
                  content: `# Run a module locally on a minion (no master needed)
salt-call test.ping

# Apply a state locally
salt-call state.apply mystate

# Apply with pillar override
salt-call state.apply mystate pillar='{"key":"value"}'

# Show grains locally
salt-call grains.items

# Run in local mode (no master connection)
salt-call --local cmd.run 'hostname'

# Debug output
salt-call -l debug state.apply`,
                },
                {
                  order: 2, language: "bash", label: "salt-run (runners)",
                  content: `# List all connected minions
salt-run manage.up

# Show minions that haven't checked in
salt-run manage.down

# Run an orchestration state
salt-run state.orchestrate orch.deploy

# Show job cache
salt-run jobs.list_jobs

# Look up a specific job
salt-run jobs.lookup_jid 20240101120000000001

# Manage keys
salt-run manage.versions   # compare versions across minions`,
                },
              ],
            },
          },

          // ── Key Management ────────────────────────────────────────────────
          {
            title: "Key Management",
            description: "Managing minion keys with salt-key",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "salt-key",
                  content: `# List all keys (accepted, unaccepted, rejected)
salt-key -L

# Accept a pending key
salt-key -a web1

# Accept all pending keys
salt-key -A

# Reject a key
salt-key -r web1

# Delete an accepted key (decommission)
salt-key -d web1

# Delete all rejected keys
salt-key -D

# Auto-accept keys matching a pattern (master config)
# auto_accept: True                   # accept all (dev only)
# autosign_file: /etc/salt/autosign   # one hostname per line`,
                },
              ],
            },
          },

          // ── States ────────────────────────────────────────────────────────
          {
            title: "States",
            description: "Writing and applying Salt state files (SLS)",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "State basics",
                  content: `# /srv/salt/webserver.sls

# Install nginx
install_nginx:
  pkg.installed:
    - name: nginx
    - version: latest

# Manage config file
nginx_config:
  file.managed:
    - name: /etc/nginx/nginx.conf
    - source: salt://nginx/files/nginx.conf
    - user: root
    - group: root
    - mode: '0644'
    - require:
      - pkg: install_nginx

# Ensure service is running
nginx_service:
  service.running:
    - name: nginx
    - enable: True
    - watch:
      - file: nginx_config`,
                },
                {
                  order: 1, language: "bash", label: "Applying states",
                  content: `# Apply a single state to all minions
salt '*' state.apply webserver

# Apply with pillar data override
salt 'web1' state.apply webserver pillar='{"port":8080}'

# Apply the top.sls (highstate)
salt '*' state.highstate

# Dry-run (test mode)
salt '*' state.apply webserver test=True

# Apply multiple states
salt '*' state.apply webserver,firewall

# Apply a state from a specific environment
salt '*' state.apply webserver saltenv=production

# Show state output verbosely
salt '*' state.apply webserver -l debug`,
                },
                {
                  order: 2, language: "yaml", label: "Requisites & ordering",
                  content: `# require — run after another state
install_app:
  pkg.installed:
    - name: myapp

configure_app:
  file.managed:
    - name: /etc/myapp/config.yml
    - source: salt://myapp/config.yml
    - require:
      - pkg: install_app       # wait for pkg

# watch — run after AND re-run if watched state changes
app_service:
  service.running:
    - name: myapp
    - enable: True
    - watch:
      - file: configure_app    # restart when config changes

# onchanges — only run if the named state made a change
reload_units:
  cmd.run:
    - name: systemctl daemon-reload
    - onchanges:
      - file: configure_app

# unless / onlyif — conditional execution
create_db:
  cmd.run:
    - name: createdb myapp
    - unless: psql -lqt | cut -d \\| -f 1 | grep -qw myapp`,
                },
                {
                  order: 3, language: "yaml", label: "Jinja templating in states",
                  content: `# /srv/salt/users.sls — use pillar & grains in Jinja
{% set users = salt['pillar.get']('users', []) %}

{% for user in users %}
create_user_{{ user.name }}:
  user.present:
    - name: {{ user.name }}
    - uid: {{ user.uid }}
    - groups: {{ user.groups | tojson }}
    - shell: /bin/bash
{% endfor %}

# Conditional on grain
{% if grains['os_family'] == 'Debian' %}
install_apt_transport:
  pkg.installed:
    - name: apt-transport-https
{% endif %}

# Include another state conditionally
{% if pillar.get('enable_monitoring', False) %}
include:
  - monitoring
{% endif %}`,
                },
              ],
            },
          },

          // ── top.sls ───────────────────────────────────────────────────────
          {
            title: "top.sls",
            description: "Mapping minions to states via the top file",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "top.sls structure",
                  content: `# /srv/salt/top.sls

base:                          # environment
  '*':                         # all minions
    - common                   # apply common.sls

  'web*':                      # glob
    - webserver
    - firewall

  'G@role:database':           # grain match
    - database
    - backup

  'I@env:production':          # pillar match
    - monitoring
    - alerting

  'E@web[0-9]+\\.prod':        # regex match
    - nginx
    - ssl`,
                },
                {
                  order: 1, language: "yaml", label: "Multi-environment top",
                  content: `# /srv/salt/top.sls with multiple environments
base:
  '*':
    - common

production:
  'G@env:prod':
    - webserver
    - hardening

staging:
  'G@env:staging':
    - webserver

# master config to enable multiple envs:
# file_roots:
#   base:
#     - /srv/salt
#   production:
#     - /srv/salt/production
#   staging:
#     - /srv/salt/staging`,
                },
              ],
            },
          },

          // ── Pillar ────────────────────────────────────────────────────────
          {
            title: "Pillar",
            description: "Secure per-minion data with pillars",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Pillar structure",
                  content: `# /srv/pillar/top.sls
base:
  '*':
    - common
  'web*':
    - webserver
  'db*':
    - database

# /srv/pillar/webserver.sls
nginx:
  port: 80
  worker_processes: 4
  sites:
    - name: myapp
      server_name: myapp.example.com
      root: /var/www/myapp

users:
  - name: deploy
    uid: 2000
    groups: [www-data, sudo]

# /srv/pillar/database.sls — encrypted with GPG
#!yaml|gpg
db_password: |
  -----BEGIN PGP MESSAGE-----
  hQEMA...
  -----END PGP MESSAGE-----`,
                },
                {
                  order: 1, language: "bash", label: "Pillar commands",
                  content: `# Show all pillar data for a minion
salt 'web1' pillar.items

# Get a specific pillar key
salt 'web1' pillar.get nginx:port

# Get with default fallback
salt 'web1' pillar.get nginx:port:80

# Refresh pillar data (push from master)
salt '*' saltutil.refresh_pillar

# Check pillar rendering errors
salt 'web1' pillar.items 2>&1 | grep -i error

# Pass ad-hoc pillar data
salt 'web1' state.apply mystate pillar='{"debug":true}'`,
                },
              ],
            },
          },

          // ── Grains ────────────────────────────────────────────────────────
          {
            title: "Grains",
            description: "System facts and custom grains",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Grains commands",
                  content: `# List all grains for a minion
salt 'web1' grains.items

# Get a specific grain
salt 'web1' grains.get os
salt 'web1' grains.get fqdn

# Get nested grain
salt 'web1' grains.get ip_interfaces:eth0

# List all unique values of a grain across minions
salt '*' grains.get role

# Set a custom grain
salt 'web1' grains.setval role webserver
salt 'web1' grains.setval env production

# Delete a grain
salt 'web1' grains.delval role

# Sync custom grain modules
salt '*' saltutil.sync_grains`,
                },
                {
                  order: 1, language: "yaml", label: "Custom grains",
                  content: `# /etc/salt/grains — static grains file on the minion
role: webserver
env: production
datacenter: us-east-1
team: platform

# /srv/salt/_grains/custom.py — dynamic grain module
def custom_grains():
    grains = {}
    try:
        with open('/etc/app/version') as f:
            grains['app_version'] = f.read().strip()
    except FileNotFoundError:
        grains['app_version'] = 'unknown'
    return grains

# Sync and use
# salt '*' saltutil.sync_grains
# salt -G 'app_version:2.1.0' test.ping`,
                },
              ],
            },
          },

          // ── Execution Modules ─────────────────────────────────────────────
          {
            title: "Execution Modules",
            description: "Common built-in execution modules",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "pkg & service",
                  content: `# Install a package
salt '*' pkg.install nginx

# Install specific version
salt '*' pkg.install nginx version=1.24.0

# Remove a package
salt '*' pkg.remove nginx

# List installed packages
salt 'web1' pkg.list_pkgs

# Upgrade all packages
salt '*' pkg.upgrade

# Check if a service is running
salt '*' service.status nginx

# Start / stop / restart
salt '*' service.start nginx
salt '*' service.stop nginx
salt '*' service.restart nginx

# Enable at boot
salt '*' service.enable nginx`,
                },
                {
                  order: 1, language: "bash", label: "file, cmd & user",
                  content: `# Read a file
salt 'web1' file.read /etc/hostname

# Check file stats
salt 'web1' file.stats /etc/nginx/nginx.conf

# Write content to a file
salt 'web1' file.write /tmp/test.txt 'hello world'

# Run a shell command
salt '*' cmd.run 'df -h'
salt '*' cmd.run 'journalctl -u nginx --no-pager -n 50'

# Run as a different user
salt 'web1' cmd.run 'whoami' runas=deploy

# Check if a user exists
salt 'web1' user.info deploy

# Create a user
salt 'web1' user.add deploy uid=2000 gid=2000 shell=/bin/bash`,
                },
                {
                  order: 2, language: "bash", label: "network & system",
                  content: `# Show network interfaces
salt '*' network.interfaces

# Get IP addresses
salt '*' network.ip_addrs

# Ping a host from a minion
salt 'web1' network.ping db1.internal

# Get system info
salt '*' system.get_system_time
salt 'web1' status.loadavg
salt 'web1' status.meminfo
salt 'web1' status.diskusage /

# Reboot a minion
salt 'web1' system.reboot

# Sync all custom modules/states/grains
salt '*' saltutil.sync_all`,
                },
              ],
            },
          },

          // ── Orchestration ─────────────────────────────────────────────────
          {
            title: "Orchestration",
            description: "Coordinating multi-minion deployments with orchestration states",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Orchestration state",
                  content: `# /srv/salt/orch/deploy.sls — run with: salt-run state.orchestrate orch.deploy

# Step 1: Apply database migrations first
run_db_migrations:
  salt.state:
    - tgt: 'db*'
    - sls: database.migrate
    - failhard: True          # stop if this fails

# Step 2: Deploy app servers (after DB)
deploy_app_servers:
  salt.state:
    - tgt: 'app*'
    - sls: app.deploy
    - require:
      - salt: run_db_migrations

# Step 3: Reload load balancer last
reload_lb:
  salt.state:
    - tgt: 'lb*'
    - sls: haproxy.reload
    - require:
      - salt: deploy_app_servers

# Run a function instead of a state
check_health:
  salt.function:
    - name: http.query
    - tgt: 'lb1'
    - kwarg:
        url: http://localhost/health
    - require:
      - salt: reload_lb`,
                },
                {
                  order: 1, language: "bash", label: "Running orchestration",
                  content: `# Run an orchestration state
salt-run state.orchestrate orch.deploy

# With pillar override
salt-run state.orchestrate orch.deploy pillar='{"version":"2.1.0"}'

# Dry run
salt-run state.orchestrate orch.deploy test=True

# Target a specific environment
salt-run state.orchestrate orch.deploy saltenv=production

# Show verbose output
salt-run -l debug state.orchestrate orch.deploy`,
                },
              ],
            },
          },

          // ── Reactors & Beacons ────────────────────────────────────────────
          {
            title: "Reactors & Beacons",
            description: "Event-driven automation with reactors and beacons",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Reactor config",
                  content: `# /etc/salt/master.d/reactor.conf — map events to reactor SLS
reactor:
  - 'salt/minion/*/start':           # minion comes online
    - /srv/salt/reactor/minion_start.sls
  - 'salt/auth':                     # new key authentication
    - /srv/salt/reactor/auth.sls
  - 'myapp/deploy/request':          # custom event
    - /srv/salt/reactor/deploy.sls

# /srv/salt/reactor/minion_start.sls
highstate_on_start:
  local.state.highstate:
    - tgt: {{ data['id'] }}
    - expr_form: glob

# Fire a custom event from a minion
# salt-call event.fire_master '{"version":"2.1"}' 'myapp/deploy/request'`,
                },
                {
                  order: 1, language: "yaml", label: "Beacons",
                  content: `# /etc/salt/minion.d/beacons.conf — watch system events on minion
beacons:
  inotify:                           # watch file changes
    - files:
        /etc/passwd:
          mask:
            - modify
    - disable_during_state_run: True

  load:                              # alert on high load
    - averages:
        1m:
          - 0.0
          - 2.0
        5m:
          - 0.0
          - 1.5
    - interval: 10

  service:                           # monitor service state
    - services:
        nginx:
          onchangeonly: True

# Beacons fire events to the master event bus
# Combine with reactors to auto-restart services, alert, etc.`,
                },
              ],
            },
          },

          // ── Salt SSH ──────────────────────────────────────────────────────
          {
            title: "Salt SSH",
            description: "Agentless execution over SSH with salt-ssh",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Roster file",
                  content: `# /etc/salt/roster — define SSH targets
web1:
  host: 192.168.1.10
  user: ubuntu
  sudo: True
  priv: /home/ubuntu/.ssh/id_rsa

web2:
  host: web2.example.com
  user: root
  port: 2222

# Group of servers
db-cluster:
  host: 10.0.1.20
  user: admin
  sudo: True
  tty: True                    # needed for sudo on some systems`,
                },
                {
                  order: 1, language: "bash", label: "salt-ssh commands",
                  content: `# Test connectivity
salt-ssh '*' test.ping

# Run a command
salt-ssh 'web1' cmd.run 'uptime'

# Apply a state (thin Salt is bootstrapped automatically)
salt-ssh 'web1' state.apply webserver

# Apply highstate
salt-ssh '*' state.highstate

# Copy a file
salt-ssh 'web1' cp.get_file salt://files/app.conf /etc/app/app.conf

# Skip host key checking (dev only)
salt-ssh --ignore-host-keys '*' test.ping

# Use a specific roster file
salt-ssh -r /path/to/roster 'web1' test.ping`,
                },
              ],
            },
          },

          // ── Mine ──────────────────────────────────────────────────────────
          {
            title: "Mine",
            description: "Sharing data between minions via the Salt Mine",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Mine configuration",
                  content: `# /etc/salt/minion.d/mine.conf — functions to expose
mine_functions:
  network.ip_addrs:             # expose IP addresses
    interface: eth0
  grains.item:                  # expose grains
    - fqdn
    - role
  test.ping: []                 # expose ping result

# /srv/pillar/mine.sls — configure via pillar
mine_functions:
  network.ip_addrs:
    interface: eth0

# Refresh mine data
# salt '*' mine.update`,
                },
                {
                  order: 1, language: "bash", label: "Mine usage",
                  content: `# Get mine data from all minions
salt 'web1' mine.get '*' network.ip_addrs

# Get mine data matching a target
salt 'web1' mine.get 'db*' network.ip_addrs

# Use mine data in a state (Jinja)
# {% set db_ips = salt['mine.get']('db*', 'network.ip_addrs') %}
# {% for host, ips in db_ips.items() %}
# # {{ host }}: {{ ips[0] }}
# {% endfor %}

# Update mine manually
salt '*' mine.update

# Delete mine data for a minion
salt 'web1' mine.delete

# Flush all mine data
salt 'web1' mine.flush`,
                },
              ],
            },
          },

          // ── Modules & Extensions ──────────────────────────────────────────
          {
            title: "Custom Modules & Formulas",
            description: "Writing custom execution modules, state modules, and using Salt Formulas",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Custom execution module",
                  content: `# /srv/salt/_modules/myapp.py
"""
Custom execution module for myapp management.
"""
import subprocess

__virtualname__ = 'myapp'


def __virtual__():
    """Only load on Linux."""
    if __grains__['kernel'] != 'Linux':
        return False, 'myapp module requires Linux'
    return __virtualname__


def version():
    """Return the installed myapp version."""
    result = subprocess.run(
        ['/usr/local/bin/myapp', '--version'],
        capture_output=True, text=True
    )
    return result.stdout.strip()


def reload_config():
    """Send SIGHUP to myapp to reload config."""
    return __salt__['cmd.run']('pkill -HUP myapp')


# Sync to minions and use:
# salt '*' saltutil.sync_modules
# salt 'web1' myapp.version`,
                },
                {
                  order: 1, language: "bash", label: "Salt Formulas",
                  content: `# Salt Formulas are pre-built state collections (like Puppet modules)
# Available at: https://github.com/saltstack-formulas

# /etc/salt/master.d/gitfs.conf — load formulas via gitfs
fileserver_backend:
  - gitfs
  - roots

gitfs_remotes:
  - https://github.com/saltstack-formulas/nginx-formula.git:
    - mountpoint: salt://
  - https://github.com/saltstack-formulas/postgres-formula.git:
    - mountpoint: salt://

# Use in top.sls
# base:
#   'web*':
#     - nginx

# Configure formula via pillar
# /srv/pillar/nginx.sls:
# nginx:
#   service:
#     enable: True
#   server:
#     config:
#       worker_processes: auto`,
                },
              ],
            },
          },

          // ── Useful Patterns ───────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "Common SaltStack patterns: map files, include/extend, slots, and event bus",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "map.jinja pattern",
                  content: `# /srv/salt/nginx/map.jinja — OS-specific defaults
{% set default_map = {
  'Debian': {
    'pkg': 'nginx',
    'service': 'nginx',
    'conf_dir': '/etc/nginx',
    'log_dir': '/var/log/nginx',
  },
  'RedHat': {
    'pkg': 'nginx',
    'service': 'nginx',
    'conf_dir': '/etc/nginx',
    'log_dir': '/var/log/nginx',
  },
} %}

{% set os_map = default_map.get(grains['os_family'], default_map['Debian']) %}
{% set nginx = salt['pillar.get']('nginx', {}) %}
{% set nginx = salt['defaults.merge'](os_map, nginx) %}

# /srv/salt/nginx/init.sls — use the map
{% from 'nginx/map.jinja' import nginx with context %}

install_nginx:
  pkg.installed:
    - name: {{ nginx.pkg }}

nginx_service:
  service.running:
    - name: {{ nginx.service }}`,
                },
                {
                  order: 1, language: "yaml", label: "include & extend",
                  content: `# include — add states from another SLS
include:
  - nginx
  - firewall

# extend — override attributes of included states
extend:
  nginx_service:              # override state ID from included nginx SLS
    service.running:
      - watch:
        - file: my_custom_config    # add extra watch

# /srv/salt/app.sls — extend example
include:
  - webserver

extend:
  nginx_config:
    file.managed:
      - source: salt://app/files/nginx.conf   # override source`,
                },
                {
                  order: 2, language: "bash", label: "Event bus & jobs",
                  content: `# Watch the Salt event bus in real time
salt-run state.event pretty=True

# Fire a custom event from master
salt-run event.fire '{"msg":"deploy started"}' 'myapp/deploy/start'

# Fire from a minion
salt-call event.fire_master '{"status":"ok"}' 'myapp/health'

# List recent jobs
salt-run jobs.list_jobs count=10

# Get output of a specific job
salt-run jobs.lookup_jid 20240101120000000001

# Kill a running job on all minions
salt '*' saltutil.kill_job 20240101120000000001

# Check running jobs on a minion
salt 'web1' saltutil.running`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created SaltStack cheatsheet: ${salt.name} (${salt.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
