import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Upsert admin user (idempotent)
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

  // Delete existing AWS category owned by admin to avoid duplicates
  await prisma.category.deleteMany({
    where: { name: "AWS CLI", userId: admin.id },
  });

  const aws = await prisma.category.create({
    data: {
      name: "AWS CLI",
      icon: "☁️",
      color: "orange",
      description: "AWS CLI commands across S3, EC2, IAM, ECS, Lambda, RDS, CloudWatch and more",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── S3 ──────────────────────────────────────────────────────────────
          {
            title: "S3 — Buckets & Objects",
            description: "Create, list, copy, sync and delete S3 resources",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List all buckets", content: "aws s3 ls" },
                { order: 1, language: "bash", label: "List bucket contents (recursive)", content: "aws s3 ls s3://<bucket>/ --recursive --human-readable" },
                { order: 2, language: "bash", label: "Create bucket", content: "aws s3 mb s3://<bucket> --region <region>" },
                { order: 3, language: "bash", label: "Remove empty bucket", content: "aws s3 rb s3://<bucket>" },
                { order: 4, language: "bash", label: "Remove bucket and all contents", content: "aws s3 rb s3://<bucket> --force" },
                { order: 5, language: "bash", label: "Upload file", content: "aws s3 cp ./file.txt s3://<bucket>/path/" },
                { order: 6, language: "bash", label: "Download file", content: "aws s3 cp s3://<bucket>/path/file.txt ./file.txt" },
                { order: 7, language: "bash", label: "Sync local → S3 (delete removed files)", content: "aws s3 sync ./local-dir s3://<bucket>/prefix --delete" },
                { order: 8, language: "bash", label: "Sync S3 → local", content: "aws s3 sync s3://<bucket>/prefix ./local-dir" },
                { order: 9, language: "bash", label: "Delete object", content: "aws s3 rm s3://<bucket>/path/file.txt" },
                { order: 10, language: "bash", label: "Delete all objects under prefix", content: "aws s3 rm s3://<bucket>/prefix/ --recursive" },
                { order: 11, language: "bash", label: "Generate presigned URL (1 hour)", content: "aws s3 presign s3://<bucket>/file.txt --expires-in 3600" },
              ],
            },
          },
          // ── EC2 ─────────────────────────────────────────────────────────────
          {
            title: "EC2 — Instances",
            description: "Describe, start, stop, and connect to EC2 instances",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "List instances (table view)",
                  content: `aws ec2 describe-instances \\
  --query "Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,PublicIpAddress,Tags[?Key=='Name'].Value|[0]]" \\
  --output table`,
                },
                { order: 1, language: "bash", label: "Start instance", content: "aws ec2 start-instances --instance-ids <id>" },
                { order: 2, language: "bash", label: "Stop instance", content: "aws ec2 stop-instances --instance-ids <id>" },
                { order: 3, language: "bash", label: "Reboot instance", content: "aws ec2 reboot-instances --instance-ids <id>" },
                { order: 4, language: "bash", label: "Terminate instance", content: "aws ec2 terminate-instances --instance-ids <id>" },
                { order: 5, language: "bash", label: "Get instance public IP", content: `aws ec2 describe-instances --instance-ids <id> \\
  --query "Reservations[0].Instances[0].PublicIpAddress" --output text` },
                { order: 6, language: "bash", label: "Connect via SSM Session Manager", content: "aws ssm start-session --target <instance-id>" },
                { order: 7, language: "bash", label: "List security groups", content: `aws ec2 describe-security-groups \\
  --query "SecurityGroups[*].[GroupId,GroupName,Description]" --output table` },
                { order: 8, language: "bash", label: "List key pairs", content: "aws ec2 describe-key-pairs --query \"KeyPairs[*].KeyName\" --output table" },
              ],
            },
          },
          // ── IAM ─────────────────────────────────────────────────────────────
          {
            title: "IAM — Users, Roles & Policies",
            description: "Manage IAM identities and permissions",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List users", content: "aws iam list-users --query \"Users[*].[UserName,UserId,CreateDate]\" --output table" },
                { order: 1, language: "bash", label: "Create user", content: "aws iam create-user --user-name <username>" },
                { order: 2, language: "bash", label: "Delete user", content: "aws iam delete-user --user-name <username>" },
                { order: 3, language: "bash", label: "List roles", content: "aws iam list-roles --query \"Roles[*].[RoleName,Arn]\" --output table" },
                { order: 4, language: "bash", label: "Get caller identity (who am I?)", content: "aws sts get-caller-identity" },
                { order: 5, language: "bash", label: "Attach managed policy to user", content: "aws iam attach-user-policy --user-name <username> --policy-arn arn:aws:iam::aws:policy/<PolicyName>" },
                { order: 6, language: "bash", label: "List attached policies for user", content: "aws iam list-attached-user-policies --user-name <username>" },
                { order: 7, language: "bash", label: "Create access key for user", content: "aws iam create-access-key --user-name <username>" },
                { order: 8, language: "bash", label: "List access keys", content: "aws iam list-access-keys --user-name <username>" },
                { order: 9, language: "bash", label: "Assume role (get temp credentials)", content: `aws sts assume-role \\
  --role-arn arn:aws:iam::<account-id>:role/<role-name> \\
  --role-session-name my-session` },
              ],
            },
          },
          // ── ECS ─────────────────────────────────────────────────────────────
          {
            title: "ECS — Clusters & Services",
            description: "Deploy and manage containers with ECS",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List clusters", content: "aws ecs list-clusters" },
                { order: 1, language: "bash", label: "List services in cluster", content: "aws ecs list-services --cluster <cluster-name>" },
                { order: 2, language: "bash", label: "Describe service", content: "aws ecs describe-services --cluster <cluster> --services <service>" },
                { order: 3, language: "bash", label: "Force new deployment", content: "aws ecs update-service --cluster <cluster> --service <service> --force-new-deployment" },
                { order: 4, language: "bash", label: "Scale service", content: "aws ecs update-service --cluster <cluster> --service <service> --desired-count 3" },
                { order: 5, language: "bash", label: "List running tasks", content: "aws ecs list-tasks --cluster <cluster> --service-name <service>" },
                { order: 6, language: "bash", label: "Stop a task", content: "aws ecs stop-task --cluster <cluster> --task <task-id> --reason \"manual stop\"" },
                { order: 7, language: "bash", label: "Execute command in task (ECS Exec)", content: `aws ecs execute-command \\
  --cluster <cluster> --task <task-id> \\
  --container <container-name> \\
  --command "/bin/sh" --interactive` },
              ],
            },
          },
          // ── Lambda ──────────────────────────────────────────────────────────
          {
            title: "Lambda — Functions",
            description: "Deploy, invoke and monitor Lambda functions",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List functions", content: "aws lambda list-functions --query \"Functions[*].[FunctionName,Runtime,LastModified]\" --output table" },
                { order: 1, language: "bash", label: "Invoke function (sync)", content: "aws lambda invoke --function-name <name> --payload '{\"key\":\"value\"}' /tmp/response.json && cat /tmp/response.json" },
                { order: 2, language: "bash", label: "Invoke function (async)", content: "aws lambda invoke --function-name <name> --invocation-type Event --payload '{}' /tmp/out.json" },
                { order: 3, language: "bash", label: "Update function code from zip", content: "aws lambda update-function-code --function-name <name> --zip-file fileb://function.zip" },
                { order: 4, language: "bash", label: "Update environment variable", content: `aws lambda update-function-configuration \\
  --function-name <name> \\
  --environment "Variables={KEY=value,OTHER=value}"` },
                { order: 5, language: "bash", label: "Get function configuration", content: "aws lambda get-function-configuration --function-name <name>" },
                { order: 6, language: "bash", label: "Tail live logs via CloudWatch", content: "aws logs tail /aws/lambda/<name> --follow" },
              ],
            },
          },
          // ── RDS ─────────────────────────────────────────────────────────────
          {
            title: "RDS — Databases",
            description: "Manage RDS instances and snapshots",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List DB instances", content: "aws rds describe-db-instances --query \"DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus,Engine,Endpoint.Address]\" --output table" },
                { order: 1, language: "bash", label: "Start DB instance", content: "aws rds start-db-instance --db-instance-identifier <id>" },
                { order: 2, language: "bash", label: "Stop DB instance", content: "aws rds stop-db-instance --db-instance-identifier <id>" },
                { order: 3, language: "bash", label: "Create manual snapshot", content: "aws rds create-db-snapshot --db-instance-identifier <id> --db-snapshot-identifier <snapshot-id>" },
                { order: 4, language: "bash", label: "List snapshots", content: "aws rds describe-db-snapshots --db-instance-identifier <id> --query \"DBSnapshots[*].[DBSnapshotIdentifier,Status,SnapshotCreateTime]\" --output table" },
                { order: 5, language: "bash", label: "Restore from snapshot", content: `aws rds restore-db-instance-from-db-snapshot \\
  --db-instance-identifier <new-id> \\
  --db-snapshot-identifier <snapshot-id>` },
              ],
            },
          },
          // ── CloudWatch ──────────────────────────────────────────────────────
          {
            title: "CloudWatch — Logs & Metrics",
            description: "Query logs and metrics from CloudWatch",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List log groups", content: "aws logs describe-log-groups --query \"logGroups[*].logGroupName\" --output table" },
                { order: 1, language: "bash", label: "Tail log group (live)", content: "aws logs tail <log-group-name> --follow" },
                { order: 2, language: "bash", label: "Filter log events", content: `aws logs filter-log-events \\
  --log-group-name <group> \\
  --filter-pattern "ERROR" \\
  --start-time $(date -d '1 hour ago' +%s000)` },
                { order: 3, language: "bash", label: "Run Logs Insights query", content: `aws logs start-query \\
  --log-group-name <group> \\
  --start-time $(date -d '1 hour ago' +%s) \\
  --end-time $(date +%s) \\
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20'` },
                { order: 4, language: "bash", label: "Get Logs Insights results", content: "aws logs get-query-results --query-id <query-id>" },
                { order: 5, language: "bash", label: "Get metric statistics (CPU last hour)", content: `aws cloudwatch get-metric-statistics \\
  --namespace AWS/EC2 \\
  --metric-name CPUUtilization \\
  --dimensions Name=InstanceId,Value=<instance-id> \\
  --start-time $(date -u -d '1 hour ago' +%FT%TZ) \\
  --end-time $(date -u +%FT%TZ) \\
  --period 300 --statistics Average` },
              ],
            },
          },
          // ── ECR ─────────────────────────────────────────────────────────────
          {
            title: "ECR — Container Registry",
            description: "Push and pull Docker images to/from ECR",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Authenticate Docker to ECR", content: "aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com" },
                { order: 1, language: "bash", label: "Create repository", content: "aws ecr create-repository --repository-name <name> --region <region>" },
                { order: 2, language: "bash", label: "List repositories", content: "aws ecr describe-repositories --query \"repositories[*].[repositoryName,repositoryUri]\" --output table" },
                { order: 3, language: "bash", label: "Tag & push image", content: `docker tag <local-image>:<tag> <account-id>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>` },
                { order: 4, language: "bash", label: "List images in repository", content: "aws ecr list-images --repository-name <name> --query \"imageIds[*].[imageTag,imageDigest]\" --output table" },
                { order: 5, language: "bash", label: "Delete image", content: "aws ecr batch-delete-image --repository-name <name> --image-ids imageTag=<tag>" },
              ],
            },
          },
          // ── VPC & Networking ─────────────────────────────────────────────────
          {
            title: "VPC & Networking",
            description: "Inspect VPCs, subnets, and route tables",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List VPCs", content: "aws ec2 describe-vpcs --query \"Vpcs[*].[VpcId,CidrBlock,Tags[?Key=='Name'].Value|[0]]\" --output table" },
                { order: 1, language: "bash", label: "List subnets", content: "aws ec2 describe-subnets --query \"Subnets[*].[SubnetId,VpcId,CidrBlock,AvailabilityZone]\" --output table" },
                { order: 2, language: "bash", label: "List route tables", content: "aws ec2 describe-route-tables --query \"RouteTables[*].[RouteTableId,VpcId]\" --output table" },
                { order: 3, language: "bash", label: "List internet gateways", content: "aws ec2 describe-internet-gateways --query \"InternetGateways[*].[InternetGatewayId,Attachments[0].VpcId]\" --output table" },
                { order: 4, language: "bash", label: "Describe network ACLs", content: "aws ec2 describe-network-acls --query \"NetworkAcls[*].[NetworkAclId,VpcId,IsDefault]\" --output table" },
              ],
            },
          },
          // ── SSM Parameter Store ──────────────────────────────────────────────
          {
            title: "SSM Parameter Store & Secrets",
            description: "Read and write secrets and config from SSM",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Get parameter (decrypted)", content: "aws ssm get-parameter --name /my/param --with-decryption --query Parameter.Value --output text" },
                { order: 1, language: "bash", label: "Get all parameters by path", content: "aws ssm get-parameters-by-path --path /my/app/ --with-decryption --recursive" },
                { order: 2, language: "bash", label: "Put parameter (SecureString)", content: "aws ssm put-parameter --name /my/param --value 'secret' --type SecureString --overwrite" },
                { order: 3, language: "bash", label: "Delete parameter", content: "aws ssm delete-parameter --name /my/param" },
                { order: 4, language: "bash", label: "Get secret from Secrets Manager", content: "aws secretsmanager get-secret-value --secret-id <secret-name> --query SecretString --output text" },
                { order: 5, language: "bash", label: "List secrets", content: "aws secretsmanager list-secrets --query \"SecretList[*].[Name,LastChangedDate]\" --output table" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created AWS cheatsheet: ${aws.name} (${aws.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
