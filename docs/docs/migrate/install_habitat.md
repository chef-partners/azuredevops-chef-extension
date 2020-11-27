---
layout: default
title: Install Habitat
parent: Migration
permalink: /migrations/install_habitat.html
---

# Install Habitat

As the previous Azure DevOps extensions for Chef are now being consolidated into this one extension the version numbers can be a little confusing. The latest version of Habitat extension is 3.x, and the latest version of this combined extension is 3.x.

| Extension Name | Version | Task Name |
|---|---|---|
| Habitat Extension | 3.x | `chef-software.vsts-habitat-tasks.vsts-habitat-tasks-install.vsts-habitat-install@3` |
| Chef Integration | 3.x | `chef-software.chef-azdo.install.component@3` | 

The following YAML shows how to install Habitat using the Habitat Extension install task.

```yaml
- task: chef-software.vsts-habitat-tasks.vsts-habitat-tasks-install.vsts-habitat-install@3
  displayName: 'Install Habitat'
```

This needs to be migrated to the new "Execute Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef-azdo.install.component@3
  displayName: Install Habitat
  inputs:
    component: habitat
    sudo: true
```
