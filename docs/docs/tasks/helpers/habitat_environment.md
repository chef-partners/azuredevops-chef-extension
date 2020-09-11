---
layout: default
title: Setup Habitat Environment
parent: Helpers
grand_parent: Tasks
permalink: /tasks/helpers/habitat_environment.html
---

# Setup Habitat Environment
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef.helpers.helper`

When using the Helpers task the operation to be performed is selected from the dropdown menu. Once selected the required extra options will be displayed. The following screenshot shows the form after the 'Setup Habitat Environment' operation has been selected.

![Setup Habitat Environment](/images/helper_habitat_environment.png)

When working with Habitat a nunmber of files needs to be written out, these are the signing key pair of your origin, the origin itself and the revision. This task performs those operations.

{% include note.html contents="To use this helper a [Habitat Service Connection](/service_connections/habitat.html) must have been created beforehand" %}

## Parameters

The following table describes the options that are available for this helper.

| Name | Required | Default Value | Description | YAML Input name |
|---|---|---|---|---|
| Display name | true | Helper: | The name of the task which will be shown in the pipeline. This will take on the nae of the helper that has been chosen, e.g. `Helper: setupHabitat` | |
| Helpers | true | | A list of the helpers that can be used | `helper` |
| Habitat Origin | true |  | The Habitat service connection to be used in the task | `habitatOrigin` |


## YAML Snippet

This task can be used in an Azure DevOps pipelines file.

```yaml
- task: chef-software.chef.helpers.helper@2
  displayName: "Helper: Setup Habitat Environment"
  inputs:
    helper: setupHabitat
    habitatOrigin: myorigin
```

