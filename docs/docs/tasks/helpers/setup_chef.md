---
layout: default
title: Setup Chef
parent: Helpers
grand_parent: Tasks
permalink: /tasks/helpers/setup_chef.html
---

# Setup Chef
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef.helpers.helper`

In order to use the `chef-client` or `knife` commands a configuration file is required. This task sets up the `config.rb` file that is used by these commands and configures it with the settings as provided on the task as well as writing out the key.

![Setup Chef](../../images/helper_setup_chef.png)

{% include note.html content="The files are written out the agent's temporary directory which is deleted after every pipeline, this ensures that no configuration or private keys are left on the agent" %}

When the file has been written out the following environment variables are set and can be used in later stages of the pipeline:

  - KNIFE_HOME (See [Setting up Knife](https://docs.chef.io/workstation/knife_setup/) for more information)
  - CHEF_CONFIG

## Parameters

The following table describes the options that are available for this helper.

| Name | Required | Default Value | Description | YAML Input name |
|---|---|---|---|---|
| Display name | true | Helper: | The name of the task which will be shown in the pipeline. This will take on the nae of the helper that has been chosen, e.g. `Helper: setCookbookVersion` | |
| Helpers | true | | A list of the helpers that can be used | `helper` |
| Endpoint | true | Name of the service connection containing the information from which the configuration will be setup | `chefendpoint` |

## YAML Snippet

This task can be used in an Azure DevOps pipelines file.

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: "Helper: Setup Chef"
  inputs:
    helper: setupChef
    chefendpoint: mychefserviceconnection
```
