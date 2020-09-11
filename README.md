# Chef Extension for Azure DevOps

This is the repository for version 2 of the Chef extension for Azure DevOps.

The code is currently under development.

## Documentation

There are two ways to access the documentation.

### Published online

The first way is to access the published using Github Pages and is accessible from [http://chef-partners.github.io/azuredevops-chef-extension](http://chef-partners.github.io/azuredevops-chef-extension)

### Local documentation using Docker

The second way is run the documentation locally. This is useful if you are looking at changes to documentation in a new feature branch or are updating the docs.

This method requires that you have Docker installed on your local machine.

Run the following commands:

```bash
# Create a directory for the local cache of Gems. This speeds up the time it takes to stand up the documentation on subsequent runs.
mkdir -p local/bundlecache

# Run the documentation using the docker image for jekyll
docker run --rm -it --volume "${PWD}/docs/:/srv/jekyll" -v "${PWD}/local/bundlecache:/usr/local/bundle" -e JEKYLL_ENV=docker -p 4000:4000 jekyll/jekyll:3.8 jekyll serve --config _config.yml,_config.docker.yml
```

Once the container is running the documentation can be accessed from [http://localhost:4000](https://localhost:4000)
