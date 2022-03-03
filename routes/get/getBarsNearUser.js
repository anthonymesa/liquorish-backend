
/**
 * Comments here
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getBarsNearUser = async (request, db_connection) => {

  const id = request.params.user_id;

  return await new Promise((resolve, reject) => {

    let dob = null;
    const sql_query = `
            select birth_date from users where id = ${id}
        `

    const request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null));
      }
    });

    request.on('row', columns => {
      try {
        dob = columns[0]
      } catch {
        resolve(createResponse(-1, null))
      }
    });

    request.on('doneProc', function (rowCount, more, returnStatus, rows) {
      return resolve(createResponse(0, { "date": dob.value }));
    });

    db_connection.execSql(request);
  });
}

module.exports = { getBarsNearUser }