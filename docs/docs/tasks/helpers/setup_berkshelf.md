---
layout: default
title: Setup Berkshelf
parent: Helpers
grand_parent: Tasks
permalink: /tasks/helpers/setup_berkshelf.html
---

# Setup Berkshelf
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef.helpers.helper`

A cookbook and its dependencies can be uploaded to a Chef server using Berkshelf. However in order to use the command, a configuration file needs to created. This helper creates the configuration file based on the selected Chef Endpoint connected service.

![Setup Berkshelf](/images/helper_setup_berkshelf.png)

When executed the helper task will generate a Berkshelf configuration file as follows:

```json
{
    "chef": {
        "chef_server_url": "https://myautomate.example.com/organizations/mycompany",
        "client_key": "/tmp/client.pem",
        "node_name": "myuser"
    },
    "ssl": {
        "verify": true
    }
}
```

This file can be used as an argument to the execute task with the path `$(Agent.TempDirectory)/berks.json`.

## Parameters

The following table describes the options that are available for this helper.

| Name | Required | Default Value | Description | YAML Input name |
|---|---|---|---|---|
| Display name | true | Helper: | The name of the task which will be shown in the pipeline. This will take on the nae of the helper that has been chosen, e.g. `Helper: envCookbookVersion` | |
| Helpers | true | | A list of the helpers that can be used | `helper` |
| Endpoint | true | Name of the service connection containing the information from which the configuration will be setup | `chefendpoint` |

## YAML Snippet

This task can be used in an Azure DevOps pipelines file.

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: "Helper: Setup Berkshelf"
  inputs:
    helper: setupBerkshelf
    chefendpoint: mychefserviceconnection
```