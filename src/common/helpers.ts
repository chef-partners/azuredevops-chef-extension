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
import * as ex from "./executeComponent";
import { readFileSync } from "fs";

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
      "envCookbookVersion": ["chefendpoint"],
      "setupChef": ["chefendpoint"]
    };

    // configure the task parameters and setup the utils
    await this.taskConfiguration.getTaskParameters(serviceNames[this.taskConfiguration.Inputs.Helper]);
    this.utils = new Utils(this.taskConfiguration);

    // determine the method to run based on the utility that has been chosen
    switch (this.taskConfiguration.Inputs.Helper) {
      case "setCookbookVersion": {
        this.setCookbookVersion();
        break;
      }
      case "setupHabitat": {
        this.setupHabitatEnvironment();
        break;
      }
      case "setupChef": {
        this.setupChef();
        break;
      }
      case "envCookbookVersion": {
        this.setEnvCookbookVersion();
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

    console.log("Creating keys files an configuration");

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
    tl.debug(sprintf("Knife home: '%s'", knifeHome));
    if (knifeHome === "" || knifeHome === "undefined") {
      tl.error("The KNIFE_HOME env var is not set. Please use the 'Setup Chef' helper task before using this one");
      return;
    }

    // determine the path to the environment file
    let envFile: string = pathJoin(this.taskConfiguration.Paths.TmpDir, sprintf("%s.json", this.taskConfiguration.Inputs.EnvironmentName));

    // Update inputs with the required arguments so that the executeCmd can be called
    this.taskConfiguration.Inputs.ComponentName = "knife";
    this.taskConfiguration.Inputs.Arguments = sprintf("environment show %s -F json > %s", this.taskConfiguration.Inputs.EnvironmentName, envFile);

    // create an instance of the executeComponent class so that the execution methods can be used
    let executeComponent = new ex.ExecuteComponent(this.taskConfiguration, this.utils);
    executeComponent.Execute();

    // Check that the environment file has been written out and error if it has not
    if (!tl.exist(envFile)) {
      tl.error(sprintf("Unable to find to downloaded environment file: %s", envFile));
      return;
    }

    // read in the json file so that the environment can be updated
    let envStr: string = readFileSync(envFile).toString();
    let chefEnvironment = JSON.parse(envStr);

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
    tl.writeFile(envFile, JSON.stringify(chefEnvironment));

    // Update the arguments for knife to upload the environment file
    this.taskConfiguration.Inputs.Arguments = sprintf("environment from file %s", envFile);
    executeComponent.updateConfiguration(this.taskConfiguration);
    executeComponent.Execute();
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

    // Build up the string to be used as the config.rb
    let config: string = `
      node            ${this.taskConfiguration.Inputs.Username}
      client_key      ${clientKeyPath}
      chef_server_url ${this.taskConfiguration.Inputs.TargetURL}
    `;

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

    // set environment variables for knife
    tl.setVariable("KNIFE_HOME", configPath);
    tl.setVariable("CHEF_CONFIG", configPath);
  }
}