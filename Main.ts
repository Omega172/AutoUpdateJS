import 'suppress-experimental-warnings';
import { get } from 'https';
import { satisfies } from 'semver';
import { copy, emptyDir, ensureDir } from 'fs-extra';
import { simpleGit } from 'simple-git';
import { exec, spawn } from 'child_process';
import appRootPath from 'app-root-path';

type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

type Config = {
    RepoURL: string;
    Branch: string;
    PathToPackage?: string;
    ExecuteOnComplete?: string;
    ExitOnComplete?: boolean;
}

type UpdateCheckCallback = (UpdateAvailable: Required<boolean>) => void; 

export class AutoUpdate {
    private SourcePath: string;
    private PackageJSON: any;
    private Config: Config;
    private URL: string;

    constructor(Config: RequiredFields<Config, `RepoURL` | `Branch`>) {
        this.SourcePath = 'file://' + appRootPath.path;
        import(this.SourcePath.concat('\\package.json'), { assert: { type: "json" } }).then((Module) => {
            this.PackageJSON = Module;
        });

        var URL = Config.RepoURL.replace('github', 'raw.githubusercontent');
        if (URL.lastIndexOf('/') != URL.length - 1) {
            URL = URL.concat('/');
        }

        URL = URL.concat(Config.Branch + '/');

        if (Config.PathToPackage != undefined) {
            var PackagePath = Config.PathToPackage;

            if (PackagePath.indexOf('/') == 0) {
                PackagePath = PackagePath.slice(PackagePath.indexOf('/') + 1, PackagePath.length);
            }

            if (PackagePath.lastIndexOf('/') != PackagePath.length - 1) {
                PackagePath = PackagePath.concat('/');
            }

            URL = URL.concat(PackagePath);
        }

        this.URL = URL.concat('package.json');

        this.Config = Config;
    }

    /**
     * CheckForUpdate
     */
    public CheckForUpdate(Callback: UpdateCheckCallback) {
        const URL = this.URL;

        get(URL, async (Res) => {
            Res.setEncoding('utf-8');
            var Body = "";

            Res.on('data', (Data) => {
                Body += Data;
            });

            Res.on("end", () => {
                if (Body == "") {
                    return Callback(false);
                }
                const JSONData = JSON.parse(Body);

                if (JSONData.name != this.PackageJSON.name) {
                    return Callback(false);
                }

                return Callback(satisfies(JSONData.version, '>' + this.PackageJSON.version));
            });
        });

        return;
    }

    /**
     * Clone
     */
    private async Clone(Destination: string) {
        const URL = this.Config.RepoURL;
        const Branch = this.Config.Branch;

        return new Promise<void>(function(Resolve, Rejct) {
            simpleGit().clone(URL, Destination, [`--branch=${Branch}`], Result => {
                if (Result != null) {
                    Rejct(`Unable to clone repo: ${URL}`);
                }

                Resolve();
            });
        });
    }

    /**
     * InstallDependencies
     */
    private InstallDependencies() {
        const SourcePath = this.SourcePath;
        return new Promise(function(Resolve, Reject) {
            const Command = `cd ${SourcePath} && npm install`;
            const Child = exec(Command);

            Child.stdout?.on('end', Resolve);
            Child.stdout?.on('data', (Data: string) => {
                if (Data.toLowerCase().includes('error')) {
                    Data = Data.replace(/\r?\n|\r/g, '');
                    console.error('Update Error:\n' + Data);
                    Reject();
                } else {
                    console.warn('Update Warning:\n' + Data);
                }
            });
        });
    }

    /**
     * Execute
     */
    private Execute(Command: string) {
        return new Promise(function(Resolve, Reject) {
            spawn(Command, [], {shell: true, detached: true});
            setTimeout(Resolve, 1000);
        });
    }

    /**
     * Update
     */
    public async Update() : Promise<boolean> {
        try {
            await ensureDir('./Temp');
            await emptyDir('./Temp');
            await this.Clone('./Temp');

            await ensureDir(this.SourcePath);
            await copy('./Temp', this.SourcePath);
            await this.InstallDependencies();

            if (this.Config.ExecuteOnComplete != undefined) {
                await this.Execute(this.Config.ExecuteOnComplete);
            }
            if (this.Config.ExitOnComplete) {
                process.exit(1);
            }
            return true;
        } catch(Error) {
            console.error(Error);
            return false;
        }
    }
}