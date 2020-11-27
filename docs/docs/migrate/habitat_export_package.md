---
layout: default
title: Habitat Package Upload
parent: Migration
permalink: /migrations/habitat_package_upload.html
---

# Habitat Upload Package

As the previous Azure DevOps extensions for Chef are now being consolidated into this one extension the version numbers can be a little confusing. The latest version of Habitat extension is 3.x, and the latest version of this combined extension is 3.x.

| Extension Name | Version | Task Name |
|---|---|---|
| Habitat Extension | 3.x | `chef-software.vsts-habitat-tasks.vsts-habitat-tasks-pkg-export.vsts-habitat-pkg-export@3` |
| Chef Integration | 3.x | `chef-software.chef.execute.component@3` | 

The following YAML shows how to install Habitat using the Habitat Extension install task.

```yaml
- task: chef-software.vsts-habitat-tasks.vsts-habitat-tasks-pkg-export.vsts-habitat-pkg-export@3
  displayName: 'Package Export'
  inputs:
    habitatOrigin: 'Habitat Origin'
    habitatPackagePath: '$(Build.SourcesDirectory)/results/$(pkg_artifact)'
    habitatPackageChannel: unstable
```

To achieve the same operation using the new extension tasks the following would be required.

{% include warning.html content="This assumes that the Habitat plan has already been built so that the `last_build.env` file exists" %}

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
  displayName: Export Habitat Package
  inputs:
    component: habitat
    arguments: pkg export docker --url https://bldr.habitat.sh --channel unstable $(Build.SourcesDirectory)/results/$(pkg_artifact)
```