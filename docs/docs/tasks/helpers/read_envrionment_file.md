---
layout: default
title: Read Environment File
parent: Helpers
grand_parent: Tasks
permalink: /tasks/helpers/read_environment_file.html
---

# Setup Berkshelf
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef.helpers.helper`

During a build `.env` files maybe generated, as is the case with when Habitat builds a package. These `.env` files contain a lot of information about what has been built including the name and location etc. This can be very useful in later stages of the pipeline where the values can be reused.

![Read Environment File](../../images/helper_read_env_file.png)

This helper task reads in the specified file and checks if it exists. If it does exist then the file is read and the values set as environment variables. For example, a `myfile.env` file contains the following:

```env
var1=Hello
var2=World
```

Then the environment vars will be set as:

     - VAR1 = Hello
     - VAR2 = World

These can then be used in subsequent tasks using the `$(VAR1)` format.

## Parameters

The following table describes the options that are available for this helper.

| Name | Required | Default Value | Description | YAML Input name |
|---|---|---|---|---|
| Display name | true | Helper: | The name of the task which will be shown in the pipeline. This will take on the nae of the helper that has been chosen, e.g. `Helper: setupTestKitchen` | |
| Helpers | true | | A list of the helpers that can be used | `helper` |
| Environment File Path | true | | Path to the file containing the variables | `envFilePath` |

## YAML Snippet

This task can be used in an Azure DevOps pipelines file.

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: "Helper: Read Environment File"
  inputs:
    helper: readEnvFile
    envFilePath: $(Build.SourcesDirectory)/myfile.env
```