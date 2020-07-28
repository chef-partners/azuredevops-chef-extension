/**
 * TaskConfiguration is responsible for reading in all of the task parameters
 * and making them available to the task as an object.
 *
 * There are a number of helper tasks that exist, such as working out what platform the
 * task is being run on.
 *
 * The class will also set up values from the environment when running in DEV mode on a
 * local workstation
 *
 * @author Russell Seymour
 */

// import necessary libraries
import isAdmin = require("is-admin");
import isRoot = require("is-root");
import {platform} from "os"; // provides information about the operating system being run on
import {sprintf} from "sprintf-js"; // provides sprintf functionaility
import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps
import {str as toDotted} from "dot-object";
import { Inputs } from "./inputs";
import { Paths } from "./paths";

export class TaskConfiguration {

  // Initialise class properties

  public isDev: boolean = false; // Is the task running in development mode. This is so that the code extracts parameters from the envionment
  public runningAsRoot: boolean = false; // Is process running as a root
  private platformName: string = null;

  public Inputs: Inputs;
  public Paths: Paths; // Set an object containing all the paths. This will have defaults applied if empty based on the OS being run on
  public IsWindows: boolean = false; // State if running on Windows

  // constructor method which will determine some initial settings
  constructor() {

    // Determine if running in DEV mode
    // this is so that tasks cen be run on a local workstation if required
    this.isDev = process.env["NODE_ENV"] && process.env["NODE_ENV"].toUpperCase() === "DEV" ? true : false;

    // determine platform name
    // the testPlatform string can be used if and only if NODE is running in DEV mode
    this.platformName = platform();

    // determine defaults based on the platform
    switch (this.platformName) {
      case "win32":
        this.IsWindows = true;
        this.runningAsRoot = isAdmin();
        break;

      case "linux":
        this.runningAsRoot = isRoot();

        break;
      default:

        let msg = sprintf("%s is not a supported platform", this.platformName);
        // if here then the platform is not supported so fail the task
        this.FailTask(msg);
    }

    // Initialise sub classes based on the platform
    this.Paths = new Paths(this.platformName);
    this.Inputs = new Inputs();

  }

  public FailTask(msg: string) {
    if (this.isDev) {
      throw new Error(msg);
    } else {
      tl.setResult(tl.TaskResult.Failed, msg, true);
    }
  }

  /**
   * Gets the task parameters for the task
   *
   * @param required
   * @param serviceNames
   */
  public async getTaskParameters(serviceNames: {} = {}, connectedServiceNames: string[] = []): Promise<TaskConfiguration> {

    // let connectedServiceNames: string[] = [];

    // define a mapping of parameter names to object properties
    let mapping = {
      "arguments": "Inputs.Arguments",
      "channel": "Inputs.Channel",
      "component": "Inputs.ComponentName",
      "cookbookMetadataPath": "Inputs.CookbookMetadataPath",
      "cookbookName": "Inputs.CookbookName",
      "cookbookVersionNumber": "Inputs.CookbookVersionNumber",
      "cookbookVersionRegex": "Inputs.CookbookVersionRegex",
      "environmentName": "Inputs.EnvironmentName",
      "envvars": "Inputs.EnvVars",
      "forceInstall": "Inputs.ForceInstall",
      "gemName": "Inputs.GemName",
      "habitatOrigin": "Inputs.HabitatOriginName",
      "habitatOriginPublicKey": "Inputs.HabitatOriginPublicKey",
      "habitatOriginRevision": "Inputs.HabitatOriginRevision",
      "habitatOriginSigningKey": "Inputs.HabitatOriginSigningKey",
      "helper": "Inputs.Helper",
      "password": "Inputs.Password",
      "sslVerify": "Inputs.SSLVerify",
      "sudo": "Inputs.UseSudo",
      "targetPath": "Inputs.TargetPath",
      "targetUrl": "Inputs.TargetURL",
      "username": "Inputs.Username",
      "version": "Inputs.Version"
    };

    try {
      // iterate around the mapping and set the object values
      for (let paramName in mapping) {

        // get the parameter value
        let value = this.getParamValue(paramName, false, "input");

        // Set the property on the object with the value
        if (value !== "undefined") {
          toDotted(mapping[paramName], value, this);
        }
      }

      // output information to the log
      this.log("Running as root: %s", await this.runningAsRoot);
      if (!this.IsWindows) {
        this.log("Using sudo: %s", this.Inputs.SudoIsSet());
      }

    } catch (error) {
      throw new Error(sprintf("Task failed during initialisation. Error: %s", error.message));
    }

    // determine if a service name is required based on the helper name
    tl.debug(sprintf("Helper '%s': %s", this.Inputs.Helper, Object.keys(serviceNames).join(", ")));
    if (Object.keys(serviceNames).includes(this.Inputs.Helper)) {
      connectedServiceNames = serviceNames[this.Inputs.Helper];
    }

    // determine if a service name is required based on the componentName
    switch (this.Inputs.ComponentName) {
      case "chefclient":
        connectedServiceNames = ["chefendpoint"];
        break;
      case "kitchen":
        connectedServiceNames = ["azureendpoint"];
        break;
      case "habitat":
        connectedServiceNames = ["habitatendpoint"];
        break;
    }

    tl.debug(sprintf("Number of connected service requested: %d", connectedServiceNames.length));

    // if a connected service has been specified, then attempt to get the necessary information
    if (connectedServiceNames.length > 0) {

      // iterate around the connected service names that have been supplied
      for (let connectedServiceName of connectedServiceNames) {

        // get the connected service from the inputs
        let connectedService = this.getParamValue(connectedServiceName, false, "input");

        tl.debug(sprintf("Getting connected service: %s", connectedService));

        // get the properties based on the name of the endpoint
        switch (connectedServiceName) {

          // Set the properties for an chef endpoint type
          case "chefendpoint": {

            this.Inputs.TargetURL = this.getParamValue("url", true, "url", connectedService);
            this.Inputs.SSLVerify = !!+this.getParamValue("sslVerify", true, "data", connectedService);
            // this.Inputs.Username = this.getParamValue("username", true, "auth", connectedService);
            // this.Inputs.Password = this.getParamValue("password", true, "auth", connectedService);

            // get the username and the key using the authorization
            let chefAuth = tl.getEndpointAuthorization(connectedService, true);
            this.Inputs.Username = chefAuth.parameters.username;
            this.Inputs.Password = chefAuth.parameters.password;

            tl.debug(
              sprintf("SSL Verify: %s", this.Inputs.SSLVerify)
            );

            tl.debug(
              sprintf("Username: %s", this.Inputs.Username)
            );

            break;
          }

          // set the necessary properties for a Habitat Endpoint
          case "habitatOrigin":

            this.Inputs.HabitatDepotURL = this.getParamValue("url", true, "url", connectedService); // tl.getEndpointUrl(connectedServiceName, true);
            this.Inputs.HabitatOriginName = this.getParamValue("originName", true, "data", connectedService); // tl.getEndpointDataParameter(connectedServiceName, "originName", true);
            this.Inputs.HabitatOriginRevision = this.getParamValue("revision", true, "data", connectedService); // tl.getEndpointDataParameter(connectedServiceName, "revision", true);
            this.Inputs.HabitatOriginPublicKey = this.getParamValue("publicKey", true, "data", connectedService); // tl.getEndpointDataParameter(connectedServiceName, "publicKey", true);
            this.Inputs.HabitatOriginSigningKey = this.getParamValue("signingKey", true, "auth", connectedService); // tl.getEndpointAuthorizationParameter(connectedServiceName, "signingKey", true);
            this.Inputs.HabitatAuthToken = this.getParamValue("authToken", true, "auth", connectedService); // tl.getEndpointAuthorizationParameter(connectedServiceName, "authToken", true);

            tl.debug(sprintf("this.Inputs.HabitatDepotURL: '%s'", this.Inputs.HabitatDepotURL));

            break;

          // set the properties for an Azure endpoint type, which could be used by TK
          case "azureendpoint": {

            let azureAuth = tl.getEndpointAuthorization(connectedService, true);

            this.Inputs.SubscriptionId = tl.getEndpointDataParameter(connectedService, "SubscriptionID", true);
            this.Inputs.TenantId = azureAuth.parameters.tenantid;
            this.Inputs.ClientId = azureAuth.parameters.serviceprincipalid;
            this.Inputs.ClientSecret = azureAuth.parameters.serviceprincipalkey;

            break;
          }
        }
      }
    }

    // configure environment variables that may have been set
    this.setEnvVars();

    // return the object to the calling function
    return this;
  }

