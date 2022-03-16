
/**
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getUser = async (request, db_connection) => {

  const id = request.params.user_id;

  return await new Promise((resolve, reject) => {

    /**
     * creates an object that will have its key value pairs appended to it.
     */
    let user_object = {}

    const sql_query = `
      select * from users where users.id = ${id}
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

        
        /**
         * This is an admittedly odd way to do it, but it is the proper way to
         * append a key-value pair to an already created object.
         */
        Object.assign(user_object, json_user_data)
      });
    });

    request.on('doneProc', (rowCount, more, returnStatus, rows) => {
      console.log(JSON.stringify(user_object))
      return resolve(createResponse(0, user_object));
    });

    db_connection.execSql(request);
  });
}

module.exports = { getUser }