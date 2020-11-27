---
layout: default
title: Install InSpec
parent: Migration
permalink: /migrations/install_inspec.html
---

# Install InSpec

{% include note.html content="InSpec is included in Chef Workstation so this task is not necessarily required. However if you wish to install a standalone version of InSpec this is is how to migrate" %}

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-task-install-chefdk.vsts-chef-task-install-inspec@1` |
| 3.x | `chef-software.chef-azdo.install.component@3` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-task-install-inspec.vsts-chef-task-install-inspec@1
  displayName: 'Install InSpec'
```

This needs to be migrated to the new "Install Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef-azdo.install.component@3
  displayName: Install inspec
  inputs:
    component: inspec
    sudo: true
```
