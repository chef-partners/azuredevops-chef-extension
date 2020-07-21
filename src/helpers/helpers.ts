// import the necessary items
import * as task from "../common/taskConfiguration";
import * as h from "../common/helpers";

// Execute the utitlies task
async function run() {

  // initialise required classes
  let taskConfiguration = new task.TaskConfiguration();

  await taskConfiguration.getTaskParameters(["habitatOrigin"]);

  let helpers = new h.Helpers(taskConfiguration);

  // call the run method which decides which util has been selected and then
  // performs that task
  helpers.Run();
}

run();