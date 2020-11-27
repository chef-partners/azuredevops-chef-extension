---
layout: default
title: Habitat Package Install
parent: Migration
permalink: /migrations/habitat_package_install.html
---

# Habitat Install Package

As the previous Azure DevOps extensions for Chef are now being consolidated into this one extension the version numbers can be a little confusing. The latest version of Habitat extension is 3.x, and the latest version of this combined extension is 3.x.

| Extension Name | Version | Task Name |
|---|---|---|
| Habitat Extension | 3.x | `chef-software.vsts-habitat-tasks.vsts-habitat-tasks-pkg-install.vsts-habitat-pkg-install@3` |
| Chef Integration | 3.x | `chef-software.chef.execute.component@3` | 

The following YAML shows how to install Habitat using the Habitat Extension install task.

```yaml
- task: chef-software.vsts-habitat-tasks.vsts-habitat-tasks-pkg-install.vsts-habitat-pkg-install@3
  displayName: 'Package Install'
  inputs:
    habitatOrigin: 'Habitat Origin'
    habitatArtifactFolder: '$(System.DefaultWorkingDirectory)/$(System.TeamProject)-CI/drop'
    habitatLastBuildEnvPath: '$(System.DefaultWorkingDirectory)/$(System.TeamProject)-CI/drop/last_build.env'
```

This needs to be migrated to use one of the new Helper tasks and then the Chef Execute Component task. To achieve the same operation as before the following is required.

```yaml
- task: chef-software.chef.helpers.helper@3
  displayName: Configure Habitat
  inputs: 
    helper: setupHabitat
    habitatOrigin: Habitat Origin

- task: chef0software.chef.helpers.helper@3
  displayName: Read Habitat last_env file
  inputs:
    helper: readEnvFile
    envFilePath: $(System.DefaultWorkingDirectory)/$(System.TeamProject)-CI/drop/last_build.env

- task: chef-software.chef.execute.component@3
  displayName: Install Habitat Package
  inputs:
    component: habitat
    arguments: pkg install $(System.DefaultWorkingDirectory)/$(System.TeamProject)-CI/drop/$(PKG_ARTIFACT)
```