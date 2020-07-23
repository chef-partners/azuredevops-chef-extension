/**
 * Peform tests to ensure that the helpers methods work as expected
 */

// Import libraries --------------------------------------------------
// - local libs
import { TaskConfiguration } from "../src/common/taskConfiguration";
import { Helpers } from "../src/common/helpers";

// - External task libs
import * as tl from "azure-pipelines-task-lib";
import * as rimraf from "rimraf";
import {sprintf} from "sprintf-js"; // provides sprintf functionaility

// - Standard libs
import { join as pathJoin, dirname } from "path";
import { mkdirSync, existsSync, writeFileSync, readFileSync, unlinkSync } from "fs";

// - Test libraries
import { expect } from "chai";
import { file as chaiFile, dir as chaiDir } from "chai-files";
import * as sinon from "sinon";
import * as os from "os";

// -------------------------------------------------------------------

// Configure constants
const WINDOWS = "win32";
const LINUX = "linux";
const MACOS = "darwin";

// Declare properties
let inputs = {};
let pubKey;
let signKey;
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
        "helper": "setCookbookVersion"
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
        inputs["helper"] = "setCookbookVersion";

        // set a version number in the metadataFile so that it can be patched
        writeFileSync(metadataFile, "version   100.99.98");

        tc = new TaskConfiguration();
        u = new Helpers(tc);

        u.Run();
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

  describe("Configure Habitat Environment", () => {

    // set the task that needs to be run
    before(() => {

      inputs = {
        "platform": LINUX,
        "helper": "setupHabitat"
      };

      // set the inputs
      inputs["habitatOrigin"] = "myorigin";
      inputs["habitatOriginRevision"] = "202007221100";
      inputs["habitatOriginPublicKey"] = "Hab public key";
      inputs["habitatOriginSigningKey"] = "Hab signing key";

      // set the files to be tested
      pubKey = pathJoin(tempDir(), sprintf("%s-%s.pub", inputs["habitatOrigin"], inputs["habitatOriginRevision"]));
      signKey = pathJoin(tempDir(), sprintf("%s-%s.sig.key", inputs["habitatOrigin"], inputs["habitatOriginRevision"]));

      tc = new TaskConfiguration();
      u = new Helpers(tc);

      u.Run();
    });

    describe("public key file", () => {

      it("exists", () => {
        expect(chaiFile(pubKey)).to.exist;
      });

      it("contains the correct data", () => {
        expect(chaiFile(pubKey).content).to.equal(inputs["habitatOriginPublicKey"]);
      });
    });

    describe("signing key file", () => {

      it("exists", () => {
        expect(chaiFile(signKey)).to.exist;
      });

      it("contains the correct data", () => {
        expect(chaiFile(signKey).content).to.equal(inputs["habitatOriginSigningKey"]);
      });
    });

    describe("HAB_ORIGIN env var", () => {

      it("is set correctly", () => {

        // get the contents of the environment variable
        let actual = tl.getVariable("HAB_ORIGIN");

        let expected = "myorigin";

        expect(expected).to.eql(actual);
      });

    });

    describe("HAB_CACHE_PATH env var", () => {

      it("is set correctly", () => {

        // get the contents of the environment variable
        let actual = tl.getVariable("HAB_CACHE_KEY_PATH");

        let expected = dirname(pubKey);

        expect(expected).to.eql(actual);
      });

    });

    // remove files that have been created
    after(() => {
      unlinkSync(pubKey);
      unlinkSync(signKey);
    });
  });

  describe("Configuring Chef environment", () => {

    // set the task that needs to be run
    before(() => {

      // define the inputs for testing the task
      inputs = {
        "platform": LINUX,
        "helper": "setupChef",
        "targetUrl": "https://automate.example.com/organizations/myorg",
        "username": "aperson",
        "password": "long client key",
        "sslVerify": false
      };

      tc = new TaskConfiguration();
      u = new Helpers(tc);

      u.Run();
    });

    it("creates the config directory", () => {

      // state the expected path to the configuration directory
      let expected = tc.Paths.ConfigDir;

      expect(chaiDir(expected)).to.exist;
    });

    it("creates the config file", () => {
      let expected = pathJoin(tc.Paths.ConfigDir, "config.rb");
      expect(chaiFile(expected)).to.exist;
    });

    it("creates the client key", () => {
      let expected = pathJoin(tc.Paths.ConfigDir, "client.pem");
      expect(chaiFile(expected)).to.exist;
    });

    it("the client.key has the correct contents", () => {
      let clientKeyPath = pathJoin(tc.Paths.ConfigDir, "client.pem");
      expect(chaiFile(clientKeyPath).content).to.equal(inputs["password"]);
    });
  });

});
