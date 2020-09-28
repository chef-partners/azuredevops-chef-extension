// Import the necessary tasks
import * as task from "../common/taskConfiguration";
import * as ex from "../common/executeComponent";
import { join as pathJoin} from "path";

// Execute the chosen Chef component command with the specified arguments
async function run() {

  // initialise the required classes
  let resourceFile = pathJoin(__dirname, "task.json");
  console.log(resourceFile);
  let taskConfiguration = new task.TaskConfiguration(resourceFile);

  // get the parameters for the task, e.g. the settings that have been provided
  await taskConfiguration.getTaskParameters({}, []);

  // create an instance of the executeComponent class
  let executeComponent = new ex.ExecuteComponent(taskConfiguration);

  // perform the execution of the selected command
  executeComponent.Execute();
}

run ();