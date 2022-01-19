
let assert = require('assert');
const { exit } = require("process");
const Hapi = require("hapi");

const init = async () => {
  const server = new Hapi.Server({ 
    port: process.env.PORT || 8080, 
    state: {
      strictHeader: false
    }
  });

  // await server.register({
  //   plugin: require('inert')
  // })

  server.route({
    method: 'GET',
    path: '/test',
    handler: function (request, reply) {
      return "Liquorish works!";
    }
  });

  // server.route({
  //   method: 'GET',
  //   path: '/{path*}',
  //   handler: {
  //   directory: {
  //         path: './app',
  //         listing: false,
  //         index: true
  //       }
  //     }     
  // });

  await server.start();
};

init();
