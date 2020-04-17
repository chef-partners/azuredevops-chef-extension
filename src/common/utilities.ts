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
import * as replace from "replace";

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
    }
  }

  /**
   * Sets the specified version number in the cookbook metadata.rb
   * This is a public function so it can be tested
   */
  public setCookbookVersion() {

    // check that the metadata file exists, if it does not fail the tasl
    if (!tl.exist(this.taskConfiguration.Inputs.CookbookMetadataPath)) {
      tl.setResult(tl.TaskResult.Failed, sprintf("Cookbook metadata file cannot be found: %s", this.taskConfiguration.Inputs.CookbookMetadataPath));
      return;
    }

    console.log("Attempting to set cookbook version: %s", this.taskConfiguration.Inputs.CookbookVersionNumber);

    // replace the version number in the metadata file
    // this uses the regular expression as set in the parameters for the task to set the replacement
    // create the regular expression from the string
    // let pattern = new RegExp(this.taskConfiguration.Inputs.CookbookVersionRegex, "gm");

    // replace the version number in the cookbook file
    // try {

      replace({
        regex: this.taskConfiguration.Inputs.CookbookVersionRegex,
        replacement: sprintf("version '%s'", this.taskConfiguration.Inputs.CookbookVersionNumber),
        paths: [
          this.taskConfiguration.Inputs.CookbookMetadataPath
        ]
      });
    //} catch (err) {
    //  tl.setResult(tl.TaskResult.Failed, err.message);
    //}
  }
}