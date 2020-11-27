---
layout: default
title: Install Cookbook Gems
parent: Migration
permalink: /migrations/install_cookbook_gems.html
---

# Install Cookbook Gems

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-task-cookbook-gems.vsts-chef-task-cookbook-gems@1` |
| 3.x | `chef-software.chef.execute.component@3` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-task-cookbook-gems.vsts-chef-task-cookbook-gems@1
  displayName: 'Install Cookbook Gems'
```

This needs to be migrated to the new "Execute Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef.execute.component@3
  displayName: Install Cookbook Gems
  inputs:
    component: chef
    arguments: exec bundle
    workingdir: $(Build.SourcesDirectory)
```
