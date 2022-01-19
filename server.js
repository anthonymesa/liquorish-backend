
let assert = require('assert');
let db = require('./db.js');
const { exit } = require("process");
const Hapi = require("@hapi/hapi");

const init = async () => {
  const server = new Hapi.Server({ 
    port: process.env.PORT || 8080, 
    state: {
      strictHeader: false
    }
  });

  server.route({
    method: 'GET',
    path: '/test',
    handler: function (request, reply) {
      return databaseConnected();
    }
  });

  await server.start();
};

init();
