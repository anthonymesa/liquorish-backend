# Liquorish (server)

NodeJs server that provides the backend for the Liquorish app [HERE](https://github.com/anthonymesa/liquorish-frontend).

## Development

### Prerequisites

This project requires the use of NodeJs 14, with associated npm package manager.

### Running

For this project to run correctly, the proper environment variables must be set. These are:

- DB_SERVER
- DB_DATABASE
- DB_USER_NAME
- DB_PASSWORD

These are currently set as secrets in the repository and are provided during deployment to the Azure web-app instance in the file .github/workflows/main_liquorish-server.yml

You will need to set these environment variables in your development environment or the project will not run. You can find a shell script that will install these variables for you in our Discord. Once you have the config.sh file on your machine, just run ```. ./config.sh``` in the terminal in which you will be starting the server.

Start the server with either of these choices:
- ```npm start``` This will run the start script listed in package.json.
- ```node .``` This will run the server at the root of the project, starting at the file listed as 'main' in the package.json
- ```node server.js``` This will run the server starting at the file provided.

Using ```npm start``` is the recommended method as this is the same command that is run by the Azure instance when it is deployed.

### Troubleshooting

When running for the first time, you may get an error that modules cannot be found in node_modules. In this case run ```npm install``` to install the modules.

### Resources

- [Javascript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)