---
layout: default
title: Test Kitchen
parent: Migration
permalink: /migrations/test_kitchen.html
---

# Test Kitchen

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-task-test-kitchen.vsts-chef-task-test-kitchen@1` |
| 3.x | `chef-software.chef-azdo.execute.component@3` | 

The following is an example of the YAML to execute Test Kitchen in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-task-test-kitchen.vsts-chef-task-test-kitchen@1
  displayName: 'Execute Test Kitchen: verify'
  inputs:
    tkAzureEndpoint: 'Azure Creds'
    tkCommand: verify
    tkKitchenFile: .kitchen.yml
    tkKitchenFolder: $(Build.SourcesDirectory)
```

This needs to be migrated to use one of the new Helper tasks and then the Chef Execute Component task. To achieve the same operation as before the following is required.

```yaml
- task: chef-software.chef-azdo.helpers.helper@3
  displayName: Configure Test Kitchen
  inputs: 
    helper: setupTestKitchen
    azureendpoint: Azure Creds

- task: chef-software.chef-azdo.execute.component@3
  displayName: Run Test Kitchen
  inputs:
    component: kitchen
    arguments: verify 
    envvars: |
      KITCHEN_YAML=".kitchen.yml"
    workingdir: $(Build.SourcesDirectory)
```

