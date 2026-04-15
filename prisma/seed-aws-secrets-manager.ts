import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "AWS Secrets Manager", userId: null } });

  const asm = await prisma.category.create({
    data: {
      name: "AWS Secrets Manager",
      icon: "🔑",
      color: "yellow",
      description: "AWS Secrets Manager: create, rotate, replicate, and retrieve secrets; resource policies; Lambda rotation; and SDK patterns",
      isPublic: true,
      snippets: {
        create: [
          // ── Create & manage secrets ───────────────────────────────────────
          {
            title: "Create & Manage Secrets",
            description: "Creating, updating, tagging, and deleting secrets via the AWS CLI",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create a secret",
                  content: `# Create a plain string secret
aws secretsmanager create-secret \
  --name myapp/prod/api-key \
  --description "Production API key for myapp" \
  --secret-string "s3cr3t-api-key"

# Create a JSON secret (recommended for structured data)
aws secretsmanager create-secret \
  --name myapp/prod/db \
  --description "Production database credentials" \
  --secret-string '{"username":"admin","password":"s3cr3t","host":"db.example.com","port":5432,"dbname":"myapp"}'

# Create from a file
aws secretsmanager create-secret \
  --name myapp/prod/tls-cert \
  --secret-string file://cert.pem

# Create with a customer-managed KMS key
aws secretsmanager create-secret \
  --name myapp/prod/db \
  --kms-key-id arn:aws:kms:us-east-1:123456789012:key/mrk-abc123 \
  --secret-string '{"password":"s3cr3t"}'

# Create with tags
aws secretsmanager create-secret \
  --name myapp/prod/db \
  --secret-string '{"password":"s3cr3t"}' \
  --tags Key=env,Value=prod Key=team,Value=platform`,
                },
                {
                  order: 1, language: "bash", label: "Update & describe",
                  content: `# Update the secret value (creates a new version)
aws secretsmanager put-secret-value \
  --secret-id myapp/prod/db \
  --secret-string '{"username":"admin","password":"newpassword"}'

# Update with a client request token (idempotency key)
aws secretsmanager put-secret-value \
  --secret-id myapp/prod/db \
  --client-request-token "deploy-2024-01-01" \
  --secret-string '{"password":"newpass"}'

# Describe a secret (metadata, no value)
aws secretsmanager describe-secret \
  --secret-id myapp/prod/db

# List all secrets
aws secretsmanager list-secrets

# Filter by tag or name prefix
aws secretsmanager list-secrets \
  --filters Key=name,Values=myapp/prod Key=tag-key,Values=env

# List versions of a secret
aws secretsmanager list-secret-version-ids \
  --secret-id myapp/prod/db`,
                },
                {
                  order: 2, language: "bash", label: "Delete & restore",
                  content: `# Schedule deletion (default 30-day recovery window)
aws secretsmanager delete-secret \
  --secret-id myapp/prod/db

# Delete with custom recovery window (7–30 days)
aws secretsmanager delete-secret \
  --secret-id myapp/prod/db \
  --recovery-window-in-days 7

# Delete immediately — NO RECOVERY POSSIBLE
aws secretsmanager delete-secret \
  --secret-id myapp/prod/db \
  --force-delete-without-recovery

# Restore a secret scheduled for deletion
aws secretsmanager restore-secret \
  --secret-id myapp/prod/db

# Update tags
aws secretsmanager tag-resource \
  --secret-id myapp/prod/db \
  --tags Key=cost-center,Value=eng

# Remove a tag
aws secretsmanager untag-resource \
  --secret-id myapp/prod/db \
  --tag-keys cost-center`,
                },
              ],
            },
          },

          // ── Retrieve Secrets ──────────────────────────────────────────────
          {
            title: "Retrieve Secrets",
            description: "Getting secret values by name, ARN, version, or stage label",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "get-secret-value",
                  content: `# Get the current secret value
aws secretsmanager get-secret-value \
  --secret-id myapp/prod/db

# Extract just the secret string (JSON output)
aws secretsmanager get-secret-value \
  --secret-id myapp/prod/db \
  --query SecretString \
  --output text

# Parse a specific field from a JSON secret
aws secretsmanager get-secret-value \
  --secret-id myapp/prod/db \
  --query SecretString \
  --output text | jq -r '.password'

# Get a specific version by ID
aws secretsmanager get-secret-value \
  --secret-id myapp/prod/db \
  --version-id "abc123-uuid"

# Get by version stage label
aws secretsmanager get-secret-value \
  --secret-id myapp/prod/db \
  --version-stage AWSPREVIOUS

# Get a binary secret
aws secretsmanager get-secret-value \
  --secret-id myapp/prod/tls-key \
  --query SecretBinary \
  --output text | base64 --decode > tls.key`,
                },
                {
                  order: 1, language: "bash", label: "Batch & cross-region",
                  content: `# Retrieve from a specific region
aws secretsmanager get-secret-value \
  --secret-id myapp/prod/db \
  --region eu-west-1

# Use ARN instead of name (cross-account)
aws secretsmanager get-secret-value \
  --secret-id arn:aws:secretsmanager:us-east-1:123456789012:secret:myapp/prod/db-AbCdEf

# Batch get multiple secrets (CLI loop pattern)
for secret in myapp/prod/db myapp/prod/api-key; do
  echo "=== $secret ==="
  aws secretsmanager get-secret-value \
    --secret-id "$secret" \
    --query SecretString \
    --output text
done`,
                },
              ],
            },
          },

          // ── Rotation ──────────────────────────────────────────────────────
          {
            title: "Secret Rotation",
            description: "Configuring automatic and manual rotation with Lambda",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Enable rotation",
                  content: `# Enable automatic rotation (every 30 days) using a managed Lambda
aws secretsmanager rotate-secret \
  --secret-id myapp/prod/db \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:SecretsManagerRotation \
  --rotation-rules AutomaticallyAfterDays=30

# Enable rotation using a rotation schedule (cron expression)
aws secretsmanager rotate-secret \
  --secret-id myapp/prod/db \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:SecretsManagerRotation \
  --rotation-rules '{"ScheduleExpression":"cron(0 2 1 * ? *)","Duration":"2h"}'

# Trigger an immediate rotation (test or emergency)
aws secretsmanager rotate-secret \
  --secret-id myapp/prod/db \
  --rotate-immediately

# Cancel rotation
aws secretsmanager cancel-rotate-secret \
  --secret-id myapp/prod/db

# Check rotation status
aws secretsmanager describe-secret \
  --secret-id myapp/prod/db \
  --query '{RotationEnabled:RotationEnabled,LastRotatedDate:LastRotatedDate,NextRotationDate:NextRotationDate}'`,
                },
                {
                  order: 1, language: "python", label: "Rotation Lambda (Python)",
                  content: `"""
Lambda function template for Secrets Manager rotation.
Implements the 4-step rotation pattern required by AWS.
"""
import boto3
import json

client = boto3.client('secretsmanager')


def lambda_handler(event, context):
    arn = event['SecretId']
    token = event['ClientRequestToken']
    step = event['Step']

    metadata = client.describe_secret(SecretId=arn)
    if not metadata['RotationEnabled']:
        raise ValueError(f"Secret {arn} is not enabled for rotation")

    versions = metadata.get('VersionIdsToStages', {})
    if token not in versions:
        raise ValueError(f"Secret version {token} has no stage for arn {arn}")
    if 'AWSCURRENT' in versions[token]:
        return   # already current, nothing to do
    if 'AWSPENDING' not in versions[token]:
        raise ValueError(f"Secret version {token} is not set as AWSPENDING")

    if step == 'createSecret':
        create_secret(arn, token)
    elif step == 'setSecret':
        set_secret(arn, token)
    elif step == 'testSecret':
        test_secret(arn, token)
    elif step == 'finishSecret':
        finish_secret(arn, token)


def create_secret(arn, token):
    """Generate a new secret value and store as AWSPENDING."""
    try:
        client.get_secret_value(SecretId=arn, VersionStage='AWSPENDING',
                                VersionId=token)
        return  # already created
    except client.exceptions.ResourceNotFoundException:
        pass

    current = json.loads(
        client.get_secret_value(SecretId=arn,
                                VersionStage='AWSCURRENT')['SecretString']
    )
    current['password'] = generate_password()

    client.put_secret_value(
        SecretId=arn, ClientRequestToken=token,
        SecretString=json.dumps(current),
        VersionStages=['AWSPENDING'],
    )


def set_secret(arn, token):
    """Apply the AWSPENDING credentials to the database."""
    pending = json.loads(
        client.get_secret_value(SecretId=arn, VersionStage='AWSPENDING',
                                VersionId=token)['SecretString']
    )
    # TODO: ALTER USER in the database using pending credentials
    pass


def test_secret(arn, token):
    """Verify the AWSPENDING credentials work."""
    pending = json.loads(
        client.get_secret_value(SecretId=arn, VersionStage='AWSPENDING',
                                VersionId=token)['SecretString']
    )
    # TODO: Test a real connection with pending['password']
    pass


def finish_secret(arn, token):
    """Promote AWSPENDING to AWSCURRENT."""
    metadata = client.describe_secret(SecretId=arn)
    current_version = next(
        v for v, stages in metadata['VersionIdsToStages'].items()
        if 'AWSCURRENT' in stages
    )
    client.update_secret_version_stage(
        SecretId=arn, VersionStage='AWSCURRENT',
        MoveToVersionId=token, RemoveFromVersionId=current_version,
    )


def generate_password():
    return boto3.client('secretsmanager').get_random_password(
        PasswordLength=32, ExcludePunctuation=True
    )['RandomPassword']`,
                },
              ],
            },
          },

          // ── Resource Policies ─────────────────────────────────────────────
          {
            title: "Resource Policies",
            description: "Granting cross-account access and least-privilege IAM policies",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Resource-based policy",
                  content: `# Attach a resource policy to a secret (enables cross-account access)
aws secretsmanager put-resource-policy \
  --secret-id myapp/prod/db \
  --resource-policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowCrossAccountRead",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::999888777666:role/AppRole"
        },
        "Action": [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        "Resource": "*"
      }
    ]
  }'

# Read the current resource policy
aws secretsmanager get-resource-policy \
  --secret-id myapp/prod/db

# Remove the resource policy
aws secretsmanager delete-resource-policy \
  --secret-id myapp/prod/db

# Validate the policy before attaching (dry-run)
aws secretsmanager validate-resource-policy \
  --resource-policy file://policy.json`,
                },
                {
                  order: 1, language: "json", label: "IAM identity policies",
                  content: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadSpecificSecret",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecretVersionIds"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:myapp/prod/*"
    },
    {
      "Sid": "AllowKMSDecrypt",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:us-east-1:123456789012:key/mrk-abc123"
    },
    {
      "Sid": "DenyOtherEnvs",
      "Effect": "Deny",
      "Action": "secretsmanager:*",
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:myapp/staging/*"
    }
  ]
}`,
                },
              ],
            },
          },

          // ── Replication ───────────────────────────────────────────────────
          {
            title: "Multi-Region Replication",
            description: "Replicating secrets across AWS regions for HA and DR",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Replicate secrets",
                  content: `# Replicate a secret to additional regions
aws secretsmanager replicate-secret-to-regions \
  --secret-id myapp/prod/db \
  --add-replica-regions \
    Region=eu-west-1 \
    Region=ap-southeast-1

# Replicate with a region-specific KMS key
aws secretsmanager replicate-secret-to-regions \
  --secret-id myapp/prod/db \
  --add-replica-regions \
    Region=eu-west-1,KmsKeyId=arn:aws:kms:eu-west-1:123456789012:key/eu-key-id

# List replication status
aws secretsmanager describe-secret \
  --secret-id myapp/prod/db \
  --query ReplicationStatus

# Remove a replica region
aws secretsmanager remove-regions-from-replication \
  --secret-id myapp/prod/db \
  --remove-replica-regions eu-west-1

# Promote a replica to standalone (breaks replication)
aws secretsmanager stop-replication-to-replica \
  --secret-id arn:aws:secretsmanager:eu-west-1:123456789012:secret:myapp/prod/db-AbCdEf`,
                },
              ],
            },
          },

          // ── SDK: Python (boto3) ───────────────────────────────────────────
          {
            title: "SDK — Python (boto3)",
            description: "Retrieving and caching secrets in Python applications",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Get secret value",
                  content: `import boto3
import json
from botocore.exceptions import ClientError


def get_secret(secret_name: str, region: str = "us-east-1") -> dict:
    client = boto3.client("secretsmanager", region_name=region)
    try:
        response = client.get_secret_value(SecretId=secret_name)
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code == "ResourceNotFoundException":
            raise ValueError(f"Secret {secret_name!r} not found") from e
        if error_code == "InvalidRequestException":
            raise ValueError(f"Invalid request for {secret_name!r}") from e
        if error_code == "DecryptionFailure":
            raise PermissionError("KMS decryption failed") from e
        if error_code == "AccessDeniedException":
            raise PermissionError("Access denied to secret") from e
        raise

    secret = response.get("SecretString")
    if secret:
        try:
            return json.loads(secret)
        except json.JSONDecodeError:
            return {"value": secret}
    # Binary secret
    import base64
    return {"value": base64.b64decode(response["SecretBinary"])}


# Usage
db_creds = get_secret("myapp/prod/db")
conn = psycopg2.connect(
    host=db_creds["host"],
    user=db_creds["username"],
    password=db_creds["password"],
    dbname=db_creds["dbname"],
)`,
                },
                {
                  order: 1, language: "python", label: "Caching with aws-secretsmanager-caching",
                  content: `# pip install aws-secretsmanager-caching
from aws_secretsmanager_caching import SecretCache, SecretCacheConfig
import botocore.session
import json

# Configure cache: refresh every 1 hour, max 1000 secrets
config = SecretCacheConfig(
    max_cache_size=1000,
    exception_retry_delay_base=1,
    exception_retry_growth_factor=2,
    exception_retry_delay_max=3600,
    default_version_stage="AWSCURRENT",
    secret_refresh_interval=3600,        # seconds
    secret_version_stage_refresh_interval=3600,
)

session = botocore.session.get_session()
cache = SecretCache(config=config, client=session.create_client("secretsmanager"))


def get_secret_cached(secret_name: str) -> dict:
    secret_string = cache.get_secret_string(secret_name)
    return json.loads(secret_string)


# Subsequent calls within refresh_interval hit the in-process cache
db = get_secret_cached("myapp/prod/db")`,
                },
              ],
            },
          },

          // ── SDK: Node.js ──────────────────────────────────────────────────
          {
            title: "SDK — Node.js",
            description: "Retrieving secrets in Node.js with the AWS SDK v3",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "typescript", label: "Get secret (SDK v3)",
                  content: `// npm install @aws-sdk/client-secrets-manager
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getSecret<T = Record<string, string>>(
  secretName: string
): Promise<T> {
  const command = new GetSecretValueCommand({ SecretId: secretName });

  try {
    const response = await client.send(command);

    if (response.SecretString) {
      return JSON.parse(response.SecretString) as T;
    }
    if (response.SecretBinary) {
      // Binary secret — decode from Uint8Array
      const decoded = Buffer.from(response.SecretBinary).toString("utf-8");
      return JSON.parse(decoded) as T;
    }
    throw new Error("Secret has no value");
  } catch (err) {
    if (err instanceof ResourceNotFoundException) {
      throw new Error(\`Secret "\${secretName}" not found\`);
    }
    throw err;
  }
}

// Usage
interface DbSecret {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
}

const db = await getSecret<DbSecret>("myapp/prod/db");
console.log(\`Connecting to \${db.host}:\${db.port}/\${db.dbname}\`);`,
                },
                {
                  order: 1, language: "typescript", label: "In-process cache pattern",
                  content: `// Simple TTL cache to avoid hitting Secrets Manager on every request
const cache = new Map<string, { value: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getSecretCached<T>(secretName: string): Promise<T> {
  const now = Date.now();
  const cached = cache.get(secretName);

  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const value = await getSecret<T>(secretName);
  cache.set(secretName, { value, expiresAt: now + CACHE_TTL_MS });
  return value;
}

// Load all secrets at startup
async function loadSecrets() {
  const [db, apiKey] = await Promise.all([
    getSecretCached<DbSecret>("myapp/prod/db"),
    getSecretCached<{ key: string }>("myapp/prod/api-key"),
  ]);
  return { db, apiKey };
}`,
                },
              ],
            },
          },

          // ── Integration Patterns ──────────────────────────────────────────
          {
            title: "Integration Patterns",
            description: "ECS, Lambda, EKS, and CloudFormation integration patterns",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "json", label: "ECS task definition injection",
                  content: `{
  "family": "myapp",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ECSTaskRole",
  "containerDefinitions": [
    {
      "name": "myapp",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:latest",
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:myapp/prod/db:password::"
        },
        {
          "name": "DB_USERNAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:myapp/prod/db:username::"
        },
        {
          "name": "API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:myapp/prod/api-key::"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" }
      ]
    }
  ]
}`,
                },
                {
                  order: 1, language: "yaml", label: "CloudFormation & SSM Parameter Store comparison",
                  content: `# CloudFormation — reference a secret ARN (value is NOT resolved at deploy time)
# Use dynamic references to inject at runtime

Resources:
  MyDBInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      MasterUsername: '{{resolve:secretsmanager:myapp/prod/db:SecretString:username}}'
      MasterUserPassword: '{{resolve:secretsmanager:myapp/prod/db:SecretString:password}}'
      DBInstanceClass: db.t3.micro
      Engine: postgres

  # Secrets Manager vs SSM Parameter Store:
  # - Secrets Manager: automatic rotation, cross-account, $0.40/secret/month
  # - SSM SecureString: no native rotation, same-account only, free (standard) or $0.05/10k API calls
  # Rule of thumb: database creds / API keys → Secrets Manager
  #                config values / feature flags → SSM Parameter Store

# Lambda — grant access via execution role
  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
      Policies:
        - PolicyName: SecretsAccess
          PolicyDocument:
            Statement:
              - Effect: Allow
                Action:
                  - secretsmanager:GetSecretValue
                Resource: !Sub 'arn:aws:secretsmanager:\${AWS::Region}:\${AWS::AccountId}:secret:myapp/prod/*'`,
                },
                {
                  order: 2, language: "yaml", label: "EKS — External Secrets Operator",
                  content: `# External Secrets Operator syncs Secrets Manager → Kubernetes Secrets
# https://external-secrets.io

# SecretStore (per-namespace) — uses IRSA (IAM Roles for Service Accounts)
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secretsmanager
  namespace: production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa

---
# ExternalSecret — maps Secrets Manager keys to a K8s Secret
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: myapp-db-creds
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: SecretStore
  target:
    name: myapp-db-creds       # name of the resulting K8s Secret
    creationPolicy: Owner
  data:
    - secretKey: DB_PASSWORD   # K8s Secret key
      remoteRef:
        key: myapp/prod/db     # Secrets Manager secret name
        property: password     # JSON field
    - secretKey: DB_USERNAME
      remoteRef:
        key: myapp/prod/db
        property: username`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created AWS Secrets Manager cheatsheet: ${asm.name} (${asm.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
