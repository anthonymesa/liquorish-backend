/**
 * Comment goes here
 */

/**
 * Dependencies for the application
 */
 const Hapi = require("@hapi/hapi");
 const { Connection, Request } = require("tedious");
 const { exit } = require("process");
 
 /**
  * API files/functions
  */
 const { loginUser } = require('./routes/loginUser')
 const { getIngredients } = require('./routes/get/getIngredients')
 const { getDob } = require('./routes/get/getDob');
 const { getBarsNearUser } = require("./routes/get/getBarsNearUser");
 const { updateUserPasswordForm, updateUserPassword } = require("./routes/update/updateUserPassword");
 const { updateUserDobForm, updateUserDob } = require("./routes/update/updateUserDob");
 const { updateUserCityStateForm, updateUserCityState } = require("./routes/update/updateUserCityState");
 const { getUser } = require("./routes/get/getUser");
 const { getTabDrinks } = require("./routes/get/getTab");
 const { getSavedDrinks } = require("./routes/get/getSavedDrinks");
 const { getBarDrinks } = require("./routes/get/getBarDrinks");
 const getLastInsertID = async =>{
    
    return new Promise((resolve, reject) => {
        //  Create dabase request to count from test table (should be 1)
        const request = new Request(`"SELECT SCOPE_IDENTITY()`,
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
 /**
  * Gets Azure DB credentials
  */
 const DB_SERVER = process.env.DB_SERVER;
 const DB_DATABASE = process.env.DB_DATABASE;
 const DB_USER_NAME = process.env.DB_USER_NAME;
 const DB_PASSWORD = process.env.DB_PASSWORD;
 const PORT = process.env.PORT || 8080;
 
 /**
  * Creates config object to be passed to tedious upon creation of a
  * new connection
  */
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
 
 /**
  * Initializes the database connection.
  * 
  * The connection object is created using the config object above. A callback
  * is provided to be fired on the .on('connect') connect event of the connection.
  * After applying the callback, the connection is established using the
  * connection object.
  * 
  */
 function init_db() {
   db_connection = new Connection(db_config);
 
   db_connection.on("connect", err => {
     if (err) {
       console.error(err);
       exit(-1);
     } else {
       init_server(db_connection);
       console.log("Database connected...");
     }
   });
 
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
 
   /**
    * GET requests
    */
 
   server.route({
     method: 'GET',
     path: '/loginUser/{username}/{password}',
     handler: (request, reply) => {
       return loginUser(request, db_connection)
     }
   });
 
   server.route({
     method: 'GET',
     path: '/ingredients/{drink_id}',
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
       return getBarsNearUser(request, db_connection)
     }
   });
 
   server.route({
     method: "GET",
     path: "/updateUserPasswordForm",
     handler: (req, res) => {
       return updateUserPasswordForm()
     }
   });
 
   server.route({
     method: "GET",
     path: "/updatedob",
     handler: (req, res) => {
       return updateUserDobForm()
     }
   });
 
   server.route({
     method: "GET",
     path: "/updateCityState",
     handler: (req, res) => {
       return updateUserCityStateForm()
     }
   });
 
   server.route({
     method: 'GET',
     path: '/user/{user_id}',
     handler: (request, reply) => {
       return getUser(request, db_connection)
     }
   })
 
   server.route({
     method: 'GET',
     path: '/tabDrinks/{user_id}/{bar_id}',
     handler: (request, reply) => {
       return getTabDrinks(request, db_connection)
     }
   })
 
   server.route({
     method: 'GET',
     path: '/savedDrinks/{user_id}',
     handler: (request, reply) => {
       return getSavedDrinks(request, db_connection)
     }
   })
 
   server.route({
     method: 'GET',
     path: '/barDrinks/{bar_id}',
     handler: (request, reply) => {
       return getBarDrinks(request, db_connection)
     }
   })
 
   /**
    * POST requests
    */
 
   server.route({
     method: "POST",
     path: "/updateUserPassword",
     handler: async (request, resp) => {
       return updateUserPassword(request, db_connection)
     }
   });
 
   server.route({
     method: "POST",
     path: "/updatedob",
     handler: async (request, resp) => {
       return updateUserDob(request, db_connection)
     }
   });
 
   server.route({
     method: "POST",
     path: "/updateCityState",
     handler: async (request, resp) => {
       return updateUserCityState(request, db_connection)
     }
   });
   server.route({
    method: "POST",
    path: "/addBar",
    handler: async (request, resp) => {
      return addBar(request, db_connection)
    }
  });
  server.route({
    method: "POST",
    path: "/addOwner",
    handler: async (request, resp) => {
      return addOwner(request, db_connection)
    }
  });
  server.route({
    method: "POST",
    path: "/addPassToBar",
    handler: async (request, resp) => {
      return addPassToBar(request, db_connection)
    }
  });

  // addPassToBar
  server.route({
    method: "POST",
    path: "/addBarToOwner",
    handler: async (request, resp) => {
      return addBarToOwner(request, db_connection)
    }
  });
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
    path: '/savedDrinks2/{user_id}',
    handler: function (request, reply) {
        const user_id = request.params.user_id;
        return new Promise((resolve, reject) => {
            const select = `select * from saved_drinks_view where user_id = ${user_id}`;
            console.log("SD2: ", select);
            //  Create dabase request to count from test table (should be 1)
            const request = new Request(select,
                (err, table) => {
                    if (err) {
                        console.log(err);
                       // resolve(false);
                    } else {
                        console.log(table);
                        //resolve(table);
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
   /**
    * This rout catches all routes that have not been appended above.
    */
   server.route({
     method: 'GET',
     path: '/{path*}',
     handler: function (request, reply) {
       return "They have curved swords!";
     }
   });
 }
 const addBar = async (request, db_connection) => {
    //user_id, city, state
   // const id = parseInt(request.payload.userId);

    const bar_name= request.payload.bar_name;
    const address_street= request.payload.address_street;
    const address_city= request.payload.address_city;
    const address_state= request.payload.address_state;
    const address_zip= request.payload.address_zip;
    const gps_lat= request.payload.gps_lat;
    const gps_lon= request.payload.gps_lon;
    const description= request.payload.description;
    const password = request.payload.password;
    // const state = request.form.state;
    
    const insert = "INSERT INTO bar (bar_name, address_street, address_city, address_state, address_zip, gps_lat, gps_lon, description)";
    const values = `'${bar_name}', '${address_street}', '${address_city}', '${address_state}', '${address_zip}', ${gps_lat}, ${gps_lon}, '${description}')`;
    

//    const update = `UPDATE users SET address_city = '${city}', address_state = '${state}' WHERE id = ${id}`;
    console.log(insert);
    return new Promise((resolve, reject) => {
      //  Create dabase request to count from test table (should be 1)
      const request = new Request(insert,
        (err, rowCount) => {
          if (err) {
            console.log(err);
            resolve(createResponse(-1, null));
          } else {
            console.log(rowCount);
            resolve(async() =>{
                const id = await getLastInsertID();
                res.redirct ("addPassToOwner/"+id+"/"+password);
            });
          }
        }
      );
  
      db_connection.execSql(request);
    });
  }
 const addOwner = async (request, db_connection) => {
    //user_id, city, state
   // const id = parseInt(request.payload.userId);

    const name_first= request.payload.name_first;
    const name_last= request.payload.name_last;
    const email= request.payload.email;
   
    // const state = request.form.state;
    
    const insert = "INSERT INTO [dbo].[owner](name_first, name_last, email)";
    const values = `'${name_first}', '${name_last}', '${email}')`;
    

//    const update = `UPDATE users SET address_city = '${city}', address_state = '${state}' WHERE id = ${id}`;
    console.log(insert);
    return new Promise((resolve, reject) => {
      //  Create dabase request to count from test table (should be 1)
      const request = new Request(insert,
        (err, rowCount) => {
          if (err) {
            console.log(err);
            resolve(createResponse(-1, null));
          } else {
            console.log(rowCount);
            resolve(createResponse(0, rowCount == 1));
          }
        }
      );
  
      db_connection.execSql(request);
    });
  }

  const addBarToOwner = async (request, db_connection) => {
    //user_id, city, state
   // const id = parseInt(request.payload.userId);

    const owner_id= request.payload.owner_id;
    const bar_id= request.payload.bar_id;
    
   
    // const state = request.form.state;
    
    const insert = "INSERT INTO [dbo].[bar_owner](owner_id, bar_id)";
    const values = `${owner_id}, ${bar_id})`;
    

//    const update = `UPDATE users SET address_city = '${city}', address_state = '${state}' WHERE id = ${id}`;
    console.log(insert);
    return new Promise((resolve, reject) => {
      //  Create dabase request to count from test table (should be 1)
      const request = new Request(insert,
        (err, rowCount) => {
          if (err) {
            console.log(err);
            resolve(createResponse(-1, null));
          } else {
            console.log(rowCount);
            resolve(createResponse(0, rowCount == 1));
          }
        }
      );
  
      db_connection.execSql(request);
    });
  }
  const addPassToBar = async (request, db_connection) => {
    //user_id, city, state
   // const id = parseInt(request.payload.userId);

    const id= request.payload.bar_id;
    const pass= request.payload.password;
    
   
    // const state = request.form.state;
    
    const insert = "INSERT INTO [dbo].[bar_pass](bar_id, password)";
    const values = `${bar_id}, '${password}')`;
    

//    const update = `UPDATE users SET address_city = '${city}', address_state = '${state}' WHERE id = ${id}`;
    console.log(insert);
    return new Promise((resolve, reject) => {
      //  Create dabase request to count from test table (should be 1)
      const request = new Request(insert,
        (err, rowCount) => {
          if (err) {
            console.log(err);
            resolve(createResponse(-1, null));
          } else {
            console.log(rowCount);
            resolve(createResponse(0, rowCount == 1));
          }
        }
      );
  
      db_connection.execSql(request);
    });
  }

 /**
  * Running inid_db will initialize the database and if it succeeds, it will
  * initialize the API server. If it doesn't succeed, NodeJs will exit.
  */
 init_db();