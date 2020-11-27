---
layout: default
title: Execute
parent: Tasks
nav_order: 20
permalink: tasks/execute.html
---

# Execute Task
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef-azdo.execute.component`

The execute task is responsible for running any of the Chef components that are installed with Chef Workstation. The component to run is selected from a drop down list, the arguments are user configurable.

This task can be used as many times as necessary in a pipeline to execute any of the Chef commands.

{% include tip.html content="Configuration of different components, such as Habitat, Berkshelf, Test-Kitchen and chef-client are achieved using the relevant Helper task. This task does not support the configuration of the tools it runs." %}

## Parameters

The following table shows the parameters that are available to the task.

| Name | Required | Default Value | Description |
|---|---|---|---|
| Display Name | Yes | Execute | Display name of the task which will be shown in any log output.|
| Chef Component | Yes | | The chef software component to execute |
| Arguments | No | | Arguments to be passed to the component |
| Environment Variables | No | | If a command accepts environment variables as inputs they can be specified here |
| Working Directory | No | `$(Build.SourcesDirectory)` | Where the command will be run from |
| Sudo | No | false | If running on a Linux build agent use Sudo to execute the command |

Notes:
 - The display name will have the name of the component being executed appended (if it is not modified)
    - When running Test-Kitchen the display name will default to "Execute kitchen"
 - Any of the following Chef components can be selected for execution:
    - Berkshelf
    - Chef
    - Chef Infra Client
    - Habitat
    - Inspec
    - Knife
    - Test-Kitchen
 - By selecting the component to run _only_ that command has been configured, any sub-commands and options **must** be specified using the arguments field

## YAML

The Execute task can be used in an Azure DevOps  Pipeline file.

The following shows how to run Test Kitchen with a specific configuration file.

```yaml
- task: chef-software.chef-azdo.execute.component@2
  displayName: Execute kitchen
  inputs:
    component: kitchen
    arguments: test
    envvars: |
        KITCHEN_YAML="test/kitchen.yml"
```
