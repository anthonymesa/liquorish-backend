
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const updateReadyStatus = async (request, db_connection) => {
  //user_id, curr_pass_hash, new_pass_hash  

    const tab_id = parseInt(request.payload.tab_id);
    const bdId = parseInt(request.payload.bar_drink_id);
    const status = parseInt(request.payload.ready_status);
  const update = `UPDATE tab_drinks SET ready_status = '${status}' WHERE tab_id = ${tab_id} AND bar_drink_id ='${bdId}'`;
  console.log(update);
  return new Promise((resolve, reject) => {
    //  Create dabase request to count from test table (should be 1)
    const request = new Request(update,
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

module.exports = { updateReadyStatus }