// Import the necessary tasks
import * as task from "../common/taskConfiguration";
import * as ex from "../common/executeComponent";
import path = require("path");

// Execute the chosen Chef component command with the specified arguments
async function run() {

  // initialise the required classes
  let taskConfiguration = new task.TaskConfiguration();

  // get the parameters for the task, e.g. the settings that have been provided
  await taskConfiguration.getTaskParameters({}, []);

  // create an instance of the executeComponent class
  let executeComponent = new ex.ExecuteComponent(taskConfiguration);

  // determine the path to the resource file, e.g. the task.json file
  let resourceFile = path.join(__dirname, "task.json");

  // perform the execution of the selected command
  executeComponent.Execute(resourceFile);
}

run ();