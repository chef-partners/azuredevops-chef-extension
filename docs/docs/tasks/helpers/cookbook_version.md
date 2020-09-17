---
layout: default
title: Set Cookbook Version
parent: Helpers
grand_parent: Tasks
permalink: /tasks/helpers/cookbook_version.html
---

# Set Cookbook Version
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef.helpers.helper`

When using the Helpers task the operation to be performed is selected from the dropdown menu. Once selected the required extra options will be displayed. The following screenshot shows the form after the 'Set Cookbook Version' operation has been selected.

![Set Cookbook Version Number](../images/helper_set_cookbook_version.png)

This helper will set the specified version number in the cookbook metadata file. This allows the use of an Azure DevOps pipeline to manage cookbooks.

## Parameters

The following table describes the options that are available for this helper.

| Name | Required | Default Value | Description | YAML Input name |
|---|---|---|---|---|
| Display name | true | Helper: | The name of the task which will be shown in the pipeline. This will take on the nae of the helper that has been chosen, e.g. `Helper: setCookbookVersion` | |
| Helpers | true | | A list of the helpers that can be used | `helper` |
| Version Number | true | `$(Build.BuildNumber)` | The version that the cookbook should be set to | `cookbookVersionNumber` |
| Cookbook Metadata File | true | `$(Build.SourcesDirectory)/metadata.rb` | Path to the cookbook metadata file in which the version number should be set | `cookbookMetadataPath` |
| Version Regex | true | `version\s+['"]?.*['"]?` | Regular expression to use to perform the replacement | `cookbookVersionRegex` |

## YAML Snippet

This task can be used in an Azure DevOps pipelines file.

### Using default values

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: "Helper: Set Cookbook Version"
  inputs:
    helper: setCookbookVersion
```

As can be seen if the default values for the version, cookbook metadata file path and version regex are sufficient then the task can be used as is.

### Using custom values

In the following example the path to the cookbook metadata file is nested so the default value needs to be overridden.

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: "Helper: Set Cookbook Version"
  inputs:
    helper: setCookbookVersion
    cookbookMetadataPath: '$(Build.SourcesDirectory)/mycookbook/metadata.rb'
```