---
layout: default
title: Install
parent: Tasks
nav_order: 10
permalink: tasks/install.html
---

# Install Task
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta :}

1. TOC
{:toc}

## Description

Pipeline task name: `chef-software.chef-azdo.install.component`

The Install task is responsible for installing the following components on the Azure DevOps agent:

 - Chef Workstation
 - Habitat
 - Inspec
 - Gem (this is installed in the Chef context)

This task can be used as many times as necessary in a pipeline to install all the necessary components for the build.

## Parameters

The following table shows the parameters that are available on the task.

| Name | Required | Default Value | Description |
|---|---|---|---|
| Install Component | Yes | | Install Chef Workstation, Habitat, InSpec or a Gem |
| Gem Name | No | | If installing a Gem the name of the Gem to install |
| Force Install | No | false | Install the component even if it is already installed |
| Use Sudo | No | false | On a linux agent use Sudo to install the component |
| Version | No | | The version of the software to install. If not specified the latest version will be installed |
| Channel | No | stable | Channel from which the component should be installed. Does not apply to Gems |
| Target Path | No | | If specified the install will attempt to install the component from this file. Does not apply to Gems |

## YAML Snippet

The Install task can be used in an Azure DevOps Pipelines file.

The following shows how to install Chef Workstation on the agent using Sudo.

```yaml
- task: chef-software.chef-azdo.install.component@3
  displayName: Install Chef Component
  inputs:
    component: chef-workstation
    sudo: true
```