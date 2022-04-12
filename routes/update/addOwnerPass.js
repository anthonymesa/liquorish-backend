
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')
const addOwnerPass = async (request, db_connection) => {

  const name_first= request.payload.owner_id;
  const name_last= request.payload.password;
 
  
    const insert = `INSERT INTO owner_pass(owner_id, password) values(${owner_id}, '${password}')`;
  
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


module.exports = { addOwnerPass }