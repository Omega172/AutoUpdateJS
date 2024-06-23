# Auto Update

This is a very simple module that enables a node.js application to check for updates from a GitHub repo.

## Installation
`npm install @omega172/autoupdatejs`

## Example Use
```ts
import { AutoUpdate } from './Build/Main.js';

const Config = {
    RepoURL: 'https://github.com/Omega172/AutoUpdateJS/',
    Branch: 'main',
    PathToPackage: '/EXAMPLE PATH/ANOTHER_FOLDER/',
    ExecuteOnComplete: 'echo Update complete!',
    ExitOnComplete: true
}

const AutoUpdater = new AutoUpdate(Config);
AutoUpdater.CheckForUpdate((UpdateAvailable) => {
    if (UpdateAvailable) {
        AutoUpdater.Update();
    } else {
        console.log('Up to date');
    }
});
```

# TODO
- List of files to exclude by path
- Support updating from releases
