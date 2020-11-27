---
layout: default
title: Setup Test Kitchen
parent: Helpers
grand_parent: Tasks
permalink: /tasks/helpers/setup_test_kitchen.html
---

# Setup Berkshelf
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef-azdo.helpers.helper`

The "Execute Chef Component" task allows the execution of Test Kitchen. To make Test Kitchen work correctly with Azure it requires credential information from a service principal. This needs to be configured as a Azure RM Service connection and selected in the helper configuration.

![Setup Test Kitchen](../../images/helper_setup_test_kitchen.png)

When run the helper will set the following environment variables which Test Kitchen will use to authenticate against Azure.

 - AZURE_CLIENT_ID - The service principal ID, often to referred to as the AppId
 - AZURE_CLIENT_SECRET - Secret associated with the specified service principal
 - AZURE_TENANT_ID - The ID of the tenant that the service principal was generated in

{% include tip.html content="The Test Kitchen component can be run against any environment by using the environment variables in the task configuration. This helper helps to configure TK specifically for Azure" %}

## Parameters

The following table describes the options that are available for this helper.

| Name | Required | Default Value | Description | YAML Input name |
|---|---|---|---|---|
| Display name | true | Helper: | The name of the task which will be shown in the pipeline. This will take on the nae of the helper that has been chosen, e.g. `Helper: setupTestKitchen` | |
| Helpers | true | | A list of the helpers that can be used | `helper` |
| Azure RM Endpoint | true | | Name of the configured Service Connection containing the required credentials | `azureendpoint` |

## YAML Snippet

This task can be used in an Azure DevOps pipelines file.

```yaml
- task: chef-software.chef-azdo.helpers.helper@2
  displayName: "Helper: Setup Test Kitchen"
  inputs:
    helper: setupTestKitchen
    azureendpoint: myazurecredentials
```