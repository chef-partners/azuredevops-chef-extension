/**
 * Utils contains a number of methods that are reused throughout the extension
 * For example, checkSudo when running on Linux
 *
 * @author Russell Seymour
 */

import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps
import { IExecSyncResult, IExecSyncOptions } from "azure-pipelines-task-lib/toolrunner";
import { TaskConfiguration } from "./taskConfiguration";
import { sprintf } from "sprintf-js";
import { existsSync, readFileSync, writeFileSync } from "fs";

export class Utils {

  /**
   * TaskConfiguration object containing all of the supplied parameters
   * and paths
   */
  private taskConfiguration: TaskConfiguration;

  /**
   * commandStack holds all of the commands that have been run during the
   * task. This can be used for testing and diagnostics
   */
  private commandStack: string[] = [];

  /**
   * Creates a new instance of the class
   *
   * @param taskConfiguration The current task configuration
   */
  constructor (taskConfiguration: TaskConfiguration) {
    this.taskConfiguration = taskConfiguration;
  }

  /**
   * ExecCmd takes a string array of the command an arguments and stitches
   * them together into one command line. This is then executed and the result
   * returned to the calling function.
   *
   * @param parts String array of command and arguments
   */
  public ExecCmd(parts: string[]): IExecSyncResult {

    // get the command from the string so that it can be set as the command
    // on the Task library
    let cmd = parts.shift();
    let args = parts.join(" ");
    let result: IExecSyncResult;
    let execOptions: IExecSyncOptions;

    // add the command to the command stack
    let element = this.commandStack.push(sprintf("%s %s", cmd, args));

    // execute the command, unless being tested
    if (!process.env.TESTS_RUNNING) {

      // if a workingdir has been set add it as an option to the execOptions
      if (this.taskConfiguration.Inputs.WorkingDir !== "" && this.taskConfiguration.Inputs.WorkingDir !== "undefined") {
        execOptions.cwd = this.taskConfiguration.Inputs.WorkingDir;
      }

      result = tl.tool(cmd).line(args).execSync(execOptions);

      // check the result of the command
      if (result.error) {
        // fail the task
        tl.setResult(tl.TaskResult.Failed, result.stderr);

      } else {
        // log stdout
        console.log(result.stdout);
      }
    }

    return result;
  }

  /**
   * checkSudo determines if sudo is to be used
   * it also checks that sudo has been configured properly for the agent user
   */
  public CheckSudo(): string[] {
    let parts: string[] = [];
    let result: IExecSyncResult;

    if (this.taskConfiguration.Inputs.SudoIsSet() && this.IsSudoInstalled()) {

      console.log("Determine if Sudo requires a password");

      // build up a command to check if a password is required or not
      let sudoParts = ["sudo", "-n", "true"];
      result = this.ExecCmd(sudoParts);

      tl.debug(sprintf("Sudo check result: %s", result.stderr));

      // check the result to see if a password is required
      // if it is throw an error and fail the task
      if (/^sudo: a password is required/.test(result.stderr)) {
        let msg = "A password is required for Sudo. Please configure the agent account to run sudo without a password";
        this.taskConfiguration.FailTask(msg);
      } else {
        console.log("    No (NOPASSWD appears to be enabled for the agent account)");

        // set sudo on the parts
        parts.push("sudo");
      }
    }

    // return to the calling function
    return parts;
  }

  public IsSudoInstalled(): boolean {
    return tl.exist(this.taskConfiguration.Paths.Sudo);
  }

  public ReplaceTokens(): string {

    let args: string = "";
    let modified: boolean = false;

    // get the argument from the task configuration
    args = this.taskConfiguration.Inputs.Arguments;

    [modified, args] = this.makeReplacements(
      args,
      [
        "{URL}",
        "{USERNAME}",
        "{PASSWORD}"
      ],
      [
        this.taskConfiguration.Inputs.TargetURL,
        this.taskConfiguration.Inputs.Username,
        this.taskConfiguration.Inputs.Password
      ]
    );

    return args;
  }

  public WriteFile(filename: string, contents: string) {
    try {
      tl.writeFile(filename, contents);
    } catch (err) {
      tl.setResult(tl.TaskResult.Failed, err.message);
    }
  }

  /**
   * ReplaceInFile replaces text in the specified file
   *
   * @param file File to replace text within
   * @param from The text or regex to use to find the text to replace
   * @param to The text to set the found string to
   */
  public ReplaceInFile(file: string, from, to) {

    // initialise method variables
    let contents;
    let newContents;
    let modified: boolean;

    // check that the file exists and if so read in the contents
    if (existsSync(file)) {
      tl.debug(sprintf("Reading in file: %s", file));
      contents = readFileSync(file, "utf-8");

      // call the method to make the replacements
      [modified, newContents] = this.makeReplacements(contents, from, to);
    } else {
      tl.error(sprintf("Specified file does not exist: %s", file));
    }

    // Write the data back out to the file that was read from
    // if the contents have changed
    if (modified) {
      console.log("Updating contents in file: %s", file);
      writeFileSync(file, newContents, "utf-8");
    }

  }

  public ReplaceInStr(contents: string, from, to): string {
    let newContents = "";
    let modified: boolean;

    // call the method to make the replacements
    [modified, newContents] = this.makeReplacements(contents, from, to);

    return newContents;

  }

  private makeReplacements(contents: string, from, to): [boolean, string] {

    // Initialise method properties
    let updatedContents = "";
    let modified = false;
    let isArray: boolean;

    // turn the from into an array so that each element can be operated on
    if (!Array.isArray(from)) {
      from = [from];
    }

    isArray = Array.isArray(to);

    // make the replacements
    updatedContents = from.reduce((contents, item, i) => {

      // get the replacement value
      let replacement = this.getReplacement(to, isArray, i);

      // if there are no replacements to be made, return the original contents
      if (replacement === null) {
        return contents;
      }

      // perform the replacement
      if (typeof item === "string") {
        item = new RegExp(item, "gm");
      }
      return contents.replace(item, replacement);

    }, contents);

    if (updatedContents !== contents) {
      modified = true;
    }

    return[modified, updatedContents];
  }

  /**
   * Get replacement helper
   */
  private getReplacement(replace, isArray, i) {
    if (isArray && typeof replace[i] === "undefined") {
      return null;
    }
    if (isArray) {
      return replace[i];
    }
    return replace;
  }

  /**
   * getCommandStack returns the array of commands that have been run
   */
  public getCommandStack(): string[] {
    return this.commandStack;
  }
}