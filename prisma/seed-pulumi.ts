import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "Pulumi", userId: null } });

  const pulumi = await prisma.category.create({
    data: {
      name: "Pulumi",
      icon: "🏗️",
      color: "purple",
      description: "Pulumi IaC: CLI, stacks, state, secrets, config, providers, and automation API",
      isPublic: true,
      snippets: {
        create: [
          // ── CLI Basics ────────────────────────────────────────────────────
          {
            title: "CLI Basics",
            description: "Create, preview, deploy, and destroy infrastructure",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "New project",
                  content: `# Create a new project (interactive)
pulumi new

# From a template
pulumi new aws-typescript
pulumi new azure-python
pulumi new gcp-go
pulumi new kubernetes-typescript

# List available templates
pulumi new --list-templates

# Create in an existing directory
pulumi new aws-typescript --dir ./infra --name my-app --description "My infra"`,
                },
                {
                  order: 1, language: "bash", label: "Preview & deploy",
                  content: `# Preview changes (dry run)
pulumi preview

# Preview with detailed diff
pulumi preview --diff

# Deploy (up)
pulumi up

# Deploy without confirmation prompt
pulumi up --yes

# Deploy only specific resources
pulumi up --target "urn:pulumi:dev::my-app::aws:s3/bucket:Bucket::my-bucket"

# Skip resources that haven't changed
pulumi up --target-dependents

# Show expected JSON plan
pulumi preview --json`,
                },
                {
                  order: 2, language: "bash", label: "Destroy & refresh",
                  content: `# Destroy all resources in the stack
pulumi destroy

# Destroy without confirmation
pulumi destroy --yes

# Destroy specific resources
pulumi destroy --target "urn:pulumi:dev::my-app::aws:s3/bucket:Bucket::my-bucket"

# Refresh state from real cloud (reconcile drift)
pulumi refresh

# Refresh without confirmation
pulumi refresh --yes`,
                },
              ],
            },
          },
          // ── Stacks ────────────────────────────────────────────────────────
          {
            title: "Stacks",
            description: "Create, select, list, and manage stacks",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Manage stacks",
                  content: `# List all stacks in the project
pulumi stack ls

# Create a new stack
pulumi stack init dev
pulumi stack init prod

# Select (switch to) a stack
pulumi stack select dev

# Show current stack info and outputs
pulumi stack

# Show stack outputs only
pulumi stack output

# Show a specific output value
pulumi stack output bucketName

# Output as JSON
pulumi stack output --json`,
                },
                {
                  order: 1, language: "bash", label: "Copy & remove stacks",
                  content: `# Copy config from one stack to another
pulumi config cp --dest prod

# Rename a stack
pulumi stack rename staging

# Remove a stack (must be empty — destroy first)
pulumi stack rm dev

# Remove stack and all resources
pulumi destroy --yes && pulumi stack rm dev --yes`,
                },
                {
                  order: 2, language: "bash", label: "Stack tags",
                  content: `# Set a tag on the current stack
pulumi stack tag set environment production
pulumi stack tag set team backend

# Get a tag
pulumi stack tag get environment

# List all tags
pulumi stack tag ls

# Remove a tag
pulumi stack tag rm environment`,
                },
              ],
            },
          },
          // ── Config & Secrets ──────────────────────────────────────────────
          {
            title: "Config & Secrets",
            description: "Store plaintext config and encrypted secrets per stack",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Config values",
                  content: `# Set a config value
pulumi config set aws:region us-east-1
pulumi config set myApp:instanceType t3.medium

# Set for a specific stack
pulumi config set --stack prod aws:region eu-west-1

# Get a value
pulumi config get aws:region

# List all config for current stack
pulumi config

# Remove a config key
pulumi config rm myApp:instanceType`,
                },
                {
                  order: 1, language: "bash", label: "Secrets",
                  content: `# Set an encrypted secret
pulumi config set --secret dbPassword s3cr3t!
pulumi config set --secret apiKey abc123

# Read a secret (decrypted)
pulumi config get dbPassword

# List config (secrets shown as [secret])
pulumi config

# Use in TypeScript
import * as pulumi from "@pulumi/pulumi";
const cfg = new pulumi.Config();
const dbPassword = cfg.requireSecret("dbPassword");`,
                },
                {
                  order: 2, language: "bash", label: "Secret providers",
                  content: `# Default: Pulumi Cloud managed encryption
pulumi stack init dev

# AWS KMS
pulumi stack init dev --secrets-provider="awskms://alias/my-key?region=us-east-1"

# Azure Key Vault
pulumi stack init dev --secrets-provider="azurekeyvault://my-vault.vault.azure.net/keys/my-key"

# GCP KMS
pulumi stack init dev --secrets-provider="gcpkms://projects/my-proj/locations/global/keyRings/my-ring/cryptoKeys/my-key"

# Passphrase (local, no cloud dependency)
pulumi stack init dev --secrets-provider=passphrase

# Change provider on existing stack
pulumi stack change-secrets-provider "awskms://alias/my-key?region=us-east-1"`,
                },
              ],
            },
          },
          // ── State ─────────────────────────────────────────────────────────
          {
            title: "State Management",
            description: "Inspect, import, move, and repair Pulumi state",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "View & export state",
                  content: `# Export full stack state to JSON
pulumi stack export

# Export to a file
pulumi stack export --file state.json

# Import state from a file (replace current state)
pulumi stack import --file state.json

# Show all resources in state
pulumi stack --show-urns

# Get URN of a specific resource
pulumi stack --show-urns | grep BucketName`,
                },
                {
                  order: 1, language: "bash", label: "Import existing resources",
                  content: `# Import an existing cloud resource into state
# (resource must already be defined in code)
pulumi import aws:s3/bucket:Bucket my-bucket my-existing-bucket-name
pulumi import aws:ec2/instance:Instance web-server i-0abcd1234efgh5678
pulumi import azure:core/resourceGroup:ResourceGroup rg myResourceGroup

# Import in bulk from JSON file
pulumi import --file resources.json

# Protect a resource from accidental deletion
# In code (TypeScript):
# const bucket = new aws.s3.Bucket("b", {}, { protect: true });`,
                },
                {
                  order: 2, language: "bash", label: "Move & remove from state",
                  content: `# Remove a resource from state without destroying it
pulumi state delete "urn:pulumi:dev::my-app::aws:s3/bucket:Bucket::my-bucket"

# Unprotect a resource (allow deletion)
pulumi state unprotect "urn:pulumi:dev::my-app::aws:s3/bucket:Bucket::my-bucket"

# Rename / move a resource within state
pulumi state rename \\
  "urn:pulumi:dev::my-app::aws:s3/bucket:Bucket::old-name" \\
  new-name

# Move resources between stacks
pulumi state move \\
  --source dev --dest prod \\
  "urn:pulumi:dev::my-app::aws:s3/bucket:Bucket::my-bucket"`,
                },
              ],
            },
          },
          // ── Backends ──────────────────────────────────────────────────────
          {
            title: "Backends",
            description: "Switch between Pulumi Cloud, S3, Azure Blob, and local backends",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Login & backend selection",
                  content: `# Pulumi Cloud (default)
pulumi login

# Local filesystem backend
pulumi login --local

# Amazon S3
pulumi login s3://my-state-bucket
pulumi login s3://my-state-bucket/pulumi-state   # with prefix

# Azure Blob Storage
pulumi login azblob://my-container

# GCP Storage
pulumi login gs://my-state-bucket

# Check current backend
pulumi whoami -v

# Logout
pulumi logout`,
                },
              ],
            },
          },
          // ── Providers & Plugins ───────────────────────────────────────────
          {
            title: "Providers & Plugins",
            description: "Install, list, and manage provider plugins",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Plugin management",
                  content: `# Install all plugins required by the current project
pulumi plugin install

# Install a specific provider plugin
pulumi plugin install resource aws 6.0.0
pulumi plugin install resource kubernetes 4.0.0

# List installed plugins
pulumi plugin ls

# Remove a plugin
pulumi plugin rm resource aws 5.0.0

# Remove all unused plugins
pulumi plugin prune`,
                },
                {
                  order: 1, language: "bash", label: "Provider config (TypeScript)",
                  content: `import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Explicit provider (overrides stack config)
const usEast = new aws.Provider("us-east", { region: "us-east-1" });
const euWest = new aws.Provider("eu-west", { region: "eu-west-1" });

// Use a specific provider for a resource
const bucket = new aws.s3.Bucket("bucket", {}, { provider: usEast });

// Assume role
const assumedRole = new aws.Provider("assumed", {
  region: "us-east-1",
  assumeRole: { roleArn: "arn:aws:iam::123456789:role/DeployRole" },
});`,
                },
              ],
            },
          },
          // ── Resource Options ──────────────────────────────────────────────
          {
            title: "Resource Options",
            description: "dependsOn, protect, ignoreChanges, aliases, transformations",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Common resource options (TypeScript)",
                  content: `import * as aws from "@pulumi/aws";

const bucket = new aws.s3.Bucket("bucket", {
  bucket: "my-bucket",
}, {
  // Prevent accidental deletion
  protect: true,

  // Ignore drift on specific properties
  ignoreChanges: ["tags", "lifecycleRules"],

  // Explicit ordering
  dependsOn: [otherResource],

  // Delete old resource before creating new one
  deleteBeforeReplace: true,

  // Custom timeout
  customTimeouts: {
    create: "10m",
    update: "10m",
    delete: "5m",
  },
});`,
                },
                {
                  order: 1, language: "bash", label: "aliases, parent & import",
                  content: `import * as aws from "@pulumi/aws";

// Alias: rename a resource without destroying + recreating
const bucket = new aws.s3.Bucket("new-name", {}, {
  aliases: [{ name: "old-name" }],
});

// Parent: model logical hierarchy
const bucket = new aws.s3.Bucket("bucket", {});
const policy = new aws.s3.BucketPolicy("policy", {
  bucket: bucket.id,
  policy: "...",
}, { parent: bucket });

// Import existing resource (run once, then remove)
const existing = new aws.s3.Bucket("imported", {
  bucket: "already-exists",
}, { import: "already-exists" });`,
                },
              ],
            },
          },
          // ── Stack References ──────────────────────────────────────────────
          {
            title: "Stack References",
            description: "Share outputs between stacks",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "StackReference (TypeScript)",
                  content: `import * as pulumi from "@pulumi/pulumi";

// Reference another stack's outputs
const networkStack = new pulumi.StackReference("acme/network/prod");

// Get a typed output value
const vpcId = networkStack.getOutput("vpcId");
const subnetIds = networkStack.requireOutput("subnetIds");

// Use the output in a resource
const cluster = new aws.ecs.Cluster("cluster", {
  // outputs are pulumi.Output<T> — use .apply() to transform
  tags: { vpcId: vpcId.apply(id => String(id)) },
});

// Self-referencing current project/stack
const currentStack = pulumi.getStack();       // "prod"
const currentProject = pulumi.getProject();   // "my-app"
const currentOrg = pulumi.getOrganization();  // "acme"`,
                },
              ],
            },
          },
          // ── Component Resources ───────────────────────────────────────────
          {
            title: "Component Resources",
            description: "Build reusable abstractions over multiple resources",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "ComponentResource (TypeScript)",
                  content: `import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface StaticSiteArgs {
  indexDocument?: string;
}

class StaticSite extends pulumi.ComponentResource {
  public readonly bucketName: pulumi.Output<string>;
  public readonly websiteUrl: pulumi.Output<string>;

  constructor(name: string, args: StaticSiteArgs, opts?: pulumi.ComponentResourceOptions) {
    super("my:web:StaticSite", name, {}, opts);

    const bucket = new aws.s3.Bucket(\`\${name}-bucket\`, {
      website: { indexDocument: args.indexDocument ?? "index.html" },
    }, { parent: this });

    this.bucketName = bucket.id;
    this.websiteUrl = bucket.websiteEndpoint;

    // Required: register all child outputs
    this.registerOutputs({
      bucketName: this.bucketName,
      websiteUrl: this.websiteUrl,
    });
  }
}

// Use it
const site = new StaticSite("my-site", { indexDocument: "index.html" });
export const url = site.websiteUrl;`,
                },
              ],
            },
          },
          // ── Automation API ────────────────────────────────────────────────
          {
            title: "Automation API",
            description: "Drive Pulumi programmatically from TypeScript/Python",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "typescript", label: "Inline program (TypeScript)",
                  content: `import * as auto from "@pulumi/pulumi/automation";
import * as aws from "@pulumi/aws";

const program = async () => {
  const bucket = new aws.s3.Bucket("auto-bucket", {
    acl: "private",
  });
  return { bucketName: bucket.id };
};

async function main() {
  const stack = await auto.LocalWorkspace.createOrSelectStack({
    stackName: "dev",
    projectName: "automation-example",
    program,
  });

  // Set config
  await stack.setConfig("aws:region", { value: "us-east-1" });

  // Preview
  await stack.preview({ onOutput: console.log });

  // Deploy
  const upResult = await stack.up({ onOutput: console.log });
  console.log("Bucket:", upResult.outputs.bucketName.value);

  // Destroy
  await stack.destroy({ onOutput: console.log });
}

main().catch(console.error);`,
                },
                {
                  order: 1, language: "python", label: "Inline program (Python)",
                  content: `import pulumi
import pulumi_aws as aws
from pulumi import automation as auto

def pulumi_program():
    bucket = aws.s3.Bucket("auto-bucket")
    pulumi.export("bucket_name", bucket.id)

stack = auto.create_or_select_stack(
    stack_name="dev",
    project_name="automation-example",
    program=pulumi_program,
)

stack.set_config("aws:region", auto.ConfigValue("us-east-1"))

print("Previewing...")
stack.preview(on_output=print)

print("Deploying...")
up_res = stack.up(on_output=print)
print("Bucket:", up_res.outputs["bucket_name"].value)`,
                },
              ],
            },
          },
          // ── Useful Commands ───────────────────────────────────────────────
          {
            title: "Useful Commands & Tips",
            description: "Logs, watch mode, policy packs, and CI integration",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Logs & watch",
                  content: `# Stream resource logs
pulumi logs

# Follow logs in real time
pulumi logs --follow

# Filter by resource name
pulumi logs --resource myFunction

# Watch mode: auto-deploy on code changes
pulumi watch`,
                },
                {
                  order: 1, language: "bash", label: "Policy as code (CrossGuard)",
                  content: `# Create a policy pack
pulumi policy new aws-typescript

# Run policy against a stack (local — no publish)
pulumi preview --policy-pack ./policy

# Publish a policy pack to Pulumi Cloud
pulumi policy publish

# Enable a published policy on a stack
pulumi policy enable acme/aws-policies latest --stack dev

# Disable a policy
pulumi policy disable acme/aws-policies --stack dev`,
                },
                {
                  order: 2, language: "bash", label: "CI / non-interactive usage",
                  content: `# Authenticate with access token (set in CI env)
export PULUMI_ACCESS_TOKEN=pul-abc123...

# Non-interactive deploy
pulumi up --yes --skip-preview

# Non-interactive destroy
pulumi destroy --yes

# Exit codes: 0=success, 1=error, 2=no changes (preview)
pulumi preview; echo "Exit: $?"

# Suppress colors for CI logs
pulumi up --yes --color never

# Set concurrency for resource operations
pulumi up --parallel 20`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Pulumi cheatsheet: ${pulumi.name} (${pulumi.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
