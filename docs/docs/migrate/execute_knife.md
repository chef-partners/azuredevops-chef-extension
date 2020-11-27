---
layout: default
title: Execute Knife
parent: Migration
permalink: /migrations/execute_knife.html
---

# Execute Knife

| Version | Task Name |
|---|---|
| 1.x | chef-software.vsts-chef-tasks.vsts-chef-task-exec-knife.vsts-chef-task-exec-knife@1 |
| 3.x | `chef-software.chef.execute.component@3` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-task-exec-knife.vsts-chef-task-exec-knife@1
  displayName: 'Execute Knife'
  inputs:
    knifeArguments: spork info
    knifeEndpoint: Automate Server
```

This needs to be migrated to the new "Execute Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef.helpers.helper@3
  displayName: Configure Chef
  inputs: 
    helper: setupChef
    chefendpoint: Automate Server

- task: chef-software.chef.execute.component@3
  displayName: Execute knife
  inputs:
    component: knife
    arguments: spork info
```

In the previous version the task handled the configuration of knife by downloading the keys etc. This has now been split out into a separate task so that it can be done just once and the `chef-client` and `knife` commands can use the same configuration.

The generated files are places into the agent's temp directory which is deleted at the end of each run.