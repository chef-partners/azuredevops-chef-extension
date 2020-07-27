---
layout: default
title: Habitat Service Connection
parent: Service Connections
nav_order: 20
permalink: service_connections/habitat.html
---

# Habitat Service Connection
{: .no_toc :}

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Whenever Habitat is executed, it needs to know who it is running as. This is done using the private and public keys of your Habitat profile from https://bldr.habitat.sh.

So that these are not added to your pipeline, and therefore possibly into source control, the extension provides a Service Connection to store the information.

{% include note.html content="Service Connections are accessed in the project by going to **Project Settings** -> **Service connections**" %}

## Service Connection Form

The following screen shot shows the service connection form for Habitat.

![Habitat Service Connection](/images/service_connection_habitat.png)

## Properties

There are a number of settings on the form, the following table shows what each of the settings are for.

| Name | Description | Required | Example |
|---|---|---|---|
| Habitat Depot URL | The URL to the Habitat Depot to use. If not using a private depot this should be `https://bldr.habitat.sh` | true | `https://bldr.habitat.sh` |
| Origin Name | Name of the origin to use when building the package | true | `myorigin` |
| Revision | The revision of the origin that should be used | true | `202004210743` |
| Public Key | Public key used to sign the packages | true | |
| Signing Key | Private key for the specified origin | true | |
| Habitat Auth Token | Habitat authentication token for the user | true | |
| Service Connection Name | Name of the connection. This is will what we will be seen in the drop down to select | true | |
| Description | Description of the Habitat configuration | false | |
