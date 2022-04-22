
/**
 * Comments here
 * 
 * returns either null, or the client id.
 */

const { Request } = require("tedious");
const { createResponse } = require('../response')

const loginBar = async (request, db_connection) => {

  const username = request.params.username;
  const password = request.params.password;
  let bar_id = null;

  return await new Promise((resolve, reject) => {

    const sql_query = `
        select bar_id from bar_pass where bar_id = (
            select id from bar where username = '${username}'
        ) and password = '${password}'
    `

    const request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null));
      }
    });

    request.on('row', columns => {
        bar_id = columns[0].value;
    });

    request.on('doneProc', (rowCount, more, returnStatus, rows) => {
      if (bar_id > 0) {
        return resolve(createResponse(0, {
            "client id": bar_id
        }));
      } else {
        return resolve(createResponse(-1, null));
      }
    });

    db_connection.execSql(request);
  });
}

module.exports = { loginBar }