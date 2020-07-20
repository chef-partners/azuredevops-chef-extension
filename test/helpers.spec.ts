/**
 * Peform tests to ensure that the utilities methods work as expected
 */

// Import libraries --------------------------------------------------
// - local libs
import { TaskConfiguration } from "../src/common/taskConfiguration";
import { Helpers } from "../src/common/helpers";

// - External task libs
import * as tl from "azure-pipelines-task-lib";
import * as rimraf from "rimraf";

// - Standard libs
import { join as pathJoin } from "path";
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "fs";

// - Test libraries
import { expect } from "chai";
import * as sinon from "sinon";
import * as os from "os";

// -------------------------------------------------------------------

// Configure constants
const WINDOWS = "win32";
const LINUX = "linux";
const MACOS = "darwin";

// Declare properties
let inputs = {};
let platform;
let tlsetResult;
let getInput;
let metadataFile;
let tc: TaskConfiguration;
let u: Helpers;

// define a tempdir that the scripts can be written out to
function tempDir(remove: boolean = false): string {

  let path = pathJoin(__dirname, "temp");

  if (remove) {
    rimraf.sync(path);
  } else {
    if (!existsSync(path)) {
      mkdirSync(path);
    }
  }

  return path;
}

describe("Helpers", () => {

  before(() => {

    // stub out the getInputs from the azure devops task library
    getInput = sinon.stub(tl, "getInput").callsFake((name) => {
      return inputs[name];
    });

    // stub out the platform function from the os object
    platform = sinon.stub(os, "platform").callsFake(() => {
      return inputs["platform"];
    });

    // stub the azdo tasklib setResult function
    tlsetResult = sinon.stub(tl, "setResult");

    process.env.AGENT_TEMPDIRECTORY = tempDir();
  });

  after(() => {
    getInput.restore();
    platform.restore();
    tlsetResult.restore();

    process.env.AGENT_TEMPDIRECTORY = "";
  });

  describe("Update cookbook version", () => {

    before(() => {
      inputs = {
        "platform": LINUX,
        "utility": "setCookbookVersion"
      };
    });

    describe("metadata file does not exist", () => {

      before(() => {
        tc = new TaskConfiguration();
        u = new Helpers(tc);

        u.setCookbookVersion();
      });

      it("fails the task", () => {
        sinon.assert.called(tlsetResult);
      });
    });

    describe("version is updated correctly", () => {

      before(() => {

        metadataFile = pathJoin(tempDir(), "metadata.rb");

        // update the inputs
        inputs["cookbookVersionNumber"] = "1.2.3";
        inputs["cookbookMetadataPath"] = metadataFile;
        inputs["cookbookVersionRegex"] = "version\\s+['\"]?.*['\"]?";

        // set a version number in the metadataFile so that it can be patched
        writeFileSync(metadataFile, "version   100.99.98");

        tc = new TaskConfiguration();
        u = new Helpers(tc);

        tc.getTaskParameters();

        u.setCookbookVersion();
      });

      it("sets the version number in the file", () => {

        // get the contents of the file
        let actual = readFileSync(metadataFile).toString("utf8");

        // set the expected
        let expected = "version '1.2.3'";

        expect(expected).to.eql(actual);
      });

    });
  });

  /*
  describe("Configure Habitat Environment", () => {

    // set the task that needs to be run
    before(() => {
      inputs = {
        "platform": LINUX,
        "utility": "setupHabitat"
      };
    });

    describe("HAB_ORIGIN environment variable is set correctly", () => {

      // set the inputs
      // inputs[""]
    });

  });
  */
});
