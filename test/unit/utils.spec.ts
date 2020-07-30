/**
 * Perform tests to exercise the utils class
 */

// Import libraries --------------------------------------------------
// - local libs
import { TaskConfiguration } from "../../src/common/taskConfiguration";
import { Utils } from "../../src/common/utils";

// - External task libs
import * as tl from "azure-pipelines-task-lib";
import {sprintf} from "sprintf-js"; // provides sprintf functionaility
import * as rimraf from "rimraf";

// - Standard libs
import { join as pathJoin } from "path";
import { mkdirSync, existsSync } from "fs";

// - Test libraries
import { expect } from "chai";
import * as sinon from "sinon";
import * as os from "os";

// -------------------------------------------------------------------

// Configure constants
const WINDOWS = "win32";
const LINUX = "linux";

// Declare properties
let getInput;
let inputs = {};
let platform;
let tlgetEndpointUrl;
let tlgetEndpointDataParameter;
let tlgetEndpointAuthorizationParameter;
let tc: TaskConfiguration;
let utils; Utils;

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

describe("Utils", () => {

  before(() => {

    // stub out the getInputs from the azure devops task library
    getInput = sinon.stub(tl, "getInput").callsFake((name) => {
      return inputs[name];
    });

    // stub out the platform function from the os object
    platform = sinon.stub(os, "platform").callsFake(() => {
      return inputs["platform"];
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

    process.env.AGENT_TEMPDIRECTORY = tempDir();

  });

  after(() => {
    getInput.restore();
    platform.restore();
    tlgetEndpointUrl.restore();
    tlgetEndpointAuthorizationParameter.restore();
    tlgetEndpointDataParameter.restore();

    process.env.AGENT_TEMPDIRECTORY = "";
  });

  describe("ReplaceTokens", () => {

    before(() => {

      // set the values to be replaced in the tokens
      inputs = {
        "platform": LINUX,
        "password": "foobar",
        "targetUrl": "https://foobar.com/organization/fred",
        "username": "unittest",
        "arguments": "-u {USERNAME} -p {PASSWORD} --url {URL}"
      };

      tc = new TaskConfiguration();
      utils = new Utils(tc);
    });

    it ("replaces the tokens in the arguments", async () => {

      await tc.getTaskParameters({}, ["chefendpoint"]);

      // set the expected value
      let expected = sprintf("-u %s -p %s --url %s", inputs["username"], inputs["password"], inputs["targetUrl"]);

      // get the actual
      let actual = utils.ReplaceTokens();

      expect(actual).to.eql(expected);
    });
  });

  describe("ReplaceInStr", () => {

    it ("replaces specified items in the string", async () => {

      // set properties
      let contents = "version 0.0.1";

      let expected = "version 1.0.0";

      // get the actual value
      let actual = utils.ReplaceInStr(contents, "version\\s+['\"]?.*['\"]?", "version 1.0.0");

      expect(actual).to.eql(expected);
    });
  });
});