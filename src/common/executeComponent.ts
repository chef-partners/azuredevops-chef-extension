import { TaskConfiguration } from "./taskConfiguration";
import { Utils } from "./utils";
import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps
import {sprintf} from "sprintf-js"; // provides sprintf functionality
import { IExecSyncResult } from "azure-pipelines-task-lib/toolrunner";

/**
 * ExecuteComponent is responsible for executing the command that has been selected
 * using the chosen arguments.
 *
 * @author Russell Seymour
 */

 /**
  * Class to handle the execution of the selected component
  */
export class ExecuteComponent {

  /**
   * TaskConfiguration object containing all of the supplied parameters
   * and paths
   */
  private taskConfiguration: TaskConfiguration;

  private utils: Utils;

  public result: string;

  /**
   * Create a new instance of the class, the constructor
   *
   * @param taskConfiguration The current tas configuration
   */
  constructor (taskConfiguration: TaskConfiguration, utils: Utils = null) {
    tl.debug("Creating execute component");

    this.taskConfiguration = taskConfiguration;

    if (utils === null) {
      tl.debug("Creating new Utils component with passed taskConfiguration");
      this.utils = new Utils(this.taskConfiguration);
    } else {
      this.utils = utils;
    }
  }

  /**
   * Execute determines the component to be executed, the path to that component (based
   * on the platform), any credentials that are required and then runs that command with
   * any arguments that have been specified
   */
  public async Execute(sync: boolean = false) {

    tl.debug(sprintf("Preparing to execute component. (Synchronous: %s)", sync));

    // set the resource path if one has been set in the taskConfiguration Paths
    if (this.taskConfiguration.Paths.ResourceFile) {
      tl.setResourcePath(this.taskConfiguration.Paths.ResourceFile);
    }

    let cmdParts: string[] = [];
    let execResult: IExecSyncResult;

    // get the command to be executed
    cmdParts = this.generateCmd();

    // Attempt to execute the command, but check to see if running sync or async
    if (sync) {
      try {
        execResult = this.utils.ExecCmdSync(cmdParts);
        if (!process.env.TESTS_RUNNING) {
          this.result = execResult.stdout;
        }
      } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
      }
    } else {
      this.utils.ExecCmd(cmdParts);
    }
  }

  /**
   * generateCmd builds up the command that should be executed
   * It is not meant to be called externally, but is a public method so that it can be tested
   */
  public generateCmd(): string[] {
    // initalise the method vars
    let cmdParts: string[] = [];
    let cmd: string = "";
    let componentName: string = "";
    let components = {
      "chefclient": "chef-client"
    };

    tl.debug(sprintf("Attempting to build up command string: %s", this.taskConfiguration.Inputs.ComponentName));

    // it might be necessary to run with Sudo on linux, so determine the platform being
    // run on to see if this should be added to the cmdParts
    cmdParts = this.utils.CheckSudo();

    // it is not possible to use the name of the component as a key in the selection with a '-' in it,
    // chef-client for example and use a visibleRule on the same input
    // work out the componentName which is the name of the binary to use
    componentName = this.taskConfiguration.Inputs.ComponentName;
    if (componentName in components) {
      componentName = components[componentName];
    }

    // Based on the selected component get the path to it
    cmdParts.push(
      this.taskConfiguration.Paths.GetPath(
        componentName
      )
    );

    // if there are any arguments add them to the command
    if (this.taskConfiguration.Inputs.Arguments !== "") {

      // some of the arguments that are run require the items to be set on the command line
      // there are some tokens that can be replaced with the information in the endpoint
      // call the method to replace these tokens in the arguments
      let args = this.utils.ReplaceTokens();

      cmdParts.push(
        args
      );
    }

    return cmdParts;
  }

  /**
   * updateConfiguration sets the taskconfiguration on the object
   * This is used to reset the config when the execute component is used multiple times
   *
   * @param taskConfiguration
   */
  public updateConfiguration(taskConfiguration: TaskConfiguration) {
    this.taskConfiguration = taskConfiguration;
  }

}