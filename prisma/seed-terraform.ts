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
    where: { name: "Terraform", userId: admin.id },
  });

  const tf = await prisma.category.create({
    data: {
      name: "Terraform",
      icon: "🏗️",
      color: "purple",
      description: "Terraform CLI commands and HCL patterns for infrastructure as code",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Core Workflow ────────────────────────────────────────────────────
          {
            title: "Core Workflow",
            description: "The essential init → plan → apply → destroy lifecycle",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Initialize working directory", content: "terraform init" },
                { order: 1, language: "bash", label: "Re-init and upgrade providers", content: "terraform init -upgrade" },
                { order: 2, language: "bash", label: "Validate configuration", content: "terraform validate" },
                { order: 3, language: "bash", label: "Format all .tf files", content: "terraform fmt -recursive" },
                { order: 4, language: "bash", label: "Plan changes", content: "terraform plan" },
                { order: 5, language: "bash", label: "Plan and save to file", content: "terraform plan -out=tfplan" },
                { order: 6, language: "bash", label: "Apply saved plan", content: "terraform apply tfplan" },
                { order: 7, language: "bash", label: "Apply without confirmation prompt", content: "terraform apply -auto-approve" },
                { order: 8, language: "bash", label: "Destroy all resources", content: "terraform destroy" },
                { order: 9, language: "bash", label: "Destroy without confirmation prompt", content: "terraform destroy -auto-approve" },
              ],
            },
          },
          // ── Targeting & Partial Changes ──────────────────────────────────────
          {
            title: "Targeting & Partial Changes",
            description: "Apply or destroy specific resources without touching everything",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Plan only a specific resource", content: "terraform plan -target=aws_instance.web" },
                { order: 1, language: "bash", label: "Apply only a specific resource", content: "terraform apply -target=aws_instance.web" },
                { order: 2, language: "bash", label: "Destroy only a specific resource", content: "terraform destroy -target=aws_instance.web" },
                { order: 3, language: "bash", label: "Target a module", content: "terraform apply -target=module.vpc" },
                { order: 4, language: "bash", label: "Replace (taint) a resource", content: "terraform apply -replace=aws_instance.web" },
              ],
            },
          },
          // ── State Management ─────────────────────────────────────────────────
          {
            title: "State Management",
            description: "Inspect, move, import and manipulate Terraform state",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List all resources in state", content: "terraform state list" },
                { order: 1, language: "bash", label: "Show a specific resource in state", content: "terraform state show aws_instance.web" },
                { order: 2, language: "bash", label: "Move resource in state (rename)", content: "terraform state mv aws_instance.old aws_instance.new" },
                { order: 3, language: "bash", label: "Remove resource from state (keep real infra)", content: "terraform state rm aws_instance.web" },
                { order: 4, language: "bash", label: "Pull remote state to stdout", content: "terraform state pull" },
                { order: 5, language: "bash", label: "Push local state to remote", content: "terraform state push terraform.tfstate" },
                { order: 6, language: "bash", label: "Import existing resource into state", content: "terraform import aws_instance.web i-1234567890abcdef0" },
                { order: 7, language: "bash", label: "Show full state as JSON", content: "terraform show -json | jq ." },
                { order: 8, language: "bash", label: "Unlock stuck state", content: "terraform force-unlock <lock-id>" },
              ],
            },
          },
          // ── Variables & Outputs ──────────────────────────────────────────────
          {
            title: "Variables & Outputs",
            description: "Pass variables in and read outputs out",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Pass variable on CLI", content: "terraform apply -var='instance_type=t3.medium'" },
                { order: 1, language: "bash", label: "Pass variables from file", content: "terraform apply -var-file=prod.tfvars" },
                { order: 2, language: "bash", label: "Show all outputs", content: "terraform output" },
                { order: 3, language: "bash", label: "Get a specific output value", content: "terraform output instance_ip" },
                { order: 4, language: "bash", label: "Get output as raw string (no quotes)", content: "terraform output -raw instance_ip" },
                { order: 5, language: "bash", label: "Get output as JSON", content: "terraform output -json" },
                {
                  order: 6, language: "hcl", label: "Variable with validation (HCL)",
                  content: `variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}`,
                },
                {
                  order: 7, language: "hcl", label: "Sensitive output (HCL)",
                  content: `output "db_password" {
  value     = aws_db_instance.main.password
  sensitive = true
}`,
                },
              ],
            },
          },
          // ── Workspaces ───────────────────────────────────────────────────────
          {
            title: "Workspaces",
            description: "Manage multiple state environments with workspaces",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List workspaces", content: "terraform workspace list" },
                { order: 1, language: "bash", label: "Show current workspace", content: "terraform workspace show" },
                { order: 2, language: "bash", label: "Create workspace", content: "terraform workspace new staging" },
                { order: 3, language: "bash", label: "Switch workspace", content: "terraform workspace select prod" },
                { order: 4, language: "bash", label: "Delete workspace", content: "terraform workspace delete staging" },
                {
                  order: 5, language: "hcl", label: "Use workspace name in config (HCL)",
                  content: `resource "aws_s3_bucket" "data" {
  bucket = "my-app-\${terraform.workspace}-data"
}`,
                },
              ],
            },
          },
          // ── Providers & Modules ──────────────────────────────────────────────
          {
            title: "Providers & Modules",
            description: "Lock, install and manage providers and modules",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List installed providers", content: "terraform providers" },
                { order: 1, language: "bash", label: "Lock provider versions", content: "terraform providers lock -platform=linux_amd64 -platform=darwin_arm64" },
                { order: 2, language: "bash", label: "Download modules and providers", content: "terraform get" },
                { order: 3, language: "bash", label: "Update modules to latest matching version", content: "terraform get -update" },
                {
                  order: 4, language: "hcl", label: "Provider version constraints (HCL)",
                  content: `terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}`,
                },
                {
                  order: 5, language: "hcl", label: "Call a child module (HCL)",
                  content: `module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
}`,
                },
              ],
            },
          },
          // ── Remote Backends ──────────────────────────────────────────────────
          {
            title: "Remote Backends",
            description: "Configure S3 and Terraform Cloud backends for shared state",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "hcl", label: "S3 backend with DynamoDB locking (HCL)",
                  content: `terraform {
  backend "s3" {
    bucket         = "my-tf-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}`,
                },
                {
                  order: 1, language: "hcl", label: "Terraform Cloud backend (HCL)",
                  content: `terraform {
  cloud {
    organization = "my-org"

    workspaces {
      name = "my-app-prod"
    }
  }
}`,
                },
                { order: 2, language: "bash", label: "Migrate state to new backend", content: "terraform init -migrate-state" },
                { order: 3, language: "bash", label: "Reconfigure backend (skip state migration)", content: "terraform init -reconfigure" },
              ],
            },
          },
          // ── Common HCL Patterns ──────────────────────────────────────────────
          {
            title: "Common HCL Patterns",
            description: "Loops, conditionals, locals and dynamic blocks",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "hcl", label: "for_each over a map",
                  content: `variable "buckets" {
  default = {
    logs    = "us-east-1"
    backups = "us-west-2"
  }
}

resource "aws_s3_bucket" "this" {
  for_each = var.buckets
  bucket   = "my-app-\${each.key}"
  region   = each.value
}`,
                },
                {
                  order: 1, language: "hcl", label: "count with conditional",
                  content: `resource "aws_eip" "nat" {
  count  = var.environment == "prod" ? 1 : 0
  domain = "vpc"
}`,
                },
                {
                  order: 2, language: "hcl", label: "locals block",
                  content: `locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  is_prod = var.environment == "prod"
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = local.is_prod ? "t3.large" : "t3.micro"
  tags          = local.common_tags
}`,
                },
                {
                  order: 3, language: "hcl", label: "dynamic block",
                  content: `variable "ingress_rules" {
  default = [
    { port = 80,  cidr = "0.0.0.0/0" },
    { port = 443, cidr = "0.0.0.0/0" },
  ]
}

resource "aws_security_group" "web" {
  name = "web-sg"

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = "tcp"
      cidr_blocks = [ingress.value.cidr]
    }
  }
}`,
                },
                {
                  order: 4, language: "hcl", label: "depends_on and lifecycle",
                  content: `resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  depends_on = [aws_iam_role_policy.app]

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [ami]
    prevent_destroy       = true
  }
}`,
                },
                {
                  order: 5, language: "hcl", label: "Data source lookup",
                  content: `data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
}`,
                },
              ],
            },
          },
          // ── Debugging & Inspection ───────────────────────────────────────────
          {
            title: "Debugging & Inspection",
            description: "Inspect expressions, enable logging and troubleshoot plans",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Interactive console (evaluate expressions)", content: "terraform console" },
                { order: 1, language: "bash", label: "Show planned changes as JSON", content: "terraform plan -out=tfplan && terraform show -json tfplan | jq ." },
                { order: 2, language: "bash", label: "Enable detailed logging", content: "TF_LOG=DEBUG terraform apply" },
                { order: 3, language: "bash", label: "Log to file", content: "TF_LOG=INFO TF_LOG_PATH=./tf.log terraform plan" },
                { order: 4, language: "bash", label: "Graph resource dependencies", content: "terraform graph | dot -Tsvg > graph.svg" },
                { order: 5, language: "hcl", label: "Print value during plan with check (HCL)", content: `check "bucket_name_valid" {
  assert {
    condition     = length(var.bucket_name) <= 63
    error_message = "S3 bucket name must be 63 characters or fewer."
  }
}` },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Terraform cheatsheet: ${tf.name} (${tf.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
