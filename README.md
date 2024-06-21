# Auto Update

This is a very simple module that enables a node.js application to check for updates from a GitHub repo.

## Setup
Clone the repo<br>
`git clone Omega172/Auto-Update`<br><br>

Change into the directory and install the dependencies<br>
`cd Auto-Update && npm install`<br><br>

Now build the module<br>
`npm run build`<br><br>

Then copy `Main.js` & `Main.d.ts` from the `Build` directory to your project and import the module with `import { AutoUpdate } from './Build/Main.js';`

## Example Use
```ts
import { AutoUpdate } from './Build/Main.js';

const Config = {
    RepoURL: 'https://github.com/Omega172/Verification-Bot/',
    Branch: 'main',
    PathToPackage: '/VRC Bot/',
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
- [ ] Support updating from releases
- [ ] Publish the package
