// import the necessary items
import * as task from "../common/taskConfiguration";
import * as u from "../common/utilities";

// Execute the utitlies task
async function run() {

  // initialise required classes
  let taskConfiguration = new task.TaskConfiguration();

  await taskConfiguration.getTaskParameters(["habitatendpoint"]);

  let utilities = new u.Utilities(taskConfiguration);

  // call the run method which decides which util has been selected and then
  // performs that task
  utilities.Run();
}

run();