import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "Puppet", userId: null } });

  const puppet = await prisma.category.create({
    data: {
      name: "Puppet",
      icon: "🎭",
      color: "yellow",
      description: "Puppet: manifests, resources, classes, modules, Hiera, Facter, PuppetDB, and r10k",
      isPublic: true,
      snippets: {
        create: [
          // ── puppet CLI ────────────────────────────────────────────────────
          {
            title: "puppet CLI",
            description: "Core puppet commands for agents, apply, and server management",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "puppet agent",
                  content: `# Run the agent and apply the catalog
sudo puppet agent --test

# Run once, verbose, no daemonize
sudo puppet agent --test --verbose

# Dry run — show what would change without applying
sudo puppet agent --test --noop

# Run with a specific environment
sudo puppet agent --test --environment staging

# Enable / disable the agent
sudo puppet agent --enable
sudo puppet agent --disable "Maintenance window until 18:00"

# Show agent status
sudo puppet agent --status

# Run the agent daemon
sudo puppet agent --daemonize
sudo systemctl start puppet

# Force a full catalog recompile (ignore cached catalog)
sudo puppet agent --test --pluginsync --ignorecache`,
                },
                {
                  order: 1, language: "bash", label: "puppet apply",
                  content: `# Apply a single manifest locally (no server needed)
sudo puppet apply manifest.pp

# Apply with verbose output
sudo puppet apply manifest.pp --verbose

# Dry run
sudo puppet apply manifest.pp --noop

# Apply with a specific modulepath
sudo puppet apply manifest.pp --modulepath /etc/puppet/modules:/opt/modules

# Apply with Hiera data directory
sudo puppet apply manifest.pp --hiera_config /etc/puppet/hiera.yaml

# Apply inline code
sudo puppet apply -e 'package { "curl": ensure => installed }'

# Apply and write the catalog to a file
sudo puppet apply manifest.pp --catalog_cache_terminus json --write-catalog-summary`,
                },
                {
                  order: 2, language: "bash", label: "puppet cert & node (Puppet 5/6)",
                  content: `# List pending certificate requests
sudo puppet cert list

# List all signed certs
sudo puppet cert list --all

# Sign a certificate request
sudo puppet cert sign web-01.example.com

# Sign all pending requests
sudo puppet cert sign --all

# Revoke / clean a certificate
sudo puppet cert clean web-01.example.com

# Puppetserver CA commands (Puppet 6+ / Puppet 7)
sudo puppetserver ca list
sudo puppetserver ca sign --certname web-01.example.com
sudo puppetserver ca revoke --certname web-01.example.com
sudo puppetserver ca clean --certname web-01.example.com

# Show a node's facts from PuppetDB
puppet node find web-01.example.com
puppet node deactivate web-01.example.com`,
                },
              ],
            },
          },
          // ── Manifests & Resources ─────────────────────────────────────────
          {
            title: "Manifests & Core Resources",
            description: "Write manifests using Puppet's built-in resource types",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "puppet", label: "package, service, file",
                  content: `# package
package { 'nginx':
  ensure => installed,       # or: present, absent, latest, '1.24.0'
}

package { ['git', 'curl', 'wget']:
  ensure => installed,
}

# service
service { 'nginx':
  ensure     => running,     # or: stopped
  enable     => true,        # start on boot
  hasstatus  => true,
  hasrestart => true,
}

# file — create a file with content
file { '/etc/motd':
  ensure  => file,
  content => "Managed by Puppet\n",
  owner   => 'root',
  group   => 'root',
  mode    => '0644',
}

# file — create a directory
file { '/var/app':
  ensure => directory,
  owner  => 'deploy',
  group  => 'deploy',
  mode   => '0755',
}

# file — symlink
file { '/usr/local/bin/node':
  ensure => link,
  target => '/usr/local/node-18/bin/node',
}

# file — deploy from module's files/ directory
file { '/etc/app/config.yml':
  ensure => file,
  source => 'puppet:///modules/app/config.yml',
  owner  => 'app',
  mode   => '0640',
}`,
                },
                {
                  order: 1, language: "puppet", label: "user, group, exec, cron",
                  content: `# user
user { 'deploy':
  ensure     => present,
  uid        => 1500,
  gid        => 'deploy',
  home       => '/home/deploy',
  shell      => '/bin/bash',
  managehome => true,
  comment    => 'Deploy user',
}

# group
group { 'deploy':
  ensure => present,
  gid    => 1500,
}

# exec — run a command
exec { 'run-migrations':
  command => '/var/app/bin/migrate',
  cwd     => '/var/app',
  user    => 'deploy',
  path    => ['/usr/bin', '/bin'],
  unless  => '/var/app/bin/check-migrated',   # skip if exits 0
  # onlyif  => '...',                          # run only if exits 0
  # creates => '/var/app/.migrated',           # skip if path exists
  # refreshonly => true,                       # only run on notify
}

# cron
cron { 'backup-db':
  command => '/usr/local/bin/backup.sh',
  user    => 'root',
  hour    => '2',
  minute  => '0',
  weekday => ['Saturday', 'Sunday'],
}

# host entry
host { 'db.internal':
  ip           => '10.0.0.5',
  host_aliases => ['database'],
  ensure       => present,
}`,
                },
                {
                  order: 2, language: "puppet", label: "Ordering & notification",
                  content: `# Resource ordering with before / require / notify / subscribe

package { 'nginx':
  ensure => installed,
}

file { '/etc/nginx/nginx.conf':
  ensure  => file,
  content => template('nginx/nginx.conf.erb'),
  require => Package['nginx'],        # apply after package
  notify  => Service['nginx'],        # trigger service refresh
}

service { 'nginx':
  ensure    => running,
  enable    => true,
  subscribe => File['/etc/nginx/nginx.conf'],  # restart when file changes
}

# Chaining arrows (alternative syntax)
Package['nginx'] -> File['/etc/nginx/nginx.conf'] ~> Service['nginx']
# ->  ordering only
# ~>  ordering + notification (refresh)

# Stage ordering for broad sequencing
stage { 'pre': before => Stage['main'] }
class { 'apt': stage => 'pre' }`,
                },
              ],
            },
          },
          // ── Classes & Modules ─────────────────────────────────────────────
          {
            title: "Classes & Modules",
            description: "Define, declare, and structure classes and modules",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "puppet", label: "Defining & declaring classes",
                  content: `# Define a class (in modules/nginx/manifests/init.pp)
class nginx (
  Integer $port             = 80,
  String  $worker_processes = 'auto',
  Boolean $manage_service   = true,
) {

  package { 'nginx':
    ensure => installed,
  }

  file { '/etc/nginx/nginx.conf':
    ensure  => file,
    content => epp('nginx/nginx.conf.epp', {
      port             => $port,
      worker_processes => $worker_processes,
    }),
    require => Package['nginx'],
    notify  => Service['nginx'],
  }

  if $manage_service {
    service { 'nginx':
      ensure  => running,
      enable  => true,
      require => Package['nginx'],
    }
  }
}

# Declare a class (in a manifest or profile)
include nginx

# Declare with parameters (resource-like — only once per catalog)
class { 'nginx':
  port             => 8080,
  worker_processes => 4,
}`,
                },
                {
                  order: 1, language: "bash", label: "Module structure & generation",
                  content: `# Generate a module skeleton with PDK (Puppet Development Kit)
pdk new module my_module
pdk new module my_module --author myorg --license Apache-2.0

# Generate a class within the module
pdk new class my_module
pdk new class my_module::install
pdk new class my_module::config
pdk new class my_module::service

# Generate a defined type
pdk new defined_type my_module::vhost

# Generate a task
pdk new task restart_service

# Validate syntax
pdk validate

# Run unit tests
pdk test unit

# Module directory layout:
# my_module/
#   manifests/
#     init.pp          — main class (my_module)
#     install.pp       — my_module::install
#     config.pp        — my_module::config
#     service.pp       — my_module::service
#   templates/         — .epp and .erb templates
#   files/             — static files
#   lib/
#     puppet/
#       functions/     — custom functions
#       types/         — custom data types
#   tasks/             — Puppet Tasks (Bolt)
#   facts.d/           — external facts
#   metadata.json      — module metadata and dependencies
#   Puppetfile         — r10k dependency list`,
                },
              ],
            },
          },
          // ── Defined Types & Templates ─────────────────────────────────────
          {
            title: "Defined Types & Templates",
            description: "Reusable defined types and EPP/ERB template syntax",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "puppet", label: "Defined types",
                  content: `# Define a reusable type (modules/nginx/manifests/vhost.pp)
define nginx::vhost (
  String           $server_name,
  Integer          $port        = 80,
  String           $root        = "/var/www/\${title}",
  Optional[String] $ssl_cert    = undef,
) {

  file { "/etc/nginx/sites-available/\${title}.conf":
    ensure  => file,
    content => epp('nginx/vhost.conf.epp', {
      server_name => $server_name,
      port        => $port,
      root        => $root,
      ssl_cert    => $ssl_cert,
    }),
    notify  => Service['nginx'],
  }

  file { "/etc/nginx/sites-enabled/\${title}.conf":
    ensure  => link,
    target  => "/etc/nginx/sites-available/\${title}.conf",
    require => File["/etc/nginx/sites-available/\${title}.conf"],
  }
}

# Use it
nginx::vhost { 'myapp':
  server_name => 'myapp.example.com',
  port        => 443,
  ssl_cert    => '/etc/ssl/myapp.crt',
}

nginx::vhost { 'api':
  server_name => 'api.example.com',
  root        => '/var/www/api/public',
}`,
                },
                {
                  order: 1, language: "puppet", label: "EPP templates",
                  content: `<%- | Integer $port,
      String  $worker_processes,
      String  $log_dir = '/var/log/nginx',
| -%>
# /etc/nginx/nginx.conf — Managed by Puppet

worker_processes <%= $worker_processes %>;

events {
  worker_connections 1024;
}

http {
  access_log <%= $log_dir %>/access.log;
  error_log  <%= $log_dir %>/error.log;

  server {
    listen <%= $port %>;
<% if $port == 443 { -%>
    ssl on;
<% } -%>
  }
}

<%# This is an EPP comment — not rendered %>

# Use in a manifest:
# file { '/etc/nginx/nginx.conf':
#   content => epp('nginx/nginx.conf.epp', {
#     port             => $port,
#     worker_processes => $worker_processes,
#   }),
# }
#
# ERB equivalent uses <%= @variable %> and is rendered with:
# content => template('nginx/nginx.conf.erb')`,
                },
              ],
            },
          },
          // ── Hiera ─────────────────────────────────────────────────────────
          {
            title: "Hiera",
            description: "Hierarchical data lookups, backends, and automatic class parameters",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "hiera.yaml (v5)",
                  content: `# /etc/puppetlabs/puppet/hiera.yaml — Hiera 5 configuration

version: 5

defaults:
  datadir: data
  data_hash: yaml_data

hierarchy:
  # Most specific — node-level overrides
  - name: "Node data"
    path: "nodes/%{trusted.certname}.yaml"

  # Environment-level
  - name: "Environment"
    path: "environments/%{server_facts.environment}.yaml"

  # OS family
  - name: "OS family"
    paths:
      - "os/%{facts.os.family}/%{facts.os.release.major}.yaml"
      - "os/%{facts.os.family}.yaml"

  # Datacenter / location
  - name: "Location"
    path: "location/%{facts.datacenter}.yaml"

  # Encrypted secrets (eyaml backend)
  - name: "Secrets"
    lookup_options: {}
    path: "secrets/%{server_facts.environment}.eyaml"
    options:
      pkcs7_private_key: /etc/puppetlabs/puppet/keys/private_key.pkcs7.pem
      pkcs7_public_key:  /etc/puppetlabs/puppet/keys/public_key.pkcs7.pem

  # Global defaults — lowest precedence
  - name: "Common"
    path: "common.yaml"`,
                },
                {
                  order: 1, language: "yaml", label: "Hiera data files",
                  content: `# data/common.yaml — global defaults
---
nginx::port: 80
nginx::worker_processes: "auto"

app::packages:
  - git
  - curl
  - libpq-dev

ntp::servers:
  - 0.pool.ntp.org
  - 1.pool.ntp.org

# data/environments/production.yaml — production overrides
---
nginx::worker_processes: "8"

app::log_level: warn
app::db_host: db.prod.internal

# data/nodes/web-01.example.com.yaml — node-specific overrides
---
nginx::port: 8443

# data/os/Debian.yaml — OS-family data
---
app::packages:
  - git
  - curl
  - libpq-dev
  - build-essential`,
                },
                {
                  order: 2, language: "puppet", label: "Hiera lookups in manifests",
                  content: `# Automatic parameter lookup (recommended)
# Puppet automatically looks up nginx::port in Hiera
class nginx (
  Integer $port = 80,    # Hiera key: nginx::port
) { }

# Explicit lookup in a manifest
$db_host = lookup('app::db_host')
$db_host = lookup('app::db_host', String, 'first', 'localhost')

# Lookup with merge strategy
$packages = lookup('app::packages', Array[String], 'unique')
$config   = lookup('app::config',   Hash,          'hash')
$config   = lookup('app::config',   Hash,          'deep')

# Lookup with a default value
$secret = lookup('app::api_key', Optional[String], 'first', undef)

# Look up from the command line (test / debug)
# puppet lookup nginx::port --environment production --node web-01.example.com
# puppet lookup --explain nginx::port --node web-01.example.com`,
                },
              ],
            },
          },
          // ── Facter ────────────────────────────────────────────────────────
          {
            title: "Facter",
            description: "Query system facts and write custom facts",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "facter commands",
                  content: `# Show all facts
facter

# Show a specific fact
facter os
facter os.family
facter networking.ip
facter virtual
facter processors.count

# Output as JSON
facter -j

# Output as YAML
facter -y

# Show only custom / external facts
facter --custom-dir /etc/puppetlabs/facter/facts.d

# Debug fact loading
facter --debug

# List all fact names
facter --list-block-groups

# Run on a remote node via SSH (Bolt)
bolt command run 'facter os' --targets web-01.example.com

# Common useful facts:
# facts.os.name              — "Ubuntu"
# facts.os.family            — "Debian"
# facts.os.release.major     — "22"
# facts.networking.ip        — primary IPv4
# facts.networking.fqdn      — FQDN
# facts.processors.count     — CPU count
# facts.memory.system.total  — total RAM
# facts.virtual              — "physical", "vmware", "kvm" etc.
# trusted.certname           — node's cert name (trusted)`,
                },
                {
                  order: 1, language: "ruby", label: "Custom facts",
                  content: `# lib/facter/app_version.rb — custom Ruby fact
Facter.add('app_version') do
  setcode do
    Facter::Core::Execution.execute('/var/app/bin/version')
  end
end

# Fact with confine (only runs on certain platforms)
Facter.add('service_port') do
  confine kernel: 'Linux'
  setcode { '8080' }
end

# Structured custom fact
Facter.add('app_info') do
  setcode do
    {
      'version'  => Facter::Core::Execution.execute('/var/app/bin/version').chomp,
      'env'      => ENV['RAILS_ENV'] || 'production',
      'pid_file' => '/var/run/app.pid',
    }
  end
end

# External fact (facts.d/datacenter.yaml — no Ruby needed)
# /etc/puppetlabs/facter/facts.d/datacenter.yaml
---
datacenter: us-east-1
rack: A4
environment_tier: production

# External fact shell script (facts.d/load.sh)
#!/bin/bash
echo "load_avg=$(cat /proc/loadavg | cut -d' ' -f1)"`,
                },
              ],
            },
          },
          // ── Roles & Profiles ──────────────────────────────────────────────
          {
            title: "Roles & Profiles Pattern",
            description: "The recommended way to compose business logic with modules",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "puppet", label: "Profile (technology layer)",
                  content: `# modules/profile/manifests/webserver.pp
# A profile wraps one technology with site-specific config
class profile::webserver {

  # Data comes from Hiera automatically
  class { 'nginx':
    # nginx::port looked up from Hiera
  }

  nginx::vhost { 'myapp':
    server_name => lookup('profile::webserver::server_name'),
    root        => '/var/www/myapp/current/public',
  }

  class { 'logrotate':
    rules => {
      'nginx' => {
        path         => '/var/log/nginx/*.log',
        rotate       => 14,
        compress     => true,
        postrotate   => 'nginx -s reopen',
      },
    },
  }
}

# modules/profile/manifests/base.pp
class profile::base {
  include profile::ntp
  include profile::users
  include profile::monitoring
  include profile::logging

  class { 'sudo':
    purge               => true,
    config_file_replace => true,
  }
}`,
                },
                {
                  order: 1, language: "puppet", label: "Role (business layer)",
                  content: `# modules/role/manifests/webserver.pp
# A role describes what a machine IS — only includes profiles
class role::webserver {
  include profile::base
  include profile::webserver
  include profile::app
  include profile::ssl
}

# modules/role/manifests/database.pp
class role::database {
  include profile::base
  include profile::postgresql
  include profile::backups
}

# modules/role/manifests/bastion.pp
class role::bastion {
  include profile::base
  include profile::ssh_gateway
  include profile::vpn
}

# Assign to a node in site.pp (or via Hiera / ENC)
node 'web-01.example.com' {
  include role::webserver
}

node /^db-\d+\.example\.com$/ {
  include role::database
}

# Via Hiera (preferred — keeps site.pp clean):
# data/nodes/web-01.example.com.yaml
# ---
# classes:
#   - role::webserver`,
                },
              ],
            },
          },
          // ── r10k & Puppetfile ─────────────────────────────────────────────
          {
            title: "r10k & Puppetfile",
            description: "Manage environments and module dependencies with r10k",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "r10k commands",
                  content: `# Deploy all environments from control repo
r10k deploy environment

# Deploy a specific environment
r10k deploy environment production
r10k deploy environment staging

# Deploy with verbose output
r10k deploy environment production --verbose debug

# Deploy and update modules (Puppetfile) for an environment
r10k deploy environment production --puppetfile

# Deploy a single module across all environments
r10k deploy module nginx

# Show current environment status
r10k deploy display

# Validate Puppetfile syntax
r10k puppetfile check

# Install modules listed in Puppetfile (local / non-server use)
r10k puppetfile install

# Purge unmanaged modules
r10k puppetfile purge`,
                },
                {
                  order: 1, language: "ruby", label: "Puppetfile",
                  content: `# Puppetfile — lives in your control repo root

# Forge modules (forge.puppet.com)
mod 'puppetlabs-stdlib',      '9.3.0'
mod 'puppetlabs-apache',      '11.0.0'
mod 'puppetlabs-postgresql',  '9.2.0'
mod 'puppetlabs-ntp',         '4.3.0'
mod 'puppet-nginx',           '5.0.0'
mod 'saz-sudo',               '8.0.0'

# From a Git repo — specific branch
mod 'myorg-app',
  git:    'https://github.com/myorg/puppet-app.git',
  branch: 'main'

# From a Git repo — specific tag (recommended for stability)
mod 'myorg-secrets',
  git: 'https://github.com/myorg/puppet-secrets.git',
  tag: 'v2.1.0'

# From a Git repo — specific commit
mod 'myorg-internal',
  git:    'https://github.com/myorg/puppet-internal.git',
  commit: 'a3f4b2c'

# Local path (for development)
mod 'myorg-profile',  local: true
mod 'myorg-role',     local: true`,
                },
              ],
            },
          },
          // ── PuppetDB & Reports ────────────────────────────────────────────
          {
            title: "PuppetDB & Reporting",
            description: "Query node data, facts, and reports from PuppetDB",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "PuppetDB queries (PQL & API)",
                  content: `# Query nodes (Puppet Query Language — PQL)
puppet query 'nodes[certname] {}'
puppet query 'nodes[certname] { facts.os.family = "Debian" }'
puppet query 'nodes[certname] { resources { type = "Service" and title = "nginx" } }'

# Find nodes that haven't checked in for 1 hour
puppet query 'nodes[certname, report_timestamp] { report_timestamp < "1 hour ago" }'

# Query facts
puppet query 'facts[certname, value] { name = "ipaddress" }'
puppet query 'facts[certname, value] { name = "os.family" and value = "Debian" }'

# Query resources across nodes
puppet query 'resources[certname, title, parameters] { type = "Package" and title = "nginx" }'

# Query recent reports
puppet query 'reports[certname, status, end_time] { latest_report_status = "failed" }'
puppet query 'reports[certname, status] { status = "changed" order by end_time desc limit 10 }'

# Direct HTTP API (curl)
curl -s "http://puppetdb:8080/pdb/query/v4/nodes" | jq '.[].certname'
curl -s "http://puppetdb:8080/pdb/query/v4/facts?query=[\"=\",\"name\",\"ipaddress\"]" | jq .`,
                },
              ],
            },
          },
          // ── Bolt ──────────────────────────────────────────────────────────
          {
            title: "Bolt — Task Runner",
            description: "Run ad-hoc commands, scripts, and tasks without an agent",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "bolt commands",
                  content: `# Run a command on targets
bolt command run 'uptime' --targets web-01.example.com
bolt command run 'uptime' --targets web-01,web-02,web-03
bolt command run 'systemctl restart nginx' --targets 'role=webserver' --run-as root

# Run a script
bolt script run ./scripts/setup.sh --targets web-01.example.com

# Upload a file
bolt file upload ./config.yml /etc/app/config.yml --targets web-01.example.com

# Run a Puppet task
bolt task run package action=install name=nginx --targets web-01.example.com
bolt task run service action=restart name=nginx --targets 'role=webserver'

# Run a Puppet plan
bolt plan run mymodule::deploy version=1.2.0 --targets web-01.example.com

# Apply a manifest block directly
bolt apply -e 'package { "curl": ensure => installed }' --targets web-01.example.com

# Apply a manifest file
bolt apply manifests/webserver.pp --targets web-01.example.com

# Inventory-based targeting (inventory.yaml)
bolt command run 'df -h' --targets production_web

# List available tasks
bolt task show
bolt task show package`,
                },
              ],
            },
          },
          // ── Useful Patterns ───────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "Conditionals, iterations, resource collectors, and virtual resources",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "puppet", label: "Conditionals & iterations",
                  content: `# if / elsif / else
if $facts['os']['family'] == 'Debian' {
  package { 'libpq-dev': ensure => installed }
} elsif $facts['os']['family'] == 'RedHat' {
  package { 'postgresql-devel': ensure => installed }
} else {
  fail("Unsupported OS family: \${facts['os']['family']}")
}

# unless
unless $facts['virtual'] == 'physical' {
  notice('Running in a virtual environment')
}

# case
case $facts['os']['name'] {
  'Ubuntu': { include profile::ubuntu_extras }
  'CentOS', 'RedHat': { include profile::rhel_extras }
  default:  { warning("Unknown OS: \${facts['os']['name']}") }
}

# Selector (inline ternary-like)
$pkg_provider = $facts['os']['family'] ? {
  'Debian' => 'apt',
  'RedHat' => 'yum',
  default  => 'gem',
}

# each — iterate an array
$packages = ['git', 'curl', 'jq']
$packages.each |String $pkg| {
  package { $pkg: ensure => installed }
}

# each — iterate a hash
$users = { 'alice' => 1500, 'bob' => 1501 }
$users.each |String $name, Integer $uid| {
  user { $name:
    ensure => present,
    uid    => $uid,
  }
}

# create_resources (hash to resources)
$vhosts = lookup('nginx::vhosts', Hash, 'hash', {})
create_resources('nginx::vhost', $vhosts)`,
                },
                {
                  order: 1, language: "puppet", label: "Resource collectors & virtual resources",
                  content: `# Virtual resource — declare without applying
@user { 'alice':
  ensure => present,
  uid    => 1500,
  groups => ['deploy'],
}

@user { 'bob':
  ensure => present,
  uid    => 1501,
}

# Realize on the nodes that need them
realize User['alice']
realize(User['alice'], User['bob'])

# Resource collector — realize with a condition
User <| groups == 'deploy' |>
User <| title == 'alice' or title == 'bob' |>

# Exported resources (share between nodes via PuppetDB)
# On the node that exports:
@@nagios_service { "check_http_\${facts['networking']['fqdn']}":
  use                 => 'generic-service',
  host_name           => $facts['networking']['fqdn'],
  service_description => 'HTTP',
  check_command       => 'check_http',
  tag                 => 'nagios',
}

# On the Nagios server that collects:
Nagios_service <<| tag == 'nagios' |>>

# Exported host entries (add all nodes to /etc/hosts)
@@host { $facts['networking']['fqdn']:
  ip           => $facts['networking']['ip'],
  host_aliases => [$facts['networking']['hostname']],
  tag          => 'all_nodes',
}
# On every node:
Host <<| tag == 'all_nodes' |>>`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Puppet cheatsheet: ${puppet.name} (${puppet.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
