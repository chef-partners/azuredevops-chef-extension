/**
 * Helpers is responsible for performing tasks such as updating a cookbook version
 * and other tasks that do not fit into the Install or Execute tasks
 *
 * @author Russell Seymour
 */

import { TaskConfiguration } from "./taskConfiguration";
import { Utils } from "./utils";
import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps
import {sprintf} from "sprintf-js"; // provides sprintf functionaility
import {join as pathJoin, dirname} from "path";
import {config as envFromFile} from "dotenv";
import * as ex from "./executeComponent";

 /**
  * Class to handle the execution of the utlities that can be selected
  */
export class Helpers {

  /**
   * TaskConfiguration object containing all the supplied parameters
   * and paths.
   */
  private taskConfiguration: TaskConfiguration;

  /**
   * Utils object containing common methods
   */
  public utils: Utils;

  /**
   * Creates a new instance of the class
   *
   * @param taskConfiguration The current task configuration
   */
  constructor (taskConfiguration: TaskConfiguration) {
    this.taskConfiguration = taskConfiguration;
  }

  /**
   * Run determines what utility has been selected and then performs the necessary
   * operations to complete that utility
   */
  public async Run() {

    // initialise method properties
    let serviceNames = {
      "setCookbookVersion": [],
      "setupHabitat": ["habitatOrigin"],
      "envCookbookVersion": [],
      "setupBerkshelf": ["chefendpoint"],
      "setupChef": ["chefendpoint"],
      "setupTestKitchen": ["azureendpoint"]
    };

    // configure the task parameters and setup the utils
    await this.taskConfiguration.getTaskParameters(serviceNames, []);
    this.utils = new Utils(this.taskConfiguration);

    // determine the method to run based on the utility that has been chosen
    switch (this.taskConfiguration.Inputs.Helper) {

      case "envCookbookVersion": {
        this.setEnvCookbookVersion();
        break;
      }

      case "readEnvFile": {
        this.readEnvironmentFile();
        break;
      }

      case "setCookbookVersion": {
        this.setCookbookVersion();
        break;
      }

      case "setupBerkshelf": {
        this.setupBerkshelf();
        break;
      }

      case "setupChef": {
        this.setupChef();
        break;
      }
      case "setupHabitat": {
        this.setupHabitatEnvironment();
        break;
      }

      case "setupTestKitchen": {
        this.setupTestKitchenEnvironment();
        break;
      }

    }
  }

  /**
   * Sets the specified version number in the cookbook metadata.rb
   * This is a public function so it can be tested
   */
  public setCookbookVersion() {

    tl.debug("Attempting to set cookbook version on environment");

    // check that the metadata file exists, if it does not fail the tasl
    if (!tl.exist(this.taskConfiguration.Inputs.CookbookMetadataPath)) {
      tl.setResult(tl.TaskResult.Failed, sprintf("Cookbook metadata file cannot be found: %s", this.taskConfiguration.Inputs.CookbookMetadataPath));
      return;
    }

    console.log("Cookbook metadata file: %s", this.taskConfiguration.Inputs.CookbookMetadataPath);
    console.log("Attempting to set cookbook version: %s", this.taskConfiguration.Inputs.CookbookVersionNumber);

    // replace the version number in the metadata file
    // this uses the regular expression as set in the parameters for the task to set the replacement
    // create the regular expression from the string
    let pattern = new RegExp(this.taskConfiguration.Inputs.CookbookVersionRegex, "gm");

    // replace the version number in the cookbook file
    try {

      // let results = replaceSync(options);

      this.utils.ReplaceInFile(
        this.taskConfiguration.Inputs.CookbookMetadataPath,
        pattern,
        sprintf("version '%s'", this.taskConfiguration.Inputs.CookbookVersionNumber)
      );

    } catch (err) {
      tl.setResult(tl.TaskResult.Failed, err.message);
    }
  }

