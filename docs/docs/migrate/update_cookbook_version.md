---
layout: default
title: Update Cookbook Version Number
parent: Migration
permalink: /migrations/update_cookbook_version.html
---

# Update Cookbook Version Number

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-tasks-cookbook-version.vsts-chef-task-cookbook-version@1` |
| 3.x | `chef-software.chef.helpers.helper@3` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-tasks-cookbook-version.vsts-chef-task-cookbook-version@1
  displayName: 'Update cookbook version number'
  inputs:
    chefCookbookVersion: '$(Build.BuildNumber)'
    chefCookbookMetadata: '$(Build.SourcesDirectory)/cookbooks/mycookbook/metadata.rb1'
```

This needs to be migrated to the new "Helpers" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef-preview.helpers.helper-preview@3
  displayName: 'Helper: setCookbookVersion'
  inputs:
    helper: setCookbookVersion
    cookbookVersionNumber: '$(Build.BuildNumber)'
    cookbookMetadataPath: '$(Build.SourcesDirectory)/cookbooks/mycookbook/metadata.rb1'
```