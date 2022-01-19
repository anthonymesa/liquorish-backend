
// const { Connection, Request } = require("tedious");

// let DB_SERVER = process.env.DB_SERVER;
// let DB_DATABASE = process.env.DB_DATABASE;
// let DB_USER_NAME = process.env.DB_USER_NAME;
// let DB_PASSWORD = process.env.DB_PASSWORD;

// const config = {
//   server: DB_SERVER, // or "localhost"
//   database: DB_DATABASE,
//   options: {
//     database: DB_DATABASE
//   },
//   authentication: {
//     type: "default",
//     options: {
//       userName: DB_USER_NAME, // update me
//       password: DB_PASSWORD, // update me
//       port: 1433
//     }
//   }
// };

// const connection = new Connection(config);

// // Attempt to connect and execute queries if connection goes through
// connection.on("connect", err => {
//   if (err) {
//     console.error(err.message);
//   } else {
//     testDatabase();
//   }
// });

// connection.connect();

// function testDatabase() {
//   // Read all rows from table
//   const request = new Request(
//     `SELECT count(value) FROM test_table`,
//     (err, rowCount) => {
//       if (err) {
//         console.error(err.message);
//         exit(-1);
//       } else {
//         assert(rowCount == 1);
//       }
//     }
//   );

//   connection.execSql(request);
// }