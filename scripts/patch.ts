/**
 * Script file to correctly version the tasks in the extension
 *
 * The script will patch all the 'task.json' files in the build directory
 * with the specified build number
 */

// import necessary libraries
import * as program from "commander";
import { readFileSync, writeFileSync } from "fs";
import * as glob from "glob";
import { platform } from "os";
import { join as pathJoin, resolve } from "path";
import { sprintf } from "sprintf-js";
import * as semver from "semver";
import * as uuid from "uuidv5";

// Define variables to be used in the script
let projectRoot = resolve(__dirname, "..");
let buildDir = pathJoin(projectRoot, "build");

/**
 * Gets all of the task.json files in the build directory so that the
 * version number in the file can be patched
 *
 * @param buildDir Path to the build dir. If not set then a default value will be used
 */
function getConfigFiles(pattern: string, debug: boolean) {

  // set the pattern to use to search for files
  let options = {
    debug: debug
  };

  let files = glob.sync(pattern, options);

  return files;
}

/**
 * Perform the versioning of the task files
 *
 * @param options The command line options that have been passed
 */
function patchFiles(options) {

  let namespaces = new Map();

  // get all the task files
  console.log("Finding task configuration files in dir: %s", options.builddir);
  let configFiles = getConfigFiles(
    pathJoin(options.builddir, "**", "task.json"),
    options.debug
  );

  // determine the preview path
  let previewPath = pathJoin(options.builddir, "preview");
  let devPath = pathJoin(options.builddir, "dev");

  // if running on Windows the path separators need to be changed
  if (platform() === "win32") {
    previewPath = previewPath.replace(/\\/g, "/");
    devPath = devPath.replace(/\\/g, "/");
  }

  // Create UUID namespace
  // This is so that new namespaces can be generated for the preview and dev
  // so that they are "unique" but are always generated the same
  namespaces.set(previewPath, uuid("null", "b5e4ed8a-a6c9-40b8-acf8-a308df1acdb3", true));
  namespaces.set(devPath, uuid("null", "69b8d4bc-2463-4d12-88a1-15a2e92deb36", true));

  for (let file of configFiles) {

    console.log("Setting version on: %s", file);

    // using the semver of the build number set the build number on the task
    // read in the file as a JSON object
    let taskConfig = JSON.parse(readFileSync(file, "utf-8"));

    // set the major, minor and revision version numbers
    taskConfig.version.Major = semver.major(options.buildnumber);
    taskConfig.version.Minor = semver.minor(options.buildnumber);
    taskConfig.version.Patch = semver.patch(options.buildnumber);

    // if the task is in the preview folder then patch it accordingly
    // this is the name and title of the task as well as a new UUID number
    if (file.indexOf(previewPath) > -1) {
      patch(taskConfig, "preview", namespaces.get(previewPath));
    }

    if (file.indexOf(devPath) > -1) {
      patch(taskConfig, "dev", namespaces.get(devPath));
    }

    // save the file with the modifications
    writeFileSync(file, JSON.stringify(taskConfig, null, 4));
  }

  // add the version number to the tfx build override files
  let overrideFiles = getConfigFiles(
    pathJoin(options.builddir, "conf", "*.json"),
    options.debug
  );

  console.log("Setting version in override files");
  for (let file of overrideFiles) {
    console.log("\t%s", file);

    let override = JSON.parse(readFileSync(file, "utf-8"));
    Object.assign(override, {"version": options.buildnumber});

    writeFileSync(file, JSON.stringify(override, null, 4));
  }
}

function patch(taskConfig: any, ident: string, namespace: string) {

  let friendlyName: string;
  let id: string;
  let name: string;

  console.log(sprintf("\tPatching %s task", ident));

  // set the name
  name = sprintf("%s-%s", taskConfig.name, ident.toLowerCase());
  console.log("\tSetting task name: %s", name);
  taskConfig.name = name;

  // set the friendlyName
  friendlyName = sprintf("%s - %s", taskConfig.friendlyName, ident.toUpperCase());
  console.log("\tSetting friendly name: %s", friendlyName);
  taskConfig.friendlyName = friendlyName;

  // set the id for the task based the friendlyName
  id = uuid(namespace, friendlyName);
  console.log("\tSetting task id: %s", id);
  taskConfig.id = id;
}

// configure the command line
program.version("2.0.1")
        .description("Patch tasks with version and preview tags")
        .option("-d, --builddir [dir]", "Path to the build directory", buildDir)
        .option("-n, --buildnumber [x.x.x]", "Semantic version number to apply to the the tasks", process.env.BUILD_BUILDNUMBER)
        .option("--debug", "State whether the script should run in debug mode", false)
        .action((options) => {

          // fail if the build number is null
          if (typeof options.buildnumber === "undefined") {
            console.log("A build number must be set");;
          } else {
            patchFiles(options);
          }
        });

// Parse the command line options and run the script
program.parse(process.argv);