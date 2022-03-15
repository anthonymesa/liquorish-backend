
/**
 * Returns an status and value where the value is an array of bars
 * 
 */

const { Request } = require("tedious");
const { createResponse } = require('../../response')

const getTabDrinks = async (request, db_connection) => {

  const user_id = request.params.user_id;
  const bar_id = request.params.bar_id;

  return await new Promise((resolve, reject) => {

    let tab_drinks = []

    const sql_query = `
      select * from drink where drink_id in (
        select drink_id from bar_drinks where bar_drink_id in (
          select bar_drink_id from tab_drinks where tab_id = (
            select tab_id from tabs where bar_id = ${bar_id} and user_id = ${user_id}
          )
        )
      )
    `

    const request = new Request(sql_query, (err, rowCount) => {
      if (err) {
        resolve(createResponse(-1, null));
      }
    });

    request.on('row', columns => {

      let drink = {}
      columns.forEach(element => {

        let col_name = element.metadata.colName
        let col_value = element.value

        let drink_data = {[col_name]: col_value}

        Object.assign(drink, drink_data)
      });
      tab_drinks.push(drink)
    });

    request.on('doneProc', function (rowCount, more, returnStatus, rows) {
      return resolve(createResponse(0, tab_drinks));
    });

    db_connection.execSql(request);
  });
}

module.exports = { getTabDrinks: getTabDrinks }