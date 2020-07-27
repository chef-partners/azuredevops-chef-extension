---
layout: default
title: Set Cookbook Version on Chef Environment
parent: Helpers
grand_parent: Tasks
nav_order: 30
permalink: /tasks/helpers/env_version_constraint.html
---

# Set Cookbook Version on Chef Environment
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef.helpers.helper`

Chef provides a mechanism whereby cookbook versions can be constraint on an environment. This means that a production environment can be constrained to version `1.0.0` of a cookbook whilst the development environment has not such constraint and can work with the latest and greatest version of the same cookbook.

This helper task sets the cookbook and the version it should work with on the specified environment.

![Set Version Constraint](/images/helper_env_version_constraint.png)

Under the covers this helper performs the following operations:

  1. Download the environment as a JSON file using `knife`, e.g.
     - `knife environment show myenv -F json > %TEMPDIR%/myenv.json`
  2. Manipulate the JSON so that it contains a `cookbook_versions` element and add the cookbook name and specified version to it.
  3. Use `knife` to upload the updated file to the Chef server, e.g.
     - `knife environment from file %TEMPDIR%/myenv.json`

{% include warning.html content="It is imperative that the helper task [Setup Chef](/tasks/helpers/setup_chef.md) is run before this in the pipeline so that the configuration exists for Knife to use." %}

## Parameters

The following table describes the options that are available for this helper.

| Name | Required | Default Value | Description | YAML Input name |
|---|---|---|---|---|
| Display name | true | Helper: | The name of the task which will be shown in the pipeline. This will take on the nae of the helper that has been chosen, e.g. `Helper: envCookbookVersion` | |
| Helpers | true | | A list of the helpers that can be used | `helper` |
| Version Number | true | `$(Build.BuildNumber)` | Version of the cookbook that the environment should be constrained to | `cookbookVersionNumber` |
| Environment Name | true | "" | Name of the environment to set the constraint on | `envrionmentName` |
| Cookbook Name |  true | "" | Name of the cookbook to constrain | `cookbookName` |

## YAML Snippet

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: "Helper: Set Cookbook Version on Chef Environment"
  inputs:
    helper: envCookbookVersion
    cookbookVersionNumber: $(Build.BuildNumber)
    environmentName: myenv
    cookbookName: mycookbook
```