//  
//  Liquorish Server
//

//=============================================================================
//  REQUIRE
//=============================================================================

const Hapi = require("@hapi/hapi");
const { Connection, Request } = require("tedious");
const { exit } = require("process");

//=============================================================================
//  DATABASE
//=============================================================================

//  Get database info from environment variables
let DB_SERVER = process.env.DB_SERVER;
let DB_DATABASE = process.env.DB_DATABASE;
let DB_USER_NAME = process.env.DB_USER_NAME;
let DB_PASSWORD = process.env.DB_PASSWORD;

//  Configuration for database connection
const db_config = {
    server: DB_SERVER,
    database: DB_DATABASE,
    options: {
        database: DB_DATABASE
    },
    authentication: {
        type: "default",
        options: {
            userName: DB_USER_NAME,
            password: DB_PASSWORD,
            port: 1433
        }
    }
};

function init_db() {
    //  Create new database connection object using configuration
    db_connection = new Connection(db_config);

    //  Set callback for db_connection's 'connect' event, to be called after 
    //  trying to connect via .connect().
    db_connection.on("connect", err => {
        if (err) {
            console.error(err);
            exit(-1);
        } else {
            init_server(db_connection);
            console.log("Database connected...");
        }
    });

    //  Try to establish a connection with the database.
    db_connection.connect();
}

//=============================================================================
//  SERVER
//=============================================================================

//  Define asynchronous function to initialize server with its routes defined.
async function init_server(db_connection) {

    //  Creates Hapi server object that uses the port given by environment variable.
    //  if the environment variable doesn't exist, then 8080 is default.
    const server = new Hapi.Server({
        port: process.env.PORT || 8080,
        state: {
            strictHeader: false
        },
        routes: {
            cors: true
        }
    });

    //  Set the url routes that the API will serve.
    set_routes(server, db_connection);

    await server.start();
};

//  Set the routes for the server that can be called as API.
function set_routes(server, db_connection) {
    //  Defines route callback for GET requests sent to 'http://.../test'.
    //  Returns a promise to be fulfilled.

    //  API Function: test
    //    Tests that the database is up and connected by sending
    //    a query to evaluate the length of the test_table, which
    //    should only have a single value in it. 
    server.route({
        method: 'GET',
        path: '/test',
        handler: function (request, reply) {
            return new Promise((resolve, reject) => {
                //  Create dabase request to count from test table (should be 1)
                const request = new Request(`SELECT count(value) FROM test_table`,
                    (err, rowCount) => {
                        if (err) {
                            console.log(err);
                            resolve(false);
                        } else {
                            console.log(rowCount);
                            resolve(rowCount == 1);
                        }
                    }
                );

                db_connection.execSql(request);
            });
        }
    });

    //API Function: tests a simple database function
    server.route({
        method: 'GET',
        path: '/testTables'
        handler: function (request, reply) {
            return new Promise((resolve, reject) => {
                //  Create dabase request to count from test table (should be 1)
                const request = new Request(`SELECT * FROM bar`,
                    (err, table) => {
                        if (err) {
                            console.log(err);
                            resolve(false);
                        } else {
                            console.log(table);
                            resolve(table);
                        }
                    }
                );

                db_connection.execSql(request);
            });
        }
    });
}

    //  API Function: do nothing
    //    This route catches all paths that are not explicitly given above.
    //    therefore any call to a URL that isn't defined above will get the
    //    'curved swords' message.
    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: function (request, reply) {
            return "They have curved swords!";
        }
    });


    

//=============================================================================
//  MAIN
//=============================================================================

//  Running init_db will initialize the database and if it succeeds, it will
//  initialize the server. If it doesn't succed, node will exit.
init_db();
