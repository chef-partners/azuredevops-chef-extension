/**
 * Perform tests to exercise the execute task of the extension
 */

// Import libraries ---------------------------------------------------------------
// - local libs
import { TaskConfiguration } from "../../src/common/taskConfiguration";
import { ExecuteComponent } from "../../src/common/executeComponent";

// - External libs
import * as tl from "azure-pipelines-task-lib";
import * as rimraf from "rimraf";
import {sprintf} from "sprintf-js"; // provides sprintf functionaility

// - Standard libs
import { join as pathJoin, basename } from "path";
import { mkdirSync, existsSync, writeFileSync } from "fs";

// - test libraries
import { expect } from "chai";
import * as sinon from "sinon";
import * as os from "os";

// --------------------------------------------------------------------------------

// Configure constants
const WINDOWS = "win32";
const LINUX = "linux";

// Declare properties
let inputs = {};
let getInput;
let platform;
let tlsetResult;
let tlwriteFile;
let tlgetEndpointUrl;
let tlgetEndpointDataParameter;
let tlgetEndpointAuthorizationParameter;
let tc: TaskConfiguration;
let ex: ExecuteComponent;

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

describe("Execute Components", () => {

  // Setup the mocks and other settings that are required before each test
  before(() => {
    // stub out the getInputs from the AzDo taskl library
    getInput = sinon.stub(tl, "getInput").callsFake((name) => {
      return inputs[name];
    });

    // stub out the platform function from the os object
    platform = sinon.stub(os, "platform").callsFake(() => {
      return inputs["platform"];
    });

    process.env.AGENT_TEMPDIRECTORY = tempDir();
  });

  after(() => {
    getInput.restore();
    platform.restore();
    process.env.AGENT_TEMPDIRECTORY = "";
  });

  describe("Windows", () => {

    // set the platform that is being tests
    before(() => {
      inputs = {
        "platform": WINDOWS
      };
    });

    describe("Chef Client", () => {

      // configure the inputs to be used
      before(() => {
        inputs["component"] = "chef-client";
        inputs["arguments"] = "-c c:/chef/test-client.rb";
      });

      describe("Specify configuration file to use", () => {

        let expected = [
          pathJoin("C:", "opscode", "chef-workstation", "bin", "chef-client.bat"),
          "-c c:/chef/test-client.rb"
        ];

        it("should return the expected command", () => {
          // create the necessary objects
          tc = new TaskConfiguration();
          ex = new ExecuteComponent(tc);

          tc.getTaskParameters();

          let actual = ex.generateCmd();

          expect(actual).to.eql(expected);
        });

      });

    });
  });

  // ensure that berkshelf operates correctly
  describe("Berkshelf", () => {

    before(async () => {

      // set the necessary inputs
      inputs = {
        "platform": LINUX,
        "component": "berks",
        "password": "foobar",
        "targetUrl": "https://foobar.com/organization/fred",
        "username": "unittest",
        "sslVerify": false,
        "arguments": "install"
      };

      // stub the azdo tasklib setResult function
      tlsetResult = sinon.stub(tl, "setResult");

      process.env.AGENT_TEMPDIRECTORY = tempDir();

      // stub the azdo tasklib writeFile function
      tlwriteFile = sinon.stub(tl, "writeFile").callsFake((path, content) => {

        // get the filename of the path
        let filename = basename(path);

        // write out the file to the temp directory
        writeFileSync(pathJoin(tempDir(), filename), content);
      });

      // stub out the getEndpointUrl so that the url is set correctly
      tlgetEndpointUrl = sinon.stub(tl, "getEndpointUrl").callsFake((name, optional) => {
        return inputs["targetUrl"];
      });

      // stub out the authroizationparameter function
      tlgetEndpointAuthorizationParameter = sinon.stub(tl, "getEndpointAuthorizationParameter").callsFake((id, name, optional) => {
        return inputs[name];
      });

      tlgetEndpointDataParameter = sinon.stub(tl, "getEndpointDataParameter").callsFake((id, name, optional) => {
        return inputs[name];
      });

      tc = new TaskConfiguration();
      ex = new ExecuteComponent(tc);
      await tc.getTaskParameters(["chefendpoint"]);

    });

    after(() => {
      getInput.restore();
      tlsetResult.restore();
      tlwriteFile.restore();
      tlgetEndpointUrl.restore();
      tlgetEndpointAuthorizationParameter.restore();
      tlgetEndpointDataParameter.restore();

      process.env.AGENT_TEMPDIRECTORY = "";
    });

    it("writes out the private key", async () => {

      // call the method to create the private key file
      let dummy = ex.generateBerksConfig();

      expect(existsSync(tc.Paths.PrivateKey)).to.be.true;
    });

    it("returns the correct configuration", async () => {

      // create the expected object
      let expected = {
        "chef": {
          "chef_server_url": inputs["targetUrl"],
          "client_key": tc.Paths.PrivateKey,
          "node_name": inputs["username"]
        },
        "ssl": {
          "verify": inputs["sslVerify"]
        }
      };

      // get the actual object
      let actual = ex.generateBerksConfig();

      // perform the test to make sure they are the ame
      expect(actual).to.eql(expected);
    });

    it("installs cookbooks", async () => {

      let expected = sprintf("%s install", pathJoin("/", "opt", "chef-workstation", "bin", "berks"));

      let actual = ex.generateCmd().join(" ");

      expect(actual).to.eql(expected);
    });
  });

});