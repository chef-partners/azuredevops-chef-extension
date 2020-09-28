import {join as pathJoin} from "path";
import {sprintf} from "sprintf-js"; // provides sprintf functionaility
import * as tl from "azure-pipelines-task-lib"; // task library for Azure DevOps

export class Paths {
    public Berks: string = null;
    public BerksConfig: string = null;
    public Chef: string = null;
    public ChefClient: string = null;
    public ChefWorkstationDir: string = null;
    public Habitat: string = null;
    public InspecEmbedded: string = null;
    public Inspec: string = null;
    public Kitchen: string = null;
    public Knife: string = null;
    public PrivateKey: string = null;
    public ResourceFile: string = null;
    public Script: string = null;
    public Sudo: string = "/usr/bin/sudo";
    public TmpDir: string;
    public ConfigDir: string;

    /**
     * Depending on the OS the correct defaults will be set on the paths
     * @param osName Name of the operating system that the task is running o
     */
    constructor(osName: string, resourceFile?: string) {

      let extension: string = "";

      // Set the TmpDir to the path of the agent environment variable
      this.TmpDir = process.env.AGENT_TEMPDIRECTORY;

      if (osName === "win32") {
        extension = ".bat";
        this.ChefWorkstationDir = pathJoin("C:", "opscode", "chef-workstation");
        this.Inspec = pathJoin("C:", "opscode", "inspec", "bin", "inspec.bat");
        this.Habitat = pathJoin("C:", "ProgramData", "Habitat", "hab.exe");

        // set the path to the installation script
        this.Script = pathJoin(this.TmpDir, "install.ps1");
      } else {
        this.ChefWorkstationDir = pathJoin("/", "opt", "chef-workstation");
        this.Inspec = pathJoin("/", "usr", "bin", "inspec");
        this.Habitat = pathJoin("/", "bin", "hab");

        // set the path to the installation script
        this.Script = pathJoin(this.TmpDir, "install.sh");
      }

      // set the path to the individual commands based on the workstation dir
      this.Chef = pathJoin(this.ChefWorkstationDir, "bin", sprintf("chef%s", extension));
      this.ChefClient = pathJoin(this.ChefWorkstationDir, "bin", sprintf("chef-client%s", extension));
      this.Berks = pathJoin(this.ChefWorkstationDir, "bin", sprintf("berks%s", extension));
      this.InspecEmbedded = pathJoin(this.ChefWorkstationDir, "bin", sprintf("inspec%s", extension));
      this.Kitchen = pathJoin(this.ChefWorkstationDir, "bin", sprintf("kitchen%s", extension));
      this.Knife = pathJoin(this.ChefWorkstationDir, "bin", sprintf("knife%s", extension));

      // determine the full path to the privatekey
      // this starts by working it out the name of the file
      // this is done so that multiple keys can be written out by several tasks if so required
      let filenameParts = [];
      let privKeyFilename = "";
      filenameParts.push("azdo");
      process.env.AGENT_ID ? filenameParts.push(process.env.AGENT_ID) : false;
      process.env.RELEASE_ENVIRONMENTID ? filenameParts.push(process.env.RELEASE_ENVIRONMENTID) : false;
      privKeyFilename = sprintf("%s.pem", filenameParts.join("-"));

      // set the full path to the private key
      this.PrivateKey = pathJoin(this.TmpDir, privKeyFilename);

      // set the path to the berks configuration file
      let berksConfigFilename = sprintf("berks.%s.json", filenameParts.join("-"));
      this.BerksConfig = pathJoin(this.TmpDir, berksConfigFilename);

      // Set a path to the configdir for chef
      this.ConfigDir = pathJoin(this.TmpDir, "chef");

      // Set the ResourceFile
      if (resourceFile) {
        this.ResourceFile = resourceFile;
      }
    }

    /**
     * As InSpec can be installed as a separate smaller package, there can be two locations
     * for it. This method attempts to return the path to inspec, starting with the path to the
     * standalone version.
     * If neither path exists then false is returned
     */
    public GetInspecPath(): string {

      let result: string = null;

      // check to see if the inspec paths exist
      if (tl.exist(this.Inspec)) {
        result = this.Inspec;
      } else if (tl.exist(this.InspecEmbedded)) {
        result = this.InspecEmbedded;
      }

      return result;
    }

    /**
     * Get the path for the component
     */
    public GetPath(name: string): string {

      let path: string = null;

      // perform a switch on the name of the component and return the path to it
      switch (name) {
        case "berks":
          path = this.Berks;
          break;
        case "chef":
          path = this.Chef;
          break;
        case "chef-client":
          path = this.ChefClient;
          break;
        case "habitat":
          path = this.Habitat;
          break;
        case "knife":
          path = this.Knife;
          break;
        case "inspec":
          path = this.GetInspecPath();
          break;
        case "kitchen":
          path = this.Kitchen;
          break;
      }

      return path;
    }
  }