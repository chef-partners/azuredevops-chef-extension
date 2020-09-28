// import the necessary items
import * as task from "../common/taskConfiguration";
import * as h from "../common/helpers";
import { join as pathJoin} from "path";

// Execute the utitlies task
async function run() {

  // initialise the required classes
  let taskConfiguration = new task.TaskConfiguration(
    pathJoin(__dirname, "task.json")
  );

  // await taskConfiguration.getTaskParameters(["habitatOrigin"]);

  let helpers = new h.Helpers(taskConfiguration);

  // call the run method which decides which util has been selected and then
  // performs that task
  helpers.Run();
}

run();