import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "Azure CLI", userId: null },
  });

  const az = await prisma.category.create({
    data: {
      name: "Azure CLI",
      icon: "🔷",
      color: "cyan",
      description: "Azure CLI (az) commands for compute, storage, networking, AKS, identity and more",
      isPublic: true,
      snippets: {
        create: [
          // ── Auth & Account Setup ─────────────────────────────────────────────
          {
            title: "Auth & Account Setup",
            description: "Login, switch subscriptions and inspect your identity",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Interactive login", content: "az login" },
                { order: 1, language: "bash", label: "Login with service principal", content: "az login --service-principal -u <app-id> -p <password> --tenant <tenant-id>" },
                { order: 2, language: "bash", label: "Login with managed identity (inside Azure VM/ACI)", content: "az login --identity" },
                { order: 3, language: "bash", label: "List subscriptions", content: "az account list --output table" },
                { order: 4, language: "bash", label: "Set active subscription", content: "az account set --subscription <subscription-id-or-name>" },
                { order: 5, language: "bash", label: "Show current account & subscription", content: "az account show" },
                { order: 6, language: "bash", label: "List available locations", content: "az account list-locations --output table" },
                { order: 7, language: "bash", label: "Logout", content: "az logout" },
              ],
            },
          },
          // ── Resource Groups ──────────────────────────────────────────────────
          {
            title: "Resource Groups",
            description: "Create, inspect and clean up resource groups",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List resource groups", content: "az group list --output table" },
                { order: 1, language: "bash", label: "Create resource group", content: "az group create --name <rg> --location eastus" },
                { order: 2, language: "bash", label: "Show resource group details", content: "az group show --name <rg>" },
                { order: 3, language: "bash", label: "List all resources inside a group", content: "az resource list --resource-group <rg> --output table" },
                { order: 4, language: "bash", label: "Delete resource group (and everything in it)", content: "az group delete --name <rg> --yes --no-wait" },
                { order: 5, language: "bash", label: "Export group as ARM template", content: "az group export --name <rg> > rg-template.json" },
              ],
            },
          },
          // ── Virtual Machines ─────────────────────────────────────────────────
          {
            title: "Virtual Machines",
            description: "Create, start, stop and connect to Azure VMs",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List VMs", content: "az vm list --output table" },
                { order: 1, language: "bash", label: "Show VM status", content: "az vm get-instance-view --name <vm> --resource-group <rg> --query instanceView.statuses" },
                {
                  order: 2, language: "bash", label: "Create Ubuntu VM with SSH key",
                  content: `az vm create \\
  --resource-group <rg> \\
  --name <vm> \\
  --image Ubuntu2204 \\
  --size Standard_B2s \\
  --admin-username azureuser \\
  --generate-ssh-keys`,
                },
                { order: 3, language: "bash", label: "Start VM", content: "az vm start --name <vm> --resource-group <rg>" },
                { order: 4, language: "bash", label: "Stop VM (deallocate to stop billing)", content: "az vm deallocate --name <vm> --resource-group <rg>" },
                { order: 5, language: "bash", label: "Restart VM", content: "az vm restart --name <vm> --resource-group <rg>" },
                { order: 6, language: "bash", label: "Delete VM", content: "az vm delete --name <vm> --resource-group <rg> --yes" },
                { order: 7, language: "bash", label: "SSH via Azure Bastion (no public IP needed)", content: "az network bastion ssh --name <bastion> --resource-group <rg> --target-resource-id <vm-id> --auth-type ssh-key --username azureuser --ssh-key ~/.ssh/id_rsa" },
                { order: 8, language: "bash", label: "Open port on VM NSG", content: "az vm open-port --port 443 --name <vm> --resource-group <rg>" },
                { order: 9, language: "bash", label: "List available VM sizes in region", content: "az vm list-sizes --location eastus --output table" },
              ],
            },
          },
          // ── Storage ──────────────────────────────────────────────────────────
          {
            title: "Storage — Accounts & Blobs",
            description: "Manage storage accounts, containers and blob objects",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List storage accounts", content: "az storage account list --output table" },
                {
                  order: 1, language: "bash", label: "Create storage account",
                  content: `az storage account create \\
  --name <account> \\
  --resource-group <rg> \\
  --location eastus \\
  --sku Standard_LRS \\
  --kind StorageV2`,
                },
                { order: 2, language: "bash", label: "Get storage account connection string", content: "az storage account show-connection-string --name <account> --resource-group <rg> --output tsv" },
                { order: 3, language: "bash", label: "List blob containers", content: "az storage container list --account-name <account> --output table" },
                { order: 4, language: "bash", label: "Create blob container", content: "az storage container create --name <container> --account-name <account>" },
                { order: 5, language: "bash", label: "Upload file to blob", content: "az storage blob upload --account-name <account> --container-name <container> --name <blob-name> --file ./local-file.txt" },
                { order: 6, language: "bash", label: "Download blob", content: "az storage blob download --account-name <account> --container-name <container> --name <blob-name> --file ./output.txt" },
                { order: 7, language: "bash", label: "List blobs in container", content: "az storage blob list --account-name <account> --container-name <container> --output table" },
                { order: 8, language: "bash", label: "Delete blob", content: "az storage blob delete --account-name <account> --container-name <container> --name <blob-name>" },
                { order: 9, language: "bash", label: "Generate SAS token for a blob (1 hour)", content: "az storage blob generate-sas --account-name <account> --container-name <container> --name <blob> --permissions r --expiry $(date -u -d '1 hour' +%Y-%m-%dT%H:%MZ) --output tsv" },
              ],
            },
          },
          // ── AKS ──────────────────────────────────────────────────────────────
          {
            title: "AKS — Azure Kubernetes Service",
            description: "Create and manage AKS clusters and node pools",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List clusters", content: "az aks list --output table" },
                {
                  order: 1, language: "bash", label: "Create AKS cluster",
                  content: `az aks create \\
  --resource-group <rg> \\
  --name <cluster> \\
  --node-count 3 \\
  --node-vm-size Standard_D4s_v3 \\
  --enable-managed-identity \\
  --enable-addons monitoring \\
  --generate-ssh-keys`,
                },
                { order: 2, language: "bash", label: "Get credentials (update kubeconfig)", content: "az aks get-credentials --resource-group <rg> --name <cluster>" },
                { order: 3, language: "bash", label: "Get credentials (admin)", content: "az aks get-credentials --resource-group <rg> --name <cluster> --admin" },
                { order: 4, language: "bash", label: "Show cluster details", content: "az aks show --resource-group <rg> --name <cluster> --output table" },
                { order: 5, language: "bash", label: "Scale node pool", content: "az aks scale --resource-group <rg> --name <cluster> --node-count 5" },
                { order: 6, language: "bash", label: "Upgrade cluster", content: "az aks upgrade --resource-group <rg> --name <cluster> --kubernetes-version <version>" },
                { order: 7, language: "bash", label: "List available Kubernetes versions", content: "az aks get-versions --location eastus --output table" },
                { order: 8, language: "bash", label: "List node pools", content: "az aks nodepool list --resource-group <rg> --cluster-name <cluster> --output table" },
                {
                  order: 9, language: "bash", label: "Add spot node pool",
                  content: `az aks nodepool add \\
  --resource-group <rg> \\
  --cluster-name <cluster> \\
  --name spotnodes \\
  --priority Spot \\
  --eviction-policy Delete \\
  --spot-max-price -1 \\
  --node-vm-size Standard_D4s_v3 \\
  --node-count 1 \\
  --enable-cluster-autoscaler --min-count 0 --max-count 10`,
                },
                { order: 10, language: "bash", label: "Delete cluster", content: "az aks delete --resource-group <rg> --name <cluster> --yes --no-wait" },
              ],
            },
          },
          // ── Azure Container Registry ──────────────────────────────────────────
          {
            title: "Azure Container Registry (ACR)",
            description: "Build, push and pull container images with ACR",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Create registry", content: "az acr create --resource-group <rg> --name <registry> --sku Basic" },
                { order: 1, language: "bash", label: "List registries", content: "az acr list --output table" },
                { order: 2, language: "bash", label: "Login to registry", content: "az acr login --name <registry>" },
                { order: 3, language: "bash", label: "Build and push image with ACR Tasks", content: "az acr build --registry <registry> --image <image>:<tag> ." },
                { order: 4, language: "bash", label: "List repositories", content: "az acr repository list --name <registry> --output table" },
                { order: 5, language: "bash", label: "List tags for a repository", content: "az acr repository show-tags --name <registry> --repository <image> --output table" },
                { order: 6, language: "bash", label: "Delete an image tag", content: "az acr repository delete --name <registry> --image <image>:<tag> --yes" },
                { order: 7, language: "bash", label: "Attach ACR to AKS (grants pull permission)", content: "az aks update --resource-group <rg> --name <cluster> --attach-acr <registry>" },
              ],
            },
          },
          // ── Networking ───────────────────────────────────────────────────────
          {
            title: "Networking",
            description: "VNets, subnets, NSGs and public IP addresses",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List virtual networks", content: "az network vnet list --output table" },
                {
                  order: 1, language: "bash", label: "Create VNet with subnet",
                  content: `az network vnet create \\
  --resource-group <rg> \\
  --name <vnet> \\
  --address-prefix 10.0.0.0/16 \\
  --subnet-name default \\
  --subnet-prefix 10.0.0.0/24`,
                },
                { order: 2, language: "bash", label: "List subnets in a VNet", content: "az network vnet subnet list --resource-group <rg> --vnet-name <vnet> --output table" },
                { order: 3, language: "bash", label: "List network security groups", content: "az network nsg list --output table" },
                { order: 4, language: "bash", label: "Add NSG inbound rule", content: "az network nsg rule create --resource-group <rg> --nsg-name <nsg> --name allow-https --priority 100 --protocol Tcp --destination-port-ranges 443 --access Allow --direction Inbound" },
                { order: 5, language: "bash", label: "List public IP addresses", content: "az network public-ip list --output table" },
                { order: 6, language: "bash", label: "Create static public IP", content: "az network public-ip create --resource-group <rg> --name <ip-name> --allocation-method Static --sku Standard" },
                { order: 7, language: "bash", label: "List load balancers", content: "az network lb list --output table" },
              ],
            },
          },
          // ── IAM & RBAC ────────────────────────────────────────────────────────
          {
            title: "IAM & RBAC",
            description: "Manage service principals, managed identities and role assignments",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List role assignments in subscription", content: "az role assignment list --all --output table" },
                {
                  order: 1, language: "bash", label: "Assign role to user",
                  content: `az role assignment create \\
  --assignee <user-email-or-object-id> \\
  --role "Contributor" \\
  --scope /subscriptions/<subscription-id>/resourceGroups/<rg>`,
                },
                { order: 2, language: "bash", label: "Remove role assignment", content: "az role assignment delete --assignee <user> --role \"Contributor\" --resource-group <rg>" },
                { order: 3, language: "bash", label: "Create service principal with Contributor role", content: "az ad sp create-for-rbac --name <sp-name> --role Contributor --scopes /subscriptions/<subscription-id>" },
                { order: 4, language: "bash", label: "List service principals", content: "az ad sp list --show-mine --output table" },
                { order: 5, language: "bash", label: "Reset service principal credentials", content: "az ad sp credential reset --id <app-id>" },
                { order: 6, language: "bash", label: "Create user-assigned managed identity", content: "az identity create --resource-group <rg> --name <identity-name>" },
                { order: 7, language: "bash", label: "List managed identities", content: "az identity list --output table" },
                { order: 8, language: "bash", label: "List built-in roles", content: "az role definition list --custom-role-only false --query '[].roleName' --output tsv | sort" },
              ],
            },
          },
          // ── Key Vault ────────────────────────────────────────────────────────
          {
            title: "Key Vault — Secrets & Keys",
            description: "Store and retrieve secrets, keys and certificates",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Create Key Vault", content: "az keyvault create --name <vault> --resource-group <rg> --location eastus" },
                { order: 1, language: "bash", label: "List Key Vaults", content: "az keyvault list --output table" },
                { order: 2, language: "bash", label: "Set a secret", content: "az keyvault secret set --vault-name <vault> --name <secret-name> --value 'my-secret-value'" },
                { order: 3, language: "bash", label: "Get a secret value", content: "az keyvault secret show --vault-name <vault> --name <secret-name> --query value --output tsv" },
                { order: 4, language: "bash", label: "List secrets", content: "az keyvault secret list --vault-name <vault> --output table" },
                { order: 5, language: "bash", label: "Delete a secret", content: "az keyvault secret delete --vault-name <vault> --name <secret-name>" },
                { order: 6, language: "bash", label: "Grant identity access to vault secrets", content: "az keyvault set-policy --name <vault> --object-id <identity-object-id> --secret-permissions get list" },
                { order: 7, language: "bash", label: "List certificates", content: "az keyvault certificate list --vault-name <vault> --output table" },
              ],
            },
          },
          // ── App Service ──────────────────────────────────────────────────────
          {
            title: "App Service",
            description: "Deploy and manage web apps on Azure App Service",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List App Service plans", content: "az appservice plan list --output table" },
                {
                  order: 1, language: "bash", label: "Create App Service plan",
                  content: `az appservice plan create \\
  --name <plan> \\
  --resource-group <rg> \\
  --sku B2 \\
  --is-linux`,
                },
                { order: 2, language: "bash", label: "Create web app (Node.js)", content: "az webapp create --resource-group <rg> --plan <plan> --name <app> --runtime 'NODE:20-lts'" },
                { order: 3, language: "bash", label: "Deploy from local git", content: "az webapp up --name <app> --resource-group <rg> --runtime 'NODE:20-lts'" },
                { order: 4, language: "bash", label: "List web apps", content: "az webapp list --output table" },
                { order: 5, language: "bash", label: "Stream live logs", content: "az webapp log tail --name <app> --resource-group <rg>" },
                { order: 6, language: "bash", label: "Set app setting (environment variable)", content: "az webapp config appsettings set --name <app> --resource-group <rg> --settings KEY=value" },
                { order: 7, language: "bash", label: "List app settings", content: "az webapp config appsettings list --name <app> --resource-group <rg> --output table" },
                { order: 8, language: "bash", label: "Restart web app", content: "az webapp restart --name <app> --resource-group <rg>" },
                { order: 9, language: "bash", label: "Browse web app URL", content: "az webapp browse --name <app> --resource-group <rg>" },
              ],
            },
          },
          // ── Monitoring & Diagnostics ─────────────────────────────────────────
          {
            title: "Monitoring & Diagnostics",
            description: "Query activity logs, metrics and set up alerts",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List recent activity log entries", content: "az monitor activity-log list --offset 1h --output table" },
                { order: 1, language: "bash", label: "Filter activity log by resource group", content: "az monitor activity-log list --resource-group <rg> --offset 24h --output table" },
                { order: 2, language: "bash", label: "List metric definitions for a resource", content: "az monitor metrics list-definitions --resource <resource-id> --output table" },
                { order: 3, language: "bash", label: "Get metric values (CPU last hour)", content: "az monitor metrics list --resource <resource-id> --metric 'Percentage CPU' --interval PT5M --output table" },
                { order: 4, language: "bash", label: "List alert rules", content: "az monitor alert list --output table" },
                { order: 5, language: "bash", label: "List Log Analytics workspaces", content: "az monitor log-analytics workspace list --output table" },
                { order: 6, language: "bash", label: "Run KQL query against Log Analytics", content: "az monitor log-analytics query --workspace <workspace-id> --analytics-query 'AzureActivity | take 10' --output table" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Azure CLI cheatsheet: ${az.name} (${az.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
