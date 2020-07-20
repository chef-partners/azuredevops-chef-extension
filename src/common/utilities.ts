/**
 * Utilities is responsible for performing tasks such as updating a cookbook version
 * and other tasks that do not fit into the Install or Execute tasks
 * 
 * @author Russell Seymour
 */

import { TaskConfiguration } from "./taskConfiguration";
import { Utils } from "./utils";
import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps
import {sprintf} from "sprintf-js"; // provides sprintf functionaility
import {sync as replaceSync} from "replace-in-file";
import {join as pathJoin, dirname} from "path";

 /**
  * Class to handle the execution of the utlities that can be selected
  */
export class Utilities {

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
    this.utils = new Utils(this.taskConfiguration);
  }

  /**
   * Run determines what utility has been selected and then performs the necessasry
   * operations to complte that utility
   */
  public async Run() {

    // determine the method to run based on the utility that has been chosen
    switch (this.taskConfiguration.Inputs.Utility) {
      case "setCookbookVersion": {
        this.setCookbookVersion();
        break;
      }
      case "setupHabitat": {
        this.setupHabitatEnvironment();
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

    // configure the options for the replacement
    let options = {
      files: this.taskConfiguration.Inputs.CookbookMetadataPath,
      from: pattern,
      to: sprintf("version '%s'", this.taskConfiguration.Inputs.CookbookVersionNumber)
    };

    // replace the version number in the cookbook file
    try {

      let results = replaceSync(options);
      /*
      replace({
        regex: this.taskConfiguration.Inputs.CookbookVersionRegex,
        replacement: sprintf("version '%s'", this.taskConfiguration.Inputs.CookbookVersionNumber),
        paths: [
          this.taskConfiguration.Inputs.CookbookMetadataPath
        ]
      });
      */
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
}