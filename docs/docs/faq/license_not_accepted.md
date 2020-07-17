---
layout: default
title: How do I fix error about license not being accepted?
parent: FAQ
nav_order: 10
permalink: faq/license_not_accepted.html
---

# How do I fix error about license not being accepted?

When using any Chef component, the license to use the software needs to be accepted. When it is a message similar to the following maybe seen:

`Chef Workstation cannot execute without accepting the license`

This will be in the output logs for a build, e.g.:

{% include image.html file="chef_license_error.png" caption="Running a task without accepting the license" %}

There are no built in tasks to accept the license. This has to be done using environment variables on the pipeline. Please refer to the [Accepting Chef Licenses](/license.html) page on information about how to accomplish this.