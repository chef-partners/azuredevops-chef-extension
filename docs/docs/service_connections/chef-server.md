---
layout: default
title: Chef Server Service Connection
parent: Service Connections
nav_order: 10
permalink: service_connections/chefserver.html
---

# Chef Server Service Connection
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

In order to communicate with the Chef Server, `chef-client` needs to be configured with credentials. This service connection can also be used for pushing information to a Chef Automate server.

So that these are not added in clear text in your pipeline, and therefore possibly into source control, the extension provides a Service Connection to store your Chef credentials.

{% include note.html content="Service Connections are accessed in the project by going to **Project Settings** -> **Service connections**" %}

## Service Connection Form

The following screen shot shows the service connection form for a Chef Server.

![Chef Server Service Connection](/images/service_connection_chef_server.png)

## Properties

There are a number of settings on the form, the following table describes each of the parameters.

| Name | Description | Required | Default Value | Example |
|---|---|---|---|
| Target URL | The URL to the Chef Server, this must include the organisation as well | Yes | | https://chef-server.example.com/orgs/foobar |
| SSL Verification | If using a server with a self-signed certificate this can be set to false | No | True | True |
| Username | Username to use when authenticating | Yes | | russells |
| Password | Password or the private key for the specified username | Yes | | mystrongpassword |
| Service Connection Name | The name of the service connection, this will be how it is referenced in pipelines | Yes | | My Chef Server |
