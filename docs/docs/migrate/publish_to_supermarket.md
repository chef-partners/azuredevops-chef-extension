---
layout: default
title: Publish Cookbook to Supermarket
parent: Migration
permalink: /migrations/publish_to_supermarket.html
---

# Linting

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-task-cookbook-publish-supermaket.vsts-chef-task-cookbook-publish-supermaket@1` |
| 3.x | `chef-software.chef.execute.component@3` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
steps:
- task: chef-software.vsts-chef-tasks.vsts-chef-task-cookbook-publish-supermaket.vsts-chef-task-cookbook-publish-supermaket@1
  displayName: 'Publish cookbook to Supermarket'
  inputs:
    chefSupermarketEndpoint: 'Chef Supermarket'
    chefCookbookName: mycookbook
```

This needs to be migrated to the new "Execute Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef.helpers.helper@3
  displayName: Configure Chef
  inputs: 
    helper: setupChef
    chefendpoint: Chef Supermarket

- task: chef-software.chef.execute.component@3
  displayName: 'Publish cookbook to Supermarket'
  inputs:
    component: knife
    arguments: supermarket share mycookbook -m https://mysupermarket.example.com
    workingdir: $(Build.SourcesDirectory)/cookbooks
```
