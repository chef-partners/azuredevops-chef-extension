---
layout: default
title: Why do the task names have chef-azdo in them?
parent: FAQ
nav_order: 20
permalink: faq/azdo_in_task_name.html
---

# Why do the task names have chef-azdo in them?

Chef provides numerous extensions for the Visual Studio suite of products, including Azure DevOps and Visual Studio Code.

Our extension for VS Code has an id of `chef-software.chef` which was what the Azure DevOps extension was trying to use. However when it came to publishing the release version it became clear there was a clash. To get around this clash and enable our uses to distinguish between the two the Azure DevOps extension has the name of `chef-software.chef-azdo`.