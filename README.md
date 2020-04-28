# WirVonHier Server

## Installation

Create a new directory:

`mkdir wirvonhier`

`cd wirvonhier`

Clone the repository:

`git clone https://github.com/wirvonhier/server`

`cd server`

Install all necessary node packages:

`npm install`

Copy the default environment file to make certain configurations locally available:

`cp .env.default .env`

You need a DB dump to seed the db. These JSON files should be located in `server/mongo-seed`.

Finally, run `sudo docker-compose up`

## Start

To start the client run the following command:

`npm run dev`

This starts a node server which has hot reloading enabled. By default, the server can be found at [localhost:3000](localhost:3000).

You should be able to see that the connection to the DB was successful by opening Mongo Express at [0.0.0.0:8081](0.0.0.0:8081).
## Development

We strongly encourage to use *Visual Studio Code* with a couple of plugins that will automatically run linting processes after code changes and keep the code style clean. In the base folder `wirvonhier` create a new file called `wirvonhier.code-workspace` and add the following code to it:

```
{
  "folders": [
    {
      "path": "client"
    },
    {
      "path": "server"
    }
  ],
  "settings": {
    "css.validate": false,
    "less.validate": false,
    "scss.validate": false,
    "eslint.validate": [
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact"
    ],
    "editor.formatOnSave": false,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true,
      "source.fixAll.stylelint": true
    }
  }
}
```

Next open this file inside *Visual Studio Code* (or double click the workspace file) to open the whole workspace and load the linting settings.

Install the following extensions:

- ESLint (version >= 2.1.5)
- stylelint (version >= 0.84.0)
- Vetur (version >= 0.24.0)

Restart *Visual Studio Code* afterwards.

## Deployment

Please run `npm run lint` before pushing any code changes or merges, especially to the branches `development` and `testing` otherwise the build process will fail.




