
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')


const updateBar = async (request, db_connection) => {

  const barID = parseInt(request.payload.bar_id);
  const address = request.payload.address_street;
    const address_city = request.payload.address_city;
    const address_state = request.payload.address_state;
    const address_zip = parseInt(request.payload.address_zip);
    const owner_pass = request.payload.owner_pass;
    const update = `UPDATE bar SET 
                    address_street = '${address_street}',
                    address_city = '${address_city}',
                    address_state = '${address_state}',
                    address_zip = ${address_zip}
                    WHERE id = ${barID}`;
  return new Promise((resolve, reject) => {
    //  Create dabase request to count from test table (should be 1)
    const request = new Request(update,
      (err, rowCount) => {
          if (err) {
              console.log(err);
              resolve(createResponse(-1, null));
          } else if (rowCount != 1) {
              resolve(createResponse(-1, null));
          } else {
              resolve(createResponse(0, null));
          }
      }
    );

    db_connection.execSql(request);
  });
}

module.exports = { updateBar }