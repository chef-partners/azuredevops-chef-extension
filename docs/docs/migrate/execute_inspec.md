---
layout: default
title: Execute InSpec
parent: Migration
permalink: /migrations/execute_inspec.html
---

# Execute InSpec

| Version | Task Name |
|---|---|
| 1.x | `vsts-chef-task-exec-inspec@1` |
| 2.x | `chef-software.chef.execute.component@2` | 

The following is an example of the yaml required to execute InSpec in version 1.x of the extension.

```yaml
- task: vsts-chef-task-exec-inspec@1
  displayName: Run InSpec Tests
  inputs:
    inspecProfilePath: $(Build.SourcesDirectory)
    inspecArguments: $(Build.SourcesDirectory) --input-file $(Build.SourcesDirectory)/attributes.yml -t docker://$(DOCKER_CONTAINER_ID)
    inspecResultsFile: $(Build.SourcesDirectory)/results/inspec-test-results.xml
```

This needs to be migrated to the new "Execute Chef Component" task. So to achieve the same operation the following would be required.

```yaml
- task: chef-software.chef.execute.component@2
  displayName: Run InSpec Tests
  inputs:
    component: inspec
    arguments: $(Build.SourcesDirectory) --input-file $(Build.SourcesDirectory)/attributes.yml -t docker://$(DOCKER_CONTAINER_ID) --reporter cli junit:$(Build.SourcesDirectory)/results/inspec-test-results.xml
    workingdir: $(Build.SourcesDirectory)
```

As this is now using a generic execution task for the different Chef Components the `workingdir` can be used to set the path to the InSpec profiles so that InSpec is run in the correct location.