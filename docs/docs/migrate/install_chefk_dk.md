---
layout: default
title: Install ChefDK
parent: Migration
permalink: /migrations/install_chefdk.html
---

# Install ChefDK

{% include note.html content="It is not possible to install ChefDK with version 2.x of the extension. It has been replaced with Chef Workstation" %}

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-task-install-chefdk.vsts-chef-task-exec-inspec@1` |
| 2.x | `chef-software.chef.install.component@2` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-task-install-chefdk.vsts-chef-task-install-chefdk@1
  displayName: 'Install ChefDK'
```

This needs to be migrated to the new "Install Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef.install.component@2
  displayName: Install chef-workstation
  inputs:
    component: chef-workstation
    sudo: true
```
