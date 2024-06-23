import 'suppress-experimental-warnings';
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
type Config = {
    RepoURL: string;
    Branch: string;
    PathToPackage?: string;
    ExecuteOnComplete?: string;
    ExitOnComplete?: boolean;
};
type UpdateCheckCallback = (UpdateAvailable: Required<boolean>) => void;
export declare class AutoUpdate {
    private SourcePath;
    private PackageJSON;
    private Config;
    private URL;
    constructor(Config: RequiredFields<Config, `RepoURL` | `Branch`>);
    /**
     * CheckForUpdate
     */
    CheckForUpdate(Callback: UpdateCheckCallback): void;
    /**
     * Clone
     */
    private Clone;
    /**
     * InstallDependencies
     */
    private InstallDependencies;
    /**
     * Execute
     */
    private Execute;
    /**
     * Update
     */
    Update(): Promise<boolean>;
}
export {};
