import { TaskConfiguration } from "./taskConfiguration";
import { Utils } from "./utils";
import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps

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

  /**
   * Create a new instance of the class, the constructor
   * 
   * @param taskConfiguration The current tas configuration
   */
  constructor (taskConfiguration: TaskConfiguration) {
    this.taskConfiguration = taskConfiguration;
    this.utils = new Utils(this.taskConfiguration);
  }

  /**
   * Execute determines the component to be executed, the path to that component (based
   * on the platform), any credentials that are required and then runs that command with
   * any arguments that have been specified
   */
  public async Execute() {

    let cmdParts: string[] = [];

    // perform any setup that is required for the command
    // for example, in order for berkshelf to run a configuration file must be created
    switch (this.taskConfiguration.Inputs.ComponentName) {
      case "berks": {
        this.utils.WriteFile(
          this.taskConfiguration.Paths.BerksConfig,
          JSON.stringify(this.generateBerksConfig())
        );
        
        break;
      }
    }

    // get the command to be executed
    cmdParts = this.generateCmd();

    // Attempt to execute the command
    try {
      let result = this.utils.ExecCmd(cmdParts);
    } catch (err) {
      tl.setResult(tl.TaskResult.Failed, err.message);
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
    }

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

  public generateBerksConfig(): {} {

    // write out the privatekey so that it can be used by berkshelf
    try {
      tl.writeFile(this.taskConfiguration.Paths.PrivateKey, this.taskConfiguration.Inputs.Password);
    } catch (err) {
      tl.setResult(tl.TaskResult.Failed, err.message);
    }

    // use the configuration of the task to build up the necessary configuration
    // for Berkshelf
    let config = {
      "chef": {
        "chef_server_url": this.taskConfiguration.Inputs.TargetURL,
        "client_key": this.taskConfiguration.Paths.PrivateKey,
        "node_name": this.taskConfiguration.Inputs.Username
      },
      "ssl": {
        "verify": this.taskConfiguration.Inputs.SSLVerify
      }
    };

    return config;
  }
}