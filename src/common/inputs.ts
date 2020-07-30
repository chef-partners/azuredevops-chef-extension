export class Inputs {
    public ComponentName: string = null; // Name of the software component being installed or executed
    public GemName: string = null; // If the component is a gem, state the gem to be installed
    public ForceInstall: boolean = false; // Force the installation of the software
    public UseSudo: boolean = false; // Should Sudo be used for the operations
    public Version: string = null; // The version of the software component to install
    public Channel: string = null; // WHat channel should the software component be installed from
    public TargetPath: string = null; // The path to download software to
    public Arguments: string = null; // Arguments that need to be passed to the component being executed
    public WorkingDir: string = null; // Directory that commands should be run within
    public EnvVars: string = null; // EnvVars that have been requested on the task

    // Declare properties to be used for determining the helper to run
    public Helper: string = null; // the helper that needs to be run
    public CookbookVersionNumber: string = null; // the version number to assign to the cookbook
    public CookbookMetadataPath: string = null; // path to the metadata file to update
    public CookbookVersionRegex: string = null; // regex pattern to use to update the version number in a cookbook

    // Declare properties to be used for accessing Chef based servers
    public TargetURL: string = null; // Server URL as defined in the service endpoint
    public SSLVerify: boolean = true; // State if SSL verification should be performed when using the TargetURL
    public Username: string = null; // Username, nodename or clientname to be used when interacting wit the specified server
    public Password: string = null; // Password, client key or user key when a username is specified

    // Declare properties for the Habitat configuration
    public HabitatDepotURL: string = null; // URL to the Habitat Depot to which the package will be published
    public HabitatOriginName: string = null; // Name of the origin to use when building the package
    public HabitatOriginRevision: string = null; // Revision of the origin keys
    public HabitatOriginPublicKey: string = null; // Public key of the specified origin
    public HabitatOriginSigningKey: string = null; // Private key or signing key of the origin
    public HabitatAuthToken: string = null; // Habitat authentication token

    // Declare properties used when dealing with version contraints on a chef environment
    public EnvironmentName: string = null; // Name of the Chef envrionment to update
    public CookbookName: string = null; // Name of the cookbook being updated

    // Declare properties for Azure credentials when using Test Kitchen
    public SubscriptionId: string = null;
    public TenantId: string = null;
    public ClientId: string = null;
    public ClientSecret: string = null;

    public SudoIsSet(): boolean {
      let result: any = this.UseSudo;
      if (typeof result === "string") {
        result = (result === "true");
      }
      return result;
    }

    public ForceIsSet(): boolean {
      let result: any = this.ForceInstall;
      if (typeof result === "string") {
        result = (result === "true");
      }
      return result;
    }
  }