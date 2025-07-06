## Manual steps

The bicep template will handle automatically deploying the infrastructure but there are some manual steps required to set it up

### Steps used to authenticate the github workflow

A workload identity is a type of identity used to authenticate a software workload.

For the github workflow to be able to deploy and manage infrastructure in azure it needs to authenticate for which it uses a workload identity

The following are the steps followed to enable this repos github workflow to authenticate against azure enabling it to deploy and manage infrastructure through bicep

#### 1. Created an App Registration

Using the following command create an application registration for the github workflow

```bash
az ad app create --display-name 'Github workflow - Sam Dravitzki'
```

The application was created with an 
- appId of `71072f37-0c2e-42f5-863d-af3264b947eb`
- and ad objectId of `64de58ca-29bc-4c15-8104-59f8c8b481c3`
which are used to reference the app registration

_An application registration is a type of workload identity_

#### 2. Create federated credentials

Federated credentials are are a form of credential workflows can use to sign into azure by telling Azure that it can trust Gihub. This trust between two services is what federation is and its cool because it means the workflow can authenciate without any secrets

The federation credential used for this repo is defined in the following JSON file called policy.json

```json
{
  "name": "SamdravitzkiFederatedCredential",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:Brownstone-Inc/samdravitzki:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}
```

The federated credential can then be created by running the following Azure CLI command

```bash
az ad app federated-credential create \
  --id 64de58ca-29bc-4c15-8104-59f8c8b481c3 \
  --parameters ./iac/policy.json
```

#### 3. Authorise the workload identity

To be able to modify and create resources in azure the workload identity needs to be authorised to do so in an entire subscription or resouce group.

To authorise the workload identity for the subscription it first needs a service principal (a.k.a Enterprise application). Which was done using the following command...

```bash
az ad sp create --id 71072f37-0c2e-42f5-863d-af3264b947eb
```

The bicep used for this project creates a resource group and so the service principal requires the Contributor role over the entire subscription. Which can be done by running the following command...

```bash
az role assignment create \
  --assignee 71072f37-0c2e-42f5-863d-af3264b947eb \
  --role Contributor \
  --scope "/subscriptions/35a62e88-1914-49a8-b04c-aaf5e499fdd5" \
  --description "The deployment workflow for the samdravitzki repo needs to be able to create resources and resource groups within the subscription"
```

_Should change it so the resource group is created manually so the workload identity only needs access over a resource group. Later down the line we could look at automating the resource group creation but currently there is not much benefit as it requires additional complexity and security risk_

#### 4. Use the workload identity in the github workflow


## Resources

Main resource used - https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/learn-bicep

What are workload identities? - https://learn.microsoft.com/en-us/entra/workload-id/workload-identities-overview

Workload identity training module - https://learn.microsoft.com/en-us/training/modules/authenticate-azure-deployment-workflow-workload-identities/2-understand-workload-identities
