---
layout: default
title: How do I use the preview extension tasks?
parent: FAQ
nav_order: 30
permalink: faq/shared_preview.html
---

# How do I use the preview extension tasks?

During development we create preview versions of the extension that can be shared with selected Azure DevOps accounts. This allows us to get feedback from users before the general release and helps iron out any bugs or problems.

If you have been selected to test our preview version the task names are slightly different. The following table shows the name of the tasks for both release and preview versions.

| Name | Release | Preview |
|---|---|---|
| Install Chef Components | `chef-software.chef-azdo.install.component` | `chef-software.chef-azdo-preview.install.component-preview` |
| Execute Chef Component | `chef-software.chef-azdo.execute.component` | `chef-software.chef-azdo-preview.execute.component-preview` |
| Chef Helpers | `chef-software.chef-azdo.helpers.helper` | `chef-software.chef-azdo-preview.helpers.helper-preview` |