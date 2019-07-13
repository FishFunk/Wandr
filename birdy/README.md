# README #

## Cloning code and installing packages and typings
### Yarn builds
This Google Firebase Functions project uses Yarn, not NPM. Do not mix NPM with Yarn.
```bash
$ git clone https://cwcg@bitbucket.org/cwcg/livingfit-backend.git
$ cd ./livingfit-backend
``` 
#### Do you have Visual Studio Code in your PATH? 
If you do, then you can do the following:
```bash
$ code .
```
to open the entire project in VS Code.

#### How to add Visual Studio code to your PATH?
https://code.visualstudio.com/docs/setup/mac
 * Launch VS Code.
 * Open the Command Palette ```(Ctrl+Shift+P)```and type '```shell command```' to find the Shell Command: Install 'code' command in PATH command.

#### Do not use VS Code bash terminal for firebase-tools CLI commands. It's buggy and can corrupt the project.
Note that the on Windows, the VS Code Integrated Terminal (bash style) does not work well
with the firebase CLI. 

#### Run from Powershell
Install packages and then build the TypeScript app.
```bash
$ cd ./functions
$ yarn
$ yarn build
```
and maybe (not tested)
```bash
$ typings install
```
### npm (Node)
#### Not supported yet.
See roadmap for anticipated support.

## Running on your machine on localhost
```bash
$ cd ..
$ firebase serve --only functions # to only emulate functions
```
or
```bash
$ firebase serve --only functions,hosting # to emulate both functions and hosting
```

## Deploying to remote enviornment (aka project). In our case, it's to dev (FIREBASE PROJECT NAME).
Remember to build with yarn before doing a deployment. There is no live reload or compile set up.
Even if there were, because we are using Express w/ TypeScript, we need to build the TS files into JS files.

```bash
$ firebase deploy
```

and often times
```bash
$ cd ./functions
$ yarn
$ yarn build
$ cd ..
$ firebase deploy
```

as of 7/13/2019
```bash
$ cd ./functions
$ yarn
$ tsc
$ cd ..
$ firebase deploy --only functions
```

or 
```bash
$ cd ./functions
$ yarn
$ tsc
$ cd ..
$ firebase deploy
```