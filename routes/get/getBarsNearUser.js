
/**
 * Returns an status and value where the value is an array of bars
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getBarsNearUser = async (request, db_connection) => {

  const id = request.params.user_id;

  return await new Promise((resolve, reject) => {

    let bars_data = []

    const sql_query = `
      select * from bar where bar.address_city = (select address_city from users where users.id = ${id})
    `

    const request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null));
      }
    });

    request.on('row', columns => {

      let bar = {}
      columns.forEach(element => {

        let col_name = element.metadata.colName
        let col_value = element.value

        let bar_data = {[col_name]: col_value}

        Object.assign(bar, bar_data)
      });
      bars_data.push(bar)
    });

    request.on('doneProc', function (rowCount, more, returnStatus, rows) {
      return resolve(createResponse(0, bars_data));
    });

    db_connection.execSql(request);
  });
}

module.exports = { getBarsNearUser }