
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
    const address_zip = request.payload.address_zip;
    const owner_pass = request.payload.owner_pass;
    const update = `UPDATE bar SET 
                    address_street = '${address_street}',
                    address_city = '${address_city}',
                    address_state = '${address_state}',
                    address_zip = '${address_zip}'
                    from [dbo].[bar] INNER JOIN [dbo].[owner_pass]
                    ON bar.owner_id = owner_pass.owner_id
                    WHERE id = 2 and password = 'admin'`;
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
              resolve(createResponse(1, null));
          }
      }
    );

    db_connection.execSql(request);
  });
}

module.exports = { updateBar }