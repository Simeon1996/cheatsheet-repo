import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "Kubernetes", userId: null },
  });

  const k8s = await prisma.category.create({
    data: {
      name: "Kubernetes",
      icon: "⎈",
      color: "blue",
      description: "kubectl commands and YAML patterns for pods, deployments, services, networking, RBAC and cluster operations",
      isPublic: true,
      snippets: {
        create: [
          // ── Context & Cluster ─────────────────────────────────────────────────
          {
            title: "Context & Cluster",
            description: "Switch clusters, set defaults and inspect nodes",
            isPublic: true,
            commands: {
              create: [
                { order: 0,  language: "bash", label: "List all contexts",                          content: "kubectl config get-contexts" },
                { order: 1,  language: "bash", label: "Switch context",                             content: "kubectl config use-context <context>" },
                { order: 2,  language: "bash", label: "Show current context",                       content: "kubectl config current-context" },
                { order: 3,  language: "bash", label: "Set default namespace for context",          content: "kubectl config set-context --current --namespace=<namespace>" },
                { order: 4,  language: "bash", label: "List nodes",                                 content: "kubectl get nodes -o wide" },
                { order: 5,  language: "bash", label: "Describe a node",                            content: "kubectl describe node <node>" },
                { order: 6,  language: "bash", label: "Show node resource usage",                   content: "kubectl top nodes" },
                { order: 7,  language: "bash", label: "Cordon node (stop scheduling)",              content: "kubectl cordon <node>" },
                { order: 8,  language: "bash", label: "Drain node for maintenance",                 content: "kubectl drain <node> --ignore-daemonsets --delete-emptydir-data" },
                { order: 9,  language: "bash", label: "Uncordon node",                              content: "kubectl uncordon <node>" },
                { order: 10, language: "bash", label: "Get cluster info",                           content: "kubectl cluster-info" },
                { order: 11, language: "bash", label: "Check API server version",                   content: "kubectl version --short" },
                { order: 12, language: "bash", label: "List all API resources",                     content: "kubectl api-resources" },
              ],
            },
          },
          // ── Namespaces ────────────────────────────────────────────────────────
          {
            title: "Namespaces",
            description: "Create and manage namespaces",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List namespaces",                            content: "kubectl get namespaces" },
                { order: 1, language: "bash", label: "Create namespace",                           content: "kubectl create namespace staging" },
                { order: 2, language: "bash", label: "Delete namespace (and all its resources)",   content: "kubectl delete namespace staging" },
                { order: 3, language: "bash", label: "List all resources in a namespace",          content: "kubectl get all -n <namespace>" },
                { order: 4, language: "bash", label: "List resources across all namespaces",       content: "kubectl get pods -A" },
                { order: 5, language: "yaml", label: "Namespace manifest",
                  content: `apiVersion: v1
kind: Namespace
metadata:
  name: staging
  labels:
    env: staging
    team: platform` },
              ],
            },
          },
          // ── Pods ──────────────────────────────────────────────────────────────
          {
            title: "Pods",
            description: "Run, inspect, debug and delete pods",
            isPublic: true,
            commands: {
              create: [
                { order: 0,  language: "bash", label: "List pods",                                 content: "kubectl get pods -n <namespace>" },
                { order: 1,  language: "bash", label: "List pods with node and IP",                content: "kubectl get pods -n <namespace> -o wide" },
                { order: 2,  language: "bash", label: "Watch pods in real time",                   content: "kubectl get pods -n <namespace> -w" },
                { order: 3,  language: "bash", label: "Describe pod",                              content: "kubectl describe pod <pod> -n <namespace>" },
                { order: 4,  language: "bash", label: "Stream pod logs",                           content: "kubectl logs -f <pod> -n <namespace>" },
                { order: 5,  language: "bash", label: "Logs for specific container in pod",        content: "kubectl logs -f <pod> -c <container> -n <namespace>" },
                { order: 6,  language: "bash", label: "Previous container logs (after crash)",     content: "kubectl logs <pod> -n <namespace> --previous" },
                { order: 7,  language: "bash", label: "Exec into pod",                             content: "kubectl exec -it <pod> -n <namespace> -- /bin/sh" },
                { order: 8,  language: "bash", label: "Run ephemeral debug container",             content: "kubectl debug -it <pod> -n <namespace> --image=busybox --target=<container>" },
                { order: 9,  language: "bash", label: "Run throwaway debug pod",                   content: "kubectl run debug --image=busybox --rm -it --restart=Never -- /bin/sh" },
                { order: 10, language: "bash", label: "Copy file from pod",                        content: "kubectl cp <namespace>/<pod>:/path/file ./file" },
                { order: 11, language: "bash", label: "Copy file into pod",                        content: "kubectl cp ./file <namespace>/<pod>:/path/file" },
                { order: 12, language: "bash", label: "Delete pod",                                content: "kubectl delete pod <pod> -n <namespace>" },
                { order: 13, language: "bash", label: "Force delete stuck terminating pod",        content: "kubectl delete pod <pod> -n <namespace> --grace-period=0 --force" },
                { order: 14, language: "bash", label: "Show pod resource usage",                   content: "kubectl top pods -n <namespace> --sort-by=cpu" },
              ],
            },
          },
          // ── Deployments ───────────────────────────────────────────────────────
          {
            title: "Deployments",
            description: "Deploy, scale, update and roll back applications",
            isPublic: true,
            commands: {
              create: [
                { order: 0,  language: "bash", label: "List deployments",                          content: "kubectl get deployments -n <namespace>" },
                { order: 1,  language: "bash", label: "Describe deployment",                       content: "kubectl describe deployment <name> -n <namespace>" },
                { order: 2,  language: "bash", label: "Apply manifest",                            content: "kubectl apply -f deployment.yaml" },
                { order: 3,  language: "bash", label: "Scale deployment",                          content: "kubectl scale deployment <name> --replicas=5 -n <namespace>" },
                { order: 4,  language: "bash", label: "Update image (rolling update)",             content: "kubectl set image deployment/<name> <container>=myrepo/myapp:2.0.0 -n <namespace>" },
                { order: 5,  language: "bash", label: "Force rolling restart",                     content: "kubectl rollout restart deployment/<name> -n <namespace>" },
                { order: 6,  language: "bash", label: "Check rollout status",                      content: "kubectl rollout status deployment/<name> -n <namespace>" },
                { order: 7,  language: "bash", label: "View rollout history",                      content: "kubectl rollout history deployment/<name> -n <namespace>" },
                { order: 8,  language: "bash", label: "Roll back to previous revision",            content: "kubectl rollout undo deployment/<name> -n <namespace>" },
                { order: 9,  language: "bash", label: "Roll back to specific revision",            content: "kubectl rollout undo deployment/<name> --to-revision=3 -n <namespace>" },
                { order: 10, language: "bash", label: "Patch deployment inline",                   content: `kubectl patch deployment <name> -n <namespace> -p '{"spec":{"replicas":3}}'` },
                { order: 11, language: "yaml", label: "Deployment manifest with probes and limits",
                  content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: production
  labels:
    app: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: myrepo/api:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: api` },
              ],
            },
          },
          // ── Services & Ingress ────────────────────────────────────────────────
          {
            title: "Services & Ingress",
            description: "Expose workloads internally and externally",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List services",                             content: "kubectl get svc -n <namespace>" },
                { order: 1, language: "bash", label: "Expose deployment as ClusterIP",            content: "kubectl expose deployment <name> --port=80 --target-port=3000 -n <namespace>" },
                { order: 2, language: "bash", label: "Port-forward to service",                   content: "kubectl port-forward svc/<name> 8080:80 -n <namespace>" },
                { order: 3, language: "bash", label: "Port-forward to pod",                       content: "kubectl port-forward pod/<pod> 8080:3000 -n <namespace>" },
                { order: 4, language: "bash", label: "List ingresses",                            content: "kubectl get ingress -A" },
                { order: 5, language: "bash", label: "Describe ingress",                          content: "kubectl describe ingress <name> -n <namespace>" },
                { order: 6, language: "yaml", label: "ClusterIP + Ingress with TLS",
                  content: `apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: production
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  namespace: production
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80` },
              ],
            },
          },
          // ── ConfigMaps & Secrets ──────────────────────────────────────────────
          {
            title: "ConfigMaps & Secrets",
            description: "Inject configuration and sensitive data into workloads",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Create ConfigMap from literals",            content: "kubectl create configmap app-config --from-literal=LOG_LEVEL=info --from-literal=PORT=3000 -n <namespace>" },
                { order: 1, language: "bash", label: "Create ConfigMap from file",                content: "kubectl create configmap nginx-config --from-file=nginx.conf -n <namespace>" },
                { order: 2, language: "bash", label: "Create Secret from literals",               content: "kubectl create secret generic db-secret --from-literal=password=mysecret -n <namespace>" },
                { order: 3, language: "bash", label: "Create Secret from .env file",              content: "kubectl create secret generic app-secrets --from-env-file=.env -n <namespace>" },
                { order: 4, language: "bash", label: "Create TLS secret from cert and key",       content: "kubectl create secret tls api-tls --cert=tls.crt --key=tls.key -n <namespace>" },
                { order: 5, language: "bash", label: "Decode a secret value",                     content: "kubectl get secret db-secret -n <namespace> -o jsonpath='{.data.password}' | base64 -d" },
                { order: 6, language: "bash", label: "List all secrets",                          content: "kubectl get secrets -n <namespace>" },
                { order: 7, language: "yaml", label: "ConfigMap mounted as env vars and volume",
                  content: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  LOG_LEVEL: info
  PORT: "3000"
  config.yaml: |
    server:
      timeout: 30s
    cache:
      ttl: 300
---
# In a Pod spec:
spec:
  containers:
    - name: api
      envFrom:
        - configMapRef:
            name: app-config       # all keys as env vars
      env:
        - name: LOG_LEVEL          # single key
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: LOG_LEVEL
      volumeMounts:
        - name: config-vol
          mountPath: /etc/config
  volumes:
    - name: config-vol
      configMap:
        name: app-config` },
              ],
            },
          },
          // ── Autoscaling ───────────────────────────────────────────────────────
          {
            title: "Autoscaling",
            description: "HPA, VPA and cluster autoscaler patterns",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Create HPA (CPU-based)",                    content: "kubectl autoscale deployment <name> --cpu-percent=70 --min=2 --max=20 -n <namespace>" },
                { order: 1, language: "bash", label: "List HPAs",                                 content: "kubectl get hpa -n <namespace>" },
                { order: 2, language: "bash", label: "Describe HPA (see current metrics)",        content: "kubectl describe hpa <name> -n <namespace>" },
                { order: 3, language: "bash", label: "Delete HPA",                                content: "kubectl delete hpa <name> -n <namespace>" },
                { order: 4, language: "yaml", label: "HPA with CPU and memory metrics",
                  content: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Pods
          value: 4
          periodSeconds: 30` },
                { order: 5, language: "yaml", label: "PodDisruptionBudget",
                  content: `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
  namespace: production
spec:
  minAvailable: 2      # or use maxUnavailable: 1
  selector:
    matchLabels:
      app: api` },
              ],
            },
          },
          // ── RBAC ──────────────────────────────────────────────────────────────
          {
            title: "RBAC",
            description: "Roles, ClusterRoles, bindings and service accounts",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List roles in namespace",                   content: "kubectl get roles -n <namespace>" },
                { order: 1, language: "bash", label: "List cluster roles",                        content: "kubectl get clusterroles" },
                { order: 2, language: "bash", label: "List role bindings",                        content: "kubectl get rolebindings -n <namespace>" },
                { order: 3, language: "bash", label: "Create service account",                    content: "kubectl create serviceaccount <name> -n <namespace>" },
                { order: 4, language: "bash", label: "Check what a user can do",                  content: "kubectl auth can-i --list --as=<user>" },
                { order: 5, language: "bash", label: "Check specific permission",                 content: "kubectl auth can-i create pods --as=<user> -n <namespace>" },
                { order: 6, language: "yaml", label: "Role + RoleBinding for a service account",
                  content: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-role
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-role-binding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: app-sa
    namespace: production
roleRef:
  kind: Role
  apiGroup: rbac.authorization.k8s.io
  name: app-role` },
              ],
            },
          },
          // ── Jobs & CronJobs ───────────────────────────────────────────────────
          {
            title: "Jobs & CronJobs",
            description: "Run one-off and scheduled batch workloads",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List jobs",                                 content: "kubectl get jobs -n <namespace>" },
                { order: 1, language: "bash", label: "List cronjobs",                             content: "kubectl get cronjobs -n <namespace>" },
                { order: 2, language: "bash", label: "Trigger CronJob manually",                  content: "kubectl create job --from=cronjob/<name> <job-name> -n <namespace>" },
                { order: 3, language: "bash", label: "Suspend a CronJob",                         content: "kubectl patch cronjob <name> -p '{\"spec\":{\"suspend\":true}}' -n <namespace>" },
                { order: 4, language: "bash", label: "Delete completed jobs",                     content: "kubectl delete jobs --field-selector status.successful=1 -n <namespace>" },
                { order: 5, language: "yaml", label: "Job manifest",
                  content: `apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
  namespace: production
spec:
  backoffLimit: 3
  ttlSecondsAfterFinished: 600
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate
          image: myrepo/api:1.0.0
          command: ["python", "manage.py", "migrate"]
          envFrom:
            - secretRef:
                name: app-secrets` },
                { order: 6, language: "yaml", label: "CronJob manifest",
                  content: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup
  namespace: production
spec:
  schedule: "0 2 * * *"          # daily at 02:00 UTC
  concurrencyPolicy: Forbid       # don't overlap runs
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      backoffLimit: 2
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: cleanup
              image: myrepo/worker:latest
              command: ["python", "-m", "tasks.cleanup"]` },
              ],
            },
          },
          // ── Debugging & Events ────────────────────────────────────────────────
          {
            title: "Debugging & Events",
            description: "Diagnose failures with events, jsonpath and explain",
            isPublic: true,
            commands: {
              create: [
                { order: 0,  language: "bash", label: "List events sorted by time",               content: "kubectl get events -n <namespace> --sort-by=.lastTimestamp" },
                { order: 1,  language: "bash", label: "List Warning events cluster-wide",         content: "kubectl get events -A --field-selector type=Warning" },
                { order: 2,  language: "bash", label: "Explain a resource field",                 content: "kubectl explain deployment.spec.strategy" },
                { order: 3,  language: "bash", label: "Get resource as YAML",                     content: "kubectl get deployment <name> -n <namespace> -o yaml" },
                { order: 4,  language: "bash", label: "JSONPath query — get image names",         content: "kubectl get pods -n <namespace> -o jsonpath='{.items[*].spec.containers[*].image}'" },
                { order: 5,  language: "bash", label: "Custom columns output",                    content: "kubectl get pods -n <namespace> -o custom-columns='NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName'" },
                { order: 6,  language: "bash", label: "List pods in CrashLoopBackOff",            content: "kubectl get pods -A | grep CrashLoopBackOff" },
                { order: 7,  language: "bash", label: "List pods not Running",                    content: "kubectl get pods -A --field-selector=status.phase!=Running" },
                { order: 8,  language: "bash", label: "Diff live state vs local manifest",        content: "kubectl diff -f deployment.yaml" },
                { order: 9,  language: "bash", label: "Dry-run apply (validate manifest)",        content: "kubectl apply -f deployment.yaml --dry-run=server" },
                { order: 10, language: "bash", label: "Label a resource",                         content: "kubectl label pod <pod> -n <namespace> env=debug" },
                { order: 11, language: "bash", label: "Annotate a resource",                      content: "kubectl annotate deployment <name> -n <namespace> kubernetes.io/change-cause='bump to v2'" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Kubernetes cheatsheet: ${k8s.name} (${k8s.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
