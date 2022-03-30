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
const PORT =  process.env.PORT || 8080;
//  Define asynchronous function to initialize server with its routes defined.
async function init_server(db_connection) {

    //  Creates Hapi server object that uses the port given by environment variable.
    //  if the environment variable doesn't exist, then 8080 is default.
    console.log("starting on port: "+PORT);
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
        path: '/testTables',
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

    server.route({
        method: 'GET',
        
        //  We can pull variables out of the url provided. in this case, if we called the url
        //      http://liquorish-server.azurewebsites.net/login/JoJo217/EDDEF9E8E578C2A560C3187C4152C8B6F3F90C1DCF8C88B386AC1A9A96079C2C
        //  Then username would equate 'JoJo217' and password_hash 'EDDEF9E8E578C2A560C3187C4152C8B6F3F90C1DCF8C88B386AC1A9A96079C2C'
        //  (the actual password for this dummy account is 'TestPass' which has been run through sha256 encryption via https://passwordsgenerator.net/sha256-hash-generator/
        //  though we will need to be sha'ing ourselves on the front end).
        path: '/login/{username}/{password}',

        //  This fucntion is async so that we can await the database call synchronously
        handler: async function (request, reply) {

            //  setting these to values so that they don't go out
            //  of scope inside the promise (because the request object
            //  may not be available at the point we are trying to access the 
            //  values in the promise due to the asynchronous nature of things).

            const username = request.params.username;
            const password = request.params.password;
            
            //  declare the password hash variable so that it can be filled inside the request.
            let true_password;
            let userId=-1;
            //  because we have to wait on the response from the databse, we can call await
            //  to ensure that we synchronously make our databse call before returning the 
            //  data to the connection that requested it.
            return await new Promise((resolve, reject) => {

                //  Get the user ID from the users table given a username,
                //  and then get the pass hash from the user_pass table given
                //  the user id. there should either be 1 row return, or 0.
                const request = new Request(
                    `select password, users_id from users_pass where users_id = (
                        select id from users where username = '${username}'
                    )`,
                    (err, rowCount) => {
                        if (err) {
                            resolve(false);
                        } else {
                            // we dont want to resolve/return here.                    
                        }
                    }
                );
                
                //  here we set a callback for the 'row' event which will be called for
                //  each row returned from the database call made above. an anonymous 
                //  function is provided as the callback, and the 'columns' variable is provided
                //  by the row event (the columns contains all of the individual data objects that
                //  signify each value for each column). Since the SQL above would yield a single row
                //  consisting of a single element, we want to get the first column in the row and 
                //  get the value by calling the .value attribute of the object. we can then set the true_password_hash
                //  that we defined above to that value.
                request.on('row', columns => {
                   
                    true_password = columns[0].value;
                    console.log('row: ', true_password);
                    userId = columns[1].value;
                });

                //  The doneProc event will be evaluated when all of the request functionality is complete.
                //  Given this, this is where we want to be able to evaluate everything we have now and resolve.
                //  here we are resolving whether the hash that was provided in the url matches the hash that
                //  was returned from the database call. if they are the same, then return true. on the front end
                //  if true is recieved, then the user would be logged in. if false is recieved, the user would be
                //  told something along the lines of 'username or password incorrect'.
                request.on('doneProc', function (rowCount, more, returnStatus, rows) {
                    console.log(true_password, " equals ", password)
                    return resolve(true_password == password?userId:-1);
                });

                db_connection.execSql(request);
            });
        }
    });
    //Get drinks from tables
    server.route({
        method: 'GET',
        path: '/drinks',

        //  This fucntion is async so that we can await the database call synchronously
        handler: async function (request, reply) {
            //  because we have to wait on the response from the databse, we can call await
            //  to ensure that we synchronously make our databse call before returning the 
            //  data to the connection that requested it.
            return await new Promise((resolve, reject) => {
                const request = new Request(
                    `select * from inventory_item`,
                    (err, rowCount) => {
                        console.log("drinks done");
                        if (err) {
                            console.log(rowCount);
                        } else {
                            console.log("this worked");
                        }
                    }
                );
                var arr = new Array();
                request.on('row', columns => {
                    var innerArr = new Array();
                    columns.forEach(element => {
                        console.log(element.value);
                        innerArr.push(element.value);
                    });
                    arr.push(innerArr);
                });
                request.on('doneProc', function (rowCount, more, returnStatus, rows) {
                    return resolve(arr);
                });

                db_connection.execSql(request);
            });
        }
    });
    server.route({
        method: 'GET',
        path: '/dob/{user_id}',

        //  This fucntion is async so that we can await the database call synchronously
        handler: async function (request, reply) {
            //  because we have to wait on the response from the databse, we can call await
            //  to ensure that we synchronously make our databse call before returning the 
            //  data to the connection that requested it.
            const id =request.params.user_id;
            return await new Promise((resolve, reject) => {
                const request = new Request(
                    `select birth_date from users where id = ${id}`,
                    (err, rowCount) => {
                      //  console.log("query done");
                        if (err) {
                            console.log(rowCount);
                        } else {
                            console.log("this worked");
                            //resolve();
                        }
                    }
                );
                var dob;
                request.on('row', columns => {
                  //  console.log("on");
                    dob=columns[0];
                  //  console.log(dob);
                });
                request.on('doneProc', function (rowCount, more, returnStatus, rows) {
                    return resolve(dob);
                });

                db_connection.execSql(request);
            });
        }
    });
    //Get list of bars by user id
    server.route({
        method: 'GET',
        //Takes in user id as a param through path
        path: '/bars/{user_id}',
        handler: async function (request, reply) {
            const user_id = request.params.user_id;
            const query = `select * from bar where address_city = (select address_city from users where id =${user_id})`;
            console.log(query);
            return await new Promise((resolve, reject) => {
                const request = new Request(query,
                    (err, rowCount) => {
                        console.log(rowCount);
                        if (err) {
                            return resolve({});
                        } else {
                            console.log("this worked");
                        }
                    }
                )
           
            //As above, pushes each line of data to an array, then pushes the array to an outer array
            //Outer array is returned as an array of arrays
            var arr = new Array();
            request.on('row', columns => {
                var innerArr = new Array();
                columns.forEach(element => {
                    console.log(element.value);
                    innerArr.push(element.value);
                });
                arr.push(innerArr);
            });
            //Final return of array on completion
            request.on('doneProc', function (rowCount, more, returnStatus, rows) {
                return resolve(arr);
            });
            db_connection.execSql(request);
        });
        }
    });
    
    //Post request test on test table

    server.route({
        method: "POST",
        path: "/user",
        handler: async (request, resp) => {
            //user_id, city, state
            const userId = parseInt(request.form.user_id);
            const city = request.form.city;
            const state = request.form.state;
            const insert = `INSERT INTO test_table (value) VALUES (${userId})`;
            console.log(insert);
            return new Promise((resolve, reject) => {
                //  Create dabase request to count from test table (should be 1)
                const request = new Request(insert,
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
        method: "GET",
        path: "/userdob",
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
        path: "/updateDOB",
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
