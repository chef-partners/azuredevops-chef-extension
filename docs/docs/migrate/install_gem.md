---
layout: default
title: Install Gem
parent: Migration
permalink: /migrations/install_gem.html
---

# Install Gem

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-task-gem-install.vsts-chef-task-gem-install@1` |
| 3.x | `chef-software.chef-azdo.execute.component@3` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-task-gem-install.vsts-chef-task-gem-install@1
  displayName: 'Install Gem: knife-acl'
  inputs:
    gemName: knife-spork
    gemVersion: 1.7.3
```

This needs to be migrated to the new "Execute Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef-azdo.execute.component@3
  displayName: Install Gem
  inputs:
    component: chef
    arguments: gem install knife-spork --version 1.7.3
```
