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
// import * as isRoot from "is-root";
// import * as isAdmin from "is-admin";
import isAdmin = require("is-admin");
import isRoot = require("is-root");
import {platform} from "os"; // provides information about the operating system being run on
import {sprintf} from "sprintf-js"; // provides sprintf functionaility
import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps
import {join as pathJoin} from "path";
import {str as toDotted} from "dot-object";
import {homedir} from "os";

class Inputs {
  public ComponentName: string = null; // Name of the software component being installed or executed
  public GemName: string = null; // If the component is a gem, state the gem to be installed
  public ForceInstall: boolean = false; // Force the installation of the software
  public UseSudo: boolean = false; // Should Sudo be used for the operations
  public Version: string = null; // The version of the software component to install
  public Channel: string = null; // WHat channel should the software component be installed from
  public TargetPath: string = null; // The path to download software to
  public Arguments: string = null; // Arguments that need to be passed to the component being executed
  public EnvVars: string = null; // EnvVars that have been requested on the task

  // Declare properties to be used for determining the helper to run
  public Helper: string = null; // the helper that needs to be run
  public CookbookVersionNumber: string = null; // the version number to assign to the cookbook
  public CookbookMetadataPath: string = null; // path to the metadata file to update
  public CookbookVersionRegex: string = null; // regex pattern to use to update the version number in a cookbook

  // Declare properties to be used for accessing Chef based servers
  public TargetURL: string = null; // Server URL as defined in the service endpoint
  public SSLVerify: boolean = true; // State if SSL verification should be performed when using the TargetURL
  public Username: string = null; // Username, nodename or clientname to be used when interacting wit the specified server
  public Password: string = null; // Password, client key or user key when a username is specified

  // Declare properties for the Habitat configuration
  public HabitatDepotURL: string = null; // URL to the Habitat Depot to which the package will be published
  public HabitatOriginName: string = null; // Name of the origin to use when building the package
  public HabitatOriginRevision: string = null; // Revision of the origin keys
  public HabitatOriginPublicKey: string = null; // Public key of the specified origin
  public HabitatOriginSigningKey: string = null; // Private key or signing key of the origin
  public HabitatAuthToken: string = null; // Habitat authentication token

  // Declare properties for Azure credentials when using Test Kitchen
  public SubscriptionId: string = null;
  public TenantId: string = null;
  public ClientId: string = null;
  public ClientSecret: string = null;

  public SudoIsSet(): boolean {
    let result: any = this.UseSudo;
    if (typeof result === "string") {
      result = (result === "true");
    }
    return result;
  }

  public ForceIsSet(): boolean {
    let result: any = this.ForceInstall;
    if (typeof result === "string") {
      result = (result === "true");
    }
    return result;
  }
}

class Paths {
  public Berks: string = null;
  public BerksConfig: string = null;
  public Chef: string = null;
  public ChefClient: string = null;
  public ChefWorkstationDir: string = null;
  public Habitat: string = null;
  public InspecEmbedded: string = null;
  public Inspec: string = null;
  public Kitchen: string = null;
  public Knife: string = null;
  public PrivateKey: string = null;
  public Script: string = null;
  public Sudo: string = "/usr/bin/sudo";
  public TmpDir: string;

  /**
   * Depending on the OS the correct defaults will be set on the paths
   * @param osName Name of the operating system that the task is running o
   */
  constructor(osName: string, runningAsRoot: boolean) {

    let extension: string = "";

    // Set the TmpDir to the path of the agent environment variable
    this.TmpDir = process.env.AGENT_TEMPDIRECTORY;

    if (osName === "win32") {
      extension = ".bat";
      this.ChefWorkstationDir = pathJoin("C:", "opscode", "chef-workstation");
      this.Inspec = pathJoin("C:", "opscode", "inspec", "bin", "inspec.bat");
      this.Habitat = pathJoin("C:", "ProgramData", "Habitat", "hab.exe");

      // set the path to the installation script
      this.Script = pathJoin(this.TmpDir, "install.ps1");
    } else {
      this.ChefWorkstationDir = pathJoin("/", "opt", "chef-workstation");
      this.Inspec = pathJoin("/", "usr", "bin", "inspec");
      this.Habitat = pathJoin("/", "bin", "habitat");

      // set the path to the installation script
      this.Script = pathJoin(this.TmpDir, "install.sh");
    }

    // set the path to the individual commands based on the workstation dir
    this.Chef = pathJoin(this.ChefWorkstationDir, "bin", sprintf("chef%s", extension));
    this.ChefClient = pathJoin(this.ChefWorkstationDir, "bin", sprintf("chef-client%s", extension));
    this.Berks = pathJoin(this.ChefWorkstationDir, "bin", sprintf("berks%s", extension));
    this.InspecEmbedded = pathJoin(this.ChefWorkstationDir, "bin", sprintf("inspec%s", extension));
    this.Kitchen = pathJoin(this.ChefWorkstationDir, "bin", sprintf("kitchen%s", extension));
    this.Knife = pathJoin(this.ChefWorkstationDir, "bin", sprintf("knife%s", extension));

    // determine the full path to the privatekey
    // this starts by working it out the name of the file
    // this is done so that multiple keys can be written out by several tasks if so required
    let filenameParts = [];
    let privKeyFilename = "";
    filenameParts.push("azdo");
    process.env.AGENT_ID ? filenameParts.push(process.env.AGENT_ID) : false;
    process.env.RELEASE_ENVIRONMENTID ? filenameParts.push(process.env.RELEASE_ENVIRONMENTID) : false;
    privKeyFilename = sprintf("%s.pem", filenameParts.join("-"));

    // set the full path to the private key
    this.PrivateKey = pathJoin(this.TmpDir, privKeyFilename);

    // set the path to the berks configuration file
    let berksConfigFilename = sprintf("berks.%s.json", filenameParts.join("-"));
    this.BerksConfig = pathJoin(this.TmpDir, berksConfigFilename);
  }

