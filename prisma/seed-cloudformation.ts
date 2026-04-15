import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "CloudFormation", userId: null } });

  const cfn = await prisma.category.create({
    data: {
      name: "CloudFormation",
      icon: "☁️",
      color: "orange",
      description: "AWS CloudFormation: stacks, changesets, drift, StackSets, and template authoring",
      isPublic: true,
      snippets: {
        create: [
          // ── Stack Lifecycle ───────────────────────────────────────────────
          {
            title: "Stack Lifecycle",
            description: "Create, update, delete, and describe stacks",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create a stack",
                  content: `# Create from a local template
aws cloudformation create-stack \\
  --stack-name my-stack \\
  --template-body file://template.yaml \\
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM

# Create from S3
aws cloudformation create-stack \\
  --stack-name my-stack \\
  --template-url https://s3.amazonaws.com/my-bucket/template.yaml \\
  --capabilities CAPABILITY_IAM

# Pass parameters
aws cloudformation create-stack \\
  --stack-name my-stack \\
  --template-body file://template.yaml \\
  --parameters ParameterKey=Env,ParameterValue=prod \\
               ParameterKey=InstanceType,ParameterValue=t3.medium

# Add tags
aws cloudformation create-stack \\
  --stack-name my-stack \\
  --template-body file://template.yaml \\
  --tags Key=Team,Value=platform Key=CostCenter,Value=eng`,
                },
                {
                  order: 1, language: "bash", label: "Update & delete",
                  content: `# Update a stack
aws cloudformation update-stack \\
  --stack-name my-stack \\
  --template-body file://template.yaml \\
  --capabilities CAPABILITY_IAM

# Update with previous template (params change only)
aws cloudformation update-stack \\
  --stack-name my-stack \\
  --use-previous-template \\
  --parameters ParameterKey=Env,ParameterValue=staging

# Delete a stack
aws cloudformation delete-stack --stack-name my-stack

# Retain specific resources on delete
aws cloudformation delete-stack \\
  --stack-name my-stack \\
  --retain-resources MyS3Bucket MyLogGroup`,
                },
                {
                  order: 2, language: "bash", label: "Wait & describe",
                  content: `# Wait until stack creation completes
aws cloudformation wait stack-create-complete --stack-name my-stack

# Wait until update completes
aws cloudformation wait stack-update-complete --stack-name my-stack

# Wait until delete completes
aws cloudformation wait stack-delete-complete --stack-name my-stack

# Describe stack (status, outputs, params)
aws cloudformation describe-stacks --stack-name my-stack

# Get just stack status
aws cloudformation describe-stacks \\
  --stack-name my-stack \\
  --query "Stacks[0].StackStatus" --output text

# List all stacks
aws cloudformation list-stacks \\
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE`,
                },
              ],
            },
          },
          // ── Change Sets ───────────────────────────────────────────────────
          {
            title: "Change Sets",
            description: "Preview changes before applying them to a stack",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create & describe a change set",
                  content: `# Create a change set for an existing stack
aws cloudformation create-change-set \\
  --stack-name my-stack \\
  --change-set-name my-changes \\
  --template-body file://template.yaml \\
  --capabilities CAPABILITY_IAM

# Create change set for a new stack
aws cloudformation create-change-set \\
  --stack-name my-stack \\
  --change-set-name initial \\
  --change-set-type CREATE \\
  --template-body file://template.yaml \\
  --capabilities CAPABILITY_IAM

# Wait for change set to be ready
aws cloudformation wait change-set-create-complete \\
  --stack-name my-stack \\
  --change-set-name my-changes

# Describe what would change
aws cloudformation describe-change-set \\
  --stack-name my-stack \\
  --change-set-name my-changes`,
                },
                {
                  order: 1, language: "bash", label: "Execute & delete a change set",
                  content: `# Execute (apply) the change set
aws cloudformation execute-change-set \\
  --stack-name my-stack \\
  --change-set-name my-changes

# List all change sets for a stack
aws cloudformation list-change-sets --stack-name my-stack

# Delete a change set without applying
aws cloudformation delete-change-set \\
  --stack-name my-stack \\
  --change-set-name my-changes`,
                },
              ],
            },
          },
          // ── Stack Events & Resources ──────────────────────────────────────
          {
            title: "Stack Events & Resources",
            description: "Inspect events, resources, and outputs",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Events",
                  content: `# List stack events (most recent first)
aws cloudformation describe-stack-events --stack-name my-stack

# Tail events during a deployment (bash loop)
while true; do
  aws cloudformation describe-stack-events \\
    --stack-name my-stack \\
    --query "StackEvents[?ResourceStatus!='UPDATE_COMPLETE'][].{Time:Timestamp,Status:ResourceStatus,Resource:LogicalResourceId,Reason:ResourceStatusReason}" \\
    --output table
  sleep 5
done

# Get only FAILED events
aws cloudformation describe-stack-events \\
  --stack-name my-stack \\
  --query "StackEvents[?contains(ResourceStatus,'FAILED')].{Resource:LogicalResourceId,Reason:ResourceStatusReason}" \\
  --output table`,
                },
                {
                  order: 1, language: "bash", label: "Resources & outputs",
                  content: `# List all physical resources in a stack
aws cloudformation list-stack-resources --stack-name my-stack

# Get a specific resource's physical ID
aws cloudformation list-stack-resources \\
  --stack-name my-stack \\
  --query "StackResourceSummaries[?LogicalResourceId=='MyBucket'].PhysicalResourceId" \\
  --output text

# Get stack outputs
aws cloudformation describe-stacks \\
  --stack-name my-stack \\
  --query "Stacks[0].Outputs" --output table

# Get a specific output value
aws cloudformation describe-stacks \\
  --stack-name my-stack \\
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \\
  --output text`,
                },
              ],
            },
          },
          // ── Drift Detection ───────────────────────────────────────────────
          {
            title: "Drift Detection",
            description: "Detect and inspect configuration drift from the template",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Detect & describe drift",
                  content: `# Start drift detection
aws cloudformation detect-stack-drift --stack-name my-stack

# Get the drift detection operation ID
DRIFT_ID=$(aws cloudformation detect-stack-drift \\
  --stack-name my-stack \\
  --query "StackDriftDetectionId" --output text)

# Check detection status
aws cloudformation describe-stack-drift-detection-status \\
  --stack-drift-detection-id $DRIFT_ID

# List drifted resources
aws cloudformation describe-stack-resource-drifts \\
  --stack-name my-stack \\
  --stack-resource-drift-status-filters MODIFIED DELETED

# Detect drift on all stacks (bash loop)
aws cloudformation list-stacks \\
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \\
  --query "StackSummaries[].StackName" --output text \\
| tr '\\t' '\\n' | while read STACK; do
    echo "Checking $STACK..."
    aws cloudformation detect-stack-drift --stack-name "$STACK"
  done`,
                },
              ],
            },
          },
          // ── Stack Policies ────────────────────────────────────────────────
          {
            title: "Stack Policies",
            description: "Protect resources from being replaced or deleted during updates",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Set & override stack policy",
                  content: `# Set a stack policy (deny all updates by default)
aws cloudformation set-stack-policy \\
  --stack-name my-stack \\
  --stack-policy-body '{
    "Statement": [
      {
        "Effect": "Deny",
        "Action": "Update:*",
        "Principal": "*",
        "Resource": "LogicalResourceId/ProductionDatabase"
      },
      {
        "Effect": "Allow",
        "Action": "Update:*",
        "Principal": "*",
        "Resource": "*"
      }
    ]
  }'

# Get current stack policy
aws cloudformation get-stack-policy --stack-name my-stack

# Temporarily override policy during an update
aws cloudformation update-stack \\
  --stack-name my-stack \\
  --template-body file://template.yaml \\
  --stack-policy-during-update-body '{"Statement":[{"Effect":"Allow","Action":"Update:*","Principal":"*","Resource":"*"}]}'`,
                },
              ],
            },
          },
          // ── StackSets ─────────────────────────────────────────────────────
          {
            title: "StackSets",
            description: "Deploy stacks across multiple accounts and regions",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create & manage StackSets",
                  content: `# Create a StackSet
aws cloudformation create-stack-set \\
  --stack-set-name my-stackset \\
  --template-body file://template.yaml \\
  --capabilities CAPABILITY_IAM \\
  --permission-model SERVICE_MANAGED \\
  --auto-deployment Enabled=true,RetainStacksOnAccountRemoval=false

# Add stack instances to accounts/regions
aws cloudformation create-stack-instances \\
  --stack-set-name my-stackset \\
  --accounts 111122223333 444455556666 \\
  --regions us-east-1 eu-west-1

# Update all instances
aws cloudformation update-stack-set \\
  --stack-set-name my-stackset \\
  --template-body file://template.yaml \\
  --operation-preferences MaxConcurrentPercentage=25,FailureTolerancePercentage=10

# List instances
aws cloudformation list-stack-instances --stack-set-name my-stackset

# Delete instances
aws cloudformation delete-stack-instances \\
  --stack-set-name my-stackset \\
  --accounts 111122223333 \\
  --regions us-east-1 \\
  --no-retain-stacks

# Delete the StackSet (must have no instances)
aws cloudformation delete-stack-set --stack-set-name my-stackset`,
                },
              ],
            },
          },
          // ── Template Validation & Packaging ──────────────────────────────
          {
            title: "Template Validation & Packaging",
            description: "Validate, package, and deploy templates with nested stacks",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Validate & lint",
                  content: `# Validate template syntax (does not check IAM/logic)
aws cloudformation validate-template --template-body file://template.yaml

# Validate from S3
aws cloudformation validate-template \\
  --template-url https://s3.amazonaws.com/my-bucket/template.yaml

# Estimate monthly cost of the template
aws cloudformation estimate-template-cost \\
  --template-body file://template.yaml \\
  --parameters ParameterKey=InstanceType,ParameterValue=m5.large

# cfn-lint — third-party deep linting (pip install cfn-lint)
cfn-lint template.yaml
cfn-lint template.yaml --include-checks W
cfn-lint template.yaml --ignore-checks W3002`,
                },
                {
                  order: 1, language: "bash", label: "Package & deploy (SAM/nested stacks)",
                  content: `# Package: upload local artifacts to S3 and rewrite template
aws cloudformation package \\
  --template-file template.yaml \\
  --s3-bucket my-artifacts-bucket \\
  --s3-prefix cfn \\
  --output-template-file packaged.yaml

# Deploy packaged template
aws cloudformation deploy \\
  --template-file packaged.yaml \\
  --stack-name my-stack \\
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND

# deploy with parameters and tags
aws cloudformation deploy \\
  --template-file packaged.yaml \\
  --stack-name my-stack \\
  --capabilities CAPABILITY_IAM \\
  --parameter-overrides Env=prod InstanceType=t3.medium \\
  --tags Team=platform \\
  --no-fail-on-empty-changeset`,
                },
              ],
            },
          },
          // ── Template Anatomy ──────────────────────────────────────────────
          {
            title: "Template Anatomy",
            description: "Structure, parameters, mappings, conditions, outputs, and transforms",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Template skeleton",
                  content: `AWSTemplateFormatVersion: "2010-09-09"
Description: "My application stack"

# Optional: SAM or CloudFormation macro transforms
Transform: AWS::Serverless-2016-10-31

Parameters:
  Env:
    Type: String
    AllowedValues: [dev, staging, prod]
    Default: dev
  InstanceType:
    Type: String
    Default: t3.micro

Mappings:
  AmiByRegion:
    us-east-1:
      ami: ami-0abcdef1234567890
    eu-west-1:
      ami: ami-0fedcba9876543210

Conditions:
  IsProd: !Equals [!Ref Env, prod]
  IsNotProd: !Not [!Condition IsProd]

Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "my-app-\${Env}-\${AWS::AccountId}"
      VersioningConfiguration:
        Status: !If [IsProd, Enabled, Suspended]

Outputs:
  BucketName:
    Value: !Ref MyBucket
    Export:
      Name: !Sub "\${AWS::StackName}-BucketName"`,
                },
                {
                  order: 1, language: "yaml", label: "Intrinsic functions",
                  content: `# Ref — logical resource ID or parameter value
BucketName: !Ref MyBucket

# Sub — string interpolation
Name: !Sub "app-\${Env}-\${AWS::Region}"
ARN:  !Sub "arn:aws:s3:::\${MyBucket}/*"

# GetAtt — attribute of a resource
RoleArn: !GetAtt MyRole.Arn
DNS:     !GetAtt MyALB.DNSName

# Join
Policy: !Join
  - ""
  - - "arn:aws:s3:::"
    - !Ref MyBucket
    - "/*"

# Select — pick item from list
AZ: !Select [0, !GetAZs ""]

# Split
Parts: !Split [",", !Ref CsvParam]

# If — conditional value
Size: !If [IsProd, 100, 20]

# ImportValue — cross-stack reference
VpcId: !ImportValue
  !Sub "\${NetworkStack}-VpcId"

# FindInMap
Ami: !FindInMap [AmiByRegion, !Ref "AWS::Region", ami]

# Cidr — generate CIDR blocks
Subnets: !Cidr [!Ref VpcCidr, 6, 8]`,
                },
                {
                  order: 2, language: "yaml", label: "Resource metadata & helpers",
                  content: `Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    # Creation policy: wait for cfn-signal before marking CREATE_COMPLETE
    CreationPolicy:
      ResourceSignal:
        Count: 1
        Timeout: PT10M

    # Update policy: rolling update for ASGs
    UpdatePolicy:
      AutoScalingRollingUpdate:
        MinInstancesInService: 1
        MaxBatchSize: 1
        PauseTime: PT5M
        WaitOnResourceSignals: true

    # Deletion policy: retain or snapshot on stack delete
    DeletionPolicy: Retain   # or Snapshot, Delete

    # Update replace policy: what to do with old resource on replacement
    UpdateReplacePolicy: Retain

    Properties:
      ImageId: !FindInMap [AmiByRegion, !Ref "AWS::Region", ami]
      InstanceType: !Ref InstanceType
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          yum update -y
          /opt/aws/bin/cfn-signal -e $? \\
            --stack \${AWS::StackName} \\
            --resource MyInstance \\
            --region \${AWS::Region}`,
                },
              ],
            },
          },
          // ── Pseudo Parameters ─────────────────────────────────────────────
          {
            title: "Pseudo Parameters & SSM",
            description: "Built-in pseudo parameters and SSM Parameter Store integration",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Pseudo parameters",
                  content: `# Available anywhere in a template via !Ref or !Sub

# Current AWS account ID
AccountId: !Ref AWS::AccountId            # "123456789012"

# Region the stack is being deployed to
Region: !Ref AWS::Region                  # "us-east-1"

# Stack name
Stack: !Ref AWS::StackName               # "my-stack"

# Full stack ARN
StackId: !Ref AWS::StackId

# "AWS::NoValue" — conditionally omit a property
Properties:
  KmsKeyId: !If [IsProd, !Ref MyKey, !Ref AWS::NoValue]

# Partition (aws, aws-cn, aws-us-gov)
Partition: !Ref AWS::Partition

# URL suffix (amazonaws.com or amazonaws.com.cn)
Suffix: !Ref AWS::URLSuffix`,
                },
                {
                  order: 1, language: "yaml", label: "SSM Parameter Store in templates",
                  content: `Parameters:
  # Resolve SSM value at deploy time (plaintext)
  AmiId:
    Type: AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>
    Default: /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2

  # String from SSM
  DbPassword:
    Type: AWS::SSM::Parameter::Value<String>
    Default: /myapp/prod/db-password

  # Secure string (encrypted) — use dynamic reference instead
  # SSM secure string can NOT be used as a Parameter type directly

# Dynamic references — resolved at deployment, not stored in template
Resources:
  MySecret:
    Type: AWS::RDS::DBInstance
    Properties:
      # SSM plaintext
      DBName: "{{resolve:ssm:/myapp/db-name}}"
      # SSM SecureString (KMS-encrypted)
      MasterUserPassword: "{{resolve:ssm-secure:/myapp/db-password:1}}"
      # Secrets Manager
      MasterUserPassword: "{{resolve:secretsmanager:MySecret:SecretString:password}}"`,
                },
              ],
            },
          },
          // ── Useful Patterns ───────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "Nested stacks, custom resources, and stack rollback",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Nested stacks",
                  content: `Resources:
  NetworkStack:
    Type: AWS::CloudFormation::Stack
    Properties:
      TemplateURL: https://s3.amazonaws.com/my-bucket/network.yaml
      Parameters:
        VpcCidr: "10.0.0.0/16"
        Env: !Ref Env
      TimeoutInMinutes: 20

  AppStack:
    Type: AWS::CloudFormation::Stack
    DependsOn: NetworkStack
    Properties:
      TemplateURL: https://s3.amazonaws.com/my-bucket/app.yaml
      Parameters:
        VpcId: !GetAtt NetworkStack.Outputs.VpcId
        SubnetIds: !GetAtt NetworkStack.Outputs.SubnetIds`,
                },
                {
                  order: 1, language: "bash", label: "Rollback & troubleshooting",
                  content: `# Continue a failed rollback (when rollback itself failed)
aws cloudformation continue-update-rollback --stack-name my-stack

# Skip resources that are blocking rollback
aws cloudformation continue-update-rollback \\
  --stack-name my-stack \\
  --resources-to-skip MyProblematicResource

# Cancel an in-progress update
aws cloudformation cancel-update-stack --stack-name my-stack

# Describe why a resource failed
aws cloudformation describe-stack-events \\
  --stack-name my-stack \\
  --query "StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED'].{Resource:LogicalResourceId,Reason:ResourceStatusReason}" \\
  --output table

# Signal a resource manually (e.g. from EC2 UserData)
aws cloudformation signal-resource \\
  --stack-name my-stack \\
  --logical-resource-id MyInstance \\
  --unique-id i-0abc123 \\
  --status SUCCESS`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created CloudFormation cheatsheet: ${cfn.name} (${cfn.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
