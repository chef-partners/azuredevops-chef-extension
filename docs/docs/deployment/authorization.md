---
permalink: deployment/authorization.html
layout: default
title: Authorization
nav_order: 20
parent: Deployment
---

{% include warning.html content="This section is intended for the maintainers of the Chef Extension and is not required for normal usage of the extension. The information here is relevant to anyone wishing to publish their own extension." %}

# Authorization

In order to publish an extension to the Azure DevOp Marketplace a valid AzDo token is required. This is generated in the [Chef Software](https://dev.azure.com/chef-software) Azure DevOps organisation.

Currently the build is configured to use the 'AzDo Publish Extension - Progress' Service Connection in AzDo. (This defined on [line 6](https://github.com/chef-partners/azuredevops-chef-extension/blob/master/azure-pipelines.yaml#L6) of the pipeline file.)

This token has the following properties:

 - **Organization** - All accessible organizations
 - **Expiration** - Custom defined (the current token has an expiry of 2021-11-31)
 - **Scopes** - Custom Defined
    - **Marketplace** - Publish

For more information on how to create tokens refer to [Publish from the command line](https://docs.microsoft.com/en-us/azure/devops/extend/publish/command-line?view=azure-devops.)

Whenever the token is modified a new Service Connection in the AzDo project will need to be created and the pipeline file updated to use this new service connection.

It is very important that a Personal Access Token (PAT) is used that has been generated for the 'chef-software' organisation as this is the name under which the extension is piblished. Any other token created for another org will result in a conflict being raised stating that the extension already exists.