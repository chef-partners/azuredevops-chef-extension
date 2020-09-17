---
layout: default
title: Signing Origin Key
parent: Migration
permalink: /migrations/habitat_origin.html
---

# Signing Origin Key

As the previous Azure DevOps extensions for Chef are now being consolidated into this one extension the version numbers can be a little confusing. The latest version of Habitat extension is 3.x, but the latest version of this combined extension is 2.x.

| Extension Name | Version | Task Name |
|---|---|---|
| Habitat Extension | 3.x | `chef-software.vsts-habitat-tasks.vsts-habitat-tasks-signing-key.vsts-habitat-signing-key@3` |
| Chef Integration | 2.x | `chef-software.chef.install.component@2` | 

The following YAML shows how to install Habitat using the Habitat Extension install task.

```yaml
steps:
- task: chef-software.vsts-habitat-tasks.vsts-habitat-tasks-signing-key.vsts-habitat-signing-key@3
  displayName: 'Signing Origin Key: install'
  inputs:
    habitatOrigin: 'Habitat Oirgin'
```

This needs to be migrated to use one of the new Helper tasks. To achieve the same operation as before the following is required.

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: Configure Habitat
  inputs: 
    helper: setupHabitat
    habitatOrigin: My Origin
```