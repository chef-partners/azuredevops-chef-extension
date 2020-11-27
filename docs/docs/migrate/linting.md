---
layout: default
title: Linting
parent: Migration
permalink: /migrations/linting.html
---

# Linting

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-task-linting.vsts-chef-task-linting@1` |
| 3.x | `chef-software.chef-azdo.execute.component@3` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-task-linting.vsts-chef-task-linting@1
  displayName: 'Cookbook Lint: chefspec'
  inputs:
    lintAction: chefspec
```

This needs to be migrated to the new "Execute Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef-azdo.execute.component@3
  displayName: 'Cookbook Lint: chefspec'
  inputs:
    component: chef
    arguments: exec rspec
    workingdir: $(Build.BuildSources)
```