  /**
   * Takes the settings from the specified Habitat Origin endpoint and creates the files
   * and environment variables needed for the Habitat to operate
   */
  public setupHabitatEnvironment() {

    tl.debug("Attempting to configure Habitat environment");

    // configure paths for the configuration file and keys
    let originBaseText: string = sprintf("%s-%s", this.taskConfiguration.Inputs.HabitatOriginName, this.taskConfiguration.Inputs.HabitatOriginRevision);

    // create anonymous object to hold the path to the public and signing keys
    let keyPaths: any = {
      public: pathJoin(this.taskConfiguration.Paths.TmpDir, sprintf("%s.pub", originBaseText)),
      signing: pathJoin(this.taskConfiguration.Paths.TmpDir, sprintf("%s.sig.key", originBaseText))
    };

    console.log("Creating keys files and configuration");

    // Ensure that the directories exist
    if (!tl.exist(dirname(keyPaths.public))) {
      tl.mkdirP(dirname(keyPaths.public));

      console.log("Creating Habitat keys directory: %", dirname(keyPaths.public));
    }

    // Write out the keys files
    tl.debug(sprintf("Writing public key file: %s", keyPaths.public));
    tl.writeFile(keyPaths.public, this.taskConfiguration.Inputs.HabitatOriginPublicKey);

    tl.debug(sprintf("Writing out signing key file: %s", keyPaths.signing));
    tl.writeFile(keyPaths.signing, this.taskConfiguration.Inputs.HabitatOriginSigningKey);

    // Configure Habitat environment variables so Hab knows where to look for keys and set the origin name
    tl.debug(sprintf("Setting environment variable for HAB_ORIGIN: %s", this.taskConfiguration.Inputs.HabitatOriginName));
    tl.setVariable("HAB_ORIGIN", this.taskConfiguration.Inputs.HabitatOriginName);
    tl.debug(sprintf("Setting environment variable for HAB_CACHE_KEY_PATH: %s", dirname(keyPaths.public)));
    tl.setVariable("HAB_CACHE_KEY_PATH", dirname(keyPaths.public));

  }

  /**
   * setEnvCookbookVersion sets a version constraint of a specific cookbook on the specified environment
   *
   * This is accomplished using three stages:
   *   1. Use knife to download the environment as a JSON file
   *   2. Update the environment file with the version contraint for the cookbook
   *   3. Use knife to upload the updated environment to the chef server
   */
  public setEnvCookbookVersion() {

    // check that the environemnt variable KNIFE_HOME has been set
    let knifeHome: string = tl.getVariable("KNIFE_HOME");
    if (!knifeHome) {
      tl.error("The KNIFE_HOME env var is not set. Please use the 'Setup Chef' helper task before using this one");
      return;
    }

    // determine the path to the environment file
    let envFile: string = pathJoin(this.taskConfiguration.Paths.TmpDir, sprintf("%s.json", this.taskConfiguration.Inputs.EnvironmentName));

    // Update inputs with the required arguments so that the executeCmd can be called
    this.taskConfiguration.Inputs.ComponentName = "knife";
    this.taskConfiguration.Inputs.Arguments = sprintf("environment show %s -F json",
        this.taskConfiguration.Inputs.EnvironmentName);
        // envFile);

    // create an instance of the executeComponent class so that the execution methods can be used
    let executeComponent = new ex.ExecuteComponent(this.taskConfiguration, this.utils);
    executeComponent.Execute(true);

    // should the command that has been run
    tl.debug(this.utils.getCommandStack()[0]);

    // Check that the environment file has been written out and error if it has not
    /*
    if (!tl.exist(envFile)) {
      tl.error(sprintf("Unable to find to downloaded environment file: %s", envFile));
      return;
    }
    */

    // read in the json file so that the environment can be updated
    // let envStr: string = readFileSync(envFile).toString();
    let result = executeComponent.result ? executeComponent.result : "{}";
    let chefEnvironment = JSON.parse(result);

    // check to see if the env has a "cookbook_versions" segment, add it if not
    if (!("cookbook_versions" in chefEnvironment)) {
      tl.debug("Adding missing section to the Chef environment");
      chefEnvironment["cookbook_versions"] = {};
    }

    // add the constraint to the version
    tl.debug(sprintf("Adding constraint for cookbook '%s' version '%s': %s",
      this.taskConfiguration.Inputs.CookbookName,
      this.taskConfiguration.Inputs.CookbookVersionNumber,
      this.taskConfiguration.Inputs.EnvironmentName));

    chefEnvironment["cookbook_versions"][this.taskConfiguration.Inputs.CookbookName] = this.taskConfiguration.Inputs.CookbookVersionNumber;

    // wrote out the json to the env file
    let envStr = JSON.stringify(chefEnvironment);
    tl.writeFile(envFile, envStr);
    tl.debug(envStr);

    // Update the arguments for knife to upload the environment file
    this.taskConfiguration.Inputs.Arguments = sprintf("environment from file %s", envFile);
    executeComponent.updateConfiguration(this.taskConfiguration);
    executeComponent.Execute(true);

    // should the command that has been run
    tl.debug(this.utils.getCommandStack()[1]);
  }

