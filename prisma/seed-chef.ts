import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "Chef", userId: null } });

  const chef = await prisma.category.create({
    data: {
      name: "Chef",
      icon: "👨‍🍳",
      color: "orange",
      description: "Chef: knife, cookbooks, recipes, resources, roles, environments, data bags, and Test Kitchen",
      isPublic: true,
      snippets: {
        create: [
          // ── knife CLI ─────────────────────────────────────────────────────
          {
            title: "knife — Core Commands",
            description: "Manage nodes, cookbooks, roles, and environments from the workstation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Node management",
                  content: `# List all nodes
knife node list

# Show node details
knife node show web-01
knife node show web-01 -a run_list
knife node show web-01 -a automatic.ipaddress

# Edit a node's run list
knife node edit web-01

# Set run list directly
knife node run_list set web-01 "role[base],role[webserver]"

# Add to run list
knife node run_list add web-01 "recipe[nginx]"

# Remove from run list
knife node run_list remove web-01 "recipe[nginx]"

# Delete a node
knife node delete web-01 --yes

# Delete node and client together
knife node delete web-01 --yes && knife client delete web-01 --yes`,
                },
                {
                  order: 1, language: "bash", label: "Bootstrap a node",
                  content: `# Bootstrap a Linux node over SSH
knife bootstrap 10.0.0.1 \\
  --ssh-user ubuntu \\
  --sudo \\
  --identity-file ~/.ssh/id_rsa \\
  --node-name web-01 \\
  --run-list "role[base],role[webserver]"

# Bootstrap with a specific Chef version
knife bootstrap 10.0.0.1 \\
  --ssh-user ubuntu \\
  --sudo \\
  --identity-file ~/.ssh/id_rsa \\
  --node-name web-01 \\
  --bootstrap-version 17.10.0 \\
  --run-list "role[base]"

# Bootstrap a Windows node (WinRM)
knife bootstrap windows winrm 10.0.0.2 \\
  --winrm-user Administrator \\
  --winrm-password 'P@ssword' \\
  --node-name win-01 \\
  --run-list "role[windows_base]"`,
                },
                {
                  order: 2, language: "bash", label: "Search",
                  content: `# Search all nodes
knife search node "*:*"

# Search by role
knife search node "role:webserver"

# Search by environment
knife search node "chef_environment:production"

# Search by attribute
knife search node "platform:ubuntu AND platform_version:22.04"

# Search by name pattern
knife search node "name:web-*"

# Combine conditions
knife search node "role:webserver AND chef_environment:prod"

# Show only specific attributes
knife search node "role:webserver" -a ipaddress -a hostname

# Search data bags
knife search users "groups:admins"

# Count results only
knife search node "role:webserver" -i`,
                },
              ],
            },
          },
          // ── Cookbooks ─────────────────────────────────────────────────────
          {
            title: "Cookbooks",
            description: "Create, upload, download, and manage cookbooks",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Manage cookbooks",
                  content: `# Generate a new cookbook
chef generate cookbook my_cookbook
knife cookbook create my_cookbook  # legacy

# List cookbooks on Chef Server
knife cookbook list

# Show versions of a cookbook
knife cookbook show my_cookbook

# Show a specific version
knife cookbook show my_cookbook 1.2.0

# Upload a cookbook to Chef Server
knife cookbook upload my_cookbook

# Upload all cookbooks
knife cookbook upload --all

# Upload with dependencies
knife cookbook upload my_cookbook --include-dependencies

# Download a cookbook from Chef Server
knife cookbook download my_cookbook
knife cookbook download my_cookbook 1.2.0

# Delete a cookbook version
knife cookbook delete my_cookbook 1.0.0 --yes

# Delete all versions
knife cookbook delete my_cookbook --all --yes`,
                },
                {
                  order: 1, language: "bash", label: "Cookbook structure",
                  content: `# Generated cookbook layout:
# my_cookbook/
#   metadata.rb          — name, version, dependencies
#   README.md
#   recipes/
#     default.rb         — default recipe
#   attributes/
#     default.rb         — default attribute values
#   templates/
#     default/           — .erb template files
#   files/
#     default/           — static files
#   resources/           — custom resources (HWRP)
#   libraries/           — Ruby helper modules
#   test/
#     integration/       — InSpec / ServerSpec tests
#   spec/
#     unit/              — ChefSpec unit tests
#   Berksfile            — dependency management
#   .kitchen.yml         — Test Kitchen config
#   chefignore           — files to exclude from upload

# Generate components
chef generate recipe my_cookbook webserver
chef generate attribute my_cookbook default
chef generate template my_cookbook nginx.conf
chef generate resource my_cookbook app_service`,
                },
              ],
            },
          },
          // ── Recipes & Resources ───────────────────────────────────────────
          {
            title: "Recipes & Resources",
            description: "Common built-in resources and recipe patterns",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "ruby", label: "Common built-in resources",
                  content: `# package — install/remove OS packages
package 'nginx' do
  action :install
  version '1.24.0'          # optional: pin version
end

package %w[git curl wget] do
  action :install
end

# service — manage system services
service 'nginx' do
  action [:enable, :start]  # enable on boot + start now
  supports status: true, restart: true, reload: true
end

# file — manage file content
file '/etc/motd' do
  content "Managed by Chef\n"
  owner   'root'
  group   'root'
  mode    '0644'
  action  :create
end

# directory — create directories
directory '/var/app/releases' do
  owner     'deploy'
  group     'deploy'
  mode      '0755'
  recursive true
  action    :create
end

# template — render ERB templates
template '/etc/nginx/nginx.conf' do
  source  'nginx.conf.erb'
  owner   'root'
  group   'root'
  mode    '0644'
  variables(
    worker_processes: node['nginx']['worker_processes'],
    port:             node['nginx']['port']
  )
  notifies :reload, 'service[nginx]', :delayed
end`,
                },
                {
                  order: 1, language: "ruby", label: "More resources & patterns",
                  content: `# cookbook_file — deploy a static file from files/ directory
cookbook_file '/etc/app/config.yml' do
  source 'config.yml'
  owner  'app'
  mode   '0640'
  action :create
end

# remote_file — download from a URL
remote_file '/tmp/installer.tar.gz' do
  source   'https://releases.example.com/app-1.0.tar.gz'
  checksum 'sha256:abc123...'
  action   :create_if_missing
end

# execute — run a shell command
execute 'run db migrations' do
  command 'bundle exec rake db:migrate'
  cwd     '/var/app/current'
  user    'deploy'
  environment 'RAILS_ENV' => 'production'
  action  :run
  not_if  { ::File.exist?('/var/app/.migrated') }
end

# bash / ruby_block
bash 'compile from source' do
  code <<~BASH
    ./configure --prefix=/usr/local
    make -j$(nproc)
    make install
  BASH
  cwd   '/tmp/src'
  action :run
  creates '/usr/local/bin/myapp'   # skip if file exists
end

# link — manage symlinks
link '/usr/local/bin/node' do
  to '/usr/local/node-18/bin/node'
end

# user & group
group 'deploy' do
  gid    1500
  action :create
end

user 'deploy' do
  uid     1500
  gid     'deploy'
  home    '/home/deploy'
  shell   '/bin/bash'
  action  :create
end`,
                },
                {
                  order: 2, language: "ruby", label: "Notifications & guards",
                  content: `# notifies — trigger another resource after this one changes
template '/etc/nginx/nginx.conf' do
  source 'nginx.conf.erb'
  notifies :reload,  'service[nginx]', :delayed    # after converge
  notifies :restart, 'service[nginx]', :immediately # right now
end

# subscribes — this resource reacts when another changes
service 'nginx' do
  action [:enable, :start]
  subscribes :reload, 'template[/etc/nginx/nginx.conf]', :delayed
end

# Guards — only_if / not_if
package 'redis' do
  action  :install
  only_if { node['app']['cache_enabled'] }
end

execute 'init database' do
  command '/usr/bin/init-db.sh'
  not_if  'systemctl is-active mydb'          # shell string
  not_if  { ::File.exist?('/var/db/.init') }  # Ruby block
end

# Lazy attribute evaluation
template '/etc/app.conf' do
  variables lazy {
    { secret: Chef::EncryptedDataBagItem.load('secrets', 'app')['key'] }
  }
end`,
                },
              ],
            },
          },
          // ── Attributes ────────────────────────────────────────────────────
          {
            title: "Attributes",
            description: "Define, override, and access node attributes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "ruby", label: "Attribute precedence & definition",
                  content: `# attributes/default.rb — define cookbook defaults

# Precedence levels (lowest → highest):
# default < force_default < normal < override < force_override < automatic

default['nginx']['port']             = 80
default['nginx']['worker_processes'] = 'auto'
default['nginx']['log_dir']          = '/var/log/nginx'

default['app']['user']     = 'deploy'
default['app']['dir']      = '/var/app'
default['app']['env']      = 'production'
default['app']['packages'] = %w[git curl libpq-dev]

# Nested hash
default['app']['db'] = {
  host: 'localhost',
  port: 5432,
  name: 'myapp'
}

# Override in a role or environment:
# override_attributes 'nginx' => { 'port' => 8080 }

# Access in a recipe:
# node['nginx']['port']
# node['app']['db']['host']
# node.default['nginx']['port'] = 8080  (set at runtime)`,
                },
              ],
            },
          },
          // ── Roles ─────────────────────────────────────────────────────────
          {
            title: "Roles",
            description: "Create, upload, and apply roles to nodes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "knife role commands",
                  content: `# List roles
knife role list

# Show a role
knife role show webserver

# Create / edit a role (opens $EDITOR)
knife role create webserver
knife role edit webserver

# Upload a role from a file
knife role from file roles/webserver.rb
knife role from file roles/*.rb

# Delete a role
knife role delete webserver --yes`,
                },
                {
                  order: 1, language: "ruby", label: "Role file (roles/webserver.rb)",
                  content: `name        'webserver'
description 'Web-facing application server'

# Run list applied to nodes with this role
run_list(
  'role[base]',
  'recipe[nginx]',
  'recipe[app::deploy]'
)

# Default attribute overrides (lower precedence)
default_attributes(
  'nginx' => {
    'worker_processes' => 4,
    'port'             => 80
  },
  'app' => {
    'env' => 'production'
  }
)

# Override attributes (higher precedence)
override_attributes(
  'nginx' => {
    'log_level' => 'warn'
  }
)`,
                },
              ],
            },
          },
          // ── Environments ──────────────────────────────────────────────────
          {
            title: "Environments",
            description: "Pin cookbook versions and set attributes per environment",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "knife environment commands",
                  content: `# List environments
knife environment list

# Show an environment
knife environment show production

# Create / edit
knife environment create production
knife environment edit production

# Upload from file
knife environment from file environments/production.rb
knife environment from file environments/*.rb

# Move a node to an environment
knife node environment_set web-01 production

# Search nodes in an environment
knife search node "chef_environment:production"

# Delete an environment
knife environment delete staging --yes`,
                },
                {
                  order: 1, language: "ruby", label: "Environment file",
                  content: `name        'production'
description 'Production environment'

# Pin cookbook versions (prevents accidental upgrades)
cookbook_versions(
  'nginx'       => '= 4.0.0',
  'app'         => '>= 2.1.0',
  'base'        => '~> 1.5.0',   # >= 1.5.0 and < 2.0.0
  'postgresql'  => '= 8.0.0'
)

# Default attributes for this environment
default_attributes(
  'app' => {
    'env'      => 'production',
    'log_level'=> 'warn'
  }
)

# Override attributes
override_attributes(
  'nginx' => {
    'worker_processes' => 8
  }
)`,
                },
              ],
            },
          },
          // ── Data Bags ─────────────────────────────────────────────────────
          {
            title: "Data Bags",
            description: "Store and access shared JSON data and encrypted secrets",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "knife data bag commands",
                  content: `# Create a data bag
knife data bag create users
knife data bag create secrets

# List data bags
knife data bag list

# List items in a data bag
knife data bag show users

# Show an item
knife data bag show users alice

# Create an item from a file
knife data bag from file users alice.json
knife data bag from file users data_bags/users/*.json

# Edit an item
knife data bag edit users alice

# Delete an item
knife data bag delete users alice --yes

# Delete a data bag
knife data bag delete users --yes

# Create encrypted item (uses a secret key file)
knife data bag create secrets db_creds \\
  --secret-file ~/.chef/encrypted_data_bag_secret

# Show encrypted item (decrypts with key)
knife data bag show secrets db_creds \\
  --secret-file ~/.chef/encrypted_data_bag_secret`,
                },
                {
                  order: 1, language: "ruby", label: "Access data bags in recipes",
                  content: `# Load a plain data bag item
users_bag = data_bag('users')        # returns array of item IDs
alice     = data_bag_item('users', 'alice')
Chef::Log.info("Alice's email: #{alice['email']}")

# Iterate over all items in a data bag
data_bag('users').each do |user_id|
  user = data_bag_item('users', user_id)
  user user_id do
    uid   user['uid']
    gid   user['gid']
    home  "/home/#{user_id}"
    shell user['shell'] || '/bin/bash'
    action :create
  end
end

# Load an encrypted data bag item
secret  = Chef::EncryptedDataBagItem.load_secret('/etc/chef/encrypted_data_bag_secret')
db_creds = Chef::EncryptedDataBagItem.load('secrets', 'db_creds', secret)

template '/etc/app/database.yml' do
  variables(
    host:     db_creds['host'],
    password: db_creds['password']
  )
end`,
                },
              ],
            },
          },
          // ── Berkshelf ─────────────────────────────────────────────────────
          {
            title: "Berkshelf",
            description: "Manage cookbook dependencies with Berkshelf",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "berks commands",
                  content: `# Install dependencies from Berksfile (into ~/.berkshelf/cookbooks)
berks install

# Update all dependencies (re-resolves versions)
berks update

# Update a specific cookbook
berks update nginx

# Upload all cookbooks to Chef Server
berks upload

# Upload a specific cookbook
berks upload my_cookbook

# Upload without SSL verification
berks upload --no-ssl-verify

# Show resolved dependency list
berks list

# Visualize dependency graph
berks viz

# Check for newer versions available
berks outdated

# Package cookbooks into a tarball (for chef-zero / policyfiles)
berks package cookbooks.tar.gz`,
                },
                {
                  order: 1, language: "ruby", label: "Berksfile",
                  content: `# Berksfile — cookbook dependency manifest

source 'https://supermarket.chef.io'

# Cookbook from Chef Supermarket
cookbook 'nginx', '~> 4.0'
cookbook 'postgresql', '>= 8.0'
cookbook 'apt', '~> 7.4'

# From a specific git repo and branch/tag
cookbook 'my_cookbook',
  git: 'https://github.com/myorg/my_cookbook.git',
  branch: 'main'

# From a specific git tag
cookbook 'my_cookbook',
  git: 'https://github.com/myorg/my_cookbook.git',
  tag: 'v1.2.0'

# From the local filesystem
cookbook 'internal_cookbook', path: '../internal_cookbook'

# The cookbook in this directory (typical when Berksfile is in a cookbook)
metadata`,
                },
              ],
            },
          },
          // ── chef-client ───────────────────────────────────────────────────
          {
            title: "chef-client",
            description: "Run, configure, and schedule the Chef client on a node",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "chef-client run modes",
                  content: `# Standard run (connects to Chef Server)
sudo chef-client

# Run with a specific log level
sudo chef-client --log_level info
sudo chef-client --log_level debug

# Run only specific recipes (override run list)
sudo chef-client --override-runlist "recipe[nginx],recipe[app]"

# Run in local mode (chef-zero, no server needed)
sudo chef-client --local-mode --runlist "recipe[my_cookbook]"
# or shorthand:
sudo chef-zero --local-mode -r "recipe[my_cookbook]"

# Dry run — show what would change without applying
sudo chef-client --why-run

# Run once and exit (no daemonize)
sudo chef-client --once

# Force specific node name
sudo chef-client --node-name web-01

# Run from a specific config
sudo chef-client -c /etc/chef/client.rb`,
                },
                {
                  order: 1, language: "ruby", label: "client.rb configuration",
                  content: `# /etc/chef/client.rb — Chef client configuration

chef_server_url  'https://chef.example.com/organizations/myorg'
node_name        'web-01'
client_key       '/etc/chef/client.pem'
validation_client_name 'myorg-validator'
validation_key   '/etc/chef/validation.pem'

# Log settings
log_level        :info
log_location     '/var/log/chef/client.log'

# Run interval (seconds) when running as daemon
interval         1800
splay            300    # random delay up to N seconds (prevents thundering herd)

# SSL
ssl_verify_mode  :verify_peer
trusted_certs_dir '/etc/chef/trusted_certs'

# Cache paths
file_cache_path  '/var/chef/cache'
file_backup_path '/var/chef/backup'

# Data bag secret
encrypted_data_bag_secret '/etc/chef/encrypted_data_bag_secret'

# Ohai — limit plugins for faster runs
ohai.disabled_plugins = [:Cloud, :EC2, :Azure]`,
                },
              ],
            },
          },
          // ── Test Kitchen ──────────────────────────────────────────────────
          {
            title: "Test Kitchen",
            description: "Converge, verify, and destroy test instances",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "kitchen commands",
                  content: `# List all test instances and their status
kitchen list

# Full lifecycle: create + converge + verify
kitchen test

# Create the instance (VM / container)
kitchen create
kitchen create ubuntu-2204

# Converge — run chef-client on the instance
kitchen converge
kitchen converge ubuntu-2204

# Run InSpec/Serverspec tests
kitchen verify
kitchen verify ubuntu-2204

# Login to a running instance
kitchen login ubuntu-2204

# Destroy the instance
kitchen destroy
kitchen destroy ubuntu-2204

# Re-run just the verify step after changes
kitchen verify ubuntu-2204

# Run everything except destroy (for debugging)
kitchen test --destroy=never`,
                },
                {
                  order: 1, language: "yaml", label: ".kitchen.yml",
                  content: `# .kitchen.yml — Test Kitchen configuration

driver:
  name: vagrant              # or docker, ec2, azure, gcp, etc.
  customize:
    memory: 1024

provisioner:
  name: chef_zero            # or chef_infra, chef_solo
  product_name: chef
  product_version: latest
  always_update_cookbooks: true

verifier:
  name: inspec               # or busser, serverspec

platforms:
  - name: ubuntu-22.04
    driver:
      box: bento/ubuntu-22.04
  - name: ubuntu-20.04
    driver:
      box: bento/ubuntu-20.04
  - name: centos-8
    driver:
      box: bento/centos-8

suites:
  - name: default
    run_list:
      - recipe[my_cookbook::default]
    attributes:
      nginx:
        port: 8080
  - name: webserver
    run_list:
      - role[webserver]
    verifier:
      inspec_tests:
        - test/integration/webserver`,
                },
              ],
            },
          },
          // ── InSpec Tests ──────────────────────────────────────────────────
          {
            title: "InSpec Tests",
            description: "Write and run infrastructure compliance tests",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "ruby", label: "Common InSpec resources",
                  content: `# test/integration/default/default_test.rb

# Package installed
describe package('nginx') do
  it { should be_installed }
  its('version') { should match /^1\.24/ }
end

# Service running and enabled
describe service('nginx') do
  it { should be_enabled }
  it { should be_running }
end

# Port listening
describe port(80) do
  it { should be_listening }
  its('protocols') { should include 'tcp' }
end

# File exists with correct permissions
describe file('/etc/nginx/nginx.conf') do
  it { should exist }
  its('owner') { should eq 'root' }
  its('group') { should eq 'root' }
  its('mode')  { should cmp '0644' }
  its('content') { should match /worker_processes/ }
end

# Directory exists
describe directory('/var/log/nginx') do
  it { should exist }
  it { should be_directory }
end

# User exists
describe user('deploy') do
  it { should exist }
  its('shell') { should eq '/bin/bash' }
end

# Command output
describe command('nginx -t') do
  its('exit_status') { should eq 0 }
  its('stdout') { should match /syntax is ok/ }
end`,
                },
                {
                  order: 1, language: "bash", label: "Run InSpec standalone",
                  content: `# Run tests against localhost
inspec exec test/integration/default

# Run against a remote SSH target
inspec exec test/ -t ssh://user@10.0.0.1 -i ~/.ssh/id_rsa

# Run against a Docker container
inspec exec test/ -t docker://container_id

# Run a specific control
inspec exec test/ --controls nginx_running

# Run with a custom attributes file
inspec exec test/ --input-file attributes.yml

# Run a compliance profile from Chef Automate / Supermarket
inspec exec https://github.com/dev-sec/linux-baseline

# Generate a new InSpec profile
inspec init profile my_profile

# Check profile syntax
inspec check test/integration/default

# Output formats
inspec exec test/ --reporter cli json:results.json html:results.html`,
                },
              ],
            },
          },
          // ── Policyfiles ───────────────────────────────────────────────────
          {
            title: "Policyfiles",
            description: "Lock cookbook versions and run lists with Policyfiles",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "policyfile workflow",
                  content: `# Generate a Policyfile
chef generate policyfile Policyfile.rb

# Install / resolve dependencies (creates Policyfile.lock.json)
chef install

# Update a single cookbook in the lock
chef update cookbooks/nginx

# Update all cookbooks
chef update

# Push a policy to Chef Server (policy group = environment analogue)
chef push production Policyfile.rb
chef push staging   Policyfile.rb

# Show policies on the server
chef show-policy my_policy
chef show-policy my_policy production

# List all policy groups
knife policy group list

# Delete a policy
chef delete-policy my_policy
chef delete-policy-group production`,
                },
                {
                  order: 1, language: "ruby", label: "Policyfile.rb",
                  content: `# Policyfile.rb — single source of truth for run list + cookbook versions

name    'webserver'

# Where to find cookbooks
default_source :supermarket

# The run list for nodes using this policy
run_list 'recipe[base]', 'recipe[nginx]', 'recipe[app::deploy]'

# Pin specific cookbook versions
cookbook 'nginx',  '~> 4.0'
cookbook 'base',   '= 2.3.1'
cookbook 'app',    path: '.'              # this repo
cookbook 'secrets', git: 'https://github.com/myorg/secrets-cookbook.git', branch: 'main'

# Named run lists (for ad-hoc use)
named_run_list :update_app, 'recipe[app::deploy]'
named_run_list :rotate_certs, 'recipe[base::certs]'`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Chef cheatsheet: ${chef.name} (${chef.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
