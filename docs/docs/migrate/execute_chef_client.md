---
layout: default
title: Execute Chef Client
parent: Migration
permalink: /migrations/execute_chef_client.html
---

# Execute Chef Client

| Version | Task Name |
|---|---|
| 1.x | `vsts-chef-task-exec-chef-client@1` |
| 2.x | `chef-software.chef.execute.component@2` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: vsts-chef-task-exec-chef-client@1
  displayName: Execute Chef Client
```

This needs to be migrated to the new "Execute Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: Configure Chef
  inputs: 
    helper: setupChef
    chefendpoint: Automate Server

- task: chef-software.chef.execute.component@2
  displayName: Run Chef Client
  inputs:
    component: chefclient
```

In the past the ability to execute `chef-client` was designed for Deployment Groups. However as this is now part of the component task it can be run anywhere.

In the above example the Chef client configuration file is written out using the [Configure Chef](/tasks/helpers/setup_chef.html) helper task.