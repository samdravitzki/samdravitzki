## Infrastructure as Code setup steps

The bicep template will handle automatically deploying the infrastructure but there are some manual steps required to set it up

### Steps used to authenticate the Github workflow

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

The workload identity needs two federated credentials, the first is used when a job isn't associated with a GitHub environment where the subject references the branch

```bash
az ad app federated-credential create \
  --id 64de58ca-29bc-4c15-8104-59f8c8b481c3 \
  --parameters '{
    "name": "samdravitzki-repo-branch",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:Brownstone-Inc/samdravitzki:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

The second is where the job references an environment in which case the subject references the environment. The workflow in this repo currently only has one environment called "production"

```bash
az ad app federated-credential create \
  --id 64de58ca-29bc-4c15-8104-59f8c8b481c3 \
  --parameters '{
    "name": "samdravitzki-repo-production-environment",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:Brownstone-Inc/samdravitzki:environment:production",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

#### 3. Create a resource group

So far all of the infrastructure in this repository can be deployed at the resource group scope so we need a resource group to deploy to. To create the resource group run the following command...

```
az group create --name rg-personal-site --location australiaeast
```

#### 4. Authorise the workload identity

To be able to modify and create resources in azure the workload identity needs to be authorised to do so in an entire subscription or resouce group.

To authorise the workload identity for the subscription it first needs a service principal (a.k.a Enterprise application). Which was done using the following command...

```bash
az ad sp create --id 71072f37-0c2e-42f5-863d-af3264b947eb
```

To be able to deploy infrastructure to the rg-personal-site resource group we need to assign the workload identity the Contributor role within it. Which can be done by running the following command...

```bash
az role assignment create \
  --assignee 71072f37-0c2e-42f5-863d-af3264b947eb \
  --role Contributor \
  --scope "/subscriptions/35a62e88-1914-49a8-b04c-aaf5e499fdd5/resourceGroups/rg-personal-site" \
  --description "The deployment workflow for the samdravitzki repo needs to be able to create resources within the rg-personal-site resource group"
```

#### 5. Use the workload identity in the github workflow

Using the `azure/login` action passing it the azure subscription, tenant and application (client) ids enables the workflow to sucessfully authenticate with azure enabling infrastructure to be deployed automatically to the rg-personal-site resource group

## Custom domains

The infrastructure as code will configure the www.dravitzki.com custom domain for the static site. The DNS associated with the then has to be configured with a CNAME record pointing to the auto generated domain name. The azure [article](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain-external) describes this process in detail

In the future I would like to use Azure DNS because it would be easy to futher automate configuration of the custom domain. I have chosen not to use it currently because it costs money. I would also like to configure the apex domain in the future.

Idea: have sites for each of my family members and associated static sites with each. i.e it could be funny to have a billy.dravitzki.com, luke.dravitzki.com...

## Resources

Main resource used - https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/learn-bicep

What are workload identities? - https://learn.microsoft.com/en-us/entra/workload-id/workload-identities-overview

Workload identity training module - https://learn.microsoft.com/en-us/training/modules/authenticate-azure-deployment-workflow-workload-identities/2-understand-workload-identities

End-to-end deployment scenario - https://learn.microsoft.com/en-us/training/modules/manage-end-end-deployment-scenarios-using-bicep-github-actions/4-exercise-set-up-environment?pivots=cli

## The future

I left out learning about [deployment stacks](https://learn.microsoft.com/en-us/training/modules/introduction-to-deployment-stacks/), next time I find myself working on iac I want to take a look into them
