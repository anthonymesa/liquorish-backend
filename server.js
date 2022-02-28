
/**
 * Comment goes here
 */

const Hapi = require("@hapi/hapi");
const { Connection, Request } = require("tedious");
const { exit } = require("process");

const { loginUser } = require('./routes/loginUser')
const { getIngredients } = require('./routes/getIngredients')
const { getDob } = require('./routes/getDob');
const { getBarsNearMe } = require("./routes/getBarsNearMe");

const DB_SERVER = process.env.DB_SERVER;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_USER_NAME = process.env.DB_USER_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const PORT =  process.env.PORT || 8080;

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


async function init_server(db_connection) {

    //  Creates Hapi server object that uses the port given by environment variable.
    //  if the environment variable doesn't exist, then 8080 is default.
    console.log("starting on port: " + PORT);
    const server = new Hapi.Server({
        port: PORT,
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

function set_routes(server, db_connection) {

    server.route({
        method: 'GET',
        path: '/login/{username}/{password}',
        handler: (request, reply) => {
            return loginUser(request, db_connection)    
        }
    });
    
    server.route({
        method: 'GET',
        path: '/ingredients',
        handler: (request, reply) => {
            return getIngredients(request, db_connection)
        }
    });

    server.route({
        method: 'GET',
        path: '/dob/{user_id}',
        handler: (request, reply) => {
            return getDob(request, db_connection)
        }
    });

    server.route({
        method: 'GET',
        path: '/bars/{user_id}',
        handler: (request, reply) => {
            return getBarsNearMe(request, db_connection)
        }
    });

    server.route({
        method: "GET",
        path: "/changePass",
        handler: (req, res) => {
            let c = "Content-Type': 'text/html'";

            c += '<h3>Update:</h3><form action="updatePassword" method="post">';
            c += 'Use-ID: <input type="text" name="user_id" placeholder="userid"><br/><br/>';
            c += ' Current Pass: &nbsp;<input type="text" name="curr_pass_hash" placeholder="curr_pass_hash"><br/>';
            c += ' New Pass: &nbsp;<input type="text" name="new_pass_hash" placeholder="curr_pass_hash"><br/>';
            c += '<p><input type="submit" value="Update Password"></p>';
            c += '</form>';
            return c;
        }
    });

    server.route({
        method: "POST",
        path: "/updatePassword",
        handler: async (request, resp) => {
            //user_id, curr_pass_hash, new_pass_hash  
            //
            const userId = parseInt(request.payload.user_id);
            const currPass = request.payload.curr_pass_hash;
            const newPass = request.payload.new_pass_hash;
            const update = `UPDATE users_pass SET password = '${newPass}' WHERE users_id = ${userId} AND password='${currPass}'` ;
            console.log(update);
            return new Promise((resolve, reject) => {
                //  Create dabase request to count from test table (should be 1)
                const request = new Request(update,
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

    server.route({
        method: "GET",
        path: "/updatedob",
        handler: (req, res) => {
            let c = "Content-Type': 'text/html'";

            c += '<h3>Update:</h3><form action="updateDOB" method="post">';
            c += 'Use-ID: <input type="text" name="userId" placeholder="userid"><br/><br/>';
            c += ' DOB: &nbsp;<input type="text" name="dob" placeholder="dob"><br/>';
            c += '<p><input type="submit" value="Update Birthdate"></p>';
            c += '</form>';
            return c;
        }
    });

    server.route({
        method: "POST",
        path: "/updatedob",
        handler: async (request, resp) => {
            //user_id, city, state
            const userId = parseInt(request.payload.userId);
            const dob = request.payload.dob;
            // const state = request.form.state;
            const update = `UPDATE users SET birth_date = '${dob}' WHERE id = ${userId}`;
            console.log(update);
            return new Promise((resolve, reject) => {
                //  Create dabase request to count from test table (should be 1)
                const request = new Request(update,
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
        //  This fucntion is async so that we can await the database call synchronously

    });

    server.route({
        method: "GET",
        path: "/updateCityState",
        handler: (req, res) => {
            let c = "Content-Type': 'text/html'";

            c += '<h3>Update:</h3><form action="updateCityState" method="post">';
            c += 'User-ID: <input type="text" name="userId" placeholder="User Id"><br/><br/>';
            c += ' City: &nbsp;<input type="text" name="city" placeholder="City"><br/>';
            c += ' State: &nbsp;<input type="text" name="state" placeholder="State"><br/>';
            c += '<p><input type="submit" value="Update User"></p>';
            c += '</form>';
            return c;
        }
    });

    server.route({
        method: "POST",
        path: "/updateCityState",
        handler: async (request, resp) => {
            //user_id, city, state
            const id = parseInt(request.payload.userId);
            const city = request.payload.city;
            const state = request.payload.state;
            // const state = request.form.state;
            const update = `UPDATE users SET address_city = '${city}', address_state = '${state}' WHERE id = ${id}`;
            console.log(update);
            return new Promise((resolve, reject) => {
                //  Create dabase request to count from test table (should be 1)
                const request = new Request(update,
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
        //  This fucntion is async so that we can await the database call synchronously

    });

    server.route({
        method: "GET",
        path: "/userpw",
        handler: (req, res) => {
            let c = "Content-Type': 'text/html'";

            c += '<h3>Update:</h3><form action="userpw" method="post">';
            c += 'Username: <input type="text" name="userId" placeholder="userid"><br/><br/>';
            c += ' Password: &nbsp;<input type="password" name="password" placeholder="password"><br/>';
            c += '<p><input type="submit" value="Change Password"></p>';
            c += '</form>';
            return c;
        }
    });

    server.route({
        method: "POST",
        path: "/userpw",
        handler: async (request, resp) => {
            //user_id, city, state
            const userId = parseInt(request.payload.userId);
            const pw = request.payload.password;
            // const state = request.form.state;
            const update = `UPDATE users_pass SET password = '${pw}' WHERE users_id = ${userId}`;
            console.log(update);
            return new Promise((resolve, reject) => {
                //  Create dabase request to count from test table (should be 1)
                const request = new Request(update,
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
        //  This fucntion is async so that we can await the database call synchronously

    });

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
}

//=============================================================================
//  MAIN
//=============================================================================

//  Running init_db will initialize the database and if it succeeds, it will
//  initialize the server. If it doesn't succed, node will exit.
init_db();
