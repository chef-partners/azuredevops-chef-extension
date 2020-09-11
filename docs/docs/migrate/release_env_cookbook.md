---
layout: default
title: Release Cookbook Version to Environment
parent: Migration
permalink: /migrations/release_env_cookbook.html
---

# Release Cookbook Version to Environment

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-tasks-environment-cookbook-version-constraint.vsts-chef-task-env-version-constraint@1` |
| 2.x | `chef-software.chef.execute.component@2` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-tasks-environment-cookbook-version-constraint.vsts-chef-task-env-version-constraint@1
  displayName: 'Release cookbook version to environment'
  inputs:
    chefServerEndpoint: 'Chef Server'
    chefEnvName: myenv
    chefCookbookName: mycookbook
```

This needs to be migrated to use one of the new Helper tasks and then the Chef Execute Component task. To achieve the same operation as before the following is required.

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: Configure Chef
  inputs: 
    helper: setupChef
    chefendpoint: Automate Server

- task: chef-software.chef-preview.helpers.helper-preview@2
  displayName: 'Helper: envCookbookVersion'
  inputs:
    helper: envCookbookVersion
    cookbookVersionNumber: '1.0.$(Build.BuildNumber)'
    environmentName: 'myenv'
    cookbookName: mycookbook
```
