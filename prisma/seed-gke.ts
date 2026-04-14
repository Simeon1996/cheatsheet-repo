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
    where: { name: "GKE CLI", userId: admin.id },
  });

  const gke = await prisma.category.create({
    data: {
      name: "GKE CLI",
      icon: "🚀",
      color: "blue",
      description: "gcloud and kubectl commands for Google Kubernetes Engine — clusters, workloads, networking, and operations",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Auth & Project Setup ─────────────────────────────────────────────
          {
            title: "Auth & Project Setup",
            description: "Authenticate and configure gcloud before anything else",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Login to Google account", content: "gcloud auth login" },
                { order: 1, language: "bash", label: "Login with Application Default Credentials", content: "gcloud auth application-default login" },
                { order: 2, language: "bash", label: "Set active project", content: "gcloud config set project <project-id>" },
                { order: 3, language: "bash", label: "Set default region and zone", content: "gcloud config set compute/region us-central1\ngcloud config set compute/zone us-central1-a" },
                { order: 4, language: "bash", label: "Show current config", content: "gcloud config list" },
                { order: 5, language: "bash", label: "List all config profiles", content: "gcloud config configurations list" },
                { order: 6, language: "bash", label: "Create and activate a new config profile", content: "gcloud config configurations create <profile>\ngcloud config configurations activate <profile>" },
                { order: 7, language: "bash", label: "Print active account and project", content: "gcloud auth list\ngcloud config get-value project" },
              ],
            },
          },
          // ── Cluster Management ───────────────────────────────────────────────
          {
            title: "Cluster Management",
            description: "Create, resize, upgrade and delete GKE clusters",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List clusters", content: "gcloud container clusters list" },
                { order: 1, language: "bash", label: "Describe a cluster", content: "gcloud container clusters describe <cluster> --region <region>" },
                {
                  order: 2, language: "bash", label: "Create Autopilot cluster (recommended)",
                  content: "gcloud container clusters create-auto <cluster> --region us-central1",
                },
                {
                  order: 3, language: "bash", label: "Create Standard cluster",
                  content: `gcloud container clusters create <cluster> \\
  --region us-central1 \\
  --num-nodes 3 \\
  --machine-type e2-standard-4 \\
  --enable-autoscaling --min-nodes 1 --max-nodes 10 \\
  --enable-ip-alias \\
  --workload-pool=<project-id>.svc.id.goog`,
                },
                { order: 4, language: "bash", label: "Get credentials (update kubeconfig)", content: "gcloud container clusters get-credentials <cluster> --region <region>" },
                { order: 5, language: "bash", label: "Resize a node pool", content: "gcloud container clusters resize <cluster> --node-pool <pool> --num-nodes 5 --region <region>" },
                { order: 6, language: "bash", label: "Upgrade cluster control plane", content: "gcloud container clusters upgrade <cluster> --master --cluster-version <version> --region <region>" },
                { order: 7, language: "bash", label: "Upgrade a node pool", content: "gcloud container clusters upgrade <cluster> --node-pool <pool> --region <region>" },
                { order: 8, language: "bash", label: "Delete cluster", content: "gcloud container clusters delete <cluster> --region <region>" },
              ],
            },
          },
          // ── Node Pools ───────────────────────────────────────────────────────
          {
            title: "Node Pools",
            description: "Add, scale and manage node pools within a cluster",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List node pools", content: "gcloud container node-pools list --cluster <cluster> --region <region>" },
                { order: 1, language: "bash", label: "Describe a node pool", content: "gcloud container node-pools describe <pool> --cluster <cluster> --region <region>" },
                {
                  order: 2, language: "bash", label: "Add a GPU node pool",
                  content: `gcloud container node-pools create gpu-pool \\
  --cluster <cluster> --region <region> \\
  --machine-type a2-highgpu-1g \\
  --accelerator type=nvidia-tesla-a100,count=1 \\
  --num-nodes 1`,
                },
                {
                  order: 3, language: "bash", label: "Add a spot (preemptible) node pool",
                  content: `gcloud container node-pools create spot-pool \\
  --cluster <cluster> --region <region> \\
  --machine-type e2-standard-4 \\
  --spot \\
  --enable-autoscaling --min-nodes 0 --max-nodes 20`,
                },
                { order: 4, language: "bash", label: "Cordon all nodes in a pool (stop scheduling)", content: `kubectl cordon $(kubectl get nodes -l cloud.google.com/gke-nodepool=<pool> -o name)` },
                { order: 5, language: "bash", label: "Delete a node pool", content: "gcloud container node-pools delete <pool> --cluster <cluster> --region <region>" },
              ],
            },
          },
          // ── kubectl Essentials ───────────────────────────────────────────────
          {
            title: "kubectl Essentials",
            description: "Everyday kubectl commands for GKE workloads",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Show all contexts", content: "kubectl config get-contexts" },
                { order: 1, language: "bash", label: "Switch context", content: "kubectl config use-context <context>" },
                { order: 2, language: "bash", label: "List all resources in namespace", content: "kubectl get all -n <namespace>" },
                { order: 3, language: "bash", label: "List pods with node placement", content: "kubectl get pods -o wide -n <namespace>" },
                { order: 4, language: "bash", label: "Describe a pod", content: "kubectl describe pod <pod> -n <namespace>" },
                { order: 5, language: "bash", label: "Stream pod logs", content: "kubectl logs -f <pod> -n <namespace> --tail=100" },
                { order: 6, language: "bash", label: "Stream logs from all pods in a deployment", content: "kubectl logs -f deployment/<name> -n <namespace> --all-containers=true" },
                { order: 7, language: "bash", label: "Exec into a pod", content: "kubectl exec -it <pod> -n <namespace> -- /bin/sh" },
                { order: 8, language: "bash", label: "Copy file from pod", content: "kubectl cp <namespace>/<pod>:/path/to/file ./local-file" },
                { order: 9, language: "bash", label: "Port-forward a service", content: "kubectl port-forward svc/<service> 8080:80 -n <namespace>" },
                { order: 10, language: "bash", label: "Apply manifests", content: "kubectl apply -f ./manifests/" },
                { order: 11, language: "bash", label: "Delete resources from manifests", content: "kubectl delete -f ./manifests/" },
                { order: 12, language: "bash", label: "Rollout restart deployment", content: "kubectl rollout restart deployment/<name> -n <namespace>" },
                { order: 13, language: "bash", label: "Check rollout status", content: "kubectl rollout status deployment/<name> -n <namespace>" },
                { order: 14, language: "bash", label: "Undo last rollout", content: "kubectl rollout undo deployment/<name> -n <namespace>" },
              ],
            },
          },
          // ── Workload Identity ─────────────────────────────────────────────────
          {
            title: "Workload Identity",
            description: "Bind Kubernetes service accounts to Google IAM roles — the secure way to access GCP services from pods",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Create a GCP service account", content: "gcloud iam service-accounts create <gsa-name> --project <project-id>" },
                {
                  order: 1, language: "bash", label: "Grant GCP role to service account",
                  content: `gcloud projects add-iam-policy-binding <project-id> \\
  --member="serviceAccount:<gsa-name>@<project-id>.iam.gserviceaccount.com" \\
  --role="roles/storage.objectViewer"`,
                },
                { order: 2, language: "bash", label: "Create Kubernetes service account", content: "kubectl create serviceaccount <ksa-name> -n <namespace>" },
                {
                  order: 3, language: "bash", label: "Bind KSA → GSA (Workload Identity)",
                  content: `gcloud iam service-accounts add-iam-policy-binding <gsa-name>@<project-id>.iam.gserviceaccount.com \\
  --role roles/iam.workloadIdentityUser \\
  --member "serviceAccount:<project-id>.svc.id.goog[<namespace>/<ksa-name>]"`,
                },
                {
                  order: 4, language: "bash", label: "Annotate KSA with GSA email",
                  content: `kubectl annotate serviceaccount <ksa-name> -n <namespace> \\
  iam.gke.io/gcp-service-account=<gsa-name>@<project-id>.iam.gserviceaccount.com`,
                },
                { order: 5, language: "bash", label: "Verify Workload Identity is working", content: `kubectl run -it --rm debug --image=google/cloud-sdk:slim \\
  --serviceaccount=<ksa-name> -n <namespace> \\
  -- gcloud auth list` },
              ],
            },
          },
          // ── Networking & Ingress ─────────────────────────────────────────────
          {
            title: "Networking & Ingress",
            description: "Manage GKE services, load balancers and GKE Gateway",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List services and external IPs", content: "kubectl get svc -A" },
                { order: 1, language: "bash", label: "Expose deployment as LoadBalancer", content: "kubectl expose deployment <name> --type=LoadBalancer --port=80 --target-port=8080 -n <namespace>" },
                { order: 2, language: "bash", label: "List ingresses", content: "kubectl get ingress -A" },
                { order: 3, language: "bash", label: "List GKE Gateways", content: "kubectl get gateway -A" },
                { order: 4, language: "bash", label: "Reserve a static external IP", content: "gcloud compute addresses create <name> --global" },
                { order: 5, language: "bash", label: "List reserved IP addresses", content: "gcloud compute addresses list" },
                { order: 6, language: "bash", label: "List firewall rules", content: "gcloud compute firewall-rules list --format='table(name,direction,sourceRanges,allowed)'" },
                { order: 7, language: "bash", label: "Describe a load balancer backend service", content: "gcloud compute backend-services describe <name> --global" },
              ],
            },
          },
          // ── Artifact Registry ────────────────────────────────────────────────
          {
            title: "Artifact Registry",
            description: "Push and pull container images using Google Artifact Registry",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Configure Docker auth for Artifact Registry", content: "gcloud auth configure-docker <region>-docker.pkg.dev" },
                { order: 1, language: "bash", label: "Create a Docker repository", content: "gcloud artifacts repositories create <repo> --repository-format=docker --location=<region>" },
                { order: 2, language: "bash", label: "List repositories", content: "gcloud artifacts repositories list" },
                { order: 3, language: "bash", label: "Tag and push image", content: `docker tag <local-image>:<tag> <region>-docker.pkg.dev/<project-id>/<repo>/<image>:<tag>
docker push <region>-docker.pkg.dev/<project-id>/<repo>/<image>:<tag>` },
                { order: 4, language: "bash", label: "List images in repository", content: "gcloud artifacts docker images list <region>-docker.pkg.dev/<project-id>/<repo>" },
                { order: 5, language: "bash", label: "Delete an image tag", content: "gcloud artifacts docker tags delete <region>-docker.pkg.dev/<project-id>/<repo>/<image>:<tag>" },
                { order: 6, language: "bash", label: "Build and push with Cloud Build", content: "gcloud builds submit --tag <region>-docker.pkg.dev/<project-id>/<repo>/<image>:<tag> ." },
              ],
            },
          },
          // ── Logging & Monitoring ─────────────────────────────────────────────
          {
            title: "Logging & Monitoring",
            description: "Query Cloud Logging and inspect cluster metrics from the CLI",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Tail GKE container logs from Cloud Logging",
                  content: `gcloud logging read \\
  'resource.type="k8s_container" AND resource.labels.cluster_name="<cluster>" AND resource.labels.namespace_name="<namespace>"' \\
  --limit 50 --format "value(textPayload)" --freshness 1h`,
                },
                {
                  order: 1, language: "bash", label: "Query logs with severity filter",
                  content: `gcloud logging read \\
  'resource.type="k8s_container" AND severity>=ERROR AND resource.labels.cluster_name="<cluster>"' \\
  --limit 100 --format json | jq '.[].textPayload'`,
                },
                { order: 2, language: "bash", label: "List Cloud Monitoring alert policies", content: "gcloud alpha monitoring policies list" },
                { order: 3, language: "bash", label: "List uptime checks", content: "gcloud monitoring uptime list-configs" },
                { order: 4, language: "bash", label: "View node resource usage (top)", content: "kubectl top nodes" },
                { order: 5, language: "bash", label: "View pod resource usage", content: "kubectl top pods -n <namespace> --sort-by=cpu" },
                { order: 6, language: "bash", label: "Describe node for pressure/events", content: "kubectl describe node <node-name>" },
              ],
            },
          },
          // ── Debugging & Troubleshooting ──────────────────────────────────────
          {
            title: "Debugging & Troubleshooting",
            description: "Diagnose failing pods, OOMKills, and cluster issues",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Show events sorted by time", content: "kubectl get events -n <namespace> --sort-by=.lastTimestamp" },
                { order: 1, language: "bash", label: "Show only Warning events cluster-wide", content: "kubectl get events -A --field-selector type=Warning" },
                { order: 2, language: "bash", label: "Get previous container logs (after crash)", content: "kubectl logs <pod> -n <namespace> --previous" },
                { order: 3, language: "bash", label: "Run ephemeral debug container", content: "kubectl debug -it <pod> -n <namespace> --image=busybox --target=<container>" },
                { order: 4, language: "bash", label: "Check pod resource requests vs limits", content: "kubectl get pod <pod> -n <namespace> -o jsonpath='{.spec.containers[*].resources}'" },
                { order: 5, language: "bash", label: "List pods in CrashLoopBackOff", content: "kubectl get pods -A | grep CrashLoopBackOff" },
                { order: 6, language: "bash", label: "Check HorizontalPodAutoscaler status", content: "kubectl get hpa -n <namespace>" },
                { order: 7, language: "bash", label: "Drain node for maintenance", content: "kubectl drain <node> --ignore-daemonsets --delete-emptydir-data" },
                { order: 8, language: "bash", label: "Uncordon node after maintenance", content: "kubectl uncordon <node>" },
                { order: 9, language: "bash", label: "Force delete a stuck terminating pod", content: "kubectl delete pod <pod> -n <namespace> --grace-period=0 --force" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created GKE cheatsheet: ${gke.name} (${gke.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
