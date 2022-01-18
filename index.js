
let sensitive = require("./config.json");
const { Connection, Request } = require("tedious");

let DB_SERVER = sensitive["db_server"];
let DB_DATABASE = sensitive["db_database"];
let DB_USER_NAME = sensitive["db_user_name"];
let DB_PASSWORD = sensitive["db_password"];

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: DB_USER_NAME, // update me
      password: DB_PASSWORD // update me
    },
    type: "default"
  },
  server: DB_SERVER, // update me
  options: {
    database: DB_DATABASE, //update me
    encrypt: true
  }
};

const connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected!");
    //queryDatabase();
  }
});

connection.connect();

function queryDatabase() {
  console.log("Reading rows from the Table...");

  // Read all rows from table
  const request = new Request(
    `SELECT TOP 20 pc.Name as CategoryName,
                   p.name as ProductName
     FROM [SalesLT].[ProductCategory] pc
     JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
      }
    }
  );

  request.on("row", columns => {
    columns.forEach(column => {
      console.log("%s\t%s", column.metadata.colName, column.value);
    });
  });

  connection.execSql(request);
}