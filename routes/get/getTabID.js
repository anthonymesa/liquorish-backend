const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getTabID = async (request, db_connection) => {

    const user_id = request.params.user_id;
    const bar_id = request.params.bar_id;

  return await new Promise((resolve, reject) => {
    let tab_object = {}

    const sql_query = `
      select tab_id from tabs where tabs.user_id = ${user_id} and tabs.bar_id = ${bar_id}
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

        let json_tab_data = {[col_name]: col_value}
          console.log(JSON.stringify(json_tab_data))

        
        /**
         * This is an admittedly odd way to do it, but it is the proper way to
         * append a key-value pair to an already created object.
         */
          Object.assign(tab_object, json_tab_data)
      });
    });

    request.on('doneProc', (rowCount, more, returnStatus, rows) => {
        console.log(JSON.stringify(tab_object))
        return resolve(createResponse(0, tab_object));
    });

    db_connection.execSql(request);
  });
}

module.exports = { getTabID }