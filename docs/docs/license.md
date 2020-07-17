---
permalink: /license.html
layout: default
title: License
nav_order: 20
---

# Accepting Chef Licenses

In order to use our products the necessary license needs to be accepted. This is not built into the tasks themselves, as a concious decision to accept the license needs to be made. In order to do this environment variables can be set to accept with the `CHEF_LICENSE` or the `HAB_LICENSE` or both.

There are two environment variables that can be set:

  - `CHEF_LICENSE` - used when using any component from Chef Workstation, e.g. chef, inspec
  - `HAB_LICENSE` - used when using Habitat

{% include note.html content="Azure DevOps will set any variable as an environment variable during the build" %}

Both of these variables can have `accept`, `accept-silent` and `accept-no-persist` set. It is recommended that `accept-no-persist` is used so that no flag file os created on a build server.

More information about using environment variables to accept the license can be found on the [Accepting the Chef License](https://docs.chef.io/chef_license_accept/) page on the Chef website.


## Using a YAML file

If you are using an Azure DevOps pipeline file for the build the environment variables can be set like so:

```yaml
# Place the variable declaration at the top of the pipeline file
variables:
    CHEF_LICENSE: accept-no-persist
    HAB_LICENSE: accept-no-persist
```

## Using Classic pipeline

You can set a variable for a build pipeline by following these steps:

  1. Go to the Pipelines page, select the appropriate pipeline, and then select Edit.
  2. Locate the Variables for this pipeline.
  3. Add or update the variable.
  4. To mark the variable as secret, select Keep this value secret.
  5. Save the pipeline.

{% include image.html file="azdo_classic_set_env_var.png" caption="Setting environment variables in the classic editor" %}