  /**
   * setupChef is responsible for configuring the `config.rb` file with the data from the endpoint and then
   * setting the environment variable for the `knife` or `chef-client` commands to use to find the file
   *
   * This is so that the command does not have to have all of the options set on the command line
   */
  public setupChef() {

    // Define the path to the client key
    let clientKeyPath: string = pathJoin(this.taskConfiguration.Paths.ConfigDir, "client.pem");
    let configPath: string = pathJoin(this.taskConfiguration.Paths.ConfigDir, "config.rb");

    // correct the slashes for the path so that Ruby accepts it
    let _clientKeyPath = clientKeyPath.replace(/\\/g, "/");

    // Build up the string to be used as the config.rb
    let config = sprintf(`
node_name       "%s"
client_key      "%s"
chef_server_url "%s"
    `, this.taskConfiguration.Inputs.Username, _clientKeyPath, this.taskConfiguration.Inputs.TargetURL);

    // ensure that the configdir exists
    if (!tl.exist(this.taskConfiguration.Paths.ConfigDir)) {
      tl.debug(sprintf("Creating Chef config directory: %s", this.taskConfiguration.Paths.ConfigDir));
      tl.mkdirP(this.taskConfiguration.Paths.ConfigDir);
    }

    // write out the files
    console.log("Writing out configuration files");
    console.log(clientKeyPath);
    tl.writeFile(clientKeyPath, this.taskConfiguration.Inputs.Password);
    console.log(configPath);
    tl.writeFile(configPath, config);

    // write out the contents of the config if in debug
    tl.debug(config);

    // set environment variables for knife
    tl.setVariable("KNIFE_HOME", dirname(configPath));
    tl.setVariable("CHEF_CONFIG", configPath);
  }

  /**
   * setupBerkshelf is responsible for configuring the Berkshelf configuration file with the data from the endpoint and then
   * setting the environment variable for the `berks` command
   *
   * This is so that the command does not have to have all of the options set on the command line
   */
  public setupBerkshelf() {

    // Define the path to the client key
    let clientKeyPath: string = pathJoin(this.taskConfiguration.Paths.ConfigDir, "berks-client.pem");
    let berksConfigPath: string = pathJoin(process.env.AGENT_TEMPDIRECTORY, "berks.json");

    // ensure that the configdir exists
    if (!tl.exist(this.taskConfiguration.Paths.ConfigDir)) {
      tl.debug(sprintf("Creating Chef config directory: %s", this.taskConfiguration.Paths.ConfigDir));
      tl.mkdirP(this.taskConfiguration.Paths.ConfigDir);
    }

    // create object for the config so it can be turned into JSON
    let config = JSON.stringify({
      chef: {
        chef_server_url: this.taskConfiguration.Inputs.TargetURL,
        client_key: clientKeyPath,
        node_name: this.taskConfiguration.Inputs.Username
      },
      ssl: {
        verify: this.taskConfiguration.Inputs.SSLVerify
      }
    });

    // write out the files
    console.log("Writing out configuration files");
    console.log(clientKeyPath);
    tl.writeFile(clientKeyPath, this.taskConfiguration.Inputs.Password);
    console.log(berksConfigPath);
    tl.writeFile(berksConfigPath, config);

    // write out the contents of the config if in debug
    tl.debug(config);
  }

  /**
   * setupTestKitchenEnvironment sets the necessary environment variables for running
   * Test Kitchen in Azure. Its will set the following env vars:
   *
   *  AZURE_CLIENT_ID
   *  AZURE_CLIENT_SECRET
   *  AZURE_TENANT_ID
   */
  public setupTestKitchenEnvironment() {

    // set the environment variables required for TK to access Azure
    tl.setVariable("AZURE_CLIENT_ID", this.taskConfiguration.Inputs.ClientId);
    tl.setVariable("AZURE_CLIENT_SECRET", this.taskConfiguration.Inputs.ClientSecret);
    tl.setVariable("AZURE_TENANT_ID", this.taskConfiguration.Inputs.TenantId);
  }

  /**
   * readEnvironmentFile reads the specified file, if it exists, and makes the variables
   * available as environment variables. This only works with `k=v` lines
   */
  public readEnvironmentFile() {

    // determine if the specified file exists
    if (!tl.exist(this.taskConfiguration.Inputs.EnvFilePath)) {
      tl.setResult(
        tl.TaskResult.Failed,
        sprintf("Unable to find the specified environment file: %s", this.taskConfiguration.Inputs.EnvFilePath)
      );
      return;
    }

    // read in the file and set as env vars
    envFromFile(
      {
        path: this.taskConfiguration.Inputs.EnvFilePath
      }
    );
  }
}