  /**
   * As InSpec can be installed as a separate smaller package, there can be two locations
   * for it. This method attempts to return the path to inspec, starting with the path to the
   * standalone version.
   * If neither path exists then false is returned
   */
  public GetInspecPath(): string {

    let result: string = null;

    // check to see if the inspec paths exist
    if (tl.exist(this.Inspec)) {
      result = this.Inspec;
    } else if (tl.exist(this.InspecEmbedded)) {
      result = this.InspecEmbedded;
    }

    return result;
  }

  /**
   * Get the path for the component
   */
  public GetPath(name: string): string {

    let path: string = null;

    // perform a switch on the name of the component and return the path to it
    switch (name) {
      case "chef":
        path = this.Chef;
        break;
      case "chef-client":
        path = this.ChefClient;
        break;
      case "habitat":
        path = this.Habitat;
        break;
      case "knife":
        path = this.Knife;
        break;
      case "inspec":
        path = this.GetInspecPath();
        break;
      case "kitchen":
        path = this.Kitchen;
        break;
    }

    return path;
  }
}

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
    this.Paths = new Paths(this.platformName, this.runningAsRoot);
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
   * @param connectedServiceName
   */
  public async getTaskParameters(connectedServiceNames: string[] = []): Promise<TaskConfiguration> {

    // define a mapping of parameter names to object properties
    let mapping = {
      "component": "Inputs.ComponentName",
      "gemName": "Inputs.GemName",
      "forceInstall": "Inputs.ForceInstall",
      "sudo": "Inputs.UseSudo",
      "version": "Inputs.Version",
      "channel": "Inputs.Channel",
      "targetPath": "Inputs.TargetPath",
      "arguments": "Inputs.Arguments",
      "envvars": "Inputs.EnvVars",
      "helper": "Inputs.Helper",
      "cookbookVersionNumber": "Inputs.CookbookVersionNumber",
      "cookbookMetadataPath": "Inputs.CookbookMetadataPath",
      "cookbookVersionRegex": "Inputs.CookbookVersionRegex"
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

    // if a connected service has been specified, then attempt to get the necessary information
    if (connectedServiceNames.length > 0) {

      // iterate around the connected service names that have been supplied
      for (let connectedServiceName of connectedServiceNames) {

        // get the connected service from the inputs
        let connectedService = this.getParamValue(connectedServiceName, true, "input");

        // get the properties based on the name of the endpoint
        switch (connectedServiceName) {

          // Set the properties for an chef endpoint type
          case "chefendpoint": {

            // this.Inputs.TargetURL = tl.getEndpointUrl(connectedServiceName, true);
            this.Inputs.TargetURL = this.getParamValue("url", true, "url", connectedServiceName);
            // this.Inputs.SSLVerify = !!+tl.getEndpointDataParameter(connectedServiceName, "sslVerify", true);
            this.Inputs.SSLVerify = !!+this.getParamValue("sslVerify", true, "data", connectedServiceName);
            // this.Inputs.Username = tl.getEndpointAuthorizationParameter(connectedServiceName, "username", true);
            this.Inputs.Username = this.getParamValue("username", true, "auth", connectedServiceName);
            // this.Inputs.Password = tl.getEndpointAuthorizationParameter(connectedServiceName, "password", true);
            this.Inputs.Password = this.getParamValue("password", true, "auth", connectedServiceName);

            tl.debug(
              sprintf("SSL Verify: %s", this.Inputs.SSLVerify)
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

            let azureAuth = tl.getEndpointAuthorization(connectedServiceName, true);

            this.Inputs.SubscriptionId = tl.getEndpointDataParameter(connectedServiceName, "SubscriptionID", true);
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