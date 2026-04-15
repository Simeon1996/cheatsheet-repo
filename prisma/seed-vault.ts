import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "HashiCorp Vault", userId: null } });

  const vault = await prisma.category.create({
    data: {
      name: "HashiCorp Vault",
      icon: "🔐",
      color: "orange",
      description: "HashiCorp Vault: secrets engines, auth methods, policies, dynamic secrets, PKI, encryption, and CLI",
      isPublic: true,
      snippets: {
        create: [
          // ── vault CLI ─────────────────────────────────────────────────────
          {
            title: "vault CLI",
            description: "Core vault commands: server, init, unseal, status, and login",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Server & init",
                  content: `# Start a dev server (in-memory, auto-unsealed — NOT for production)
vault server -dev -dev-root-token-id="root"

# Start with a config file
vault server -config=/etc/vault.d/vault.hcl

# Initialize a new Vault cluster (first time only)
vault operator init
# Outputs 5 unseal keys + 1 root token — store these securely!

# Initialize with custom key shares and threshold
vault operator init -key-shares=3 -key-threshold=2

# Check Vault status
vault status`,
                },
                {
                  order: 1, language: "bash", label: "Unseal & seal",
                  content: `# Unseal Vault (run multiple times with different keys until threshold met)
vault operator unseal <unseal-key-1>
vault operator unseal <unseal-key-2>

# Seal Vault immediately (emergency shutdown)
vault operator seal

# Rekey — replace unseal keys with new ones
vault operator rekey -init -key-shares=5 -key-threshold=3
vault operator rekey <existing-unseal-key>

# Generate a new root token (requires quorum of unseal keys)
vault operator generate-root -init
vault operator generate-root <unseal-key>`,
                },
                {
                  order: 2, language: "bash", label: "Login & environment",
                  content: `# Set Vault address (or export VAULT_ADDR)
export VAULT_ADDR='https://vault.example.com:8200'
export VAULT_TOKEN='hvs.xxxxxxxxxxxx'
export VAULT_NAMESPACE='admin'         # Vault Enterprise

# Login with token
vault login hvs.xxxxxxxxxxxx

# Login with different auth methods
vault login -method=userpass username=alice
vault login -method=ldap username=alice
vault login -method=aws

# Check current token info
vault token lookup

# Revoke current token
vault token revoke -self

# Output as JSON
vault status -format=json`,
                },
              ],
            },
          },

          // ── KV Secrets Engine ─────────────────────────────────────────────
          {
            title: "KV Secrets Engine",
            description: "Key/Value secrets engine v1 and v2 (versioned)",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "KV v2 (versioned)",
                  content: `# Enable KV v2 at a path
vault secrets enable -path=secret kv-v2

# Write a secret
vault kv put secret/myapp/config db_user=admin db_pass=s3cr3t

# Read a secret
vault kv get secret/myapp/config

# Get a specific field
vault kv get -field=db_pass secret/myapp/config

# Get as JSON
vault kv get -format=json secret/myapp/config | jq '.data.data'

# Update (creates new version)
vault kv put secret/myapp/config db_user=admin db_pass=newpass

# Patch (update only specified fields)
vault kv patch secret/myapp/config db_pass=updated

# List secrets at a path
vault kv list secret/myapp

# Delete latest version (soft delete)
vault kv delete secret/myapp/config

# Undelete (restore) a version
vault kv undelete -versions=2 secret/myapp/config

# Destroy specific versions permanently
vault kv destroy -versions=1,2 secret/myapp/config`,
                },
                {
                  order: 1, language: "bash", label: "KV versioning",
                  content: `# Read a specific version
vault kv get -version=2 secret/myapp/config

# View version metadata
vault kv metadata get secret/myapp/config

# Set max versions to keep
vault kv metadata put -max-versions=10 secret/myapp/config

# Set delete-version-after (auto-expire versions)
vault kv metadata put -delete-version-after=72h secret/myapp/config

# Rollback to a previous version
vault kv rollback -version=3 secret/myapp/config

# Delete all versions and metadata permanently
vault kv metadata delete secret/myapp/config`,
                },
              ],
            },
          },

          // ── Dynamic Secrets ───────────────────────────────────────────────
          {
            title: "Dynamic Secrets",
            description: "Database and AWS dynamic credentials with automatic rotation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Database secrets engine",
                  content: `# Enable the database secrets engine
vault secrets enable database

# Configure a PostgreSQL connection
vault write database/config/mypostgres \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,readwrite" \
  connection_url="postgresql://{{username}}:{{password}}@db.example.com:5432/mydb" \
  username="vault_admin" \
  password="vault_admin_pass"

# Rotate the root credentials (Vault takes over)
vault write -force database/rotate-root/mypostgres

# Create a role that generates short-lived credentials
vault write database/roles/readonly \
  db_name=mypostgres \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"

# Generate dynamic credentials
vault read database/creds/readonly
# => username: v-readonly-xyz123
# => password: A1b2C3d4...
# => lease_duration: 1h`,
                },
                {
                  order: 1, language: "bash", label: "AWS secrets engine",
                  content: `# Enable the AWS secrets engine
vault secrets enable aws

# Configure with IAM credentials
vault write aws/config/root \
  access_key=AKIAIOSFODNN7EXAMPLE \
  secret_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY \
  region=us-east-1

# Create a role for dynamic IAM user credentials
vault write aws/roles/s3-reader \
  credential_type=iam_user \
  policy_document=-<<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": "*"
  }]
}
EOF

# Generate credentials
vault read aws/creds/s3-reader

# Assume role (no long-lived IAM user created)
vault write aws/roles/deployer \
  credential_type=assumed_role \
  role_arns=arn:aws:iam::123456789012:role/DeployRole

vault read aws/sts/deployer`,
                },
              ],
            },
          },

          // ── Auth Methods ──────────────────────────────────────────────────
          {
            title: "Auth Methods",
            description: "Enabling and configuring auth methods: token, AppRole, Kubernetes, AWS, LDAP",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Token auth",
                  content: `# Create a token with a policy
vault token create -policy=readonly -ttl=1h

# Create a periodic token (never expires if renewed)
vault token create -policy=readonly -period=24h

# Create an orphan token (no parent)
vault token create -orphan -policy=readonly

# Renew a token
vault token renew hvs.xxxxxxxxxxxx

# Revoke a token and all its children
vault token revoke hvs.xxxxxxxxxxxx

# Look up token details
vault token lookup hvs.xxxxxxxxxxxx

# Create a token with use limit
vault token create -policy=readonly -use-limit=5`,
                },
                {
                  order: 1, language: "bash", label: "AppRole auth",
                  content: `# Enable AppRole auth method
vault auth enable approle

# Create a named role
vault write auth/approle/role/myapp \
  token_policies="myapp-policy" \
  token_ttl=1h \
  token_max_ttl=4h \
  secret_id_ttl=10m \
  secret_id_num_uses=1

# Get the Role ID (static — embed in your app config)
vault read auth/approle/role/myapp/role-id

# Generate a Secret ID (dynamic — deliver securely at runtime)
vault write -force auth/approle/role/myapp/secret-id

# Login with Role ID + Secret ID
vault write auth/approle/login \
  role_id=<role-id> \
  secret_id=<secret-id>

# Lookup a SecretID accessor
vault write auth/approle/role/myapp/secret-id/lookup \
  secret_id_accessor=<accessor>`,
                },
                {
                  order: 2, language: "bash", label: "Kubernetes auth",
                  content: `# Enable Kubernetes auth method
vault auth enable kubernetes

# Configure with the cluster's API server
vault write auth/kubernetes/config \
  kubernetes_host=https://kubernetes.default.svc \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt \
  token_reviewer_jwt=@/var/run/secrets/kubernetes.io/serviceaccount/token

# Create a role binding a ServiceAccount to a Vault policy
vault write auth/kubernetes/role/myapp \
  bound_service_account_names=myapp-sa \
  bound_service_account_namespaces=production \
  token_policies=myapp-policy \
  token_ttl=1h

# Login from within a pod
vault write auth/kubernetes/login \
  role=myapp \
  jwt=@/var/run/secrets/kubernetes.io/serviceaccount/token`,
                },
                {
                  order: 3, language: "bash", label: "AWS & LDAP auth",
                  content: `# Enable AWS auth (IAM-based — no credentials needed in EC2/ECS/Lambda)
vault auth enable aws

vault write auth/aws/config/client \
  access_key=AKIAIOSFODNN7EXAMPLE \
  secret_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

vault write auth/aws/role/ec2-role \
  auth_type=iam \
  bound_iam_principal_arn=arn:aws:iam::123456789012:role/EC2Role \
  policies=ec2-policy \
  token_ttl=1h

# Login (typically done by Vault Agent or SDK)
vault login -method=aws role=ec2-role

# Enable LDAP auth
vault auth enable ldap

vault write auth/ldap/config \
  url="ldaps://ldap.example.com" \
  userdn="ou=users,dc=example,dc=com" \
  groupdn="ou=groups,dc=example,dc=com" \
  binddn="cn=vault,ou=service,dc=example,dc=com" \
  bindpass="ldap_bind_pass" \
  userattr="uid"

vault write auth/ldap/groups/engineering policies=engineering-policy`,
                },
              ],
            },
          },

          // ── Policies ──────────────────────────────────────────────────────
          {
            title: "Policies",
            description: "Writing and managing HCL policies for access control",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "hcl", label: "Policy HCL syntax",
                  content: `# /etc/vault/policies/myapp.hcl

# Allow reading specific secrets
path "secret/data/myapp/*" {
  capabilities = ["read", "list"]
}

# Allow full access to own namespace
path "secret/data/myapp/config" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow generating database credentials
path "database/creds/readonly" {
  capabilities = ["read"]
}

# Allow renewing own token
path "auth/token/renew-self" {
  capabilities = ["update"]
}

# Allow looking up own token
path "auth/token/lookup-self" {
  capabilities = ["read"]
}

# Deny access explicitly (takes precedence)
path "secret/data/admin/*" {
  capabilities = ["deny"]
}`,
                },
                {
                  order: 1, language: "bash", label: "Policy management",
                  content: `# Write a policy from file
vault policy write myapp /etc/vault/policies/myapp.hcl

# Write a policy from stdin
vault policy write readonly - <<EOF
path "secret/data/*" {
  capabilities = ["read", "list"]
}
EOF

# List all policies
vault policy list

# Read a policy
vault policy read myapp

# Delete a policy
vault policy delete myapp

# Test what a token can access (requires Vault Enterprise or root)
vault token capabilities secret/data/myapp/config

# Check capabilities of the current token
vault token capabilities secret/data/myapp/config`,
                },
              ],
            },
          },

          // ── PKI Secrets Engine ────────────────────────────────────────────
          {
            title: "PKI Secrets Engine",
            description: "Internal CA, certificate issuance, and rotation with the PKI engine",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Setup CA hierarchy",
                  content: `# Enable PKI for root CA
vault secrets enable -path=pki pki
vault secrets tune -max-lease-ttl=87600h pki   # 10 years

# Generate root CA
vault write -field=certificate pki/root/generate/internal \
  common_name="Example Root CA" \
  ttl=87600h > root_ca.crt

# Configure CRL and issuing URLs
vault write pki/config/urls \
  issuing_certificates="https://vault.example.com:8200/v1/pki/ca" \
  crl_distribution_points="https://vault.example.com:8200/v1/pki/crl"

# Enable PKI for intermediate CA
vault secrets enable -path=pki_int pki
vault secrets tune -max-lease-ttl=43800h pki_int  # 5 years

# Generate intermediate CSR
vault write -format=json pki_int/intermediate/generate/internal \
  common_name="Example Intermediate CA" | jq -r '.data.csr' > int_ca.csr

# Sign intermediate with root
vault write -format=json pki/root/sign-intermediate \
  csr=@int_ca.csr format=pem_bundle ttl=43800h \
  | jq -r '.data.certificate' > int_ca.crt

# Set the signed intermediate certificate
vault write pki_int/intermediate/set-signed certificate=@int_ca.crt`,
                },
                {
                  order: 1, language: "bash", label: "Issue certificates",
                  content: `# Create a role for issuing certs
vault write pki_int/roles/example-dot-com \
  allowed_domains="example.com" \
  allow_subdomains=true \
  max_ttl=72h \
  require_cn=false

# Issue a certificate
vault write pki_int/issue/example-dot-com \
  common_name="api.example.com" \
  ttl=24h

# Issue with SANs
vault write pki_int/issue/example-dot-com \
  common_name="api.example.com" \
  alt_names="api-internal.example.com,localhost" \
  ip_sans="10.0.1.10" \
  ttl=24h

# Sign an external CSR
vault write pki_int/sign/example-dot-com \
  csr=@myapp.csr \
  common_name="myapp.example.com" \
  ttl=24h

# Revoke a certificate by serial number
vault write pki_int/revoke serial_number=<serial>

# Rotate CRL manually
vault write pki_int/crl/rotate`,
                },
              ],
            },
          },

          // ── Transit (EaaS) ────────────────────────────────────────────────
          {
            title: "Transit (Encryption as a Service)",
            description: "Encrypt, decrypt, sign, and verify data without storing it in Vault",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Encrypt & decrypt",
                  content: `# Enable the transit secrets engine
vault secrets enable transit

# Create an encryption key
vault write -f transit/keys/myapp-key

# Create an AES-256-GCM key with convergent encryption
vault write transit/keys/myapp-key \
  type=aes256-gcm96 \
  convergent_encryption=true \
  derived=true

# Encrypt plaintext (must be base64-encoded)
vault write transit/encrypt/myapp-key \
  plaintext=$(echo -n "my secret value" | base64)
# => ciphertext: vault:v1:ABCdef...

# Decrypt ciphertext
vault write transit/decrypt/myapp-key \
  ciphertext="vault:v1:ABCdef..."
# => plaintext: base64-encoded result
echo "base64-result" | base64 --decode

# Batch encrypt multiple values
vault write transit/encrypt/myapp-key \
  batch_input='[{"plaintext":"dmFsdWUx"},{"plaintext":"dmFsdWUy"}]'`,
                },
                {
                  order: 1, language: "bash", label: "Key rotation & signing",
                  content: `# Rotate the encryption key (new version created, old still decrypts)
vault write -f transit/keys/myapp-key/rotate

# Update minimum decryption version (retire old key versions)
vault write transit/keys/myapp-key/config \
  min_decryption_version=2

# Rewrap ciphertext to latest key version
vault write transit/rewrap/myapp-key \
  ciphertext="vault:v1:ABCdef..."

# Create an ECDSA signing key
vault write -f transit/keys/signing-key type=ecdsa-p256

# Sign data
vault write transit/sign/signing-key \
  input=$(echo -n "data to sign" | base64)
# => signature: vault:v1:MEUCIQDx...

# Verify a signature
vault write transit/verify/signing-key \
  input=$(echo -n "data to sign" | base64) \
  signature="vault:v1:MEUCIQDx..."

# Generate an HMAC
vault write transit/hmac/myapp-key \
  input=$(echo -n "data" | base64)`,
                },
              ],
            },
          },

          // ── Leases & Renewal ──────────────────────────────────────────────
          {
            title: "Leases & Renewal",
            description: "Managing secret leases, renewal, and revocation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Lease management",
                  content: `# List all leases for a path
vault list sys/leases/lookup/database/creds/readonly

# Look up a specific lease
vault write sys/leases/lookup \
  lease_id="database/creds/readonly/abc123"

# Renew a lease
vault lease renew database/creds/readonly/abc123

# Renew with specific increment (in seconds)
vault lease renew -increment=3600 database/creds/readonly/abc123

# Revoke a specific lease immediately
vault lease revoke database/creds/readonly/abc123

# Revoke all leases under a prefix
vault lease revoke -prefix database/creds/readonly

# Force-revoke (ignore errors)
vault lease revoke -force -prefix database/creds/readonly`,
                },
              ],
            },
          },

          // ── Vault Agent ───────────────────────────────────────────────────
          {
            title: "Vault Agent",
            description: "Vault Agent for auto-auth, secret templating, and caching",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "hcl", label: "Agent config",
                  content: `# /etc/vault-agent/agent.hcl

vault {
  address = "https://vault.example.com:8200"
}

# Auto-auth using Kubernetes service account
auto_auth {
  method "kubernetes" {
    mount_path = "auth/kubernetes"
    config = {
      role = "myapp"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/vault-token"
    }
  }
}

# Cache secrets locally (reduces load on Vault)
cache {
  use_auto_auth_token = true
}

listener "tcp" {
  address     = "127.0.0.1:8007"
  tls_disable = true
}

# Template — render secrets to disk
template {
  source      = "/etc/vault-agent/templates/db.ctmpl"
  destination = "/etc/myapp/db.env"
  perms       = "0640"
  command     = "systemctl reload myapp"
}`,
                },
                {
                  order: 1, language: "bash", label: "Template syntax",
                  content: `# /etc/vault-agent/templates/db.ctmpl
# Uses Consul Template syntax

{{- with secret "secret/data/myapp/config" -}}
DB_HOST={{ .Data.data.db_host }}
DB_USER={{ .Data.data.db_user }}
DB_PASS={{ .Data.data.db_pass }}
{{- end }}

# Dynamic database credentials (auto-renewed)
{{- with secret "database/creds/readonly" -}}
DB_USERNAME={{ .Data.username }}
DB_PASSWORD={{ .Data.password }}
{{- end }}

# PKI certificate
{{- with secret "pki_int/issue/example-dot-com" "common_name=myapp.example.com" "ttl=24h" -}}
{{ .Data.certificate }}
{{ .Data.private_key }}
{{- end }}

# Run Vault Agent
# vault agent -config=/etc/vault-agent/agent.hcl`,
                },
              ],
            },
          },

          // ── Secrets Engine Management ─────────────────────────────────────
          {
            title: "Secrets Engine Management",
            description: "Enabling, tuning, moving, and auditing secrets engines",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Manage secrets engines",
                  content: `# List all enabled secrets engines
vault secrets list

# List with details
vault secrets list -detailed

# Enable a secrets engine at a custom path
vault secrets enable -path=myapp/kv kv-v2

# Tune a secrets engine (e.g., default lease TTL)
vault secrets tune \
  -default-lease-ttl=1h \
  -max-lease-ttl=24h \
  secret/

# Move a secrets engine (preserves data)
vault secrets move secret/ secret-old/

# Disable a secrets engine (DESTROYS all data at that path)
vault secrets disable secret/

# Enable audit logging to a file
vault audit enable file file_path=/var/log/vault/audit.log

# Enable audit logging to syslog
vault audit enable syslog

# List audit devices
vault audit list`,
                },
                {
                  order: 1, language: "bash", label: "Sys & health",
                  content: `# Check Vault health (no auth required)
curl -s https://vault.example.com:8200/v1/sys/health | jq

# List all mounted paths (sys/mounts)
vault read sys/mounts

# Read Vault configuration
vault read sys/config/state/sanitized

# View current HA leader
vault operator raft list-peers         # Integrated storage (Raft)

# Take a snapshot of Raft storage
vault operator raft snapshot save vault-backup.snap

# Restore from snapshot
vault operator raft snapshot restore vault-backup.snap

# Step down as leader
vault operator step-down`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created HashiCorp Vault cheatsheet: ${vault.name} (${vault.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
