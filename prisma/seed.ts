import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const k8sCategory = await prisma.category.upsert({
    where: { id: "seed-kubernetes" },
    update: {},
    create: {
      id: "seed-kubernetes",
      name: "Kubernetes",
      icon: "🐳",
      color: "blue",
      description: "Essential kubectl commands for managing clusters",
      isPublic: true,
      snippets: {
        create: [
          {
            title: "Pod Management",
            description: "Common commands for working with pods",
            isPublic: true,
            commands: {
              create: [
                { label: "List all pods",      content: "kubectl get pods -A",                                              language: "bash", order: 0 },
                { label: "Describe a pod",     content: "kubectl describe pod <pod-name> -n <namespace>",                  language: "bash", order: 1 },
                { label: "Get pod logs",       content: "kubectl logs <pod-name> -n <namespace> --tail=100 -f",            language: "bash", order: 2 },
                { label: "Execute into a pod", content: "kubectl exec -it <pod-name> -n <namespace> -- /bin/sh",           language: "bash", order: 3 },
              ],
            },
          },
          {
            title: "Deployment Operations",
            description: "Managing deployments and rollouts",
            isPublic: true,
            commands: {
              create: [
                { label: "List deployments",    content: "kubectl get deployments -A",                                          language: "bash", order: 0 },
                { label: "Scale deployment",    content: "kubectl scale deployment <name> --replicas=3 -n <namespace>",         language: "bash", order: 1 },
                { label: "Rollout restart",     content: "kubectl rollout restart deployment/<name> -n <namespace>",            language: "bash", order: 2 },
                { label: "Check rollout status", content: "kubectl rollout status deployment/<name> -n <namespace>",            language: "bash", order: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded category:", k8sCategory.name);

  const awsCategory = await prisma.category.upsert({
    where: { id: "seed-aws" },
    update: {},
    create: {
      id: "seed-aws",
      name: "AWS CLI",
      icon: "☁️",
      color: "orange",
      description: "AWS CLI commands for cloud operations",
      isPublic: true,
      snippets: {
        create: [
          {
            title: "S3 Operations",
            description: "Working with S3 buckets and objects",
            isPublic: true,
            commands: {
              create: [
                { label: "List buckets",        content: "aws s3 ls",                                                           language: "bash", order: 0 },
                { label: "List bucket contents", content: "aws s3 ls s3://<bucket-name>/ --recursive",                         language: "bash", order: 1 },
                { label: "Copy file to S3",     content: "aws s3 cp ./local-file.txt s3://<bucket-name>/path/",                language: "bash", order: 2 },
                { label: "Sync directory",      content: "aws s3 sync ./local-dir s3://<bucket-name>/remote-dir --delete",     language: "bash", order: 3 },
              ],
            },
          },
          {
            title: "EC2 Instances",
            description: "Managing EC2 instances",
            isPublic: true,
            commands: {
              create: [
                { label: "List instances", content: `aws ec2 describe-instances --query "Reservations[*].Instances[*].[InstanceId,State.Name,Tags[?Key=='Name'].Value|[0]]" --output table`, language: "bash", order: 0 },
                { label: "Start instance", content: "aws ec2 start-instances --instance-ids <instance-id>",                    language: "bash", order: 1 },
                { label: "Stop instance",  content: "aws ec2 stop-instances --instance-ids <instance-id>",                     language: "bash", order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded category:", awsCategory.name);

  const dockerCategory = await prisma.category.upsert({
    where: { id: "seed-docker" },
    update: {},
    create: {
      id: "seed-docker",
      name: "Docker",
      icon: "🐋",
      color: "cyan",
      description: "Docker container and image management commands",
      isPublic: true,
      snippets: {
        create: [
          {
            title: "Container Management",
            description: "Start, stop, and manage containers",
            isPublic: true,
            commands: {
              create: [
                { label: "List running containers",       content: "docker ps",                          language: "bash", order: 0 },
                { label: "List all containers",           content: "docker ps -a",                       language: "bash", order: 1 },
                { label: "Stop all running containers",   content: "docker stop $(docker ps -q)",        language: "bash", order: 2 },
                { label: "Remove all stopped containers", content: "docker container prune -f",          language: "bash", order: 3 },
                { label: "View container logs",           content: "docker logs -f --tail 100 <container-id>", language: "bash", order: 4 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded category:", dockerCategory.name);

  const gitCategory = await prisma.category.upsert({
    where: { id: "seed-git" },
    update: {},
    create: {
      id: "seed-git",
      name: "Git",
      icon: "🔧",
      color: "red",
      description: "Git version control commands",
      isPublic: true,
      snippets: {
        create: [
          {
            title: "Branch Operations",
            description: "Creating, switching, and managing branches",
            isPublic: true,
            commands: {
              create: [
                { label: "Create and switch to new branch", content: "git checkout -b <branch-name>",          language: "bash", order: 0 },
                { label: "List all branches",               content: "git branch -a",                          language: "bash", order: 1 },
                { label: "Delete local branch",             content: "git branch -d <branch-name>",            language: "bash", order: 2 },
                { label: "Delete remote branch",            content: "git push origin --delete <branch-name>", language: "bash", order: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded category:", gitCategory.name);
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
