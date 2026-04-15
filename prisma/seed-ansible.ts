import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "Ansible", userId: null },
  });

  const ansible = await prisma.category.create({
    data: {
      name: "Ansible",
      icon: "⚙️",
      color: "red",
      description: "Ansible CLI commands and playbook patterns for configuration management and automation",
      isPublic: true,
      snippets: {
        create: [
          // ── Ad-hoc Commands ──────────────────────────────────────────────────
          {
            title: "Ad-hoc Commands",
            description: "Run one-off tasks against hosts without writing a playbook",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Ping all hosts", content: "ansible all -m ping" },
                { order: 1, language: "bash", label: "Ping a specific group", content: "ansible webservers -m ping" },
                { order: 2, language: "bash", label: "Run shell command on all hosts", content: "ansible all -m shell -a 'uptime'" },
                { order: 3, language: "bash", label: "Copy file to hosts", content: "ansible all -m copy -a 'src=./app.conf dest=/etc/app/app.conf owner=root mode=0644'" },
                { order: 4, language: "bash", label: "Install package (apt)", content: "ansible all -m apt -a 'name=nginx state=present' --become" },
                { order: 5, language: "bash", label: "Remove package", content: "ansible all -m apt -a 'name=nginx state=absent' --become" },
                { order: 6, language: "bash", label: "Restart a service", content: "ansible all -m service -a 'name=nginx state=restarted' --become" },
                { order: 7, language: "bash", label: "Gather facts from hosts", content: "ansible all -m setup" },
                { order: 8, language: "bash", label: "Gather specific fact", content: "ansible all -m setup -a 'filter=ansible_distribution*'" },
                { order: 9, language: "bash", label: "Run as a different user", content: "ansible all -m shell -a 'whoami' --become --become-user=postgres" },
                { order: 10, language: "bash", label: "Limit to one host", content: "ansible all -m ping --limit web01.example.com" },
              ],
            },
          },
          // ── Inventory ────────────────────────────────────────────────────────
          {
            title: "Inventory",
            description: "Define and inspect static and dynamic inventories",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List all hosts in inventory", content: "ansible all --list-hosts" },
                { order: 1, language: "bash", label: "List hosts in a group", content: "ansible webservers --list-hosts" },
                { order: 2, language: "bash", label: "Use a custom inventory file", content: "ansible all -i inventory/prod.ini --list-hosts" },
                { order: 3, language: "bash", label: "Use dynamic inventory script", content: "ansible all -i inventory/aws_ec2.yml --list-hosts" },
                { order: 4, language: "bash", label: "Graph group hierarchy", content: "ansible-inventory --graph" },
                { order: 5, language: "bash", label: "Show host vars as JSON", content: "ansible-inventory --host <hostname>" },
                { order: 6, language: "bash", label: "Dump full inventory as JSON", content: "ansible-inventory --list" },
                {
                  order: 7, language: "ini", label: "Static inventory file (INI)",
                  content: `[webservers]
web01.example.com ansible_user=ubuntu
web02.example.com ansible_user=ubuntu

[dbservers]
db01.example.com ansible_user=postgres ansible_port=2222

[production:children]
webservers
dbservers

[production:vars]
ansible_ssh_private_key_file=~/.ssh/prod_key`,
                },
                {
                  order: 8, language: "yaml", label: "Dynamic AWS EC2 inventory (YAML)",
                  content: `plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
filters:
  tag:Environment: production
  instance-state-name: running
keyed_groups:
  - key: tags.Role
    prefix: role
hostnames:
  - private-ip-address`,
                },
              ],
            },
          },
          // ── Playbooks ────────────────────────────────────────────────────────
          {
            title: "Running Playbooks",
            description: "Execute, test and control playbook runs",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Run a playbook", content: "ansible-playbook site.yml" },
                { order: 1, language: "bash", label: "Run with custom inventory", content: "ansible-playbook -i inventory/prod.ini site.yml" },
                { order: 2, language: "bash", label: "Dry run (check mode)", content: "ansible-playbook site.yml --check" },
                { order: 3, language: "bash", label: "Dry run with diff output", content: "ansible-playbook site.yml --check --diff" },
                { order: 4, language: "bash", label: "Limit to specific hosts or groups", content: "ansible-playbook site.yml --limit webservers" },
                { order: 5, language: "bash", label: "Run only specific tags", content: "ansible-playbook site.yml --tags deploy" },
                { order: 6, language: "bash", label: "Skip specific tags", content: "ansible-playbook site.yml --skip-tags restart" },
                { order: 7, language: "bash", label: "Start from a specific task", content: "ansible-playbook site.yml --start-at-task='Configure nginx'" },
                { order: 8, language: "bash", label: "Step through tasks interactively", content: "ansible-playbook site.yml --step" },
                { order: 9, language: "bash", label: "Pass extra variables", content: "ansible-playbook site.yml -e 'env=prod version=1.2.3'" },
                { order: 10, language: "bash", label: "Pass extra variables from file", content: "ansible-playbook site.yml -e @vars/prod.yml" },
                { order: 11, language: "bash", label: "Increase verbosity (up to -vvvv)", content: "ansible-playbook site.yml -vv" },
                { order: 12, language: "bash", label: "Fork across 20 hosts in parallel", content: "ansible-playbook site.yml --forks=20" },
              ],
            },
          },
          // ── Playbook Patterns ─────────────────────────────────────────────────
          {
            title: "Playbook Patterns",
            description: "Common playbook structures and task idioms",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Basic playbook structure",
                  content: `---
- name: Configure web servers
  hosts: webservers
  become: true
  vars:
    app_port: 8080

  pre_tasks:
    - name: Update apt cache
      apt:
        update_cache: true
        cache_valid_time: 3600

  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present

    - name: Deploy config
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        owner: root
        mode: "0644"
      notify: Restart nginx

  handlers:
    - name: Restart nginx
      service:
        name: nginx
        state: restarted`,
                },
                {
                  order: 1, language: "yaml", label: "Loop over a list",
                  content: `- name: Install required packages
  apt:
    name: "{{ item }}"
    state: present
  loop:
    - git
    - curl
    - unzip
    - build-essential`,
                },
                {
                  order: 2, language: "yaml", label: "Conditionals with when",
                  content: `- name: Install on Debian-based systems only
  apt:
    name: nginx
    state: present
  when: ansible_os_family == "Debian"

- name: Install on RedHat-based systems only
  yum:
    name: nginx
    state: present
  when: ansible_os_family == "RedHat"`,
                },
                {
                  order: 3, language: "yaml", label: "Register and use task output",
                  content: `- name: Check if app is running
  shell: pgrep -x myapp
  register: app_status
  ignore_errors: true

- name: Start app if not running
  shell: /opt/myapp/start.sh
  when: app_status.rc != 0`,
                },
                {
                  order: 4, language: "yaml", label: "Block with rescue and always",
                  content: `- block:
    - name: Run risky task
      shell: /opt/deploy.sh

    - name: Run follow-up task
      shell: /opt/verify.sh

  rescue:
    - name: Rollback on failure
      shell: /opt/rollback.sh

  always:
    - name: Send notification
      uri:
        url: https://hooks.example.com/notify
        method: POST`,
                },
                {
                  order: 5, language: "yaml", label: "Serial rolling deploy (one host at a time)",
                  content: `- name: Rolling deploy
  hosts: webservers
  serial: 1          # or "25%" for 25% at a time
  max_fail_percentage: 0

  tasks:
    - name: Pull latest image
      shell: docker pull myapp:latest

    - name: Restart container
      shell: docker-compose up -d --no-deps myapp`,
                },
              ],
            },
          },
          // ── Variables & Templates ─────────────────────────────────────────────
          {
            title: "Variables & Jinja2 Templates",
            description: "Variable precedence, filters and Jinja2 template patterns",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Variable precedence (low → high)",
                  content: `# Low priority (define defaults here)
# roles/myrole/defaults/main.yml
app_port: 8080
app_workers: 4

# Medium priority (role-specific vars)
# roles/myrole/vars/main.yml
app_log_level: info

# High priority (host/group specific)
# inventory/group_vars/webservers.yml
app_port: 443

# Highest priority (CLI override)
# ansible-playbook site.yml -e 'app_port=9090'`,
                },
                {
                  order: 1, language: "yaml", label: "Common Jinja2 filters",
                  content: `# String manipulation
"{{ app_name | upper }}"             # MYAPP
"{{ app_name | replace('-', '_') }}" # my_app
"{{ app_name | default('myapp') }}"  # fallback if undefined

# List operations
"{{ packages | join(', ') }}"        # git, curl, unzip
"{{ users | length }}"               # count items
"{{ items | select('match','web*') | list }}"

# Paths and types
"{{ '/etc/app' | basename }}"        # app
"{{ value | int }}"                  # cast to integer
"{{ value | bool }}"                 # cast to boolean
"{{ data | to_json }}"               # serialize to JSON`,
                },
                {
                  order: 2, language: "yaml", label: "Jinja2 template file (nginx.conf.j2)",
                  content: `upstream backend {
{% for host in groups['appservers'] %}
  server {{ hostvars[host]['ansible_host'] }}:{{ app_port }};
{% endfor %}
}

server {
  listen 80;
  server_name {{ inventory_hostname }};

  location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
  }
}`,
                },
                {
                  order: 3, language: "yaml", label: "Encrypt a variable with Vault inline",
                  content: `# In vars file — value was encrypted with:
# ansible-vault encrypt_string 'mysecret' --name 'db_password'
db_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  61383032303361343139616331373538...`,
                },
              ],
            },
          },
          // ── Ansible Vault ────────────────────────────────────────────────────
          {
            title: "Ansible Vault",
            description: "Encrypt and manage secrets in playbooks and var files",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Encrypt a file", content: "ansible-vault encrypt vars/secrets.yml" },
                { order: 1, language: "bash", label: "Decrypt a file", content: "ansible-vault decrypt vars/secrets.yml" },
                { order: 2, language: "bash", label: "View encrypted file without decrypting on disk", content: "ansible-vault view vars/secrets.yml" },
                { order: 3, language: "bash", label: "Edit encrypted file in-place", content: "ansible-vault edit vars/secrets.yml" },
                { order: 4, language: "bash", label: "Re-encrypt with a new password", content: "ansible-vault rekey vars/secrets.yml" },
                { order: 5, language: "bash", label: "Encrypt a single string value", content: "ansible-vault encrypt_string 'mysecretvalue' --name 'db_password'" },
                { order: 6, language: "bash", label: "Run playbook with vault password prompt", content: "ansible-playbook site.yml --ask-vault-pass" },
                { order: 7, language: "bash", label: "Run playbook with vault password file", content: "ansible-playbook site.yml --vault-password-file ~/.vault_pass" },
                { order: 8, language: "bash", label: "Use multiple vault IDs (multi-key)", content: "ansible-playbook site.yml --vault-id dev@~/.vault_dev --vault-id prod@~/.vault_prod" },
              ],
            },
          },
          // ── Roles ────────────────────────────────────────────────────────────
          {
            title: "Roles",
            description: "Create, structure and reuse Ansible roles",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Create a new role scaffold", content: "ansible-galaxy role init myrole" },
                {
                  order: 1, language: "bash", label: "Role directory structure",
                  content: `roles/myrole/
├── defaults/main.yml   # low-priority default vars
├── vars/main.yml       # high-priority role vars
├── tasks/main.yml      # task entry point
├── handlers/main.yml   # handlers
├── templates/          # Jinja2 .j2 files
├── files/              # static files to copy
├── meta/main.yml       # role dependencies
└── README.md`,
                },
                {
                  order: 2, language: "yaml", label: "Use a role in a playbook",
                  content: `- name: Deploy app
  hosts: webservers
  roles:
    - common
    - role: nginx
      vars:
        nginx_port: 443
    - role: myapp
      tags: deploy`,
                },
                { order: 3, language: "bash", label: "Install role from Ansible Galaxy", content: "ansible-galaxy role install geerlingguy.nginx" },
                { order: 4, language: "bash", label: "Install roles from requirements file", content: "ansible-galaxy install -r requirements.yml" },
                { order: 5, language: "bash", label: "List installed roles", content: "ansible-galaxy role list" },
                { order: 6, language: "bash", label: "Remove a role", content: "ansible-galaxy role remove geerlingguy.nginx" },
                {
                  order: 7, language: "yaml", label: "requirements.yml for roles and collections",
                  content: `---
roles:
  - name: geerlingguy.nginx
    version: "3.2.0"
  - src: https://github.com/myorg/myrole.git
    scm: git
    version: main

collections:
  - name: amazon.aws
    version: ">=7.0.0"
  - name: community.general`,
                },
              ],
            },
          },
          // ── Collections ──────────────────────────────────────────────────────
          {
            title: "Collections & Galaxy",
            description: "Install and manage Ansible collections",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Install a collection", content: "ansible-galaxy collection install amazon.aws" },
                { order: 1, language: "bash", label: "Install collection at specific version", content: "ansible-galaxy collection install amazon.aws:==7.2.0" },
                { order: 2, language: "bash", label: "Install collections from requirements.yml", content: "ansible-galaxy collection install -r requirements.yml" },
                { order: 3, language: "bash", label: "List installed collections", content: "ansible-galaxy collection list" },
                { order: 4, language: "bash", label: "Upgrade a collection", content: "ansible-galaxy collection install amazon.aws --upgrade" },
                { order: 5, language: "bash", label: "Build a collection tarball", content: "ansible-galaxy collection build" },
                { order: 6, language: "bash", label: "Publish collection to Galaxy", content: "ansible-galaxy collection publish myorg-mycollection-1.0.0.tar.gz --token <api-token>" },
              ],
            },
          },
          // ── Debugging & Testing ──────────────────────────────────────────────
          {
            title: "Debugging & Testing",
            description: "Lint, debug and test playbooks and roles",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Lint playbook with ansible-lint", content: "ansible-lint site.yml" },
                { order: 1, language: "bash", label: "Lint entire project", content: "ansible-lint" },
                { order: 2, language: "bash", label: "Syntax check only (no connection)", content: "ansible-playbook site.yml --syntax-check" },
                { order: 3, language: "bash", label: "List all tasks a playbook would run", content: "ansible-playbook site.yml --list-tasks" },
                { order: 4, language: "bash", label: "List all hosts a playbook targets", content: "ansible-playbook site.yml --list-hosts" },
                { order: 5, language: "bash", label: "List all tags in a playbook", content: "ansible-playbook site.yml --list-tags" },
                {
                  order: 6, language: "yaml", label: "Debug task — print variable value",
                  content: `- name: Print variable
  debug:
    var: my_variable

- name: Print message with interpolation
  debug:
    msg: "App version is {{ app_version }}, port is {{ app_port }}"

- name: Dump all host facts
  debug:
    var: hostvars[inventory_hostname]`,
                },
                {
                  order: 7, language: "yaml", label: "Assert task — fail fast on bad state",
                  content: `- name: Ensure app version is set
  assert:
    that:
      - app_version is defined
      - app_version | length > 0
      - app_port | int > 1024
    fail_msg: "app_version must be defined and app_port > 1024"
    success_msg: "Assertions passed"`,
                },
                { order: 8, language: "bash", label: "Test role with Molecule (init)", content: "molecule init scenario --driver-name docker" },
                { order: 9, language: "bash", label: "Run Molecule tests", content: "molecule test" },
                { order: 10, language: "bash", label: "Molecule converge only (no verify/destroy)", content: "molecule converge" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Ansible cheatsheet: ${ansible.name} (${ansible.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
