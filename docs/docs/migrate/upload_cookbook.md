---
layout: default
title: Upload Cookbook to Chef Server
parent: Migration
permalink: /migrations/upload_cookbook.html
---

# Upload Cookbook to Chef Server

| Version | Task Name |
|---|---|
| 1.x | `chef-software.vsts-chef-tasks.vsts-chef-tasks-cookbook-upload.vsts-chef-task-cookbook-upload@1` |
| 3.x | `chef-software.chef.execute.component@3` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: chef-software.vsts-chef-tasks.vsts-chef-tasks-cookbook-upload.vsts-chef-task-cookbook-upload@1
  displayName: 'Upload cookbook to Chef Server'
  inputs:
    chefServerEndpoint: 'Chef Server'
    chefCookbookPath: '$(Build.SourcesDirectory)/cookbooks'
```

This needs to be migrated to the new "Helpers" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef.helpers.helper@3
  displayName: Configure Berkshelf
  inputs: 
    helper: setupBerkshelf
    chefendpoint: Automate Server

- task: chef-software.chef.execute.component@3
  displayName: Install Berks dependencies
  inputs:
    component: berks
    arguments: install
    workingdir: $(Build.SourcesDirectory)/cookbooks

- task: chef-software.chef.execute.component@3
  displayName: Upload Cookbooks
  inputs:
    component: berks
    arguments: upload -c $(Agent.TempDirectory)/berks.json
    workingdir: $(Build.SourcesDirectory)/cookbooks    
```