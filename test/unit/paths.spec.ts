/**
 * Perform tests to ensure that the paths class is working correcty
 */

// Import libraries --------------------------------------------------
// - local libs
import { Paths } from "../../src/common/paths";

// - External task libs
import * as rimraf from "rimraf";
import {sprintf} from "sprintf-js"; // provides sprintf functionaility
import * as tl from "azure-pipelines-task-lib";

// - Standard libs
import { join as pathJoin } from "path";
import { mkdirSync, existsSync, unlinkSync } from "fs";

// - Test libraries
import { expect } from "chai";

// -------------------------------------------------------------------

const WINDOWS = "win32";
const LINUX = "linux";

let cmds: {} = {};
let paths: Paths;

let oldInspecPath: string;
let newInspecPath: string;

// define the commands and what the expected path is
cmds = {
    "berks": {
        "win32": pathJoin("C:", "opscode", "chef-workstation", "bin", "berks.bat"),
        "linux": pathJoin("/", "opt", "chef-workstation", "bin", "berks")
    },
    "chef": {
      "win32": pathJoin("C:", "opscode", "chef-workstation", "bin", "chef.bat"),
      "linux": pathJoin("/", "opt", "chef-workstation", "bin", "chef")
    },
    "chef-client": {
      "win32": pathJoin("C:", "opscode", "chef-workstation", "bin", "chef-client.bat"),
      "linux": pathJoin("/", "opt", "chef-workstation", "bin", "chef-client")
    },
    "habitat": {
      "win32": pathJoin("C:", "ProgramData", "Habitat", "hab.exe"),
      "linux": pathJoin("/", "bin", "hab")
    },
    "knife": {
      "win32": pathJoin("C:", "opscode", "chef-workstation", "bin", "knife.bat"),
      "linux": pathJoin("/", "opt", "chef-workstation", "bin", "knife")
    },
    "kitchen": {
      "win32": pathJoin("C:", "opscode", "chef-workstation", "bin", "kitchen.bat"),
      "linux": pathJoin("/", "opt", "chef-workstation", "bin", "kitchen")
    }
};

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

process.env.AGENT_TEMPDIRECTORY = tempDir();

function checkPath(cmd: string, path: string) {
  it(sprintf("returns the correct path for %s", cmd), () => {
    // get the actual value
    let actual = paths.GetPath(cmd);

    expect(actual).to.eql(path);
  });
}

// ensure the paths for windows are correct
describe("Windows", () => {

    before(() => {

      // create an instance of paths to test
      paths = new Paths(WINDOWS);
    });

    // iterate around the cmds and check the output
    for (let cmd of Object.keys(cmds)) {
       checkPath(cmd, cmds[cmd][WINDOWS]);
    }

    it("returns path of standalone InSpec if it exists", () => {
      // write file to simulate existence of InSpec
      newInspecPath = pathJoin(tempDir(), "inspec.bat");
      tl.writeFile(newInspecPath, "");

      oldInspecPath = paths.Inspec;
      paths.Inspec = newInspecPath;

      // get the actual value
      let actual = paths.GetPath("inspec");

      expect(actual).to.eql(newInspecPath);
    });

    after(() => {
      unlinkSync(newInspecPath);
      paths.Inspec = oldInspecPath;
    });

});

// ensure the paths for linux are correct
describe("Linux", () => {

  before(() => {
      // create an instance of paths to test
      paths = new Paths(LINUX);
  });

  // iterate around the cmds and check the output
  for (let cmd of Object.keys(cmds)) {
    checkPath(cmd, cmds[cmd][LINUX]);
  }
});