  public log(message: any, ...params: any[]) {
    console.log(message, ...params);
  }

  /**
   * Reads the envvars that have been set on the task and sets them as environment
   * variables in the build
   */
  public setEnvVars() {

    // return if the envvars is empty
    if (this.Inputs.EnvVars === undefined || this.Inputs.EnvVars === null) {
      return;
    }

    // configure the regex pattern to find the K/V pairs
    let regexp: RegExp = /((.*)=(.*)$)/mg;

    // get the matches from the string
    let matches = this.Inputs.EnvVars.match(regexp);

    // if there are any matches, use the capture groups to get the name and the value
    // and then set as environment using the tl library
    if (matches.length > 0) {
      for (let match in matches) {
        tl.setVariable(match[2], match[3]);
      }
    }

    // if the component is kitchen then set the azure variables
    if (this.Inputs.ComponentName === "kitchen") {
      tl.setVariable("AZURE_CLIENT_ID", this.Inputs.ClientId);
      tl.setVariable("AZURE_CLIENT_SECRET", this.Inputs.ClientSecret);
      tl.setVariable("AZURE_TENANT_ID", this.Inputs.TenantId);
    }
  }

  private getParamValue(name: string, required: boolean, type: string = null, connectedService: string = null): string {

    // initialise variable to hold the return value
    let value = null;

    // if running in development mode get all the value from the environment
    if (this.isDev) {
      value = process.env[name.toUpperCase()];
    } else {

      // based on the type, get the parameter value using the correct method in the task library
      switch (type) {
        case "auth":
          // get sensitive data from the endpoint, e.g. auth token or password
          tl.debug(sprintf("[%s] Attempting to retrieve authorization parameter: %s", connectedService, name));
          value = tl.getEndpointAuthorizationParameter(connectedService, name, required);
          break;
        case "data":
          // get non-sensitive data from the endpoint
          tl.debug(sprintf("[%s] Attempting to retrieve data from endpoint: %s", connectedService, name));
          value = tl.getEndpointDataParameter(connectedService, name, required);
          break;
        case "input":
          // get the value from the task parameters
          tl.debug(sprintf("Attempting to retrieve input: %s", name));
          value = tl.getInput(name, required);
          break;
        case "url":
          // get the endpoint URL from the connected service
          tl.debug(sprintf("[%s] Attempting to retrieve endpoint URL", connectedService));
          value = tl.getEndpointUrl(connectedService, required);
          break;
        default:
          throw new Error(sprintf("Input type has not been specified: %s\nIf you are seeing this it is a bug", name));
      }
    }

    // return the value to the calling function
    tl.debug(sprintf("Value: %s", value));
    return value;
  }
}