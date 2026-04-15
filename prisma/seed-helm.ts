import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "Helm", userId: null } });

  const helm = await prisma.category.create({
    data: {
      name: "Helm",
      icon: "⛵",
      color: "blue",
      description: "Helm: repositories, install/upgrade, rollback, templating, chart authoring, and OCI",
      isPublic: true,
      snippets: {
        create: [
          // ── Repositories ──────────────────────────────────────────────────
          {
            title: "Repositories",
            description: "Add, update, search, and remove chart repositories",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Add & manage repos",
                  content: `# Add a repository
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add cert-manager https://charts.jetstack.io
helm repo add prometheus https://prometheus-community.github.io/helm-charts

# Update all repos (fetch latest index)
helm repo update

# Update a specific repo
helm repo update bitnami

# List configured repos
helm repo list

# Remove a repo
helm repo remove stable`,
                },
                {
                  order: 1, language: "bash", label: "Search charts",
                  content: `# Search across all configured repos
helm search repo nginx
helm search repo postgres

# Search for all versions of a chart
helm search repo bitnami/postgresql --versions

# Search Artifact Hub (public charts)
helm search hub nginx
helm search hub --max-col-width 80 kafka

# Show chart info
helm show chart bitnami/postgresql
helm show values bitnami/postgresql
helm show readme bitnami/postgresql
helm show all bitnami/postgresql`,
                },
              ],
            },
          },
          // ── Install & Upgrade ─────────────────────────────────────────────
          {
            title: "Install & Upgrade",
            description: "Install, upgrade, and manage releases",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Install a chart",
                  content: `# Install with a generated release name
helm install my-release bitnami/nginx

# Install into a specific namespace (create if missing)
helm install my-release bitnami/nginx \\
  --namespace my-namespace \\
  --create-namespace

# Install a specific chart version
helm install my-release bitnami/nginx --version 15.0.0

# Install from a local chart directory
helm install my-release ./my-chart

# Install from a local packaged chart
helm install my-release ./my-chart-1.0.0.tgz

# Dry run (render + validate, no deploy)
helm install my-release bitnami/nginx --dry-run

# Wait until all pods are ready
helm install my-release bitnami/nginx --wait --timeout 5m`,
                },
                {
                  order: 1, language: "bash", label: "Pass values",
                  content: `# Override values on the command line
helm install my-release bitnami/nginx \\
  --set service.type=LoadBalancer \\
  --set replicaCount=3

# Nested keys
helm install my-release bitnami/postgresql \\
  --set auth.postgresPassword=secret \\
  --set primary.persistence.size=20Gi

# Set a list value
helm install my-release bitnami/nginx \\
  --set "ingress.hosts[0].host=example.com" \\
  --set "ingress.hosts[0].paths[0].path=/"

# From a values file
helm install my-release bitnami/nginx -f values.yaml

# Multiple files (later files take precedence)
helm install my-release bitnami/nginx \\
  -f base-values.yaml \\
  -f prod-values.yaml`,
                },
                {
                  order: 2, language: "bash", label: "Upgrade & install-or-upgrade",
                  content: `# Upgrade an existing release
helm upgrade my-release bitnami/nginx

# Upgrade to a specific version
helm upgrade my-release bitnami/nginx --version 15.1.0

# Install if not present, upgrade if it is
helm upgrade --install my-release bitnami/nginx \\
  --namespace my-namespace \\
  --create-namespace \\
  -f values.yaml

# Reuse previous values (only override specific keys)
helm upgrade my-release bitnami/nginx \\
  --reuse-values \\
  --set replicaCount=5

# Reset to chart defaults then apply new values
helm upgrade my-release bitnami/nginx \\
  --reset-values \\
  -f new-values.yaml

# Upgrade and wait
helm upgrade my-release bitnami/nginx --wait --timeout 10m

# Automatically roll back if upgrade fails
helm upgrade my-release bitnami/nginx \\
  --atomic --timeout 5m`,
                },
              ],
            },
          },
          // ── Releases ──────────────────────────────────────────────────────
          {
            title: "Releases",
            description: "List, inspect, rollback, and uninstall releases",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "List & inspect",
                  content: `# List all releases in current namespace
helm list

# All namespaces
helm list -A

# Include failed / pending releases
helm list -A --all

# Filter by status
helm list --deployed
helm list --failed
helm list --pending

# Show release details
helm status my-release
helm status my-release -n my-namespace

# Show computed values for a release
helm get values my-release
helm get values my-release --all    # includes chart defaults

# Show rendered manifests for a release
helm get manifest my-release

# Show release history
helm history my-release`,
                },
                {
                  order: 1, language: "bash", label: "Rollback & uninstall",
                  content: `# Roll back to the previous revision
helm rollback my-release

# Roll back to a specific revision
helm rollback my-release 2

# Roll back and wait for pods
helm rollback my-release 2 --wait

# Uninstall a release
helm uninstall my-release

# Uninstall from a specific namespace
helm uninstall my-release -n my-namespace

# Keep release history after uninstall
helm uninstall my-release --keep-history

# Uninstall and wait for resource removal
helm uninstall my-release --wait`,
                },
              ],
            },
          },
          // ── Templating & Debugging ────────────────────────────────────────
          {
            title: "Templating & Debugging",
            description: "Render templates locally, lint, and debug chart rendering",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Render & lint",
                  content: `# Render templates locally (no cluster needed)
helm template my-release bitnami/nginx

# Render with custom values
helm template my-release bitnami/nginx -f values.yaml

# Render a specific template file
helm template my-release ./my-chart --show-only templates/deployment.yaml

# Render and pipe to kubectl (dry-run)
helm template my-release ./my-chart | kubectl apply --dry-run=client -f -

# Lint a chart directory
helm lint ./my-chart

# Lint with values
helm lint ./my-chart -f values.yaml

# Strict lint (warnings are errors)
helm lint --strict ./my-chart`,
                },
                {
                  order: 1, language: "bash", label: "Debug & diff",
                  content: `# Debug install (verbose render + dry run)
helm install my-release ./my-chart --debug --dry-run

# Debug upgrade
helm upgrade my-release ./my-chart --debug --dry-run

# Diff before upgrading (requires helm-diff plugin)
helm plugin install https://github.com/databus23/helm-diff
helm diff upgrade my-release bitnami/nginx -f values.yaml

# Diff against a specific revision
helm diff revision my-release 3 4

# Get Kubernetes notes for a release
helm get notes my-release`,
                },
              ],
            },
          },
          // ── Chart Authoring ───────────────────────────────────────────────
          {
            title: "Chart Authoring",
            description: "Create, structure, and package Helm charts",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create & package",
                  content: `# Scaffold a new chart
helm create my-chart

# Chart structure:
# my-chart/
#   Chart.yaml          — chart metadata
#   values.yaml         — default values
#   charts/             — chart dependencies
#   templates/          — Kubernetes manifests + helpers
#   templates/NOTES.txt — post-install notes
#   .helmignore         — files to exclude from packaging

# Package chart into a .tgz
helm package ./my-chart

# Package with a specific version
helm package ./my-chart --version 1.2.0 --app-version 2.0.0

# Package and sign
helm package ./my-chart --sign --key "My Key" --keyring ~/.gnupg/secring.gpg`,
                },
                {
                  order: 1, language: "bash", label: "Chart.yaml",
                  content: `# Chart.yaml — chart metadata
apiVersion: v2
name: my-chart
description: A Helm chart for my application
type: application        # or "library"
version: 1.0.0           # chart version (SemVer)
appVersion: "2.3.1"      # app version (informational)
icon: https://example.com/icon.png
keywords:
  - myapp
  - backend
home: https://github.com/myorg/my-chart
sources:
  - https://github.com/myorg/myapp
maintainers:
  - name: Alice
    email: alice@example.com

# Declare dependencies
dependencies:
  - name: postgresql
    version: "13.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: "18.x.x"
    repository: https://charts.bitnami.com/bitnami
    alias: cache`,
                },
                {
                  order: 2, language: "bash", label: "Dependencies",
                  content: `# Download/update chart dependencies into charts/
helm dependency update ./my-chart

# Build (restore) dependencies from Chart.lock
helm dependency build ./my-chart

# List dependencies
helm dependency list ./my-chart`,
                },
              ],
            },
          },
          // ── Template Functions ────────────────────────────────────────────
          {
            title: "Template Functions & Patterns",
            description: "Common Go template patterns, named templates, and helpers",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "yaml", label: "Common template expressions",
                  content: `# Access values
{{ .Values.replicaCount }}
{{ .Values.image.repository }}

# Chart and release metadata
{{ .Chart.Name }}
{{ .Chart.Version }}
{{ .Release.Name }}
{{ .Release.Namespace }}
{{ .Release.IsInstall }}
{{ .Release.IsUpgrade }}

# Default value if unset
{{ .Values.timeout | default 30 }}
{{ .Values.image.tag | default .Chart.AppVersion }}

# Quote strings safely
image: "{{ .Values.image.repository }}:{{ .Values.image.tag | quote }}"

# toYaml — dump a map/list as YAML (indent is critical)
env:
{{ toYaml .Values.env | indent 2 }}

resources:
{{ toYaml .Values.resources | nindent 10 }}

# Conditional block
{{- if .Values.ingress.enabled }}
# ... ingress manifest ...
{{- end }}

# Range over a list
{{- range .Values.ingress.hosts }}
- host: {{ .host }}
{{- end }}`,
                },
                {
                  order: 1, language: "yaml", label: "Named templates (_helpers.tpl)",
                  content: `{{/*
Expand the name of the chart.
*/}}
{{- define "my-chart.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fully qualified app name — truncated to 63 chars.
*/}}
{{- define "my-chart.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels applied to every resource.
*/}}
{{- define "my-chart.labels" -}}
helm.sh/chart: {{ include "my-chart.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "my-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

# Use in a manifest:
metadata:
  name: {{ include "my-chart.fullname" . }}
  labels:
    {{- include "my-chart.labels" . | nindent 4 }}`,
                },
              ],
            },
          },
          // ── OCI Registries ────────────────────────────────────────────────
          {
            title: "OCI Registries",
            description: "Push, pull, and install charts from OCI container registries",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "OCI push & pull",
                  content: `# Log in to an OCI registry
helm registry login registry.example.com
helm registry login ghcr.io -u myuser --password-stdin

# Log out
helm registry logout registry.example.com

# Push a packaged chart to OCI
helm package ./my-chart
helm push my-chart-1.0.0.tgz oci://registry.example.com/charts

# Push to GitHub Container Registry
helm push my-chart-1.0.0.tgz oci://ghcr.io/myorg

# Pull a chart (download without installing)
helm pull oci://registry.example.com/charts/my-chart --version 1.0.0

# Install directly from OCI
helm install my-release oci://registry.example.com/charts/my-chart \\
  --version 1.0.0

# Upgrade from OCI
helm upgrade my-release oci://registry.example.com/charts/my-chart \\
  --version 1.1.0

# Show chart info from OCI
helm show chart oci://registry.example.com/charts/my-chart --version 1.0.0`,
                },
              ],
            },
          },
          // ── Plugins ───────────────────────────────────────────────────────
          {
            title: "Plugins",
            description: "Install and manage Helm plugins",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Plugin management",
                  content: `# Install a plugin from a URL
helm plugin install https://github.com/databus23/helm-diff
helm plugin install https://github.com/helm/helm-mapkubeapis
helm plugin install https://github.com/chartmuseum/helm-push

# List installed plugins
helm plugin list

# Update a plugin
helm plugin update diff

# Uninstall a plugin
helm plugin uninstall diff

# Useful plugins:
# helm-diff    — preview changes before upgrade
# helm-secrets — encrypt values with SOPS/Vault/KMS
# helm-push    — push charts to ChartMuseum
# mapkubeapis  — migrate deprecated API versions`,
                },
              ],
            },
          },
          // ── Useful Patterns ───────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "CI/CD, namespace management, and multi-environment workflows",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "CI/CD patterns",
                  content: `# Atomic deploy — roll back automatically on failure
helm upgrade --install my-release ./my-chart \\
  --atomic \\
  --timeout 5m \\
  --namespace production \\
  --create-namespace \\
  -f values/prod.yaml \\
  --set image.tag=$IMAGE_TAG

# Check if a release exists before acting
helm status my-release -n production &>/dev/null \\
  && echo "exists" || echo "not installed"

# Get current chart version deployed
helm list -n production -o json \\
  | jq -r '.[] | select(.name=="my-release") | .chart'

# Diff to confirm changes before deploy
helm diff upgrade my-release ./my-chart -f values/prod.yaml --no-color

# Export all manifests currently deployed
helm get manifest my-release -n production > current.yaml`,
                },
                {
                  order: 1, language: "bash", label: "Multi-environment values",
                  content: `# Directory layout for multi-env values:
# values/
#   base.yaml       — shared defaults
#   dev.yaml        — dev overrides
#   staging.yaml    — staging overrides
#   prod.yaml       — prod overrides

# Deploy to dev
helm upgrade --install my-app ./my-chart \\
  -f values/base.yaml \\
  -f values/dev.yaml \\
  -n dev --create-namespace

# Deploy to prod with an image tag override
helm upgrade --install my-app ./my-chart \\
  -f values/base.yaml \\
  -f values/prod.yaml \\
  --set image.tag=v1.4.2 \\
  -n production --create-namespace

# Override a single nested value from env var
helm upgrade --install my-app ./my-chart \\
  -f values/prod.yaml \\
  --set "ingress.hosts[0].host=$DOMAIN"`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Helm cheatsheet: ${helm.name} (${helm.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
