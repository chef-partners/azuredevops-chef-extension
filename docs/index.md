---
permalink: /
layout: home
title: Overview
nav_order: 10
---

{% include warning.html content="This site documents the new tasks in the soon to be released Azure DevOps Chef extension version 2.4.x. It is currently in preview. If you were looking for documentation on the current version please click [here](https://github.com/chef-partners/azuredevops-chef/wiki)" %}

# Overview

The Azure DevOps Extension provides a number of tasks that can be added to a pipeline. These tasks allow of the installation and execution of Chef components, such as:

 - Install Chef-Workstation, Habitat, InSpec or a Gem (into the Chef context)
 - Upload a cookbook to a Chef server
 - Create an upload policy files

{% include note.html content="This a complete refactor of version 1.x of the extension. All of the task names have changed and there are fewer tasks." %}

The tasks included in the extension are:

 - [Install Chef Component](/tasks/install.html) - Chef Workstation, Habitat, InSpec or a Gem can be installed using this task
 - [Helpers](/tasks/helpers.html) - Helper tasks used to update a cookbook version or setup the Habitat environment

## Licensing

To be able to use any Chef component the necessary license has to be accepted. This is **not** built into the tasks as a conscious decision to accept the license needs to be made. This is done by setting the relevant variable in the pipeline to accept the Chef or Habitat license. More information about this can be found on the [Accepting Chef Licenses](license.html) page.

