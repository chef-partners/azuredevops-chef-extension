// Import the necessary tasks
import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps
import * as task from "../common/taskConfiguration";
import * as ex from "../common/executeComponent";
import { join as pathJoin } from "path";
import { sprintf } from "sprintf-js";

// Execute the chosen Chef component command with the specified arguments
async function run() {

  let taskConfiguration = new task.TaskConfiguration();

  // get the parameters for the task, e.g. the settings that have been provided
  await taskConfiguration.getTaskParameters({}, []);

  // create an instance of the executeComponent class
  let executeComponent = new ex.ExecuteComponent(taskConfiguration);

  // perform the execution of the selected command
  executeComponent.Execute();
}

run();

// set the path to the resourceFile
/*
try {
  let resourceFile = pathJoin(__dirname, "task.json");
  tl.debug(sprintf("Resource file path: %s", resourceFile));
  tl.debug(sprintf("Task filename: %s", __filename));
  tl.setResourcePath(resourceFile);

  // run the task
  // run ();
} catch (err) {
  tl.setResult(tl.TaskResult.Failed, err, true);
}
*/
