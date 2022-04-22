
/**
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getBar = async (request, db_connection) => {

  const id = request.params.bar_id;

  return await new Promise((resolve, reject) => {

    /**
     * creates an object that will have its key value pairs appended to it.
     */
    let bar_object = {}

    const sql_query = `
      select * from bar where id = ${id}
    `

    const request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null))
      }
    });

    request.on('row', columns => {
      columns.forEach(element => {

        let col_name = element.metadata.colName
        let col_value = element.value

        console.log(col_name)

        let json_user_data = {[col_name]: col_value}
        console.log(JSON.stringify(json_user_data))
        Object.assign(bar_object, json_user_data)
      });
    });

    request.on('doneProc', (rowCount, more, returnStatus, rows) => {
      console.log(JSON.stringify(bar_object))
      return resolve(createResponse(0, bar_object));
    });

    db_connection.execSql(request);
  });
}

module.exports = { getBar }
