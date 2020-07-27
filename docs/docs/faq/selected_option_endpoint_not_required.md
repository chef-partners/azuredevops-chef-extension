---
layout: default
title: When I use the execute task, compulsory fields are not required, why?
parent: FAQ
nav_order: 20
permalink: faq/selected_option_endpoint_not_required.html
---

# When I use the execute task, compulsory fields are not required, why?

WHen configuring the execute task, the command that is going to be run has to be selected from a drop down list. Based on this selection different fields will appear to ask for additional information.

Unfortunately it is not possible to toggle the `required` setting of an input using a rule, it is a boolean value. This means that it is not possible to make the appropriate fields compulsory based on the selection from the drop down list.

It is annoying that these compulsory fields cannot be trapped at this level, however the tasks themselves will fail quickly if this information has been left blank and helpful information in the logs will state what needs to be done.