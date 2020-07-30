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
let contents = {};
let inputs = {};
let connectedService = {};
let pubKey;
let signKey;
let platform;
let tlsetResult;
let getInput;
let getEndpointAuthorization;
let getEndpointAuthorizationParameter;
let getEndpointDataParameter;
let getEndpointUrl;
let metadataFile;
let commandStack: string[];
let tc: TaskConfiguration;
let h: Helpers;

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

    getEndpointAuthorizationParameter = sinon.stub(tl, "getEndpointAuthorizationParameter").callsFake((connectedServiceName, name) => {
      return connectedService[name];
    });

    getEndpointAuthorization = sinon.stub(tl, "getEndpointAuthorization").callsFake((connectedServiceId, required) => {
      return {
        parameters: {
          tenantid: connectedService["tenantId"],
          serviceprincipalid: connectedService["clientId"],
          serviceprincipalkey: connectedService["clientSecret"]
        }
      };
    });

    getEndpointDataParameter = sinon.stub(tl, "getEndpointDataParameter").callsFake((connectedServiceName, name) => {
      return connectedService[name];
    });

    getEndpointUrl = sinon.stub(tl, "getEndpointUrl").callsFake((connectedServiceName) => {
      return connectedService["url"];
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
    getEndpointAuthorizationParameter.restore();
    getEndpointDataParameter.restore();
    getEndpointUrl.restore();
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
        h = new Helpers(tc);

        h.setCookbookVersion();
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
        h = new Helpers(tc);

        h.Run();
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
      /*
      inputs["habitatOrigin"] = "myorigin";
      inputs["habitatOriginRevision"] = "202007221100";
      inputs["habitatOriginPublicKey"] = "Hab public key";
      inputs["habitatOriginSigningKey"] = "Hab signing key";
      */

      // configure the connected service
      connectedService = {
        "url": "",
        "originName": "myorigin",
        "revision": "202007221100",
        "publicKey": "Hab public key",
        "signingKey": "Hab signing key"
      };

      // set the files to be tested
      pubKey = pathJoin(tempDir(), sprintf("%s-%s.pub", connectedService["originName"], connectedService["revision"]));
      signKey = pathJoin(tempDir(), sprintf("%s-%s.sig.key", connectedService["originName"], connectedService["revision"]));

      tc = new TaskConfiguration();
      h = new Helpers(tc);

      h.Run();
    });

    describe("public key file", () => {

      it("exists", () => {
        expect(chaiFile(pubKey)).to.exist;
      });

      it("contains the correct data", () => {
        expect(chaiFile(pubKey).content).to.equal(connectedService["publicKey"]);
      });
    });

    describe("signing key file", () => {

      it("exists", () => {
        expect(chaiFile(signKey)).to.exist;
      });

      it("contains the correct data", () => {
        expect(chaiFile(signKey).content).to.equal(connectedService["signingKey"]);
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
        "chefendpoint": "automateEndpoint"
      };

      connectedService = {
        "url": "https://automate.example.com/organizations/myorg",
        "sslVerify": true,
        "username": "aperson",
        "password": "long client key"
      };

      tc = new TaskConfiguration();
      h = new Helpers(tc);

      h.Run();
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
      expect(chaiFile(clientKeyPath).content).to.equal(connectedService["password"]);
    });

    describe("the config.rb file has the correct contents", () => {

      before(() => {
        contents = readFileSync(pathJoin(tc.Paths.ConfigDir, "config.rb")).toString();
      });

      // check that the node name is correct
      it("sets the node name correctly", () => {
        let regex = new RegExp(sprintf("^node_name\\s+\"%s\"$", connectedService["username"]), "m");
        expect(contents).to.match(regex);
      });

      it("sets the path to the client key correctly", () => {
        let clientKeyPath: string = pathJoin(tc.Paths.ConfigDir, "client.pem");
        let regex = new RegExp(sprintf("^client_key\\s+\"%s\"$", clientKeyPath.replace(/\\/g, "/")), "m");
        expect(contents).to.match(regex);
      });

      it("sets the URL for the chef server correctly", () => {
        let regex = new RegExp(sprintf("^chef_server_url\\s+\"%s\"$", tc.Inputs.TargetURL), "m");
        expect(contents).to.match(regex);
      });

    });
  });

  describe("Set environment cookbook version", () => {

    before(async () => {

      // define the inputs for testing the task
      inputs = {
        "platform": LINUX,
        "helper": "envCookbookVersion",
        "environmentName": "testing",
        "cookbookName": "mycookbook",
        "cookbookVersionNumber": "100.98.99"
      };

      process.env.AGENT_TEMPDIRECTORY = tempDir();

      tc = new TaskConfiguration();
      h = new Helpers(tc);

      // create a file for the environment file
      // tl.writeFile(pathJoin(tc.Paths.TmpDir, sprintf("%s.json", inputs["environmentName"])), "{}");

      await h.Run();

      // get the command stack to check the comands that have been generated
      commandStack = h.utils.getCommandStack();
    });

    it("should have run 2 commands", () => {
      expect(commandStack.length).to.eql(2);
    });

    it("uses knife to download the environment", () => {

      // build up the expected command
      let envFile: string = pathJoin(tc.Paths.TmpDir, sprintf("%s.json", tc.Inputs.EnvironmentName));
      let expected = sprintf("%s environment show %s -F json",
        tc.Paths.Knife,
        tc.Inputs.EnvironmentName
      );

      expect(expected).to.eql(commandStack[0]);

    });

    it("uses knife to upload the modified environment", () => {

      // build up the expected command
      let envFile: string = pathJoin(tc.Paths.TmpDir, sprintf("%s.json", tc.Inputs.EnvironmentName));
      let expected = sprintf("%s environment from file %s", tc.Paths.Knife, envFile);

      expect(expected).to.eql(commandStack[1]);
    });

    describe("environment json file is updated correctly", () => {

      before(() => {
        let envFile: string = pathJoin(tc.Paths.TmpDir, sprintf("%s.json", tc.Inputs.EnvironmentName));
        let jsonStr: string = readFileSync(envFile).toString();
        contents = JSON.parse(jsonStr);
      });

      it("has 1 entry in 'cookbook_versions'", () => {
        expect(Object.keys(contents["cookbook_versions"]).length).to.eql(1);
      });

      it("the cookbook has the correct version", () => {
        expect(contents["cookbook_versions"][tc.Inputs.CookbookName]).to.eql(tc.Inputs.CookbookVersionNumber);
      });

    });
  });

  describe("Configure Berkshelf", () => {

    // set the task that needs to be run
    before(() => {

        // define the inputs for testing the task
        inputs = {
          "platform": LINUX,
          "helper": "setupBerkshelf"
        };

        connectedService = {
          "url": "https://automate.example.com/organizations/myorg",
          "sslVerify": true,
          "username": "aperson",
          "password": "long client key"
        };

        tc = new TaskConfiguration();
        h = new Helpers(tc);

        h.Run();
    });

    it("creates the config file", () => {
      let expected = pathJoin(process.env.AGENT_TEMPDIRECTORY, "berks.json");
      expect(chaiFile(expected)).to.exist;
    });

    it("the client.key has the correct contents", () => {
      let clientKeyPath = pathJoin(tc.Paths.ConfigDir, "berks-client.pem");
      expect(chaiFile(clientKeyPath).content).to.equal(connectedService["password"]);
    });

    describe("the berks.json has the correct contents", () => {

      before(() => {

        // read in the contents of the configuration as a json object to test the values
        contents = JSON.parse(readFileSync(pathJoin(process.env.AGENT_TEMPDIRECTORY, "berks.json")).toString());
      });

      it("sets the node name correctly", () => {
        expect(contents["chef"]["node_name"]).to.eql(connectedService["username"]);
      });

      it("sets the path to the client key correctly", () => {
        let clientKeyPath: string = pathJoin(tc.Paths.ConfigDir, "berks-client.pem");
        expect(contents["chef"]["client_key"]).to.eql(clientKeyPath);
      });

      it("sets the URL for the chef server correctly", () => {
        expect(contents["chef"]["chef_server_url"]).to.eql(connectedService["url"]);
      });

      it("will verify the SSL certificate", () => {
        expect(contents["ssl"]["verify"]).to.eql(connectedService["sslVerify"]);
      });

    });

  });

  describe("Configure Test Kitchen", () => {

    before(() => {

      inputs = {
        "platform": LINUX,
        "helper": "setupTestKitchen"
      };

      connectedService = {
        "clientId": "1234-5678-9098-7654-3210",
        "clientSecret": "abcd-efgh-ijkl-mnopq",
        "tenantId": "rstu-vqxy-zabc-defg"
      };

      tc = new TaskConfiguration();
      h = new Helpers(tc);

      h.Run();

    });

    it("sets the AZURE_CLIENT_ID env var", () => {
      let expected = connectedService["clientId"];
      let actual = tl.getVariable("AZURE_CLIENT_ID");
      expect(expected).to.eql(actual);
    });

    it("sets the AZURE_CLIENT_SECRET env var", () => {
      let expected = connectedService["clientSecret"];
      let actual = tl.getVariable("AZURE_CLIENT_SECRET");
      expect(expected).to.eql(actual);
    });

    it("sets the AZURE_TENANT_ID env var", () => {
      let expected = connectedService["tenantId"];
      let actual = tl.getVariable("AZURE_TENANT_ID");
      expect(expected).to.eql(actual);
    });
  });

});
