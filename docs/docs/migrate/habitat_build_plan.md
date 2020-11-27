---
layout: default
title: Habitat Build Plan
parent: Migration
permalink: /migrations/habitat_build_plan.html
---

# Habitat Build Plan

As the previous Azure DevOps extensions for Chef are now being consolidated into this one extension the version numbers can be a little confusing. The latest version of Habitat extension is 3.x, and the latest version of this combined extension is 3.x.

| Extension Name | Version | Task Name |
|---|---|---|
| Habitat Extension | 3.x | `chef-software.vsts-habitat-tasks.vsts-habitat-tasks-build.vsts-habitat-build@3` |
| Chef Integration | 3.x | `chef-software.chef.execute.component@3` | 

The following YAML shows how to install Habitat using the Habitat Extension install task.

```yaml
- task: chef-software.vsts-habitat-tasks.vsts-habitat-tasks-build.vsts-habitat-build@3
  displayName: 'Build Habitat plan'
  inputs:
    habitatOrigin: 'Habitat Origin'
    habitatSrcPath: '$(Build.SourcesDirectory)'
    habitatPlanContext: habitat
```

This needs to be migrated to use one of the new Helper tasks and then the Chef Execute Component task. To achieve the same operation as before the following is required.

```yaml
- task: chef-software.chef.helpers.helper@3
  displayName: Configure Habitat
  inputs: 
    helper: setupHabitat
    habitatOrigin: Habitat Origin

- task: chef-software.chef.execute.component@3
  displayName: Build Habitat Plan
  inputs:
    component: habitat
    arguments: pkg build -s $(Build.SourcesDirectory) habitat
```